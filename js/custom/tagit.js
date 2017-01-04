(function($, window, document, undefined) {

    $.fn.tagit = function(options) {

        // Custom error codes for reference
        var ERROR_CODE = {
            'duplicate': 1,
            'regex_failiure': 2
        };

        // Final settings 
        var settings = $.extend({
            // default options
            allow_duplicate: false,
            bulk_paste_separator: ",",
            validation_regex: null,
            success_callback: null,
            error_callback: null
        }, options);

        return this.each(function() {

            var $elm = $(this);

            $elm.keydown(function(evnt) {

                evnt = evnt || window.event;

                var keyCode = evnt.keyCode,
                    ctrlDown = evnt.ctrlKey || evnt.metaKey, // mac support
                    pressed_key = evnt.which,
                    inputText = $elm.val(),
                    dataTag = $elm.data('tags'),
                    taglist = ($.isArray(dataTag)) ? dataTag : [];

                function eatEvent() {
                    evnt.preventDefault();
                    evnt.stopPropagation();
                }

                function addTag(inputText) {

                    var errorCode = 0;

                    if (!settings.allow_duplicate) {
                        if ($.inArray(inputText, taglist) > -1) {
                            errorCode = ERROR_CODE.duplicate;
                        }
                    }

                    if (!errorCode && !!settings.validation_regex) {
                        errorCode = (_validateRegex(settings.validation_regex, inputText)) ? 0 : ERROR_CODE.regex_failiure;
                    }

                    if (!errorCode) {

                        _createTag(inputText).insertBefore($elm);

                        taglist.push(inputText);

                        $elm.data('tags', taglist);
                        $elm.val('');

                        $elm.parent().find('.tag i').last().click(function() {

                            var tag = $(this).parent(),
                                text = tag.text(),
                                dataTag = $elm.data('tags'),
                                taglist = ($.isArray(dataTag)) ? dataTag : [];

                            taglist.splice($.inArray(text, taglist), 1);

                            $elm.data('tags', taglist);
                            tag.remove();

                            return true;
                        });

                        if ($.isFunction(settings.success_callback)) {
                            settings.success_callback.call(settings, inputText);
                        }

                    } else if ($.isFunction(settings.error_callback)) {

                        settings.error_callback.call(settings, errorCode);

                    }

                    return !errorCode;
                }

                function onPaste() {

                    console.log('text pasted');
                    inputText = $elm.val(); // why

                    if (inputText.indexOf(settings.bulk_paste_separator) > -1) {

                        eatEvent();

                        var tagList = inputText.split(settings.bulk_paste_separator);

                        $.each(tagList, function(index, text) {
                            addTag(text);
                        });

                        $elm.val('').focus();;

                        return true;
                    }
                }

                // if text pasted                
                if (ctrlDown && (keyCode == 86)) { // 86 => 'v'

                    setTimeout(function() {
                        onPaste();
                    }, 0);
                }

                // inputText not empty or undefined
                if (inputText !== "" && inputText !== 'undefined') {

                    // detect tag creation keys - comma-188, enter-13, spacebar-32
                    if (keyCode == 188 || keyCode == 13 || keyCode == 32) {

                        eatEvent();

                        if (addTag(inputText)) {
                            $elm.val('');
                        }

                        $elm.focus();

                        return true;
                    }

                } else if (keyCode == 8 || keyCode == 46) { // detect tag removal keys - backspace-8, delete-46  

                    var text = $elm.parent().find('.tag').text();

                    taglist.splice($.inArray(text, taglist), 1);

                    $elm.data('tags', taglist);
                    $elm.parent().find('.tag').last().remove();

                    return true;
                }
            });
        });
    };

    // Private functions
    function _createTag(str) {

        var tag = $('<div/>').addClass('tag')
            .append($('<label/>').addClass('tagText')
                .text(str))
            .append($('<i/>').addClass('fa fa-close'));

        return tag;
    }

    function _validateRegex(regex, str) {
        return regex.test(str);
    }

    // getter functions
    $.fn.tagit.getAllTags = function($elm) {

        var tags = [];

        $('#tag_me').parent().find('.tag').each(function() {
            tags.push($(this).text());
        });

        return tags;

    }

    // getter functions
    $.fn.tagit.setTags = function(tagList) {

    }

})(jQuery, window, document);
