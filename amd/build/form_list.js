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
                var forms = $("#efb-forms").DataTable({
                    paging:   true,
                    ordering: true,
                    // dom: 'Bfrtip',
                    aoColumns: [
                        null,
                        null,
                        { "bSortable": false },
                        null,
                        null,
                        null,
                        { "bSortable": false }
                    ]
                    // buttons: {
                    //     buttons: [
                    //         { extend: 'csvHtml5', text: 'CSV', className: 'btn btn-primary' }
                    //     ]
                    // },
                });
                // console.log(forms);
                $('.efb-modal-close').click(function() {
                    $('#efb-modal').removeClass('show');
                });
                $('body').on('click', '.efb-form-delete', function(event) {
                    event.preventDefault();
                    var id = $(this).parent().data('formid');
                    var row = $(`#efb-form-id-${id}`);
                    var title = $(row).children('.efb-tbl-col-title').text();
                    $('#efb-modal #efb-modal-header').html(M.util.get_string('warning', 'local_edwiserform')).removeClass('bg-success').addClass('bg-warning');
                    $('#efb-modal #efb-modal-body').html(`<h5>${M.util.get_string('efb-delete-form-and-data', 'local_edwiserform', {title, id})}</h5>`);
                    $('#efb-modal').addClass('show delete').removeClass('pro');
                    $('#efb-modal .efb-modal-delete-form').data('formid', id);
                    return;
                });
                $('.efb-modal-delete-form').click(function(event) {
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
                $('.efb-form-export').click(function(event) {
                    event.preventDefault();
                    var string = M.util.get_string('efb-form-action-export-title', 'local_edwiserform');
                    $('#efb-modal #efb-modal-header').html(M.util.get_string('upgrade', 'local_edwiserform')).addClass('bg-success').removeClass('bg-warning');
                    $('#efb-modal #efb-modal-body').html(`<h5>${M.util.get_string('profeature', 'local_edwiserform', string)}</h5>`);
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

                $('.efb-enable-disable-form').click(function(event) {
                    var input = $(this).prev();
                    enable_disable_form(input);
                });

                $('.efb-form-enable').click(function(event) {
                    enable_disable_form(this, true);
                    event.preventDefault();
                    return;
                });

                $('.efb-form-disable').click(function(event) {
                    enable_disable_form(this, false);
                    event.preventDefault();
                    return;
                });
            });
        }
    };
});
