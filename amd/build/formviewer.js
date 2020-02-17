"use strict";function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}define([],function(){!function(t){function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var n={};e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:r})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,n){if(1&n&&(t=e(t)),8&n)return t;if(4&n&&"object"==_typeof(t)&&t&&t.__esModule)return t;var r=Object.create(null);if(e.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&n&&"string"!=typeof t)for(var o in t)e.d(r,o,function(e){return t[e]}.bind(null,o));return r},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="/",e(e.s=3)}([function(t,e,n){Object.defineProperty(e,"__esModule",{value:!0}),e.registeredFields=e.formOpts=e.formData=e.data=void 0;var r=n(1),o={},a=void 0,i=void 0,l={init:function(t,n){var l={id:(0,r.uuid)(),settings:new Map,stages:new Map,rows:new Map,columns:new Map,fields:new Map};o.opts=t,e.formOpts=i=t;var c=function(t){"string"==typeof t&&(t=window.JSON.parse(t)),t.settings=(0,r.objToStrMap)(t.settings),t.stages=(0,r.objToStrMap)(t.stages),t.rows=(0,r.objToStrMap)(t.rows),t.columns=(0,r.objToStrMap)(t.columns),t.fields=(0,r.objToStrMap)(t.fields),e.formData=a=Object.assign({},l,t)};if(n)c(n);else if(window.localStorage&&o.opts.localStorage){var u=window.localStorage.getItem("formData");u&&c(u)}return a||(e.formData=a=l),a},get js(){var t={};return Object.keys(a).forEach(function(e){t[e]="string"==typeof a[e]?a[e]:(0,r.strMapToObj)(a[e])}),t},get prepData(){var t=l.js;return Object.keys(t).forEach(function(e){Object.keys(t[e]).forEach(function(n){var r=t[e][n];r.action&&Object.keys(r.action).forEach(function(t){r.action[t]=r.action[t].toString()})})}),t},get json(){var t=l.prepData;return window.JSON.stringify(t,null,"\t")}};e.data=l,e.formData=a,e.formOpts=i,e.registeredFields={}},function(t,e,n){Object.defineProperty(e,"__esModule",{value:!0}),e.memoize=e.getString=e.clicked=e.cleanObj=e.numberBetween=e.numToPercent=e.clone=e.uuid=e.strMapToObj=e.objToStrMap=e.unique=e.elementTagType=e.closestFtype=e.closest=e.remove=e.match=void 0;var r="function"==typeof Symbol&&"symbol"==_typeof(Symbol.iterator)?function(t){return _typeof(t)}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":_typeof(t)},o=function(t){return t&&t.__esModule?t:{default:t}}(n(8)),a=(e.match=function(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:"",e=arguments[1];if(!e)return console.warn("utils.match missing argument 2."),!1;var n=/[|\\{}()[\]^*$+?.]/g,r="string"==typeof e?[e]:e,o=!0;return(r=r.map(function(t){return"*"===t?"":t.replace(n,"\\$&")})).length&&(o=!t.match(new RegExp(r.join("|"),"i"))),o},e.remove=function(t,e){var n=t.indexOf(e);-1<n&&t.splice(n,1)},e.closest=function(t,e){for(var n=e.replace(".","");(t=t.parentElement)&&!t.classList.contains(n););return t},e.closestFtype=function(t){for(;(t=t.parentElement)&&!t.fType;);return t},e.elementTagType=function(t){var e={tag:t.tagName};return"INPUT"==t.tagName&&(e.type=t.type),e},e.unique=function(t){return t.filter(function(t,e,n){return n.indexOf(t)===e})},e.objToStrMap=function(t){var e=new Map,n=!0,r=!1,o=void 0;try{for(var a,i,l=Object.keys(t)[Symbol.iterator]();!(n=(a=l.next()).done);n=!0)i=a.value,e.set(i,t[i])}catch(t){r=!0,o=t}finally{try{!n&&l.return&&l.return()}finally{if(r)throw o}}return e},e.strMapToObj=function(t){var e=Object.create(null);return t.forEach(function(t,n){e[n]=t}),e},e.uuid=function(t){var e;if(t){var n=t.attrs;e=(void 0===n?{}:n).id||t.id||(0,o.default)(),t.id=e}else e=(0,o.default)();return e},e.clone=function t(e){var n;if(null===e||"object"!==(void 0===e?"undefined":r(e)))return e;if(e instanceof Date)return(n=new Date).setTime(e.getTime()),n;if(e instanceof Array){n=[];for(var o=0,a=e.length;o<a;o++)n[o]=t(e[o]);return n}if(e instanceof Object){for(var i in n={},e)Object.prototype.hasOwnProperty.call(e,i)&&(n[i]=t(e[i]));return n}return e},e.numToPercent=function(t){return t.toString()+"%"},e.numberBetween=function(t,e,n){return t>e&&t<n});e.cleanObj=function(t){var e=Object.assign({},t);return Object.keys(t).forEach(function(n){"string"==typeof t[n]?e[n]="":"boolean"==typeof t[n]&&(e[n]=!1)}),e},e.clicked=function(t,e,n,r){var o=n.x-5,i=n.x+5,l=n.y-5,c=n.y+5,u=a(t,o,i),s=a(e,l,c);return u&&s&&2!==r},e.getString=function(t){var e=window.M.util.get_string(t,"local_edwiserform");return e=="[["+t+",local_edwiserform]]"?(-1!=e.indexOf(".")&&(t=(t=t.split(".")).slice(t.length-1)[0]),t=t.charAt(0).toUpperCase()+t.slice(1)):e},(e.memoize=function t(e,n){if("function"!=typeof e||n&&"function"!=typeof n)throw new TypeError("memoize: First argument must be a function");var r=function t(){for(var r=arguments.length,o=Array(r),a=0;a<r;a++)o[a]=arguments[a];var i=n?n.apply(t,o):o[0],l=t.cache;if(l.has(i))return l.get(i);var c=e.apply(t,o);return t.cache=l.set(i,c),c};return r.cache=new t.Cache,r}).Cache=Map},function(e,t,a){function n(t){return t&&t.__esModule?t:{default:t}}function o(t,e){var n={};for(var r in t)0<=e.indexOf(r)||Object.prototype.hasOwnProperty.call(t,r)&&(n[r]=t[r]);return n}function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var l=function(t,e){if(Array.isArray(t))return t;if(Symbol.iterator in Object(t))return function(t,e){var n=[],r=!0,o=!1,a=void 0;try{for(var i,l=t[Symbol.iterator]();!(r=(i=l.next()).done)&&(n.push(i.value),!e||n.length!==e);r=!0);}catch(t){o=!0,a=t}finally{try{!r&&l.return&&l.return()}finally{if(o)throw a}}return n}(t,e);throw new TypeError("Invalid attempt to destructure non-iterable instance")},i="function"==typeof Symbol&&"symbol"==_typeof(Symbol.iterator)?function(t){return _typeof(t)}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":_typeof(t)},s=function(){function t(t,e){for(var n,r=0;r<e.length;r++)(n=e[r]).enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),c=a(9),d=n(c),p=a(0),u=a(1),g=function(){function e(){r(this,e),this.stages=new Map,this.rows=new Map,this.columns=new Map,this.fields=new Map}return s(e,[{key:"processTagName",value:function(t){var e;if("string"==typeof t&&(t={tag:e=t}),t.attrs){var n=t.attrs.tag;if(n){var r=n.filter(function(t){return!0===t.selected});r.length&&(e=r[0].value)}}return t.tag=e||t.tag,t}},{key:"getWrapperClass",value:function(t){return Object.prototype.hasOwnProperty.call(t,"className")&&"g-recaptcha"===t.className?"g-recaptcha-wrapper":"textarea"===t.tag||"select"===t.tag?t.tag+"-wrapper":"input"===t.tag?"radio"===t.attrs.type||"checkbox"===t.attrs.type?"":"input-"+t.attrs.type+"-wrapper":""}},{key:"missingFormControlClass",value:function(t){var e=t.tag,n=d.default.get(t,"attrs.className")||"";return-1!==["input","textarea","select"].indexOf(e)&&-1===n.indexOf("form-control")&&(Array.isArray(n)?n.push("form-control"):n+=" form-control",d.default.set(t,"attrs.className",n)),t}},{key:"create",value:function value(e){e=this.processTagName(e);var t=this,a=void 0,n=e,o=n.tag,r=[],l=void 0,i="",s=t.getFormSettings();s&&s.form&&(i=s.form["display-label"].value,"top"===i?i="":"left"===i&&(i="single-line"));var c={tag:"div",attrs:{},className:[d.default.get(e,"config.inputWrap")||"f-field-group "+i],content:[],config:{}},p={tag:"span",className:"text-error",content:"*"},g=document.createElement(o),y=d.default.get(e,"attrs.required"),f={string:function(t){g.innerHTML+=t},object:function(e){return g.appendChild(t.create(e))},node:function(t){return g.appendChild(t)},array:function(e){for(var n=0;n<e.length;n++)a=t.contentType(e[n]),f[a](e[n])},function:function(e){e=e(),a=t.contentType(e),f[a](e)},undefined:function(){return null}};if(r.push("tag"),d.default.get(e,"attrs")||(e.attrs={}),e.className&&(e.attrs.className=e.className,delete e.className),e.attrs&&e.attrs.id&&(e.id=e.attrs.id),(null==d.default.get(e,"attrs.name")||""==d.default.get(e,"attrs.name"))&&(e.attrs.name=e.id),e.options){var h=e,v=h.options;if(v=this.processOptions(v,e),!this.holdsContent(g)||"button"===o)return d.default.forEach(v,function(e){c.content.push(t.create(e))}),e.attrs.className&&(c.className=e.attrs.className),"string"==typeof c.className&&(c.className=[c.className]),c.config=Object.assign({},e.config),c.className.push(d.default.get(e,"attrs.className")),y&&(c.attrs.required=y),this.create(c);f.array.call(this,v),delete e.content,r.push("options")}if(e.config){if(Object.prototype.hasOwnProperty.call(e.config,"recaptcha")&&e.config.recaptcha){delete e.attrs.placeholder,e.attrs["data-sitekey"]=t.sitekey;var b=3,k=function e(){Object.prototype.hasOwnProperty.call(window,"grecaptcha")&&Object.prototype.hasOwnProperty.call(window.grecaptcha,"render")?window.grecaptcha.render(g,{sitekey:t.sitekey,callback:function(t){t&&document.querySelector(".g-recaptcha-error").classList.remove("show")}}):0==--b?g.querySelector(".g-recaptcha").innerHTML=(0,u.getString)("google-recaptcha-not-loaded"):setTimeout(e,1e3)};k()}if(e.config.label&&"button"!==o){var x=t.label(e);"off"===i&&(e.attrs.placeholder="label"in e.config?e.config.label:""),"off"!==i&&y&&(x.innerHTML+=m.create(p).outerHTML),e.config.hideLabel||(t.labelAfter(e)?(c.className="f-"+e.attrs.type,x.insertBefore(g,x.firstChild),c.content.push(x),y&&c.content.push(p)):(c.content.push(x),"off"===i&&y&&c.content.push(p),c.content.push(g)))}r.push("config")}if(e=this.missingFormControlClass(e),e.attrs&&(t.processAttrs(e,g),r.push("attrs")),e.content&&(a=t.contentType(e.content),f[a].call(this,e.content),r.push("content")),e.dataset){for(var S in e.dataset)Object.prototype.hasOwnProperty.call(e.dataset,S)&&(g.dataset[S]=e.dataset[S]);r.push("dataset")}if(e.action){var N=Object.keys(e.action),w=function(t){setTimeout(function(){t(g)},10)};for(l=N.length-1;0<=l;l--){var C=N[l],E=e.action[C];"string"==typeof E&&(E=eval("("+e.action[C]+")"));var T=["focus","blur"];if("onRender"===C)w(E);else{var L=d.default.inArray(C,T);g.addEventListener(C,E,L)}}r.push("action")}var O=["stage","row","column","field"];if(d.default.inArray(e.fType,O)){var _=e.fType+"Data";g[_]=e,r.push(_)}var M=d.default.subtract(r,Object.keys(e));for(l=M.length-1;0<=l;l--)g[M[l]]=e[M[l]];return c.content.length&&(g=this.create(c)),g}},{key:"processAttrs",value:function(t,e){var n=t.attrs,r=void 0===n?{}:n;delete r.tag,Object.keys(r).forEach(function(t){var n=d.default.safeAttrName(t),o=r[t]||"";if(Array.isArray(o))if("object"===i(o[0])){var a=o.filter(function(t){return!0===t.selected});o=a.length?a[0].value:o[0].value}else o=o.join(" ");o&&(e.setAttribute(n,o),"validation"===n&&e.setCustomValidity(o))})}},{key:"processOptions",value:function(t,e){var n=e.action,r=e.attrs,o=r.type||e.tag,a=r.id||e.id;return t.map(function(t,i){var l=function(){var l={tag:"input",attrs:{id:a+i,name:r.name,type:o,value:t.value||""},action:n},c={tag:"span",className:"checkable",content:t.label},u={tag:"label",attrs:{},config:{inputWrap:"form-check"},content:[t.label]},s={tag:"div",content:[u],className:["f-"+o]};return e.attrs.className&&(e.config.inputWrap=e.attrs.className),e.config.inline&&s.className.push("f-${fieldType}-inline"),t.selected&&(l.attrs.checked=!0),t.name&&(l.attrs.name=t.name),u.content=c,u=m.create(u),l=m.create(l),u.insertBefore(l,u.firstChild),s.content=u,s};return{select:function(){return{tag:"option",attrs:t,content:t.label}},button:function(t){var n=t.type,r=t.label,o=t.className,a=t.id;return Object.assign({},e,{attrs:{type:n},className:o,id:a||(0,u.uuid)(),options:void 0,content:r,action:e.action})},checkbox:l,radio:l,datalist:function(){return{tag:"option",attrs:{value:t.value},content:t.value}}}[o](t)})}},{key:"holdsContent",value:function(t){return-1!==t.outerHTML.indexOf("/")}},{key:"isBlockInput",value:function(t){return!this.isInput(t)&&this.holdsContent(t)}},{key:"isInput",value:function(t){return"string"!=typeof t&&(t=t.tagName),-1!==["input","textarea","select"].indexOf(t)}},{key:"parsedHtml",value:function(t){var e=document.createElement("textarea");return e.innerHTML=t,e.textContent}},{key:"labelAfter",value:function(t){var e=d.default.get(t,"attrs.type");return"checkbox"===e||"radio"===e||d.default.get(t,"config.labelAfter")}},{key:"label",value:function(t,e){var n={tag:"label",attrs:{},className:[],content:t.config.label,action:{}};if(this.labelAfter(t)){var r={tag:"span",className:"checkable",content:t.config.label};n.content=r}return t.id&&(n.attrs.for=t.id),e&&(delete n.attrs.for,n.attrs.contenteditable=!0,n.fMap=e),m.create(n)}},{key:"contentType",value:function(t){var e=void 0===t?"undefined":i(t);return t instanceof Node||t instanceof HTMLElement?e="node":Array.isArray(t)&&(e="array"),e}},{key:"getStyle",value:function(t){var e=1<arguments.length&&void 0!==arguments[1]&&arguments[1],n=void 0;return window.getComputedStyle?n=window.getComputedStyle(t,null):t.currentStyle&&(n=t.currentStyle),e?n[e]:n}},{key:"getElement",value:function(t){return{node:function(){return t},object:function(){return document.getElementById(t.id)},string:function(){return document.getElementById(t)}}[this.contentType(t)]()}},{key:"remove",value:function(t){var e=t.fType,n=t.id;if(e){var r=t.parentElement,o=p.formData[r.fType].get(r.id);p.data.empty(e,n),this[e].delete(n),p.formData[e].delete(n),(0,u.remove)(o[e],n)}return t.parentElement.removeChild(t)}},{key:"empty",value:function(t){for(;t.firstChild;)this.remove(t.firstChild);return t}},{key:"formGroup",value:function(t){return{tag:"div",className:["f-field-group",1<arguments.length&&void 0!==arguments[1]?arguments[1]:""],content:t}}},{key:"updateColumnPreset",value:function(t){var e=t.querySelector(".column-preset"),n=e.parentElement,r=this.columnPresetControl(t.id),o=this.create(r);return n.replaceChild(o,e),r}},{key:"processColumnConfig",value:function(t){t.className&&t.className.push("f-render-column");var e=t.config.width||"100%";return t.style="width: "+e,t}},{key:"checkValidity",value:function(t){if("g-recaptcha"===t.className){var e=!1,n=(0,u.getString)("recaptcha-error");if(Object.prototype.hasOwnProperty.call(window,"grecaptcha")&&(e=""!==window.grecaptcha.getResponse(),t.hasAttribute("validation")&&(n=t.getAttribute("validation"))),e)t.nextSibling&&t.nextSibling.classList.remove("show");else if(t.nextSibling)t.nextSibling.classList.add("show");else{var r=this.create({tag:"div",className:"g-recaptcha-error show",content:n});t.after(r)}return e}if(t.hasChildNodes()){for(var o=0;o<t.children.length;o++)if(!this.checkValidity(t.children[o]))return!1}else if("function"==typeof t.checkValidity)return t.setCustomValidity(""),!!t.checkValidity()||(t.hasAttribute("validation")&&t.setCustomValidity(t.getAttribute("validation")),t.reportValidity());return!0}},{key:"getFormSettings",value:function(){var t=p.formData.settings.get("formSettings");return void 0===t?this.getFormDefaultSettings():t}},{key:"getFormSubmitButton",value:function(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:"",e=this.getFormSettings();return{tag:"button",attrs:{id:"submit-form",className:e.submit.class.value+t,type:"button","data-processing":e.submit["processing-text"].value,style:e.submit.style.value},action:{click:function(){}},content:e.submit.text.value}}},{key:"getSubmitButtonPosition",value:function(){var t=this.getFormSettings().submit.position.value;return"text-"+(t||"center")}},{key:"getElementFromCondition",value:function(t){var e=t.content[0].options,n=t.content[1].options,r=t.content[2].options,o=null,a=null,i=null;if(0<e.length){o=e[0].value;for(var l=0;l<e.length;l++)if(!0===e[l].selected){o=e[l].value;break}o=this.container.querySelectorAll('[id*="'+o+'"]')}if(0<n.length){a=n[0].value;for(var c=0;c<n.length;c++)if(!0===n[c].selected){a=n[c].value;break}}if(0<r.length){i=r[0].value;for(var u=0;u<r.length;u++)if(!0===r[u].selected){i=r[u].value;break}}return{source:o,value:a,operator:i}}},{key:"getConditionChangedValue",value:function(t){var e=(0,u.elementTagType)(t[0]);switch(e.tag){case"SELECT":return t[0].value;case"INPUT":if("radio"===e.type){for(var n=0;n<t.length;n++)if(t[n].checked)return t[n].value;return null}}return null}},{key:"applyConditionsOnElemets",value:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"enable";if(t.hasChildNodes())for(var n=0;n<t.children.length;n++)this.applyConditionsOnElemets(t.children[n],e);else"disable"===e?t.setAttribute("disabled",!0):t.removeAttribute("disabled")}},{key:"executeCondition",value:function(t,e){var n=this,r=null,o=void 0,a=void 0,i=void 0,l=void 0;for(0<t.length&&(a=t[0],r=(l=n.getConditionChangedValue(a.source))===a.value),i=1;i<t.length-1;i++)switch(a=t[i],o=(l=n.getConditionChangedValue(a.source))===a.value,t[i-1].operator){case"AND":r=r&&o;break;case"OR":r=r||o}if(i<t.length)switch(a=t[i],l=n.getConditionChangedValue(a.source),o=l===a.value,t[i-1].operator){case"AND":r=r&&o;break;case"OR":r=r||o}!0===r?(e.style.display="flex",this.applyConditionsOnElemets(e,"enable")):(e.style.display="none",this.applyConditionsOnElemets(e,"disable"))}},{key:"processEachCondition",value:function(t,e){for(var n=this,r=[],o=void 0,a=void 0,i=void 0,l=0;l<t.length;l++)o=t[l],a=n.getElementFromCondition(o),r.push(a);for(var c=0;c<r.length;c++)switch(a=r[c],(i=(0,u.elementTagType)(a.source[0])).tag){case"SELECT":a.source[0].addEventListener("change",function(){n.executeCondition(r,e)}),n.executeCondition(r,e);break;case"INPUT":if("radio"===i.type)for(var s=0;s<a.source.length;s++)a.source[s].addEventListener("click",function(){n.executeCondition(r,e)}),n.executeCondition(r,e)}}},{key:"applyConditions",value:function(t){var e=this;t.forEach(function(t){var n=t.id;if(0<t.conditions.length){var r=e.container.querySelector('[id="'+n+'"]');r&&(r.style.display="none",e.processEachCondition(t.conditions,r))}})}},{key:"getFormDefaultSettings",value:function(){var t={class:{title:(0,u.getString)("class"),id:"class",type:"text",value:"efb-form"},"background-color":{title:(0,u.getString)("backgroundcolor"),id:"background-color",type:"color",value:"#ffffff"},color:{title:(0,u.getString)("textcolor"),id:"color",type:"color",value:"#000000"},width:{title:(0,u.getString)("form-width"),id:"width",type:"range",value:"100",attrs:{min:"20",max:"100"}},padding:{title:(0,u.getString)("form-padding"),id:"padding",type:"range",value:"40",attrs:{min:"0",max:"100"}},"display-label":{title:(0,u.getString)("display-label"),id:"display-label",type:"select",value:"top",options:{option1:{value:"off",label:(0,u.getString)("display-label-off")},option2:{value:"top",label:(0,u.getString)("display-label-top")},option3:{value:"left",label:(0,u.getString)("display-label-left")}}}},e={class:{title:(0,u.getString)("class"),id:"class",type:"text",value:"btn btn-primary"},text:{title:(0,u.getString)("submitbuttontext"),id:"text",type:"text",value:"Submit"},"processing-text":{title:(0,u.getString)("submitbuttonprocessingtext"),id:"processing-text",type:"text",value:"Submitting...."},position:{title:(0,u.getString)("submitbuttonposition"),id:"position",type:"select",value:"center",options:{option1:{value:"left",label:(0,u.getString)("position-left")},option2:{value:"center",label:(0,u.getString)("position-center")},option3:{value:"right",label:(0,u.getString)("position-right")}}}};return{page:{class:{title:(0,u.getString)("class"),id:"class",type:"text",value:""},"background-opacity":{title:(0,u.getString)("page-background-opacity"),id:"background-opacity",type:"range",value:"0",attrs:{step:"0.1",min:"0",max:"1"}},style:{title:(0,u.getString)("customcssstyle"),id:"style",type:"textarea",value:""}},form:t,submit:e}}},{key:"mergeStyles",value:function(t,e){var n={},r=void 0,o=void 0,a="",i=void 0;""!==(e=e.trim())&&(e=e.split(";"),d.default.forEach(e,function(t){""!==(t=t.trim())&&(i=t.indexOf(":"),r=t.substring(0,i).trim(),o=t.substring(i+1).trim(),""!==r&&""!==o&&(n[r]=o))}),t=d.default.merge(t,n));var c=!0,u=!1,s=void 0;try{for(var f,p=Object.entries(t)[Symbol.iterator]();!(c=(f=p.next()).done);c=!0){var g=l(f.value,2);a+=g[0]+": "+g[1]+"; "}}catch(t){u=!0,s=t}finally{try{!c&&p.return&&p.return()}finally{if(u)throw s}}return a}},{key:"getMaxColumnCount",value:function(){if(0==p.formData.rows.size)return 0;var t=0;return p.formData.rows.forEach(function(e){e.columns.length>t&&(t=e.columns.length)}),t}},{key:"manageFormWidth",value:function(t){var e=this,n=this.getFormSettings(),r=this.getMaxColumnCount(),o=function(t){e.renderTarget.classList.toggle("edwiser-inline-form",t)};if(t&&!1===n.form.responsive.value)o(!1);else{var a=document.getElementById("formeo-rendered-"+(document.getElementsByClassName("formeo-render").length-1)).offsetWidth;o(0!==r&&1!==r&&(2===r?360>a:3===r?480>a:4===r?640>a:800>a))}}},{key:"processFormSettings",value:function(t){var e=document.getElementById("edwiserform-fullpage"),n=this.getFormSettings(),r=n.form.class?n.form.class.value:"",o=n.form.color?n.form.color.value:"inherit",a=n.form["background-color"]?n.form["background-color"].value:"inherit",i=n.form.width?n.form.width.value:"100",l=n.form.padding?n.form.padding.value:"25",c=100==i?"0 auto":"5% auto";e&&!1!==e.value||(i="100",l=5);var u=n.form.style?n.form.style.value:"";""!==r&&t.classList.add(r);var s={color:o,"background-color":a,margin:c,width:i+"%",padding:l+"px"};100==i&&(s["box-shadow"]="none"),e&&1==e.value&&(s["z-index"]=1),u=this.mergeStyles(s,u),t.setAttribute("style",u),this.manageFormWidth(e)}},{key:"processPageSettings",value:function(t){var e=document.getElementById("edwiserform-fullpage");if(e&&!1!==e.value){var n=this.getFormSettings(),r=n.page.class?n.page.class.value:"",o=n.page.style?n.page.style.value:"",a=n.page["background-opacity"]?n.page["background-opacity"].value:"0";t.after(this.create({tag:"div",attrs:{id:"edwiserform-background-cover",style:"position: fixed; width: 100%; height: 100%; background: rgba(0,0,0,"+a+");"}}));for(var i=document.getElementsByTagName("body")[0],l=t.parentElement;!l.isEqualNode(i);)l.style.background="transparent",l.style.margin="0",l.style.padding="0",l=l.parentElement;o=this.mergeStyles({margin:"-1px 0 0 0",padding:"0"},o),""!==r&&i.classList.add(r),""!==o&&i.setAttribute("style",o)}}},{key:"renderForm",value:function(t){var e=this;this.empty(t),this.renderTarget=t;var n=p.data.prepData,r=document.getElementsByClassName("formeo-render").length,a=!0,i=Object.values(n.stages).map(function(t){var r=t.rows,i=o(t,["rows"]);return r=r.map(function(t){var r=n.rows[t],a=r.columns,i=o(r,["columns"]),l=a.map(function(t){var r=e.processColumnConfig(n.columns[t]),o=r.fields.map(function(t){return n.fields[t]});return r.tag="div",r.content=o,r});i.tag="div",i.content=[l];var c=(0,u.clone)(i);if(i.config.inputGroup){var s={tag:"button",className:"remove-input-group",content:m.icon("remove"),action:{mouseover:function(t){t.target.parentElement.classList.add("will-remove")},mouseleave:function(t){t.target.parentElement.classList.remove("will-remove")},click:function(t){var e=t.target.parentElement;1<e.parentElement.getElementsByClassName("f-input-group").length?m.remove(e):console.log("Need at least 1 group")}}};c.content.unshift(s);var f={tag:"div",id:(0,u.uuid)(),className:"f-input-group-wrap"};c.attrs.className&&("string"==typeof c.attrs.className?c.attrs.className+=" f-input-group":c.attrs.className.push("f-input-group"));var d={tag:"button",attrs:{className:"add-input-group btn pull-right",type:"button"},content:"Add +",action:{click:function(t){var e=t.target.parentElement,n=m.create(c);e.insertBefore(n,e.lastChild)}}};i.content.unshift(s),f.content=[c,d],i=f}return i}),i.tag="div",i.content=r,i.className="f-stage",i.title="",a?(a=!1,i.className+=" active"):i.className+=" d-none",i});t.appendChild(this.create({tag:"div",id:"formeo-rendered-"+r,className:"formeo-render formeo",content:i})),t.append(this.create({tag:"div",attrs:{className:["form-submit",this.getSubmitButtonPosition()]},content:[m.getFormSubmitButton()]}));var l=document.getElementById("edwiserform-fullpage");l&&!1!==l||t.append(this.create({tag:"div",content:(0,u.getString)("fullpage-link-message")})),m.applyConditions(p.formData.rows),m.processFormSettings(t),m.processPageSettings(t)}},{key:"h",value:function(t,e,n){return this.create({tag:t,attrs:e,content:n})}},{key:"addModal",value:function(t){t=m.create(t),this.container.parentElement.appendChild(t),setTimeout(function(){t.classList.toggle("show"),t.focus()},150)}},{key:"removeModal",value:function(t){var e=document.getElementById(t);e.classList.remove("show"),setTimeout(function(){e.remove()},150)}},{key:"loading",value:function(){this.addModal({tag:"div",id:"efb-modal-loading",attrs:{className:"efb-modal fade",role:"dialog","aria-hidden":!0},content:{tag:"div",className:"efb-modal-loader"}})}},{key:"loadingClose",value:function(){this.removeModal("efb-modal-loading")}},{key:"alert",value:function(t,e){var n=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,r=this,o=(0,u.uuid)(),a=function t(e){27==e.keyCode&&(null!==n&&n(),r.removeModal(o,t))},i={tag:"div",className:"efb-modal-header bg-"+t,content:[{tag:"h4",attrs:{className:"efb-modal-title text-white",id:"modal-"+o},content:(0,u.getString)(t)},{tag:"button",attrs:{type:"button",className:"close efb-modal-close text-white","data-dismiss":o,"aria-label":(0,u.getString)("close")},content:[{tag:"span",attrs:{"aria-hidden":!0},content:"x",action:{click:function(){r.removeModal(o)}}}],action:{click:function(){r.removeModal(o)}}}]};r.addModal({tag:"div",id:o,attrs:{className:"efb-modal fade",role:"dialog","aria-hidden":!0},content:{tag:"div",attrs:{className:"efb-modal-dialog",role:"document"},content:[i,{tag:"div",className:"efb-modal-body",content:[{tag:"h5",content:e}]},{tag:"div",className:"efb-modal-footer",content:[{tag:"button",attrs:{className:"btn btn-primary",type:"button"},content:"Ok",action:{click:function(){r.removeModal(o),n&&n()},keyup:a}}]}]},action:{keyup:a}})}}]),e}(),m=new g;t.default=m},function(t,e,n){n(4),t.exports=n(7)},function(t,e,n){(function(e,n){!function(e){function r(t,e,n,r){var o=Object.create((e||a).prototype),i=new g(r||[]);return o._invoke=f(t,n,i),o}function o(t,e,n){try{return{type:"normal",arg:t.call(e,n)}}catch(t){return{type:"throw",arg:t}}}function a(){}function i(){}function l(){}function c(t){["next","throw","return"].forEach(function(e){t[e]=function(t){return this._invoke(e,t)}})}function u(t){this.arg=t}function s(t){function e(e,n){var r=t[e](n),i=r.value;return i instanceof u?Promise.resolve(i.arg).then(o,a):Promise.resolve(i).then(function(t){return r.value=t,r})}"object"==_typeof(n)&&n.domain&&(e=n.domain.bind(e));var r,o=e.bind(t,"next"),a=e.bind(t,"throw");e.bind(t,"return"),this._invoke=function(t,n){function o(){return e(t,n)}return r=r?r.then(o,o):new Promise(function(t){t(o())})}}function f(t,e,n){var r=S;return function(a,i){if(r==x)throw new Error("Generator is already running");if(r==O){if("throw"===a)throw i;return{value:void 0,done:!0}}for(;;){var l=n.delegate;if(l){if("return"===a||"throw"===a&&void 0===l.iterator[a]){n.delegate=null;var c=l.iterator.return;if(c&&"throw"===(u=o(c,l.iterator,i)).type){a="throw",i=u.arg;continue}if("return"===a)continue}var u;if("throw"===(u=o(l.iterator[a],l.iterator,i)).type){n.delegate=null,a="throw",i=u.arg;continue}if(a="next",i=void 0,!(s=u.arg).done)return r=k,s;n[l.resultName]=s.value,n.next=l.nextLoc,n.delegate=null}if("next"===a)n._sent=i,n.sent=r==k?i:void 0;else if("throw"===a){if(r==S)throw r=O,i;n.dispatchException(i)&&(a="next",i=void 0)}else"return"===a&&n.abrupt("return",i);if(r=x,"normal"===(u=o(t,e,n)).type){r=n.done?O:k;var s={value:u.arg,done:n.done};if(u.arg!==N)return s;n.delegate&&"next"===a&&(i=void 0)}else"throw"===u.type&&(r=O,a="throw",i=u.arg)}}}function d(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function p(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function g(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(d,this),this.reset(!0)}function m(t){if(t){var e=t[h];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var n=-1,r=function e(){for(;++n<t.length;)if(v.call(t,n))return e.value=t[n],e.done=!1,e;return e.value=void 0,e.done=!0,e};return r.next=r}}return{next:y}}function y(){return{value:void 0,done:!0}}var v=Object.prototype.hasOwnProperty,h="function"==typeof Symbol&&Symbol.iterator||"@@iterator",b="object"==_typeof(t),w=e.regeneratorRuntime;if(w)b&&(t.exports=w);else{(w=e.regeneratorRuntime=b?t.exports:{}).wrap=r;var S="suspendedStart",k="suspendedYield",x="executing",O="completed",N={},E=l.prototype=a.prototype;i.prototype=E.constructor=l,l.constructor=i,i.displayName="GeneratorFunction",w.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===i||"GeneratorFunction"===(e.displayName||e.name))},w.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,l):t.__proto__=l,t.prototype=Object.create(E),t},w.awrap=function(t){return new u(t)},c(s.prototype),w.async=function(t,e,n,o){var a=new s(r(t,e,n,o));return w.isGeneratorFunction(e)?a:a.next().then(function(t){return t.done?t.value:a.next()})},c(E),E[h]=function(){return this},E.toString=function(){return"[object Generator]"},w.keys=function(t){var e=[];for(var n in t)e.push(n);return e.reverse(),function n(){for(;e.length;){var r=e.pop();if(r in t)return n.value=r,n.done=!1,n}return n.done=!0,n}},w.values=m,g.prototype={constructor:g,reset:function(t){if(this.prev=0,this.next=0,this.sent=void 0,this.done=!1,this.delegate=null,this.tryEntries.forEach(p),!t)for(var e in this)"t"===e.charAt(0)&&v.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=void 0)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){function e(e,r){return a.type="throw",a.arg=t,n.next=e,!!r}if(this.done)throw t;for(var n=this,r=this.tryEntries.length-1;0<=r;--r){var o=this.tryEntries[r],a=o.completion;if("root"===o.tryLoc)return e("end");if(o.tryLoc<=this.prev){var i=v.call(o,"catchLoc"),l=v.call(o,"finallyLoc");if(i&&l){if(this.prev<o.catchLoc)return e(o.catchLoc,!0);if(this.prev<o.finallyLoc)return e(o.finallyLoc)}else if(i){if(this.prev<o.catchLoc)return e(o.catchLoc,!0)}else{if(!l)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return e(o.finallyLoc)}}}},abrupt:function(t,e){for(var n,r=this.tryEntries.length-1;0<=r;--r)if((n=this.tryEntries[r]).tryLoc<=this.prev&&v.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var o=n;break}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var a=o?o.completion:{};return a.type=t,a.arg=e,o?this.next=o.finallyLoc:this.complete(a),N},complete:function(t,e){if("throw"===t.type)throw t.arg;"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=t.arg,this.next="end"):"normal"===t.type&&e&&(this.next=e)},finish:function(t){for(var e,n=this.tryEntries.length-1;0<=n;--n)if((e=this.tryEntries[n]).finallyLoc===t)return this.complete(e.completion,e.afterLoc),p(e),N},catch:function(t){for(var e,n=this.tryEntries.length-1;0<=n;--n)if((e=this.tryEntries[n]).tryLoc===t){var r=e.completion;if("throw"===r.type){var o=r.arg;p(e)}return o}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:m(t),resultName:e,nextLoc:n},N}}}}("object"==_typeof(e)?e:"object"==("undefined"==typeof window?"undefined":_typeof(window))?window:"object"==("undefined"==typeof self?"undefined":_typeof(self))?self:this)}).call(this,n(5),n(6))},function(t){var e=function(){return this}();try{e=e||new Function("return this")()}catch(t){"object"==("undefined"==typeof window?"undefined":_typeof(window))&&(e=window)}t.exports=e},function(t){function e(){throw new Error("setTimeout has not been defined")}function n(){throw new Error("clearTimeout has not been defined")}function r(t){if(c===setTimeout)return setTimeout(t,0);if((c===e||!c)&&setTimeout)return c=setTimeout,setTimeout(t,0);try{return c(t,0)}catch(e){try{return c.call(null,t,0)}catch(e){return c.call(this,t,0)}}}function o(){p&&f&&(p=!1,f.length?d=f.concat(d):g=-1,d.length&&a())}function a(){if(!p){var t=r(o);p=!0;for(var e=d.length;e;){for(f=d,d=[];++g<e;)f&&f[g].run();g=-1,e=d.length}f=null,p=!1,function(t){if(u===clearTimeout)return clearTimeout(t);if((u===n||!u)&&clearTimeout)return u=clearTimeout,clearTimeout(t);try{u(t)}catch(e){try{return u.call(null,t)}catch(e){return u.call(this,t)}}}(t)}}function i(t,e){this.fun=t,this.array=e}function l(){}var c,u,s=t.exports={};!function(){try{c="function"==typeof setTimeout?setTimeout:e}catch(t){c=e}try{u="function"==typeof clearTimeout?clearTimeout:n}catch(t){u=n}}();var f,d=[],p=!1,g=-1;s.nextTick=function(t){var e=Array(arguments.length-1);if(1<arguments.length)for(var n=1;n<arguments.length;n++)e[n-1]=arguments[n];d.push(new i(t,e)),1!==d.length||p||r(a)},i.prototype.run=function(){this.fun.apply(null,this.array)},s.title="browser",s.browser=!0,s.env={},s.argv=[],s.version="",s.versions={},s.on=l,s.addListener=l,s.once=l,s.off=l,s.removeListener=l,s.removeAllListeners=l,s.emit=l,s.prependListener=l,s.prependOnceListener=l,s.listeners=function(){return[]},s.binding=function(){throw new Error("process.binding is not supported")},s.cwd=function(){return"/"},s.chdir=function(){throw new Error("process.chdir is not supported")},s.umask=function(){return 0}},function(t,e,n){Object.defineProperty(e,"__esModule",{value:!0});var r=n(0),o=function(t){return t&&t.__esModule?t:{default:t}}(n(2)),a={get formData(){return r.data.json}},i=function t(e,n){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t);var i={dataType:"json",container:".formeo-wrap",prefix:"formeo-",actions:{},localStorage:!0},l=this;return l.container=e.container||i.container,o.default.container=l.container,o.default.sitekey=e.sitekey||"","string"==typeof l.container&&(l.container=document.querySelector(l.container)),delete e.container,r.data.init(i,n),a.dom=o.default,a.render=function(){return o.default.renderForm.call(o.default,l.container)},a};void 0!==window&&(window.Formeo=i,i.dom=o.default),e.default=i},function(t,e){e=t.exports=function(){for(var t,n="",r=0;32>r;r++)t=0|16*e.random(),4<r&&21>r&&!(r%4)&&(n+="-"),n+=(12===r?4:16===r?8|3&t:t).toString(16);return n};var n=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;e.isUUID=function(t){return n.test(t)},e.random=function(){return Math.random()}},function(t,e,n){Object.defineProperty(e,"__esModule",{value:!0});var r="function"==typeof Symbol&&"symbol"==_typeof(Symbol.iterator)?function(t){return _typeof(t)}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":_typeof(t)},o=function(t){return t&&t.__esModule?t:{default:t}}(n(2)),a=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(\.|\[\])(?:\4|$))/g,i=/\\(\\)?/g,l=function(t){var e=[];return Array.isArray(t)?e=t:t.replace(a,function(t,n,r,o){var a;a=r?o.replace(i,"$1"):n||t,e.push(a)}),e},c={hyphenCase:function(t){return(t=t.replace(/([A-Z])/g,function(t){return"-"+t.toLowerCase()})).replace(/\s/g,"-").replace(/^-+/g,"")},safeAttrName:function(t){return{className:"class"}[t]||c.hyphenCase(t)},insertStyle:function(t){var e=o.default.create({tag:"style",content:t.responseText});document.head.appendChild(e)},inArray:function(t,e){return-1!==e.indexOf(t)},forEach:function(t,e,n){for(var r=0;r<t.length;r++)e.call(n,t[r],r)},map:function(t,e){var n=[];return c.forEach(t,function(t,r){return n.push(e(r))}),n},subtract:function(t,e){return e.filter(function(t){return-1===this.indexOf(t)},t)},indexOfNode:function(t,e){var n=e||t.parentElement;return Array.prototype.slice.call(n.childNodes).indexOf(t)},isInt:function(t){return+t===t&&0==t%1},get:function(t,e){for(var n=0,r=(e=l(e)).length;null!==t&&n<r;){if(!Object.prototype.hasOwnProperty.call(t,e[n]))return;t=t[e[n++]]}return n&&n===r?t:void 0},set:function(t,e,n,o){for(var a=-1,i=(e=l(e)).length,c=t;null!==c&&++a<i;){var u=e[a];if("object"===(void 0===c?"undefined":r(c))){var s=n;if(a!=i-1){var f=c[u];void 0===(s=o?o(f,u,c):void 0)&&(s=null===f?[]:f)}Object.prototype.hasOwnProperty.call(c,u)&&c[u]===s&&(void 0!==s||u in c)||(c[u]=s)}c=c[u]}return t},merge:function(t,e){var n=Object.assign({},t,e);for(var o in e)Object.prototype.hasOwnProperty.call(n,o)&&(n[o]=Array.isArray(e[o])?t&&Array.isArray(t[o])?t[o].concat(e[o]):e[o]:"object"===r(e[o])?c.merge(t[o],e[o]):e[o]);return n}};e.default=c}])});
//# sourceMappingURL=formviewer.js.map
