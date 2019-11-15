import {data, formData, registeredFields as rFields} from '../common/data';
import animate from '../common/animation';
import h from '../common/helpers';
import actions from '../common/actions';
import dom from '../common/dom';
import defaultElements from '../components/controls';
import Panels from './panels';
import {uuid, getString, closest, clone, cleanObj} from '../common/utils';

/**
 * Element/Field class.
 */
export default class Field {
  /**
   * Set defaults and load fieldData
   * @param  {String} dataID existing field ID
   * @param  {String} action
   * @return {Object} field object
   */
  constructor(dataID, action = null) {
    const _this = this;

    const fieldData = formData.fields.get(dataID) || clone(rFields[dataID]);
    if (action == 'clone' && 'template' in fieldData.attrs) {
      delete fieldData.attrs.template;
    }
    _this.fieldID = fieldData.id || uuid();
    _this.metaID = fieldData.meta.id;
    fieldData.id = _this.fieldID;

    formData.fields.set(_this.fieldID, fieldData);
    this.fieldData = fieldData;

    let field = {
      tag: 'li',
      attrs: {
        className: `stage-fields field-type-${fieldData.meta.id}`
      },
      id: _this.fieldID,
      content: [
        dom.actionButtons(_this.fieldID, 'field'), // FieldEdit window
        _this.fieldEdit(), // FieldEdit window
      ],
      panelNav: _this.panelNav,
      dataset: {
        hoverTag: getString('field')
      },
      fType: 'fields',
      action: {
        mouseenter: evt => {
          const field = document.getElementById(_this.fieldID);
          field.classList.add('hovering-field');
        },
        mouseleave: evt => {
          const field = document.getElementById(_this.fieldID);
          field.classList.remove('hovering-field');
        }
      }
    };

    field = dom.create(field);

    dom.fields.set(_this.fieldID, {
      field,
      instance: _this
    });

    _this.preview = dom.create(_this.fieldPreview());
    field.appendChild(_this.preview);

    return field;
  }

  /**
   * Updates a field's preview
   * @return {Object} fresh preview
   */
  updatePreview() {
    const _this = this;
    const fieldData = h.copyObj(formData.fields.get(_this.fieldID));
    console.log(h.get(fieldData, 'config.label'));
    const newPreview = dom.create(fieldData, true);
    dom.empty(_this.preview);
    _this.preview.appendChild(newPreview);

    return newPreview;
  }

  /**
   * Generates the edit panel for attrs, meta and options for a fields(s)
   * @param  {String} panelType
   * @return {Object}           formeo DOM config object
   */
  editPanel(panelType) {
    const _this = this;
    const fieldData = formData.fields.get(_this.fieldID);
    let propType;
    let panel;
    const panelWrap = {
      tag: 'div',
      className: 'f-panel-wrap',
      content: []
    };

    if (fieldData[panelType]) {
      panel = {
        tag: 'ul',
        attrs: {
          className: [
            'field-edit-group',
            'field-edit-' + panelType
          ]
        },
        editGroup: panelType,
        isSortable: (panelType === 'options'),
        content: []
      };
      propType = dom.contentType(fieldData[panelType]);


      let panelArray;
      if (propType === 'array') {
        panelArray = fieldData[panelType];
        panelWrap.content.push(_this.panelHeading({
          panelArray,
          panelType,
          fieldData
        }));
      } else {
        panelArray = Object.keys(fieldData[panelType]);
      }

      panelWrap.content.push(panel);
      h.forEach(panelArray, (dataProp, i) => {
        if (this.isAllowedAttr(dataProp)) {
          const args = {
            i,
            dataProp,
            fieldData,
            panelType,
            propType
          };
          panel.content.push(_this.panelContent(args));
        }
      });
    }

    return panelWrap;
  }

