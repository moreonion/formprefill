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
    var fragments = name.match(/\[[^\]]+\]/g);
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


  $.fn.formPrefill = function(options) {

    var Api = privates.Api = function($e, stores) {
      this.$element = $e;
      this.stores = stores;

      // Check for data attributes.
      if (typeof $e.data('form-prefill-keys') !== 'undefined') {
        $e.data('form-prefill-read', $e.data('form-prefill-keys'));
        $e.data('form-prefill-write', $e.data('form-prefill-keys'));
      }
      if (typeof $e.data('form-prefill-read') === 'undefined'
        && typeof $e.data('form-prefill-write') === 'undefined') {
        var keys = settings.storageKeys($e);
        // Set data attributes so elements can be found via selector.
        if (keys && typeof keys.read !== 'undefined') $e.attr('data-form-prefill-read', serializeAttribute(keys.read));
        if (keys && typeof keys.write !== 'undefined') $e.attr('data-form-prefill-write', serializeAttribute(keys.write));
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
      });
    };

    Api.prototype.write = function() {
      var self = this;
      var keys = parseAttribute(this.$element.data('form-prefill-write'));
      if (!keys.length) return;

      prefixArray(this.getFormatPrefix(), keys);

      var promises = [];
      $.each(self.stores, function(i, store) {
        promises.push(store.setItems(keys, self.getVal()));
      });
      return Promise.all(promises);
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

    return this.each(function() {
      var $inputs = $wrapper.find('input, select, textarea').not(function(i, element) {
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

      $inputs.each(function() {
        var $e = $(this);
        var api = new Api($e, stores);
        $e.data('formPrefill', api);
      });

      $inputs.on('change.form-prefill', function() {
        // TODO call store function
      });
    });
  };

}( jQuery ));
