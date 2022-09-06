/* global QUnit, $ */

import { WebStorage } from '../dist/formprefill.js'

QUnit.module('SessionStorage', {
  before: function () {
    this.store = new WebStorage(sessionStorage, 'myprefix')
  }
})

QUnit.test('setItems', function (assert) {
  const done = assert.async()
  this.store.setItems(['foo', 'bar'], 'baz').then(function () {
    assert.equal(sessionStorage.getItem('myprefix:foo'), '"baz"')
    assert.equal(sessionStorage.getItem('myprefix:bar'), '"baz"')
    sessionStorage.removeItem('myprefix:foo')
    sessionStorage.removeItem('myprefix:bar')
    done()
  })
})

QUnit.test('getFirst', function (assert) {
  const done = assert.async()
  const abc = ['"a"', '"b"', '"c"']
  for (let i = 0; i < 3; i++) {
    sessionStorage.setItem('myprefix:' + i, abc[i])
  }
  this.store.getFirst(['foo', 'bar', '1', '2']).then(function (r) {
    assert.equal(r, 'b')
    for (let i = 0; i < 3; i++) {
      sessionStorage.removeItem('myprefix:' + i)
    }
    done()
  })
})
