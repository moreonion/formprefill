(function( $ ) {

  var privates = {}; // Expose methods for testing.

  var SessionStorage = privates.SessionStorage = function(pfx) {
    this.pfx = pfx;
  };

  SessionStorage.prototype.browserSupport = function() {
    // this is taken from modernizr.
    var mod = 'modernizr';
    try {
      localStorage.setItem(mod, mod);
      localStorage.removeItem(mod);
      return true;
    } catch(e) {
      return false;
    }
  };

  SessionStorage.prototype.setItems = function(keys, value) {
    var self = this;
    return new Promise(function(resolve, reject) {
      $.each(keys, function(i, key) {
        sessionStorage.setItem(self.pfx + ':' + key, JSON.stringify(value));
      });
      resolve(true);
    });
  };

  SessionStorage.prototype.removeItems = function(keys) {
    var self = this;
    return new Promise(function(resolve, reject) {
      $.each(keys, function(i, key) {
        sessionStorage.removeItem(self.pfx + ':' + key);
      });
      resolve(true);
    });
  };

  SessionStorage.prototype.getFirst = function(keys) {
    var self = this;
    return new Promise(function(resolve, reject) {
      $.each(keys, function(i, key) {
        var v = sessionStorage.getItem(self.pfx + ':' + key);
        if (v !== null) {
          resolve(JSON.parse(v));
        }
      });
      reject(new Error(self.pfx + ':' + key + ' not found in sessionStorage'));
    });
  };

  // Util methods:

  var storageKeys = privates.storageKeys = function($e) {
    var type = $e.attr('type'), name = $e.attr('name');
    if (!name)
      return undefined;
    var fragments = name.match(/\[[^\]]+\]/g) || [];
    if (!fragments.length || (type == 'checkbox' && fragments.length < 2))
      return undefined;
    var suggestedFragment = (type == 'checkbox') ? fragments[fragments.length - 2] : fragments[fragments.length - 1];
    var key = suggestedFragment.match(/\[([^\]]+)\]/)[1];
    return {
      read: key,
      write: key
    };
  }

  var parseAttribute = privates.parseAttribute = function(str) {
    if ($.isArray(str)) return str;
    if (typeof str === 'string' && str) return str.split(' ');
    return [];
  };

  var serializeAttribute = privates.serializeAttribute = function(arr) {
    if (typeof arr === 'string') return arr;
    if ($.isArray(arr)) return arr.join(' ');
    return '';
  };

  var prefixArray = privates.prefixArray = function(prefix, arr) {
    for (var i = 0, j = arr.length; i < j; i++) {
      arr[i] = prefix + ':' + arr[i];
    }
  };

  var deduplicateSets = privates.deduplicateSets = function($els) {
    // Remove all but one from each set of checkboxes or radios with the same
    // write attribute to prevent multiple writes to the stores.
    var sets = [];
    return $els.filter(function() {
      var keys = $(this).data('form-prefill-write');
      var type = $(this).attr('type');
      if (type == 'checkbox' || type == 'radio') {
        if (sets.indexOf(keys) === -1) {
          sets.push(keys);
          return true;
        } else {
          return false;
        }
      }
      return true;
    });
  };

  // Parse the hash from the hash string and clean them from the string.
  // The hash string is first split into parts using a semi-colon";" as a
  // separator. Each part that contains prefill variables (with the "p:"-prefix)
  // is then removed.
  // All prefill-values are stored into the stores in string and list format.
  var readUrlVars = privates.readUrlVars = function(hash, stores, settings) {
    hash = hash || window.location.hash.substr(1);
    if (!hash) {
      return '';
    }
    var vars = {}, key, value, p, parts, new_parts = [];
    parts = hash.split(';');
    for (var j = 0; j < parts.length; j++) {
      var part_has_prefill_vars = false;
      var part = parts[j];
      // Parts starting with p: are used for pre-filling.
      if (part.substr(0, 2) == 'p:') {
        var hashes = part.substr(2).split('&');
        for (var i = 0; i < hashes.length; i++) {
          p = hashes[i].indexOf('=');
          key = hashes[i].substring(0, p);
          // Backwards compatibility strip p: prefixes from keys.
          if (key.substr(0, 2) == 'p:') {
            key = key.substr(2);
          }
          value = hashes[i].substring(p+1);
            // Prepare values to be set as list values.
          if (!(key in vars)) {
            vars[key] = [];
          }
          vars[key].push(value);
          // Set string values directly.
          $.each(stores, function(index, store) {
            store.setItems([settings.stringPrefix + ':' + key], value);
          });
        }
      }
      else {
        new_parts.push(part);
      }
    }

    // Finally set all list values.
    $.each(stores, function(index, store) {
      $.each(vars, function(key, value) {
        store.setItems([settings.listPrefix + ':' + key], value);
      });
    });

    return new_parts.join(';');
  };


  $.fn.formPrefill = function(options) {

    var Api = privates.Api = function($e, stores) {
      this.$element = $e;
      this.stores = stores;
      var type = $e.attr('type');
      if (type == 'radio' || type == 'checkbox') {
        this.initialValue = $e[0].checked;
      } else {
        this.initialValue = $e.val();
      }

      // Check for data attributes.
      if (typeof $e.data('form-prefill-keys') !== 'undefined') {
        // Set data attributes so elements can be found via selector.
        // As the order of write keys is irrelevant, we sort them to make it
        // possible to determine sets of checkboxes via string comparison of their write keys.
        $e.attr('data-form-prefill-read', $e.data('form-prefill-keys'));
        $e.attr('data-form-prefill-write', serializeAttribute(parseAttribute($e.data('form-prefill-keys')).sort()));
      }
      if (typeof $e.data('form-prefill-read') === 'undefined'
        && typeof $e.data('form-prefill-write') === 'undefined') {
        var keys = settings.storageKeys($e);
        if (keys && typeof keys.read !== 'undefined') $e.attr('data-form-prefill-read', serializeAttribute(keys.read));
        if (keys && typeof keys.write !== 'undefined') $e.attr('data-form-prefill-write', serializeAttribute(parseAttribute(keys.write).sort()));
      }
    };

    Api.prototype.read = function() {
      var self = this;
      var keys = parseAttribute(this.$element.data('form-prefill-read'));
      if (!keys.length) return;

      prefixArray(this.getFormatPrefix(), keys);

      return new Promise(function(resolve, reject) {
        $.each(self.stores, function(i, store) {
          store.getFirst(keys).then(function(value) {
            resolve(value);
          }, function() {
            // Swallow rejected promises from stores.
          })
        });
      }).then(function(value) {
        self.prefill(value);
        return value;
      });
    };

    Api.prototype.write = function(options) {
      var self = this;
      var keys = parseAttribute(this.$element.data('form-prefill-write'));
      if (!keys.length) return;

      prefixArray(this.getFormatPrefix(), keys);

      var promises = [];
      $.each(self.stores, function(i, store) {
        if (options && options.delete === true) {
          promises.push(store.removeItems(keys));
        } else {
          promises.push(store.setItems(keys, self.getVal()));
        }
      });
      return Promise.all(promises).then(function() {
        // All fine.
      }, function() {
        // Swallow rejected promises from stores.
      });
    }

    Api.prototype.prefill = function(value) {
      this.$element.val(value);
    };

    Api.prototype.getVal = function() {
      var type = this.$element.attr('type');
      if (type == 'radio' || type == 'checkbox') {
        // Get the value from all inputs that write to the same keys.
        var selector = '';
        var writeKeys = this.$element.data('form-prefill-write');
        if (writeKeys) selector += '[data-form-prefill-write="' + writeKeys + '"]'
        var $set = this.$element.closest('form').find(selector);
        var checked = [];
        $set.each(function() {
          if (this.checked) checked.push(this.value);
        });
        return checked;
      } else {
        return this.$element.val();
      }
    };

    Api.prototype.getFormatPrefix = function() {
      var type = this.$element.attr('type');
      return (type == 'checkbox' || type == 'radio' || this.$element.is('select[multiple]')) ? settings.listPrefix : settings.stringPrefix;
    };

    var settings = $.extend({
      prefix: 'formPrefill',
      storageKeys: storageKeys,
      exclude: '[data-form-prefill-exclude]',
      include: '[data-form-prefill-include]',
      stringPrefix: 's',
      listPrefix: 'l',
      stores: []
    }, options );

    // Make private methods testable.
    if (options == 'privates') {
      return privates;
    }

    var stores = settings.stores.length ? settings.stores : [
      new SessionStorage(settings.prefix)
    ];

    var hash = window.location.hash.substr(1);
    if (hash) {
      var newHash = readUrlVars(hash, stores, settings);
      if (newHash != hash) {
        window.location.hash = '#' + newHash;
      }
    }

    return this.each(function() {
      var $self = $(this);
      var $inputs = $self.find('input, select, textarea').not(function(i, element) {
        // Exclude file elements. We can't prefill those.
        if ($(element).attr('type') == 'file') {
          return true;
        }
        // Check nearest include and exclude-wrapper.
        var $exclude = $(element).closest(settings.exclude);
        var $include = $(element).closest(settings.include);
        if ($exclude.length > 0) {
          // Exclude unless there is an include-wrapper inside the exclude wrapper.
          return $include.length <= 0 || $.contains($include.get(), $exclude.get());
        }
        return false;
      });

      // This is the form’s api
      $self.data('formPrefill', {
        writeAll: function() {
          $write = deduplicateSets($inputs);
          $write.each(function() {
            $(this).data('formPrefill').write();
          });
        },
        removeAll: function(options) {
          options = options || {resetFields: true};
          $write = deduplicateSets($inputs);
          $write.each(function() {
            $(this).data('formPrefill').write({delete: true});
          });
          if (options.resetFields) {
            $inputs.each(function() {
              var $field = $(this), api = $field.data('formPrefill');
              var type = $field.attr('type');
              if (type == 'radio' || type == 'checkbox') {
                $field[0].checked = api.initialValue;
              } else {
                $field.val(api.initialValue);
              }
            });
          }
          $self.trigger('form-prefill:cleared');
        },
        readAll: function() {
          var prefilled = [];
          $inputs.each(function() {
            var $el = $(this);
            $el.data('formPrefill').read().then(function(value) {
              $el.trigger('form-prefill:prefilled');
            });
          });
        }
      });

      // Initialize elements api
      $inputs.each(function() {
        var $e = $(this);
        var api = new Api($e, stores);
        $e.data('formPrefill', api);
      });

      // Write to stores on change
      $inputs.on('change.form-prefill', function() {
        $(this).data('formPrefill').write();
      });

      // Prefill fields.
      $self.data('formPrefill').readAll();
    });
  };

}( jQuery ));
