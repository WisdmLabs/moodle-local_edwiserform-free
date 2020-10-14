"use strict";define(["jquery","core/ajax","core/notification","./iefixes","local_edwiserform/formviewer"],function(e,t,n){var i={DATA_DELETING:"data-deleting",DATA_PROCESSING:"data-processing"},a=null,o=[],r=!1,c={GET_FORM_DEFINITION:function(e){return t.call([{methodname:"edwiserform_get_form_definition",args:{form_id:e}}])[0]},SUBMIT_FORM_DATA:function(e,n){return t.call([{methodname:"edwiserform_submit_form_data",args:{formid:e,data:n}}])[0]}};function s(t,i,a,o,r,s,l){var f=arguments.length>7&&void 0!==arguments[7]?arguments[7]:null;e(a).text(r),c.SUBMIT_FORM_DATA(s,l).done(function(n){n.status?(e(t).html(n.msg),i.dom.alert("success",n.msg),null!=f&&f(t,l)):(""!=n.msg&&i.dom.alert("warning",n.msg),n.hasOwnProperty("errors")&&function(t,n){n=JSON.parse(n),e(".custom-validation-error").remove(),e.each(n,function(n,i){var a=e(t).find("#"+n+"-error");0==a.length&&(e(t).find('[name="'+n+'"]').after('<span id="'+n+'-error" class="text-error custom-validation-error"></span>'),a=e(t).find("#"+n+"-error")),a.text(i)})}(t,n.errors)),i.dom.loadingClose(),e(a).text(o)}).fail(function(t){i.dom.loadingClose(),e(a).text(o),n.exception(t)})}function l(t,n){var a=e(t).closest("form"),o=t,r=n.dom.checkValidity(a[0]),c=e(t).text(),l=e(t).attr(i.DATA_PROCESSING),f=e(a).parent().find(".id").val();if(r){if(""!=e(a).attr("action"))return void e(a).submit();n.dom.loading(),setTimeout(function(){var e=a.serializeArray();e=function(e){var t=["g-recaptcha-response"],n=[];return e.forEach(function(e,i){-1==t.indexOf(e.name)&&n.push(e)}),JSON.stringify(n)}(e),s(a,n,o,c,l,f,e)},1e3)}}function f(t){var n={container:"",sitekey:t,localStorage:!1};o=[],a=e(".edwiserform-container"),r=e("#edwiserform-fullpage")&&e("#edwiserform-fullpage").val(),e.each(a,function(t,i){var a=e(i).parent().find(".id"),r=a.val();c.GET_FORM_DEFINITION(r).done(function(r){0!=r.status?(n.container=i,o[t]=new Formeo(n,r.definition),o[t].render(i),e(i).prepend("<h2>"+r.title+"</h2>"),e(i).prepend(a),r.data&&function(t,n){var i=JSON.parse(n);e.each(i,function(n,i){e.each(e(t).find('[name="'+i.name+'"]'),function(t,n){switch(n.tagName){case"INPUT":switch(n.type){case"radio":n.value==i.value&&e(n).prop("checked",!0);var a=new CustomEvent("click",{target:e(n)[0]});e(n)[0].dispatchEvent(a);break;case"checkbox":n.value==i.value&&e(n).prop("checked",!0);break;default:e(n).val(i.value)}break;case"SELECT":if(e(n).is('[multiple="true"]')){var o=e(n).val();o.push(i.value),i.value=o}case"TEXTAREA":e(n).val(i.value)}a=new CustomEvent("change",{target:e(n)[0]}),e(n)[0].dispatchEvent(a),""!=e(n).val()&&e(n).parents(".f-field-group").addClass("active")})})}(i,r.data),r.action&&""!=r.action&&function(t,n){e(t).attr("action",n)}(i,r.action),e(i).keyup(function(e){13==e.keyCode&&l(this,o[t],r.formtype)}),e(i).find("#submit-form").click(function(){l(this,o[t],r.formtype)})):e(i).html(r.msg).addClass("empty")}).fail(function(e){console.log(e)})})}return{init:function(t){e(document).ready(function(n){0!=e("#edwiserform-fullpage").length&&1==e("#edwiserform-fullpage").val()&&e("body").addClass("edwiserform-fullpage"),f(t),e(window).resize(function(){e.each(a,function(e){o[e].dom.manageFormWidth(r)})}),e(".step-navigation #previous-step").click(function(){}),e(".step-navigation #next-step").click(function(){}),e("body").on("click",".efb-view-fullpage",function(){var t=e(this).closest(".edwiserform-container").find('input[class="id"]').val();window.open(M.cfg.wwwroot+"/local/edwiserform/form.php?id="+t),e(this).closest(".edwiserform-container").html(M.util.get_string("fullpage-link-clicked","local_edwiserform"))})})}}});
//# sourceMappingURL=render_form.js.map
