import Sortable from 'sortablejs';
import {data, formData, registeredFields as rFields} from '../common/data';
import h from '../common/helpers';
import events from '../common/events';
import {match, unique, uuid, getString, closest} from '../common/utils';
import dom from '../common/dom';

let opts = {};

const defaultElements = [{
  tag: 'div',
  config: {
    label: getString('tab')
  },
  meta: {
    group: 'layout',
    icon: 'tab',
    id: 'layout-tab'
  }
}, {
  tag: 'div',
  config: {
    label: getString('column')
  },
  meta: {
    group: 'layout',
    icon: 'columns',
    id: 'layout-column'
  }
}, {
  tag: 'div',
  config: {
    label: getString('row')
  },
  meta: {
    group: 'layout',
    icon: 'rows',
    id: 'layout-row'
  },
  conditions: []
}, {
  tag: 'input',
  attrs: {
    type: 'text',
    required: false,
    className: 'form-control',
    style: ''
  },
  config: {
    disabledAttrs: ['type', 'template', 'name'],
    label: getString('input.text')
  },
  meta: {
    group: 'standard',
    icon: 'text-input',
    id: 'text-input'
  },
  fMap: 'attrs.value'
}, {
  tag: 'input',
  attrs: {
    type: 'email',
    required: false,
    className: 'form-control',
    style: ''
  },
  config: {
    disabledAttrs: ['type', 'template', 'name'],
    label: getString('email')
  },
  meta: {
    group: 'standard',
    icon: 'email',
    id: 'email'
  },
  fMap: 'attrs.value',
}, {
  tag: 'input',
  attrs: {
    type: 'number',
    required: false,
    className: 'form-control',
    style: ''
  },
  config: {
    label: getString('number'),
    disabledAttrs: ['type', 'template', 'name']
  },
  meta: {
    group: 'standard',
    icon: 'hash',
    id: 'number'
  },
  fMap: 'attrs.value',
}, {
  tag: 'input',
  attrs: {
    type: 'password',
    required: true,
    className: 'form-control',
    style: ''
  },
  config: {
    label: getString('password'),
    disabledAttrs: ['type', 'template', 'name']
  },
  meta: {
    group: 'standard',
    icon: 'password',
    id: 'password'
  }
}, {
  tag: 'select',
  config: {
    label: getString('select'),
    disabledAttrs: ['template', 'name']
  },
  attrs: {
    required: false,
    className: 'form-control',
    style: ''
  },
  meta: {
    group: 'standard',
    icon: 'select',
    id: 'select'
  },
  options: [1, 2, 3, 4].map(i => {
    return {
      label: 'option label-' + i,
      value: 'option-' + i,
      selected: false
    };
  })
}, {
  tag: 'input',
  attrs: {
    type: 'date',
    required: false,
    className: 'form-control',
    style: ''
  },
  config: {
    disabledAttrs: ['type', 'template', 'name'],
    label: getString('input.date')
  },
  meta: {
    group: 'standard',
    icon: 'calendar',
    id: 'date-input'
  }
}, {
  tag: 'button',
  attrs: {
    className: [
      {label: getString('grouped'), value: 'btn-group'},
      {label: getString('ungrouped'), value: 'f-field-group'},
    ],
    style: ''
  },
  config: {
    label: getString('button'),
    hideLabel: true,
    disabledAttrs: ['type', 'template'],
    disabledControl: true
  },
  meta: {
    group: 'standard',
    icon: 'button',
    id: 'button'
  },
  options: [{
    label: getString('button'),
    type: [
      {label: getString('button'), value: 'button', selected: true},
      {label: getString('reset'), value: 'reset'},
      {label: getString('submit'), value: 'submit'},
    ],
    className: [
      {
        label: getString('default'),
        value: 'btn',
        selected: true
      },
      {
        label: getString('primary'),
        value: 'btn btn-primary'
      },
      {
        label: getString('secondary'),
        value: 'btn btn-secondary'
      },
      {
        label: getString('success'),
        value: 'btn btn-success'
      },
      {
        label: getString('info'),
        value: 'btn btn-info'
      },
      {
        label: getString('warning'),
        value: 'btn btn-warning'
      },
      {
        label: getString('danger'),
        value: 'btn btn-danger'
      },
      {
        label: getString('dark'),
        value: 'btn btn-dark'
      },
      {
        label: getString('light'),
        value: 'btn btn-light'
      },
      {
        label: getString('link'),
        value: 'btn btn-link'
      },
    ]
  }]
}, {

  tag: 'textarea',
  config: {
    label: getString('textarea'),
    disabledAttrs: ['name']
  },
  // This is the beginning of actions being supported for render
  // editor field actions should be in config.action
  meta: {
    group: 'standard',
    icon: 'textarea',
    id: 'textarea'
  },
  attrs: {
    required: false,
    className: 'form-control',
    style: ''
  }
}, {
  tag: 'input',
  attrs: {
    type: 'checkbox',
    required: false,
    name: 'checkbox',
    style: ''
  },
  config: {
    label: getString('checkbox') + '/' + getString('group'),
    disabledAttrs: ['type', 'template']
  },
  meta: {
    group: 'standard',
    icon: 'checkbox',
    id: 'checkbox'
  },
  options: [1, 2, 3].map(i => {
    return {
      label: 'Checkbox -' + i,
      value: 'checkbox value-' + i,
      selected: false
    };
  })
}, {
  tag: 'input',
  attrs: {
    type: 'radio',
    required: false,
    style: ''
  },
  config: {
    label: getString('radioGroup'),
    disabledAttrs: ['type', 'template', 'name']
  },
  meta: {
    group: 'standard',
    icon: 'radio-group',
    id: 'radio'
  },
  options: [1, 2, 3].map(i => {
    return {
      label: 'Radio-' + i,
      value: 'radio value-' + i,
      selected: false
    };
  })
}, {
  tag: 'input',
  attrs: {
    type: 'file',
    required: false,
    className: 'form-control',
    style: ''
  },
  config: {
    disabledAttrs: ['type', 'template', 'name'],
    label: getString('fileUpload')
  },
  meta: {
    group: 'standard',
    icon: 'upload',
    id: 'upload'
  },
  fMap: 'attrs.value',
}, {
  tag: 'input',
  attrs: {
    type: 'hidden',
    name: 'hidden',
    value: ''
  },
  config: {
    label: getString('hidden'),
    disabledAttrs: ['type', 'template'],
    hideLabel: true,
    disabledControl: true
  },
  meta: {
    group: 'standard',
    icon: 'hidden',
    id: 'hidden'
  },
  fMap: 'attrs.value'
}, {
  tag: 'datalist',
  config: {
    label: getString('datalist'),
    hideLabel: true,
    showLabelEdit: true,
    editable: true
  },
  meta: {
    group: 'standard',
    icon: 'datalist',
    id: 'datalist'
  },
  fMap: 'attrs.value',
  attrs: {
    id: 'datalist'
  },
  options: [1, 2, 3, 4].map(i => {
    return {
      value: 'Option - ' + i
    };
  })
}, {
  tag: 'input',
  attrs: {
    type: 'text',
    pattern: '^(\\+[0-9]{0,2})?0?[0-9]{10}$',
    required: false,
    value: ''
  },
  config: {
    disabledAttrs: ['type', 'template', 'pattern', 'name'],
    label: getString('mobile')
  },
  meta: {
    group: 'advance',
    icon: 'mobile',
    id: 'mobile'
  },
  fMap: 'attrs.value'
}, {
  tag: 'input',
  attrs: {
    type: 'text',
    pattern: '((http|https)\:\/\/)?(w{3}\.)?[a-zA-Z]+.[a-zA-Z.]+.*',
    required: false,
    value: ''
  },
  config: {
    disabledAttrs: ['type', 'template', 'pattern', 'name'],
    label: getString('website')
  },
  meta: {
    group: 'advance',
    icon: 'website',
    id: 'website'
  },
  fMap: 'attrs.value'
}, {
  tag: 'div',
  attrs: {
    className: 'g-recaptcha',
  },
  config: {
    disabledAttrs: ['template', 'className'],
    recaptcha: true,
    label: getString('reCaptcha'),
    single: true
  },
  meta: {
    group: 'advance',
    icon: 'recaptcha',
    id: 'recaptcha'
  }
}, {
  tag: 'a',
  attrs: {
    className: '',
    href: '#',
    style: ''
  },
  config: {
    label: getString('link'),
    editable: true,
    hideLabel: true
  },
  meta: {
    group: 'html',
    icon: 'link',
    id: 'link'
  },
  content: 'Link'
}, {
  tag: 'h1',
  attrs: {
    tag: [
      {value: 'h1', label: 'H1'},
      {value: 'h2', label: 'H2'},
      {value: 'h3', label: 'H3'},
      {value: 'h4', label: 'H4'}
    ],
    className: '',
    style: ''
  },
  config: {
    label: getString('header'),
    editable: true,
    hideLabel: true
  },
  meta: {
    group: 'html',
    icon: 'header',
    id: 'header'
  },
  content: getString('header')
}, {
  tag: 'p',
  attrs: {
    className: '',
    style: ''
  },
  config: {
    label: getString('paragraph'),
    hideLabel: true,
    editable: true,
  },
  meta: {
    group: 'html',
    icon: 'paragraph',
    id: 'paragraph'
  },
  //eslint-disable-next-line
  content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed iaculis quam et ipsum interdum vehicula. Cras molestie eleifend ligula eget.'
}, {
  tag: 'hr',
  config: {
    label: getString('separator'),
    hideLabel: true
  },
  meta: {
    group: 'html',
    icon: 'divider',
    id: 'divider'
  }
}];

