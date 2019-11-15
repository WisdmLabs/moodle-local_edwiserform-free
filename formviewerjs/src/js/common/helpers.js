'use strict';
import dom from './dom';

// eslint-disable-next-line
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(\.|\[\])(?:\4|$))/g;
const reEscapeChar = /\\(\\)?/g;

const stringToPath = function(string) {
  let result = [];
  if (Array.isArray(string)) {
    result = string;
  } else {
    string.replace(rePropName, function(match, number, quote, string) {
      let segment;
      if (quote) {
        segment = string.replace(reEscapeChar, '$1');
      } else {
        segment = (number || match);
      }
      result.push(segment);
    });
  }
  return result;
};

const helpers = {

  /**
   * Convert camelCase into lowercase-hyphen
   *
   * @param  {String} str
   * @return {String}
   */
  hyphenCase: (str) => {
    str = str.replace(/([A-Z])/g, function($1) {
      return '-' + $1.toLowerCase();
    });

    return str.replace(/\s/g, '-').replace(/^-+/g, '');
  },

  safeAttrName: name => {
    const safeAttr = {
      className: 'class'
    };

    return safeAttr[name] || helpers.hyphenCase(name);
  },
  insertStyle: response => {
    const formeoStyle = dom.create({
      tag: 'style',
      content: response.responseText
    });
    document.head.appendChild(formeoStyle);
  },
  // Nicer syntax for checking the existence of an element in an array
  inArray: (needle, haystack) => {
    return haystack.indexOf(needle) !== -1;
  },
  // ForEach that can be used on nodeList
  forEach: (array, callback, scope) => {
    for (let i = 0; i < array.length; i++) {
      callback.call(scope, array[i], i);
    }
  },

  // Basic map that can be used on nodeList
  map: (arr, callback, scope) => {
    const newArray = [];
    helpers.forEach(arr, (elem, i) => newArray.push(callback(i)));

    return newArray;
  },
  subtract: (arr, from) => {
    return from.filter(function(a) {
      return this.indexOf(a) === -1;
    }, arr);
  },
  // Find the index of one node in another
  indexOfNode: (node, parent) => {
    const parentElement = parent || node.parentElement;
    const nodeList = Array.prototype.slice.call(parentElement.childNodes);
    return nodeList.indexOf(node);
  },
  // Tests if is whole number. returns false if n is Float
  isInt: (n) => {
    return Number(n) === n && n % 1 === 0;
  },
  /**
   * Get nested property value in an object
   *
   * @private
   * @param {Object} object The object to query.
   * @param {String} path The path of the property to get.
   * @return {String|Array|Object} Returns the resolved value.
   */
  get: (object, path) => {
    path = stringToPath(path);

    let index = 0;
    const length = path.length;

    while (object !== null && index < length) {
      if (!Object.prototype.hasOwnProperty.call(object, path[index])) {
        return undefined;
      }
      object = object[path[index++]];
    }

    return (index && index === length) ? object : undefined;
  },
  set: (object, path, value, customizer) => {
    path = stringToPath(path);

    let index = -1;
    const length = path.length;
    const lastIndex = length - 1;
    let nested = object;

    while (nested !== null && ++index < length) {
      const key = path[index];
      if (typeof nested === 'object') {
        let newValue = value;
        if (index !== lastIndex) {
          const objValue = nested[key];
          newValue = customizer ? customizer(objValue, key, nested) : undefined;
          if (newValue === undefined) {
            newValue = objValue === null ? [] : objValue;
          }
        }

        if (!(Object.prototype.hasOwnProperty.call(nested, key) && (nested[key] === newValue)) ||
          (newValue === undefined && !(key in nested))) {
          nested[key] = newValue;
        }
      }
      nested = nested[key];
    }

    return object;
  },
  /**
   * Merge one object with another.
   * This is expensive, use as little as possible.
   * @param  {Object} obj1
   * @param  {Object} obj2
   * @return {Object}      merged object
   */
  merge: (obj1, obj2) => {
    const mergedObj = Object.assign({}, obj1, obj2);
    for (const prop in obj2) {
      if (Object.prototype.hasOwnProperty.call(mergedObj, prop)) {
        if (Array.isArray(obj2[prop])) {
          // eslint-disable-next-line
          if (obj1) {
            if (Array.isArray(obj1[prop])) {
              mergedObj[prop] = obj1[prop].concat(obj2[prop]);
            } else {
              mergedObj[prop] = obj2[prop];
            }
          } else {
            mergedObj[prop] = obj2[prop];
          }
        } else if (typeof obj2[prop] === 'object') {
          mergedObj[prop] = helpers.merge(obj1[prop], obj2[prop]);
        } else {
          mergedObj[prop] = obj2[prop];
        }
      }
    }
    return mergedObj;
  }

};

export default helpers;
