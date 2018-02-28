(function (App) {
    App.Router = Backbone.Router.extend({
        routes: {
            '': 'index',
            'show/:id': 'show', // passing param in hash tag route
            'download/*random': 'download',//hash tag route
            'search/:query': 'search',
            '*default': '_default'
        },
        index: function () {
            //$(document.body).append("SIA index route has been called..");
            growl('SIA index route has been called');

        },

        show: function (id) {
            growl("Show route has been called.. with id equals : " + id);
        },

        download: function (random) {
            growl("download route has been called.. with random equals : " + random);
        },

        search: function (query) {
            growl("Search route has been called.. with query equals : " + query);
        },
        showContent: function () {
            this._loadAjaxContent(function () {
                $('#page-content .action-delete').submit(function () {
                    return confirm('Are you sure you want to delete this project ?');
                });
            });
        },
        _loadAjaxContent: function (callback) {
            $.ajax({
                method: "GET",
                url: Backbone.history.root + Backbone.history.fragment
            })
                .done(function (msg) {
                    document.querySelector('#page-content').innerHTML = msg;
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
        },
        _default: function (_default) {
            growl("Default route has been called.. with query equals : " + _default);
        }

    });

})(window.App);
