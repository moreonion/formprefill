/*
 * jquery.formprefill
 * Version 0.10.0
 *
 * https://github.com/moreonion/jquery.formprefill
 */

(function( $ ) {

  var defaults = {
    prefix: 'formPrefill',
    storageKeys: function() {
      return {
        read: "key",
        write: "key"
      };
    },
    map: {},
    exclude: '[data-form-prefill-exclude]',
    include: '[data-form-prefill-include]',
    stringPrefix: 's',
    listPrefix: 'l',
    stores: [],
    useSessionStore: true,
    useLocalStore: false,
    useCookies: false,
    cookieDomain: '',
    cookieMaxAge: Infinity
  };

  var privates = {}; // Expose methods for testing.

  /* Cookie api taken from https://github.com/madmurphy/cookies.js, released under GNU Public License, version 3 or later */
  var docCookies = privates.docCookies = {
    getItem: function (sKey) {
      if (!sKey) { return null; }
      return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
      if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
      var sExpires = "";
      if (vEnd) {
        switch (vEnd.constructor) {
          case Number:
            sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
            break;
          case String:
            sExpires = "; expires=" + vEnd;
            break;
          case Date:
            sExpires = "; expires=" + vEnd.toUTCString();
            break;
        }
      }
      document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
      return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
      if (!this.hasItem(sKey)) { return false; }
      document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
      return true;
    },
    hasItem: function (sKey) {
      if (!sKey) { return false; }
      return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: function () {
      var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
      for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
      return aKeys;
    }
  };

  var CookieStorage = privates.CookieStorage = function(pfx, domain, maxAge) {
    this.pfx = pfx;
    this.domain = domain;
    this.maxAge = maxAge;
  };

  CookieStorage.prototype.setItems = function(keys, value) {
    var self = this;
    $.each(keys, function(i, key) {
      docCookies.setItem(self.pfx + ':' + key, JSON.stringify(value), self.maxAge, '/', self.domain, true);
    });
    return Promise.resolve(true);
  };

  CookieStorage.prototype.removeItems = function(keys) {
    var self = this;
    $.each(keys, function(i, key) {
      docCookies.removeItem(self.pfx + ':' + key, '/', self.domain);
    });
    return Promise.resolve(true);
  };

  CookieStorage.prototype.getFirst = function(keys) {
    var self = this;
    return new Promise(function(resolve, reject) {
      $.each(keys, function(i, key) {
        var v = docCookies.getItem(self.pfx + ':' + key);
        if (v !== null) {
          resolve(JSON.parse(v));
        }
      });
      reject(new Error('keys not found in cookies: ' + keys.join(', ')));
    });
  };

  var WebStorage = privates.WebStorage = function(type, pfx) {
    this.storage = type;
    this.pfx = pfx;
  };

  WebStorage.prototype.browserSupport = function() {
    // this is taken from modernizr.
    var mod = 'modernizr';
    try {
      this.storage.setItem(mod, mod);
      this.storage.removeItem(mod);
      return true;
    } catch(e) {
      return false;
    }
  };

  WebStorage.prototype.setItems = function(keys, value) {
    var self = this;
    $.each(keys, function(i, key) {
      self.storage.setItem(self.pfx + ':' + key, JSON.stringify(value));
    });
    return Promise.resolve(true);
  };

  WebStorage.prototype.removeItems = function(keys) {
    var self = this;
    $.each(keys, function(i, key) {
      self.storage.removeItem(self.pfx + ':' + key);
    });
    return Promise.resolve(true);
  };

  WebStorage.prototype.getFirst = function(keys) {
    var self = this;
    return new Promise(function(resolve, reject) {
      $.each(keys, function(i, key) {
        var v = self.storage.getItem(self.pfx + ':' + key);
        if (v !== null) {
          resolve(JSON.parse(v));
        }
      });
      reject(new Error('keys not found in storage: ' + keys.join(', ')));
    });
  };

  // Util methods:

  defaults.storageKeys = privates.storageKeys = function($e) {
    var type = $e.attr('type'), name = $e.attr('name');
    if (!name)
      return undefined;
    var fragments = name.match(/\[[^\]]+\]/g) || [];
    if (!fragments.length || (type == 'checkbox' && fragments.length < 2))
      return {
        read: name,
        write: name
      };
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
      var keys = $(this).attr('data-form-prefill-write');
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

    var pending = 0;
    function promiseCompleted() {
      pending--;
      if (pending === 0)
        $(document).trigger('hash-values-stored.form-prefill');
    };

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
          value = decodeURIComponent(hashes[i].substring(p+1));
            // Prepare values to be set as list values.
          if (!(key in vars)) {
            vars[key] = [];
          }
          vars[key].push(value);
          // Set string values directly.
          $.each(stores, function(index, store) {
            pending++;
            store.setItems([settings.stringPrefix + ':' + key], value).then(function() {
              promiseCompleted();
            }, function() {
              promiseCompleted();
            });
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
        pending++;
        store.setItems([settings.listPrefix + ':' + key], value).then(function() {
          promiseCompleted();
        }, function() {
          promiseCompleted();
        });
      });
    });

    return new_parts.join(';');
  };

  var Api = privates.Api = function($e, stores, settings) {
    settings = settings || $.extend({}, defaults);
    this.stringPrefix = settings.stringPrefix;
    this.listPrefix = settings.listPrefix;
    this.$element = $e;
    this.stores = stores;
    var type = $e.attr('type');
    if (type == 'radio' || type == 'checkbox') {
      this.initialValue = $e[0].checked;
    } else {
      this.initialValue = $e.val();
    }

    // Check for data attributes.
    if (typeof $e.attr('data-form-prefill-keys') !== 'undefined') {
      // Set data attributes so elements can be found via selector.
      // As the order of write keys is irrelevant, we sort them to make it
      // possible to determine sets of checkboxes via string comparison of their write keys.
      $e.attr('data-form-prefill-read', $e.attr('data-form-prefill-keys'));
      $e.attr('data-form-prefill-write', serializeAttribute(parseAttribute($e.attr('data-form-prefill-keys')).sort()));
    }
    if (typeof $e.attr('data-form-prefill-read') === 'undefined'
      && typeof $e.attr('data-form-prefill-write') === 'undefined') {
      var keys = settings.storageKeys($e);
      if (keys && typeof keys.read !== 'undefined') $e.attr('data-form-prefill-read', serializeAttribute(keys.read));
      if (keys && typeof keys.write !== 'undefined') $e.attr('data-form-prefill-write', serializeAttribute(parseAttribute(keys.write).sort()));
    }
    // Add aliases for read keys
    if (!$.isEmptyObject(settings.map)) {
      var readKeys = parseAttribute($e.attr('data-form-prefill-read')), aliases = [];
      for (var i = 0, j = readKeys.length; i < j; i++) {
        if (readKeys[i] in settings.map) {
          aliases = aliases.concat(settings.map[readKeys[i]]);
        }
      }
      $e.attr('data-form-prefill-read', serializeAttribute(readKeys.concat(aliases)));
    }
  };

  Api.prototype.read = function() {
    var self = this;
    var keys = parseAttribute(this.$element.attr('data-form-prefill-read'));
    if (!keys.length) return Promise.reject(new Error('Don’t know which keys to read from.'));

    prefixArray(this.getFormatPrefix(), keys);

    var promisesRejected = 0;
    return new Promise(function(resolve, reject) {
      $.each(self.stores, function(i, store) {
        store.getFirst(keys).then(function(value) {
          self.prefill(value);
          resolve(value);
        }, function(cause) {
          // Reject only when all of the stores have rejected.
          if (++promisesRejected == self.stores.length) reject(cause);
        });
      });
    });
  };

  Api.prototype.write = function(options) {
    var self = this;
    var keys = parseAttribute(this.$element.attr('data-form-prefill-write'));
    if (!keys.length) return Promise.reject(new Error('No idea which keys to write to.'));

    prefixArray(this.getFormatPrefix(), keys);

    var promises = [];
    $.each(self.stores, function(i, store) {
      if (options && options.delete === true) {
        promises.push(store.removeItems(keys));
      } else {
        promises.push(store.setItems(keys, self.getVal()));
      }
    });
    return Promise.all(promises);
  }

  Api.prototype.prefill = function(value) {
    this.$element.val(value).trigger('change');
  };

  Api.prototype.getVal = function() {
    var type = this.$element.attr('type');
    if (type == 'radio' || type == 'checkbox') {
      // Get the value from all inputs that write to the same keys.
      var selector = '';
      var writeKeys = this.$element.attr('data-form-prefill-write');
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
    return (type == 'checkbox' || type == 'radio' || this.$element.is('select[multiple]')) ? this.listPrefix : this.stringPrefix;
  };

  $.fn.formPrefill = function(options) {

    // Make private methods testable.
    if (options == 'privates') {
      return privates;
    }

    var settings = $.extend(defaults, options);

    var stores = $.extend(true, [], settings.stores);
    if (settings.useSessionStore) {
      var s = new WebStorage(sessionStorage, settings.prefix);
      if (s.browserSupport()) stores.push(s);
    }
    if (settings.useLocalStore) {
      var s = new WebStorage(localStorage, settings.prefix);
      if (s.browserSupport()) stores.push(s);
    }
    if (settings.useCookies) {
      stores.push(new CookieStorage(settings.prefix, settings.cookieDomain, settings.cookieMaxAge));
    }

    var hash = window.location.hash.substr(1), hashUsed = false;
    if (hash) {
      var newHash = readUrlVars(hash, stores, settings);
      if (newHash != hash) {
        window.location.hash = '#' + newHash;
        hashUsed = true;
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
            $(this).data('formPrefill').write().then(function() {}, function() {});
          });
        },
        removeAll: function(options) {
          options = options || {resetFields: true};
          $write = deduplicateSets($inputs);
          $write.each(function() {
            $(this).data('formPrefill').write({delete: true}).then(function() {}, function() {});
          });
          if (options.resetFields) {
            $inputs.each(function() {
              var $field = $(this), api = $field.data('formPrefill');
              var type = $field.attr('type');
              if (type == 'radio' || type == 'checkbox') {
                $field[0].checked = api.initialValue;
                $field.trigger('change');
              } else {
                $field.val(api.initialValue).trigger('change');
              }
            });
          }
          $self.trigger('form-prefill:cleared');
        },
        readAll: function() {
          var prefilled = [];
          $inputs.each(function() {
            var $el = $(this);
            $el.data('formPrefill').read().then(function() {
              $el.trigger('form-prefill:prefilled');
            }, function(cause) {
              $el.trigger('form-prefill:failed', cause);
            });
          });
        }
      });

      // Initialize elements api
      $inputs.each(function() {
        var $e = $(this);
        var api = new Api($e, stores, settings);
        $e.data('formPrefill', api);
      });

      // Write to stores on change
      $inputs.on('change.form-prefill', function() {
        $(this).data('formPrefill').write().then(function() {}, function() {});
      });

      if (hashUsed) {
        // Prefill fields when the values passed in the hash are stored.
        $(document).on('hash-values-stored.form-prefill', function() {
          $self.data('formPrefill').readAll();
        });
      } else {
        // Prefill fields.
        $self.data('formPrefill').readAll();
      }
    });
  };

}( jQuery ));
