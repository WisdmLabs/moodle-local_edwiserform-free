/*
 * Edwiser_Forms - https://edwiser.org/
 * Version: 0.1.0
 * Author: Yogesh Shirsath
 */
define(['jquery', 'core/ajax', 'local_edwiserform/formviewer'], function ($, ajax) {
    return {
        init: function(sitekey) {
            $(document).ready(function (e) {
                let formeoOpts = {
                    container: '',
                    sitekey: sitekey,
                    localStorage: false, // Changed from session storage to local storage.
                };
                var formeo = [];
                var forms = $('.edwiserform-container');
                var fullpage = $('#edwiserform-fullpage') && $('#edwiserform-fullpage').val();

                /**
                 * Load data to form fields and trigger events
                 * @param  {DOM} form DOM form object
                 * @param  {Object} data Previously + Default data of user
                 */
                function load_form_data(form, data) {
                    var formData = JSON.parse(data);
                    $.each(formData, function(index, attr) {
                        $.each($(form).find(`[name="${attr.name}"]`), function(i, elem) {
                            switch (elem.tagName) {
                                case 'INPUT':
                                    switch (elem.type) {
                                        case 'radio':
                                            if (elem.value == attr.value) {
                                                $(elem).prop('checked', true);
                                            }
                                            var changeEvent = new CustomEvent("click", {target: $(elem)[0]});
                                            $(elem)[0].dispatchEvent(changeEvent);
                                            break;
                                        case 'checkbox':
                                            if (elem.value == attr.value) {
                                                $(elem).prop('checked', true);
                                            }
                                            break;
                                        default:
                                            $(elem).val(attr.value);
                                            break;
                                    }
                                    break;
                                case 'SELECT':
                                    if ($(elem).is('[multiple="true"]')) {
                                        let value = $(elem).val();
                                        value.push(attr.value);
                                        attr.value = value;
                                    }
                                case 'TEXTAREA':
                                    $(elem).val(attr.value);
                                    break;
                            }
                            var changeEvent = new CustomEvent("change", {target: $(elem)[0]});
                            $(elem)[0].dispatchEvent(changeEvent);
                        });
                    });
                }

                // Handle form field arrangement on resize
                $(window).resize(function() {
                    $.each(forms, function(index) {
                        formeo[index].dom.manageFormWidth(fullpage);
                    });
                });

                $.each(forms, function(index, form) {
                    var idElement = $(form).children('.id');
                    var id = idElement.val();
                    var promise = ajax.call([{
                        methodname: 'edwiserform_get_form_definition',
                        args: {
                            form_id: id
                        }
                    }]);
                    promise[0].done(function(response) {
                        if (response.status != false) {
                            formeoOpts.container = form;
                            formeo[index] = new Formeo(formeoOpts, response.definition);
                            formeo[index].render(form);
                            $(form).prepend(`<h2>${response.title}</h2>`);
                            $(form).prepend(idElement);
                            if (response.data) {
                                load_form_data(form, response.data);
                            }
                            if (response.action && response.action != '') {
                                apply_action(form, response.action);
                            }
                            $(form).keyup(function(event) {
                                if (event.keyCode == 13) {
                                    submit_form(this, formeo[index], response.formtype);
                                }
                            });
                            $(form).find('#submit-form').click(function() {
                                submit_form(this, formeo[index], response.formtype);
                            });
                        } else {
                            $(form).html(response.msg).addClass("empty");
                        }
                    }).fail(function(ex) {
                        console.log(ex);
                    });
                });
                $('.step-navigation #previous-step').click(function() {
                    return;
                });
                $('.step-navigation #next-step').click(function() {
                    return;
                });

                $('body').on('click', '.efb-view-fullpage', function() {
                    // View form on full page
                    var id = $(this).closest('.edwiserform-container').find('input[class="id"]').val();
                    window.open(M.cfg.wwwroot + '/local/edwiserform/form.php?id=' + id);
                    $(this).closest('.edwiserform-container').html(M.util.get_string('fullpage-link-clicked', 'local_edwiserform'));
                });

                function apply_action(form, action) {
                    $(form).attr('action', action);
                }

                function submit_form_data(form, formeo, submitButton, label, processingLabel, formid, formdata, afterSubmit = null) {
                    $(submitButton).text(processingLabel);
                    var submitFormData = ajax.call([{
                        methodname: 'edwiserform_submit_form_data',
                        args: {
                            formid: formid,
                            data: formdata
                        }
                    }]);
                    submitFormData[0].done(function(response) {
                        if (response.status) {
                            $(form).html(response.msg);
                            formeo.dom.alert('success', response.msg);
                            if (afterSubmit != null) {
                                afterSubmit(form, formdata);
                            }
                        } else {
                            formeo.dom.alert('warning', response.msg);
                            if (response.hasOwnProperty('errors')) {
                                display_validation_errors(response.errors);
                            }
                        }
                    }).fail(function(ex) {
                        $(submitButton).text(label);
                        console.log(ex);
                    });
                }

                function display_validation_errors(errors) {
                    var errors = JSON.parse(errors);
                    $('.custom-validation-error').remove();
                    $.each(errors, function(name, error) {
                        var errorview = $(`#${name}-error`);
                        if (errorview.length == 0) {
                            $(`[name="${name}"]`).after(`<span id="${name}-error" class="text-error custom-validation-error"></span>`)
                            errorview = $(`#${name}-error`);
                        }
                        errorview.text(error);
                    });
                }

                function filter_formdata(formdata) {
                    var removeList = ['g-recaptcha-response'];
                    var filteredList = [];
                    formdata.forEach(function(element, index) {
                        if (removeList.indexOf(element.name) == -1) {
                            filteredList.push(element);
                        }
                    });
                    return JSON.stringify(filteredList);
                }

                function submit_form(_this, formeo, type) {
                    var form = $(_this).closest('form');
                    var submitButton = _this;
                    var valid = formeo.dom.checkValidity(form[0]);
                    var label = $(_this).text();
                    var processingLabel = $(_this).attr('data-processing');
                    var formid = $(form).find('.id').val();
                    var formdata = filter_formdata(form.serializeArray());
                    if (valid) {
                        if ($(form).attr('action') != '') {
                            $(form).submit();
                        }
                        submit_form_data(form, formeo, submitButton, label, processingLabel, formid, formdata);
                    }
                }
            });
        }
    }
});
