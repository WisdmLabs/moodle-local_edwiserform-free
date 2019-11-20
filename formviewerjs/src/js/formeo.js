'use strict';
import {data} from './common/data';
import dom from './common/dom';

// Simple object config for the main part of formeo
const formeo = {
  get formData() {
    return data.json;
  }
};

/**
 * Main class
 */
class Formeo {
  /**
   * [constructor description]
   * @param  {Object} options  formeo options
   * @param  {String|Object}   userFormData [description]
   * @return {Object}          formeo references and actions
   */
  constructor(options, userFormData) {
    // Default options
    const defaults = {
      dataType: 'json',
      container: '.formeo-wrap',
      prefix: 'formeo-',
      actions: {},
      localStorage: true
    };
    const _this = this;

    _this.container = options.container || defaults.container;
    dom.container = _this.container;
    dom.sitekey = options.sitekey || '';
    if (typeof _this.container === 'string') {
      _this.container = document.querySelector(_this.container);
    }

    // Remove `container` property before extending because container
    // may be Element
    delete options.container;

    data.init(defaults, userFormData);
    formeo.dom = dom;
    formeo.render = renderTarget => dom.renderForm.call(dom, _this.container);
    return formeo;
  }
}

if (window !== undefined) {
  window.Formeo = Formeo;
  Formeo.dom = dom;
}

export default Formeo;
