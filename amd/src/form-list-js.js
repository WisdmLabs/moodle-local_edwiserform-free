/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


require(['jquery', 'core/ajax'], function ($, ajax) {
    $(document).ready(function (e) {
        $('.efb-form-delete').click(function(event) {
            var formid = $(this).parent().attr('data-formid');
            var row = $(this).closest(`#efb-form-id-${formid}`);
            var table = $(row).parent();
            var rows;
            var reqDeleteForm = ajax.call([{
                methodname: 'edwiserform_delete_form',
                args: {
                    id: formid
                }
            }
            ]);
            reqDeleteForm[0].done(function(response) {
                if (response.status == true) {
                    row.remove();
                    rows = $(table).children();
                }
            }).fail(function(ex) {

            });
            event.preventDefault();
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
});
