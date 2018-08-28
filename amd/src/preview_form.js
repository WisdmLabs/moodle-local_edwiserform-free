/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
require(['jquery', 'core/ajax'], function ($, ajax) {
    $(document).ready(function (e) {
        $.getScript(M.cfg.wwwroot + '/local/edwiserform/amd/src/formviewer.min.js', function() {
            if (typeof definition != 'undefined') {
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
            }
        });
    });
});
