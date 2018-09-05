QUnit.module('LocalStorage', {
  before: function() {
    var privates = $.fn.formPrefill('privates');
    this.store = new privates.WebStorage(localStorage, 'myprefix');
  }
});

QUnit.test('setItems', function(assert) {
  var done = assert.async();
  this.store.setItems(['foo', 'bar'], 'baz').then(function() {
    assert.equal(localStorage.getItem('myprefix:foo'), '"baz"');
    assert.equal(localStorage.getItem('myprefix:bar'), '"baz"');
    localStorage.removeItem('myprefix:foo');
    localStorage.removeItem('myprefix:bar');
    done();
  });
});

QUnit.test('getFirst', function(assert) {
  var done = assert.async();
  var abc = ['"a"', '"b"', '"c"'];
  for (var i = 0; i < 3; i++) {
    localStorage.setItem('myprefix:' + i, abc[i]);
  }
  this.store.getFirst(['foo', 'bar', '1', '2']).then(function(r) {
    assert.equal(r, 'b');
    for (var i = 0; i < 3; i++) {
      localStorage.removeItem('myprefix:' + i);
    }
    done();
  })
});
