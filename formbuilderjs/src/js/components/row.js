import Sortable from 'sortablejs';
import dom from '../common/dom';
import h from '../common/helpers';
import animate from '../common/animation';
import {data, formData, registeredFields as rFields} from '../common/data';
import {uuid, getString, closest, closestFtype} from '../common/utils';
import Panels from './panels';

/**
 * Editor Row
 */
export default class Row {

  /**
   * Set default and generate dom for row in editor
   * @param  {String} dataID
   * @return {Object}
   */
  constructor(dataID) {
    let _this = this;
    let defaults;
    let row;

    let rowID = _this.rowID = dataID || uuid();

    defaults = {
        columns: [],
        id: _this.rowID,
        config: {
          fieldset: false, // wrap contents of row in fieldset
          legend: '', // Legend for fieldset
          inputGroup: false // is repeatable input-group?
        },
        attrs: {
          className: 'f-row'
        },
        conditions: []
      };

    let rowData = formData.rows.get(rowID);

    formData.rows.set(rowID, h.merge(defaults, rowData));

    let panel = new Panels({
      panels: _this.editWindow.content,
      type: rowID
    });
    panel.tag = 'div';
    panel.className = 'row-edit panels-wrap tabbed-panels';
    panel.action = {
      click: event => {
        let row = closestFtype(event.target);
        let firstLabel = row.getElementsByClassName('row-edit')[0].getElementsByClassName('panel-labels')[0].getElementsByTagName('h5')[0];
        let columns = row.getElementsByClassName('stage-columns');
        if (row.classList.contains('editing-row') && firstLabel.classList.contains('active-tab')) {
          for (let i = 0; i < columns.length; i++) {
            columns[i].classList.remove('hide-column');
          }
        } else {
          for (let i = 0; i < columns.length; i++) {
            columns[i].classList.add('hide-column');
          }
        }
      }
    };
    row = {
      tag: 'li',
      className: 'stage-rows empty-rows',
      dataset: {
        hoverTag: getString('row'),
        editingHoverTag: getString('editing.row')
      },
      id: rowID,
      content: [dom.actionButtons(rowID, 'row'), panel],
      fType: 'rows'
    };

    row = dom.create(row);

    const sortable = Sortable.create(row, {
      animation: 150,
      fallbackClass: 'column-moving',
      forceFallback: true,
      group: {name: 'rows', pull: true, put: ['rows', 'controls', 'columns']},
      sort: true,
      onRemove: _this.onRemove,
      onEnd: _this.onEnd,
      onAdd: _this.onAdd,
      onSort: _this.onSort,
      draggable: '.stage-columns',
      filter: '.resize-x-handle'
    });

    dom.rows.set(rowID, {row, sortable});

    return row;
  }
  /**
   * remove condition from condition container
   */
  get removeCondition() {
    let _this = this;
    return {
      tag: 'button',
      className: 'condition-delete condition-control',
      content: dom.icon('remove'),
      action: {
        click: event => {
          event.preventDefault();
          const element = event.target.parentElement.parentElement;
          let conditions = closest(event.target, 'conditions');
          animate.slideUp(element, 666, elem => {
            let condition = dom.conditionPositions(event, 'delete');
            dom.remove(elem);
            _this.resizeConditions(conditions);
            data.saveConditionalLogics(condition, 'delete');
          });
        }
      }
    };
  }

 /**
  * Wrap condition into container
  * @param {Object} input wrapped source and value
  * @return {Object} wrapped contianer
  */
  wrapCondition(input) {
    let _this = this;
    let source = input.content[0];
    let value = input.content[1];
    let operator = input.content[2];
    source.action = {
      change: event => {
        dom.conditionSourceChange(event);
        let condition = dom.conditionPositions(event, 'source');
        data.saveConditionalLogics(condition);
        condition = dom.conditionPositions(event, 'value');
        data.saveConditionalLogics(condition);
      }
    };
    value.action = {
      change: event => {
        let condition = dom.conditionPositions(event, 'value');
        data.saveConditionalLogics(condition);
      }
    };
    operator.action= {
      change: event => {
        let condition = dom.conditionPositions(event, 'operator');
        data.saveConditionalLogics(condition);
      }
    };
    input.content[0] = source;
    input.content[1] = value;
    input.content[2] = operator;
    let conditionControls = {
      tag: 'div',
      className: 'condition-controls',
      content: [_this.removeCondition]
    };
    let condition = {
      tag: 'li',
      className: 'condition',
      content: [input, conditionControls]
    };
    return condition;
  }

