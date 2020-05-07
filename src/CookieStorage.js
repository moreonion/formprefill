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

export { CookieStorage }
