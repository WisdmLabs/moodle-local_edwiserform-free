"use strict";define(["jquery","core/ajax","./iefixes","local_edwiserform/formviewer"],function(e,r){return{init:function(r,i){e(document).ready(function(n){e("body").addClass("edwiserform-fullpage");var o=e("#preview-form")[0];new Formeo({container:o,sitekey:i,localStorage:!1},definition).render(o),e(o).prepend("<h2>"+r+"</h2>")})}}});
//# sourceMappingURL=preview_form.js.map
