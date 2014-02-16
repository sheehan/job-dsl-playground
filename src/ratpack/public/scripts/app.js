(function($, _,CodeMirror){

    var App = {

        localStorageKey: 'dsl.lastScript',

        start: function() {
            this.initLayout();
            this.initEditors();

            var script = localStorage.getItem(this.localStorageKey) || 'job {\n}';
            this.inputEditor.setValue(script);

            $('.output .content .names select').on('change', _.bind(function(event) {
                var index = $(event.currentTarget).prop('selectedIndex');
                this.outputEditor.setValue(this.results[index].xml);
            }, this));
        },

        initLayout: function() {
            $('body').layout({
                north__paneSelector: 'header',
                north__spacing_open: 0,
                center__paneSelector: '.output',
                center__contentSelector: '.xml',
                west__paneSelector: '.input',
                south__paneSelector: 'footer',
                south__spacing_open: 0,
                west__contentSelector: '.content',
                west__size: '40%',
//        west__onresize_end: (name, $el, state, opts) ->
                west__resizerCursor: 'ew-resize',
                resizable: true,
                findNestedContent: true,
                fxName: '',
                spacing_open: 3,
                spacing_closed: 3,
                slidable: false
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

            this.inputEditor.on('change', _.debounce(_.bind(this.execute, this), 1000));
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
                this.results = resp.results;
                var html = _.map(resp.results, function(it, idx) {
                    return '<option>' + it.name + '</option>'
                }).join('');

                $('.output .job-count').html(resp.results.length);
                $('.output .content .names select').html(html);
                this.outputEditor.setValue(resp.results[0].xml);
            }
        }
    };

    window.App = App;

})(jQuery, _, CodeMirror);