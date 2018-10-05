import h from './helpers';
import {data, formData} from './data';
import {uuid, clone, getString, remove, elementTagType} from './utils';

/**
 * General purpose markup utilities and generator.
 */
class DOM {
  /**
   * Set defaults, store references to key elements
   * like stages, rows, columns etc
   */
  constructor() {
    // Maintain references to DOM nodes
    // so we don't have to keep doing getElementById
    this.stages = new Map();
    this.rows = new Map();
    this.columns = new Map();
    this.fields = new Map();
  }

  /**
   * Ensure elements have proper tagName
   * @param  {Object|String} elem
   * @return {Object} valid element object
   */
  processTagName(elem) {
    let tagName;
    if (typeof elem === 'string') {
      tagName = elem;
      elem = {tag: tagName};
    }
    if (elem.attrs) {
      let tag = elem.attrs.tag;
      if (tag) {
        let selectedTag = tag.filter(t => (t.selected === true));
        if (selectedTag.length) {
          tagName = selectedTag[0].value;
        }
      }
    }

    elem.tag = tagName || elem.tag;

    return elem;
  }

  /**
   * Creates DOM elements
   * @param  {Object}  elem      element config object
   * @return {Object}            DOM Object
   */
  create(elem) {
    elem = this.processTagName(elem);
    let _this = this;
    let contentType;
    let {tag} = elem;
    let processed = [];
    let i;
    let displayLabel = '';
    let formSettings = _this.getFormSettings();
    if (formSettings && formSettings.form) {
      displayLabel = formSettings.form['display-label'].value;
      switch (displayLabel) {
        case 'top':
          displayLabel = '';
          break;
        case 'left':
          displayLabel = 'single-line';
          break;
      }
    }
    let wrap = {
      tag: 'div',
      attrs: {},
      className: [h.get(elem, 'config.inputWrap') || 'f-field-group' + ' ' + displayLabel],
      content: [],
      config: {}
    };
    let requiredMark = {
      tag: 'span',
      className: 'text-error',
      content: '*'
    };
    let element = document.createElement(tag);
    let required = h.get(elem, 'attrs.required');

    /**
     * Object for mapping contentType to its function
     * @type {Object}
     */
    let appendContent = {
      string: content => {
        element.innerHTML += content;
      },
      object: content => {
        return element.appendChild(_this.create(content));
      },
      node: content => {
        return element.appendChild(content);
      },
      array: content => {
        for (let i = 0; i < content.length; i++) {
          contentType = _this.contentType(content[i]);
          appendContent[contentType](content[i]);
        }
      },
      function: content => {
        content = content();
        contentType = _this.contentType(content);
        appendContent[contentType](content);
      },
      undefined: () => null
    };

    processed.push('tag');


    // check for root className property
    if (elem.className) {
      let {className} = elem;
      elem.attrs = Object.assign({}, elem.attrs, {className});
      delete elem.className;
    }

    // check for id property
    if (elem.attrs && elem.attrs.id) {
      elem.id = elem.attrs.id;
    }

    // Append Element Content
    if (elem.options) {
      let {options} = elem;
      options = this.processOptions(options, elem);
      if (this.holdsContent(element) && tag !== 'button') {
        // mainly used for <select> tag
        appendContent.array.call(this, options);
        delete elem.content;
      } else {
        h.forEach(options, option => {
          wrap.content.push(_this.create(option));
        });

        if (elem.attrs.className) {
          wrap.className = elem.attrs.className;
        }
        if (typeof(wrap.className) == 'string') {
          wrap.className = [wrap.className];
        }
        wrap.config = Object.assign({}, elem.config);
        wrap.className.push = h.get(elem, 'attrs.className');


        if (required) {
          wrap.attrs.required = required;
        }

        return this.create(wrap);
      }

      processed.push('options');
    }


    if (elem.config) {
      if (elem.config.hasOwnProperty('recaptcha') && elem.config.recaptcha) {
        let clickEvent = function(response) {
          if (response) {
            let errorelem = document.querySelector('.g-recaptcha-error');
            errorelem.classList.remove('show');
          }
        };
        let renderCaptcha = new Function('element', 'key', 'hideError', 'grecaptcha.render(element, {sitekey: key, callback: hideError});');
        setTimeout(renderCaptcha(element, this.sitekey, clickEvent), 100);
      }
      if (elem.config.label && tag !== 'button') {
        let label;
        if (displayLabel == 'off') {
          elem.attrs.placeholder = 'label' in elem.config ? elem.config.label : '';
        }
        label = _this.label(elem);
        if (displayLabel != 'off' && required) {
          label.innerHTML = label.innerHTML + dom.create(requiredMark).outerHTML;
        }
        if (!elem.config.hideLabel) {
          if (_this.labelAfter(elem)) {
            // add check for inline checkbox
            wrap.className = `f-${elem.attrs.type}`;

            label.insertBefore(element, label.firstChild);
            wrap.content.push(label);
            if (required) {
              wrap.content.push(requiredMark);
            }
          } else {
            wrap.content.push(label);
            if (displayLabel == 'off' && required) {
              wrap.content.push(requiredMark);
            }
            wrap.content.push(element);
          }
        }
      }

      processed.push('config');
    }

    // Set element attributes
    if (elem.attrs) {
      _this.processAttrs(elem, element);
      processed.push('attrs');
    }

    // Append Element Content
    if (elem.content) {
      contentType = _this.contentType(elem.content);
      appendContent[contentType].call(this, elem.content);
      processed.push('content');
    }

    // Set the new element's dataset
    if (elem.dataset) {
      for (const data in elem.dataset) {
        if (elem.dataset.hasOwnProperty(data)) {
          element.dataset[data] = elem.dataset[data];
        }
      }
      processed.push('dataset');
    }

    // Add listeners for defined actions
    if (elem.action) {
      let actions = Object.keys(elem.action);
      for (i = actions.length - 1; i >= 0; i--) {
        let event = actions[i];
        let action = elem.action[event];
        if (typeof action === 'string') {
          action = eval(`(${elem.action[event]})`);
        }
        let useCaptureEvts = [
          'focus',
          'blur'
        ];

        // dirty hack to handle onRender callback
        if (event === 'onRender') {
          setTimeout(() => {
            action(element);
          }, 10);
        } else {
          let useCapture = h.inArray(event, useCaptureEvts);
          element.addEventListener(event, action, useCapture);
        }
      }
      processed.push('action');
    }

    let fieldDataBindings = [
      'stage',
      'row',
      'column',
      'field'
    ];

    if (h.inArray(elem.fType, fieldDataBindings)) {
      let dataType = elem.fType + 'Data';
      element[dataType] = elem;
      processed.push(dataType);
    }

    // Subtract processed and ignored and attach the rest
    let remaining = h.subtract(processed, Object.keys(elem));
    for (i = remaining.length - 1; i >= 0; i--) {
      element[remaining[i]] = elem[remaining[i]];
    }

    if (wrap.content.length) {
      element = this.create(wrap);
    }

    return element;
  }

