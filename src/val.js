/**
 * A drop-in replacement for jQuery val.
 */

/**
 * Default getter implementation that works for most elements.
 */
function defaultGet (element) {
  return element.value
}

/**
 * Default setter that works for elements with a value attribute.
 *
 * @param {HTMLElement} element
 * @param {*} newValue
 */
function defaultSet (element, newValue) {
  element.value = newValue
}

/**
 * Set the checked property of an element based on an input value.
 *
 * @param {HTMLElement} element
 * @param {string|Array} newValue
 */
function setChecked (element, newValue) {
  if (!Array.isArray(newValue)) {
    newValue = [newValue]
  }
  element.checked = newValue.includes(element.value)
}

/**
 * Mapping of “types“ to getter and setter methods.
 */
const types = {
  checkbox: {
    get: defaultGet,
    set: setChecked,
  },
  radio: {
    get: defaultGet,
    set: setChecked,
  },
  select: {
    /**
     * Get the current value of a select element.
     *
     * For a single-value <select> this returns a string. For multi-value selects it returns a
     * list of strings.
     *
     * @param {HTMLElement} element The select element which’s value is being read
     * @returns {(string|Array)} The value of the select element.
     */
    get: function (element) {
      const values = [...element.options]
        .filter((option) => option.selected)
        .map((option) => option.value)
      if (!element.multiple) {
        return values.length >= 1 ? values[0] : null
      }
      return values
    },
    /**
     * Set the value of a select element
     *
     * @param {HTMLElement} element The select element which’s options’ should be updated.
     * @param {(string|Array)} newValue  A single or multiple value strings.
     */
    set: function (element, newValue) {
      if (!Array.isArray(newValue)) {
        newValue = [newValue]
      }
      for (const option of element.options) {
        option.selected = newValue.includes(option.value)
      }
    },
  }
}

/**
 * Determine how values can be read/set for a given element.
 *
 * @param {HTMLElement} element
 * @returns {object} An object with a get and set method.
 */
function getType (element) {
  return (
    types[element.dataset.valueType] ||
        types[element.getAttribute('type')] ||
        types[element.tagName.toLowerCase()] ||
        { get: defaultGet, set: defaultSet }
  )
}

/**
 * Read the element’s value.
 */
function get (element) {
  return getType(element).get(element)
}

/**
 * Set the element’s value.
 */
function set (element, newValue) {
  return getType(element).set(element, newValue)
}

export {
  types, get, set
}
