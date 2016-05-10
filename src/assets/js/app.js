(function(window, $, _,CodeMirror){

    var App = {

        localStorageKey: 'dsl.lastScript',

        start: function(data) {
            this.data = data || {};
            this.initLayout();
            this.initEditors();
            this.layout.resizeAll();

            window.addEventListener('hashchange', this.onHashChange.bind(this), false);

            $('.input .title .controls .execute').click(function(event) {
                event.preventDefault();
                this.execute();
            }.bind(this));

            $('.input .title .controls .save').click(function(event) {
                event.preventDefault();
                this.showSaveModal();
            }.bind(this));

            $('.modal.save-gist .save').click(function(event) {
                event.preventDefault();
                this.save();
            }.bind(this));

            this.route();
            $('body').css('visibility', 'visible');
        },

        onHashChange: function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (this._ignoreHashChangeOnce) {
                this._ignoreHashChangeOnce = false;
            } else {
                this.route();
            }
        },

        route: function() {
            var hashId = window.location.hash;

            if (hashId && hashId.indexOf('#gist/') === 0) {
                this.showGist(hashId.substring('#gist/'.length));
            } else {
                var script = localStorage.getItem(this.localStorageKey);
                if (this.data.input !== undefined) {
                    this.inputEditor.setValue(this.data.input || '');
                    this.execute();
                } else if (script) {
                    this.inputEditor.setValue(script);
                }
                this.showXmlEditor('XML', '');
            }
        },

        showGist: function(gistId) {
            this.inputEditor.setValue('// Loading...');
            this.outputEditor.setValue('');
            $('.gist').removeClass('hide').html('<a href="https://gist.github.com/' + gistId + '"><i class="fa fa-github"></i> ' + gistId + '</a>');
            $.getJSON('https://api.github.com/gists/' + gistId).done(function(data) {
                if (data.files['dsl.groovy']) {
                    this.inputEditor.setValue(data.files['dsl.groovy'].content);
                } else {
                    this.inputEditor.setValue('');
                }
                if (data.files['output.xml']) {
                    output = data.files['output.xml'].content;
                    this.outputEditor.setValue(data.files['output.xml'].content);
                } else {
                    this.outputEditor.setValue('');
                }
            }.bind(this));

            // TODO error handle
        },

        showXmlEditor: function(title, output) {
            $('.output .title span').html(title);
            $('.output .title a.close-it').show();
            $('.code-wrapper').show();
            this.outputEditor.setValue(output);
            this.layout.resizeAll();
            this.outputEditor.refresh();
        },

        initLayout: function() {
            var that = this;
            this.layout = $('body').layout({
                north__paneSelector: '.header',
                north__resizable: false,
                north__spacing_open: 0,
                south__paneSelector: '.footer',
                south__resizable: false,
                south__spacing_open: 0,
                center__paneSelector: '.main'
            });
            $('body .main').layout({
                center__paneSelector: '.output',
                center__contentSelector: '.content',
                west__paneSelector: '.input',
                west__contentSelector: '.content',
                west__size: '40%',
                west__resizerCursor: 'ew-resize',
                resizable: true,
                findNestedContent: true,
                fxName: '',
                spacing_open: 3,
                spacing_closed: 3,
                slidable: false,
                closable: false,
                onresize_end: function (name, $el, state, opts) {
                    that.inputEditor.refresh();
                    that.outputEditor.refresh();
                }
            });
        },

        initEditors: function() {
            this.inputEditor = CodeMirror.fromTextArea($('.input textarea')[0], {
                matchBrackets: true,
                mode: 'groovy',
                lineNumbers: true,
                tabSize: 4,
                indentUnit: 4,
                indentWithTabs: false,
                theme: 'pastel-on-dark',
                extraKeys: {
                    'Ctrl-Enter': this.execute.bind(this),
                    'Cmd-Enter': this.execute.bind(this)
                }
            });
            this.outputEditor = CodeMirror.fromTextArea($('.output textarea')[0], {
                matchBrackets: true,
                mode: 'xml',
                lineNumbers: true,
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                theme: 'pastel-on-dark'
            });
        },

        execute: function() {
            var script = this.inputEditor.getValue();
            localStorage.setItem(this.localStorageKey, script);
            $.ajax({
                url: '/execute',
                type: 'POST',
                dataType: 'json',
                data: {
                    script: script
                }
            }).done(this.handleExecuteResponse.bind(this));
            $('.input .loading').fadeIn(100)
        },

        showSaveModal: function() {
            $('.modal').removeClass('hide').modal({keyboard: true});
        },

        save: function() {
            var files = {};
            var input = this.inputEditor.getValue();
            var output = this.outputEditor.getValue();
            if (input) {
                files['dsl.groovy'] = {content: input};
            }
            if (output) {
                files['output.xml'] = {content: output};
            }

            $.ajax({
                type: 'POST',
                url: 'https://api.github.com/gists',
                data: JSON.stringify({
                    'description': 'Generated via http://job-dsl.herokuapp.com/',
                    'public': true,
                    'files': files
                }),
                dataType: 'json',
                contentType: 'application/json',
                processData: false
            }).done(function(data) {
                var gistId = data.id;
                $('.gist').removeClass('hide').html('<i class="fa fa-refresh fa-spin"></i> Saving...');
                this._ignoreHashChangeOnce = true;
                window.location.hash = 'gist/' + gistId;

                $('.modal').modal('hide');
            }.bind(this));
        },

        handleExecuteResponse: function(resp) {
            $('.input .loading').fadeOut(100);
            var title, output;
            if (resp.stacktrace) {
                title = 'Error';
                output = resp.stacktrace;
            } else {
                title = 'XML';
                output = _.map(resp.results, function(it, idx) {
                    var name = it.name || '[no name]';
                    return '<!-- ' + (idx + 1) + '. ' + name + ' -->\n' + it.xml;
                }).join('\n');
            }

            this.showXmlEditor(title, output);
        }
    };

    window.App = App;

})(window, jQuery, _, CodeMirror);