  /**
   * JS Object to DOM attributes
   * @param  {Object} elem    element config object
   * @param  {Object} element DOM element we are building
   * @return {void}
   */
  processAttrs(elem, element) {
    let {attrs = {}} = elem;
    delete attrs.tag;

    // Set element attributes
    Object.keys(attrs).forEach(attr => {
      let name = h.safeAttrName(attr);
      let value = attrs[attr] || '';
      if (Array.isArray(value)) {
        if (typeof value[0] === 'object') {
          let selected = value.filter(t => (t.selected === true));
          value = selected.length ? selected[0].value : value[0].value;
        } else {
          value = value.join(' ');
        }
      }
      if (value) {
        element.setAttribute(name, value);
        if (name == 'validation') {
          element.setCustomValidity(value);
        }
      }
    });
  }

  /**
   * Extend Array of option config objects
   * @param  {Array} options
   * @param  {Object} elem element config object
   * @return {Array} option config objects
   */
  processOptions(options, elem) {
    let {action, attrs} = elem;
    let fieldType = attrs.type || elem.tag;
    let id = attrs.id || elem.id;

    let optionMap = (option, i) => {
      const defaultInput = () => {
        let input = {
          tag: 'input',
          attrs: {
            id: id + i,
            name: attrs.name,
            type: fieldType,
            value: option.value || ''
          },
          action
        };
        let checkable = {
          tag: 'span',
          className: 'checkable',
          content: option.label
        };
        let optionLabel = {
          tag: 'label',
          attrs: {},
          config: {
            inputWrap: 'form-check'
          },
          content: [option.label]
        };
        let inputWrap = {
          tag: 'div',
          content: [optionLabel],
          className: [`f-${fieldType}`]
        };

        if (elem.attrs.className) {
          elem.config.inputWrap = elem.attrs.className;
        }

        if (elem.config.inline) {
          inputWrap.className.push('f-${fieldType}-inline');
        }

        if (option.selected) {
          input.attrs.checked = true;
        }

        if (option.name) {
          input.attrs.name = option.name;
        }
        optionLabel.content = checkable;
        optionLabel = dom.create(optionLabel);
        input = dom.create(input);
        optionLabel.insertBefore(input, optionLabel.firstChild);
        inputWrap.content = optionLabel;
        return inputWrap;
      };

      let optionMarkup = {
        select: () => {
          return {
            tag: 'option',
            attrs: option,
            content: option.label
          };
        },
        button: option => {
          let {type, label, className, id} = option;
          return Object.assign({}, elem, {
            attrs: {
              type
            },
            className,
            id: id || uuid(),
            options: undefined,
            content: label,
            action: elem.action
          });
        },
        checkbox: defaultInput,
        radio: defaultInput,
        datalist: () => {
          return {
            tag: 'option',
            attrs: {value: option.value},
            content: option.value
          };
        },
      };
      return optionMarkup[fieldType](option);
    };

    const mappedOptions = options.map(optionMap);

    return mappedOptions;
  }

  /**
   * Checks if there is a closing tag, if so it can hold content
   * @param  {Object} element DOM element
   * @return {Boolean} holdsContent
   */
  holdsContent(element) {
    return (element.outerHTML.indexOf('/') !== -1);
  }

  /**
   * Is this a textarea, select or other block input
   * also isContentEditable
   * @param  {Object}  element
   * @return {Boolean}
   */
  isBlockInput(element) {
    return (!this.isInput(element) && this.holdsContent(element));
  }

  /**
   * Determine if an element is an input field
   * @param  {String|Object} tag tagName or DOM element
   * @return {Boolean} isInput
   */
  isInput(tag) {
    if (typeof tag !== 'string') {
      tag = tag.tagName;
    }
    return (['input', 'textarea', 'select'].indexOf(tag) !== -1);
  }

  /**
   * Converts escaped HTML into usable HTML
   * @param  {String} html escaped HTML
   * @return {String}      parsed HTML
   */
  parsedHtml(html) {
    let escapeElement = document.createElement('textarea');
    escapeElement.innerHTML = html;
    return escapeElement.textContent;
  }

