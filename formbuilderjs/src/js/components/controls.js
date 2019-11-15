import Sortable from 'sortablejs';
import {registeredFields as rFields} from '../common/data';
import h from '../common/helpers';
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
    name: '',
    className: 'form-control',
    style: ''
  },
  config: {
    disabledAttrs: ['type', 'template'],
    label: getString('input.text')
  },
  meta: {
    group: 'standard',
    icon: 'text-input',
    id: 'text-input'
  },
  fMap: 'attrs.value'
}, {
  tag: 'textarea',
  config: {
    label: getString('textarea'),
    disabledAttrs: ['template']
  },
  meta: {
    group: 'standard',
    icon: 'textarea',
    id: 'textarea'
  },
  attrs: {
    required: false,
    name: '',
    className: 'form-control',
    style: ''
  }
}, {
  tag: 'select',
  config: {
    label: getString('select'),
    disabledAttrs: ['template']
  },
  attrs: {
    required: false,
    name: '',
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
    type: 'radio',
    name: '',
    required: false,
    style: ''
  },
  config: {
    label: getString('radioGroup'),
    disabledAttrs: ['type', 'template']
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
    type: 'checkbox',
    name: '',
    required: false,
    style: ''
  },
  config: {
    label: getString('checkbox') + ' - ' + getString('checkboxes'),
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
    type: 'number',
    required: false,
    className: 'form-control',
    name: '',
    style: ''
  },
  config: {
    label: getString('number'),
    disabledAttrs: ['type', 'template']
  },
  meta: {
    group: 'standard',
    icon: 'hash',
    id: 'number'
  },
  fMap: 'attrs.value',
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
  tag: 'input',
  attrs: {
    type: 'text',
    required: false,
    className: 'form-control',
    style: ''
  },
  config: {
    disabledAttrs: ['type', 'template'],
    label: getString('control-name'),
    composite: true
  },
  meta: {
    group: 'advance',
    icon: 'user-circle',
    id: 'name'
  },
  fMap: 'attrs.value'
}, {
  tag: 'input',
  attrs: {
    type: 'date',
    required: false,
    className: 'form-control',
    name: '',
    style: ''
  },
  config: {
    disabledAttrs: ['type', 'template'],
    label: getString('input.date')
  },
  meta: {
    group: 'advance',
    icon: 'calendar',
    id: 'date-input'
  }
}, {
  tag: 'input',
  attrs: {
    type: 'text',
    pattern: '^(\\+[0-9]{0,2})?0?[0-9]{10}$',
    className: 'form-control',
    name: 'mobile',
    required: false,
    value: ''
  },
  config: {
    disabledAttrs: ['type', 'template', 'pattern'],
    label: getString('mobile')
  },
  meta: {
    group: 'advance',
    icon: 'mobile',
    id: 'mobile'
  },
  fMap: 'attrs.value'
}, {
  tag: 'select',
  config: {
    label: getString('country'),
    disabledAttrs: ['template']
  },
  attrs: {
    required: false,
    name: 'country',
    className: 'form-control',
    style: ''
  },
  meta: {
    group: 'advance',
    icon: 'flag',
    id: 'country'
  }
}, {
  tag: 'input',
  attrs: {
    type: 'text',
    required: false,
    className: 'form-control',
    style: ''
  },
  config: {
    disabledAttrs: ['type', 'template'],
    label: getString('address'),
    composite: true
  },
  meta: {
    group: 'advance',
    icon: 'address-card',
    id: 'address'
  },
  fMap: 'attrs.value'
}, {
  tag: 'input',
  attrs: {
    type: 'text',
    pattern: '^((http|https)://)?(w{3}.)?[a-zA-Z]+.[a-zA-Z.]+.*$',
    required: false,
    name: 'website',
    value: ''
  },
  config: {
    disabledAttrs: ['type', 'template', 'pattern'],
    label: getString('website')
  },
  meta: {
    group: 'advance',
    icon: 'globe',
    id: 'website'
  },
  fMap: 'attrs.value'
}, {
  tag: 'input',
  attrs: {
    type: 'text',
    required: true,
    name: 'username',
    className: 'form-control',
    style: ''
  },
  config: {
    label: getString('username'),
    disabledAttrs: ['type', 'template']
  },
  meta: {
    group: 'advance',
    icon: 'user',
    id: 'username'
  }
}, {
  tag: 'input',
  attrs: {
    type: 'password',
    required: true,
    name: 'password',
    className: 'form-control',
    style: ''
  },
  config: {
    label: getString('password'),
    disabledAttrs: ['type', 'template']
  },
  meta: {
    group: 'advance',
    icon: 'key',
    id: 'password'
  }
}, {
  tag: 'input',
  attrs: {
    type: 'email',
    required: false,
    name: 'email',
    className: 'form-control',
    style: ''
  },
  config: {
    disabledAttrs: ['type', 'template'],
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
    type: 'file',
    required: false,
    name: '',
    className: 'form-control',
    style: ''
  },
  config: {
    disabledAttrs: ['type', 'template'],
    label: getString('fileUpload')
  },
  meta: {
    group: 'advance',
    icon: 'upload',
    id: 'upload'
  },
  fMap: 'attrs.value',
}, {
  tag: 'input',
  attrs: {
    type: 'hidden',
    name: '',
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
    icon: 'repeat',
    id: 'recaptcha'
  }
}, {
  tag: 'input',
  attrs: {
    type: 'text',
    name: 'website',
    pattern: '((http|https)://)?(w{3}.)?[a-zA-Z]+.[a-zA-Z.]+.*',
    required: false,
    value: ''
  },
  config: {
    disabledAttrs: ['type', 'template', 'pattern'],
    label: getString('website')
  },
  meta: {
    group: 'advance',
    icon: 'website',
    id: 'website'
  },
  fMap: 'attrs.value'
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
  // eslint-disable-next-line
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
    this.formID = formID;
    const {groupOrder = []} = controlOptions;
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
        dom.proWarning({
          type: evt.target.lastChild.wholeText,
          video: evt.target.getAttribute('data-control-type'),
          message: ''
        });
      }
      // Mousedown: evt => {
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
    const {item} = evt;
    const {clone} = evt;
    clone.classList.remove('sortable-choosen');
    clone.style.display = 'block';
    const control = document.getElementById(item.id);
    const button = control.querySelector('button');
    const actions = Object.keys(this.controlEvents);
    for (let i = actions.length - 1; i >= 0; i--) {
      const event = actions[i];
      button.addEventListener(event, this.controlEvents[event]);
    }
  }

  /**
   * Generate control config for UI and bind actions
   * @param  {Object} elem
   * @return {Object} elementControl
   */
  prepElement(elem) {
    const _this = this;
    const dataID = uuid();
    const button = {
      tag: 'button',
      attrs: {
        className: 'btn btn-primary',
        type: 'button',
        'data-control-type': elem.meta.group
      },
      content: [elem.config.label],
      action: _this.controlEvents,
    };
    const elementControl = {
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
    const allowedElements = [];
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
    const _this = this;
    let groups = opts.groups.slice();
    const elements = opts.elements.slice();
    let allGroups = [];
    const usedElementIds = [];

    // Apply order to Groups
    // groups = h.orderObjectsBy(groups, this.groupOrder, 'id');

    // remove disabled groups
    groups = groups.filter(group => match(group.id, opts.disable.groups));

    // Create group config
    allGroups = h.map(groups, (i) => {
      const label = {
        tag: 'div',
        className: 'control-label',
        content: [{
          tag: 'h4',
          content: [groups[i].label || '', {
            tag: 'label',
            className: 'efb-forms-pro-label m-0',
            content: getString('efb-pro-label')
          }, {
            tag: 'i',
            attrs: {
              className: 'fa fa-angle-right',
              'aria-hidden': 'true'
            }
          }],
          action: {
            click: evt => {
              let target = evt.target;
              if (target.tagName == 'I' || target.tagName == 'LABEL') {
                target = target.parentElement;
              }
              const parent = target.parentElement.parentElement;
              const list = target.parentElement.nextSibling;
              if (parent.classList.contains('collapsed-controls')) {
                if (!Object.prototype.hasOwnProperty.call(evt.detail, 'fAction')) {
                  const allLists = target.parentElement.parentElement.parentElement.querySelectorAll('.control-label h4');
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
                const height = list.clientHeight + 'px';
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
      const list = {
        tag: 'ul',
        attrs: {
          className: ['control-list', 'list-group'],
          id: _this.formID + '-' + groups[i].id + '-control-list'
        },
        fType: 'controlGroup',
      };

      // Apply order to elements
      if (opts.elementOrder[groups[i].id]) {
        const userOrder = opts.elementOrder[groups[i].id];
        const newOrder = unique(userOrder.concat(groups[i].elementOrder));
        groups[i].elementOrder = newOrder;
      }
      // Elements = h.orderObjectsBy(elements, groups[i].elementOrder, 'meta.id');
      /**
       * Fill control groups with their fields
       * @param  {Object} field Field configuration object.
       * @return {Array}        Filtered array of Field config objects
       */
      list.content = elements.filter(field => {
        const fieldId = field.meta.id || '';
        const filters = [
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
      const group = {
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
    const _this = this;
    const groupedFields = this.groupElements();
    // _this.panels = new Panels({panels: groupedFields, type: 'controls'});
    const groupsWrapClasses = [
      'control-groups',
      'panels-wrap',
      `panel-count-${groupedFields.length}`
    ];
    const groupsWrap = dom.create({
      tag: 'div',
      className: groupsWrapClasses,
      // Content: _this.panels.content
      content: groupedFields
    });

    const controlsToggle = {
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
          const container = closest(event.target, 'formeo');
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

    const element = dom.create({
      tag: 'div',
      className: this.formID + '-controls formeo-controls',
      content: [controlsToggle, groupsWrap]
    });
    const groups = element.getElementsByClassName('control-list');

    this.element = element;
    this.groups = groups;
    this.currentGroup = groups[0];

    this.actions = {
      addElement: (evt) => {
        dom.proWarning({
          type: evt.target.lastChild.wholeText,
          video: evt.target.getAttribute('data-control-type'),
          message: ''
        });
      },
      addGroup: (group) => console.log(group)
    };

    // Make controls sortable
    for (let i = groups.length - 1; i >= 0; i--) {
      const storeID = `formeo-controls-${groups[i]}`;
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
            const order = localStorage.getItem(storeID);
            return order ? order.split('|') : [];
          },

          /**
           * Save the order of elements.
           * @param {Sortable}  sortable
           */
          set: sortable => {
            const order = sortable.toArray();
            localStorage.setItem(storeID, order.join('|'));
          }
        }
      });
    }

    return element;
  }
}
export default defaultElements;
