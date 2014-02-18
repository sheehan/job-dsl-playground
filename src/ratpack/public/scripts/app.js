(function($, _,CodeMirror){

    var App = {

        localStorageKey: 'dsl.lastScript',

        start: function() {
            this.initLayout();
            this.initEditors();
            this.layout.resizeAll();

            var script = localStorage.getItem(this.localStorageKey) || 'job {\n}';
            this.inputEditor.setValue(script);

            $('.input .title .controls .execute').on('click', _.bind(function(event) {
                event.preventDefault();
                this.execute();
            }, this));
        },

        initLayout: function() {
            this.layout = $('body').layout({
                north__paneSelector: 'header',
                north__size: 51,
                north__spacing_open: 0,
                center__paneSelector: '.output',
                center__contentSelector: '.xml',
                west__paneSelector: '.input',
                west__contentSelector: '.content',
                west__size: '40%',
//        west__onresize_end: (name, $el, state, opts) ->
                west__resizerCursor: 'ew-resize',
                south__paneSelector: 'footer',
                south__spacing_open: 0,
                resizable: true,
                findNestedContent: true,
                fxName: '',
                spacing_open: 3,
                spacing_closed: 3,
                slidable: false,
                closable: false
            });
        },

        initEditors: function() {
            this.inputEditor = CodeMirror.fromTextArea($('.input textarea')[0], {
                matchBrackets: true,
                mode: 'groovy',
                lineNumbers: true
            });
            this.outputEditor = CodeMirror.fromTextArea($('.output textarea')[0], {
                matchBrackets: true,
                mode: 'xml',
                lineNumbers: true
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
        },

        handleExecuteResponse: function(resp) {
            if (resp.stacktrace) {
                this.outputEditor.setValue(resp.stacktrace);
            } else {
                var xml = _.map(resp.results, function(it, idx) {
                    var name = it.name || '[no name]';
                    return '<!-- ' + (idx + 1) + '. ' + name + ' -->\n' + it.xml;
                }).join('\n');

                this.outputEditor.setValue(xml);
            }
        }
    };

    window.App = App;

})(jQuery, _, CodeMirror);