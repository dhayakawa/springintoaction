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
            //growl('SIA index route has been called');

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
                    return confirm('Are you sure you want to delete this THING ?');
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


(function (App) {
    new App.Router;

    let rootUrl = $('.sia-main-app').length ? $('.sia-main-app').data('rooturl') : 'http://homestead.test/admin';

    if (!rootUrl.endsWith('/')) {
        rootUrl += '/';
    }
    let rootPath = rootUrl.replace('://', '');
    let index = rootPath.indexOf('/');
    rootPath = (index !== -1 && index + 1 < rootPath.length) ? rootPath.substr(index) : rootPath = '/';

    let getRelativeUrl = function (url, rootUrl) {
        let index = url.indexOf(rootUrl);
        return (index > -1 ? url.substr(index + rootUrl.length) : url);
    };
    Backbone.history.firstLoad = true;
    Backbone.history.on('route', function () {
        Backbone.history.firstLoad = false;
    });

    Backbone.history.start({
        pushState: true,
        silent: false,
        root: rootPath
    });
    // Finally, we kick things off by creating the **App**.
    let mainApp = new App.Views.mainApp;
    mainApp.render();

    // 3. catch clicks on links and dispatch them to the router
    // $('.sia-main-app').on('click', 'a:not([data-bypass])', function (evt) {
    //     let href = $(this).attr('href');
    //
    //     if (href.length && href.substr(0, 1) !== '#') {
    //         evt.preventDefault();
    //         // 4. update the browser's url and call the routing function
    //         App.Router.navigate(getRelativeUrl(href, rootUrl), {trigger: true});
    //     }
    // });

    // 5. small hack to detect the correct URL, in case of a redirect
    //  http://stackoverflow.com/questions/9177252/detecting-a-redirect-in-jquery-ajax
    // let xhr;
    // let _orgAjax = jQuery.ajaxSettings.xhr;
    // jQuery.ajaxSettings.xhr = function () {
    //     xhr = _orgAjax();
    //     return xhr;
    // };
    // 6. catch form submissions
    // $('.sia-main-app').on('submit', 'form:not([data-bypass])', function (evt) {
    //     let $form = $(this);
    //     let href = $form.attr('action');
    //
    //     if (href.length && href.substr(0, 1) !== '#') {
    //         evt.preventDefault();
    //
    //         $.ajax({
    //             type: $form.attr('method'),
    //             url: Backbone.history.root + getRelativeUrl(href, rootUrl),
    //             data: $form.serialize(),
    //         })
    //             .error(function (jqXHR, textStatus, errorThrown) {
    //                 if (jqXHR.status === 422) { // Unprocessable Entity - Sent in case of validation error
    //                     // 7. add an error class to the problematic fields
    //                     // and display a notification toast with a description of the error(s)
    //                     $form.find('.has-error').removeClass('has-error');
    //                     let errors = jqXHR.responseJSON;
    //                     let errorsToDisplay = [];
    //                     $.each(errors, function (key, value) {
    //                         $form.find('label[for=' + key + ']').parents('.form-group').addClass('has-error');
    //                         errorsToDisplay.push(value[0] || value);
    //                     });
    //                     toastr.error(errorsToDisplay.join('<br />'), 'Validation errors', {timeOut: 4000});
    //                 }
    //                 else {
    //                     toastr.error('Code: ' + jqXHR.status, 'Error', {timeOut: 4000});
    //                 }
    //             })
    //             .done(function (data) {
    //                 // 8. set the page content and update the browser's url
    //                 //$('#page-content').innerHTML = data;
    //                 console.log(data)
    //                 App.Router.navigate(getRelativeUrl(xhr.responseURL, rootUrl));
    //             });
    //     }
    //
    //     return false;
    // });
})(window.App);

