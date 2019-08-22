/*
 * Edwiser_Forms - https://edwiser.org/
 * Version: 0.1.0
 * Author: Yogesh Shirsath
 */
define([
    'jquery',
    'core/ajax',
    'core/notification',
    'local_edwiserform/jquery.dataTables',
    'local_edwiserform/dataTables.bootstrap4',
    'local_edwiserform/fixedColumns.bootstrap4'
], function ($, ajax, notification) {
    return {
        init: function() {
            $(document).ready(function (e) {
                if ($(".efb-wrap-list").data("sesskey") != 0) {
                    var sesskey = $(".efb-wrap-list").data("sesskey");
                    var forms = $("#efb-forms").DataTable({
                        paging          :   true,
                        ordering        : true,
                        bProcessing     : true,
                        bServerSide     : true,
                        rowId           : 'DT_RowId',
                        bDeferRender    : true,
                        sAjaxSource     : M.cfg.wwwroot + "/local/edwiserform/classes/external/get_forms.php",
                        scrollY         : "400px",
                        scrollX         : true,
                        scrollCollapse  : true,
                        fixedColumns    : {
                            leftColumns     : 1,
                            rightColumns    : 1
                        },
                        classes: {
                            sScrollHeadInner: 'efb_dataTables_scrollHeadInner'
                        },
                        dom: '<"efb-top"<"efb-listing"l><"efb-list-filtering"f>>t<"efb-bottom"<"efb-form-list-info"i><"efb-list-pagination"p>><"efb-shortcode-copy-note">',
                        columns: [
                            { data: "title" },
                            { data: "type" },
                            { data: "id" , orderable : false},
                            { data: "author" },
                            { data: "created" },
                            { data: "author2" },
                            { data: "modified" },
                            { data: "actions" , orderable : false}
                        ],
                        language        : {
                            sSearch: M.util.get_string('efb-search-form', 'local_edwiserform'),
                            emptyTable: M.util.get_string('efb-heading-listforms-empty', 'local_edwiserform'),
                            info: M.util.get_string('efb-heading-listforms-showing', 'local_edwiserform', {
                                'start': '_START_',
                                'end': '_END_',
                                'total': '_TOTAL_',
                            }),
                            infoEmpty: M.util.get_string('efb-heading-listforms-showing', 'local_edwiserform', {
                                'start': '0',
                                'end': '0',
                                'total': '0',
                            }),
                        },
                        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                            $('td:eq(0)', nRow).addClass( "efb-tbl-col-title" );
                            $('td:eq(1)', nRow).addClass( "efb-tbl-col-type" );
                            $('td:eq(2)', nRow).addClass( "efb-tbl-col-shortcode").attr('title', M.util.get_string('clickonshortcode', 'local_edwiserform'));
                            $('td:eq(3)', nRow).addClass( "efb-tbl-col-create" );
                            $('td:eq(4)', nRow).addClass( "efb-tbl-col-modified" );
                            $('td:eq(5)', nRow).addClass( "efb-tbl-col-action-list" );
                        },
                        drawCallback: function( settings ) {
                            $('.efb-csv-export').removeClass('dt-button').off();
                            $('.efb-shortcode-copy-note').html(M.util.get_string('note', 'local_edwiserform') + ' ' + M.util.get_string('clickonshortcode', 'local_edwiserform'));
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
                    $('#efb-modal .efb-modal-header').removeClass('bg-success').addClass('bg-warning');
                    $('#efb-modal .efb-modal-title').html(M.util.get_string('warning', 'local_edwiserform'));
                    $('#efb-modal .efb-modal-body').html(`<h5>${M.util.get_string('efb-delete-form-and-data', 'local_edwiserform', {title, id})}</h5>`);
                    $('#efb-modal').addClass('show delete').removeClass('pro deleted');
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
                            id: id
                        }
                    }]);
                    reqDeleteForm[0].done(function(response) {
                        if (response.status == true) {
                            forms.row(row).remove().draw();
                        }
                    }).fail(notification.exception);
                    $('.efb-modal-close').click();
                });

                /**
                 * Get pro feature demo url of youtube video
                 * @param  {string} video type of feature
                 * @return {string}       Youtube embed video url
                 */
                var get_pro_demo_url = (video) => {
                    return videotypes.hasOwnProperty(video) ? videotypes[video] : videotypes['default'];
                }

                $('body').on('click', '.efb-form-export', function(event) {
                    event.preventDefault();
                    $('#efb-modal .efb-modal-header').removeClass('bg-success').addClass('bg-warning');
                    $('#efb-modal .efb-modal-title').html(M.util.get_string('upgrade', 'local_edwiserform'));
                    var string = M.util.get_string('hey-wait', 'local_edwiserform');
                    var exporttitle = M.util.get_string('efb-form-action-export-title', 'local_edwiserform');
                    var message = M.util.get_string('export-pro-message', 'local_edwiserform');
                    message = M.util.get_string('profeaturemessage', 'local_edwiserform', {
                        type: string + '! <b>' + exporttitle + '</b>',
                        message: message
                    });
                    $('#efb-modal .efb-modal-body').html(`
                        <h5>${message}</h5>
                        <div><iframe class="demo" src="${get_pro_demo_url('export')}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
                        </iframe></div>
                    `);
                    $('#efb-modal').addClass('show pro').removeClass('delete deleted');
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
                    var toast = $(`<div class='efb-toaster toaster-container'>
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

                $('body').on('click', '.efb-modal-upgrade-pro', function() {
                    window.open($('#upgrade-url').val());
                });
            });
        }
    };
});
