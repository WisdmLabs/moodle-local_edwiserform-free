"use strict";define(["jquery","core/ajax","core/notification","local_edwiserform/efb_form_basic_settings","local_edwiserform/formbuilder"],function(e,t,i){var o,r,n,a=document.querySelector(".build-form"),s=document.querySelector(".render-form"),l=!1,f={container:a,svgSprite:M.cfg.wwwroot+"/local/edwiserform/pix/formeo-sprite.svg",localStorage:!1},d={GET_TEMPLATE:function(e){return t.call([{methodname:"edwiserform_get_template",args:{name:e}}])[0]},GET_EVENT_SETTINGS:function(e,i){return t.call([{methodname:"edwiserform_get_event_settings",args:{event:e,id:i}}])[0]},CREATE_NEW_FORM:function(e,i){return t.call([{methodname:"edwiserform_create_new_form",args:{setting:e,formdef:i.toString()}}])[0]},UPDATE_FORM:function(e,i){return t.call([{methodname:"edwiserform_update_form_settings",args:{setting:e,formdef:i.toString()}}])[0]}};function c(){var t=m()&&u(!1)&&!p();return e("#efb-btn-save-form-settings").parents(".efb-editor-button").toggleClass("d-none",!t),e(".efb-form-save").toggleClass("d-none",!t),t}function m(){return e(".efb-forms-template.active").length>0}function g(t){e(".efb-panel-btn").removeClass("active"),e("#efb-".concat(t)).addClass("active"),e(".efb-tabcontent").removeClass("active"),e("#efb-cont-".concat(t)).addClass("active")}function u(){var t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];settings=r();var i=e(".efb-panel-btn.active").attr("id"),o=""!=settings.title;if(!t)return o;if(o)e(".efb-form-title-container").removeClass("has-danger"),e("#id_title").parents(".fitem").removeClass("has-danger");else{switch(i){case"efb-form-setup":case"efb-form-builder":case"efb-form-preview":g("form-settings");case"efb-form-settings":e("#id_title").parents(".fitem").addClass("has-danger")}n.dom.toaster(M.util.get_string("lbl-title-warning","local_edwiserform"),3e3)}return o}function p(){return formdef=JSON.parse(o()),0==Object.keys(formdef.fields).length}function v(e,t,i,o){("create"==e?d.CREATE_NEW_FORM(t,i):d.UPDATE_FORM(t,i)).done(o).fail(function(e){n.dom.alert("danger",e.message)})}function _(t){e(".efb-form-title").text(t),e(".efb-editor-action").toggleClass("efb-hide",t.length<0),t.length<0?e("#id_error_template_title").show():e("#id_error_template_title").hide()}function b(t){var i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";e("#id_type").val(t);var o=new CustomEvent("change",{target:e("#id_type")[0]});e("#id_type")[0].dispatchEvent(o),f.container=a,n=new Formeo(f,i),e("#efb-form-settings").trigger("click")}f.resetForm=function(){n.dom.loading();var t=e("#id_type").val();d.GET_TEMPLATE(t).done(function(e){if(n.dom.loadingClose(),1==e.status)return f.container=a,void(n=new Formeo(f,e.definition))}).fail(function(e){n.dom.loadingClose(),i.exception(e)})},f.get_pro_demo_url=function(e){return videotypes.hasOwnProperty(e)?videotypes[e]:videotypes.default},r=function(){var t=e("#id_type").val();return{title:e("#id_title").val(),description:e("#id_description").val(),type:t,notifi_email:e("#id_notifi_email").val(),message:e("#id_confirmation_msg").val(),draftitemid:e('[name="confirmation_msg[itemid]"]').val(),data_edit:e("#id_editdata").prop("checked")}},o=function(){return n.formData};return{init:function(t,i){f.sitekey=t,f.prourl=i,e(document).ready(function(t){var i,a;"undefined"!=typeof formdefinition?n=new Formeo(f,formdefinition):(f.localStorage=!0,n=new Formeo(f)),i=e("#id_allowsubmissionsfromdate_enabled").parent(),a=e(i).parent(),i.detach().prependTo(a),i=e("#id_allowsubmissionstodate_enabled").parent(),a=e(i).parent(),i.detach().prependTo(a),e(".efb-settings-tab-list-item").click(function(){e(".efb-settings-tab-list-item").removeClass("active"),e(this).addClass("active"),e(".efb-settings-tab").removeClass("active"),e("#".concat(e(this).data("target"))).addClass("active")}),e(document).on("formeoUpdated",function(e){c()}),e(document).on("controlsCollapsed",function(t){e(".efb-form-step-preview").toggleClass("collapsed",t.detail.collapsed)}),e(".efb-form-step").click(function(t){t.preventDefault();var i=e(this).data("id");e("#"+i).click()}),e(".efb-panel-btn").click(function(t){if(!m())return n.dom.toaster(M.util.get_string("select-template-warning","local_edwiserform"),3e3),g("form-setup"),void t.preventDefault();var i=e(this).attr("id");if("efb-form-setup"!=i&&"efb-form-settings"!=i&&!u())return 0;c();var o=e(this).data("panel");e("#efb-form-settings, #efb-form-builder, #efb-form-preview, #efb-form-setup").removeClass("active"),e("#efb-cont-form-settings, #efb-cont-form-builder, #efb-cont-form-preview, #efb-cont-form-setup").removeClass("active"),e(o).addClass("active"),e(this).addClass("active"),e(".efb-forms-panel-heading").text(e(this).data("panel-lbl")),"#efb-cont-form-preview"==o&&n.render(s)}),e("body").on("click","#efb-btn-save-form-settings",function(t){if(!m())return n.dom.toaster(M.util.get_string("select-template-warning","local_edwiserform"),3e3),g("form-setup"),void t.preventDefault();if(!u()||!n.validator.validate())return 0;var i=r(),a=o(),s=e("[name='id']").val(),f="create",d=function(t){1==t.status?(l=!0,window.onbeforeunload=null,n.dom.alert("success",t.msg,function(){n.reset(),e(location).attr("href",M.cfg.wwwroot+"/local/edwiserform/view.php?page=listforms")}),setTimeout(function(){e(location).attr("href",M.cfg.wwwroot+"/local/edwiserform/view.php?page=listforms")},4e3)):n.dom.alert("danger",t.msg)};if(s){var c=function(t){1==t.status?(window.onbeforeunload=null,n.dom.multiActions("success",M.util.get_string("success","local_edwiserform"),t.msg,[{title:M.util.get_string("heading-listforms","local_edwiserform"),type:"primary",action:function(){e(location).attr("href",M.cfg.wwwroot+"/local/edwiserform/view.php?page=listforms")}},{title:M.util.get_string("close","local_edwiserform"),type:"default"}])):n.dom.alert("danger",t.msg)};n.dom.multiActions("warning",M.util.get_string("attention","local_edwiserform"),M.util.get_string("forms-update-confirm","local_edwiserform"),[{title:M.util.get_string("forms-update-create-new","local_edwiserform"),type:"primary",action:function(){v(f,i,a,d)}},{title:M.util.get_string("forms-update-overwrite-existing","local_edwiserform"),type:"warning",action:function(){f="update",i.id=s,v(f,i,a,c)}}])}else l?n.dom.toaster(M.util.get_string("form-setting-saved","local_edwiserform"),3e3):v(f,i,a,d)}),e("#efb-form-title").keyup(function(){var t=e(this).val(),i=""==t;e(this).parent().toggleClass("has-danger",i),e("#id_title").val(t),_(t)}).change(function(){c()}),e("#id_title").keyup(function(){var t=e(this).val();e("#id_title").val(t),_(t)}).change(function(){var t=e(this).val();e("#efb-form-title").val(t),c()}),e("#id_type").change(function(){e(".efb-forms-template").removeClass("active");var t=e(this).val();e("#efb-forms-template-"+t).addClass("active"),e("#id_registration-enabled").prop("checked",!0)}),e(".efb-forms-template.pro").click(function(){n.dom.proWarning({type:e(this).find(".efb-forms-template-name").text(),video:e(this).data("template"),message:e(this).find(".efb-forms-template-details .desc").text()})}),e(".efb-forms-template-select").click(function(t){var i=this;c();var o=function(){var t=e(i).data("template");e(i).parents(".efb-forms-template-overlay").addClass("loading"),d.GET_TEMPLATE(t).done(function(o){e(i).parents(".efb-forms-template-overlay").removeClass("loading"),1!=o.status?n.dom.alert("warning",o.msg,function(){b(t,o.definition)}):b(t,o.definition)}).fail(function(t){e(i).parents(".efb-forms-template-overlay").removeClass("loading"),n.dom.alert("danger",t.message)})};e(".efb-forms-template.active").length&&!p()?n.dom.multiActions("warning",M.util.get_string("attention","local_edwiserform"),M.util.get_string("template-change-warning","local_edwiserform"),[{title:M.util.get_string("proceed","local_edwiserform"),type:"warning",action:o},{title:M.util.get_string("cancel","local_edwiserform"),type:"success"}]):o()}),e("body").on("click",".efb-email-tag",function(){var t=e("<input>");e("body").append(t);var i=e(this).text();t.val(i).select(),document.execCommand("copy"),t.remove(),n.dom.toaster(M.util.get_string("shortcodecoppied",SELECTORS.COMPONENT,i),3e3)}),c(),e("#id_type").closest(".fitem").hide(),e("#root-page-loading").hide(),e(".efb-form-builder-wrap").show()})}}});