/**
 *
 */
export class Controls {
  /**
   * Setup defaults and return Controls DOM
   * @param  {Object} controlOptions
   * @param  {String} formID
   */
  constructor(controlOptions, formID) {
    let _this = this;
    this.formID = formID;
    let {groupOrder = []} = controlOptions;
    this.groupOrder = unique(groupOrder.concat([
      'standard',
      'advance',
      'html',
      'layout',
    ]));
    this.cPosition = {};

    this.defaults = {
      sortable: true,
      elementOrder: {},
      groups: [{
        id: 'layout',
        label: getString('layout'),
        elementOrder: [
          'row',
          'column'
        ]
      }, {
        id: 'standard',
        label: getString('standardFields'),
        elementOrder: [
        'button',
        'checkbox',
        ]
      }, {
        id: 'advance',
        label: getString('advanceFields'),
        elementOrder: []
      }, {
        id: 'html',
        label: getString('htmlElements'),
        elementOrder: [
          'header',
          'block-text'
        ]
      }],
      disable: {
        groups: [],
        elements: []
      },
      elements: []
    };

    opts = h.merge(this.defaults, controlOptions);

    opts.elements = opts.elements.concat(defaultElements);
    opts.elements = this.filterDisabledControls(opts.elements);
    this.controlEvents = {
      // Removing focus event because panels are not used anymore
      // focus: evt => {
      //     let currentGroup = closestFtype(evt.target);
      //     _this.panels.nav.refresh(h.indexOfNode(currentGroup));
      //   },
      click: evt => {
        let text = evt.target.lastChild.wholeText;
        dom.proWarning(text);
      }
      // mousedown: evt => {
      //   let position = _this.cPosition;
      //   position.x = evt.clientX;
      //   position.y = evt.clientY;
      // },
      // mouseup: evt => {
      //   let position = _this.cPosition;
      //   if (clicked(evt.clientX, evt.clientY, position, evt.button)) {
      //     dom.proWarning();
      //   }
      // }
    };
    this.buildDOM();
  }

