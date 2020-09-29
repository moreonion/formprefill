// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"cjA7":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cookies = void 0;

/* Cookie api taken from https://github.com/madmurphy/cookies.js, released under GNU Public License, version 3 or later */
var cookies = {
  getItem: function getItem(sKey) {
    if (!sKey) {
      return null;
    }

    return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(sKey).replace(/[-.+*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
  },
  setItem: function setItem(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max-age|path|domain|secure)$/i.test(sKey)) {
      return false;
    }

    var sExpires = '';

    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
          break;

        case String:
          sExpires = '; expires=' + vEnd;
          break;

        case Date:
          sExpires = '; expires=' + vEnd.toUTCString();
          break;
      }
    }

    document.cookie = encodeURIComponent(sKey) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; secure' : '');
    return true;
  },
  removeItem: function removeItem(sKey, sPath, sDomain) {
    if (!this.hasItem(sKey)) {
      return false;
    }

    document.cookie = encodeURIComponent(sKey) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '');
    return true;
  },
  hasItem: function hasItem(sKey) {
    if (!sKey) {
      return false;
    }

    return new RegExp('(?:^|;\\s*)' + encodeURIComponent(sKey).replace(/[-.+*]/g, '\\$&') + '\\s*\\=').test(document.cookie);
  },
  keys: function keys() {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^=]+)(?=;|$)|^\s*|\s*(?:=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:=[^;]*)?;\s*/);

    for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
      aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
    }

    return aKeys;
  }
};
exports.cookies = cookies;
},{}],"K3ag":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CookieStorage = void 0;

var _cookies = require("./cookies");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CookieStorage = /*#__PURE__*/function () {
  function CookieStorage(pfx, domain, maxAge) {
    _classCallCheck(this, CookieStorage);

    this.pfx = pfx;
    this.domain = domain;
    this.maxAge = maxAge;
  }

  _createClass(CookieStorage, [{
    key: "setItems",
    value: function setItems(keys, value) {
      var _this = this;

      keys.forEach(function (key) {
        _cookies.cookies.setItem(_this.pfx + ':' + key, JSON.stringify(value), _this.maxAge, '/', _this.domain, true);
      });
      return Promise.resolve(true);
    }
  }, {
    key: "removeItems",
    value: function removeItems(keys) {
      keys.forEach(function (key) {
        _cookies.cookies.removeItem(self.pfx + ':' + key, '/', self.domain);
      });
      return Promise.resolve(true);
    }
  }, {
    key: "getFirst",
    value: function getFirst(keys) {
      return new Promise(function (resolve, reject) {
        var _this2 = this;

        keys.forEach(function (key) {
          var v = _cookies.cookies.getItem(_this2.pfx + ':' + key);

          if (v !== null) {
            resolve(JSON.parse(v));
          }
        });
        reject(new Error('keys not found in cookies: ' + keys.join(', ')));
      });
    }
  }]);

  return CookieStorage;
}();

exports.CookieStorage = CookieStorage;
},{"./cookies":"cjA7"}],"Vqkv":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebStorage = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WebStorage = /*#__PURE__*/function () {
  function WebStorage(type, pfx) {
    _classCallCheck(this, WebStorage);

    this.storage = type;
    this.pfx = pfx;
  }

  _createClass(WebStorage, [{
    key: "browserSupport",
    value: function browserSupport() {
      // this is taken from modernizr.
      var mod = 'modernizr';

      try {
        this.storage.setItem(mod, mod);
        this.storage.removeItem(mod);
        return true;
      } catch (e) {
        return false;
      }
    }
  }, {
    key: "setItems",
    value: function setItems(keys, value) {
      var _this = this;

      keys.forEach(function (key) {
        _this.storage.setItem(_this.pfx + ':' + key, JSON.stringify(value));
      });
      return Promise.resolve(true);
    }
  }, {
    key: "removeItems",
    value: function removeItems(keys) {
      var _this2 = this;

      keys.forEach(function (key) {
        _this2.storage.removeItem(_this2.pfx + ':' + key);
      });
      return Promise.resolve(true);
    }
  }, {
    key: "getFirst",
    value: function getFirst(keys) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        keys.forEach(function (key) {
          var v = _this3.storage.getItem(_this3.pfx + ':' + key);

          if (v !== null) {
            resolve(JSON.parse(v));
          }
        });
        reject(new Error('keys not found in storage: ' + keys.join(', ')));
      });
    }
  }]);

  return WebStorage;
}();