  /**
   * Test if label should be display before or after an element
   * @param  {Object} elem config
   * @return {Boolean} labelAfter
   */
  labelAfter(elem) {
    let type = h.get(elem, 'attrs.type');
    let isCB = (type === 'checkbox' || type === 'radio');
    return isCB || h.get(elem, 'config.labelAfter');
  }

  /**
   * Generate a label
   * @param  {Object} elem config object
   * @param  {String} fMap map to label's value in formData
   * @return {Object}      config object
   */
  label(elem, fMap) {
    let fieldLabel = {
      tag: 'label',
      attrs: {},
      className: [],
      content: elem.config.label,
      action: {}
    };

    if (this.labelAfter(elem)) {
      let checkable = {
        tag: 'span',
        className: 'checkable',
        content: elem.config.label
      };
      fieldLabel.content = checkable;
    }

    if (elem.id) {
      fieldLabel.attrs.for = elem.id;
    }

    if (fMap) {
      // for attribute will prevent label focus
      delete fieldLabel.attrs.for;
      fieldLabel.attrs.contenteditable = true;
      fieldLabel.fMap = fMap;
    }

    return dom.create(fieldLabel);
  }

  /**
   * Determine content type
   * @param  {Node | String | Array | Object} content
   * @return {String}
   */
  contentType(content) {
    let type = typeof content;
    if (content instanceof Node || content instanceof HTMLElement) {
      type = 'node';
    } else if (Array.isArray(content)) {
      type = 'array';
    }

    return type;
  }

  /**
   * Get the computed style for DOM element
   * @param  {Object}  elem     dom element
   * @param  {Boolean} property style eg. width, height, opacity
   * @return {String}           computed style
   */
  getStyle(elem, property = false) {
    let style;
    if (window.getComputedStyle) {
      style = window.getComputedStyle(elem, null);
    } else if (elem.currentStyle) {
      style = elem.currentStyle;
    }

    return property ? style[property] : style;
  }

  /**
   * Retrieves an element by config object, string id,
   * or existing reference
   * @param  {Object|String|Node} elem
   * @return {Object}             DOM element
   */
  getElement(elem) {
    let getElement = {
        node: () => elem,
        object: () => document.getElementById(elem.id),
        string: () => document.getElementById(elem)
      };
    let type = this.contentType(elem);
    let element = getElement[type]();

    return element;
  }

  /**
   * Removes element from DOM and data
   * @param  {Object} elem
   * @return  {Object} parent element
   */
  remove(elem) {
    let {fType, id} = elem;
    if (fType) {
      let parent = elem.parentElement;
      let pData = formData[parent.fType].get(parent.id);
      data.empty(fType, id);
      this[fType].delete(id);
      formData[fType].delete(id);
      remove(pData[fType], id);
    }
    return elem.parentElement.removeChild(elem);
  }

  /**
   * Util to remove contents of DOM Object
   * @param  {Object} elem
   * @return {Object} element with its children removed
   */
  empty(elem) {
    while (elem.firstChild) {
      this.remove(elem.firstChild);
    }
    return elem;
  }

  /**
   * Wrap content in a formGroup
   * @param  {Object|Array|String} content
   * @param  {String} className
   * @return {Object} formGroup config
   */
  formGroup(content, className = '') {
    return {
      tag: 'div',
      className: ['f-field-group', className],
      content: content
    };
  }

  /**
   * Updates the column preset <select>
   * @param  {String} row
   * @return {Object} columnPresetConfig
   */
  updateColumnPreset(row) {
    let _this = this;
    let oldColumnPreset = row.querySelector('.column-preset');
    let rowEdit = oldColumnPreset.parentElement;
    let columnPresetConfig = _this.columnPresetControl(row.id);
    let newColumnPreset = _this.create(columnPresetConfig);

    rowEdit.replaceChild(newColumnPreset, oldColumnPreset);
    return columnPresetConfig;
  }

  /**
   * [processColumnConfig description]
   * @param  {[type]} columnData [description]
   * @return {[type]}         [description]
   */
  processColumnConfig(columnData) {
    if (columnData.className) {
      columnData.className.push('f-render-column');
    }
    let colWidth = columnData.config.width || '100%';
    columnData.style = `width: ${colWidth}`;
    return columnData;
  }

  /**
   * @param {Dom} element to verify element data is valid or not
   * @return {Boolean} is valid or not
   */
  checkValidity(element) {
    if (element.className == 'g-recaptcha') {
      let recaptchaResponse = new Function('return grecaptcha.getResponse();');
      let response = recaptchaResponse() != '';
      let errormessage = getString('recaptcha-error');
      if (element.hasAttribute('validation')) {
        errormessage = element.getAttribute('validation');
      }
      if (response) {
        if (element.nextSibling) {
          element.nextSibling.classList.remove('show');
        }
      } else {
        if (element.nextSibling) {
          element.nextSibling.classList.add('show');
        } else {
          let error = this.create({
            tag: 'div',
            className: 'g-recaptcha-error show',
            content: errormessage
          });
          element.after(error);
        }
      }
      return response;
    }
    if (element.hasChildNodes()) {
      for (let i = 0; i < element.children.length; i++) {
        if (!this.checkValidity(element.children[i])) {
          return false;
        }
      }
    } else if (typeof element.checkValidity == 'function') {
      element.setCustomValidity('');
      if (element.checkValidity()) {
        return true;
      }
      if (element.hasAttribute('validation')) {
        element.setCustomValidity(element.getAttribute('validation'));
      }
      return element.reportValidity(); // Reporting error if input is not valid
    }
    return true;
  }

