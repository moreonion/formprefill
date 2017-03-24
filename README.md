# Form prefill plugin for jQuery

## Installation

Pull in `jquery.formprefill.js` after jQuery.
Promises have to be polyfilled for IE.

## Usage

Call `formPrefill()` on the form. If values for any fields are present in one of the stores, the fields are prefilled with the corresponding values.
You can pass an options object (see below).
```javascript
$('form').formPrefill();
```

For each field that you want to prefill or save you have to set the keys in the markup:
```html
<!-- This will read from and write to the first_name key: -->
<input type="text" data-form-prefill-keys="first_name">

<!-- You can specify multiple keys separated by spaces: -->
<input type="text" data-form-prefill-keys="first_name firstname name">

<!-- You can set different keys to read from and to write to: -->
<input type="text" data-form-prefill-read="first_name firstname" data-form-prefill-write="first_name">

<!-- If the data attributes are omitted the keys are parsed from the name attribute, using the last term in brackets by default. -->
<input type="text" name="person[first_name]">
<input type="text" name="first_name">
```

In case you’re not in control of the markup, you can pass custom logic to set the keys for a field:
```javascript
$('form').formPrefill({
  storageKeys: function($element) {
    // Guess the keys from $element...
    return {
      read: "first_name",
      write: "first_name"
    };
  },
});
```

## API

The form’s API is accesible via `$('form').data('formPrefill')`.
```javascript
// Prefill all fields that have values saved in the stores (this is done automatically when you call the plugin on a form):
$('form').data('formPrefill').readAll();

// Write values to the stores for each field in the form:
$('form').data('formPrefill').writeAll();

// Clear values from the stores for each field in the form and reset their values to what they were when the plugin was initialized:
$('form').data('formPrefill').removeAll();

// Clear each field’s values from the stores, leave the current field values untouched:
$('form').data('formPrefill').removeAll({resetFields: false});
```

Each field exposes an own API: `$('form').find('input[name=first_name]').data('formPrefill')`
```javascript
var $firstName = $('form').find('input[name=first_name]');

// Read this field’s value from the stores and fill the field in:
$firstName.data('formPrefill').read();

// Write this field’s value to the stores. When called on a checkbox or radio, all checkboxes/radios that have the same keys in their data-form-prefill-write attribute are considered one set of fields.
$firstName.data('formPrefill').write();

// Clear this field’s value from the stores:
$firstName.data('formPrefill').write({delete: true});
```
Each of the field API methods returns a Promise.

## Populate the stores via url hash

You can pass values in the url’s hash as follows: The hash can be splitted in segments divided by `;`, every segment containing values prefixed with `p:` will be parsed and stripped from the hash. The values are saved into the stores and any corresponfing form fields are filled in.
Hash examples:
* Field values are separated with ampersands: `#p:first_name=Jane&last_name=Doe`
* Pass mulitple values for the same property to populate sets of checkboxes: `#p:likes=cats&likes=dogs` will result in the checkboxes with `value="cats"` and `value=dogs` checked.
* Other parts of the hash remain untouched: `#anchor;p:first_name=Jane`


## Options

| Option            | Type     | Default                       | Description                                                                                                                                                                                                                                                                                                                       |
|-------------------|----------|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `prefix`          | String   | `formPrefill`                 | All entries in the stores are prefixed with this.                                                                                                                                                                                                                                                                                 |
| `storageKeys`     | Function |                               | A function that sets the storage keys for a given field (passed in as a jQuery object). The function must return an object with a `read` and a `write` key.                                                                                                                                                                       |
| `map`             | Object   | `{}`                          | A map of aliases that are used when looking up keys in the stores. In the case of `{'first_name': ['firstname', 'firstName', 'fname']}`, a field with the attribute `data-form-prefill-keys="first_name"` gets prefilled from the `firstName` entry in any of the stores if neither a `first_name` nor a `firstname` entry exist. |
| `exclude`         | String   | `[data-form-prefill-exclude]` | Selector for fields or containers in the form that should be excluded from prefilling.                                                                                                                                                                                                                                            |
| `include`         | String   | `[data-form-prefill-include]` | Selector for fields or containers inside excluded containers that should be included nevertheless.                                                                                                                                                                                                                                |
| `stringPrefix`    | String   | `s`                           | Entries in the stores describing strings are prefixed with this string.                                                                                                                                                                                                                                                           |
| `listPrefix`      | String   | `l`                           | Entries in the stores describing lists are prefixed with this string.                                                                                                                                                                                                                                                             |
| `stores`          | Array    | `[]`                          | An array of custom store instances. A store instance has to expose a `setItems`, a `removeItems`, and a `getFirst` method, each of which should return a Promise. This way your store could make an XHR request, resolving the promise and thus prefilling the form only when the data arrives.                                   |
| `useSessionStore` | Boolean  | `true`                        | Save values in `sessionStorage`.                                                                                                                                                                                                                                                                                                  |
| `useCookies`      | Boolean  | `false`                       | Save values in Cookies.                                                                                                                                                                                                                                                                                                           |
| `cookieDomain`    | String   | `''`                          | The domain from which cookies can be accessed. Defaults to the current domain, not including (other) subdomains. |

## Events

By default, the stores are updated when fields fire the `change` event and when the form is submitted. You can remove these handlers: `$('form').find('*').off('.form-prefill')`.

When the plugin populates a field, it fires `form-prefill:prefilled` on the field.
When it fails to retrieve a value for a field, it fires `form-prefill:failed` on the field, providing the cause as the second argument to the handler function.
These events bubbles up.

When you call `removeAll()` on the form’s API, `form-prefill:cleared` is fired on the form.
