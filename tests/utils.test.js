import { readUrlVars, storageKeys, Stores } from "../dist/jquery.formprefill.formprefill.js";

QUnit.module('utils', {
  before: function() {
    this.settings = {
      stringPrefix: 's',
      listPrefix: 'l'
    };
  }
});

QUnit.test('storageKeys: text', function(assert) {
  var r = storageKeys($('<input name="submitted[personal_data][first_name]" type="text">')[0]);
  assert.equal(r.read, 'first_name');
  assert.equal(r.write, 'first_name');
});

QUnit.test('storageKeys: select', function(assert) {
  var r = storageKeys($('<select name="submitted[personal_data][country]">')[0]);
  assert.equal(r.read, 'country');
  assert.equal(r.write, 'country');
});

QUnit.test('storageKeys: multiselect', function(assert) {
  var r = storageKeys($('<select name="submitted[foo][]">')[0]);
  assert.equal(r.read, 'foo');
  assert.equal(r.write, 'foo');
});

QUnit.test('storageKeys: checkboxes', function(assert) {
  var r = storageKeys($('<input name="submitted[foo][bar]" value="bar" type="checkbox">')[0]);
  assert.equal(r.read, 'foo');
  assert.equal(r.write, 'foo');
});

QUnit.test('storageKeys: radios', function(assert) {
  var r = storageKeys($('<input name="submitted[foo]" value="bar" type="radio">')[0]);
  assert.equal(r.read, 'foo');
  assert.equal(r.write, 'foo');
});

QUnit.test('storageKeys: plain name without brackets', function(assert) {
  var r = storageKeys($('<input name="first_name" type="text">')[0]);
  assert.equal(r.read, 'first_name');
  assert.equal(r.write, 'first_name');
});

QUnit.test( "readUrlVars: p:test=testval&p:test=testval2;somethingelse", function (assert) {
  var self = this, done = assert.async();
  var store = new Store();
  var stores = Stores.fromSettings($.extend({stores: [store]}, self.settings));
  setTimeout(function() {
    var ret = readUrlVars('p:test=testval&p:test=testval2;somethingelse', stores);
    assert.equal(ret, 'somethingelse');
    assert.equal(store.data['s:test'], 'testval2');
    assert.deepEqual(store.data['l:test'], ['testval', 'testval2']);
    done();
  }, 20);
});

QUnit.test( "readUrlVars: p:test=testval&test=testval2;somethingelse", function (assert) {
  var self = this, done = assert.async();
  var store = new Store();
  var stores = Stores.fromSettings($.extend({stores: [store]}, self.settings));
  setTimeout(function() {
    var ret = readUrlVars('p:test=testval&test=testval2;somethingelse', stores);
    assert.equal(ret, 'somethingelse');
    assert.equal(store.data['s:test'], 'testval2');
    assert.deepEqual(store.data['l:test'], ['testval', 'testval2']);
    done();
  }, 20);
});

QUnit.test( "readUrlVars: p:test (All parts starting with 'p:' should be removed)", function (assert) {
  var self = this, done = assert.async();
  var store = new Store();
  var stores = Stores.fromSettings($.extend({stores: [store]}, self.settings));
  setTimeout(function() {
    var ret = readUrlVars('p:test', stores);
    assert.equal(ret, '');
    done();
  }, 20);
});

QUnit.test( "readUrlVars: p:test=%C3%A4%C3%B6%3B%26%2F%40", function (assert) {
  var self = this, done = assert.async();
  var store = new Store();
  var stores = Stores.fromSettings($.extend({stores: [store]}, self.settings));
  setTimeout(function() {
    var ret = readUrlVars('p:test=%C3%A4%C3%B6%3B%26%2F%40', stores);
    assert.equal(store.data['s:test'], 'äö;&/@');
    assert.equal(store.data['l:test'][0], 'äö;&/@');
    done();
  }, 20);
});
