import { apiRegistry, formPrefill } from "../dist/formprefill.js";

QUnit.module('Integration', {
  before: function() {
    this.$fixture = $('#qunit-fixture');
    this.$form = $('<form>').appendTo(this.$fixture);
    this.$form2 = $('<form>').appendTo(this.$fixture);
  },
  after: function() {
    this.$fixture.empty();
  },
  beforeEach: function() {
    this.$fields = $('<input type="text" data-form-prefill-keys="first_name">')
    .add('<input value="one" data-form-prefill-keys="foo" type="checkbox"><input checked value="two" data-form-prefill-keys="foo" type="checkbox"><input checked value="three" data-form-prefill-keys="foo" type="checkbox">')
    .add('<select multiple name="myform[personal_data][age][]"><option value="1">one</option><option value="2">two</option><option value="3">three</option></select>')
    .appendTo(this.$form);
    // Similar for but with different defaults.
    this.$fields2 = $('<input type="text" data-form-prefill-keys="first_name" value="first">')
    .add('<input checked value="one" data-form-prefill-keys="foo" type="checkbox"><input value="two" data-form-prefill-keys="foo" type="checkbox"><input checked value="three" data-form-prefill-keys="foo" type="checkbox">')
    .add('<select multiple name="myform[personal_data][age][]"><option selected value="1">one</option><option value="2">two</option><option value="3">three</option></select>')
    .appendTo(this.$form2);
  },
  afterEach: function() {
    this.$form.empty();
    this.$form2.empty();
    $(document).unbind('form-prefill:stores-initialized form-prefill:stores-filled');
  }
});

QUnit.test('Exclusion and inclusion of fields', function(assert) {
  var $excluded = $('<div data-form-prefill-exclude></div>').appendTo(this.$form);
  var $excludedField = $('<input type="text" data-form-prefill-keys="nickname">').appendTo($excluded);
  var $includedField = $('<select data-form-prefill-include name="myform[personal_data][favourite_pet][]"><option value="cat">Cat</option><option value="dog">Dog</option></select>').appendTo($excluded);
  formPrefill(this.$form[0]);
  this.$form.find('*:not(option)').each(function() {
    if (this === $excluded[0] || this === $excludedField[0]) {
      assert.equal(apiRegistry.get(this), null);
    } else {
      assert.notEqual(apiRegistry.get(this), null);
    }
  });
});

QUnit.test('Write value on change', function(assert) {
  var done = assert.async();
  formPrefill(this.$form[0]);
  this.$fields.filter('[type=checkbox]').eq(0).prop('checked', true).get(0).dispatchEvent(new Event('change'));
  setTimeout(function() {
    assert.equal(sessionStorage.getItem('formPrefill:l:foo'), '["one","two","three"]');
    sessionStorage.removeItem('formPrefill:l:foo');
    done();
  }, 100);
});

QUnit.test('Write all values', function(assert) {
  var done = assert.async();
  var api = formPrefill(this.$form[0]);
  this.$fields.filter('[type=text]').val('Miranda');
  this.$fields.filter('select').val('1');
  api.writeAll().then(function () {
    assert.equal(sessionStorage.getItem('formPrefill:s:first_name'), '"Miranda"');
    assert.equal(sessionStorage.getItem('formPrefill:l:foo'), '["two","three"]');
    assert.equal(sessionStorage.getItem('formPrefill:l:age'), '["1"]');
    sessionStorage.removeItem('formPrefill:s:first_name');
    sessionStorage.removeItem('formPrefill:l:foo');
    sessionStorage.removeItem('formPrefill:l:age');
    done();
  });
});

QUnit.test('Remove all values and trigger event', function(assert) {
  var self = this, done = assert.async();
  var api = formPrefill(this.$form[0]);
  this.$fields.filter('[type=text]').val('Miranda');
  this.$fields.filter('select').val('1');
  api.writeAll().then(function () {
    assert.equal(sessionStorage.getItem('formPrefill:s:first_name'), '"Miranda"');
    assert.equal(sessionStorage.getItem('formPrefill:l:foo'), '["two","three"]');
    assert.equal(sessionStorage.getItem('formPrefill:l:age'), '["1"]');
    api.removeAll({resetFields: false}).then(function () {
      assert.equal(sessionStorage.getItem('formPrefill:s:first_name'), null);
      assert.equal(sessionStorage.getItem('formPrefill:l:foo'), null);
      assert.equal(sessionStorage.getItem('formPrefill:l:age'), null);
      done();
    });
  });
});

QUnit.test('Read all values and trigger events for each field', function(assert) {
  var self = this,   done = assert.async();
  assert.expect(10);
  sessionStorage.setItem('formPrefill:s:first_name', '"Miranda"');
  sessionStorage.setItem('formPrefill:l:foo', '["one"]');
  sessionStorage.setItem('formPrefill:l:age', '["3"]');
  formPrefill(this.$form[0]);
  this.$form.on('form-prefill:prefilled', function(data) {
    assert.notEqual(typeof data, 'undefined');
  });
  setTimeout(function() {
    assert.equal(self.$fields.eq(0).val(), 'Miranda');
    assert.equal(self.$fields[1].checked, true);
    assert.equal(self.$fields[2].checked, false);
    assert.equal(self.$fields[3].checked, false);
    assert.deepEqual(self.$fields.eq(4).val(), ['3'])

    sessionStorage.removeItem('formPrefill:s:first_name');
    sessionStorage.removeItem('formPrefill:l:foo');
    sessionStorage.removeItem('formPrefill:l:age');
    done();
  }, 100);
});

QUnit.test('Only changed values are stored by default', function(assert) {
  var self = this,   done = assert.async();
  formPrefill(this.$form[0]);
  this.$form.submit(function(event) { event.preventDefault(); });
  this.$fields[1].checked = true;
  // The change event triggers storing all checkbox values with the same name.
  this.$fields.eq(1).get(0).dispatchEvent(new Event('change'));
  this.$fields.eq(4).val(['2']).get(0).dispatchEvent(new Event('change'));
  this.$form.trigger('submit');

  formPrefill(this.$form2[0]);
  setTimeout(function() {
    assert.equal(self.$fields2.eq(0).val(), 'first');
    assert.equal(self.$fields2[1].checked, true);
    assert.equal(self.$fields2[2].checked, true);
    assert.equal(self.$fields2[3].checked, true);
    assert.deepEqual(self.$fields2.eq(4).val(), ['2'])

    sessionStorage.removeItem('formPrefill:s:first_name');
    sessionStorage.removeItem('formPrefill:l:foo');
    sessionStorage.removeItem('formPrefill:l:age');
    done();
  }, 100);
});