  /**
   * Dragging form the control bar clears element
   * events lets add them back after drag.
   * @param  {Object} evt
   */
  applyControlEvents(evt) {
    let {item} = evt;
    let {clone} = evt;
    clone.classList.remove('sortable-choosen');
    clone.style.display = 'block';
    let control = document.getElementById(item.id);
    let button = control.querySelector('button');
    let actions = Object.keys(this.controlEvents);
    for (let i = actions.length - 1; i >= 0; i--) {
      let event = actions[i];
      button.addEventListener(event, this.controlEvents[event]);
    }
  }

  /**
   * Generate control config for UI and bind actions
   * @param  {Object} elem
   * @return {Object} elementControl
   */
  prepElement(elem) {
    let _this = this;
    let dataID = uuid();
    let button = {
      tag: 'button',
      attrs: {
        className: 'btn btn-primary',
        type: 'button'
      },
      content: [elem.config.label],
      action: _this.controlEvents,
    };
    let elementControl = {
      tag: 'li',
      className: [
        'px-0',
        'py-5',
        'list-group-item',
        'field-control',
        `${elem.meta.group}-control`,
        `${elem.meta.id}-control`,
      ],
      id: dataID,
      cPosition: {},
      content: button
    };

    if (elem.meta.icon) {
      button.content.unshift(dom.icon(elem.meta.icon));
    }

    // Add field to the register by uuid and meta id
    rFields[dataID] = rFields[elem.meta.id] = elem;
    return elementControl;
  }

