/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


require(['jquery', 'core/ajax'], function ($, ajax) {
    $(document).ready(function (e) {
		var svg = '<svg id="diagtext" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"><style type="text/css">text { opacity:0.2; fill: black;font-family: Avenir, Arial, Helvetica, sans-serif;}</style><defs><pattern id="twitterhandle" patternUnits="userSpaceOnUse" width="150" height="100"><text y="30" font-size="40" id="name">PRO</text></pattern><pattern id="combo" xlink:href="#twitterhandle" patternTransform="rotate(-45)"><use xlink:href="#name" /></pattern></defs><rect width="100%" height="100%" fill="url(#combo)" /></svg>';
		$('body').append('<style class"lessonplan-watermark"> .efb-import-form-pro-cover { background-image: url(data:image/svg+xml;base64,'+window.btoa(svg)+'); }</style>');
    });
});