  /**
   * @param {Integer} next step
   * @param {Integer} count Maximum number of steps
   * @param {Object} classes
   * @param {Boolean} valid is current step elements are valid or not
   */
  updateStageSteps(next, count, classes, valid = true) {
    let steps =document.querySelectorAll('.wfb-steps .' + classes.step);
    for (let i = 0; i < next; i++) {
      steps[i].className = classes.complete;
    }
    if (next < count) {
      steps[next].className = valid ? classes.active : classes.danger;
      for (let i = next + 1; i < count; i++) {
        steps[i].className = classes.step;
      }
    }
  }

  /**
   * @param {Event} event Cliking event of next and previous button
   * @param {Dom} renderTarget rendering target dom element
   * @param {Object} classes
   * @param {Integer} action Eigther change to next stage or previous
   */
  changeStep(event, renderTarget, classes, action) {
    let activeStage = document.getElementsByClassName('f-stage active')[0];
    let stageDiv = renderTarget.getElementsByClassName('formeo-render')[0];
    let stages = Array.prototype.slice.call(stageDiv.children);
    let current = stages.indexOf(activeStage);
    let next = current + action;
    let count = stages.length;
    let valid = false;
    if (next >= 0 && next < count) {
      valid = this.checkValidity(stages[current]);
      if (next < current || valid) {
        this.updateStageSteps(next, count, classes);
        stages[next].classList.add('active');
        stages[next].classList.remove('d-none');
        stages[current].classList.remove('active');
        stages[current].classList.add('d-none');
        if (next > 0) {
          document.getElementById('previous-step').classList.remove('d-none');
        } else {
          document.getElementById('previous-step').classList.add('d-none');
        }
        if (next < count - 1) {
          document.getElementById('next-step').classList.remove('d-none');
          document.getElementById('submit-form').classList.add('d-none');
        } else {
          document.getElementById('next-step').classList.add('d-none');
          document.getElementById('submit-form').classList.remove('d-none');
        }
      } else if (!valid) {
        this.updateStageSteps(current, count, classes, false);
      }
      event.preventDefault();
    }
    if (next == count) {
      this.updateStageSteps(next, count, classes);
    }
  }

  /**
   * Returning the default configuration for steps
   * @return {Object} stepConfiguration
   */
  getTabDefaultConfigs() {
    let generalStepConfig = {
      'class': {
        title: getString('class'),
        id: 'class',
        type: 'text',
        value: 'wfb-step'
      },
      'background-color': {
        title: getString('backgroundcolor'),
        id: 'background-color',
        type: 'color',
        value: '#838b8e'
      },
      'border-color': {
        title: getString('bordercolor'),
        id: 'border-color',
        type: 'color',
        value: '#838b8e'
      },
      'color': {
        title: getString('textcolor'),
        id: 'color',
        type: 'color',
        value: '#ffffff' // Removed extra settings
      }
    };
    let completeStepConfig = {
      'class': {
        title: getString('class'),
        id: 'class',
        type: 'text',
        value: 'wfb-step completed'
      },
      'border-color': {
        title: getString('bordercolor'),
        id: 'border-color',
        type: 'color',
        value: '#46be8a'
      },
      'background-color': {
        title: getString('backgroundcolor'),
        id: 'background-color',
        type: 'color',
        value: '#46be8a'
      },
      'color': {
        title: getString('textcolor'),
        id: 'color',
        type: 'color',
        value: '#ffffff'
      }
    };
    let activeStepConfig = {
      'class': {
        title: getString('class'),
        id: 'class',
        type: 'text',
        value: 'wfb-step active'
      },
      'border-color': {
        title: getString('bordercolor'),
        id: 'border-color',
        type: 'color',
        value: '#62a8ea'
      },
      'background-color': {
        title: getString('backgroundcolor'),
        id: 'background-color',
        type: 'color',
        value: '#62a8ea'
      },
      'color': {
        title: getString('textcolor'),
        id: 'color',
        type: 'color',
        value: '#ffffff'
      }
    };
    let dangerStepConfig = {
      'class': {
        title: getString('class'),
        id: 'class',
        type: 'text',
        value: 'wfb-step danger'
      },
      'border-color': {
        title: getString('bordercolor'),
        id: 'border-color',
        type: 'color',
        value: '#d9534f'
      },
      'background-color': {
        title: getString('backgroundcolor'),
        id: 'background-color',
        type: 'color',
        value: '#d9534f'
      },
      'color': {
        title: getString('textcolor'),
        id: 'color',
        type: 'color',
        value: '#ffffff'
      }
    };
    return {
      default: generalStepConfig,
      complete: completeStepConfig,
      active: activeStepConfig,
      danger: dangerStepConfig
    };
  }

