
(function (App) {
    new App.Router;

    let rootUrl = $('.sia-main-app').data('rooturl');
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

