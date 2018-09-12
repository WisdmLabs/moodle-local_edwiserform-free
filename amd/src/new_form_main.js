/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var get_form_def;
var get_form_settings;
var formeo;
var events = [];
require(['jquery', 'core/ajax'], function ($, ajax) {
    $(document).ready(function (e) {
        $.getScript(M.cfg.wwwroot + '/local/edwiserform/amd/src/formbuilder.min.js', function () {
            function can_save_form() {
                var status = check_template() && check_title(false) && !empty_form_definition();
                $('#efb-btn-save-form-settings').parents('.efb-editor-button').toggleClass('d-none', !status);
                $('.efb-form-save').toggleClass('d-none', !status);
            };
            let container = document.querySelector('.build-form');
            let renderContainer = document.querySelector('.render-form');
            let saved = false;
            let formeoOpts = {
                container: container,
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
                sitekey: sitekey,
                prourl: 'Pro url.',
                events: {
                    // onUpdate: console.log,
                    // onSave: console.log
                },
                svgSprite: M.cfg.wwwroot + '/local/edwiserform/pix/formeo-sprite.svg',
                localStorage: false,
                editPanelOrder: ['attrs', 'options']
            };
            if (typeof formdefinition != 'undefined') {
                formeo = new Formeo(formeoOpts, formdefinition);
            } else {
                formeoOpts.localStorage = true;
                formeo = new Formeo(formeoOpts);
            }
            $('.step-navigation #previous-step').click(function () {
                return;
            });
            $('.step-navigation #next-step').click(function () {
                return;
            });

            $(document).on('formeoUpdated', function(event) {
                can_save_form();
            });
            $(document).on('controlsCollapsed', function(event) {
                $('.efb-form-step-preview').toggleClass('collapsed', event.detail.collapsed);
            });

            function check_template() {
                return $('.efb-forms-template.active').length > 0;
            }

            function switch_panel(id) {
                $('.efb-panel-btn').removeClass('panel-active');
                $(`#efb-${id}`).addClass('panel-active');
                $('.efb-tabcontent').removeClass('content-active').addClass('content-hide');
                $(`#efb-cont-${id}`).addClass('content-active').removeClass('content-hide');
            }

            function check_title(showError = true) {
                settings = get_form_settings();
                var active = $('.efb-panel-btn.panel-active').attr('id');
                var emptytitle = settings.title != '';
                if (!showError) {
                    return emptytitle;
                }
                if (!emptytitle) {
                    switch(active) {
                        case 'efb-form-setup':
                        case 'efb-form-builder':
                        case 'efb-form-preview':
                            switch_panel('form-settings');
                        case 'efb-form-settings':
                            $('#id_title').parents('.fitem').addClass('has-danger');
                            break;
                    }
                    formeo.dom.toaster(M.util.get_string('efb-lbl-title-warning', 'local_edwiserform'), 3000);
                } else {
                    $('.efb-form-title-container').removeClass('has-danger');
                    $('#id_title').parents('.fitem').removeClass('has-danger');
                }
                return emptytitle;
            }

            $('#id_type').closest('.fitem').hide();
            $(".efb-form-step").click(function(event) {
                event.preventDefault();
                var id = $(this).data('id');
                $('#'+id).click();
            });
            $(".efb-panel-btn").click(function (event) {
                if (!check_template()) {
                    formeo.dom.toaster(M.util.get_string('efb-select-template-warning', 'local_edwiserform'), 3000);
                    switch_panel('form-setup');
                    event.preventDefault();
                    return;
                }
                var id = $(this).attr('id');
                if (id != 'efb-form-setup' && id != 'efb-form-settings' && !check_title()) {
                    return 0;
                }
                can_save_form();
                var eleCont = $(this).data("panel");
                $("#efb-form-settings, #efb-form-builder, #efb-form-preview, #efb-form-setup").removeClass("panel-active");
                $("#efb-cont-form-settings, #efb-cont-form-builder, #efb-cont-form-preview, #efb-cont-form-setup").removeClass("content-active").addClass("content-hide");

                $(eleCont).addClass("content-active");
                $(eleCont).removeClass("content-hide");
                $(this).addClass("panel-active");
                $(".efb-forms-panel-heading").text($(this).data("panel-lbl"));

                if ("#efb-cont-form-settings" == eleCont) {
                    // $("#efb-btn-save-form-settings, #efb-btn-previous").addClass("efb-hide");
                    $("#efb-btn-next").removeClass("efb-hide");
                }
                if ("#efb-cont-form-builder" == eleCont) {
                    formeo.render(renderContainer);
                    $("#efb-btn-previous, #efb-btn-next").removeClass("efb-hide");
                }
                if ("#efb-cont-form-preview" == eleCont) {
                    formeo.render(renderContainer);
                    $("#efb-btn-next").addClass("efb-hide");
                }
            });

            $(".efb-btn-form-build").click(function (event) {
                if (!check_template()) {
                    switch_template('form-setup');
                    return;
                }
                if (!check_title_description()) {
                    get_title_description(event);
                    return 0;
                }
                var id = $(this).attr("id");
                var active_page = $(".tab-active").attr("id");
                if ("efb-btn-next" == id) {
                    if ("efb-form-settings" == active_page) {
                        $("#efb-btn-previous").removeClass("efb-hide");
                        $("#efb-form-builder").trigger("click");
                    } else if ("efb-form-builder" == active_page) {
                        $("#efb-btn-save-form-settings").removeClass("efb-hide");
                        $("#efb-btn-next").addClass("efb-hide");
                        $("#efb-form-preview").trigger("click");
                    } else {
                        $("#efb-btn-next").addClass("efb-hide");
                    }
                } else if ("efb-btn-previous" == id) {
                    if ("efb-form-preview" == active_page) {
                        $("#efb-btn-save-form-settings").addClass("efb-hide");
                        $("#efb-btn-next").removeClass("efb-hide");
                        $("#efb-form-builder").trigger("click");
                    } else if ("efb-form-builder" == active_page) {
                        $("#efb-btn-previous").addClass("efb-hide");
                        $("#efb-form-settings").trigger("click");
                    }
                }
            });

            get_form_settings = function() {
                var type = $("#id_type").val();
                var data = {
                    "title": $("#id_title").val(),
                    "description": $("#id_description").val(),
                    "type": type,
                    "notifi_email": $("#id_notifi_email").val(),
                    "message": $("#id_confirmation_msg").val(),
                    "data_edit": $("#id_editdata").val(),
                    "eventsettings": ""
                };
                var eventsettings = [];
                $.each(events, function(index, event) {
                    if (event.is_enabled()) {
                        var name = event.get_event_name();
                        var settings = event.get_settings();
                        eventsettings[name] = settings;
                    }
                });
                data.eventsettings = JSON.stringify(eventsettings);
                return data;
            }

            get_form_def = function() {
                return formeo.formData;
            }

            function empty_form_definition() {
                formdef = JSON.parse(get_form_def());
                return Object.keys(formdef.fields).length == 0;
            }

            function save_form_settings(service_name, settings, formdef, callable) {
                var reqSave = ajax.call([
                    {
                        methodname: service_name,
                        args: {
                            setting: settings,
                            formdef: formdef.toString()
                        }
                    }
                ]);
                reqSave[0].done(callable).fail(function (ex) {
                    formeo.dom.alert('danger', ex.message);
                });
            }

            /**
             * This will save the form settings using ajax.
             */
            $("body").on("click", "#efb-btn-save-form-settings", function (event) {
                if (!check_template()) {
                    formeo.dom.toaster(M.util.get_string('efb-select-template-warning', 'local_edwiserform'), 3000);
                    switch_panel('form-setup');
                    event.preventDefault();
                    return;
                }
                if (!check_title()) {
                    return 0;
                }
                var settings = get_form_settings();
                var formdef = get_form_def();
                var formid = $("[name='id']").val();
                var service_name = "edwiserform_create_new_form";
                var form_create_action = function (response) {
                    if (response.status == true) {
                        saved = true;
                        window.onbeforeunload = null;
                        formeo.dom.alert('success', response.msg, function() {
                            formeo.reset();
                            $(location).attr('href', M.cfg.wwwroot + "/local/edwiserform/view.php?page=listforms");
                        });
                        setTimeout(function() {
                            $(location).attr('href', M.cfg.wwwroot + "/local/edwiserform/view.php?page=listforms");
                        }, 4000);
                    } else {
                        formeo.dom.alert('danger', response.msg);
                    }
                }
                if (formid) {
                    var form_update_action = function (response) {
                        if (response.status == true) {
                            window.onbeforeunload = null;
                            formeo.dom.alert('success', response.msg, function() {
                                formeo.reset();
                                $(location).attr('href', M.cfg.wwwroot + "/local/edwiserform/view.php?page=listforms");
                            });
                        } else {
                            formeo.dom.alert('danger', response.msg);
                        }
                    }
                    formeo.dom.multiActions(
                        'warning',
                        M.util.get_string("attention", "local_edwiserform"),
                        M.util.get_string("efb-forms-update-confirm", "local_edwiserform"),
                        [{
                            title: M.util.get_string("efb-forms-update-create-new", "local_edwiserform"),
                            type: 'primary',
                            action: function() {
                                save_form_settings(service_name, settings, formdef, form_create_action);
                            }
                        }, {
                            title: M.util.get_string("efb-forms-update-overwrite-existing", "local_edwiserform"),
                            type: 'success',
                            action: function() {
                                service_name = "edwiserform_update_form_settings";
                                settings["id"] = formid;
                                save_form_settings(service_name, settings, formdef, form_update_action);
                            }
                        }]
                    );
                    return;
                }
                if (!saved) {
                    save_form_settings(service_name, settings, formdef, form_create_action);
                } else {
                    formeo.dom.toaster(M.util.get_string('efb-form-setting-saved', 'local_edwiserform'), 3000);
                }
            });

            $("#efb-form-title").keyup(function () {
                var formName = $(this).val();
                var empty = formName == '';
                $(this).parent().toggleClass('has-danger', empty);
                $("#id_title").val(formName);
                change_heading(formName);
            }).change(function() {
                can_save_form();
            });
            $("#id_title").keyup(function () {
                var formName = $(this).val();
                $("#id_title").val(formName);
                change_heading(formName);
            }).change(function() {
                var formName = $(this).val();
                $("#efb-form-title").val(formName);
                can_save_form();
            });
            function change_heading(formName) {
                $(".efb-form-title").text(formName);
                $(".efb-editor-action").toggleClass("efb-hide", formName.length < 0);
                if (formName.length < 0) {
                    $("#id_error_template_title").show();
                } else {
                    $("#id_error_template_title").hide();
                }
            }

            $("#id_type").change(function() {
                $(".efb-forms-template").removeClass("active");
                var type = $(this).val();
                $("#efb-forms-template-" + type).addClass("active");
                $('#id_registration-enabled').prop('checked', true);
            });

            function select_template(formtype, template = '') {
                $("#id_type").val(formtype);
                // Triggering change event
                var changeEvent = new CustomEvent("change", {target: $("#id_type")[0]});
                $("#id_type")[0].dispatchEvent(changeEvent);
                formeoOpts.container = container;
                formeo = new Formeo(formeoOpts, template);
                $("#efb-form-settings").trigger('click');
            }
            $(".efb-forms-pro-select").click(function() {
                var type = M.util.get_string(`efb-event-${$(this).data('template')}-name`, 'local_edwiserform');
                var message = $(this).parent().siblings('.efb-forms-template-details').children('.desc').text();
                formeo.dom.proWarning({type,message});
            });
            $(".efb-forms-template-select").click(function(event){
                var _this = this;
                can_save_form();
                var select = function() {
                    var formtype = $(_this).data("template");
                    $(_this).parents('.efb-forms-template-overlay').addClass('loading');
                    var templateRequest = ajax.call([{
                        methodname: 'edwiserform_get_template',
                        args: {
                            name: formtype
                        }
                    }]);
                    templateRequest[0].done(function(response) {
                        $(_this).parents('.efb-forms-template-overlay').removeClass('loading');
                        if (response.status == true) {
                            select_template(formtype, response.definition);
                            return;
                        }
                        formeo.dom.alert('warning', response.msg, function() {
                            select_template(formtype, response.definition);
                        });
                    }).fail(function(ex) {
                        $(_this).parents('.efb-forms-template-overlay').removeClass('loading');
                        formeo.dom.alert('danger', ex.message);
                    });
                }
                if ($(".efb-forms-template.active").length && !empty_form_definition()) {
                    formeo.dom.multiActions(
                      'warning',
                      M.util.get_string("attention", "local_edwiserform"),
                      M.util.get_string("efb-template-change-warning", "local_edwiserform"),
                      [{
                        title: M.util.get_string('proceed', 'local_edwiserform'),
                        type: 'danger',
                        action: select
                      }, {
                        title: M.util.get_string('cancel', 'local_edwiserform'),
                        type: 'success'
                      }]
                    );
                } else {
                    select();
                }
            });
            can_save_form();
        });
    });
});
