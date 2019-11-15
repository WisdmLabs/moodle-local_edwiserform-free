import uuidv4 from 'uuid-v4';
/**
 * Match the values from a string or array against a str.
 * @param  {String} str    String we are searching
 * @param  {String|Array}  filter String or array of values to match
 * @return {Boolean}        [description]
 */
export const match = (str = '', filter) => {
  if (!filter) {
    console.warn('utils.match missing argument 2.');
    return false;
  }
  const matchOperators = /[|\\{}()[\]^*$+?.]/g;
  let filterArray = (typeof filter === 'string') ? [filter] : filter;
  filterArray = filterArray.map(filterStr => {
    return filterStr === '*' ? '' : filterStr.replace(matchOperators, '\\$&');
  });

  let isMatch = true;
  if (filterArray.length) {
    isMatch = !str.match(new RegExp(filterArray.join('|'), 'i'));
  }

  return isMatch;
};

/**
 * Removes a value from an array
 * @param  {Array} arr
 * @param  {String|Number} val
 */
export const remove = (arr, val) => {
  const index = arr.indexOf(val);

  if (index > -1) {
    arr.splice(index, 1);
  }
};

/**
 * Find the closest parent by class
 * @param  {Object} el  DOM element
 * @param  {String} cls class
 * @return {Object}     DOM Element
 */
export const closest = (el, cls) => {
  const className = cls.replace('.', '');
  while ((el = el.parentElement) && !el.classList.contains(className));
  return el;
};

/**
 * Find the closest parent by class
 * @param  {Object} el  DOM element
 * @param  {String} cls class
 * @return {Object}     DOM Element
 */
export const closestFtype = el => {
  while ((el = el.parentElement) && !el.fType);
  return el;
};

export const elementTagType = el => {
  const element = {
    tag: el.tagName
  };
  if (el.tagName == 'INPUT') {
    element.type = el.type;
  }
  return element;
};


/**
 * Remove duplicates from an array of elements
 * @param  {Array} array with possible duplicates
 * @return {Array} array with only unique values
 */
export const unique = array =>
  array.filter((elem, pos, arr) =>
    (arr.indexOf(elem) === pos));

export const objToStrMap = obj => {
  const strMap = new Map();
  for (const k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
};

export const strMapToObj = strMap => {
  const obj = Object.create(null);
  strMap.forEach((v, k) => {
    obj[k] = v;
  });
  return obj;
};

export const uuid = elem => {
  let id;
  if (elem) {
    const {attrs = {}} = elem;
    id = attrs.id || elem.id || uuidv4();
    elem.id = id;
  } else {
    id = uuidv4();
  }
  return id;
};


/**
 * Clone object and return its copy
 * @param  {Object} obj Object to be cloned
 * @return {Object}     Cloned object
 */
export const clone = obj => {
  let copy;

  // Handle the 4 simple types, and null or undefined
  if (null === obj || 'object' !== typeof obj) {
    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (const attr in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, attr)) {
        copy[attr] = clone(obj[attr]);
      }
    }
    return copy;
  }
  return obj;
};

export const numToPercent = num => num.toString() + '%';

export const numberBetween = (num, min, max) => (num > min && num < max);

/**
 * Empty an objects contents
 * @param  {Object} obj
 * @return {Object} fresh
 */
export const cleanObj = obj => {
  const fresh = Object.assign({}, obj);
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      fresh[key] = '';
    } else if (typeof obj[key] === 'boolean') {
      fresh[key] = false;
    }
  });
  return fresh;
};

export const clicked = (x, y, position, button) => {
  const xMin = position.x - 5;
  const xMax = position.x + 5;
  const yMin = position.y - 5;
  const yMax = position.y + 5;
  const xOK = numberBetween(x, xMin, xMax);
  const yOK = numberBetween(y, yMin, yMax);

  return (xOK && yOK && button !== 2);
};

/**
 * Return string from local_edwiserform or id
 * @param {String} id of string
 * @return {String} string
 */
export const getString = id => {
  const M = window.M;
  const string = M.util.get_string(id, 'local_edwiserform');
  if (string == '[[' + id + ',local_edwiserform]]') {
    if (string.indexOf('.') != -1) {
      id = id.split('.');
      id = id.slice(id.length - 1)[0];
    }
    id = id.charAt(0).toUpperCase() + id.slice(1);
    return id;
  }
  return string;
};


/**
 * Cache results of expensive functions
 * @param  {Function} fn
 * @param  {Function} resolver
 * @return {String|Object} memoized
 */
export const memoize = (fn, resolver) => {
  if (typeof fn !== 'function' ||
    (resolver && typeof resolver !== 'function')) {
    throw new TypeError('memoize: First argument must be a function');
  }
  const memoized = (...args) => {
    const key = resolver ? resolver.apply(memoized, args) : args[0];
    const cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(memoized, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize.Cache)();
  return memoized;
};

// Assign cache to `_.memoize`.
memoize.Cache = Map;