exports.WebStorage = WebStorage;
},{}],"Tl9z":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaults = void 0;
var defaults = {
  prefix: 'formPrefill',
  storageKeys: function storageKeys() {
    return {
      read: 'key',
      write: 'key'
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
exports.defaults = defaults;
},{}],"bRBO":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Stores = void 0;

var _CookieStorage = require("./CookieStorage");

var _WebStorage = require("./WebStorage");

var _defaults = require("./defaults");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var $ = jQuery;

function prefixArray(prefix, arr) {
  for (var i = 0, j = arr.length; i < j; i++) {
    arr[i] = prefix + ':' + arr[i];
  }
}

function getStorage(storageName) {
  if (['sessionStorage', 'localStorage'].indexOf(storageName) < 0) {
    return null;
  }

  var storage;

  try {
    // when blocking 3rd party cookies trying to access the existing storage
    // will throw an exception
    // see https://bugs.chromium.org/p/chromium/issues/detail?id=357625
    storage = window[storageName];
  } catch (e) {
    return null;
  }

  return storage;
}

var Stores = /*#__PURE__*/function () {
  _createClass(Stores, null, [{
    key: "fromSettings",
    value: function fromSettings(settings) {
      settings = $.extend({}, _defaults.defaults, settings);
      var stores = $.extend(true, [], settings.stores);

      if (settings.useSessionStore) {
        var _sessionStorage = getStorage('sessionStorage');

        if (_sessionStorage) {
          var s = new _WebStorage.WebStorage(_sessionStorage, settings.prefix);

          if (s.browserSupport()) {
            stores.push(s);
          }
        }
      }

      if (settings.useLocalStore) {
        var _localStorage = getStorage('localStorage');

        if (_localStorage) {
          var _s = new _WebStorage.WebStorage(_localStorage, settings.prefix);

          if (_s.browserSupport()) {
            stores.push(_s);
          }
        }
      }

      if (settings.useCookies) {
        stores.push(new _CookieStorage.CookieStorage(settings.prefix, settings.cookieDomain, settings.cookieMaxAge));
      }

      return new this(stores, settings.stringPrefix, settings.listPrefix);
    }
  }]);

  function Stores(stores, stringPrefix, listPrefix) {
    _classCallCheck(this, Stores);

    this.stores = stores;
    this.stringPrefix = stringPrefix;
    this.listPrefix = listPrefix;
  }

  _createClass(Stores, [{
    key: "setItems",
    value: function setItems(keys, value) {
      var promises = [];
      this.stores.forEach(function (store, index) {
        promises.push(store.setItems(keys, value));
      });
      return Promise.all(promises);
    }
  }, {
    key: "removeItems",
    value: function removeItems(keys) {
      var promises = [];
      this.stores.forEach(function (store, index) {
        promises.push(store.removeItems(keys));
      });
      return Promise.all(promises);
    }
  }, {
    key: "getFirst",
    value: function getFirst(keys) {
      var _this = this;

      // This could use Promise.any() once it is standardized.
      var promisesRejected = 0;
      return new Promise(function (resolve, reject) {
        _this.stores.forEach(function (store, index) {
          store.getFirst(keys).then(function (value) {
            resolve(value);
          }, function (cause) {
            // Reject only when all of the stores have rejected.
            if (++promisesRejected === _this.stores.length) {
              reject(cause);
            }
          });
        });
      });
    }
  }, {
    key: "prefix",
    value: function prefix(keys) {
      var list = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      prefixArray(list ? this.listPrefix : this.stringPrefix, keys);
      return keys;
    }
  }, {
    key: "setValuesMap",
    value: function setValuesMap(vars) {
      var _this2 = this;

      var promises = [];
      Object.keys(vars).forEach(function (key) {
        var values = vars[key];
        promises.push(_this2.setItems(_this2.prefix([key]), values[values.length - 1]));
        promises.push(_this2.setItems(_this2.prefix([key], true), values));
      });
      return Promise.all(promises);
    }
  }]);

  return Stores;
}();

exports.Stores = Stores;
},{"./CookieStorage":"K3ag","./WebStorage":"Vqkv","./defaults":"Tl9z"}],"epB2":[function(require,module,exports) {
"use strict";

var _Stores = require("./Stores");

var _WebStorage = require("./WebStorage");

var _defaults = require("./defaults");

/* global jQuery */
(function ($) {
  var privates = {
    WebStorage: _WebStorage.WebStorage,
    Stores: _Stores.Stores
  }; // Expose methods for testing.
  // Util methods:

  _defaults.defaults.storageKeys = privates.storageKeys = function ($e) {
    var type = $e.attr('type');
    var name = $e.attr('name');

    if (!name) {
      return undefined;
    }

    var fragments = name.match(/\[[^\]]+\]/g) || [];

    if (!fragments.length || type === 'checkbox' && fragments.length < 2) {
      return {
        read: name,
        write: name
      };
    }

    var suggestedFragment = type === 'checkbox' ? fragments[fragments.length - 2] : fragments[fragments.length - 1];
    var key = suggestedFragment.match(/\[([^\]]+)\]/)[1];
    return {
      read: key,
      write: key
    };
  };

  var parseAttribute = privates.parseAttribute = function (str) {
    if ($.isArray(str)) return str;
    if (typeof str === 'string' && str) return str.split(' ');
    return [];
  };

  var serializeAttribute = privates.serializeAttribute = function (arr) {
    if (typeof arr === 'string') return arr;
    if ($.isArray(arr)) return arr.join(' ');
    return '';
  };

  var deduplicateSets = privates.deduplicateSets = function ($els) {
    // Remove all but one from each set of checkboxes or radios with the same
    // write attribute to prevent multiple writes to the stores.
    var sets = [];
    return $els.filter(function () {
      var keys = $(this).attr('data-form-prefill-write');
      var type = $(this).attr('type');

      if (type === 'checkbox' || type === 'radio') {
        if (sets.indexOf(keys) === -1) {
          sets.push(keys);
          return true;
        } else {
          return false;
        }
      }

      return true;
    });
  }; // Parse the hash from the hash string and clean them from the string.
  // The hash string is first split into parts using a semi-colon";" as a
  // separator. Each part that contains prefill variables (with the "p:"-prefix)
  // is then removed.
  // All prefill-values are stored into the stores in string and list format.


  var readUrlVars = privates.readUrlVars = function (hash, stores) {
    hash = hash || window.location.hash.substr(1);

    if (!hash) {
      return '';
    }

    var vars = {};
    var key;
    var value;
    var p;
    var parts;
    var newParts = [];
    parts = hash.split(';');

    for (var j = 0; j < parts.length; j++) {
      var part = parts[j]; // Parts starting with p: are used for pre-filling.

      if (part.substr(0, 2) === 'p:') {
        var hashes = part.substr(2).split('&');

        for (var i = 0; i < hashes.length; i++) {
          p = hashes[i].indexOf('=');
          key = hashes[i].substring(0, p); // Backwards compatibility strip p: prefixes from keys.

          if (key.substr(0, 2) === 'p:') {
            key = key.substr(2);
          }

          value = decodeURIComponent(hashes[i].substring(p + 1)); // Prepare values to be set as list values.

          if (!(key in vars)) {
            vars[key] = [];
          }

          vars[key].push(value);
        }
      } else {
        newParts.push(part);
      }
    }

    stores.setValuesMap(vars).finally(function () {
      $(document).trigger('hash-values-stored.form-prefill');
    });
    return newParts.join(';');
  };

  var Api = privates.Api = function ($e, stores, settings) {
    settings = settings || $.extend({}, _defaults.defaults);
    this.$element = $e;
    this.stores = stores;
    var type = $e.attr('type');

    if (type === 'radio' || type === 'checkbox') {
      this.initialValue = $e[0].checked;
    } else {
      this.initialValue = $e.val();
    } // Check for data attributes.


    if (typeof $e.attr('data-form-prefill-keys') !== 'undefined') {
      // Set data attributes so elements can be found via selector.
      // As the order of write keys is irrelevant, we sort them to make it
      // possible to determine sets of checkboxes via string comparison of their write keys.
      $e.attr('data-form-prefill-read', $e.attr('data-form-prefill-keys'));
      $e.attr('data-form-prefill-write', serializeAttribute(parseAttribute($e.attr('data-form-prefill-keys')).sort()));
    }

    if (typeof $e.attr('data-form-prefill-read') === 'undefined' && typeof $e.attr('data-form-prefill-write') === 'undefined') {
      var keys = settings.storageKeys($e);
      if (keys && typeof keys.read !== 'undefined') $e.attr('data-form-prefill-read', serializeAttribute(keys.read));
      if (keys && typeof keys.write !== 'undefined') $e.attr('data-form-prefill-write', serializeAttribute(parseAttribute(keys.write).sort()));
    } // Add aliases for read keys


    if (!$.isEmptyObject(settings.map)) {
      var readKeys = parseAttribute($e.attr('data-form-prefill-read'));
      var aliases = [];

      for (var i = 0, j = readKeys.length; i < j; i++) {
        if (readKeys[i] in settings.map) {
          aliases = aliases.concat(settings.map[readKeys[i]]);
        }
      }

      $e.attr('data-form-prefill-read', serializeAttribute(readKeys.concat(aliases)));
    }
  };

  Api.prototype.read = function () {
    var _this = this;

    var keys = parseAttribute(this.$element.attr('data-form-prefill-read'));
    if (!keys.length) return Promise.reject(new Error('Don’t know which keys to read from.'));
    this.stores.prefix(keys, this.isList());
    return this.stores.getFirst(keys).then(function (value) {
      _this.prefill(value);
    });
  };

  Api.prototype.write = function (options) {
    var keys = parseAttribute(this.$element.attr('data-form-prefill-write'));
    if (!keys.length) return Promise.reject(new Error('No idea which keys to write to.'));
    this.stores.prefix(keys, this.isList());

    if (options && options.delete === true) {
      return this.stores.removeItems(keys);
    } else {
      return this.stores.setItems(keys, this.getVal());
    }
  };

  Api.prototype.prefill = function (value) {
    this.$element.val(value).trigger('change');
  };

  Api.prototype.getVal = function () {
    var type = this.$element.attr('type');

    if (type === 'radio' || type === 'checkbox') {
      // Get the value from all inputs that write to the same keys.
      var selector = '';
      var writeKeys = this.$element.attr('data-form-prefill-write');
      if (writeKeys) selector += '[data-form-prefill-write="' + writeKeys + '"]';
      var $set = this.$element.closest('form').find(selector);
      var checked = [];
      $set.each(function () {
        if (this.checked) checked.push(this.value);
      });
      return checked;
    } else {
      return this.$element.val();
    }
  };

  Api.prototype.isList = function () {
    var type = this.$element.attr('type');
    return type === 'checkbox' || type === 'radio' || this.$element.is('select[multiple]') || this.$element.is('.form-prefill-list');
  };

  $(document).on('form-prefill:stores-initialized', function (event, stores, target) {
    var hash = window.location.hash.substr(1);

    if (hash) {
      var newHash = readUrlVars(hash, stores);

      if (newHash !== hash) {
        window.location.hash = '#' + newHash;
      }
    }

    $(target).trigger('form-prefill:stores-filled', [stores]);
  });

  $.fn.formPrefill = function (options) {
    // Make private methods testable.
    if (options === 'privates') {
      return privates;
    }

    var settings = $.extend(_defaults.defaults, options);

    var stores = privates.stores = _Stores.Stores.fromSettings(settings);

    $(document).trigger('form-prefill:stores-initialized', [stores, this]);
    return this.each(function () {
      var $self = $(this);
      var $inputs = $self.find('input, select, textarea, .form-prefill, .form-prefill-list').not(function (i, element) {
        // Exclude file elements. We can't prefill those.
        if ($(element).attr('type') === 'file') {
          return true;
        } // Check nearest include and exclude-wrapper.


        var $exclude = $(element).closest(settings.exclude);
        var $include = $(element).closest(settings.include);

        if ($exclude.length > 0) {
          // Exclude unless there is an include-wrapper inside the exclude wrapper.
          return $include.length <= 0 || $.contains($include.get(), $exclude.get());
        }

        return false;
      }); // This is the form’s api

      $self.data('formPrefill', {
        writeAll: function writeAll() {
          var $write = deduplicateSets($inputs);
          var promises = [];
          $write.each(function () {
            promises.push($(this).data('formPrefill').write());
          });
          return Promise.all(promises);
        },
        removeAll: function removeAll(options) {
          options = options || {
            resetFields: true
          };
          var $write = deduplicateSets($inputs);
          var promises = [];
          $write.each(function () {
            promises.push($(this).data('formPrefill').write({
              delete: true
            }));
          });
          return Promise.all(promises).then(function () {
            if (options.resetFields) {
              $inputs.each(function () {
                var $field = $(this);
                var api = $field.data('formPrefill');
                var type = $field.attr('type');

                if (type === 'radio' || type === 'checkbox') {
                  $field[0].checked = api.initialValue;
                  $field.trigger('change');
                } else {
                  $field.val(api.initialValue).trigger('change');
                }
              });
            }

            $self.trigger('form-prefill:cleared');
          });
        },
        readAll: function readAll() {
          var prefilled = [];
          $inputs.each(function () {
            var $el = $(this);
            $el.data('formPrefill').read().then(function () {
              $el.trigger('form-prefill:prefilled');
            }, function (cause) {
              $el.trigger('form-prefill:failed', cause);
            });
          });
        }
      }); // Initialize elements api

      $inputs.each(function () {
        var $e = $(this);
        var api = new Api($e, stores, settings);
        $e.data('formPrefill', api);
      }); // Write to stores on change

      $inputs.on('change.form-prefill', function () {
        $(this).data('formPrefill').write().then(function () {}, function () {});
      }); // Prefill fields when the values passed in the hash are stored.

      $self.on('form-prefill:stores-filled', function () {
        $self.data('formPrefill').readAll();
      }); // Prefill fields.

      $self.data('formPrefill').readAll();
    });
  };
})(jQuery);
},{"./Stores":"bRBO","./WebStorage":"Vqkv","./defaults":"Tl9z"}]},{},["epB2"], null)