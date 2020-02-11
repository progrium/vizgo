requirejs.config({
    paths: {
        "jquery": 'vnd/jquery-3.4.1.min',
        "jquery-contextmenu": 'vnd/jquery.contextMenu-2.9.0.min',
        "jquery-ui-position": 'vnd/jquery.ui.position.min',
        "jquery-ui": 'vnd/jquery-ui-1.12.1.min',
        "jsPlumb": "vnd/jsPlumb-2.11.2.min"
    },
    shim: {
        "jsPlumb": {
            deps: ['jquery','jquery-ui'],
            exports: 'jsPlumb'
        }
    }
});

requirejs(['lib/app'], function(app) {
    jsPlumb.ready(function() {
        m.mount(document.body, app.App);
    });
});
