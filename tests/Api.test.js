import { Api, Stores } from "../dist/jquery.formprefill.formprefill.js";

QUnit.module('Api', {
  before: function() {
    this.$fixture = $('#qunit-fixture');
    this.$form = $('<form>').appendTo(this.$fixture);
  },
  after: function() {
    this.$fixture.empty();
  },
  afterEach: function() {
    this.$form.empty();
  }
});

QUnit.test('init with data-form-prefill-keys, sort write keys', function(assert) {
  var $input = $('<input type="text" data-form-prefill-keys="foo bar" name="submitted[first_name]">').appendTo(this.$form);
  var api = new Api($input[0]);
  assert.equal($input.data('form-prefill-read'), 'foo bar');
  assert.equal($input.data('form-prefill-write'), 'bar foo');
});

QUnit.test('init with data-form-prefill-read', function(assert) {
  var $input = $('<input type="text" data-form-prefill-read="foo bar" name="submitted[first_name]">').appendTo(this.$form);
  var api = new Api($input[0]);
  assert.equal($input.data('form-prefill-read'), 'foo bar');
  assert.equal($input.data('form-prefill-write'), undefined);
});

QUnit.test('init with data-form-prefill-read and a map', function(assert) {
  var $input = $('<input type="text" data-form-prefill-keys="first_name your_name" name="submitted[first_name]">').appendTo(this.$form);
  var api = new Api($input[0], [], {
    map: {
      first_name: ['firstname', 'firstName', 'fname']
    }
  });
  assert.equal($input.data('form-prefill-read'), 'first_name your_name firstname firstName fname');
  assert.equal($input.data('form-prefill-write'), 'first_name your_name');
});

QUnit.test('init with data-form-prefill-write', function(assert) {
  var $input = $('<input type="text" data-form-prefill-write="foo bar" name="submitted[first_name]">').appendTo(this.$form);
  var api = new Api($input[0]);
  assert.equal($input.data('form-prefill-read'), '');
  assert.equal($input.data('form-prefill-write'), 'foo bar');
});

QUnit.test('init without data attribute', function(assert) {
  var $input = $('<input type="text" name="submitted[first_name]">').appendTo(this.$form);
  var api = new Api($input[0]);
  assert.equal($input.data('form-prefill-read'), 'first_name');
  assert.equal($input.data('form-prefill-write'), 'first_name');
});

QUnit.test('read', function(assert) {
  // Test case: value is present in one of the stores.
  // The read method doesn’t deal with conflicting values yet.
  var done = assert.async();
  var store1 = new Store(), store2 = new Store();
  var $input = $('<input type="text" data-form-prefill-read="foo bar">').appendTo(this.$form);
  var api = new Api($input[0], Stores.fromSettings({stores: [store1, store2]}));
  store2.setItems(['s:bar'], 'baz');
  api.read().then(function(value) {
    assert.equal($input.val(), 'baz');
    done();
  });
});

QUnit.test('write', function(assert) {
  var done = assert.async();
  var store1 = new Store(), store2 = new Store();
  var $input = $('<input type="text" data-form-prefill-write="foo bar">').val('baz').appendTo(this.$form);
  var api = new Api($input[0], Stores.fromSettings({stores: [store1, store2]}));
  api.write().then(function() {
    assert.equal(store1.data['s:foo'], 'baz');
    assert.equal(store1.data['s:bar'], 'baz');
    assert.equal(store2.data['s:foo'], 'baz');
    assert.equal(store2.data['s:bar'], 'baz');
    done();
  });
});

QUnit.test('prefill a text field', function(assert) {
  var $field = $('<input type="text">').appendTo(this.$form);
  var api = new Api($field[0]);
  api.prefill('foo');
  assert.equal($field.val(), 'foo');
});

QUnit.test('prefill a select field', function(assert) {
  var $field = $('<select><option value="1">one</option><option value="2">two</option><option value="3">three</option></select>').appendTo(this.$form);
  var api = new Api($field[0]);
  api.prefill('2');
  assert.equal($field.children()[0].selected, false);
  assert.equal($field.children()[1].selected, true);
  assert.equal($field.children()[2].selected, false);
});

QUnit.test('prefill a multiselect field', function(assert) {
  var $field = $('<select multiple><option value="1">one</option><option value="2">two</option><option value="3">three</option></select>').appendTo(this.$form);
  var api = new Api($field[0]);
  api.prefill(['2', '3']);
  assert.equal($field.children()[0].selected, false);
  assert.equal($field.children()[1].selected, true);
  assert.equal($field.children()[2].selected, true);
});

QUnit.test('prefill a set of checkboxes', function(assert) {
  var $fields = $('<input checked value="one" type="checkbox"><input value="two" type="checkbox"><input value="three" type="checkbox">').appendTo(this.$form);
  $fields.each(function() {
    var api = new Api(this);
    api.prefill(['two', 'three']);
  });
  assert.equal($fields[0].checked, false);
  assert.equal($fields[1].checked, true);
  assert.equal($fields[2].checked, true);
});

QUnit.test('prefill a set of radios', function(assert) {
  var $fields = $('<input checked value="one" type="radio"><input value="two" type="radio"><input value="three" type="radio">').appendTo(this.$form);
  $fields.each(function() {
    var api = new Api(this);
    api.prefill(['two', 'three']);
  });
  assert.equal($fields[0].checked, false);
  assert.equal($fields[1].checked, true);
  assert.equal($fields[2].checked, true);
});

QUnit.test('getVal from a set of checkboxes', function(assert) {
  var $fields = $('<input value="one" data-form-prefill-keys="foo" type="checkbox"><input checked value="two" data-form-prefill-keys="foo" type="checkbox"><input checked value="three" data-form-prefill-keys="foo" type="checkbox"><input value="four" data-form-prefill-keys="bar" type="checkbox">').appendTo(this.$form);
  $fields.each(function() {
    $(this).data('formPrefill', new Api(this));
  });
  var r = $fields.eq(0).data('formPrefill').getVal();
  assert.deepEqual(r, ['two', 'three']);
});
