class WebStorage {
  constructor (type, pfx) {
    this.storage = type
    this.pfx = pfx
  }

  browserSupport () {
    // this is taken from modernizr.
    const mod = 'modernizr'
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
        const v = this.storage.getItem(this.pfx + ':' + key)
        if (v !== null) {
          resolve(JSON.parse(v))
        }
      })
      reject(new Error('keys not found in storage: ' + keys.join(', ')))
    })
  }
}

export { WebStorage }