  /**
   * Field panel heading for options
   * @param  {Object} args
   * @return {Object} heading
   */
  panelHeading(args) {
    const heading = {
      tag: 'div',
      className: 'prop-heading-wrap',
      content: []
    };
    for (const [name] of Object.entries(args.panelArray[0])) {
      let label = args.fieldData.tag.toLowerCase();
      if (args.fieldData.attrs != undefined && args.fieldData.attrs.type != undefined) {
        label += '-' + args.fieldData.attrs.type.toLowerCase();
      }
      label += '-' + args.panelType + '-' + name;
      heading.content.push({
        tag: 'label',
        className: label,
        content: getString(label)
      });
    }
    return heading;
  }

  /**
   * Field panel contents, `attrs`, `options`, `config`
   * @param  {Object} args
   * @return {Object} DOM element
   */
  panelContent(args) {
    const _this = this;
    let {panelType, dataProp} = args;
    const fieldData = formData.fields.get(_this.fieldID);
    dataProp = (typeof dataProp === 'string') ? dataProp : args.i;
    const id = uuid();
    const propVal = fieldData[panelType][dataProp];
    const inputs = {
      tag: 'div',
      className: ['prop-inputs', 'form-group'],
      content: _this.editPanelInputs(dataProp, propVal, panelType, id)
    };
    const property = {
      tag: 'li',
      className: [`${panelType}-${dataProp}-wrap`, 'prop-wrap'],
      id: id,
      content: []
    };
    const order = {
      tag: 'button',
      attrs: {
        type: 'button',
        className: 'btn btn-primary prop-order prop-control',
        title: getString('order-option')
      },
      content: dom.icon('move-vertical')
    };
    const remove = {
      tag: 'button',
      attrs: {
        type: 'button',
        className: 'btn btn-danger prop-remove prop-control',
        title: getString('remove-' + panelType)
      },
      action: {
        click: (evt) => {
          animate.slideUp(document.getElementById(property.id), 666, elem => {
            const parent = elem.parentElement;
            const fieldData = formData.fields.get(_this.fieldID);
            const fieldPanelData = fieldData[panelType];
            dom.remove(elem);
            if (Array.isArray(fieldPanelData)) {
              fieldPanelData.splice(dataProp, 1);
            } else {
              delete fieldPanelData[dataProp];
            }
            data.save(panelType, parent);
            dom.empty(_this.preview);
            const newPreview = dom.create(fieldData, true);
            _this.preview.appendChild(newPreview);
            _this.resizePanelWrap();
          });
        }
      },
      content: dom.icon('remove')
    };
    const controls = {
      tag: 'div',
      className: 'prop-controls',
      content: [remove]
    };

    if (args.propType === 'array') {
      inputs.className.push('f-input-group');
      controls.content.unshift(order);
    }

    property.propData = fieldData[panelType][dataProp];

    // Checks if the property is allowed
    if (!this.isAllowedAttr(dataProp)) {
      return '';
    }
    property.content.push(controls, inputs);

    property.className.push('control-count-' + controls.content.length);

    return property;
  }

