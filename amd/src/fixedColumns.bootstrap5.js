/*! Bootstrap 5 styling wrapper for FixedColumns
 * ©2018-2023 SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'local_edwiserform/dataTables.bootstrap5', 'local_edwiserform/dataTables.fixedColumns'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		module.exports = function (root, $) {
			if ( ! root ) {
				root = window;
			}

			if ( ! $ || ! $.fn.dataTable ) {
				$ = require('local_edwiserform/dataTables.bootstrap5')(root, $).$;
			}

			if ( ! $.fn.dataTable.FixedColumns ) {
				require('local_edwiserform/dataTables.fixedColumns')(root, $);
			}

			return factory( $, root, root.document );
		};
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document, undefined ) {
'use strict';
var dataTable = $.fn.dataTable;

return dataTable.fixedColumns;
})); 