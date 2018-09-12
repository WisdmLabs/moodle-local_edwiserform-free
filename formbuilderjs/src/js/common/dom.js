import Sortable from 'sortablejs';
import h from './helpers';
import events from './events';
import Row from '../components/row';
import Column from '../components/column';
import Field from '../components/field';
import animate from './animation';
import {data, formData} from './data';
import {uuid, clone, getString, hideControl, showControl, numToPercent, remove, closest, closestFtype, elementTagType} from './utils';
import panels from '../components/panels';
import defaultElements from '../components/controls';

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
    this.styleSheet = (() => {
      const style = document.createElement('style');
      style.setAttribute('media', 'screen');
      style.setAttribute('type', 'text/css');
      style.appendChild(document.createTextNode(''));
      document.head.appendChild(style);
      return style.sheet;
    })();
  }

  /**
   * Merges a user's configuration with default
   * @param  {Object} userConfig
   * @return {Object} config
   */
  set setConfig(userConfig) {
    const _this = this;
    const icon = _this.icon;
    let btnTemplate = {
        tag: 'button',
        content: [],
        attrs: {
          className: ['btn'],
          type: 'button'
        }
      };

    let handle = h.merge(Object.assign({}, btnTemplate), {
      content: [icon('move'), icon('handle')],
      attrs: {
        className: ['btn-secondary', 'item-handle'],
      },
      meta: {
        id: 'handle'
      }
    });

    let edit = h.merge(Object.assign({}, btnTemplate), {
      content: icon('edit'),
      attrs: {
        className: ['btn-primary', 'item-edit-toggle'],
      },
      meta: {
        id: 'edit'
      },
      action: {
        click: evt => {
          const element = closestFtype(evt.target);
          let {fType} = element;
          fType = fType.replace(/s$/, '');
          let editClass = 'editing-' + fType;
          let editWindow = element.querySelector(`.${fType}-edit`);
          animate.slideToggle(editWindow, 666);
          if (fType === 'field') {
            animate.slideToggle(editWindow.nextSibling, 666);
            element.parentElement.classList.toggle('column-' + editClass);
          }
          element.classList.toggle(editClass);
        }
      }
    });

    let remove = h.merge(Object.assign({}, btnTemplate), {
      content: icon('remove'),
      attrs: {
        className: ['btn-danger', 'item-remove'],
      },
      meta: {
        id: 'remove'
      },
      action: {
        click: (evt, id) => {
          const element = closestFtype(evt.target);
          if (_this.canRemoveElement(element)) {
            animate.slideUp(element, 666, elem => {
              _this.removeEmpty(element);
              _this.checkSingle();
            });
          }
        }
      }
    });

    // let removeStage = h.merge(Object.assign({}, btnTemplate), {
    //   content: icon('remove'),
    //   attrs: {
    //     className: ['item-remove'],
    //   },
    //   meta: {
    //     id: 'removestage'
    //   },
    //   action: {
    //     click: (evt, id) => {
    //       const element = closestFtype(evt.target);
    //       animate.slideUp(element, 250, elem => {
    //         data.deleteStage(element.id);
    //       });
    //     }
    //   }
    // });

    let cloneItem = h.merge(Object.assign({}, btnTemplate), {
      content: icon('copy'),
      attrs: {
        className: ['btn-warning', 'item-clone'],
      },
      meta: {
        id: 'clone'
      },
      action: {
        click: evt => {
          _this.clone(closestFtype(evt.target));
          data.save();
        }
      }
    });

    let defaultConfig = {
        rows: {
          actionButtons: {
            buttons: [
              clone(handle),
              edit,
              cloneItem,
              remove
            ],
            order: [],
            disabled: []
          }
        },
        columns: {
          actionButtons: {
            buttons: [
              clone(handle),
              clone(cloneItem),
              remove
            ],
            order: [],
            disabled: []
          }
        },
        fields: {
          actionButtons: {
            buttons: [
              handle,
              edit,
              cloneItem,
              remove
            ],
            order: [],
            disabled: []
          }
        },
      };

    defaultConfig.rows.actionButtons.buttons[0].content = [
      icon('move-vertical'),
      icon('handle')
    ];
    defaultConfig.columns.actionButtons.buttons[0].content = [
      icon('move'),
      icon('handle'),
    ];

    let mergedConfig = h.merge(defaultConfig, userConfig);

    Object.keys(mergedConfig).forEach(key => {
      if (mergedConfig[key].actionButtons) {
        const aButtons = mergedConfig[key].actionButtons;
        const disabled = aButtons.disabled;
        let buttons = aButtons.buttons;

        // Order buttons
        aButtons.buttons = h.orderObjectsBy(buttons, aButtons.order, 'meta.id');
        // filter disabled buttons
        aButtons.buttons = aButtons.buttons.filter(button => {
          let metaId = h.get(button, 'meta.id');
          return !h.inArray(metaId, disabled);
        });
      }
    });

    // overrides language set dir
    if (mergedConfig.dir) {
      this.dir = mergedConfig.dir;
    }

    this.config = mergedConfig;

    return this.config;
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
   * @param  {Boolean} isPreview generating element for preview or render?
   * @return {Object}            DOM Object
   */
  create(elem, isPreview = false) {
    let _this = this;
    elem = _this.processTagName(elem);
    let contentType;
    let {tag} = elem;
    let processed = [];
    let i;
    let displayLabel = '';
    let formSettings = this.getFormSettings();
    displayLabel = formSettings.form['display-label'].value;
    switch (displayLabel) {
      case 'top':
        displayLabel = '';
        break;
      case 'left':
        displayLabel = ' single-line';
        break;
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

    // Append Element Content
    if (elem.options) {
      let {options} = elem;
      options = this.processOptions(options, elem, isPreview);
      if (this.holdsContent(element) && tag !== 'button') {
        // mainly used for <select> tag
        appendContent.array.call(this, options);
        delete elem.content;
      } else {
        h.forEach(options, option => {
          wrap.content.push(_this.create(option, isPreview));
        });

        if (elem.attrs.className) {
          wrap.className = elem.attrs.className;
        }

        wrap.config = Object.assign({}, elem.config);
        if (typeof(wrap.className) == 'string') {
          wrap.className = [wrap.className];
        }
        wrap.className.push = h.get(elem, 'attrs.className');


        if (required) {
          wrap.attrs.required = required;
        }

        return this.create(wrap, isPreview);
      }

      processed.push('options');
    }

    if (elem.config) {
      let editablePreview = (elem.config.editable && isPreview);
      if (elem.config.hasOwnProperty('recaptcha') && elem.config.recaptcha && isPreview) {
        elem.attrs.className += '-preview';
      }
      if (elem.config.hasOwnProperty('recaptcha') && elem.config.recaptcha && !isPreview) {
        let renderCaptcha = new Function('element', 'key', 'grecaptcha.render(element, {sitekey: key});');
        setTimeout(renderCaptcha(element, this.sitekey), 100);
      }
      if (elem.config.label && tag !== 'button') {
        let label = null;

        if (isPreview) {
            label = _this.label(elem, 'config.label');
        } else {
            if (displayLabel == 'off') {
              elem.attrs.placeholder = 'label' in elem.config ? elem.config.label : '';
            }
            label = _this.label(elem);
        }
        if (displayLabel != 'off' && required) {
          label.innerHTML = label.innerHTML + dom.create(requiredMark).outerHTML;
        }

        if (!elem.config.hideLabel) {
          if (_this.labelAfter(elem)) {
            // add check for inline checkbox
            wrap.className = `f-${elem.attrs.type}`;
            label.insertBefore(element, label.firstChild);
            wrap.content.push(label);
          } else {
            wrap.content.push(label);
            if (displayLabel == 'off' && required) {
              wrap.content.push(requiredMark);
            }
            wrap.content.push(element);
          }
        } else if (editablePreview) {
          element.contentEditable = true;
          // Show label only while editing form - Yogesh
          if(elem.config.showLabelEdit) {
            if (_this.labelAfter(elem)) {
                wrap.className = `f-${elem.attrs.type}`;
                label.insertBefore(element, label.firstChild);
                wrap.content.push(label);
            } else {
              wrap.content.push(label);
              if (displayLabel == 'off' && required) {
                wrap.content.push(requiredMark);
              }
              wrap.content.push(element);
            }
          }
          // Custom code ends here
        }
      } else if (editablePreview) {
        element.contentEditable = true;
      }

      processed.push('config');
    }

    // Set element attributes
    if (elem.attrs) {
      if (elem.tag == 'option') {
        delete elem.attrs.name;
      } else {
        elem.attrs.name = elem.id;
      }
      _this.processAttrs(elem, element, isPreview);
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
      if (dataType === 'fieldData') {
        element.panelNav = elem.panelNav;
      }
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
   * Create and SVG or font icon.
   * Simple string concatenation instead of DOM.create because:
   *  - we don't need the perks of having icons be DOM objects at this stage
   *  - it forces the icon to be appended using innerHTML which helps svg render
   * @param  {String} name - icon name
   * @return {String} icon markup
   */
  icon(name) {
    let iconLink = document.getElementById('icon-' + name);
    let icon;

    if (iconLink) {
      icon = `<svg class="svg-icon svg-icon-${name}"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-${name}"></use></svg>`;
    } else {
      //eslint-disable-next-line
      icon = `<span class="fa fa-${name}" aria-hidden="true"></span>`;
    }
    return icon;
  }

  /**
   * JS Object to DOM attributes
   * @param  {Object} elem    element config object
   * @param  {Object} element DOM element we are building
   * @param  {Boolean} isPreview
   * @return {void}
   */
  processAttrs(elem, element, isPreview) {
    let {attrs = {}} = elem;
    delete attrs.tag;
    if (!isPreview) {
      if (!attrs.name && this.isInput(elem.tag)) {
        element.setAttribute('name', uuid(elem));
      }
    }

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
        element.attributes[name] = value;
        element.setAttribute(name, value);
      }
    });
  }

  /**
   * Generate a fancy checkbox or radio
   * @param  {Object}  elem
   * @param  {Boolean} isPreview
   * @return {Object} checkable
   */
  checkbox(elem, isPreview) {
    let label = h.get(elem, 'elem.config.label') || '';
    let checkable = {
      tag: 'span',
      className: 'checkable',
      content: label
    };
    let optionLabel = {
      tag: 'label',
      attrs: {},
      content: [elem, checkable]
    };

    // if (isPreview) {
    //   input.fMap = `options[${i}].selected`;
    //   optionLabel.attrs.contenteditable = true;
    //   optionLabel.fMap = `options[${i}].label`;
    //   checkable.content = undefined;
    //   let checkableLabel = {
    //     tag: 'label',
    //     content: [input, checkable]
    //   };
    //   inputWrap.content.unshift(checkableLabel);
    //   // inputWrap.content.unshift(input);
    // } else {
    //   input.attrs.name = elem.id;
    //   optionLabel.content = checkable;
    //   optionLabel = dom.create(optionLabel);
    //   input = dom.create(input);
    //   optionLabel.insertBefore(input, optionLabel.firstChild);
    //   inputWrap.content = optionLabel;
    // }

    return optionLabel;
  }

  /**
   * Extend Array of option config objects
   * @param  {Array} options
   * @param  {Object} elem element config object
   * @param  {Boolean} isPreview
   * @return {Array} option config objects
   */
  processOptions(options, elem, isPreview) {
    let {action, attrs} = elem;
    let fieldType = attrs.type || elem.tag;
    let id = attrs.id || elem.id;

    let optionMap = (option, i) => {
      const defaultInput = () => {
        let input = {
          tag: 'input',
          attrs: {
            id: id + '-' + i,
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
        if (isPreview) {
          input.fMap = `options[${i}].selected`;
          optionLabel.attrs.contenteditable = true;
          optionLabel.fMap = `options[${i}].label`;
          checkable.content = undefined;
          let checkableLabel = {
            tag: 'label',
            content: [input, checkable]
          };
          inputWrap.content.unshift(checkableLabel);
        } else {
          input.attrs.name = id;
          optionLabel.content = checkable;
          optionLabel = dom.create(optionLabel);
          input = dom.create(input);
          optionLabel.insertBefore(input, optionLabel.firstChild);
          inputWrap.content = optionLabel;
        }
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
      className: ['control-label'],
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
   * @param  {String} key
   * @return {String}
   */
  contentType(content, key = null) {
    let type = typeof content;
    let longTextProperty = ['style'];
    if (key != null && longTextProperty.indexOf(key) != -1) {
      type = 'textarea';
    } else if (content instanceof Node || content instanceof HTMLElement) {
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
   * Return stage tabs
   * @param {Object} stage object having stage details
   * @return {Object} stage tab
   */
  addStageTabItem(stage) {
    return {
      tag: 'li',
      className: 'stage-tab wfb-tab',
      id: 'for-' + stage.id,
      content: stage.title,
      action: {
        click: event => {
          if (!event.target.classList.contains('active')) {
            let container = closest(event.target, 'stage-tabs-wrapper');
            let selectedStage = container.parentElement.querySelector('.stage-wrap[id="' + stage.id + '"]');
            let activeStage = container.parentElement.querySelector('.stage-wrap.active');
            activeStage.classList.remove('active');
            activeStage.classList.remove('show');
            selectedStage.classList.add('active');
            selectedStage.classList.add('show');
            let activeTab = event.target.parentElement.querySelector('.active');
            activeTab.classList.remove('active');
            event.target.classList.add('active');
            dom.activeStage = selectedStage.querySelector('.stage'); // Changing active stage to newly added stage
            dom.toggleFormDeleteAction();
          }
        }
      }
    };
  }

  /**
   * Return stage tabs
   * @return {Object} stage tabs
   */
  getStageTabs() {
    let _this = this;
    let tabs = [];
    formData.stages.forEach(function(stage) {
      tabs.push(_this.addStageTabItem(stage));
    });
    tabs[0].className += ' active';
    return tabs;
  }

  /**
   * Remove stage from tab list
   * @param {DOM} element
   * @param {string} stageID
   */
  removeStage(element, stageID) {
    let _this = this;
    let container = closest(element, 'stage-tabs-wrapper');
    let lastStage;
    let remove = (stage, button, listItem) => {
      let parent = stage.parentElement;
      switch (formData.stages.size) {
        case 1:
          return false;
        case 2:
          container.remove();
          showControl('layout-tab-control');
          stage.remove();
          parent.querySelector('.stage-wrap').classList.add('active');
          parent.querySelector('.stage-wrap').classList.add('show');
          dom.activeStage = parent.querySelector('.stage-wrap').querySelector('.stage');
          lastStage = formData.stages.get(dom.activeStage.id);
          lastStage.title = 'Stage 1';
          formData.stages.set(dom.activeStage.id, lastStage);
          return true;
        default:
          stageButton.remove();
          animate.slideUp(listItem, 666, function() {
            _this.resizeTabContainer(listItem);
            listItem.remove();
          });
          stage.remove();
          dom.activeStage = parent.querySelector('.stage-wrap.active').querySelector('.stage');
          return true;
      }
    };
    let listItem = closest(element, 'stage-tab-wrap');
    let stageButton = container.querySelector('[id="for-' + stageID + '"]');
    let stage = container.parentElement.querySelector('[id="' + stageID + '"]');
    let viewingStage = container.parentElement.querySelector('.stage-wrap.active');
    let status = false;
    if (stage.id == viewingStage.id) {
      let newStage;
      if (stage.nextSibling) {
        newStage = stage.nextSibling;
      } else {
        newStage = stage.previousSibling;
      }
      newStage.classList.add('active');
      newStage.classList.add('show');
      let newId = newStage.id;
      let newButton = container.querySelector('[id="for-' + newId + '"]');
      newButton.classList.add('active');
      status = remove(stage, stageButton, listItem);
    } else {
      status = remove(stage, stageButton, listItem);
    }
    if (status == true) {
      formData.stages.delete(stageID);
    }
    _this.toggleFormDeleteAction();
    data.save();
  }

  /**
   * Return stage tabs
   * @param {Object} stage details
   * @return {Object} stage tabs
   */
  addStageTabListItem(stage) {
    let _this = this;
    let input = {
      tag: 'input',
      attrs: {
        type: 'text',
        id: 'title-for-' + stage.id,
        value: stage.title,
        className: 'form-control'
      },
      action: {
        change: event => {
          let element = event.target;
          let newTitle = element.value;
          let parent = closest(element, 'stage-tabs-wrapper');
          let button = parent.querySelector('[id="for-' + stage.id + '"]');
          button.innerText = newTitle;
          data.updateStageTitle(stage.id, newTitle);
        }
      }
    };
    let controls = [{
      tag: 'button',
      attrs: {
        type: 'button',
        className: 'btn btn-primary prop-order prop-control',
      },
      content: _this.icon('move-vertical'),
    }, {
      tag: 'button',
      attrs: {
        type: 'button',
        id: 'remove-stage-' + stage.id,
        className: 'btn btn-danger prop-remove prop-control'
      },
      content: _this.icon('remove'),
      action: {
        click: event => {
          _this.removeStage(event.target, stage.id);
        }
      }
    }];
    let tab = {
      tag: 'li',
      className: 'stage-tab-wrap prop-wrap control-count-2',
      content: [{
        tag: 'div',
        className: 'prop-controls',
        content: controls
      }, {
        tag: 'div',
        className: 'prop-input',
        content: [input]
      }]
    };
    return tab;
  }

  /**
   * Repositioning tabbed panels when panel container's width change
   * @param {String} container class of form editor
   */
  repositionPanels(container) {
    let panels = container.querySelectorAll('.panel-labels .active-tab');
    let evt;
    panels.forEach(function(panel) {
      evt = new CustomEvent('click', {target: panel});
      setTimeout(function() {
        panel.dispatchEvent(evt);
      }, 500);
    });
  }

  /**
   * Resizing the tab container
   * @param {DOM} element of which container need to be resized
   * @param {String} type of panel need to be resized
   */
  resizeTabContainer(element, type = 'list') {
    let container = closest(element, 'panel-tab-' + type);
    if (container) {
      let parentStyles = container.parentElement.style;
      parentStyles.height = 'auto';
    }
  }

  /**
   * Return stage tabs controls
   * @return {Object} stage tabs
   */
  getStageTabList() {
    let _this = this;
    let tabs = {
      tag: 'ul',
      className: 'field-edit-group field-edit-tab',
      content: []
    };
    formData.stages.forEach(function(stage) {
      tabs.content.push(_this.addStageTabListItem(stage));
    });
    let tabActions = {
      tag: 'div',
      className: 'panel-action-buttons',
      content: [{
        tag: 'button',
        attrs: {
          type: 'button',
          className: 'add-tab btn btn-primary'
        },
        content: getString('panelEditButtons.tabs'),
        action: {
          click: event => {
            let stageID = data.addStage();
            let element = event.target;
            let tabListContainer = closest(element, 'panel-tab-list').querySelector('.field-edit-tab');
            let formContainer = closest(element, 'form-container');
            let stage = formContainer.querySelector('.stage-wrap.active').querySelector('.stage');
            dom.activeStage = stage;
            let tabsWrapper = closest(element, 'stage-tabs-wrapper');
            let tabContainer = tabsWrapper.querySelector('.stage-tabs-preview');
            stage = formData.stages.get(stageID);
            let tabListItem = _this.addStageTabListItem(stage);
            let tabItem = _this.addStageTabItem(stage);
            tabListContainer.appendChild(dom.create(tabListItem));
            tabContainer.appendChild(dom.create(tabItem));
            _this.resizeTabContainer(event.target);
            data.save();
            _this.toggleFormDeleteAction();
          }
        }
      }]
    };
    return [{
      tag: 'div',
      className: 'f-panel-wrap',
      content: tabs
    }, tabActions];
  }

  /**
   * Reorder tab buttons
   */
  reorderTabButtons() {
    let container = document.querySelector('.stage-tabs-wrapper');
    let list = container.querySelector('.field-edit-group');
    let buttons = container.querySelector('.stage-tabs-preview');
    let button;
    let sorted = [];
    let stageid;
    list.childNodes.forEach(stage => {
      stage = stage.querySelector('input');
      stageid = stage.id;
      stageid = stageid.replace('title-', '');
      button = buttons.querySelector('[id="' + stageid + '"]');
      sorted.push(button);
    });
    sorted.forEach(button => {
      buttons.appendChild(button);
    });
  }

  /**
   * Sorting of tabs
   */
  tabSorting() {
    let container = document.querySelector('.stage-tabs-wrapper');
    let list = container.querySelector('.field-edit-group');
    Sortable.create(list, {
      animation: 150,
      group: {
        name: 'stage-sort',
        pull: true, put: true
      },
      sort: true,
      draggable: '.stage-tab-wrap',
      handle: '.prop-order',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onSort: evt => {
        data.saveStageOrder(list.childNodes);
      }
    });
  }

  /**
   * Return single stage tab configuration
   * @param {String} id of config property
   * @param {Object} config object including title, configid, type
   * @param {Object} defaultConf object including title, configid, type
   * @param {String} settingName unique name of setting we need to change
   * @param {String} classPrefix for setting elemets
   * @param {String} category of configuration if any nesting
   * @return {Object} stage tabs configuration
   */
  getSettingItem(id, config, defaultConf, settingName, classPrefix = null, category = null) {
    if (classPrefix == null) {
      classPrefix = settingName;
    }
    let element = {
      tag: 'li',
      className: classPrefix + '-wrap setting-wrap',
      content: [{
        tag: 'h5',
        className: classPrefix + '-label setting-label',
        content: config.title
      }]
    };
    let input = {
      tag: 'div',
      attrs: {
        className: classPrefix + '-inputs setting-inputs'
      },
      content: []
    };
    let inputControl = {
      tag: 'input',
      attrs: {
        className: classPrefix + '-input setting-input',
        value: config.value
      },
      action: {
        change: event => {
          let setting = formData.settings.get(settingName);
          let inputTagType = elementTagType(input);
          let target = event.target;
          let value = target.value;
          switch (inputTagType.tag) {
            case 'INPUT':
              switch (inputTagType.type) {
                case 'checkbox':
                  setting[category][id].value = input.checked ? 'on' : 'off';
                  break;
                default:
                  if (category != null) {
                    setting[category][id].value = value;
                  } else {
                    setting[id].value = value;
                  }
                  break;
              }
              break;
              default:
                if (category != null) {
                  setting[category][id].value = value;
                } else {
                  setting[id].value = value;
                }
                break;
          }
          if (target.previousSibling) {
            target.previousSibling.value = value;
          } else if (target.nextSibling) {
            target.nextSibling.value = value;
          }
          formData.settings.set(settingName, setting);
          data.save();
        }
      }
    };
    switch (config.type) {
      case 'color':
        input.content.push({
          tag: 'input',
          attrs: {
            className: classPrefix + '-input setting-input color-group',
            type: 'text',
            value: config.value
          },
          action: {
            change: event => {
              let target = event.target;
              target.nextSibling.value = target.value;
              let evt = new CustomEvent('change', {target: target.nextSibling});
              target.nextSibling.dispatchEvent(evt);
            }
          }
        });
        inputControl.attrs.className += ' color-group';
        inputControl.attrs.type = config.type;
        break;
      case 'text':
        inputControl.attrs.type = config.type;
        break;
      case 'number':
        inputControl.attrs.type = config.type;
        break;
      case 'range':
        inputControl.action.mousemove = inputControl.action.change;
        inputControl.action.touchmove = inputControl.action.change;
        inputControl.action.pointermove = inputControl.action.change;
        inputControl.attrs.className += ' range-group';
        inputControl.attrs.type = config.type;
        inputControl.attrs = h.merge(inputControl.attrs, config.attrs);
        break;
      case 'select':
        inputControl.tag = 'select';
        inputControl.options = [];
        for (let [i, option] of Object.entries(config.options)) {
            option.selected = option.value == config.value;
          inputControl.options.push(option);
        }
        break;
      case 'textarea':
        inputControl.tag = 'textarea';
        inputControl.cols = 5;
        inputControl.content = config.value;
        if (config.id == 'style') {
          inputControl.placeholder = getString('placeholder.style');
        }
        break;
      case 'toggle':
        inputControl.attrs.className += ' toggle-group';
        inputControl.tag = 'input';
        inputControl.type = 'checkbox';
        inputControl.checked = config.value == 'on';
        break;
      default:
        inputControl.attrs.type = 'text';
        break;
    }
    input.content.push(inputControl);
    switch (config.type) {
      case 'range':
        input.content.push({
          tag: 'input',
          attrs: {
            className: classPrefix + '-input setting-input range-group',
            type: 'text',
            value: config.value
          },
          action: {
            change: event => {
              let target = event.target;
              target.previousSibling.value = target.value;
              let evt = new CustomEvent('change', {target: target.previousSibling});
              target.previousSibling.dispatchEvent(evt);
            }
          }
        });
        break;
      case 'toggle':
        input.content.push({
          tag: 'div',
          className: classPrefix + '-input-label setting-input-label toggle-group-wrap',
          content: [{
            tag: 'span',
            className: classPrefix + '-input setting-input setting-toggle-icon',
            action: {
              click: event => {
                let target = event.target;
                if (target.tagName == 'LABEL') {
                  target = target.parentElement;
                }
                let input = target.parentElement.previousSibling;
                input.checked = input.checked ? false : true;
                let evt = new CustomEvent('change', {target: input});
                input.dispatchEvent(evt);
              }
            },
            content: [{
              tag: 'label',
              attrs: {
                className: classPrefix + '-input setting-input toggle-on',
              },
              content: config.options.on
            }, {
              tag: 'label',
              attrs: {
                className: classPrefix + '-input setting-input toggle-off',
              },
              content: config.options.off
            }]
          }]
        });
        break;
    }
    let defaultConfig = {
      tag: 'div',
      attrs: {
        className: classPrefix + '-control setting-control'
      },
      content: [{
        tag: 'button',
        attrs: {
          class: classPrefix + '-default setting-default btn',
          type: 'button',
          'data-key': config.value,
          title: 'Restore default'
        },
        action: {
          click: event => {
            let target = event.target;
            let setting = formData.settings.get(settingName);
            if (target.classList.contains('restore-default')) {
              target = target.parentElement;
            }
            let input = target.parentElement.previousSibling.childNodes[0];
            let inputTagType = elementTagType(input);
            let value = target.getAttribute('data-key');
            let opts;
            let opt;
            let i;
            switch (inputTagType.tag) {
              case 'SELECT':
                opts = input.childNodes;
                for (i = 0; opt = opts[i]; i++) {
                  if (opt.value == value) {
                    input.selectedIndex = i;
                    break;
                  }
                }
                if (category != null) {
                  setting[category][id].value = value;
                } else {
                  setting[id].value = value;
                }
                break;
              case 'INPUT':
                switch (inputTagType.type) {
                  case 'checkbox':
                    input.checked = value == 'on';
                    break;
                  default:
                    input.value = value;
                    if (category != null) {
                      setting[category][id].value = value;
                    } else {
                      setting[id].value = value;
                    }
                    break;
                }
                break;
              default:
                input.value = value;
                if (category != null) {
                  setting[category][id].value = value;
                } else {
                  setting[id].value = value;
                }
                break;
            }
            let evt = new CustomEvent('change', {target: input});
            input.dispatchEvent(evt);
            formData.settings.set(settingName, setting);
            data.save();
          }
        },
        content: [{
          tag: 'div',
          className: 'restore-default'
        }]
      }]
    };
    let setting = {
      tag: 'div',
      className: classPrefix + '-inputs-wrap setting-inputs-wrap',
      content: [input, defaultConfig]
    };
    element.content.push(setting);
    return element;
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
      // Removed extra settings
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
    * Create stage tab configuration category container
    * @param {String} category type stage tabs configuration
    * @param {Boolean} resize does container need to resized after toggling settings
    * @return {Object} stage tabs configuration container
    */
  getConfigContainer(category, resize = true) {
    let _this = this;
    let label = {
      tag: 'h4',
      className: 'category-label btn-primary p-10 m-0 collapsed',
      content: [getString('category-container-' + category), {
        tag: 'i',
        className: 'fa fa-plus'
      }, {
        tag: 'i',
        className: 'fa fa-minus'
      }],
      action: {
        click: event => {
          let target = event.target;
          if (target.tagName == 'I') {
            target = target.parentElement;
          }
          let list = target.nextSibling;
          if(target.classList.contains('collapsed')) {
            list.style.height = 'auto';
            let height = list.clientHeight + 'px';
            list.style.height = '0px';
            target.classList.remove('collapsed');
            target.classList.add('collapsible');
            resize ? _this.resizeTabContainer(target, 'config') : null;
            setTimeout(() => {
                list.style.height = height;
            }, 0);
          } else {
            list.style.height = '0px';
            target.classList.remove('collapsible');
            target.classList.add('collapsed');
            resize ? _this.resizeTabContainer(target, 'config') : null;
          }
        },
      }
    };
    let settings = {
      tag: 'ul',
      className: 'category-settings',
      content: []
    };
    return {
      tag: 'div',
      className: 'category-container-' + category,
      content: [label, settings]
    };
  }

  /**
    * Return stage tab configuration
    * @return {Object} stage tabs configuration
    */
  getTabConfigs() {
    let _this = this;
    let tabConfig = _this.getTabDefaultConfigs();
    let tabSettings = formData.settings.get('tabSettings');
    let tabConfigElement = [];
    for (let [category, group] of Object.entries(tabSettings)) {
      let container = _this.getConfigContainer(category);
      for (let [id, config] of Object.entries(group)) {
        container.content[1].content.push(_this.getSettingItem(id, config, tabConfig[category][id], 'tabSettings', 'stage-config', category));
      }
      tabConfigElement.push(container);
    }
    return {
      tag: 'div',
      attrs: {
        className: 'f-panel-wrap'
      },
      content: [{
        tag: 'ul',
        className: 'field-edit-group',
        content: tabConfigElement
      }]
    };
  }
  /**
    * Return stage tab container
    * @return {Object} stage tabs wrapper
    */
  getStageControl() {
    let _this = this;
    let edit = {
      tag: 'button',
      content: _this.icon('edit'),
      attrs: {
        className: ['btn btn-primary item-edit-toggle'],
        type: 'button'
      },
      meta: {
        id: 'edit'
      },
      action: {
        click: evt => {
          const element = closest(evt.target, 'stage-tabs-wrapper');
          let fType = 'stage-tabs';
          let editClass = 'editing-' + fType;
          let editWindow = element.querySelector(`.${fType}-edit`);
          if (element.classList.contains(editClass)) {
            animate.slideUp(editWindow, 666, function() {
              animate.slideDown(editWindow.nextSibling, 333, function() {
                element.classList.remove(editClass);
              });
            });
          } else {
            animate.slideUp(editWindow.nextSibling, 333, function() {
              animate.slideDown(editWindow, 666, function() {
                element.classList.add(editClass);
              });
            });
          }
        }
      }
    };

    let remove = {
      tag: 'button',
      content: [_this.icon('handle'), _this.icon('remove')],
      attrs: {
        className: ['btn btn-danger item-remove'],
        type: 'button'
      },
      meta: {
        id: 'remove'
      },
      action: {
        click: (evt) => {
          let editor = document.getElementById('efb-cont-form-builder');
          let stages = editor.querySelectorAll('.stage-wrap:not(.active)');
          stages.forEach(stage => {
            let stageRemoveButton = editor.querySelector('.prop-remove[id="remove-stage-' + stage.id + '"]');
            dom.removeStage(stageRemoveButton, stage.id);
          });
        }
      }
    };
    let tabListPanel = {
      tag: 'div',
      config: {
        label: 'Tab list'
      },
      attrs: {
        className: 'f-panel panel-tab-list'
      },
      content: [_this.getStageTabList()]
    };
    let tabConfigPanel = {
      tag: 'div',
      config: {
        label: 'Tab config'
      },
      attrs: {
        className: 'f-panel panel-tab-config'
      },
      content: [_this.getTabConfigs()]
    };
    let tabPanels = new panels({
      id: 'stage-tab-panel',
      panels: [tabListPanel, tabConfigPanel]
    });
    let stageControlWrap = {
      tag: 'div',
      className: 'stage-tabs-wrapper wfb-tabs-view',
      id: 'stage-tab-panel',
      content: [{
        tag: 'div',
        className: 'stage-tabs-actions group-actions',
        content: [{
          tag: 'div',
          className: 'action-btn-wrap',
          content: [remove, edit]
        }]
      }, {
        tag: 'div',
        className: 'stage-tabs-edit field-edit',
        content: [{
          tag: 'div',
          attrs: {
            className: 'tab-edit panels-wrap tabbed-panels',
          },
          content: tabPanels.content,
          nav: tabPanels.nav,
          action: tabPanels.action
        }]
      }, {
        tag: 'ul',
        className: 'stage-tabs-preview wfb-tabs',
        content: [_this.getStageTabs()]
      }],
      action: {
        mouseenter: event => {
          event.target.classList.add('hovering-stage-tabs');
        },
        mouseleave: evnt => {
          event.target.classList.remove('hovering-stage-tabs');
        }
      }
    };
    setTimeout(function() { // Activate first tab as active step when multiple steps presents
      dom.activeStage = document.querySelector('.stage-wrap.active .stage');
    }, 666);
    return stageControlWrap;
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
   * Util to remove contents of DOM Object
   * @param  {Object} elem
   * @return {Object} element with its children removed
   */
  empty(elem) {
    // Passing stage directly so no need to check stage or not
    while (elem.firstChild) {
      this.remove(elem.firstChild);
    }
    return elem;
  }

  /**
   * Move, close, and edit buttons for row, column and field
   * @param  {String} id   element id
   * @param  {String} item type of element eg. row, column, field
   * @return {Object}      element config object
   */
  actionButtons(id, item = 'column') {
    let _this = this;
    let tag = (item === 'column' ? 'li' : 'div');
    let btnWrap = {
        tag: 'div',
        className: 'action-btn-wrap'
      };
    let actions = {
      tag,
      className: item + '-actions group-actions',
      action: {
        mouseenter: evt => {
          let element = document.getElementById(id);
          element.classList.add('hovering-' + item);
          evt.target.parentReference = element;
        },
        mouseleave: evt => {
          evt.target.parentReference.classList.remove('hovering-' + item);
        },
        onRender: elem => {
          const buttons = elem.getElementsByTagName('button');
          let btnWidth = parseInt(_this.getStyle(buttons[0], 'width')) + 1;
          const expandedWidth = (buttons.length * btnWidth) + 'px';
          const woh = item === 'row' ? 'height' : 'width';
          let rules = [
            [
              `.hovering-${item} .${item}-actions`,
              [woh, expandedWidth, true]
            ]
          ];

          _this.insertRule(rules);
        }
      }
    };
    btnWrap.content = this.config[`${item}s`].actionButtons.buttons;
    actions.content = btnWrap;

    return actions;
  }

  /**
   * Clones an element, it's data and
   * it's nested elements and data
   * @param {Object} elem element we are cloning
   * @param {Object} parent
   * @return {Object} cloned element
   */
  clone(elem, parent) {
    let _this = this;
    let {id, fType} = elem;
    let dataClone = clone(formData[fType].get(id));
    let newIndex = h.indexOfNode(elem) + 1;
    let noParent = false;
    dataClone.id = uuid();
    formData[fType].set(dataClone.id, dataClone);
    if (!parent) {
      parent = elem.parentElement;
      noParent = true;
    }
    const cloneType = {
      rows: () => {
        dataClone.columns = [];
        const stage = _this.activeStage;
        const newRow = _this.addRow(null, dataClone.id);
        const columns = elem.getElementsByClassName('stage-columns');

        stage.insertBefore(newRow, stage.childNodes[newIndex]);
        h.forEach(columns, column => _this.clone(column, newRow));
        data.saveRowOrder();
        return newRow;
      },
      columns: () => {
        dataClone.fields = [];
        const newColumn = _this.addColumn(parent.id, dataClone.id);
        parent.insertBefore(newColumn, parent.childNodes[newIndex]);
        let fields = elem.getElementsByClassName('stage-fields');

        if (noParent) {
          dom.columnWidths(parent);
        }
        h.forEach(fields, field => _this.clone(field, newColumn));
        return newColumn;
      },
      fields: () => {
        const newField = _this.addField(parent.id, dataClone.id, 'clone');
        parent.insertBefore(newField, parent.childNodes[newIndex]);
        return newField;
      }
    };

    return cloneType[fType]();
  }

  /**
   * Check that element can be removed using remove but or not
   * @param {DOM} container element need to be removed
   * @return {Boolean} canRemoveElement true if element can be removed| false if element cannot be removed
   */
  canRemoveElement(container) {
    let templateElements = container.querySelectorAll('[template="true"]');
    let elementType = container.fType;
    elementType = elementType.slice(0, elementType.length - 1);
    if (templateElements.length > 0) {
      let elements = [];
      let tagType;
      templateElements.forEach(function(templateElement) {
        tagType = elementTagType(templateElement);
        if (tagType.tag == 'input' && tagType.type == 'hidden') {
          elements.push(templateElement.getAttribute('name'));
        } else {
          let label = templateElement.previousSibling;
          elements.push(label.innerHTML);
        }
      });
      let message = getString('cannotremove');
      message = message.replace('{{type}}', elementType);
      if (elements.length > 0) {
        elements.forEach(function(element) {
          message += element + ', ';
        });
        message = message.substring(0, message.length - 2);
        message += '.';
      }
      this.alert('danger', message);
      return false;
    }
    return true;
  }

  /**
   * Remove elements without f children
   * @param  {Object} element DOM element
   * @return {Object} formData
   */
  removeEmpty(element) {
    let _this = this;
    let parent = element.parentElement;
    let type = element.fType;
    let children;
    _this.remove(element);
    children = parent.getElementsByClassName('stage-' + type);
    if (!children.length) {
      if (parent.fType !== 'stages') {
        return _this.removeEmpty(parent);
      } else {
        this.emptyClass(parent);
      }
    }
    if (type === 'columns') {
      _this.columnWidths(parent);
    }
    return data.save();
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
   * Removes a class or classes from nodeList
   *
   * @param  {NodeList} nodeList
   * @param  {String | Array} className
   */
  removeClasses(nodeList, className) {
    let _this = this;
    let removeClass = {
      string: elem => {
        elem.className = elem.className.replace(className, '');
      },
      array: elem => {
        for (let i = className.length - 1; i >= 0; i--) {
          elem.classList.remove(className[i]);
        }
      }
    };
    removeClass.object = removeClass.string; // handles regex map
    h.forEach(nodeList, removeClass[_this.contentType(className)]);
  }

  /**
   * Adds a class or classes from nodeList
   *
   * @param  {NodeList} nodeList
   * @param  {String | Array} className
   */
  addClasses(nodeList, className) {
    let _this = this;
    let addClass = {
      string: elem => {
        elem.classList.add(className);
      },
      array: elem => {
        for (let i = className.length - 1; i >= 0; i--) {
          elem.classList.add(className[i]);
        }
      }
    };
    h.forEach(nodeList, addClass[_this.contentType(className)]);
  }

  /**
   * [fieldOrderClass description]
   * @param  {[type]} column [description]
   */
  fieldOrderClass(column) {
    let fields = column.querySelectorAll('.stage-fields');

    if (fields.length) {
      this.removeClasses(fields, ['first-field', 'last-field']);
      fields[0].classList.add('first-field');
      fields[fields.length - 1].classList.add('last-field');
    }
  }

  /**
   * Read columns and generate bootstrap cols
   * @param  {Object}  row    DOM element
   */
  columnWidths(row) {
    let _this = this;
    let fields = [];
    let columns = row.getElementsByClassName('stage-columns');
    if (!columns.length) {
      return;
    }
      let width = parseFloat((100 / columns.length).toFixed(1))/1;
    let bsGridRegEx = /\bcol-\w+-\d+/g;

    _this.removeClasses(columns, bsGridRegEx);

    h.forEach(columns, column => {
      let columnData = formData.columns.get(column.id);
      fields.push(...columnData.fields);

      let colWidth = numToPercent(width);

      column.style.width = colWidth;
      column.style.float = 'left';
      columnData.config.width = colWidth;
      column.dataset.colWidth = colWidth;
      document.dispatchEvent(events.columnResized);
    });

    setTimeout(() => {
      fields.forEach(fieldID => {
        let field = dom.fields.get(fieldID);
        if (field.instance.panels) {
          field.instance.panels.nav.refresh();
        }
      });
    }, 250);

    dom.updateColumnPreset(row);
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
   * Generates the element config for column layout in row
   * @param  {String} rowID [description]
   * @return {Object}       [description]
   */
  columnPresetControl(rowID) {
    let _this = this;
    let rowData = formData.rows.get(rowID);
    let layoutPreset = {
        tag: 'select',
        attrs: {
          ariaLabel: getString('columnlayout'),
          className: 'column-preset'
        },
        action: {
          change: e => {
            let dRow = this.rows.get(rowID);
            _this.setColumnWidths(dRow.row, e.target.value);
            data.save();
          }
        }
      };
    let pMap = new Map();
    let custom = {value: 'custom', label: getString('custom')};

    pMap.set(1, [{value: '100.0', label: '100%'}]);
    pMap.set(2, [
      {value: '50.0,50.0', label: '50 | 50'},
      {value: '33.3,66.6', label: '33 | 66'},
      {value: '66.6,33.3', label: '66 | 33'},
      {value: '25,75', label: '25 | 75'},
      {value: '75,25', label: '75 | 25'},
      custom
    ]);
    pMap.set(3, [
      {value: '33.3,33.3,33.3', label: '33 | 33 | 33'},
      {value: '50.0,25.0,25.0', label: '50 | 25 | 25'},
      {value: '25.0,50.0,25.0', label: '25 | 50 | 25'},
      {value: '25.0,25.0,50.0', label: '25 | 25 | 50'},
      {value: '60.0,20.0,20.0', label: '60 | 20 | 20'},
      {value: '20.0,60.0,20.0', label: '20 | 60 | 20'},
      {value: '20.0,20.0,60.0', label: '20 | 20 | 60'},
      custom
    ]);
    pMap.set(4, [
      {value: '25.0,25.0,25.0,25.0', label: '25 | 25 | 25 | 25'},
      {value: '30.0,30.0,20.0,20.0', label: '30 | 30 | 20 | 20'},
      {value: '20.0,30.0,30.0,20.0', label: '20 | 30 | 30 | 20'},
      {value: '20.0,20.0,30.0,30.0', label: '20 | 20 | 30 | 30'},
      {value: '30.0,20.0,20.0,30.0', label: '30 | 20 | 20 | 30'},
      custom
      ]);
    pMap.set('custom', [custom]);

    if (rowData && rowData.columns.length) {
      let columns = rowData.columns;
      let pMapVal = pMap.get(columns.length);
      layoutPreset.options = pMapVal || pMap.get('custom');
      let curVal = columns.map((columnID, i) => {
        let colData = formData.columns.get(columnID);
        return colData.config.width.replace('%', '');
      }).join(',');
      if (pMapVal) {
        pMapVal.forEach((val, i) => {
          let options = layoutPreset.options;
          if (val.value === curVal) {
            options[i].selected = true;
          } else {
            delete options[i].selected;
            options[options.length-1].selected = true;
          }
        });
      }
    } else {
      layoutPreset.options = pMap.get(1);
    }

    return layoutPreset;
  }

  /**
   * Set the widths of columns in a row
   * @param {Object} row DOM element
   * @param {String} widths
   */
  setColumnWidths(row, widths) {
    if (widths === 'custom') {
      return;
    }
    widths = widths.split(',');
    let columns = row.getElementsByClassName('stage-columns');
    h.forEach(columns, (column, i) => {
      let percentWidth = widths[i] + '%';
      column.dataset.colWidth = percentWidth;
      column.style.width = percentWidth;
      formData.columns.get(column.id).config.width = percentWidth;
    });
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
   * Returns the {x, y} coordinates for the
   * center of a given element
   * @param  {DOM} element
   * @return {Object}      {x,y} coordinates
   */
  coords(element) {
    let elemPosition = element.getBoundingClientRect();
    let bodyRect = document.body.getBoundingClientRect();

    return {
      pageX: elemPosition.left + (elemPosition.width / 2),
      pageY: (elemPosition.top - bodyRect.top) - (elemPosition.height / 2)
    };
  }

  /**
   * Loop through the formData and append it to the stage
   * @param  {Object} stage DOM element
   * @return {Array}  loaded rows
   */
  loadRows(stage) {
    if (!stage) {
      stage = this.activeStage;
    }

    let rows = formData.stages.get(stage.id).rows;
    return rows.forEach(rowID => {
      let row = this.addRow(stage.id, rowID);
      this.loadColumns(row);
      dom.updateColumnPreset(row);
      stage.appendChild(row);
    });
  }

  /**
   * Load columns to row
   * @param  {Object} row
   */
  loadColumns(row) {
    let columns = formData.rows.get(row.id).columns;
    columns.forEach(columnID => {
      let column = this.addColumn(row.id, columnID);
      this.loadFields(column);
    });
  }

  /**
   * Load a columns fields
   * @param  {Object} column column config object
   */
  loadFields(column) {
    let fields = formData.columns.get(column.id).fields;
    fields.forEach(fieldID => this.addField(column.id, fieldID));
    this.fieldOrderClass(column);
  }

  /**
   * Create or add a field and column then return it.
   * @param  {Object} evt Drag event data
   * @return {Object}     column
   */
  createColumn(evt) {
    let fType = evt.from.fType;
    let field = fType === 'columns' ? evt.item : new Field(evt.item.id);
    let column = new Column();

    field.classList.add('first-field');
    column.appendChild(field);
    formData.columns.get(column.id).fields.push(field.id);
    return column;
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
    let steps =document.querySelectorAll('.efb-steps .' + classes.step);
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
   * Return stage tabs
   * @param {Object} classes
   * @return {Object} stage tabs
   */
  getSteps(classes) {
    let _this = this;
    let steps = {
      tag: 'ul',
      attrs: {
        className: 'efb-steps p-0'
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
    _this.processStepClasses(type, obj2); // Processing class every time to override own styles
    return defaultValue == newValue ? defaultValue : newValue;
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
          this.checkValidity(this.renderTarget);
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
    if (formData.stages.size < 2) {
      return null;
    }
    let defaultConfig = _this.getTabDefaultConfigs();
    let tabSettings = formData.settings.get('tabSettings');
    if (typeof tabSettings == 'undefined') {
      tabSettings = defaultConfig;
    }
    let classes = {
      step: _this.getStepClass('default', defaultConfig, tabSettings),
      active: _this.getStepClass('active', defaultConfig, tabSettings),
      complete: _this.getStepClass('complete', defaultConfig, tabSettings),
      danger: _this.getStepClass('danger', defaultConfig, tabSettings)
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
        content: getString('efb-btn-previous')
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
        content: getString('efb-btn-next')
      }]
    };
    let stageNavigation = {
      navigation: navigation,
      steps: _this.getSteps(classes)
    };
    return stageNavigation;
  }

  /**
   * Creating designer container for the tab view
   * @param {Object} item droped item
   */
  createTabContainer(item) {
    let _this = this;
    data.addStage();
    let formWrapper = this.container.querySelector('.form-container');
    dom.activeStage = formWrapper.querySelector('.stage-wrap.active').querySelector('.stage');
    let stageTabControl = dom.getStageControl();
    let stageTabs = dom.create(stageTabControl);
    formWrapper.prepend(stageTabs);
    dom.remove(item);
    let tabControl = document.querySelector('.layout-tab-control');
    if (tabControl) {
      hideControl('layout-tab-control');
    }
    dom.tabSorting();
    _this.toggleFormDeleteAction();
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
      sourceSelected = _this.renderTarget.querySelectorAll('[id="' + sourceSelected + '"]');
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
    } else {
      container.style.display = 'none';
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
        let DOMrow = _this.renderTarget.querySelector('[id="' + id + '"]');
        DOMrow.style.display = 'none';
        _this.processEachCondition(row.conditions, DOMrow);
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
      'color': {
        title: getString('textcolor'),
        id: 'color',
        type: 'color',
        value: '#000000'
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
      },
      'style': {
        title: getString('customcssstyle'),
        id: 'style',
        type: 'textarea',
        value: ''
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
      },
      'style': {
        title: getString('customcssstyle'),
        id: 'style',
        type: 'textarea',
        value: ''
      }
    };
    return {
      form: formSettings,
      submit: submitButtonSetting
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
    let _this = this;
    this.renderTarget = renderTarget;
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
      content
    };

    renderTarget.appendChild(this.create(config));
    if (stageNavigation != null) {
      renderTarget.append(this.create(stageNavigation.navigation));
      renderTarget.prepend(this.create(stageNavigation.steps));
    } else {
      let stageNavigation = {
        tag: 'div',
        className: ['form-submit', this.getSubmitButtonPosition()],
        content: [dom.getFormSubmitButton()]
      };
      renderTarget.append(this.create(stageNavigation));
    }
    dom.applyConditions(formData.rows);
    dom.processFormSettings(renderTarget);
  }

  /**
   * Clears the editor
   * @param  {Object} evt
   */
  clearStep(evt) {
    this.clearStage(dom.activeStage);
    // this.stages.forEach(dStage => this.clearStage(dStage.stage));
  }

  /**
   * Clears the editor
   * @param  {Object} evt
   */
  clearAllSteps(evt) {
    this.stages.forEach(dStage => this.clearStage(dStage.stage));
  }
  /**
   * Clears the editor
   * @param  {Object} evt
   */
  clearForm(evt) {
    dom.clearStep(evt);
    let editor = document.getElementById('efb-cont-form-builder');
    let stages = editor.querySelectorAll('.stage-wrap:not(.active)');
    stages.forEach(stage => {
      let stageRemoveButton = editor.querySelector('.prop-remove[id="remove-stage-' + stage.id + '"]');
      dom.removeStage(stageRemoveButton, stage.id);
    });
  }

  /**
   * Removes all fields and resets a stage
   * @param  {[type]} stage DOM element
   */
  clearStage(stage) {
    stage.classList.add('removing-all-fields');
    const resetStage = () => {
      // Empty the data register for stage
      // and everything below it.
      dom.empty(stage);
      stage.classList.remove('removing-all-fields');
      data.save();
      dom.emptyClass(stage);
      animate.slideDown(stage, 300, function() {
        stage.style.height = '100%';
      });
    };

    // var markEmptyArray = [];

    // if (opts.prepend) {
    //   markEmptyArray.push(true);
    // }

    // if (opts.append) {
    //   markEmptyArray.push(true);
    // }

    // if (!markEmptyArray.some(elem => elem === true)) {
    // stage.classList.add('empty-stages');
    // }

    animate.slideUp(stage, 600, resetStage);
    // animate.slideUp(stage, 2000);
  }

  /**
   * Adds a row to the stage
   * @param {String} stageID
   * @param {String} rowID
   * @return {Object} DOM element
   */
  addRow(stageID, rowID) {
    let row = new Row(rowID);
    let stage = stageID ? this.stages.get(stageID).stage : this.activeStage;
    stage.appendChild(row);
    data.saveRowOrder(stage);
    this.emptyClass(stage);
    events.formeoUpdated = new CustomEvent('formeoUpdated', {
      data: {
        updateType: 'added',
        changed: 'row',
        oldValue: undefined,
        newValue: formData.rows.get(row.id)
      }
    });
    document.dispatchEvent(events.formeoUpdated);
    return row;
  }

  /**
   * Adds a Column to a row
   * @param {String} rowID
   * @param {String} columnID
   * @return {Object} DOM element
   */
  addColumn(rowID, columnID) {
    let column = new Column(columnID);
    let row = this.rows.get(rowID).row;
    row.appendChild(column);
    data.saveColumnOrder(row);
    this.emptyClass(row);
    events.formeoUpdated = new CustomEvent('formeoUpdated', {
      data: {
        updateType: 'added',
        changed: 'column',
        oldValue: undefined,
        newValue: formData.columns.get(column.id)
      }
    });
    document.dispatchEvent(events.formeoUpdated);
    return column;
  }

  /**
   * Toggles a sortables `disabled` option.
   * @param  {Object} elem DOM element
   * @param  {Boolean} state
   */
  toggleSortable(elem, state) {
    let {fType} = elem;
    if (!fType) {
      return;
    }
    let pFtype = elem.parentElement.fType;
    const sortable = dom[fType].get(elem.id).sortable;
    if (state === undefined) {
      state = !sortable.option('disabled');
    }
    sortable.option('disabled', state);
    if (pFtype && h.inArray(pFtype, ['rows', 'columns', 'stages'])) {
      this.toggleSortable(elem.parentElement, state);
    }
  }

  /**
   * Adds a field to a column
   * @param {String} columnID
   * @param {String} fieldID
   * @param {String} action
   * @return {Object} field
   */
  addField(columnID, fieldID, action = null) {
    let field;
    if (action == 'clone') {
      field = new Field(fieldID, action);
    } else {
      field = new Field(fieldID);
    }
    if (columnID) {
      let column = this.columns.get(columnID).column;
      column.appendChild(field);
      data.saveFieldOrder(column);
      this.emptyClass(column);
    }
    events.formeoUpdated = new CustomEvent('formeoUpdated', {
      data: {
        updateType: 'add',
        changed: 'field',
        oldValue: undefined,
        newValue: formData.fields.get(field.id)
      }
    });
    document.dispatchEvent(events.formeoUpdated);
    return field;
  }

  /**
   * Toggle form actions depending on stages status
   */
  toggleFormDeleteAction() {
    if (this.container) {
      let action = this.container.querySelector('.item-delete-form');
      let result = formData.fields.size == 0 && formData.stages.size == 1;
      if (action) {
        action.classList.toggle('d-none', result);
        action.parentElement.parentElement.classList.toggle('hide-delete', result);
      }
    }
  }


  /**
   * Aplly empty class to element if does not have children
   * @param  {Object} elem
   */
  emptyClass(elem) {
    let type = elem.fType;
    if (type) {
      let childMap = new Map();
      childMap.set('rows', 'columns');
      childMap.set('columns', 'fields');
      childMap.set('stages', 'rows');
      let children = elem.getElementsByClassName(`stage-${childMap.get(type)}`);
      elem.classList.toggle(`empty-${type}`, !children.length);
      if (type == 'stages') {
        this.toggleFormDeleteAction();
      }
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
   * Style Object
   * @param  {Object} rules
   * @return {Number} index of added rule
   */
  insertRule(rules) {
    const styleSheet = this.styleSheet;
    let rulesLength = styleSheet.cssRules.length;
    for (let i = 0, rl = rules.length; i < rl; i++) {
      let j = 1;
      let rule = rules[i];
      let selector = rules[i][0];
      let propStr = '';
      // If the second argument of a rule is an array
      // of arrays, correct our variables.
      if (Object.prototype.toString.call(rule[1][0]) === '[object Array]') {
        rule = rule[1];
        j = 0;
      }

      for (let pl = rule.length; j < pl; j++) {
        let prop = rule[j];
        let important = (prop[2] ? ' !important' : '');
        propStr += `${prop[0]}:${prop[1]}${important};`;
      }

      // Insert CSS Rule
      return styleSheet.insertRule(`${selector} { ${propStr} }`, rulesLength);
    }
  }

  /**
   * Filter fields and choose only select and radio fields
   * @param {Array} fields
   * @return {Array} fields
   */
  filterFieldsSelectRadio(fields) {
    let filter = [];
    formData.fields.forEach(function(field, index) {
      if (fields.includes(field.id) && (field.tag == 'select' || (field.tag == 'input' && field.attrs.type == 'radio'))) {
        filter.push(field);
      }
    });
    return filter;
  }

  /**
   * Return condition position, input position from conditions container and row container
   * @param {Event} event
   * @param {String} type of element being changed add|delete|source|value|operator
   * @return {Object} conditon including condition position, input position and row container
   */
  conditionPositions(event, type) {
    let panel;
    let conditions;
    let condition;
    panel = closest(event.target, 'panel-conditions');
    conditions = panel.getElementsByClassName('conditions')[0];
    conditions = conditions.childNodes;
    switch (type) {
      case 'add':
        condition = conditions[conditions.length - 1];
        break;
      case 'source':
      case 'value':
      case 'operator':
      case 'delete':
        condition = closest(event.target, 'condition');
    }
    return {
      row: closestFtype(event.target),
      conditionIndex: Array.prototype.indexOf.call(conditions, condition),
      condition: condition.childNodes[0],
      type: type
    };
  }

  /**
   * Adding dropdown change event to source list
   * @param {Event} event change event
   */
  conditionSourceChange(event) {
    let targetID = event.target.value;
    let select = {
      tag: 'select',
      attrs: {
        type: 'select'
      },
      options: []
    };
    if (targetID != 'choose') {
      select.options = formData.fields.get(targetID).options;
    }
    let value = event.target.nextSibling;
    value.innerHTML = '';
    if (select.options.length > 0) {
      select = dom.create(select);
      let options = select.childNodes;
      while(options.length) {
        value.appendChild(options[0]);
      }
      value.firstChild.selected = true;
    }
  }

  /**
   * Filter all fields and only those which can be added in current rows conditions
   * @param {String} currentRow id
   * @return {Object} fields
   */
  getValidFields(currentRow) {
    let fields = [];
    let columns = [];
    formData.rows.forEach(function(row, index) {
      if (row.id != currentRow) {
        columns = columns.concat(row.columns);
      }
    });
    if (columns.length) {
      formData.columns.forEach(function(column, index) {
        if (columns.includes(column.id)) {
          fields = fields.concat(column.fields);
        }
      });
    }
    fields = this.filterFieldsSelectRadio(fields);
    return fields;
  }

  /**
   * Checking is there control which can be added only once
   */
  checkSingle() {
    defaultElements.forEach(function(defaultElement, index) {
      if (defaultElement.hasOwnProperty('config') && defaultElement.config.hasOwnProperty('single') && defaultElement.config.single) {
        let className = `.${defaultElement.meta.group}-control.${defaultElement.meta.id}-control`;
        let show = true;
        formData.fields.forEach(function(element, index) {
          if (element.meta.group == defaultElement.meta.group && element.meta.id == defaultElement.meta.id) {
            show = false;
          }
        });
        show == true ? showControl(`${defaultElement.meta.id}-control`) : hideControl(`${defaultElement.meta.id}-control`);
      }
    });
  }

  /**
   * Show pro warning to user
   * @param {String} msg for warning
   */
  proWarning(msg = null) {
    let _this = this;
    if (typeof msg == 'object') {
      msg = getString('profeaturemessage', msg);
    } else {
      msg = getString('profeature', msg);
    }
    let warning = {
      tag: 'div',
      content: msg
    };
    warning = dom.create(warning);
    dom.multiActions(
      'warning',
      getString('hey-wait'),
      warning,
      [{
        title: getString('upgrade'),
        type: 'success',
        action: function() {
          alert('Redirect to PRO version download page.');
        }
      }, {
        title: getString('later'),
        type: 'secondary'
      }]
    );
  }

  /**
   * Return dialog object with passed contents
   * @param {String} id of modal
   * @param {Array} content to add in dialog
   * @param {function} keyup events
   * @return {Object} dialog for modal
   */
  modalContainer(id, content, keyup) {
    let dialog = {
      tag: 'div',
      attrs: {
        className: 'modal-wrap',
        role: 'wrap'
      },
      content: [{
        tag: 'div',
        attrs: {
          className: 'modal-dialog',
          role: 'document'
        },
        content: [{
          tag: 'div',
          className: 'modal-content',
          content: content
        }],
        action: {
          keyup: keyup
        }
      }]
    };
    document.addEventListener('keyup', keyup);
    return {
      tag: 'div',
      id: id,
      attrs: {
        className: 'efb-modal modal fade',
        role: 'dialog',
        'aria-hidden': true
      },
      content: [dialog]
    };
  }

  /**
   * return object for modal header
   * @param {String} id of modal
   * @param {String} title for modal
   * @return {Object} header of modal
   * @param {String} type of prompt window
   * @param {function} keyup function
   */
  modalHeader(id, title, type, keyup) {
    let _this = this;
    let action = {
      click: evt => {
        _this.removeModal(id, keyup);
      }
    };
    return {
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
          action: action
        }],
        action: action
      }, {
        tag: 'h4',
        attrs: {
          className: 'modal-title',
          id: 'modal-' + id
        },
        content: title
      }]
    };
  }

  /**
   * @param {Object} modal object
   */
  addModal(modal) {
    modal = dom.create(modal);
    document.querySelector('body').appendChild(modal);
    setTimeout(function() {
      modal.classList.toggle('show');
      let event = new CustomEvent('focus', {target: modal});
      modal.dispatchEvent(event);
    }, 150);
  }

  /**
   * removing modal
   * @param {String} id of modal element
   * @param {function} keyup function
   */
  removeModal(id, keyup = null) {
    let modal = document.getElementById(id);
    modal.classList.remove('show');
    setTimeout(function() {
      modal.remove();
      if (keyup) {
        document.removeEventListener('keyup', keyup);
      }
    }, 150);
  }

  /**
   * Toaster modal
   * @param {String} title for prompt window
   * @param {Number} time
   */
  toaster(title, time = 2000) {
    let id = uuid();
    let toast = this.create({
      tag: 'div',
      attrs: {
        id,
        className: 'efb-toaster toaster-container',
      },
      content: [{
        tag: 'lable',
        className: 'toaster-message',
        content: title
      }]
    });
    document.querySelector('body').appendChild(toast);
    document.getElementById(id).classList.add('show');
    setTimeout(function() {
      document.getElementById(id).classList.add('fade');
      setTimeout(function() {
        document.getElementById(id).classList.remove('fade');
        setTimeout(function() {
          document.getElementById(id).remove();
        }, time);
      }, time);
    });
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
    let title = getString(type);
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
          className: 'btn btn-success',
          type: 'button'
        },
        content: getString('ok'),
        action: {
          click: evt => {
            _this.removeModal(id, keyup);
            if (action != null) {
              action();
            }
          },
          keyup: keyup
        }
      }]
    };
    let modal = _this.modalContainer(id, [_this.modalHeader(id, title, type, keyup), body, footer], keyup);
    _this.addModal(modal);
  }

  /**
   * @param {String} type of prompt window
   * @param {String} title for prompt window
   * @param {String} msg for prompt window
   * @param {function} actions function
   */
  multiActions(type, title, msg, actions) {
    let _this = this;
    let id = uuid();
    let keyup = evt => {
      if(evt.keyCode == 27) {
        _this.removeModal(id, keyup);
      }
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
      content: []
    };
    actions.forEach(function(button, i) {
      footer.content.push({
        tag: 'button',
        attrs: {
          className: `btn btn-${button.type}`,
          type: 'button'
        },
        content: button.title,
        action: {
          click: evt => {
            if (button.action) {
              let status = button.action(evt);
              if (typeof status == 'boolean' && status == false) {
                return;
              }
            }
            _this.removeModal(id, keyup);
          }
        }
      });
    });
    let modal = _this.modalContainer(id, [_this.modalHeader(id, title, type, keyup), body, footer], keyup);
    _this.addModal(modal);
  }

  /**
   * @param {String} type of prompt window
   * @param {String} title for prompt window
   * @param {String} msg for prompt window
   * @param {function} action function
   */
  confirm(type, title, msg, action) {
    let _this = this;
    let id = uuid();
    let applyAction = () => {
      action();
      _this.removeModal(id, keyup);
    };
    let keyup = evt => {
      if (evt.keyCode == 13) {
        applyAction();
        this.onkeyup = null;
      } else if(evt.keyCode == 27) {
        _this.removeModal(id, keyup);
        this.onkeyup = null;
      }
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
          className: 'btn btn-success',
          type: 'button'
        },
        content: getString('proceed'),
        action: {
          click: applyAction
        }
      }, {
        tag: 'button',
        attrs: {
          className: 'btn btn-danger',
          type: 'button'
        },
        content: getString('cancel'),
        action: {
          click: evt => {
            _this.removeModal(id, keyup);
          }
        }
      }]
    };
    let modal = _this.modalContainer(id, [_this.modalHeader(id, title, type, keyup), body, footer], keyup);
    _this.addModal(modal);
  }

  /**
   * @param {String} type of prompt window
   * @param {String} title for prompt window
   * @param {function} addAction function
   */
  prompt(type, title, addAction) {
    let _this = this;
    let id = uuid();
    let applied = false;
    let applyAction = () => {
      let attr = document.getElementById('attr-' + id).value;
      let value = document.getElementById('value-' + id).value;
      _this.removeModal(id, keyup);
      if (attr) {
        if (!applied) {
          applied = true;
          addAction(attr, value);
        }
      }
    };
    let keyup = evt => {
      if (evt.keyCode == 13) {
        applyAction();
      } else if(evt.keyCode == 27) {
        _this.removeModal(id, keyup);
      }
    };
    let body = {
      tag: 'div',
      className: 'modal-body',
      content: [{
        tag: 'input',
        attrs: {
          id: 'attr-' + id,
          className: 'form-control',
          type: 'text'
        },
        config: {
          label: getString('attribute')
        },
        action: {
          keyup: keyup
        }
      }, {
        tag: 'input',
        attrs: {
          id: 'value-' + id,
          className: 'form-control',
          type: 'text'
        },
        config: {
          label: getString('value')
        },
        action: {
          keyup: keyup
        }
      }]
    };
    let footer = {
      tag: 'div',
      className: 'modal-footer',
      content: [{
        tag: 'button',
        attrs: {
          className: 'btn btn-success',
          type: 'button'
        },
        content: getString('proceed'),
        action: {
          click: applyAction
        }
      }, {
        tag: 'button',
        attrs: {
          className: 'btn btn-danger',
          type: 'button'
        },
        content: getString('cancel'),
        action: {
          click: evt => {
            _this.removeModal(id, keyup);
          }
        }
      }]
    };
    let modal = _this.modalContainer(id, [_this.modalHeader(id, title, type, keyup), body, footer], keyup);
    _this.addModal(modal);
  }

}

const dom = new DOM();

export default dom;