  /**
   * Code to add logics
   * @param {String} row id
   * @param {Object} container element where conditions will be displayed
   */
  addCondition(row, container) {
    let _this = this;
    let fields = dom.getValidFields(row);
    let options = [{
      label: 'Choose source',
      value: 'choose',
      selected: true
    }];
    for (let i = 0; i < fields.length; i++) {
      options.push({
        label: fields[i].config.label,
        value: fields[i].id
      });
    }
    let source = {
      tag: 'select',
      className: 'condition-source condition-input',
      options: options
    };
    let value = {
      tag: 'select',
      className: 'condition-value condition-input'
    };
    let operator = {
      tag: 'select',
      className: 'condition-operator condition-input',
      options: [{
        label: 'AND',
        value: 'AND',
        selected: true
      }, {
        label: 'OR',
        value: 'OR'
      }],
      action: {
        change: event => {
          let condition = dom.conditionPositions(event, 'operator');
          data.saveConditionalLogics(condition);
        }
      }
    };
    let input = {
      tag: 'div',
      className: 'condition-inputs',
      content: [source, value, operator]
    };
    let wrapped = _this.wrapCondition(input);
    container.append(dom.create(wrapped));
  }

  /**
   * [editWindow description]
   * @return {[type]} [description]
   */
  get editWindow() {
    let _this = this;
    let rowData = formData.rows.get(_this.rowID);

    let editWindow = {
      tag: 'div',
      className: 'panels row-edit group-config'
    };
    let fieldsetLabel = {
      tag: 'label',
      content: getString('row.settings.fieldsetWrap')
    };
    let fieldsetInput = {
      tag: 'input',
      id: _this.rowID + '-fieldset',
      attrs: {
        type: 'checkbox',
        checked: rowData.config.fieldset,
        ariaLabel: getString('row.settings.fieldsetWrap.aria')
      },
      action: {
        click: e => {
          rowData.config.fieldset = e.target.checked;
          data.save();
        }
      }
    };

    // let inputGroupInput = {
    //   tag: 'input',
    //   id: _this.rowID + '-inputGroup',
    //   attrs: {
    //     type: 'checkbox',
    //     checked: rowData.config.inputGroup,
    //     ariaLabel: getString('row.settings.inputGroup.aria')
    //   },
    //   action: {
    //     click: e => {
    //       rowData.config.inputGroup = e.target.checked;
    //       data.save();
    //     }
    //   },
    //   config: {
    //     label: getString('row.makeInputGroup'),
    //     description: getString('row.makeInputGroupDesc')
    //   }
    // };

    let inputAddon = {
      tag: 'span',
      className: 'input-group-addon',
      content: fieldsetInput
    };
    let legendInput = {
      tag: 'input',
      attrs: {
        type: 'text',
        ariaLabel: getString('legendfieldset'),
        value: rowData.config.legend,
        placeholder: 'Legend'
      },
      action: {
        input: e => {
          rowData.config.legend = e.target.value;
          data.save();
        }
      },
      className: ''
    };
    let fieldsetInputGroup = {
      tag: 'div',
      className: 'input-group',
      content: [inputAddon, legendInput]
    };

    let fieldSetControls = [
      fieldsetLabel,
      fieldsetInputGroup
    ];
    fieldSetControls = dom.formGroup(fieldSetControls);
    let columnSettingsLabel = Object.assign({}, fieldsetLabel, {
      content: getString('columnwidths')
    });
    let columnSettingsPresetLabel = Object.assign({}, fieldsetLabel, {
      content: 'Layout Preset', className: 'col-sm-4 form-control-label'
    });
    let columnSettingsPresetSelect = {
      tag: 'div',
      className: 'col-sm-8',
      content: dom.columnPresetControl(_this.rowID)
    };
    let formGroupContent = [
      columnSettingsPresetLabel,
      columnSettingsPresetSelect
    ];
    let columnSettingsPreset = dom.formGroup(formGroupContent, 'row');
    let rowConfigPanel = {
      tag: 'div',
      className: 'f-panel row-config',
      config: {
        label: getString('containersettings')
      },
      content: [
        // inputGroupInput,
        // dom.create('hr'),
        fieldSetControls,
        dom.create('hr'),
        columnSettingsLabel,
        columnSettingsPreset
      ]
    };
    let conditionPanel = {
      tag: 'div',
      config: {
        label: getString('conditions')
      },
      className: 'f-panel panel-conditions',
      content: _this.conditions(rowData)
    };
    editWindow.content = [rowConfigPanel, conditionPanel];

    return editWindow;
  }

