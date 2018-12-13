/*
 * Edwiser_Forms - https://edwiser.org/
 * Version: 0.1.0
 * Author: Yogesh Shirsath
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
                    "sAjaxSource": M.cfg.wwwroot + "/local/edwiserform/classes/external/get_form_submissions.php?formid=" + formid,
                    dom: '<"efb-top"<"efb-listing"l><"efb-list-filtering"f>>t<"efb-bottom"<"efb-list-pagination"p><"efb-export"B>>i',
                    language: {
                        sSearch: M.util.get_string('efb-search-form', 'local_edwiserform')
                    },
                    buttons: [
                        { text: M.util.get_string('exportcsv', 'local_edwiserform'), className: 'btn btn-primary efb-csv-export' }
                    ],
                    drawCallback: function( settings ) {
                        $('.efb-table thead th').addClass('header').each(function(index, el) {
                            $(el).addClass('c' + index);
                        });
                        $('.efb-csv-export').removeClass('dt-button').off();
                        $('.efb-shortcode-copy-note').html(M.util.get_string('clickonshortcode', 'local_edwiserform'));
                    }
                });
            });
        }
    };
});
