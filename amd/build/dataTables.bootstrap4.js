!function(e){"function"==typeof define&&define.amd?define(["jquery"],function(a){return e(a,window,document)}):"object"==typeof exports?module.exports=function(a,t){return a||(a=window),t&&t.fn.dataTable||(t=define("jquery.dataTables")(a,t).$),e(t,a,a.document)}:e(jQuery,window,document)}(function(e,a,t,n){"use strict";var o=e.fn.dataTable;return e.extend(!0,o.defaults,{dom:"<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>><'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",renderer:"bootstrap"}),e.extend(o.ext.classes,{sWrapper:"dataTables_wrapper container-fluid dt-bootstrap4",sFilterInput:"form-control form-control-sm",sLengthSelect:"form-control form-control-sm",sProcessing:"dataTables_processing card",sPageButton:"paginate_button page-item"}),o.ext.renderer.pageButton.bootstrap=function(a,s,r,i,d,l){var c,u,p,f=new o.Api(a),b=a.oClasses,m=a.oLanguage.oPaginate,g=a.oLanguage.oAria.paginate||{},x=0,w=function(t,n){var o,s,i,p,T=function(a){a.preventDefault(),e(a.currentTarget).hasClass("disabled")||f.page()==a.data.action||f.page(a.data.action).draw("page")};for(o=0,s=n.length;o<s;o++)if(p=n[o],e.isArray(p))w(t,p);else{switch(c="",u="",p){case"ellipsis":c="&#x2026;",u="disabled";break;case"first":c=m.sFirst,u=p+(d>0?"":" disabled");break;case"previous":c=m.sPrevious,u=p+(d>0?"":" disabled");break;case"next":c=m.sNext,u=p+(d<l-1?"":" disabled");break;case"last":c=m.sLast,u=p+(d<l-1?"":" disabled");break;default:c=p+1,u=d===p?"active":""}c&&(i=e("<li>",{class:b.sPageButton+" "+u,id:0===r&&"string"==typeof p?a.sTableId+"_"+p:null}).append(e("<a>",{href:"#","aria-controls":a.sTableId,"aria-label":g[p],"data-dt-idx":x,tabindex:a.iTabIndex,class:"page-link"}).html(c)).appendTo(t),a.oApi._fnBindAction(i,{action:p},T),x++)}};try{p=e(s).find(t.activeElement).data("dt-idx")}catch(e){}w(e(s).empty().html('<ul class="pagination"/>').children("ul"),i),p!==n&&e(s).find("[data-dt-idx="+p+"]").focus()},o});