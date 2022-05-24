/*
 * Edwiser_Forms - https://edwiser.org/
 * Version: 0.1.0
 * Author: Yogesh Shirsath
 */
/* eslint-disable babel/object-curly-spacing */
define([
    'jquery',
    'core/ajax',
    'core/notification',
    'local_edwiserform/jquery.dataTables',
    'local_edwiserform/dataTables.bootstrap4',
    'local_edwiserform/fixedColumns.bootstrap4',
    './iefixes',
    'local_edwiserform/formbuilder'
], function($, Ajax, notification) {
    return {
        init: function() {
            var PROMISES = {

                /**
                 * Delete form and data using ajax
                 * @param  {Number}  id Form id
                 * @return {Promise}        Ajax promise
                 */
                DELETE_FORM: function(id) {
                    return Ajax.call([{
                        methodname: 'edwiserform_delete_form',
                        args: { id }
                    }])[0];
                },

                /**
                 * Get forms using ajax
                 * @param  {String}  search Search query
                 * @param  {Number}  start  Start index of courses
                 * @param  {Number}  length Number of courses
                 * @param  {Array}   order  Column order
                 * @return {Promise}        Ajax promise
                 */
                GET_FORMS: function(search, start, length, order) {
                    return Ajax.call([{
                        methodname: 'edwiserform_get_forms',
                        args: {
                            search: search,
                            start: start,
                            length: length,
                            order: order
                        }
                    }])[0];
                },

                /**
                 * Enable or disable form using id and action
                 * @param  {Number}  id     Form id
                 * @param  {Boolean} action True - Enable, False - Disable
                 * @return {Promise}        Ajax promise
                 */
                ENABLE_DISABLE_FORM: function(id, action) {
                    return Ajax.call([{
                        methodname: 'edwiserform_enable_disable_form',
                        args: {
                            id: id,
                            action: action
                        }
                    }])[0];
                }
            };

            var table = null;

            // Document ready.
            $(document).ready(function() {
                if ($(".efb-wrap-list").data("sesskey") != 0) {
                    table = $("#efb-forms").DataTable({
                        paging: true,
                        ordering: true,
                        bProcessing: true,
                        bServerSide: true,
                        rowId: 'DT_RowId',
                        bDeferRender: true,
                        scrollY: "400px",
                        scrollX: true,
                        scrollCollapse: true,
                        fixedColumns: {
                            leftColumns: 1,
                            rightColumns: 1
                        },
                        classes: {
                            sScrollHeadInner: 'efb_dataTables_scrollHeadInner'
                        },
                        // eslint-disable-next-line max-len
                        dom: '<"efb-top"<"efb-listing"l><"efb-list-filtering"f>>t<"efb-bottom"<"efb-form-list-info"i><"efb-list-pagination"p>><"efb-shortcode-copy-note">',
                        columns: [
                            { data: "title" },
                            { data: "type" },
                            { data: "shortcode", orderable: false },
                            { data: "author" },
                            { data: "created" },
                            { data: "author2" },
                            { data: "modified" },
                            { data: "actions", orderable: false, 'class': 'text-center' }
                        ],
                        language: {
                            sSearch: M.util.get_string('search-form', 'local_edwiserform'),
                            emptyTable: M.util.get_string('heading-listforms-empty', 'local_edwiserform'),
                            info: M.util.get_string(
                                'heading-listforms-showing',
                                'local_edwiserform', { 'start': '_START_', 'end': '_END_', 'total': '_TOTAL_' }
                            ),
                            infoEmpty: M.util.get_string(
                                'heading-listforms-showing',
                                'local_edwiserform', { 'start': '0', 'end': '0', 'total': '0' }
                            ),
                        },
                        // eslint-disable-next-line
                        ajax: function(data, callback, settings) {
                            PROMISES.GET_FORMS(
                                data.search.value,
                                data.start,
                                data.length,
                                data.order[0]
                            ).done(function(response) {
                                callback(response);
                            }).fail(notification.exception);
                        },
                        // eslint-disable-next-line
                        "fnRowCallback": function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                            $('td:eq(0)', nRow).addClass("efb-tbl-col-title");
                            $('td:eq(1)', nRow).addClass("efb-tbl-col-type");
                            $('td:eq(2)', nRow).addClass("efb-tbl-col-shortcode").attr(
                                'title',
                                M.util.get_string('clickonshortcode', 'local_edwiserform')
                            );
                            $('td:eq(3)', nRow).addClass("efb-tbl-col-create");
                            $('td:eq(4)', nRow).addClass("efb-tbl-col-modified");
                            $('td:eq(5)', nRow).addClass("efb-tbl-col-action-list");
                        },
                        // eslint-disable-next-line
                        drawCallback: function(settings) {
                            $('.efb-csv-export').removeClass('dt-button').off();
                            $('.efb-shortcode-copy-note').html(M.util.get_string('note', 'local_edwiserform') +
                                ' ' + M.util.get_string('clickonshortcode', 'local_edwiserform'));
                        }
                    });
                }

                $('body').on('click', '.efb-form-delete', function(event) {
                    event.preventDefault();
                    var id = $(this).data('formid');
                    var title = table.row(this).data().title;
                    // eslint-disable-next-line
                    Formeo.dom.multiActions(
                        'warning',
                        M.util.get_string('warning', 'local_edwiserform'),
                        '<h5>' + M.util.get_string('delete-form-and-data', 'local_edwiserform', { title, id }) + '</h5>', [{
                            title: M.util.get_string('proceed', 'local_edwiserform'),
                            type: 'danger',
                            action: function() {
                                PROMISES.DELETE_FORM(id).done(function(response) {
                                    if (response.status == true) {
                                        table.draw();
                                    }
                                }).fail(notification.exception);
                            }
                        }, {
                            title: M.util.get_string('cancel', 'local_edwiserform'),
                            type: 'success'
                        }]
                    );
                    return;
                });

                /**
                 * Get pro feature demo url of youtube video
                 * @param  {string} video type of feature
                 * @return {string}       Youtube embed video url
                 */
                var getProDemoUrl = function(video) {
                    // eslint-disable-next-line
                    return videotypes.hasOwnProperty(video) ? videotypes[video] : videotypes['default'];
                };

                $('body').on('click', '.efb-form-export', function(event) {
                    event.preventDefault();
                    var string = M.util.get_string('hey-wait', 'local_edwiserform');
                    var exporttitle = M.util.get_string('form-action-export-title', 'local_edwiserform');
                    var message = M.util.get_string('export-pro-message', 'local_edwiserform');
                    message = M.util.get_string('profeaturemessage', 'local_edwiserform', {
                        type: string + '! <b>' + exporttitle + '</b>',
                        message: message
                    });
                    // eslint-disable-next-line
                    Formeo.dom.multiActions(
                        'success',
                        M.util.get_string('upgrade', 'local_edwiserform'),
                        '<h5>' + message + '</h5><div><iframe class="efb-pro-demo" src="' +
                        getProDemoUrl('export') +
                        '" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>', [{
                            title: M.util.get_string('proceed', 'local_edwiserform'),
                            type: 'success',
                            action: function() {
                                window.open($('#upgrade-url').val());
                            }
                        }, {
                            title: M.util.get_string('cancel', 'local_edwiserform'),
                            type: 'secondary'
                        }]
                    );
                });

                /**
                 * Enable disable form
                 * @param {DOM} input Input element
                 */
                function enableDisableForm(input) {
                    var formid = $(input).data('formid');
                    PROMISES.ENABLE_DISABLE_FORM(formid, !$(input).is(':checked'))
                        .done(function(response) {
                            if (response.status) {
                                $(input).prop('checked', $(input).is(':checked'));
                            } else {
                                $(input).prop('checked', !$(input).is(':checked'));
                            }
                            $(input).parent().attr('title', $(input).is(':checked') ?
                                $(input).data('disable-title') :
                                $(input).data('enable-title'));
                        }).fail(function(ex) {
                            // eslint-disable-next-line
                            console.log(ex);
                        });
                }

                // Enable disable form.
                $('body').on('click', '.efb-enable-disable-form', function() {
                    var input = $(this).prev();
                    enableDisableForm(input);
                });

                // Copy shortcode.
                $('body').on("click", ".efb-tbl-col-shortcode", function() {
                    var temp = $('<input>');
                    $('body').append(temp);
                    var shortcode = $(this).text();
                    temp.val(shortcode).select();
                    document.execCommand('copy');
                    temp.remove();
                    // eslint-disable-next-line
                    Formeo.dom.toaster(M.util.get_string('shortcodecoppied', 'local_edwiserform', shortcode));
                });
            });
        }
    };
});