  /**
   * extrastyle for tabs
   * @param {String} type of step
   * @param {String} composedClass
   * @param {Object} obj
   * @return {String} extra styles
   */
  getExtraStyles(type, composedClass, obj) {
    let style = '';
    // Applying background color as border color because arrow's start and end have only border
    let backgroundColor = obj[type]['background-color'].value;
    switch (type) {
      case 'active':
        style += '} ';
        style += composedClass + ':before {';
        style += 'border-color: ' + backgroundColor + ';';
        style += 'border-left-color: transparent; }';
        style += composedClass + ':after {';
        style += 'border-left-color: ' + backgroundColor + '; ';
        break;
      case 'complete':
        style += '} ';
        style += composedClass + ':before {';
        style += 'border-color: ' + backgroundColor + ';';
        style += 'border-left-color: transparent; }';
        style += composedClass + ':after { border-color: transparent;';
        style += 'border-left-color: ' + backgroundColor + '; ';
        break;
      default:
        style += 'border-width: 2px; display: inline-block; text-align: center; font-size: 1rem; font-weight: 300; line-height: 1.571429; padding: .429rem 1rem; margin: 1px; vertical-align: middle; position:relative; margin-left:25px;}';
        style += composedClass + ':before { content: ""; position:absolute; left:-1.2rem; top:0px; border-width:1.21rem; border-style:solid; border-right-width:1px; ';
        style += 'border-color:' + backgroundColor + ';';
        style += ' border-left-color:transparent; }';
        style += composedClass + ':after { content: ""; position: absolute; right: -2.39rem; top: 0px; border-width: 1.2rem; border-style: solid; border-color: transparent; ';
        style += 'border-left-color: ' + backgroundColor + ';';
        style += '}';
        style += composedClass + ':first-child { border-top-left-radius: .215rem; border-bottom-left-radius: .215rem}';
        style += composedClass + ':last-child { border-top-right-radius: .215rem; border-bottom-right-radius: .215rem}';
        break;
    }
    return style;
  }

  /**
   * returning the step classes for general|active|completed step
   * @param {String} type of step
   * @param {Object} obj
   */
  processStepClasses(type, obj) {
    let _this = this;
    let style = '';
    let styles = document.getElementById('wfb-styles-for-' + type);
    let classes = obj[type].class.value.trim();
    classes = classes.split(' ');
    let composedClass = '';
    classes.forEach(function(singleClass) {
      if (singleClass.trim() != '') {
        composedClass += '.' + singleClass;
      }
    });
    style += composedClass + ' {';
    for (let [id, conf] of Object.entries(obj[type])) {
      if (id == 'class') {
        continue;
      }
      style += id + ': ' + conf.value + ';';
    }
    style += _this.getExtraStyles(type, composedClass, obj);
    style += '}';
    if (styles == null) {
      let styles = {
        tag: 'style',
        attrs: {
          id: 'wfb-styles-for-' + type
        },
        content: style
      };
      let body = document.getElementsByTagName('body');
      body[0].append(_this.create(styles));
      return;
    }
    styles.innerHTML = style;
  }

  /**
   * returning the step classes for general|active|completed step
   * @param {String} type of step
   * @param {Object} obj1
   * @param {Object} obj2
   * @return {String} step class
   */
  getStepClass(type, obj1, obj2) {
    let _this = this;
    let defaultValue = obj1[type].class.value;
    let newValue = obj2[type].class.value;
    _this.processStepClasses(type, obj2);
    return defaultValue == newValue ? defaultValue : newValue;
  }

  /**
   * Return stage tabs
   * @param {Object} stage object having stage details
   * @param {string} stepClass
   * @return {Object} stage tab
   */
  addStepItem(stage, stepClass) {
    return {
      tag: 'li',
      attrs: {
        id: 'for-' + stage.id,
        className: stepClass
      },
      content: stage.title,
    };
  }

  /**
   * Return form settings with selected language packs
   * @return {Object} formSettings with replaced labels
   */
  getFormSettings() {
    let formSettings = formData.settings.get('formSettings');
    return typeof formSettings != 'undefined' ? formSettings : this.getFormDefaultSettings();
  }

  /**
   * Return stage tabs
   * @param {Object} classes
   * @return {Object} stage tabs
   */
  getSteps(classes) {
    let _this = this;
    let steps = {
      tag: 'ul',
      attrs: {
        className: 'wfb-steps'
      },
      content: []
    };
    formData.stages.forEach(function(stage) {
      steps.content.push(_this.addStepItem(stage, classes.step));
    });
    steps.content[0].attrs.className = classes.active;
    return steps;
  }

  /**
   * Returning object of form submit button
   * @param {String} extraClass for submit button
   * @return {Object} submit button object
   */
  getFormSubmitButton(extraClass = '') {
    let formSettings = this.getFormSettings();
    return {
      tag: 'button',
      attrs: {
        id: 'submit-form',
        className: formSettings.submit['class'].value + extraClass,
        type: 'button',
        'data-processing': formSettings.submit['processing-text'].value,
        style: formSettings.submit['style'].value
      },
      action: {
        click: evt => {
          return;
        }
      },
      content: formSettings.submit['text'].value
    };
  }

  /**
   * Returning form button position settings
   * @return {String} position of submit button
   */
  getSubmitButtonPosition() {
    let formSettings = this.getFormSettings();
    let position = formSettings.submit['position'].value;
    position = position ? position : 'center';
    return 'text-' + position;
  }

