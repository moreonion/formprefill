/* global QUnit, $ */

import { WebStorage } from '../dist/formprefill.js'

QUnit.module('LocalStorage', {
  before: function () {
    this.store = new WebStorage(localStorage, 'myprefix')
  }
})

QUnit.test('setItems', function (assert) {
  const done = assert.async()
  this.store.setItems(['foo', 'bar'], 'baz').then(function () {
    assert.equal(localStorage.getItem('myprefix:foo'), '"baz"')
    assert.equal(localStorage.getItem('myprefix:bar'), '"baz"')
    localStorage.removeItem('myprefix:foo')
    localStorage.removeItem('myprefix:bar')
    done()
  })
})

QUnit.test('getFirst', function (assert) {
  const done = assert.async()
  const abc = ['"a"', '"b"', '"c"']
  for (let i = 0; i < 3; i++) {
    localStorage.setItem('myprefix:' + i, abc[i])
  }
  this.store.getFirst(['foo', 'bar', '1', '2']).then(function (r) {
    assert.equal(r, 'b')
    for (let i = 0; i < 3; i++) {
      localStorage.removeItem('myprefix:' + i)
    }
    done()
  })
})
