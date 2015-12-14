(function($, window, document, undefined) {

    // Plugin definition.
    $.fn.tagit = function(options) {

        // Custom error code for reference
        var error_codes = {
                'duplicate': 1,
                'regex_failiure': 2
            }
            // default settings
        var settings = $.extend($.fn.tagit.defaults, options);

        return this.each(function() {
            var $elm = $(this);

            $elm.keydown(function(e) {

                e = e || window.event;

                var keyCode = e.keyCode,
                    ctrlDown = e.ctrlKey || e.metaKey, // mac support
                    inputText = $elm.val(),
                    pressed_key = e.which;

                // if text pasted                
                if (ctrlDown && (keyCode == 86)) { // 86 => 'v'
                    setTimeout(function() {
                        console.log('text pasted');
                        inputText = $elm.val();
                        if (inputText.indexOf(settings.bulk_paste_separator) > -1) {

                            e.preventDefault();
                            e.stopPropagation();
                            var tagList = inputText.split(settings.bulk_paste_separator);

                            $.each(tagList, function(index, text) {
                                var errorCode = 0,
                                    dataTag = $elm.data('tags'),
                                    _tagList = ($.isArray(dataTag)) ? dataTag : [];

                                if (!settings.allow_duplicate) {
                                    if ($.inArray(text, _tagList) > -1) {
                                        errorCode = error_codes.duplicate;
                                    }
                                }

                                if (errorCode === 0 && !!settings.validation_regex) {
                                    errorCode = (_validateRegex(settings.validation_regex, text)) ? 0 : error_codes.regex_failiure;
                                }

                                if (errorCode === 0) {
                                    _createTag(text).insertBefore($elm);
                                    _tagList.push(text);
                                    $elm.data('tags', _tagList);
                                    $elm.parent().find('.tag i').last().click(function() {
                                        var text = $(this).parent().text(),
                                            dataTag = $elm.data('tags'),
                                            taglist = ($.isArray(dataTag)) ? dataTag : [];
                                        taglist.splice($.inArray(text, taglist), 1);
                                        $elm.data('tags', taglist);
                                        $(this).parent().remove();
                                        return true;
                                    });
                                    settings.success_callback.call(settings, text);
                                }
                            });
                            $elm.val('').focus();
                            return true;
                        }
                    }, 0);
                }

                if (inputText !== "" && inputText !== 'undefined') { // not empty or undefined

                    // detect tag creation keys
                    if (keyCode == 188 || keyCode == 13 || keyCode == 32) { // comma-188, enter-13,spacebar-32,

                        var errorCode = 0,
                            dataTag = $elm.data('tags'),
                            taglist = ($.isArray(dataTag)) ? dataTag : [];

                        e.preventDefault();
                        e.stopPropagation();

                        if (!settings.allow_duplicate) {
                            if ($.inArray(inputText, taglist) > -1) {
                                errorCode = error_codes.duplicate;
                            }
                        }
                        if (errorCode === 0 && !!settings.validation_regex) {
                            errorCode = (_validateRegex(settings.validation_regex, inputText)) ? 0 : error_codes.regex_failiure;
                        }

                        if (errorCode === 0) {
                            _createTag(inputText).insertBefore($elm);
                            taglist.push(inputText);
                            $elm.data('tags', taglist);
                            $elm.val('').focus();
                            $elm.parent().find('.tag i').last().click(function() {
                                var text = $(this).parent().text(),
                                    dataTag = $elm.data('tags'),
                                    taglist = ($.isArray(dataTag)) ? dataTag : [];
                                taglist.splice($.inArray(text, taglist), 1);
                                $elm.data('tags', taglist);
                                $(this).parent().remove();
                                return true;
                            });
                            settings.success_callback.call(settings, inputText);
                        } else if ($.isFunction(settings.error_callback)) {
                            settings.error_callback.call(settings, errorCode);
                        }

                        return true;
                    }
                } else {
                    // detect tag removal keys                    
                    if (keyCode == 8 || keyCode == 46) { //backspace-8, delete-46,
                        var text = $elm.parent().find('.tag').text(),
                            dataTag = $elm.data('tags'),
                            taglist = ($.isArray(dataTag)) ? dataTag : [];
                        taglist.splice($.inArray(text, taglist), 1);
                        $elm.data('tags', taglist);
                        $elm.parent().find('.tag').last().remove();
                        return true;
                    }
                }

            });
        });
    };

    // Private functions
    function _createTag(str) {
        var tag = $('<div/>').addClass('tag').append($('<label/>').addClass('tagText').text(str))
            .append($('<i/>').addClass('fa fa-close'));
        return tag;
    }

    function _validateRegex(regex, str) {
        return regex.test(str);
    }

    // getter functions
    $.fn.tagit.getAllTags = function() {

    }

    // Plugin default options – can be modified from anywhere
    $.fn.tagit.defaults = {
        allow_duplicate: false,
        bulk_paste_separator: ",",
        validation_regex: null,
        success_callback: null,
        error_callback: null
    };

})(jQuery, window, document);