  /**
   * @param {Object} stages json object containing stages configuration
   * @param {Dom} renderTarget dom element to indentify rendering target
   * @return {Object} json object for creating navigation
   */
  prepareStageNavigation(stages, renderTarget) {
    let _this = this;
    if (formData.stages.size < 2) {// Returning null is stages count is less than 2
      return null;
    }
    let defaultConfig = _this.getTabDefaultConfigs();
    let tabSettings = formData.settings.get('tabSettings');
    let mergedConfig = h.merge(defaultConfig, tabSettings);
    let classes = {
      step: _this.getStepClass('default', defaultConfig, mergedConfig),
      active: _this.getStepClass('active', defaultConfig, mergedConfig),
      complete: _this.getStepClass('complete', defaultConfig, mergedConfig),
      danger: _this.getStepClass('danger', defaultConfig, mergedConfig)
    };
    let navigation = {
      tag: 'div',
      attrs: {
        className: ['form-submit', 'step-navigation', this.getSubmitButtonPosition()]
      },
      content: [{
        tag: 'button',
        attrs: {
          id: 'previous-step',
          className: 'btn btn-secondary d-none',
          type: 'button'
        },
        action: {
          click: evt => {
            _this.changeStep(evt, renderTarget, classes, -1);
            return;
          }
        },
        content: 'Previous'
      }, _this.getFormSubmitButton(' ml-2 d-none'), {
        tag: 'button',
        attrs: {
          id: 'next-step',
          className: 'btn btn-primary ml-2',
          type: 'button'
        },
        action: {
          click: evt => {
            _this.changeStep(evt, renderTarget, classes, 1);
            return;
          }
        },
        content: 'Next'
      }]
    };
    let stageNavigation = {
      navigation: navigation,
      steps: _this.getSteps(classes)
    };
    return stageNavigation;
  }

  /**
   * Return object container DOM element, its required value, and operator
   * @param {Object} condition containing source, value and operator element object
   * @return {Object} element
   */
  getElementFromCondition(condition) {
    let _this = this;
    let source = condition.content[0].options;
    let value = condition.content[1].options;
    let operator = condition.content[2].options;
    let sourceSelected = null;
    let valueSelected = null;
    let operatorSelected = null;
    if (source.length > 0) {
      sourceSelected = source[0].value;
      for (let i = 0; i < source.length; i++) {
        if (source[i].selected == true) {
          sourceSelected = source[i].value;
          break;
        }
      }
      sourceSelected = _this.container.querySelectorAll('[id="' + sourceSelected + '"]');
    }
    if (value.length > 0) {
      valueSelected = value[0].value;
      for (let i = 0; i < value.length; i++) {
        if (value[i].selected == true) {
          valueSelected = value[i].value;
          break;
        }
      }
    }
    if (operator.length > 0) {
      operatorSelected = operator[0].value;
      for (let i = 0; i < operator.length; i++) {
        if (operator[i].selected == true) {
          operatorSelected = operator[i].value;
          break;
        }
      }
    }
    return {
      source: sourceSelected,
      value: valueSelected,
      operator: operatorSelected
    };
  }

  /**
   * Return rendered form elements changed value
   * @param {Array} elements Single element if select and multiple elements if radio button
   * @return {String} value selected in element
   */
  getConditionChangedValue(elements) {
    let elementType = elementTagType(elements[0]);
    switch (elementType.tag) {
      case 'SELECT':
        return elements[0].value;
      case 'INPUT':
        if (elementType.type == 'radio') {
          for (let i = 0; i < elements.length; i++) {
            if (elements[i].checked) {
              return elements[i].value;
            }
          }
          return null;
        }
    }
    return null;
  }

  /**
   * Applying conditions on elements
   * @param {DOM} element
   * @param {string} action
   */
  applyConditionsOnElemets(element, action = 'enable') {
    if (element.hasChildNodes()) {
      for (let i = 0; i < element.children.length; i++) {
        this.applyConditionsOnElemets(element.children[i], action);
      }
    } else {
      if (action == 'disable') {
        element.setAttribute('disabled', true);
      } else {
        element.removeAttribute('disabled');
      }
    }
  }

  /**
   * Execute the conditions
   * @param {Array} elements
   * @param {DOM} container on which conditions are applied
   */
  executeCondition(elements, container) {
    let _this = this;
    let result = null;
    let tempResult;
    let element;
    let i;
    let value;
    if (elements.length > 0) {
      element = elements[0];
      value = _this.getConditionChangedValue(element.source);
      result = value == element.value;
    }
    for (i = 1; i < elements.length - 1; i++) {
      element = elements[i];
      value = _this.getConditionChangedValue(element.source);
      tempResult = value == element.value;
      switch (elements[i - 1].operator) {
        case 'AND':
          result = result && tempResult;
          break;
        case 'OR':
          result = result || tempResult;
          break;
      }
    }
    if (i < elements.length) {
      element = elements[i];
      value = _this.getConditionChangedValue(element.source);
      tempResult = value == element.value;
      switch (elements[i - 1].operator) {
        case 'AND':
          result = result && tempResult;
          break;
        case 'OR':
          result = result || tempResult;
          break;
      }
    }
    if (result == true) {
      container.style.display = 'flex';
      this.applyConditionsOnElemets(container, 'enable');
    } else {
      container.style.display = 'none';
      this.applyConditionsOnElemets(container, 'disable');
    }
  }

  /**
   * Processing each condition and adding change event to element
   * @param {Array} conditions array containing all condition of row to apply
   * @param {DOM} container on which conditions are applied
   */
  processEachCondition(conditions, container) {
    let _this = this;
    let elements = [];
    let condition;
    let element;
    let elementType;
    for (let i = 0; i < conditions.length; i++) {
      condition = conditions[i];
      element = _this.getElementFromCondition(condition);
      elements.push(element);
    }
    for (let i= 0; i < elements.length; i++) {
      element = elements[i];
      elementType = elementTagType(element.source[0]);
      switch (elementType.tag) {
        case 'SELECT':
          element.source[0].addEventListener('change', function(event) {
            _this.executeCondition(elements, container);
          });
          break;
        case 'INPUT':
          if (elementType.type == 'radio') {
            for (let i = 0; i < element.source.length; i++) {
              element.source[i].addEventListener('click', function(event) {
                _this.executeCondition(elements, container);
              });
            }
          }
      }
      _this.executeCondition(elements, container);
    }
  }

