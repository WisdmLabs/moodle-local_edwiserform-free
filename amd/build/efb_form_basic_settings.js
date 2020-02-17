"use strict";define(["jquery"],function(i){i(document).ready(function(){function e(e,t){var a=["primary","warning","success","info"],n=document.createElement("span");i(n).html(t),i(n).attr("data-email",t),i(n).attr("class","email-tag btn btn-".concat(a[Math.floor(Math.random()*a.length)]));var l=document.createElement("span");i(l).attr("class","email-tag-delete"),i(l).html("X"),i(n).append(i(l)),i(n).insertBefore(i(".notifi-email-group").children()[e])}function t(t){if(-1!=l){var a=i(t).data("index");switch(function(i,e){return/^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/.test(e)?-1!=n.indexOf(e)&&n.indexOf(e)!=i?2:1:0}(a,i(t).val())){case 0:return void o(M.util.get_string("lbl-notifi-email-warning","local_edwiserform"));case 1:l=-1;var s=i(t).val();return i(t).remove(),e(a,s),n[a]=s,i("#id_notifi_email").val(n.join(",")),void r();case 2:return void o(M.util.get_string("lbl-notifi-email-duplicate","local_edwiserform"))}}}function a(){var e=M.util.get_string("email-body-tags","local_edwiserform"),t="<div class='efb-email-tags show'><ul>";return i.each(e,function(i,e){t+='<li>\n                <a href="#" class="efb-email-tag" title="'.concat(e,'">').concat(i,'\n                <label class="efb-forms-pro-label m-0">').concat(M.util.get_string("pro-label","local_edwiserform"),"</label></a></li>")}),t+="</ul></div>"}i("#id_notifi_email").parent().prepend('<div class="notifi-email-group"><input type="email" class="notifi-email-group-input form-control" id="notifi-email-group-input"/><div>'.concat(M.util.get_string("recipient-email-desc","local_edwiserform"),"</div></div>")),i("#id_notifi_email").hide(),i("#id_notifi_email_body").after(M.util.get_string("email-body-restore-desc","local_edwiserform",{id:"#id_notifi_email_bodyeditable",string:"notify-email-body"})),i("#id_confirmation_msg").after(M.util.get_string("email-body-restore-desc","local_edwiserform",{id:"#id_confirmation_msgeditable",string:"confirmation-default-msg"})),i(".efb-email-body-restore").click(function(){i(i(this).data("id")).html(M.util.get_string(i(this).data("string"),"local_edwiserform"))}),i("body").on("click",".efb-email-show-tags>a",function(){i(this).next().toggleClass("show"),i(this).text(i(this).next().hasClass("show")?M.util.get_string("email-hide-tags","local_edwiserform"):M.util.get_string("email-show-tags","local_edwiserform"))}),i("#id_notifi_email_body").parents(".felement").siblings().append('<div class="efb-email-show-tags">\n                <a href="#">'.concat(M.util.get_string("email-hide-tags","local_edwiserform"),"</a>\n                ").concat(a(),"\n            </div>")),i("#id_confirmation_msg").parents(".felement").siblings().append('<div class="efb-email-show-tags">\n                <a href="#">'.concat(M.util.get_string("email-hide-tags","local_edwiserform"),"</a>\n                ").concat(a(),"\n            </div>"));var n=i("#id_notifi_email").val().trim(),l=-1;function o(e){i("#id_error_notifi_email").html(e),i("#id_error_notifi_email").show(),i("#id_error_notifi_email").parent(".felement").addClass("has-danger")}function r(){i("#id_error_notifi_email").hide().parent(".felement").removeClass("has-danger"),i("#id_notifi_email").val(n.join(","))}function s(t){if(""!=i(t).val())switch(function(i){return/^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/.test(i)?-1!=n.indexOf(i)?2:1:0}(i(t).val())){case 0:return void o(M.util.get_string("lbl-notifi-email-warning","local_edwiserform"));case 1:var a=i(t).siblings(".email-tag").length,l=i(t).val().trim();return e(a,l),n.push(l),i(t).val(""),void r();case 2:return void o(M.util.get_string("lbl-notifi-email-duplicate","local_edwiserform"))}else r()}n=n.length>0?n.split(","):[],i.each(n,function(i,t){e(i,t)}),i("body").on("click",".email-tag-delete",function(){var e=i(this).parent(),t=i(".email-tag").index(e);n.splice(t,1),e.remove(),i("#id_notifi_email").val(n.join(","))}),i("body").on("dblclick",".email-tag",function(){!function(e){var t=i(e).data("email"),a=i(".email-tag").index(e);l=a;var n=document.createElement("input");i(e).remove(),i(n).val(t),i(n).attr("class","notifi-email-group-edit"),i(n).attr("data-index",a),i(n).insertBefore(i(".notifi-email-group").children()[a]),i(n).focus()}(i(this))}),i("body").on("focusout",".notifi-email-group-edit",function(e){t(i(this))}),i("body").on("keyup",".notifi-email-group-edit",function(e){13!=e.keyCode&&27!=e.keyCode||t(i(this))}),i("body").on("keyup","#notifi-email-group-input",function(e){13==e.keyCode||32==e.keyCode?s(this):188==e.keyCode&&(i(this).val(i(this).val().slice(0,-1)),s(this))}),i("body").on("focusout","#notifi-email-group-input",function(i){i.preventDefault(),s(this)})})});
//# sourceMappingURL=efb_form_basic_settings.js.map
