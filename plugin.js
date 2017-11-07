( function() {

    CKEDITOR.dtd.$editable['span'] = 1;

    /**
     * Given an input string return all valid tokens in tokenList
     *
     * @param {String} inputValue - what user is typing
     * @param {Object} tokenList - an object with available tokens as key
     * @return {Object} - the object representing the valid token list by key
     *
     */
    function getValidTokens(inputValue, tokenList) {

        // explode input value in different fragments by the dot separator
        inputSplitted = inputValue.split('.');

        // reduce all available tokens accumulating matching keys
        return _.reduce(tokenList, function(tokens, tokenValue, tokenKey) {

            var tokenSplitted = tokenKey.split('.');
            var valid = true;
            var lastTokenFragment = '';
            var composedToken = [];

            // for each input fragment check last fragment compatibility
            // if is valid quit the function
            _.each(inputSplitted, function(value, i) {
                lastTokenFragment = tokenSplitted[i];
                composedToken.push(lastTokenFragment);

                // input is an empty string and the loop is at the first index
                if(inputValue === '' && i === 0) return;

                // token fragment doesn't exist return: token is not valid
                if(!tokenSplitted[i]) {
                    valid = false;
                    return;
                }

                // reduce token fragment to input fragment length
                comparableValue = tokenSplitted[i].substr(0, inputSplitted[i].length);
                if(comparableValue.toLowerCase() === inputSplitted[i].toLowerCase()) {
                    return;
                }

                // if precedent checks have not break the function set valid at false
                valid = false;

            });

            // if valid add to accumulator
            if(valid) {
                tokens[lastTokenFragment] = {
                    tokenKey: tokenKey,
                    composedToken: composedToken,
                    lastTokenFragment: lastTokenFragment,
                    source: tokenValue
                };
            }

            return tokens;

        }, {});

    }

    /**
     * Attach to an element a list of selectable suggestions
     *
     * @param {Object} $element - the element to attach the list
     * @param {Object} suggestions - an object containing all suggestions by key
     * @return {Void}
     */
    function showSuggestions($element, suggestions) {

        // retrieve all the suggestion keys
        var keys = _.keys(suggestions);

        // if there are no suggestion stop the function
        if(keys.length === 0)  return;

        // if there is only one suggestion
        if(keys.length === 1) {

            // check if suggestion final value is equal to the element text stop
            var matched;
             _.each(suggestions, function(suggestion) {
                if($element.text() === suggestion.tokenKey) {
                    matched = suggestion;
                }
            });

            // if there is one match end the process
            if(matched) {
                $element.addClass('completed');
                $element.data('source', matched.tokenKey);
                return;
            }
        }

        var tokenSuggestionClass = 'token-suggestions';
        var $suggestionBox = $element.find('.' + tokenSuggestionClass);

        // create box if doesn't exists
        if($suggestionBox.length === 0) {
            $suggestionBox = $('<ul />', {
               'class': tokenSuggestionClass,
               'css': {
                   'top': $element.outerHeight()
               },
               'contenteditable': false
           });
           $element.append($suggestionBox);
        }
        // else if it exists empty the box content
        else {
            $suggestionBox.html('');
        }

        // add suggestions to list
        _.each(suggestions, function(s) {
            var $suggestion = $('<li />', {
                'class': 'suggestion',
                'text': s.lastTokenFragment,
                click: function() {
                    var suggestedText = s.composedToken.join('.');
                    // if suggestion is not equal to the final token add a dot
                    if(suggestedText !== s.tokenKey) {
                        suggestedText += ".";
                        $element.removeClass('completed');
                        $element.removeData('source');
                    }
                    else {
                        $element.addClass('completed');
                        $element.data('source', s.tokenValue);
                    }

                    $suggestionBox.remove();

                    // set suggested text as element text a move cursor to the end of it
                    $element.text(suggestedText);
                    setCursorToEnd($element.get(0));

                    // if suggestion in not equal to final token trigger a key down to show next suggestions
                    if(suggestedText !== s.tokenKey) {
                        $element.trigger('keydown');
                    }
                }
            });

            $suggestionBox.append($suggestion);
        });

        // bind keydown event on element
        $element.on('keydown', function(e) {
            var code = e.keyCode || e.which;
            switch(code) {
                case 13: // enter key
                    selectActiveSuggestion();
                    break;
                case 38: // arrow up key
                    if(e.shiftKey) {
                        moveSuggestionForward();
                    }
                    else {
                        moveSuggestionBackward();
                    }
                    break;
                case 40: // arrow down key
                case 9: // tab key
                    if(e.shiftKey) {
                        moveSuggestionBackward();
                    }
                    else {
                        moveSuggestionForward();
                    }
                    break;
                default: return; // exit this handler for other keys
            }
            e.preventDefault();
            e.stopPropagation();
        });

        function moveSuggestionForward() {
            var $active = $suggestionBox.find('.active');
            // if there an active suggestion move to the next
            if($active.length) {
                $active.removeClass('active');
                $active.next().addClass('active');
                return;
            }
            $suggestionBox.children('.suggestion:first').addClass('active');
        }

        function moveSuggestionBackward() {
            var $active = $suggestionBox.find('.active');
            // if there an active suggestion move to the previous
            if($active.length) {
                $active.removeClass('active');
                $active.prev().addClass('active');
                return;
            }
            $suggestionBox.children('.suggestion:last').addClass('active');
        }

        function selectActiveSuggestion() {
            var $active = $suggestionBox.find('.active');
            // if there an active suggestion trigger the click event
            if($active.length) {
                $active.trigger('click');
            }
        }

    }

    /**
     * Check if the input (a contenteditable element) has valid suggested tokens
     *
     * @param
     */
    function checkForValidTokens($input, tokenList) {
        var inputValue = $input.text();
        var tokens = getValidTokens(inputValue, tokenList);
        if(inputValue === '') $input.html('&nbsp;');
        showSuggestions($input, tokens);
    }

    /**
     * Move the cursor to the end of an contenteditable element
     * see https://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity/3866442#3866442
     */
    function setCursorToEnd(contentEditableElement) {
        var range, selection;
        if(document.createRange) {
            // Create a range (a range is a like the selection but invisible)
            range = document.createRange();
            // Select the entire contents of the element with the range
            range.selectNodeContents(contentEditableElement);
            // collapse the range to the end point. false means collapse to end rather than the start
            range.collapse(false);
            // get the selection object (allows you to change selection)
            selection = window.getSelection();
            // remove any selections already made
            selection.removeAllRanges();
            // make the range you have just created the visible selection
            selection.addRange(range);
        }
    }

	function selectElementContents(el) {
	    var range = document.createRange();
	    range.selectNodeContents(el);
	    var selection = window.getSelection();
	    selection.removeAllRanges();
	    selection.addRange(range);
	}

    // register plugin
    CKEDITOR.plugins.add( 'autoplaceholder', {
        requires: 'widget',

        icons: 'autoplaceholder',

        init: function( editor ) {

            if(typeof editor.config.autoplaceholder === 'undefined') {
                throw new Error("Autoplaceholder plugin can't work without configurations: provide an object with tokenList property");
            }

            var tokenList = editor.config.autoplaceholder.tokenList;
            var defaultText = editor.config.autoplaceholder.defaultText || "Insert a value";

            // add widget
            editor.widgets.add( 'autoplaceholder', {
                button: 'Create a placeholder',
                template:
                    '<span class="autoplaceholder">' +
                        '<span class="autoplaceholder-token">' + defaultText + '</span>' +
                    '</span>',
                editables: {
                    content: {
                        selector: '.autoplaceholder-token',
                        allowedContent: 'span span'
                    }
                },
                inline: true,
                allowedContent: 'span(!autoplaceholder); span(!autoplaceholder-token)',
                requiredContent: 'span(autoplaceholder)',
                upcast: function( element ) {
                    // activate widget on existing placeholder
                    return element.name === 'span' && element.hasClass( 'autoplaceholder' );
                },
                init: function() {
                    this.on('ready', function(e) {

                        var $autoplaceholderToken = $('.autoplaceholder-token');

                        $autoplaceholderToken
                            .on('focus', function() {
                                var $this = $(this);
                                // select the widget text
                                selectElementContents(this);
                                // on focus save the current text in data
                                $this.data('before', $this.text());
                                return $this;
                            })
                            .on('blur', function() {
                                var $this = $(this);
                                $this.find('.token-suggestions').remove();
                                return $this;
                            })
                            .on('keydown paste', _.debounce(
                                function(e) {
                                    // ignore keypress used by suggestion list navigation
                                    var code = e.keyCode || e.which;
                                    switch(code) {
                                        case 13: // enter
                                        case 38: // arrow up
                                        case 40: // arrow down
                                        case 9: // tab
                                        return;
                                    }

                                    var $this = $(this);

                                    // remove old suggestion list
                                    // $this.find('.token-suggestions').remove();

                                    var inputValue = $this.text();
                                    // if content is changed
                                    if ($this.data('before') !== inputValue) {
                                        // save new value
                                        $this.data('before', inputValue);
                                        $this.removeClass('completed');
                                        // if user insert almost two chars or an empty string check for suggestion and show
                                        if(inputValue.length > 1 || inputValue === '') {
                                            checkForValidTokens($this, tokenList);
                                        }
                                    }

                                    return $this;

                                }, 800)
                            );

                    });
                }
            });
        }
    } );

} )();
