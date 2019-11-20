/*
 * Edwiser_Forms - https://edwiser.org/
 * Version: 1.1.0
 * Author: Yogesh Shirsath
 */
define(['jquery', 'core/ajax'], function ($, ajax) {

    $(document).click(function(event) {

        // Close select box if clicked out it
        // Preventing multiple select box from opening
        let select = $('.select-container.active');
        let clicked = $(event.target).parents('.select-container');
        if (!select.is(event.target) && select.has(event.target).length === 0) {
            $(select).removeClass('active');
        }
        if (select.length > 1) {
            $.each(select, function(index, element) {
                if ($(element).has(event.target).length === 0) {
                    $(element).removeClass('active');
                }
            });
        }
    }).keydown(function(e) {
        let select = $('.select-container.active');
        // Return if no select container is active
        if (select.length === 0) {
            return true;
        }

        // Handling only escape, enter key, up arrow and down arrow
        if([13, 27, 33, 34, 35, 36, 38, 40].indexOf(e.keyCode) == -1) {
            return true;
        }
        let list = $(select).find('.select-list');
        let items = $(list).find('.select-list-item:not(.d-none)');
        if (items.length == 0) {
            return false;
        }
        let selected = $(list).find('.select-list-item.active');
        let index = $(items).index(selected);
        let next = false;
        switch(e.keyCode) {
            case 13:// Enter keyCode
                $(selected).trigger('click');
                break;
            case 27:// Escape keyCode
                $(select).removeClass('active');
                break;
            case 33:// Page Up
                if (index > 0) {
                    next = index - 10;
                    next = next <= 0 ? 0 : next;
                }
                break;
            case 34:// Page Down
                if (index < items.length - 1) {
                    next = index + 10;
                    next = next > items.length - 1 ? items.length - 1 : next;
                }
                break;
            case 35:// End Key
                next = items.length - 1;
                break;
            case 36:// Home Key
                next = 0;
                break;
            case 38:// Up arrow
                if (index > 0) {
                    next = index - 1;
                }
                break;
            case 40:// Down arrow
                if (index < items.length - 1) {
                    next = index + 1;
                }
                break;
        }
        if (next !== false && [33, 34, 35, 36, 38, 40].indexOf(e.keyCode) != -1) {
            $(list).find('.select-list-item').removeClass('active');
            $(items[next]).addClass('active');
            $(list).scrollTop($(list).scrollTop() + $(items[next]).position().top - $(items[next]).height() - 14);
        }
        return false;
    });
    window.addEventListener("keydown", function(e) {
        if ($('.select-container.active').length === 0) {
            return true;
        }
        // Preventing body scorll on arrow keys
        switch(e.keyCode){
            case 37: case 39: case 38:  case 40: // Arrow keys
            case 32: e.preventDefault(); break; // Space
            default: break; // do not block other keys
        }
    }, false);
    $('body').on('focus', '.form-control', function() {
        // Adding active class to parent class of input element if element is in focus
        $(this).parent().addClass('active');
    }).on('change blur', '.form-control', function(event) {
        // Removing focus class of element if focus out and empty
        if ($(this).val() === '') {
            $(this).parent().removeClass('active');
        }
    }).on('click', '.selected-option', function() {
        let _this = this;
        // Show select box when dropdown is clicked
        $(this).parents('.select-container').toggleClass('active');
        if ($(this).parents('.select-container').is('.active')) {
            let active_item = function(customselect, option, multiple = false) {
                if (!multiple) {
                    $(customselect).find('.select-list-item').removeClass('active');
                }
                $(customselect).find('.select-list-item[data-value="' + option + '"]').addClass('active');
            };
            // Adding active class to selected option
            let options = $(this).parents('.select-container').siblings('select').val();
            let scrollto = null;
            if ($.isArray(options)) {
                $.each(options, function(index, option) {
                    active_item($(_this).next(), option, true);
                });
                scrollto = $($(this).next().find('.select-list-item.active')[0]).position().top;
            } else {
                active_item($(this).next(), options);
                scrollto = $(this).next().find('.select-list-item.active').position().top;
            }
            // Scrolling to select option if it goes beyond visible part of select box
            $(this).next().scrollTop($(this).next().scrollTop() + scrollto);
            $(this).next().find('.select-list-search').focus();
        }
    }).on('click', '.select-list-item', function() {

        let select = $(this).parents('.select-container').siblings('select');
        if (!$(select).is('[multiple="true"]')) {
            // Set selected option to select element on item selection in custom select box
            set_select_item($(select), $(this).data('value'));
            $(this).parents('.select-container').removeClass('active');
            return;
        }
        let options = $(select).val();

        if ($(this).is('.active')) {
            options.splice(options.indexOf($(this).data('value')), 1);
            $(this).removeClass('active');
        } else {
            options.push($(this).data('value'));
            $(this).addClass('active');
        }
        $(select).val(options);
        set_multiple_selected_item(select);
    }).on('mouseover', '.select-list-item', function() {

        // // Changin active class of select list item on hover
        // $(this).siblings('.select-list-item').removeClass('active');
        // $(this).addClass('active');
    }).on('click', '.select-file-button', function() {

        // Trigger open file picker on custom file input button click event
        $(this).parents('.file-container').prev().click();
        return;
    }).on('change', '.input-file-wrapper input[type="file"]', function(event) {
        if ($(this)[0].files.length != 0) {
            // Show selected file name on selected-file input box
            $(this).next().find('.selected-file').val($(this)[0].files[0].name);
            $(this).parents('.input-file-wrapper').addClass('active');
        } else {
            // Emptying selected file input box if no file selected
            $(this).next().find('.selected-file').val('');
            $(this).parents('.input-file-wrapper').removeClass('active');
        }
    }).on('input', '.select-list-wrapper input[type="text"].select-list-search', function(event) {
        var val = $(this).val().trim().toLowerCase();
        var list = $(this).parents('.select-list-wrapper').find('ul.select-list');
        $(list).find('.select-list-item').each(function(index, el) {
            $(el).toggleClass('d-none', val != '' && $(el).text().toLowerCase().search(val) == -1);
        });
        $(list).find('.active').removeClass('active');
        $($(list).find('.select-list-item:not(.d-none)')[0]).addClass('active');
    });

    /**
     * Add select container in the place of select box for custom styling
     *
     * @param  DOM container where select boxes can be found
     * @return void
     */
    function addSelectContainer(container) {
        $(container).find('select').each(function(index, select) {
            $(select).hide();
            let id = $(select).attr('id');
            $(select).after(`<div class="select-container${$(select).is('[multiple="true"]') ? ' multiple' : ''}" id="select-${id}"></div>`);
            $('#select-' + id).append(`<div class="selected-option form-control f-addon"></div>`);
            if (!$(select).is('[multiple="true"]')) {
                let option = $(select).find('option[value="' + $(select).val() + '"]');
                $(`#select-${id} .selected-option`).text($(option).attr('label'));
            } else {
                set_multiple_selected_item(select);
            }
            $('#select-' + id).append(`
                <div class="select-list-wrapper">
                    <div class="select-list-search-wrapper">
                        <i class="fa fa-search" aria-hidden="true"></i>
                        <input type="text" class="select-list-search"/>
                    </div>
                    <ul class="select-list" id="select-list-${id}" for="${id}"></ul>
                </div>`);
            $(select).find('option').each(function(index, option) {
                let item = $("<li></li>");
                $(item).addClass('select-list-item');
                $(item).attr('data-value', $(option).attr('value'));
                $(item).text($(option).attr('label'));
                $('#select-list-' + id).append(item);
            });
        });
    }

    /**
     * Add file input container in the place of file input element for custom styling
     *
     * @param  DOM container where file elements can be found
     * @return void
     */
    function addFileContainer(container) {
        $(container).find('input[type="file"]').each(function(index, file) {
            $(file).hide();
            let id = $(file).attr('id');
            let filename = '';
            if ($(this)[0].files.length != 0) {
                filename = $(this)[0].files[0].name;
            }
            $(file).after(`<div class="file-container f-addon" id="file-${id}"></div>`);
            $('#file-' + id).append('<div class="file-input-selected-wrapper"><input type="text" disabled class="selected-file" value="' + filename + '"/></div>');
            $('#file-' + id).append('<div class="file-input-button-wrapper"><button class="btn btn-primary select-file-button" type="button"><i class="fa fa-upload" aria-hidden="true"></i></button></div>');
            if ($(this)[0].files.length != 0) {
                $(file).parents('.input-file-wrapper').addClass('active');
            }
        });
    }

    /**
     * Get selected dom option of select box
     *
     * @param  DOM element select element
     * @param  string option value of option
     * @return DOM option
     */
    var get_select_item = function(element, option = '') {
        if (option !== '') {
            return $(element).find('option[value="' + option + '"]');
        }
        return $(element).find('option[value="' + $(element).val() + '"]');
    };

    /**
     * Set select option of select box and select container
     *
     * @param  DOM select element
     * @param  string option value of option
     */
    var set_select_item = function(select, option) {
        $(select).val(option)[0].dispatchEvent(new CustomEvent("change", {target: $(select)[0]}));
        option = get_select_item($(select));
        $('#select-' + $(select).attr('id') + ' .selected-option').attr('selected', option.attr('value'));
        $('#select-' + $(select).attr('id') + ' .selected-option').text(option.attr('label'));
    };

    /**
     * Set multiple select option
     *
     * @param  DOM select
     */
    let set_multiple_selected_item = function(select) {
        let options = $(select).val();
        $.each(options, function(index, option) {
            option = $(select).find('option[value="' + option + '"]');
            options[index] = $(option).attr('label');
        });
        if (options.length < 4) {
            $(select).next().find('.selected-option').text(options.join(', '));
        } else {
            $(select).next().find('.selected-option').text(M.util.get_string('options-selected-count', 'local_edwiserform', {
                count: options.length,
                max: $(select).find('option').length
            }));
        }
    }

    let actions = {
        'style-2': {
            add: function(rootContainer) {
                addSelectContainer(rootContainer);
                addFileContainer(rootContainer);
            },
            remove: function(rootContainer) {
                $(rootContainer).find('select').each(function(index, select) {
                    $(select).show().next('.select-container').remove();
                });
                $(rootContainer).find('input[type="file"]').each(function(index, file) {
                    $(file).show().next('.file-container').remove();
                });
            }
        }
    };
    actions['style-3'] = actions['style-2'];
    actions['style-4'] = actions['style-2'];

    return {
        apply: function(rootContainer, action, id) {
            $(rootContainer)[action+'Class']('form-style-'+id);
            if (actions['style-' + id] != undefined) {
                return actions['style-' + id][action](rootContainer);
            }
            return true;
        }
    };
});
