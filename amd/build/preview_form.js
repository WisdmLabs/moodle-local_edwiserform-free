"use strict";define(["jquery","core/ajax","local_edwiserform/formviewer"],function(e,r){return{init:function(r,n){e(document).ready(function(o){var i=e("#preview-form")[0];new Formeo({container:i,sitekey:n,localStorage:!1},definition).render(i),e(i).prepend("<h2>".concat(r,"</h2>"))})}}});
//# sourceMappingURL=preview_form.js.map
