import { WebStorage } from "../dist/jquery.formprefill.formprefill.js";

QUnit.module('SessionStorage', {
  before: function() {
    this.store = new WebStorage(sessionStorage, 'myprefix');
  }
});

QUnit.test('setItems', function(assert) {
  var done = assert.async();
  this.store.setItems(['foo', 'bar'], 'baz').then(function() {
    assert.equal(sessionStorage.getItem('myprefix:foo'), '"baz"');
    assert.equal(sessionStorage.getItem('myprefix:bar'), '"baz"');
    sessionStorage.removeItem('myprefix:foo');
    sessionStorage.removeItem('myprefix:bar');
    done();
  });
});

QUnit.test('getFirst', function(assert) {
  var done = assert.async();
  var abc = ['"a"', '"b"', '"c"'];
  for (var i = 0; i < 3; i++) {
    sessionStorage.setItem('myprefix:' + i, abc[i]);
  }
  this.store.getFirst(['foo', 'bar', '1', '2']).then(function(r) {
    assert.equal(r, 'b');
    for (var i = 0; i < 3; i++) {
      sessionStorage.removeItem('myprefix:' + i);
    }
    done();
  })
});
