'use strict';
import '../sass/formeo.scss';
import animate from './common/animation';
import h from './common/helpers';
import {closest, getString} from './common/utils';
import {data, formData} from './common/data';
import events from './common/events';
import actions from './common/actions';
import dom from './common/dom';
import {Controls} from './components/controls';
import Stage from './components/stage';

// Simple object config for the main part of formeo
const formeo = {
  get formData() {
    return data.json;
  }
};
let opts = {};

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
  constructor(options, userFormData = null) {
    // Default options
    const defaults = {
      allowEdit: true,
      dataType: 'json',
      localStorage: true,
      container: '.formeo-wrap',
      prefix: 'formeo-',
      // svgSprite: null, // change to null
      iconFontFallback: null, // 'glyphicons' || 'font-awesome' || 'fontello'
      events: {},
      actions: {},
      controls: {},
      config: {
        rows: {},
        columns: {},
        fields: {}
      }
    };

    let _this = this;

    _this.container = options.container || defaults.container;
    dom.container = _this.container;
    dom.sitekey = options.sitekey || '';
    dom.prourl = options.prourl || '';
    dom.get_pro_demo_url = options.get_pro_demo_url || function() {
      return 'https://www.youtube.com/embed/skkRW4ZOo18';
    };
    this.resetForm = options.resetForm || false;
    if (typeof _this.container === 'string') {
      _this.container = document.querySelector(_this.container);
    }

    // Remove `container` property before extending because container
    // may be Element
    delete options.container;

    opts = h.merge(defaults, options);
    data.init(opts, userFormData);
    events.init(opts.events);
    actions.init(opts.actions);
    formeo.dom = dom;
    formeo.reset = data.reset;
    // Load remote resources such as css and svg sprite
    _this.loadResources().then(() => {
      dom.setConfig = opts.config;
      formeo.render = renderTarget => dom.renderForm.call(dom, renderTarget);
      if (opts.allowEdit) {
        formeo.edit = _this.init.bind(_this);
        _this.init.call(_this);
      }
      return;
    }).catch(error => {
      dom.alert('danger', error.message);
    });
    return formeo;
  }

  /**
   * Load remote resources
   * @return {Promise} asynchronously loaded remote resources
   */
  loadResources() {
    let promises = [];

    if (opts.style) {
      promises.push(h.ajax(opts.style, h.insertStyle));
    }

    let svgSprite = document.getElementById('formeo-sprite');
    // Ajax load svgSprite and inject into markup.
    if (opts.svgSprite && svgSprite == null) {
      promises.push(h.ajax(opts.svgSprite, h.insertIcons));
    }

    return window.Promise.all(promises);
  }

  /**
   * Return form settings container
   * @return {Object} formSettings
   */
  getFormSettings() {
    let defaultSettings = dom.getFormDefaultSettings();
    let formSettings = formData.settings.get('formSettings');
    if (typeof formSettings == 'undefined') {
      formSettings = defaultSettings;
    }
    formData.settings.set('formSettings', formSettings);
    data.save();
    let settings = {
      tag: 'ul',
      attrs: {
        className: 'form-settings-edit'
      },
      content: []
    };
    for (let [category, group] of Object.entries(formSettings)) {
      let container = dom.getConfigContainer(category, false);
      for (let [id, setting] of Object.entries(group)) {
        container.content[1].content.push(dom.getSettingItem(id, setting, defaultSettings[category][id], 'formSettings', 'form-config', category));
      }
      settings.content.push(container);
    }
    return settings;
  }

  /**
   * Return form setting toggle control
   * @return {Object} edit button to toggle between form design and settings
   */
  getFormSettingControl() {
    let edit = {
      tag: 'button',
      content: dom.icon('edit'),
      attrs: {
        className: ['btn btn-primary item-edit-toggle'],
        type: 'button'
      },
      meta: {
        id: 'edit'
      },
      action: {
        click: evt => {
          let element = closest(evt.target, 'formeo-editor');
          let fType = 'form-settings';
          let editClass = 'editing-' + fType;
          let editWindow = element.querySelector(`.${fType}-edit`);
          if (element.classList.contains(editClass)) {
            animate.slideUp(editWindow, 666, function() {
              animate.slideDown(editWindow.nextSibling, 666, function() {
                element.classList.remove(editClass);
              });
            });
          } else {
            animate.slideUp(editWindow.nextSibling, 666, function() {
              animate.slideDown(editWindow, 666, function() {
                element.classList.add(editClass);
              });
            });
          }
        }
      }
    };
    let resetform = {
      tag: 'button',
      content: [{
        tag: 'i',
        attrs: {
          className: 'fa fa-repeat',
          'aria-hidden': true
        }
      }],
      attrs: {
        className: 'btn btn-warning item-reset-form',
        type: 'button'
      },
      action: {
        click: evt => {
          if (formData.rows.size || formData.stages.size) {
            let confirmClearAll = new CustomEvent('confirmReset', {
              detail: {
                confirmationMessage: getString('confirmresetform'),
                resetAction: this.resetForm,
                btnCoFrds: dom.coords(evt.target),
                rows: dom.rows,
                rowCount: dom.rows.size
              }
            });
            document.dispatchEvent(confirmClearAll);
          } else {
            dom.alert('info', getString('nofields'));
          }
        }
      },
      meta: {
        id: 'delete'
      }
    };
    return {
      tag: 'div',
      className: 'form-settings-actions group-actions',
      content: [{
        tag: 'div',
        className: 'action-btn-wrap',
        content: [resetform, edit]
      }]
    };
  }

  /**
   * Formeo initializer
   * @return {Object} References to formeo instance,
   * dom elements, actions events and more.
   */
  async init() {
    let _this = this;
    _this.formID = formData.id;
    formeo.controls = new Controls(opts.controls, _this.formID);
    _this.stages = _this.buildStages();
    _this.formSettings = _this.getFormSettings();
    _this.formSettingControl = _this.getFormSettingControl();
    _this.render();

    return formeo;
  }

  /**
   * Generate the stages we will drag out elements to
   * @return {Object} stages map
   */
  buildStages() {
    let stages = [];
    const createStage = stageID => new Stage(opts, stageID);
    if (formData.stages.size) {
      formData.stages.forEach((stageConf, stageID) => {
        stages.push(createStage(stageID));
      });
    } else {
      stages.push(createStage());
    }
    stages[0].classList.add('active');
    stages[0].classList.add('show');
    return stages;
  }

  /**
   * Render the formeo sections
   * @return {void}
   */
  render() {
    let _this = this;
    let controls = formeo.controls.element;
    let content = [];
    content.push(_this.stages);
    let elemConfig = {
      tag: 'div',
      className: 'formeo formeo-editor tab-content',
      attrs: {
        id: _this.formID
      },
      content: [controls, {
        tag: 'div',
        className: 'form-wrapper',
        content: [_this.formSettingControl, _this.formSettings, {
          tag: 'div',
          className: 'form-container',
          content: content
        }]
      }]
    };

    let formeoElem = dom.create(elemConfig);

    _this.container.innerHTML = '';
    _this.container.appendChild(formeoElem);
    // Reposition all panels when body size changes
    let body = document.getElementsByTagName('body')[0];
    body.onresize = function(event) {
      let container = document.getElementsByClassName('formeo-editor')[0];
      dom.repositionPanels(container);
    };
    events.formeoLoaded = new CustomEvent('formeoLoaded', {
      detail: {
        formeo: formeo
      }
    });
    document.dispatchEvent(events.formeoLoaded);
    dom.toggleFormDeleteAction();
    dom.checkSingle();
  }
}

if (window !== undefined) {
  window.Formeo = Formeo;
}

export default Formeo;
