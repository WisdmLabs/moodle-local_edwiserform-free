/*
 * Edwiser_Forms - https://edwiser.org/
 * Version: 0.1.0
 * Author: Yogesh Shirsath
 */
define([
    'jquery',
    'core/ajax',
    'core/templates',
    'core/notification',
    'local_edwiserform/jquery.dataTables',
    'local_edwiserform/dataTables.bootstrap4',
    'local_edwiserform/fixedColumns.bootstrap4',
    'local_edwiserform/buttons.bootstrap4',
    'local_edwiserform/formbuilder'
], function ($, Ajax, Templates, Notification) {
    var update_separator = function() {
        var actions = null;
        if ($('.DTFC_LeftBodyLiner tr').length == 0) {
            return;
        }
        $('.DTFC_LeftBodyLiner tr').each(function(index, tr) {
            $(tr).find('.efb-data-actions span').remove();
            var actions = $(tr).find('.efb-data-action.show');
            if (actions.length < 2) {
                return;
            }
            actions.slice(0, actions.length - 1).after('<span> | </span>');
        });
    };
    return {
        init: function(formid) {
            var PROMISES = {
                /**
                 * Ajax promise to delete form submission by ids
                 * @param  {Number}   id Id of submission
                 * @return {Promise}     Ajax promise
                 */
                DELETE_SUBMISSION: function(id) {
                    return Ajax.call([{
                        methodname: 'edwiserform_delete_submission',
                        args: {
                            id: formid,
                            submission: id
                        }
                    }])[0]
                },

                /**
                 * Get form data using ajax
                 * @param  {String}  search Search query
                 * @param  {Number}  length Number of courses
                 * @param  {Number}  start  Start index of courses
                 * @return {Promise}        Ajax promise
                 */
                GET_FORM_SUBMISSIONS: function(search, start, length) {
                    return Ajax.call([{
                        methodname: 'edwiserform_get_form_submissions',
                        args: {
                            formid : formid,
                            search : search,
                            start  : start,
                            length : length
                        }
                    }])[0];
                },
            };

            var table = null;
            $(document).ready(function (e) {
                table = $("#efb-form-submissions").DataTable({
                    paging      : true,
                    ordering    : false,
                    bProcessing : true,
                    bServerSide : true,
                    rowId       : 'DT_RowId',
                    bDeferRender: true,
                    scrollY         : "400px",
                    scrollX         : true,
                    scrollCollapse  : true,
                    fixedColumns    : {
                        leftColumns     : 2,
                    },
                    classes: {
                        sScrollHeadInner: 'efb_dataTables_scrollHeadInner'
                    },
                    dom             : '<"efb-top"<"efb-listing"l><"efb-list-filtering"f>>t<"efb-bottom"<"efb-list-pagination"p><B><"efb-bulk">>i',
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
                    buttons: [],
                    ajax: function(data, callback, settings) {
                        PROMISES.GET_FORM_SUBMISSIONS(
                            data.search.value,
                            data.start,
                            data.length
                        ).done(function(response) {
                            callback(response);
                            update_separator();
                        }).fail(Notification.exception);
                    },
                    drawCallback: function( settings ) {
                        update_separator();
                        $('.efb-bottom .dt-buttons').removeClass('btn-group');
                        window['rendered'] = Templates.render('local_edwiserform/bulk-actions', {
                            formid: formid,
                            wwwroot: M.cfg.wwwroot
                        });
                        window['rendered']
                        .done(function(html, js) {
                            Templates.replaceNode($('.efb-bulk'), html, js);
                        })
                        .fail(Notification.exception);
                        $('.efb-shortcode-copy-note').html(M.util.get_string('clickonshortcode', 'local_edwiserform'));
                    }
                });
            });

            // Select All/None checkbox
            $('body').on('change', '.submission-check-all', function() {
                $('.DTFC_Cloned .submission-check').prop('checked', $(this).is(':checked'));
            });

            $('body').on('click', '.efb-data-action.delete-action', function(event) {
                event.preventDefault();
                var id = $(this).data('value');
                Formeo.dom.multiActions(
                    'warning',
                    M.util.get_string('deletesubmission', 'local_edwiserform'),
                    M.util.get_string('deletesubmissionmsg', 'local_edwiserform'),
                    [{
                        title: M.util.get_string('proceed', 'local_edwiserform'),
                        type: 'danger',
                        action: function() {
                            Formeo.dom.loading();
                            PROMISES.DELETE_SUBMISSION(id).done(function(response) {
                                if (response.status == true) {
                                    Formeo.dom.alert('success', `<div class='col-12'>${response.msg}</div>`);
                                    table.draw();
                                    $('.submission-check-all').prop('checked', false);
                                }
                                Formeo.dom.loadingClose();
                            }).fail(function(ex) {
                                Notification.exception(ex);
                                Formeo.dom.loadingClose();
                            });
                        }
                    }, {
                        title: M.util.get_string('cancel', 'local_edwiserform'),
                        type: 'success'
                    }]
                );
            });

            $('body').on('click', '.efb-actions a', function(event) {
                event.preventDefault();
            });
        }
    };
});
