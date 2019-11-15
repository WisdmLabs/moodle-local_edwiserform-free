'use strict';
import dom from './dom';
import {unique} from './utils';

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

const decodeEntities = (function() {
  const cache = {};
  let character;
  const e = document.createElement('div');
  return function(html) {
    return html.replace(/([&][^&; ]+[;])/g, function(entity) {
      character = cache[entity];
      if (!character) {
        e.innerHTML = entity;
        if (e.childNodes[0]) {
          character = cache[entity] = e.childNodes[0].nodeValue;
        } else {
          character = '';
        }
      }
      return character;
    });
  };
})();

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
  ajax: (file, callback) => {
    return new window.Promise(function(resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', file, true);
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          callback(xhr);
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function() {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });
  },
  insertIcons: response => {
    const id = 'formeo-sprite';
    const iconSpriteWrap = dom.create({
      tag: 'div',
      content: response.responseText,
      id
    });
    iconSpriteWrap.style.display = 'none';
    const existingSprite = document.getElementById(id);
    if (existingSprite) {
      existingSprite.parentElement.replaceChild(iconSpriteWrap, existingSprite);
    } else {
      document.body.insertBefore(iconSpriteWrap, document.body.childNodes[0]);
    }
  },
  insertStyle: response => {
    const formeoStyle = dom.create({
      tag: 'style',
      content: response.responseText
    });
    document.head.appendChild(formeoStyle);
  },
  capitalize: str => {
    return str.replace(/\b\w/g, function(m) {
      return m.toUpperCase();
    });
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
  // Added because Object.assign is mutating objects.
  // Maybe a babel polyfill issue?
  copyObj: obj => {
    return (window.JSON.parse(window.JSON.stringify(obj)));
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
  },

  /**
   * Orders an array of objects by specific attribute
   * @param  {Array}  elements  Array of element objects
   * @param  {Array}  order     array of keys to order objects by
   * @param  {String} path      string path to property to order by
   * @return {Array}            Ordered Array of Element Objects
   */
  orderObjectsBy: (elements, order, path) => {
    const objOrder = unique(order);
    const newOrder = objOrder.map(key => {
      return elements.filter(function(elem) {
        const propVal = helpers.get(elem, path);
        return propVal === key;
      })[0];
    }).filter(Boolean);
    const orderedElements = newOrder.concat(elements);

    return unique(orderedElements);
  },

  /**
   * Hide or show an Array or HTMLCollection of elements
   * @param  {Array} elems
   * @param  {String} term  match textContent to this term
   * @return {Array}        filtered elements
   */
  toggleElementsByStr: (elems, term) => {
    const filteredElems = [];
    helpers.forEach(elems, elem => {
      const txt = elem.textContent.toLowerCase();
      if (txt.indexOf(term.toLowerCase()) !== -1) {
        elem.style.display = 'block';
        filteredElems.push(elem);
      } else {
        elem.style.display = 'none';
      }
    });

    return filteredElems;
  },

  /**
   * Check if current browser is firefox or edge
   * @return {Boolean} True if browser is firefox or edge
   */
  isFireFoxEdge: () => {
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ||
      navigator.userAgent.toLowerCase().indexOf('trident') > -1;
  },

  /**
   * Returns the text from a HTML string
   *
   * @param  {String}    html The html string
   * @return {Boolean} Normal string without html tag
   */
  stripHtml: (html) => {
    // Create a new div element
    const temporalDivElement = document.createElement('div');
    // Set the HTML content with the providen
    temporalDivElement.innerHTML = decodeEntities(html);
    // Retrieve the text property of the element (cross-browser support)
    return temporalDivElement.textContent || temporalDivElement.innerText || '';
  },

  /**
   * Check whether current string is html or not
   *
   * @param  {String} string Input string
   * @return {Boolean}       True if string is html
   */
  isHtml: (string) => {
    const a = document.createElement('div');
    a.innerHTML = decodeEntities(string);
    for (let c = a.childNodes, i = c.length; i--;) {
      if (c[i].nodeType == 1) {
        return true;
      }
    }
    return false;
  }

};

export default helpers;
