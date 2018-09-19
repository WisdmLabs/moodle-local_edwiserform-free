/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


define([
       'jquery',
       'core/ajax',
       'local_edwiserform/jszip',
       'local_edwiserform/jquery.dataTables',
       'local_edwiserform/dataTables.bootstrap4',
       'local_edwiserform/dataTables.buttons',
       'local_edwiserform/buttons.html5'
       ], function ($, ajax) {
    return {
        init: function() {
            $(document).ready(function (e) {
                function guid() {
                    function s4() {
                        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    }
                    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
                }
                if ($(".efb-wrap-list").data("sesskey") != 0) {
                    var sesskey = $(".efb-wrap-list").data("sesskey");
                    var forms = $("#efb-forms").DataTable({
                        "paging":   true,
                        "ordering": true,
                        "bProcessing": true,
                        "bServerSide": true,
                        "rowId": 'DT_RowId',
                        "bDeferRender": true,
                        "sAjaxSource": M.cfg.wwwroot + "/local/edwiserform/lib.php?datatable=1&action=efb_form_list",
                        dom: '<"efb-top"<"efb-listing"l><"efb-list-filtering"f>>t<"efb-bottom"<"efb-form-list-info"i><"efb-list-pagination"p>><"efb-shortcode-copy-note">',
                        "columns": [
                            { "data": "title" },
                            { "data": "type" },
                            { "data": "id" , "orderable" : false},
                            { "data": "author" },
                            { "data": "created" },
                            { "data": "author2" },
                            { "data": "modified" },
                            { "data": "actions" , "orderable" : false}
                        ],
                        language: {
                            sSearch: M.util.get_string('efb-search-form', 'local_edwiserform')
                        },
                        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                            $('td:eq(0)', nRow).addClass( "efb-tbl-col-title" );
                            $('td:eq(1)', nRow).addClass( "efb-tbl-col-type" );
                            $('td:eq(2)', nRow).addClass( "efb-tbl-col-shortcode" );
                            $('td:eq(3)', nRow).addClass( "efb-tbl-col-create" );
                            $('td:eq(4)', nRow).addClass( "efb-tbl-col-modified" );
                            $('td:eq(5)', nRow).addClass( "efb-tbl-col-action-list" );
                        },
                        drawCallback: function( settings ) {
                            $('.efb-csv-export').removeClass('dt-button').off();
                            $('.efb-shortcode-copy-note').html(M.util.get_string('clickonshortcode', 'local_edwiserform'));
                        }
                    });
                }
                $('.efb-modal-close').click(function() {
                    $('#efb-modal').removeClass('show');
                });
                $('body').on('click', '.efb-form-delete', function(event) {
                    event.preventDefault();
                    var id = $(this).data('formid');
                    var row = $(this).parents('tr');
                    var title = $(row).children('.efb-tbl-col-title').text();
                    $('#efb-modal #efb-modal-header').removeClass('bg-success').addClass('bg-warning').children('.modal-title').html(M.util.get_string('warning', 'local_edwiserform'));
                    $('#efb-modal #efb-modal-body').html(`<h5>${M.util.get_string('efb-delete-form-and-data', 'local_edwiserform', {title, id})}</h5>`);
                    $('#efb-modal').addClass('show delete').removeClass('pro');
                    $('#efb-modal .efb-modal-delete-form').data('formid', id);
                    return;
                });
                $('body').on('click', '.efb-modal-delete-form', function(event) {
                    event.preventDefault();
                    var id = $(this).data('formid');
                    var row = $(`#efb-form-id-${id}`);
                    var title = $(row).children('.efb-tbl-col-title').text();
                    var reqDeleteForm = ajax.call([{
                        methodname: 'edwiserform_delete_form',
                        args: {
                            id
                        }
                    }]);
                    reqDeleteForm[0].done(function(response) {
                        if (response.status == true) {
                            forms.row(row).remove().draw();
                        }
                    }).fail(function(ex) {
                    });
                    $('.efb-modal-close').click();
                });
                $('body').on('click', '.efb-form-export', function(event) {
                    event.preventDefault();
                    $('#efb-modal #efb-modal-header').addClass('bg-success').removeClass('bg-warning').children('.modal-title').html(M.util.get_string('upgrade', 'local_edwiserform'));
                    var string = M.util.get_string('hey-wait', 'local_edwiserform');
                    var message = M.util.get_string('export-pro-message', 'local_edwiserform');
                    message = M.util.get_string('profeaturemessage', 'local_edwiserform', {
                        type: string,
                        message
                    });
                    $('#efb-modal #efb-modal-body').html(`<h5>${message}</h5>`);
                    $('#efb-modal').addClass('show pro').removeClass('delete');
                });

                function enable_disable_form(input) {
                    var formid = $(input).data('formid');
                    var enabledisableform = ajax.call([{
                        methodname: 'edwiserform_enable_disable_form',
                        args: {
                            id: formid,
                            action: !$(input).is(':checked')
                        }
                    }]);
                    enabledisableform[0].done(function(response) {
                        if (response.status) {
                            $(input).prop('checked', $(input).is(':checked'));
                        } else {
                            $(input).prop('checked', !$(input).is(':checked'));
                        }
                        $(input).parent().attr('title', $(input).is(':checked') ? $(input).data('disable-title') : $(input).data('enable-title'))
                    }).fail(function(ex) {
                        console.log(ex);
                    });
                }

                $('body').on('click', '.efb-enable-disable-form', function(event) {
                    var input = $(this).prev();
                    enable_disable_form(input);
                });

                function show_toaster(msg) {
                    var id= guid();
                    var toast = $(`<div id='${id}' class='efb-toaster toaster-container'>
                      <lable class='toaster-message'>${msg}</lable>
                    </div>`);
                    $('body').append(toast);
                    $(toast).addClass('show');
                    setTimeout(function() {
                        $(toast).addClass('fade');
                        setTimeout(function() {
                            $(toast).removeClass('fade');
                            setTimeout(function() {
                                $(toast).remove();
                            }, 300);
                        }, 2000);
                    });
                }
                $('body').on("click", ".efb-tbl-col-shortcode", function(event) {
                    var temp = $('<input>');
                    $('body').append(temp);
                    var shortcode = $(this).text();
                    temp.val(shortcode).select();
                    document.execCommand('copy');
                    temp.remove();
                    show_toaster(M.util.get_string('shortcodecoppied', 'local_edwiserform', shortcode));
                });
            });
        }
    };
});
