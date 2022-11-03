import { CookieStorage } from './CookieStorage'
import { WebStorage } from './WebStorage'
import { defaults } from './defaults'

function getStorage (storageName) {
  if (['sessionStorage', 'localStorage'].indexOf(storageName) < 0) {
    return null
  }
  let storage
  try {
    // when blocking 3rd party cookies trying to access the existing storage
    // will throw an exception
    // see https://bugs.chromium.org/p/chromium/issues/detail?id=357625
    return window[storageName]
  }
  catch (e) {
    // Ignore errors: Simply don’t use the storage.
    return null
  }
}

class Stores {
  static fromSettings (settings) {
    settings = { ...defaults, ...settings }
    const stores = []
    let storage, store
    for (const storeConfig of settings.stores) {
      if (typeof storeConfig === 'string') {
        switch (storeConfig) {
          case 'sessionStorage':
          case 'localStorage':
            storage = getStorage(storeConfig)
            if (storage) {
              store = new WebStorage(storage, settings.prefix)
              if (store.browserSupport()) {
                stores.push(store)
              }
            }
            break
          case 'cookie':
            stores.push(new CookieStorage(settings.prefix, settings.cookieDomain, settings.cookieMaxAge))
            break
        }
      }
      else {
        stores.push(storeConfig)
      }
    }
    return new this(stores, settings.stringPrefix, settings.listPrefix)
  }

  constructor (stores, stringPrefix, listPrefix) {
    this.stores = stores
    this.stringPrefix = stringPrefix
    this.listPrefix = listPrefix
  }

  setItems (keys, value) {
    const promises = []
    this.stores.forEach(function (store, index) {
      promises.push(store.setItems(keys, value))
    })
    return Promise.all(promises)
  }

  removeItems (keys) {
    const promises = []
    this.stores.forEach(function (store, index) {
      promises.push(store.removeItems(keys))
    })
    return Promise.all(promises)
  }

  async getFirst (keys) {
    for (const store of this.stores) {
      try {
        return await store.getFirst(keys)
      }
      catch (cause) {
        // Try the next store
      }
    }
    return null
  }

  prefix (keys, list = false) {
    const prefix = list ? this.listPrefix : this.stringPrefix
    return keys.map((key) => prefix + ':' + key)
  }

  setValuesMap (vars) {
    const promises = []
    Object.keys(vars).forEach((key) => {
      const values = vars[key]
      promises.push(this.setItems(this.prefix([key]), values[values.length - 1]))
      promises.push(this.setItems(this.prefix([key], true), values))
    })
    return Promise.all(promises)
  }
}

export { Stores }
