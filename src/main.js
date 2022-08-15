/* global jQuery */

import { Stores } from './Stores'
import { WebStorage } from './WebStorage'
import { defaults } from './defaults'

(function ($) {
  var privates = {
    WebStorage: WebStorage,
    Stores: Stores,
  } // Expose methods for testing.

  // Util methods:

  defaults.storageKeys = privates.storageKeys = function (element) {
    var type = element.getAttribute('type')
    var name = element.getAttribute('name')
    if (!name) {
      return undefined
    }
    var fragments = name.match(/\[[^\]]+\]/g) || []
    if (!fragments.length || (type === 'checkbox' && fragments.length < 2)) {
      return {
        read: name,
        write: name
      }
    }
    var suggestedFragment = (type === 'checkbox') ? fragments[fragments.length - 2] : fragments[fragments.length - 1]
    var key = suggestedFragment.match(/\[([^\]]+)\]/)[1]
    return {
      read: key,
      write: key
    }
  }

  var parseAttribute = privates.parseAttribute = function (str) {
    if (Array.isArray(str)) return str
    if (typeof str === 'string' && str) return str.split(' ')
    return []
  }

  var serializeAttribute = privates.serializeAttribute = function (arr) {
    if (typeof arr === 'string') return arr
    if (Array.isArray(arr)) return arr.join(' ')
    return ''
  }

  var deduplicateSets = privates.deduplicateSets = function (elements) {
    // Remove all but one from each set of checkboxes or radios with the same
    // write attribute to prevent multiple writes to the stores.
    var sets = []
    return Array.prototype.filter.call(elements, function (element) {
      var keys = element.getAttribute('data-form-prefill-write')
      var type = element.getAttribute('type')
      if (type === 'checkbox' || type === 'radio') {
        if (sets.indexOf(keys) === -1) {
          sets.push(keys)
          return true
        }
        else {
          return false
        }
      }
      return true
    })
  }

  // Parse the hash from the hash string and clean them from the string.
  // The hash string is first split into parts using a semi-colon";" as a
  // separator. Each part that contains prefill variables (with the "p:"-prefix)
  // is then removed.
  // All prefill-values are stored into the stores in string and list format.
  var readUrlVars = privates.readUrlVars = function (hash, stores) {
    hash = hash || window.location.hash.substr(1)
    if (!hash) {
      return ''
    }

    var vars = {}; var key; var value; var p; var parts; var newParts = []

    parts = hash.split(';')
    for (var j = 0; j < parts.length; j++) {
      var part = parts[j]
      // Parts starting with p: are used for pre-filling.
      if (part.substr(0, 2) === 'p:') {
        var hashes = part.substr(2).split('&')
        for (var i = 0; i < hashes.length; i++) {
          p = hashes[i].indexOf('=')
          key = hashes[i].substring(0, p)
          // Backwards compatibility strip p: prefixes from keys.
          if (key.substr(0, 2) === 'p:') {
            key = key.substr(2)
          }
          value = decodeURIComponent(hashes[i].substring(p + 1))
          // Prepare values to be set as list values.
          if (!(key in vars)) {
            vars[key] = []
          }
          vars[key].push(value)
        }
      }
      else {
        newParts.push(part)
      }
    }

    stores.setValuesMap(vars).finally(function () {
      document.dispatchEvent(new CustomEvent('hash-values-stored.form-prefill', {bubbles: true}))
    })

    return newParts.join(';')
  }

  var Api = privates.Api = function ($e, stores, settings) {
    settings = settings || {...defaults}
    this.$element = $e
    this.element = $e.get(0)
    this.stores = stores
    var type = $e[0].getAttribute('type')
    if (type === 'radio' || type === 'checkbox') {
      this.initialValue = $e[0].checked
    }
    else {
      this.initialValue = $e.val()
    }

    // Check for data attributes.
    if ($e[0].getAttribute('data-form-prefill-keys') !== null) {
      // Set data attributes so elements can be found via selector.
      // As the order of write keys is irrelevant, we sort them to make it
      // possible to determine sets of checkboxes via string comparison of their write keys.
      $e[0].setAttribute('data-form-prefill-read', $e[0].getAttribute('data-form-prefill-keys'))
      $e[0].setAttribute('data-form-prefill-write', serializeAttribute(parseAttribute($e[0].getAttribute('data-form-prefill-keys')).sort()))
    }
    if ($e[0].getAttribute('data-form-prefill-read') === null &&
      $e[0].getAttribute('data-form-prefill-write') === null) {
      var keys = settings.storageKeys($e[0])
      if (keys && typeof keys.read !== 'undefined') {
        $e[0].setAttribute('data-form-prefill-read', serializeAttribute(keys.read))
      }
      if (keys && typeof keys.write !== 'undefined') {
        $e[0].setAttribute('data-form-prefill-write', serializeAttribute(parseAttribute(keys.write).sort()))
      }
    }
    // Add aliases for read keys
    if (!$.isEmptyObject(settings.map)) {
      var readKeys = parseAttribute($e[0].getAttribute('data-form-prefill-read')); var aliases = []
      for (var i = 0, j = readKeys.length; i < j; i++) {
        if (readKeys[i] in settings.map) {
          aliases = aliases.concat(settings.map[readKeys[i]])
        }
      }
      $e[0].setAttribute('data-form-prefill-read', serializeAttribute(readKeys.concat(aliases)))
    }
  }

  Api.prototype.read = function () {
    var keys = parseAttribute(this.element.getAttribute('data-form-prefill-read'))
    if (!keys.length) return Promise.reject(new Error('Don’t know which keys to read from.'))
    this.stores.prefix(keys, this.isList())
    return this.stores.getFirst(keys).then((value) => {
      this.prefill(value)
    })
  }

  Api.prototype.write = function (options) {
    var keys = parseAttribute(this.element.getAttribute('data-form-prefill-write'))
    if (!keys.length) return Promise.reject(new Error('No idea which keys to write to.'))
    this.stores.prefix(keys, this.isList())
    if (options && options.delete === true) {
      return this.stores.removeItems(keys)
    }
    else {
      return this.stores.setItems(keys, this.getVal())
    }
  }

  Api.prototype.prefill = function (value) {
    this.$element.val(value)
    this.element.dispatchEvent(new Event('change', {bubbles: true}))
  }

  Api.prototype.getVal = function () {
    var type = this.element.getAttribute('type')
    if (type === 'radio' || type === 'checkbox') {
      // Get the value from all inputs that write to the same keys.
      var selector = ''
      var writeKeys = this.element.getAttribute('data-form-prefill-write')
      if (writeKeys) selector += '[data-form-prefill-write="' + writeKeys + '"]'
      var $set = $(this.element.closest('form')).find(selector)
      var checked = []
      $set.each(function () {
        if (this.checked) checked.push(this.value)
      })
      return checked
    }
    else {
      return this.$element.val()
    }
  }

  Api.prototype.isList = function () {
    var type = this.element.getAttribute('type')
    return type === 'checkbox' || type === 'radio' || this.$element.is('select[multiple]') || this.$element.is('.form-prefill-list')
  }

  document.addEventListener('form-prefill:stores-initialized', function (event) {
    var hash = window.location.hash.substr(1)
    let stores = event.detail
    if (hash) {
      var newHash = readUrlVars(hash, stores)
      if (newHash !== hash) {
        window.location.hash = '#' + newHash
      }
    }
    event.target.dispatchEvent(
      new CustomEvent('form-prefill:stores-filled', {
        detail: stores,
        bubbles: true
      })
    )
  })

  $.fn.formPrefill = function (options) {
    // Make private methods testable.
    if (options === 'privates') {
      return privates
    }

    var settings = {...defaults, ...options}

    var stores = privates.stores = Stores.fromSettings(settings)
    document.dispatchEvent(new CustomEvent('form-prefill:stores-initialized', {detail: [stores, this], bubbles: true}))

    return this.each(function () {
      var $self = $(this)
      var $inputs = $self.find('input, select, textarea, .form-prefill, .form-prefill-list').not(function (i, element) {
        // Exclude file elements. We can't prefill those.
        if (element.getAttribute('type') === 'file') {
          return true
        }
        // Check nearest include and exclude-wrapper.
        var excludeParent = element.closest(settings.exclude)
        var includeParent = element.closest(settings.include)
        if (excludeParent) {
          // Exclude unless there is an include-wrapper inside the exclude wrapper.
          return !includeParent || includeParent.contains(excludeParent)
        }
        return false
      })

      // This is the form’s api
      $self.data('formPrefill', {
        writeAll: function () {
          var $write = $(deduplicateSets($inputs.get()))
          const promises = []
          $write.each(function () {
            promises.push($(this).data('formPrefill').write())
          })
          return Promise.all(promises)
        },
        removeAll: function (options) {
          options = options || { resetFields: true }
          var $write = $(deduplicateSets($inputs.get()))
          const promises = []
          $write.each(function () {
            promises.push($(this).data('formPrefill').write({ delete: true }))
          })
          return Promise.all(promises).then(function () {
            if (options.resetFields) {
              $inputs.each(function () {
                var $field = $(this); var api = $field.data('formPrefill')
                var type = this.getAttribute('type')
                if (type === 'radio' || type === 'checkbox') {
                  $field[0].checked = api.initialValue
                }
                else {
                  $field.val(api.initialValue)
                }
                this.dispatchEvent(new Event('change', {bubbles: true}))
              })
            }
            $self[0].dispatchEvent(new CustomEvent('form-prefill:cleared', {bubbles: true}))
          })
        },
        readAll: function () {
          var prefilled = []
          $inputs.each(function () {
            var $el = $(this)
            $el.data('formPrefill').read().then(function () {
              $el[0].dispatchEvent(new CustomEvent('form-prefill:prefilled', {bubbles: true}))
            }, function (cause) {
              $el[0].dispatchEvent(new CustomEvent('form-prefill:failed', {detail: cause, bubbles: true}))
            })
          })
        }
      })

      // Initialize elements api
      $inputs.each(function () {
        var $e = $(this)
        var api = new Api($e, stores, settings)
        $e.data('formPrefill', api)
      })

      // Write to stores on change
      $inputs.on('change.form-prefill', function () {
        $(this).data('formPrefill').write().then(function () {}, function () {})
      })

      // Prefill fields when the values passed in the hash are stored.
      $self.on('form-prefill:stores-filled', function () {
        $self.data('formPrefill').readAll()
      })
      // Prefill fields.
      $self.data('formPrefill').readAll()
    })
  }
}(jQuery))