  /**
   * Filtering controls and hiding disabled controls from control list
   * @param {Object} elements of control elements
   * @return {Object} elements of filtered controls
   */
  filterDisabledControls(elements) {
    let allowedElements = [];
    h.forEach(elements, function(control, i) {
      if (control.config.disabledControl == true) {
        return;
      }
      allowedElements.push(control);
    });
    return allowedElements;
  }

  /**
   * Group elements into their respective control group
   * @return {Array} allGroups
   */
  groupElements() {
    let _this = this;
    let groups = opts.groups.slice();
    let elements = opts.elements.slice();
    let allGroups = [];
    let usedElementIds = [];

    // Apply order to Groups
    // groups = h.orderObjectsBy(groups, this.groupOrder, 'id');

    // remove disabled groups
    groups = groups.filter(group => match(group.id, opts.disable.groups));

    // create group config
    allGroups = h.map(groups, (i) => {
      let label = {
        tag: 'div',
        className: 'control-label',
        content: [{
          tag: 'h4',
          content: [groups[i].label || '', {
            tag: 'i',
            attrs: {
              className: 'fa fa-angle-right',
              'aria-hidden': 'true'
            }
          }],
          action: {
            click: evt => {
              let target = evt.target;
              if (target.tagName == 'I') {
                target = target.parentElement;
              }
              let parent = target.parentElement.parentElement;
              let list = target.parentElement.nextSibling;
              if(parent.classList.contains('collapsed-controls')) {
                if (!evt.detail.hasOwnProperty('fAction')) {
                  let allLists = target.parentElement.parentElement.parentElement.querySelectorAll('.control-label h4');
                  allLists.forEach(function(node, i) {
                    if (node != target && !node.parentElement.parentElement.classList.contains('collapsed-controls')) {
                      evt = new CustomEvent('click', {
                        target: node, detail: {
                          fAction: 'collapse-only'
                        }
                      });
                      node.dispatchEvent(evt);
                    }
                  });
                }
                parent.classList.remove('collapsed-controls');
                list.style.height = 'auto';
                let height = list.clientHeight + 'px';
                list.style.height = '0px';
                setTimeout(() => {
                    list.style.height = height;
                }, 0);
              } else {
                list.style.height = '0px';
                list.addEventListener('transitionend', () => {
                  parent.classList.add('collapsed-controls');
                }, {once: true});
              }
            }
          }
        }]
      };
      let list = {
        tag: 'ul',
        attrs: {
          className: ['control-list', 'list-group'],
          id: _this.formID + '-' + groups[i].id + '-control-list'
        },
        fType: 'controlGroup',
      };

      // Apply order to elements
      if (opts.elementOrder[groups[i].id]) {
        let userOrder = opts.elementOrder[groups[i].id];
        let newOrder = unique(userOrder.concat(groups[i].elementOrder));
        groups[i].elementOrder = newOrder;
      }
      // elements = h.orderObjectsBy(elements, groups[i].elementOrder, 'meta.id');
      /**
       * Fill control groups with their fields
       * @param  {Object} field Field configuration object.
       * @return {Array}        Filtered array of Field config objects
       */
      list.content = elements.filter(field => {
        let fieldId = field.meta.id || '';
        let filters = [
          match(fieldId, opts.disable.elements),
          (field.meta.group === groups[i].id),
          !h.inArray(field.meta.id, usedElementIds)
        ];

        let shouldFilter = true;
        shouldFilter = filters.every(val => val === true);
        if (shouldFilter) {
          usedElementIds.push(fieldId);
        }

        return shouldFilter;
      }).map(field => _this.prepElement.call(this, field));
      let group = {
        tag: 'div',
        className: 'control-group collapsed-controls',
        content: [label, list]
      };
      return group;
    });

    return allGroups;
  }