  /**
   * Resize conditional logic panel when user add or remove condition
   * @param {DOM} element targeting element of DOM
   */
  resizeConditions(element) {
    let conditionPanel = closest(element, 'panel-conditions');
    let panels = closest(element, 'panels');
    let height = animate.getStyle(conditionPanel, 'height');
    panels.style.height = height;
  }

  /**
   * Process conditions from rowData
   * @param {Map} rowData
   * @return {Map} processed rowData
   */
  processConditions(rowData) {
    let _this = this;
    let conditions = rowData.conditions;
    let condition;
    let processedConditions = [];
    for (let i = 0; i < conditions.length; i ++) {
      condition = conditions[i];
      condition = _this.wrapCondition(condition);
      processedConditions.push(condition);
    }
    return processedConditions;
  }

  /**
   * Created conditions tab
   * @param {Map} rowData of current
   * @return {Object} conditions
   */
  conditions(rowData) {
    let _this = this;
    let conditions = [
      {
        tag: 'div',
        className: 'f-panel-wrap',
        content: [
          {
            tag: 'ul',
            className: 'conditions',
            content: [_this.processConditions(rowData)]
          }
        ]
      }, {
        tag: 'div',
        className: 'panel-action-buttons',
        content: [
          {
            tag: 'button',
            className: 'add-condition',
            content: getString('addcondition'),
            action: {
              click: event => {
                event.preventDefault();
                let container = event.target.parentElement.parentElement.getElementsByClassName('conditions')[0];
                let row = closestFtype(event.target);
                this.addCondition(row.id, container);
                _this.resizeConditions(event.target);
                let condition =dom.conditionPositions(event, 'add');
                data.saveConditionalLogics(condition);
              }
            }
          }
        ]
      }
    ];
    return conditions;
  }

  /**
   * Update column order and save
   * @param  {Object} evt
   */
  onSort(evt) {
    data.saveColumnOrder(evt.target);
    data.save();
  }

  /**
   * Handler for removing content from a row
   * @param  {Object} evt
   */
  onRemove(evt) {
    dom.columnWidths(evt.from);
    data.saveColumnOrder(evt.target);
    dom.emptyClass(evt.from);
  }

  /**
   * Handler for removing content from a row
   * @param  {Object} evt
   */
  onEnd(evt) {
    if(evt.from.classList.contains('empty-rows')) {
      dom.removeEmpty(evt.from);
    }

    data.save();
  }

  /**
   * Handler for adding content to a row
   * @param  {Object} evt
   */
  onAdd(evt) {
    let {from, item, to} = evt;
    let fromRow = from.fType === 'rows';
    let fromColumn = from.fType === 'columns';
    let fromControls = from.fType === 'controlGroup';
    let column;

    if (fromRow) {
      column = item;
    } else if(fromColumn) {
      let meta = h.get(rFields[item.id], 'meta');
      if (meta.group !== 'layout') {
        column = dom.addColumn(to.id);
        dom.addField(column.id, item.id);
      } else if (meta.id === 'layout-column') {
        dom.addColumn(to.id);
      }
    } else if(fromControls) {
      let text = evt.item.firstChild.lastChild.wholeText;
      text = getString('dragndrop', text);
      dom.proWarning(text);
    }

    if (fromColumn || fromControls) {
      dom.remove(item);
    }

    data.saveColumnOrder(to);

    dom.columnWidths(to);
    dom.emptyClass(to);
    data.save();
  }

}
