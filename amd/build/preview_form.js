/*
 * Edwiser_Forms - https://edwiser.org/
 * Version: 0.1.0
 * Author: Yogesh Shirsath
 */
define(['jquery', 'core/ajax', 'local_edwiserform/formviewer'], function ($, ajax) {
  return {
    init: function(title, sitekey) {
      $(document).ready(function (e) {
        let formeoOpts = {
          container: '',
          // allowEdit: false,
          controls: {
            sortable: false,
            groupOrder: [
              'common',
              'html',
            ],
            elements: [
            ],
            elementOrder: {
              common: [
              'button',
              'checkbox',
              'date-input',
              'hidden',
              'upload',
              'number',
              'radio',
              'select',
              'text-input',
              'textarea',
              ]
            }
          },
          events: {
            // onUpdate: console.log,
            // onSave: console.log
          },
          sitekey: sitekey,
          localStorage: false, //Changed from session storage to local storage
          editPanelOrder: ['attrs', 'options']
        };
        var formeo;
        var form = $('#preview-form')[0]
        formeoOpts.container = form;
        formeo = new Formeo(formeoOpts, definition);
        formeo.render(form);
        $(form).prepend(`<h2>${title}</h2>`);
      });
    }
  };
});
