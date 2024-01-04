/*
 * You need to import utility functions yourself
 * e.g. at the top of your file:
 *    import {makeArrayUnique, handleize} from './_utils.js';
 */

const ThemeVars = window.ThemeVars;

/**
 * Removes duplicates from an array and returns the result.
 * @param {Array} array - The array containing duplicates.
 * @returns {Array} A unique array.
 * @example
 * makeArrayUnique([1, 2, 3, 3, 4, 5, 5, 6, 7, 7, 7, 8, 9, 9, 9, 10]);
 * // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 */
export function makeArrayUnique(array) {
  return array.filter((item, index) => array.indexOf(item) === index);
}

/**
 * Converts a string to a valid URL slug.
 * @param {String} string - The string to convert.
 * @returns {String} A URL slug.
 * @example
 * handleize('This is a test!');
 * // this-is-a-test
 */
export function handleize(string) {
  return string.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Gets an object representing destructured form data using name and value attributes.
 * @param {HTMLFormElement} form - The form to get data from.
 * @returns {Object} An object containing the form data.
 * @example
 * getParamsFromForm(document.querySelector('form'));
 * // {
 * //   id: '12345',
 * //   quantity: 1,
 * //   properties: {
 * //     'Gift Message': 'Happy Birthday!'
 * //   }
 * // }
 */
export function getParamsFromForm(form) {
  const formData = new FormData(form);
  const params = {};
  for (let [key, value] of formData.entries()) {
    if (key.includes('[]')) {
      const arrayKey = key.replace('[]', '');
      if (!params[arrayKey]) {
        params[arrayKey] = [];
      }
      params[arrayKey].push(value);
    } else {
      params[key] = value;
    }    
  }
  return params;
}

/**
 * Gets a query string representing destructured form data.
 * @param {HTMLFormElement} form - The form to get data from.
 * @param {String} prefix - OPTIONAL: A prefix to prepend to the query string.
 * @returns {String} A query string.
 * @example
 * getQueryStringFromForm(document.querySelector('form'));
 * // id=12345&quantity=1&properties[Gift%20Message]=Happy%20Birthday!
 */
export function getQueryFromForm(form, prefix = '') {
  const params = getParamsFromForm(form);
  const queryString = Object.keys(params).map(key => {
    const value = params[key];
    if (Array.isArray(value)) {
      return value.map(item => `${key}[]=${item}`).join('&');
    } else if (typeof value === 'object') {
      return Object.keys(value).map(subKey => `${key}[${subKey}]=${value[subKey]}`).join('&');
    } else {
      return `${key}=${value}`;
    }
  }).join('&');
  return `${prefix}${queryString}`;
}

/**
 * Gets a query string representing a destructured object.
 * @param {Object} object - The object to get data from.
 * @param {String} prefix - OPTIONAL: A prefix to prepend to the query string.
 * @returns {String} A query string.
 * @example
 * getQueryStringFromObject({
 *  id: '12345',
 *  quantity: 1
 * });
 * // id=12345&quantity=1
 */
export function objectToQueryString(object, prefix = '') {
  return prefix + Object.keys(object).map(key => `${key}=${object[key]}`).join('&');
}

/**
 * Converts an amount into cents (or pennies etc).
 * @param {String|Number} amount - The amount to convert.
 * @returns {Integer} The amount in cents.
 * @example
 * toCents('$1.00');
 * // 100
 */
export function toCents(amount) {
  amount = amount.toString().replace(/[^0-9.]/g, '');
  if (amount.includes('.')) {
    amount = parseFloat(amount);
    amount *= 100;
    return Math.round(amount);
  }
  return parseInt(amount * 100);
}

/**
 * Converts an amount into a money formatted string.
 * @param {String|Number} amount - The amount to convert.
 * @param {Boolean} cents - OPTIONAL: Whether or not the amount is already in cents. Default: true.
 * @returns {String} The amount in money formatted string.
 * @example
 * toMoneyString(100);
 * // '$1.00'
 * toMoneyString(100, false);
 * // '$100.00'
 */
export function toMoneyString(amount, cents = true) {
  if (!cents) {
    amount = toCents(amount);
  }
  const moneyAmount = (parseFloat(amount) / 100).toFixed(2);
  const moneyFormat = ThemeVars.moneyFormat || '${{amount}}';
  return moneyFormat.replace('{{amount}}', moneyAmount);
}

/**
 * Generates a modal window with a given outer class and inner content.
 * @param {String} outerClass - The outer class to add to the modal.
 * @param {String} innerContent - The inner content to add to the modal.
 * @returns {String} The modal window markup.
 */
export function generateModal(outerClass, innerContent) {
  return `
  <div class="${outerClass}">
    <div class="${outerClass}__inner">
      ${innerContent}
    </div>
    <style>
      body {
        overflow: hidden;
      }
      .${outerClass} {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .${outerClass}__inner {
        width: 800px;
        max-width: 96%;
        height: auto;
        min-height: 250px;
        max-height: calc(100vh - 100px);
        background-color: #fff;
        border-radius: 4px;
        overflow-y: auto;
        overflow-x: hidden;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        z-index:9;
      }
    </style>
  </div>
`;
}


/**
 * Removes and re-adds script tags from an element so they are loaded again.
 * @param {HTMLElement} element - The element to remove and re-add script tags from.
 * @returns {Boolean} Whether or not the element was valid (and thus any script tags were removed and re-added).
 */
export function reloadScripts(element) {
  if (!element || !(element instanceof HTMLElement)) return false;
  const scriptTags = element.querySelectorAll('script');
  scriptTags.forEach(oldScriptTag => {
    const newScriptTag = document.createElement('script');
    newScriptTag.textContent = oldScriptTag.textContent;
    oldScriptTag.remove();
    element.appendChild(newScriptTag);
  });
  return true;
}

/**
 * Capitalizes the first letter in each word of a string.
 * @param {String} string - The string to titleize.
 * @returns {String} A titleized string.
 * @example
 * titleize('hello world');
 * // Hello World
 */
export function titleize(string) {
  return string.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * Remove keys from an object that are null, undefined, or empty strings/arrays/objects.
 * @param {Object} object - The object to remove keys from.
 * @returns {Object} The object with keys removed.
 * @example
 * removeEmptyKeys({ a: 'Lorem ipsum', b: [1, 2, 3], c: null, d: undefined, e: '', f: [], g: {} });
 * // { a: 'Lorem ipsum', b: [1, 2, 3] }
 */
export function removeEmptyKeys(object) {
  const keys = Object.keys(object);
  keys.forEach(key => {
    if (object[key] === null || object[key] === undefined || isEmpty(object[key])) {
      delete object[key];
    }
  });
  return object;
}

/**
 * Checks if a passed string/array/object is empty.
 * @param {String|Array|Object} value - The value to check.
 * @returns {Boolean} Whether or not the value is empty.
 * @example
 * isEmpty([]);
 * // true
 * isEmpty('hello');
 * // false
 */
export function isEmpty(value) {
  if (Array.isArray(value)) {
    return value.length === 0;
  } else if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  } else {
    return value === '';
  }
}

/**
 * Strips whitespace (except single space between words) from a passed in string.
 * @param {String} string - The string to strip.
 * @returns {String} The stripped string.
 * @example
 * stripWhitespace('  hello world  ');
 * // 'hello world'
 */
export function stripWhitespace(string) {
  return string.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Strips all HTML tags from a passed in string.
 * @param {String} string - The string to strip.
 * @returns {String} The stripped string.
 * @example
 * stripHTML('<p>hello world</p>');
 * // 'hello world'
 */
export function stripHTML(string) {
  return string.replace(/<[^>]*>/g, '');
}

/**
 * Get variant images indexes (start and end) based on
 * the next variant's featured meedia position. If there's
 * no next variant, return the last index.
 * @param {Array} variants - The variants to get image indexes for.
 * @returns {Object} An object containing the variant image indexes.
 */
export function getVariantImageIndexes(variants) {
  const variantImageIndexes = {};
  variants.forEach((variant, index) => {
    const variantFeaturedMediaPosition = variant.featured_media?.position;
    const variantImagesRange = {
      start: variantFeaturedMediaPosition ? variantFeaturedMediaPosition - 1 : 0
    };
    if (variantFeaturedMediaPosition && variants[index + 1]) {
      const nextVariantFeaturedMediaPosition = variants[index + 1].featured_media?.position;
      if (nextVariantFeaturedMediaPosition && nextVariantFeaturedMediaPosition > variantFeaturedMediaPosition) {
        variantImagesRange.end = nextVariantFeaturedMediaPosition - 1;
      }
    }
    variantImageIndexes[variant.id] = variantImagesRange;
  });
  return variantImageIndexes;
}

export function getVariantSlides(variantIndexes, slides) {
  const variantSlides = {};
  Object.keys(variantIndexes).forEach(variantId => {
    const variantIndex = variantIndexes[variantId];
    if (variantIndex.end) {
      variantSlides[variantId] = slides.slice(variantIndex.start, variantIndex.end);
    } else {
      variantSlides[variantId] = slides.slice(variantIndex.start);
    }
  });
  return variantSlides;
}