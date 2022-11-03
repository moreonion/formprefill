const defaults = {
  prefix: 'formPrefill',
  storageKeys: function () {
    return {
      read: 'key',
      write: 'key'
    }
  },
  map: {},
  exclude: '[data-form-prefill-exclude]',
  include: '[data-form-prefill-include]',
  stringPrefix: 's',
  listPrefix: 'l',
  stores: [
    'sessionStorage',
  ],
  cookieDomain: '',
  cookieMaxAge: Infinity
}

export { defaults }