  /**
   * Escaping the html pattern before saving to database
   * @param {String} pattern
   * @return {String} escaped html pattern
   */
  escapeRegExp(pattern) {
    return pattern.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  /**
   * Unescaping the html pattern before saving to database
   * @param {String} pattern
   * @return {String} unescaped html pattern
   */
  unescapeRegExp(pattern) {
    return pattern.replace(/[\\]/g, '&');
  }

  /**
   * Generate the inputs for an edit panel
   * @param  {String} prop      property name
   * @param  {String|Array} propVal   property value
   * @param  {String} panelType attrs, options, config
   * @param  {String} id        [description]
   * @return {Array} element config array
   */
  editPanelInputs(prop, propVal, panelType, id) {
    const _this = this;
    const inputs = [];
    const fieldData = formData.fields.get(_this.fieldID);
    fieldData.attrs.placeholder = fieldData.attrs.placeholder ? fieldData.attrs.placeholder : fieldData.config.label;
    const isOption = (panelType === 'options');
    const processProperty = (key, val) => {
      const propType = dom.contentType(val, key);
      const propIsNum = (typeof prop === 'number');
      let fMap = panelType + '.' + key;

      if (propIsNum) {
        fMap = `${panelType}[${prop}].${key}`;
      }
      const typeAttrs = (key, val, type) => {
        const placeholder = getString(`placeholder.${key}`);
        const attrs = {
          string: {
            className: 'form-control',
            type: 'text',
            value: val,
            placeholder
          },
          boolean: {
            get type() {
              let boolType = 'checkbox';
              if (_this.fieldData.tag === 'select' && key === 'selected') {
                boolType = 'radio';
              }
              if (_this.fieldData.attrs) {
                const attrType = _this.fieldData.attrs.type;
                if (attrType === 'radio' && key === 'selected') {
                  boolType = 'radio';
                }
              }
              return boolType;
            },
            value: val
          },
          number: {
            type: 'number',
            value: val
          },
          array: {
            className: '',
          },
          textarea: {
            placeholder,
            rows: 8
          }
        };
        return attrs[type];
      };
      const inputLabel = key => {
        const labelKey = panelType + '.' + key;
        return getString(labelKey) || h.capitalize(key);
      };
      const propertyInputs = {
        array: (key, val) => {
          const select = {
            fMap,
            tag: 'select',
            id: `${prop}-${id}`,
            attrs: typeAttrs(key, val, 'array'),
            config: {
              label: inputLabel(key),
              hideLabel: isOption
            },
            content: val.map(v => {
              return {
                tag: 'option',
                attrs: {
                  value: v.value,
                  selected: v.selected
                },
                content: v.label
              };
            }),
            action: {
              change: evt => {
                const values = [];
                const propData = fieldData[panelType][prop];
                const optionData = isOption ? propData[key] : propData;
                const newValue = optionData.map(value => {
                  // eslint-disable-next-line
                    let {selected, ...option} = value;
                  values.push(option.value);
                  return option;
                });

                const index = values.indexOf(evt.target.value);
                newValue[index].selected = true;
                if (isOption) {
                  prop = h.indexOfNode(evt.target.closest('.prop-wrap'));
                  fMap = `${panelType}[${prop}].${key}`;
                }
                h.set(fieldData, fMap, newValue);
                data.save();
                _this.updatePreview();
              }
            },
          };
          return select;
        },
        string: (key, val) => {
          const input = {
            fMap,
            tag: 'input',
            id: `${prop}-${id}`,
            attrs: typeAttrs(key, val, 'string'),
            action: {
              change: evt => {
                if (isOption) {
                  prop = h.indexOfNode(evt.target.closest('.prop-wrap'));
                  fMap = `${panelType}[${prop}].${key}`;
                }
                const value = evt.target.value;
                if (h.isHtml(value)) {
                  evt.target.value = h.stripHtml(value);
                  return;
                }
                h.set(fieldData, fMap, key == 'pattern' ? _this.escapeRegExp(value) : value);
                data.save();
                _this.updatePreview();
              }
            },
          };

          if (!propIsNum) {
            input.config = {
              label: inputLabel(key)
            };
          }

          return input;
        },
        textarea: (key, val) => {
          const input = {
            fMap,
            tag: 'textarea',
            id: `${prop}-${id}`,
            attrs: typeAttrs(key, val, 'textarea'),
            content: val,
            action: {
              change: evt => {
                if (isOption) {
                  prop = h.indexOfNode(evt.target.closest('.prop-wrap'));
                  fMap = `${panelType}[${prop}].${key}`;
                }
                h.set(fieldData, fMap, evt.target.value);
                data.save();
                _this.updatePreview();
              }
            },
          };
          if (!propIsNum) {
            input.config = {
              label: inputLabel(key)
            };
          }
          return input;
        },
        boolean: (key, val) => {
          let input = {
            tag: 'input',
            attrs: typeAttrs(key, val, 'boolean'),
            fMap,
            id: prop + '-' + id,
            name: _this.fieldID + '-selected',
            action: {
              change: evt => {
                if (fieldData.tag == 'select' || (fieldData.attrs.type && fieldData.attrs.type == 'radio')) {
                  fieldData.options.forEach(option => {
                    option.selected = false;
                  });
                }
                if (isOption) {
                  prop = h.indexOfNode(evt.target.closest('.prop-wrap'));
                  fMap = `${panelType}[${prop}].${key}`;
                }
                h.set(fieldData, fMap, evt.target.checked);
                data.save();// Saving attributes value when toggle checkbox
                _this.updatePreview();
              }
            }
          };

          if (val) {
            input.attrs.checked = val;
          }

          if (propIsNum) {
            const addon = {
              tag: 'span',
              className: 'f-addon',
              content: dom.checkbox(input)
            };
            input = addon;
          } else {
            input.config = {
              label: inputLabel(key)
            };
          }


          return input;
        },
        object: (objKey, objVal) => {
          const inputs = [];

          for (const objProp in objVal) {
            if (h.get(objVal, objProp)) {
              if (isOption && fieldData.tag == 'input' && objProp == 'name') {
                delete objProp.name;
                continue;
              }
              if (Object.prototype.hasOwnProperty.call(objVal, objProp)) {
                inputs.push(processProperty(objProp, objVal[objProp]));
              }
            }
          }

          return inputs;
        }
      };

      propertyInputs.number = propertyInputs.string;

      return propertyInputs[propType](key, val);
    };

    inputs.push(processProperty(prop, propVal));

    return inputs;
  }


  /**
   * Checks if attribute is allowed to be edited
   * @param  {String}  attr
   * @return {Boolean}      [description]
   */
  isAllowedAttr(attr = 'type') {
    const _this = this;
    let allowed = true;
    const disabledAttrs = rFields[_this.metaID].config.disabledAttrs;
    if (disabledAttrs) {
      allowed = !h.inArray(attr, disabledAttrs);
    }

    return allowed;
  }

  /**
   * Get data of element from defaultElements;
   * @param {String} type key
   * @return {Object} data of element
   */
  getElementData(type) {
    const _this = this;
    const metaID = _this.metaID;
    for (let i = 0; i < defaultElements.length; i++) {
      if (defaultElements[i].meta.id == metaID) {
        let data = defaultElements[i][type];
        if (Array.isArray(data)) {
          data = data[0];
        }
        return data;
      }
    }
    return {};
  }

  /**
   * Get next element position in wrapper division
   * @param {Dom} element Dom wrapper element
   * @return {Integer} next index value of childNode
   */
  getNextChildIndex(element) {
    if (element.hasChildNodes) {
      return element.childNodes.length;
    }
    return 0;
  }

  /**
   * Add a new attribute to the attrs panels
   * @param {String} attr
   * @param {String|Array} val
   */
  addAttribute(attr, val) {
    if (!this.isAllowedAttr(attr)) {
      let str = getString('attributenotpermitted');
      str = str.replace('{{attr}}', attr);
      dom.alert('warning', str);
    }

    const _this = this;
    const field = document.getElementById(_this.fieldID);
    const editGroup = field.querySelector('.field-edit-attrs');
    const safeAttr = h.hyphenCase(attr);
    const fieldData = formData.fields.get(_this.fieldID);

    if (typeof val === 'string' && h.inArray(val, ['true', 'false'])) {
      val = JSON.parse(val);
      if (attr == 'pattern') {
        val = _this.unescapeRegExp(val);
      }
    }

    fieldData.attrs[safeAttr] = val;

    const args = {
      dataObj: fieldData,
      dataProp: safeAttr,
      i: Object.keys(fieldData.attrs).length,
      panelType: 'attrs'
    };

    const existingAttr = editGroup.querySelector(`.attrs-${safeAttr}-wrap`);
    const attribute = _this.panelContent(args);
    if (attribute) {
      const newAttr = dom.create(attribute);
      if (existingAttr) {
        editGroup.replaceChild(newAttr, existingAttr);
      } else {
        editGroup.appendChild(newAttr);
      }

      data.save(args.panelType, editGroup);
      _this.updatePreview();
      _this.resizePanelWrap();
    }
  }

  /**
   * Add option to options panel
   */
  addOption() {
    const _this = this;
    const field = dom.fields.get(_this.fieldID).field;
    const fieldData = formData.fields.get(_this.fieldID);
    const optionData = _this.getElementData('options');
    const editGroup = field.querySelector('.field-edit-options');
    const propData = cleanObj(optionData);
    fieldData.options.push(propData);
    const args = {
      i: _this.getNextChildIndex(editGroup),
      dataProp: propData,
      dataObj: fieldData,
      panelType: 'options',
      propType: 'array'
    };

    editGroup.appendChild(dom.create(_this.panelContent(args)));
    _this.resizePanelWrap();

    // Save Fields Attrs
    data.save();
    dom.empty(_this.preview);
    const newPreview = dom.create(formData.fields.get(_this.fieldID), true);
    _this.preview.appendChild(newPreview);
  }

  /**
   * Generate edit buttons for interacting with attrs and options panel
   * @param  {String} type
   * @return {Object} panel edit buttons config
   */
  panelEditButtons(type) {
    const _this = this;
    const addBtn = {
      tag: 'button',
      attrs: {
        type: 'button',
        className: `add-${type} btn btn-primary`
      },
      content: getString(`panelEditButtons.${type}`),
      action: {
        click: (evt) => {
          const addEvt = {
            btnCoords: dom.coords(evt.target)
          };

          switch (type) {
            case 'attrs':
              addEvt.addAction = _this.addAttribute.bind(_this);
              addEvt.message = {
                attr: getString('action.add.attrs.attr'),
                value: getString('action.add.attrs.value')
              };
              break;
            case 'options':
              addEvt.addAction = _this.addOption.bind(_this);
              break;
          }

          const eventType = h.capitalize(type);
          const customEvt = new CustomEvent(`onAdd${eventType}`, {
            detail: addEvt
          });

          // Run Action Hook
          actions.add[type](addEvt);

          // Fire Event
          document.dispatchEvent(customEvt);
        }
      }
    };
    const panelEditButtons = {
      tag: 'div',
      attrs: {
        className: 'panel-action-buttons'
      },
      content: [addBtn]
    };

    return panelEditButtons;
  }

  /**
   * @return {Object} fieldEdit element config
   */
  fieldEdit() {
    const _this = this;
    const panels = [];
    const editable = ['object', 'array'];
    const noPanels = ['config', 'meta', 'action'];
    const fieldData = formData.fields.get(_this.fieldID);
    const allowedPanels = Object.keys(fieldData).filter(elem => {
      return !h.inArray(elem, noPanels);
    });

    const fieldEdit = {
      tag: 'div',
      className: ['field-edit', 'slide-toggle', 'panels-wrap']
    };

    h.forEach(allowedPanels, (panelType, i) => {
      const propType = dom.contentType(fieldData[panelType]);
      if (h.inArray(propType, editable)) {
        const panel = {
          tag: 'div',
          attrs: {
            className: `f-panel ${panelType}-panel`
          },
          config: {
            label: getString(`panelLabels.${panelType}`) || ''
          },
          content: [
            _this.editPanel(panelType),
            _this.panelEditButtons(panelType)
          ],
          action: {
            // Change: evt => {
            // let fieldData = formData.fields.get(_this.fieldID);
            //   if (evt.target.fMap) {
            //     let value = evt.target.value;
            //     let targetType = evt.target.type;
            //     if (targetType === 'checkbox' || targetType === 'radio') {
            //       let options = fieldData.options;
            //       value = evt.target.checked;

            //       // uncheck options if radio
            //       if (evt.target.type === 'radio') {
            //         options.forEach(option => option.selected = false);
            //       }
            //     }

            //     h.set(fieldData, evt.target.fMap, value);
            //     data.save(panelType, _this.fieldID);
            //     // throttle this for sure
            //     _this.updatePreview();
            //   }
            // }
          }
        };

        panels.push(panel);
      }
    });

    const panelsConfig = {
      panels,
      id: _this.fieldID
    };

    if (panels.length) {
      const editPanels = _this.panels = new Panels(panelsConfig);
      fieldEdit.className.push('panel-count-' + panels.length);
      fieldEdit.content = editPanels.content;
      _this.panelNav = editPanels.nav;
      _this.resizePanelWrap = editPanels.actions.resize;
    } else {
      setTimeout(() => {
        const field = dom.fields.get(_this.fieldID).field;
        const editToggle = field.querySelector('.item-edit-toggle');
        const fieldActions = field.querySelector('.field-actions');
        const actionButtons = fieldActions.getElementsByTagName('button');
        fieldActions.style.maxWidth = `${actionButtons.length * 24}px`;
        dom.remove(editToggle);
      }, 0);
    }

    return fieldEdit;
  }

  /**
   * Generate field preview config
   * @return {Object} fieldPreview
   */
  fieldPreview() {
    const _this = this;
    const fieldData = clone(formData.fields.get(_this.fieldID));
    // Const field = dom.fields.get(_this.fieldID).field;
    // const togglePreviewEdit = evt => {
    //   const column = field.parentElement;
    //   if (evt.target.contentEditable === 'true') {
    //     if (h.inArray(evt.type, ['focus', 'blur'])) {
    //       let isActive = document.activeElement === evt.target;
    //       column.classList.toggle('editing-field-preview', isActive);
    //       dom.toggleSortable(field.parentElement, (evt.type === 'focus'));
    //     } else if(h.inArray(evt.type, ['mousedown', 'mouseup'])) {
    //       dom.toggleSortable(field.parentElement, (evt.type === 'mousedown'));
    //     }
    //   }
    // };

    fieldData.id = 'prev-' + _this.fieldID;

    const fieldPreview = {
      tag: 'div',
      attrs: {
        className: 'field-preview'
      },
      content: dom.create(fieldData, true),
      action: {
        // Focus: togglePreviewEdit,
        // blur: togglePreviewEdit,
        // mousedown: togglePreviewEdit,
        // mouseup: togglePreviewEdit,
        change: evt => {
          const {target} = evt;
          if (target.fMap) {
            const fieldData = formData.fields.get(_this.fieldID);
            const {checked, type, fMap} = target;
            if (h.inArray(type, ['checkbox', 'radio'])) {
              const options = fieldData.options;

              // Uncheck options if radio
              if (type === 'radio') {
                options.forEach(option => {
                  option.selected = false;
                });
              }
              h.set(fieldData, fMap, checked);

              data.save();
            }
          }
        },
        click: evt => {
          if (evt.target.contentEditable === 'true') {
            evt.preventDefault();
          }
        },
        input: evt => {
          const fieldData = formData.fields.get(_this.fieldID);
          let prop = 'content';
          if (evt.target.fMap) {
            prop = evt.target.fMap;
          }
          const setData = () => {
            if (evt.target.contentEditable === 'true') {
              if (prop == 'config.label' && h.isHtml(evt.target.innerHTML)) {
                evt.target.innerHTML = h.stripHtml(evt.target.innerHTML);
                evt.target.focus();
                document.execCommand('selectAll', false, null);
                document.getSelection().collapseToEnd();
              }
              if (evt.target.innerHTML == '') {
                evt.target.innerHTML = ' ';
              }
              h.set(fieldData, prop, evt.target.innerHTML);
            } else {
              h.set(fieldData, prop, evt.target.value);
            }
          };
          setData();
          const preview = closest(evt.target, 'field-preview');
          const placeHolderInput = preview.previousSibling.querySelector('.attrs-placeholder-wrap');
          if (!placeHolderInput) {
            prop = 'attrs.placeholder';
            setData();
          }
          data.save('field', _this.fieldID);
        },
        focusout: evt => {
          this.updatePreview();
        }
      }
    };

    return fieldPreview;
  }
}
