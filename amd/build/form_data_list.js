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
        init: function() {
            $(document).ready(function (e) {
                $("#efb-form-submissions").DataTable({
                    paging:   true,
                    ordering: true,
                    dom: '<"efb-top"<"efb-listing"l><"efb-list-filtering"f>>t<"efb-bottom"<"efb-list-pagination"p><"efb-export"B>>i',
                    buttons: [
                        { text: M.util.get_string('exportcsv', 'local_edwiserform'), className: 'btn btn-primary efb-csv-export' }
                    ]
                });
            });
        }
    };
});