  /**
   * Processing condition and applying action to element
   * @param {Map} rows map of rows
   */
  applyConditions(rows) {
    let _this = this;
    rows.forEach(function(row) {
      let id = row.id;
      if (row.conditions.length > 0) {
        let DOMrow = _this.container.querySelector('[id="' + id + '"]');
        if (DOMrow) {
          DOMrow.style.display = 'none';
          _this.processEachCondition(row.conditions, DOMrow);
        }
      }
    });
  }

  /**
   * Returning the default settings of form container
   * @return {Object} formSettings
   */
  getFormDefaultSettings() {
    let formSettings = {
      'class': {
        title: getString('class'),
        id: 'class',
        type: 'text',
        value: 'efb-form'
      },
      'background-color': {
        title: getString('backgroundcolor'),
        id: 'background-color',
        type: 'color',
        value: '#ffffff'
      },
      'color': {
        title: getString('textcolor'),
        id: 'color',
        type: 'color',
        value: '#000000'
      },
      'width': {
        title: getString('form-width'),
        id: 'width',
        type: 'range',
        value: '100',
        attrs: {
          min: '20',
          max: '100'
        }
      },
      'padding': {
        title: getString('form-padding'),
        id: 'padding',
        type: 'range',
        value: '40',
        attrs: {
          min: '0',
          max: '100'
        }
      },
      'display-label': {
        title: getString('display-label'),
        id: 'display-label',
        type: 'select',
        value: 'top',
        options: {
          option1: {
            value: 'off',
            label: getString('display-label-off'),
          },
          option2: {
            value: 'top',
            label: getString('display-label-top')
          },
          option3: {
            value: 'left',
            label: getString('display-label-left')
          }
        }
      }
    };
    let submitButtonSetting = {
      'class': {
        title: getString('class'),
        id: 'class',
        type: 'text',
        value: 'btn btn-primary',
      },
      'text': {
        title: getString('submitbuttontext'),
        id: 'text',
        type: 'text',
        value: 'Submit'
      },
      'processing-text': {
        title: getString('submitbuttonprocessingtext'),
        id: 'processing-text',
        type: 'text',
        value: 'Submitting....'
      },
      'position': {
        title: getString('submitbuttonposition'),
        id: 'position',
        type: 'select',
        value: 'center',
        options: {
          option1: {
            value: 'left',
            label: getString('position-left')
          },
          option2: {
            value: 'center',
            label: getString('position-center')
          },
          option3: {
            value: 'right',
            label: getString('position-right')
          }
        }
      }
    };
    return {
      submit: submitButtonSetting,
      form: formSettings
    };
  }

  /**
   * Merging settings and styles
   * @param {Object} settings
   * @param {String} styles
   * @return {String} styles
   */
  mergeStyles(settings, styles) {
    let stylesObj = {};
    let prop;
    let val;
    let styleString = '';
    styles = styles.trim();
    if (styles != '') {
      styles = styles.split(';');
      h.forEach(styles, function(style, i) {
        style = style.trim();
        if (style != '') {
          style = style.split(':');
          prop = style[0].trim();
          val = style[1].trim();
          if (prop != '' && val != '') {
            stylesObj[prop] = val;
          }
        }
      });
      settings = h.merge(settings, stylesObj);
    }
    for (let [prop1, val1] of Object.entries(settings)) {
      styleString += prop1 + ': ' + val1 + '; ';
    }
    return styleString;
  }


  /**
   * Processing form settings
   * @param {DOM} renderTarget
   */
  processFormSettings(renderTarget) {
    let formSettings = this.getFormSettings();
    // Getting form setting like classname, color and background color
    let className = formSettings.form['class'] ? formSettings.form['class'].value : '';
    let color = formSettings.form['color'] ? formSettings.form['color'].value : 'inherit';
    let backgroundColor = formSettings.form['background-color'] ? formSettings.form['background-color'].value : 'inherit';
    let width = formSettings.form['width'] ? formSettings.form['width'].value : '100%';
    let padding = formSettings.form['padding'] ? formSettings.form['padding'].value : '25';
    let styles = formSettings.form['style'] ? formSettings.form['style'].value : '';
    renderTarget.classList.add(className);
    // Adding form class in renderTarget to apply settings
    let settings = {
      width: width + '%',
      color: color,
      'background-color': backgroundColor,
      margin: '0 auto',
      padding: padding + 'px'
    };
    styles = this.mergeStyles(settings, styles);
    renderTarget.setAttribute('style', styles);
  }

