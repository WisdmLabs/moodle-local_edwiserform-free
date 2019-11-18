import {formData} from '../common/data';
import dom from '../common/dom';
import {getString, ucfirst} from '../common/utils';
let errors = [];
let nameMissing = [];
/**
 * Validator to validate formData
 */
class Validator {
  /**
     * Validate option data of form field
     * @param  {Object} fieldData Form field data
     * @return {Boolean}          True if options are valid
     */
  validateOptions(fieldData) {
    if (!Object.prototype.hasOwnProperty.call(fieldData, 'options')) {
      return true;
    }
    let optionValid = true;
    fieldData.options.forEach(option => {
      if (optionValid == false) {
        return;
      }
      if (option.label == '') {
        optionValid = false;
      }
      if (option.value == '') {
        optionValid = false;
      }
    });
    return optionValid;
  }

  /**
     * Get label of field. Concating field label and field id
     * @param  {Object} fieldData Form field data
     * @return {String}           Field label and field id concatenation
     */
  getFieldLabelAndId(fieldData) {
    let label = fieldData.config.label || '';
    if (label != '') {
      label += ' - ';
    }
    label += ucfirst(fieldData.meta.id) || '';
    return label;
  }

  /**
     * Validate form fields
     * @return {Boolean} True if all form fields are valid
     */
  validate() {
    errors = [];
    nameMissing = [];
    let valid = true;
    const fieldValidate = {
      input: fieldData => {
        let optionValid = this.validateOptions(fieldData);
        const type = fieldData.attrs.type || '';
        if (type == '') {
          errors.push(getString('input-invalid-type', this.getFieldLabelAndId(fieldData)));
          optionValid = false;
        }
        if (optionValid == false) {
          errors.push(getString(`input-${fieldData.attrs.type || 'all'}-option-invalid`, this.getFieldLabelAndId(fieldData)));
        }
        return optionValid;
      },
      select: fieldData => {
        const optionValid = this.validateOptions(fieldData);
        if (optionValid == false) {
          errors.push(getString('select-option-invalid', this.getFieldLabelAndId(fieldData)));
        }
        return optionValid;
      }
    };
    formData.fields.forEach(field => {
      switch (field.tag.toLowerCase()) {
        case 'input':
        case 'textarea':
        case 'select':
          if (!field.attrs.name || field.attrs.name == '') {
            valid = false;
            nameMissing.push(this.getFieldLabelAndId(field));
          }
          break;
      }
      if (fieldValidate[field.tag]) {
        valid = valid && fieldValidate[field.tag](field);
      }
    });
    if (this.nameMissing) {
      errors = Array.prototype.concat([this.nameMissing], errors);
    }
    if (this.errors.length != 0) {
      dom.alert('danger', this.errors.join('<br>'));
    }
    return valid;
  }

  /**
     * Return errors found by validate function
     * @return {Array} Error list array
     */
  get errors() {
    return errors;
  }

  /**
     * If name missing in any field then
     * @return {String} Name missing error message
     */
  get nameMissing() {
    if (nameMissing.length == 0) {
      return '';
    }
    return getString('missing-name-attribute-field', nameMissing.join(', '));
  }
}
const validator = new Validator();
export default validator;