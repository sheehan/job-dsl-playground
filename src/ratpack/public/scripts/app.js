(function(window, $, _,CodeMirror){

    var App = {

        localStorageKey: 'dsl.lastScript',

        start: function() {
            var that = this;
            this.initLayout();
            this.initEditors();
            this.layout.resizeAll();

            var script = localStorage.getItem(this.localStorageKey) || 'job {\n}';
            this.inputEditor.setValue(script);

            $('.input .title .controls .execute').on('click', function(event) {
                event.preventDefault();
                that.execute();
            });

            $('.output .title a.close-it').click(function(event) {
                event.preventDefault();
                that.showAbout();
            });

            this.showAbout();

            $('body').css('visibility', 'visible');
        },

        showAbout: function() {
            $('.output .title span').html('');
            $('.output .title a.close-it').hide();
            $('.about-wrapper').show();
            $('.code-wrapper').hide();
        },

        showXmlEditor: function(title, output) {
            $('.output .title span').html(title);
            $('.output .title a.close-it').show();
            $('.about-wrapper').hide();
            $('.code-wrapper').show();
            this.outputEditor.setValue(output);
            this.layout.resizeAll();
            this.outputEditor.refresh();
        },

        initLayout: function() {
            var that = this;
            this.layout = $('body').layout({
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
                theme: 'pastel-on-dark'
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
                url: 'execute',
                type: 'POST',
                dataType: 'json',
                data: {
                    script: script
                }
            }).done(_.bind(this.handleExecuteResponse, this));
            $('.input .loading').fadeIn(100)
        },

        handleExecuteResponse: function(resp) {
            $('.input .loading').fadeOut(100)
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