  /**
   * Renders currently loaded formData to the renderTarget
   * @param {Object} renderTarget
   */
  renderForm(renderTarget) {
    this.empty(renderTarget);
    let renderData = data.prepData;
    let renderCount = document.getElementsByClassName('formeo-render').length;
    let stageNavigation = this.prepareStageNavigation(renderData.stages, renderTarget);
    let first = true;
    let content = Object.values(renderData.stages).map(stageData => {
      let {rows, ...stage} = stageData;
      rows = rows.map(rowID => {
        let {columns, ...row} = renderData.rows[rowID];
        let cols = columns.map(columnID => {
          let col = this.processColumnConfig(renderData.columns[columnID]);
          let fields = col.fields.map(fieldID => renderData.fields[fieldID]);
          col.tag = 'div';
          col.content = fields;
          return col;
        });
        row.tag = 'div';
        row.content = [cols];
        let rowData = clone(row);
        if (row.config.inputGroup) {
          let removeButton = {
            tag: 'button',
            className: 'remove-input-group',
            content: dom.icon('remove'),
            action: {
              mouseover: e => {
                e.target.parentElement.classList.add('will-remove');
              },
              mouseleave: e => {
                e.target.parentElement.classList.remove('will-remove');
              },
              click: e => {
                let currentInputGroup = e.target.parentElement;
                let iGWrap = currentInputGroup.parentElement;
                let iG = iGWrap.getElementsByClassName('f-input-group');
                if (iG.length > 1) {
                  dom.remove(currentInputGroup);
                } else {
                  console.log('Need at least 1 group');
                }
              }
            }
          };
          rowData.content.unshift(removeButton);
          let inputGroupWrap = {
            tag: 'div',
            id: uuid(),
            className: 'f-input-group-wrap'
          };
            if (rowData.attrs.className) {
              if (typeof rowData.attrs.className === 'string') {
                rowData.attrs.className += ' f-input-group';
              } else {
                rowData.attrs.className.push('f-input-group');
              }
            }
          let addButton = {
            tag: 'button',
            attrs: {
              className: 'add-input-group btn pull-right',
              type: 'button'
            },
            content: 'Add +',
            action: {
              click: e => {
                let fInputGroup = e.target.parentElement;
                let newRow = dom.create(rowData);
                fInputGroup.insertBefore(newRow, fInputGroup.lastChild);
              }
            }
          };

          row.content.unshift(removeButton);
          inputGroupWrap.content = [rowData, addButton];
          row = inputGroupWrap;
        }
        return row;
      });
      stage.tag = 'div';
      stage.content = rows;
      stage.className = 'f-stage';
      if (first) {
        first = false;
        stage.className += ' active';
      } else {
        stage.className += ' d-none';
      }
      return stage;
    });

    let config = {
      tag: 'div',
      id: `formeo-rendered-${renderCount}`,
      className: 'formeo-render formeo',
      content: content
    };

    renderTarget.appendChild(this.create(config));
    if (stageNavigation != null) {
      renderTarget.append(this.create(stageNavigation.navigation));
      renderTarget.prepend(this.create(stageNavigation.steps));
    } else {
      let navigation = {
        tag: 'div',
        attrs: {
          className: ['form-submit', this.getSubmitButtonPosition()],
        },
        content: [dom.getFormSubmitButton()]
      };
      renderTarget.append(this.create(navigation));
      dom.applyConditions(formData.rows);
      dom.processFormSettings(renderTarget);
    }
  }

  /**
   * Shorthand expander for dom.create
   * @param  {String} tag
   * @param  {Object} attrs
   * @param  {Object|Array|String} content
   * @return {Object} DOM node
   */
  h(tag, attrs, content) {
    return this.create({tag, attrs, content});
  }

  /**
   * @param {Object} modal object
   */
  addModal(modal) {
    modal = dom.create(modal);
    this.container.parentElement.appendChild(modal);
    setTimeout(function() {
      modal.classList.toggle('show');
      modal.focus();
    }, 150);
  }

  /**
   * removing modal
   * @param {String} id of modal element
   */
  removeModal(id) {
    let modal = document.getElementById(id);
    modal.classList.remove('show');
    setTimeout(function() {
      modal.remove();
    }, 150);
  }

  /**
   * @param {String} type of prompt window
   * @param {String} msg for prompt window
   * @param {function} action to apply after pressing ok button
   */
  alert(type, msg, action = null) {
    let _this = this;
    let id = uuid();
    let keyup = evt => {
      if(evt.keyCode == 27) {
        if (action != null) {
          action();
        }
        _this.removeModal(id, keyup);
      }
    };
    let header = {
      tag: 'div',
      className: 'modal-header bg-' + type,
      content: [{
        tag: 'button',
        attrs: {
          type: 'button',
          className: 'close',
          'data-dismiss': id,
          'aria-label': getString('close')
        },
        content: [{
          tag: 'span',
          attrs: {
            'aria-hidden': true
          },
          content: 'x',
          action: {
            click: evt => {
              _this.removeModal(id);
            }
          }
        }],
        action: {
          click: evt => {
            _this.removeModal(id);
          }
        }
      }, {
        tag: 'h4',
        attrs: {
          className: 'modal-title',
          id: 'modal-' + id
        },
        content: getString(type)
      }]
    };
    let body = {
      tag: 'div',
      className: 'modal-body',
      content: [{
        tag: 'h5',
        content: msg
      }]
    };
    let footer = {
      tag: 'div',
      className: 'modal-footer',
      content: [{
        tag: 'button',
        attrs: {
          className: 'btn btn-primary',
          type: 'button'
        },
        content: 'Ok',
        action: {
          click: evt => {
            _this.removeModal(id);
            if (action) {
              action();
            }
          },
          keyup: keyup
        }
      }]
    };
    let dialog = {
      tag: 'div',
      attrs: {
        className: 'modal-dialog',
        role: 'document'
      },
      content: [header, body, footer]
    };
    let modal = {
      tag: 'div',
      id: id,
      attrs: {
        className: 'efb-modal modal fade',
        role: 'dialog',
        'aria-hidden': true
      },
      content: [{
        tag: 'div',
        attrs: {
          className: 'modal-wrap',
          role: 'wrap'
        },
        content: dialog
      }],
      action: {
        keyup: keyup
      }
    };
    _this.addModal(modal);
  }

}

const dom = new DOM();

export default dom;
