/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


define([
    'jquery',
    'local_edwiserform/jszip',
    'local_edwiserform/jquery.dataTables',
    'local_edwiserform/dataTables.bootstrap4',
    'local_edwiserform/dataTables.buttons',
    'local_edwiserform/buttons.html5'
    ], function ($) {
    return {
        init: function(formid) {
            $(document).ready(function (e) {
                $("#efb-form-submissions").DataTable({
                    "paging":   true,
                    "ordering": false,
                    "bProcessing": true,
                    "bServerSide": true,
                    "rowId": 'DT_RowId',
                    "bDeferRender": true,
                    "sAjaxSource": M.cfg.wwwroot + "/local/edwiserform/lib.php?datatable=1&action=efb_form_data_list&formid="+formid,
                    dom: '<"efb-top"<"efb-listing"l><"efb-list-filtering"f>>t<"efb-bottom"<"efb-list-pagination"p><"efb-export"B>>i',
                    language: {
                        sSearch: M.util.get_string('efb-search-form', 'local_edwiserform')
                    },
                    buttons: [
                        { text: M.util.get_string('exportcsv', 'local_edwiserform'), className: 'btn btn-primary efb-csv-export' }
                    ],
                    drawCallback: function( settings ) {
                        $('.efb-csv-export').removeClass('dt-button').off();
                        $('.efb-shortcode-copy-note').html(M.util.get_string('clickonshortcode', 'local_edwiserform'));
                    }
                });
            });
        }
    };
});