  /**
   * Returns the markup for the form controls/fields
   * @return {DOM}
   */
  buildDOM() {
    if (this.element) {
      return this.element;
    }
    let _this = this;
    let groupedFields = this.groupElements();
    // _this.panels = new Panels({panels: groupedFields, type: 'controls'});
    let groupsWrapClasses = [
      'control-groups',
      'panels-wrap',
      `panel-count-${groupedFields.length}`
    ];
    let groupsWrap = dom.create({
      tag: 'div',
      className: groupsWrapClasses,
      // content: _this.panels.content
      content: groupedFields
    });

    let controlsToggle = {
      tag: 'div',
      className: 'controls-toggle bg-primary',
      content: [{
        tag: 'i',
        attrs: {
          className: 'fa fa-angle-right',
          'aria-hidden': 'true'
        }
      }],
      action: {
        click: event => {
          let container = closest(event.target, 'formeo');
          container.parentElement.classList.toggle('hidden-controls');
          dom.repositionPanels(container);
          document.dispatchEvent(new CustomEvent('controlsCollapsed', {
            detail: {
              collapsed: container.parentElement.classList.contains('hidden-controls'),
            }
          }));
        }
      }
    };

    let element = dom.create({
        tag: 'div',
        className: this.formID + '-controls formeo-controls',
        content: [controlsToggle, groupsWrap]
      });
    let groups = element.getElementsByClassName('control-list');

    this.element = element;
    this.groups = groups;
    this.currentGroup = groups[0];

    this.actions = {
      addElement: dom.proWarning,
      addGroup: (group) => console.log(group)
    };

    // Make controls sortable
    for (let i = groups.length - 1; i >= 0; i--) {
      let storeID = `formeo-controls-${groups[i]}`;
      if (!opts.sortable) {
        localStorage.removeItem(storeID);
      }
      Sortable.create(groups[i], {
        animation: 150,
        forceFallback: true,
        fallbackClass: 'control-moving',
        fallbackOnBody: true,
        group: {
          name: 'controls',
          pull: 'clone',
          put: false
        },
        onRemove: _this.applyControlEvents.bind(_this),
        sort: opts.sortable,
        store: {
          /**
           * Get the order of elements.
           * @param   {Sortable}  sortable
           * @return {Array}
           */
          get: sortable => {
            let order = localStorage.getItem(storeID);
            return order ? order.split('|') : [];
          },

          /**
           * Save the order of elements.
           * @param {Sortable}  sortable
           */
          set: sortable => {
            let order = sortable.toArray();
            localStorage.setItem(storeID, order.join('|'));
          }
        }
      });
    }

    return element;
  }

}
export default defaultElements;
