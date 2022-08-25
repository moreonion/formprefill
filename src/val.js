/**
 * A drop-in replacement for jQuery val.
 */

/**
 * Default getter implementation that works for most elements.
 */
function defaultGet(element) {
    return element.value
}

/**
 * Default setter that works for elements with a value attribute.
 *
 * @param {Element} element
 * @param {*} newValue
 */
function defaultSet(element, newValue) {
    element.value = newValue
}

function setChecked(element, newValue) {
    if (!Array.isArray(newValue)) {
        newValue = [newValue]
    }
    element.checked = newValue.includes(element.value)
}

let types = {
    checkbox: {
        get: defaultGet,
        set: setChecked,
    },
    radio: {
        get: defaultGet,
        set: setChecked,
    },
    select: {
        get: function (element) {
            let values = Array.from(element.options).filter((option) => {
                return option.selected
            }).map((option) => option.value)
            if (!element.multiple) {
                return values.length >= 1 ? values[0] : null
            }
            return values
        },
        set: function (element, newValue) {
            if (!Array.isArray(newValue)) {
                newValue = [newValue]
            }
            Array.from(element.options).forEach((option) => {
                option.selected = newValue.includes(option.value)
            })
        },
    }
}

function getType(element) {
    if (element.dataset.valueType) {
        return element.dataset.valueType
    }
    if (element.hasAttribute("type")) {
        return element.getAttribute("type")
    }
    return element.tagName.toLowerCase()
}

/**
 * Read the element’s value.
 */
function get(element) {
    let typeName, type
    if ((typeName = getType(element)) && (type = types[typeName])) {
        return type.get(element)
    }
    return defaultGet(element)
}

/**
 * Set the element’s value.
 */
function set(element, newValue) {
    let typeName, type
    if ((typeName = getType(element)) && (type = types[typeName])) {
        return type.set(element, newValue)
    }
    return defaultSet(element, newValue)
}

export {
    types, get, set
}
