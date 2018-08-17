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
    let safeAttr = {
      className: 'class'
    };

    return safeAttr[name] || helpers.hyphenCase(name);
  },
  insertStyle: response => {
    let formeoStyle = dom.create({
      tag: 'style',
      content: response.responseText
    });
    document.head.appendChild(formeoStyle);
  },
  // nicer syntax for checking the existence of an element in an array
  inArray: (needle, haystack) => {
    return haystack.indexOf(needle) !== -1;
  },
  // forEach that can be used on nodeList
  forEach: (array, callback, scope) => {
    for (let i = 0; i < array.length; i++) {
      callback.call(scope, array[i], i);
    }
  },

  // basic map that can be used on nodeList
  map: (arr, callback, scope) => {
    let newArray = [];
    helpers.forEach(arr, (elem, i) => newArray.push(callback(i)));

    return newArray;
  },
  subtract: (arr, from) => {
    return from.filter(function(a) {
      return !~this.indexOf(a);
    }, arr);
  },
  // find the index of one node in another
  indexOfNode: (node, parent) => {
    let parentElement = parent || node.parentElement;
    let nodeList = Array.prototype.slice.call(parentElement.childNodes);
    return nodeList.indexOf(node);
  },
  // Tests if is whole number. returns false if n is Float
  isInt: (n) => {
    return Number(n) === n && n % 1 === 0;
  },
  /**
   * get nested property value in an object
   *
   * @private
   * @param {Object} object The object to query.
   * @param {String} path The path of the property to get.
   * @return {String|Array|Object} Returns the resolved value.
   */
  get: (object, path) => {
    path = stringToPath(path);

    let index = 0;
    let length = path.length;

    while (object != null && index < length) {
      object = object[path[index++]];
    }

    return (index && index === length) ? object : undefined;
  },
  set: (object, path, value, customizer) => {
    path = stringToPath(path);

    let index = -1;
    let length = path.length;
    let lastIndex = length - 1;
    let nested = object;

    while (nested !== null && ++index < length) {
      let key = path[index];
      if (typeof nested === 'object') {
        let newValue = value;
        if (index !== lastIndex) {
          let objValue = nested[key];
          newValue = customizer ? customizer(objValue, key, nested) : undefined;
          if (newValue === undefined) {
            newValue = objValue === null ? [] : objValue;
          }
        }

        if (!(hasOwnProperty.call(nested, key) && (nested[key] === newValue)) ||
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
    let mergedObj = Object.assign({}, obj1, obj2);
    for (let prop in obj2) {
      if (mergedObj.hasOwnProperty(prop)) {
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
