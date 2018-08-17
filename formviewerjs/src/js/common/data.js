'use strict';
import {
  strMapToObj,
  objToStrMap,
  uuid
} from './utils';
// Object map of fields on the stage
const _data = {};
let formData;
let formOpts;

// Registered fields are the fields that are configured on init.
// This variable acts as a data buffer thats contains
// the configurations for a field's final view.
let registeredFields = {};

let data = {
  init: (opts, userFormData) => {
    let defaultFormData = {
      id: uuid(),
      settings: new Map(),
      stages: new Map(),
      rows: new Map(),
      columns: new Map(),
      fields: new Map()
    };
    _data.opts = opts;
    formOpts = opts;
    let processFormData = data => {
      if (typeof data === 'string') {
        data = window.JSON.parse(data);
      }

      data.settings = objToStrMap(data.settings);
      data.stages = objToStrMap(data.stages);
      data.rows = objToStrMap(data.rows);
      data.columns = objToStrMap(data.columns);
      data.fields = objToStrMap(data.fields);

      formData = Object.assign({}, defaultFormData, data);
    };

    if (userFormData) {
      processFormData(userFormData);
    } else if (window.localStorage && _data.opts.localStorage) {
      let localFormData = window.localStorage.getItem('formData');
      if (localFormData) {
        processFormData(localFormData);
      }
    }

    if (!formData) {
      formData = defaultFormData;
    }

    return formData;
  },

  get js() {
    let jsData = {};

    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string') {
        jsData[key] = formData[key];
      } else {
        jsData[key] = strMapToObj(formData[key]);
      }
    });
    return jsData;
  },

  get prepData() {
    let jsData = data.js;
    Object.keys(jsData).forEach(type => {
      Object.keys(jsData[type]).forEach(entKey => {
        let entity = jsData[type][entKey];
        if (entity.action) {
          Object.keys(entity.action).forEach(fn => {
            entity.action[fn] = entity.action[fn].toString();
          });
        }
      });
    });
    return jsData;
  },

  /**
   * getter method for JSON formData
   * @return {JSON} formData
   */
  get json() {
    let preppedData = data.prepData;

    return window.JSON.stringify(preppedData, null, '\t');
  }
};

export {
  data,
  formData,
  formOpts,
  registeredFields
};
