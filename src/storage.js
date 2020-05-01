/* global jQuery */

import { cookies } from './cookies'

class CookieStorage {
  constructor (pfx, domain, maxAge) {
    this.pfx = pfx
    this.domain = domain
    this.maxAge = maxAge
  }

  setItems (keys, value) {
    keys.forEach((key) => {
      cookies.setItem(this.pfx + ':' + key, JSON.stringify(value), this.maxAge, '/', this.domain, true)
    })
    return Promise.resolve(true)
  }

  removeItems (keys) {
    keys.forEach((key) => {
      cookies.removeItem(self.pfx + ':' + key, '/', self.domain)
    })
    return Promise.resolve(true)
  }

  getFirst (keys) {
    return new Promise(function (resolve, reject) {
      keys.forEach((key) => {
        var v = cookies.getItem(this.pfx + ':' + key)
        if (v !== null) {
          resolve(JSON.parse(v))
        }
      })
      reject(new Error('keys not found in cookies: ' + keys.join(', ')))
    })
  }
}

class WebStorage {
  constructor (type, pfx) {
    this.storage = type
    this.pfx = pfx
  }

  browserSupport () {
    // this is taken from modernizr.
    var mod = 'modernizr'
    try {
      this.storage.setItem(mod, mod)
      this.storage.removeItem(mod)
      return true
    }
    catch (e) {
      return false
    }
  }

  setItems (keys, value) {
    keys.forEach((key) => {
      this.storage.setItem(this.pfx + ':' + key, JSON.stringify(value))
    })
    return Promise.resolve(true)
  }

  removeItems (keys) {
    keys.forEach((key) => {
      this.storage.removeItem(this.pfx + ':' + key)
    })
    return Promise.resolve(true)
  }

  getFirst (keys) {
    return new Promise((resolve, reject) => {
      keys.forEach((key) => {
        var v = this.storage.getItem(this.pfx + ':' + key)
        if (v !== null) {
          resolve(JSON.parse(v))
        }
      })
      reject(new Error('keys not found in storage: ' + keys.join(', ')))
    })
  }
}

export { CookieStorage, WebStorage }
