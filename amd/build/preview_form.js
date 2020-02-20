"use strict";define(["jquery","core/ajax","local_edwiserform/formviewer"],function(e,r){return{init:function(r,n){e(document).ready(function(i){var o=e("#preview-form")[0];new Formeo({container:o,sitekey:n,localStorage:!1},definition).render(o),e(o).prepend("<h2>"+r+"</h2>")})}}});
//# sourceMappingURL=preview_form.js.map
