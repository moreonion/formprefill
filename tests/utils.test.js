QUnit.module('utils', {
  before: function() {
    this.privates = $.fn.formPrefill('privates');
    this.settings = {
      stringPrefix: 's',
      listPrefix: 'l'
    };
  }
});

QUnit.test('storageKeys: text', function(assert) {
  var r = this.privates.storageKeys($('<input name="submitted[personal_data][first_name]" type="text">'));
  assert.equal(r.read, 'first_name');
  assert.equal(r.write, 'first_name');
});

QUnit.test('storageKeys: select', function(assert) {
  var r = this.privates.storageKeys($('<select name="submitted[personal_data][country]">'));
  assert.equal(r.read, 'country');
  assert.equal(r.write, 'country');
});

QUnit.test('storageKeys: multiselect', function(assert) {
  var r = this.privates.storageKeys($('<select name="submitted[foo][]">'));
  assert.equal(r.read, 'foo');
  assert.equal(r.write, 'foo');
});

QUnit.test('storageKeys: checkboxes', function(assert) {
  var r = this.privates.storageKeys($('<input name="submitted[foo][bar]" value="bar" type="checkbox">'));
  assert.equal(r.read, 'foo');
  assert.equal(r.write, 'foo');
});

QUnit.test('storageKeys: radios', function(assert) {
  var r = this.privates.storageKeys($('<input name="submitted[foo]" value="bar" type="radio">'));
  assert.equal(r.read, 'foo');
  assert.equal(r.write, 'foo');
});

QUnit.test('storageKeys: plain name without brackets', function(assert) {
  var r = this.privates.storageKeys($('<input name="first_name" type="text">'));
  assert.equal(r.read, 'first_name');
  assert.equal(r.write, 'first_name');
});

QUnit.test( "readUrlVars: p:test=testval&p:test=testval2;somethingelse", function (assert) {
  var self = this, done = assert.async();
  var store = new Store();
  var stores = this.privates.Stores.fromSettings($.extend({stores: [store]}, self.settings));
  setTimeout(function() {
    var ret = self.privates.readUrlVars('p:test=testval&p:test=testval2;somethingelse', stores);
    assert.equal(ret, 'somethingelse');
    assert.equal(store.data['s:test'], 'testval2');
    assert.deepEqual(store.data['l:test'], ['testval', 'testval2']);
    done();
  }, 20);
});

QUnit.test( "readUrlVars: p:test=testval&test=testval2;somethingelse", function (assert) {
  var self = this, done = assert.async();
  var store = new Store();
  var stores = this.privates.Stores.fromSettings($.extend({stores: [store]}, self.settings));
  setTimeout(function() {
    var ret = self.privates.readUrlVars('p:test=testval&test=testval2;somethingelse', stores);
    assert.equal(ret, 'somethingelse');
    assert.equal(store.data['s:test'], 'testval2');
    assert.deepEqual(store.data['l:test'], ['testval', 'testval2']);
    done();
  }, 20);
});

QUnit.test( "readUrlVars: p:test (All parts starting with 'p:' should be removed)", function (assert) {
  var self = this, done = assert.async();
  var store = new Store();
  var stores = this.privates.Stores.fromSettings($.extend({stores: [store]}, self.settings));
  setTimeout(function() {
    var ret = self.privates.readUrlVars('p:test', stores);
    assert.equal(ret, '');
    done();
  }, 20);
});

QUnit.test( "readUrlVars: p:test=%C3%A4%C3%B6%3B%26%2F%40", function (assert) {
  var self = this, done = assert.async();
  var store = new Store();
  var stores = this.privates.Stores.fromSettings($.extend({stores: [store]}, self.settings));
  setTimeout(function() {
    var ret = self.privates.readUrlVars('p:test=%C3%A4%C3%B6%3B%26%2F%40', stores);
    assert.equal(store.data['s:test'], 'äö;&/@');
    assert.equal(store.data['l:test'][0], 'äö;&/@');
    done();
  }, 20);
});
