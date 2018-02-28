(function ($, Backbone, toastr, ProjectsRouter) {
        // 1. determine the relative path
        var rootUrl = document.querySelector('body').dataset.rooturl;
        if (!rootUrl.endsWith('/')) {
            rootUrl += '/';
        }
        var rootPath = rootUrl.replace('://', '');
        var index = rootPath.indexOf('/');
        rootPath = (index !== -1 && index + 1 < rootPath.length) ? rootPath.substr(index) : rootPath = '/';

        var getRelativeUrl = function (url, rootUrl) {
            var index = url.indexOf(rootUrl);
            return (index > -1 ? url.substr(index + rootUrl.length) : url);
        };

        // 2. start listening to url changes and manage history
        Backbone.history.start({
            pushState: true,
            silent: false,
            root: rootPath
        });
        // 3. catch clicks on links and dispatch them to the router
        $(document).on('click', 'a:not([data-bypass])', function (evt) {
            var href = $(this).attr('href');

            if (href.length && href.substr(0, 1) != '#') {
                evt.preventDefault();
                // 4. update the browser's url and call the routing function
                ProjectsRouter.navigate(getRelativeUrl(href, rootUrl), {trigger: true});
            }
        });

        // 5. small hack to detect the correct URL, in case of a redirect
        //  http://stackoverflow.com/questions/9177252/detecting-a-redirect-in-jquery-ajax
        var xhr;
        var _orgAjax = jQuery.ajaxSettings.xhr;
        jQuery.ajaxSettings.xhr = function () {
            xhr = _orgAjax();
            return xhr;
        };
        // 6. catch form submissions
        $(document).on('submit', 'form:not([data-bypass])', function (evt) {
            var $form = $(this);
            var href = $form.attr('action');

            if (href.length && href.substr(0, 1) != '#') {
                evt.preventDefault();

                $.ajax({
                    type: $form.attr('method'),
                    url: Backbone.history.root + getRelativeUrl(href, rootUrl),
                    data: $form.serialize(),
                })
                    .error(function (jqXHR, textStatus, errorThrown) {
                        if (jqXHR.status == 422) { // Unprocessable Entity - Sent in case of validation error
                            // 7. add an error class to the problematic fields
                            // and display a notification toast with a description of the error(s)
                            $form.find('.has-error').removeClass('has-error');
                            var errors = jqXHR.responseJSON;
                            var errorsToDisplay = [];
                            $.each(errors, function (key, value) {
                                $form.find('label[for=' + key + ']').parents('.form-group').addClass('has-error');
                                errorsToDisplay.push(value[0] || value);
                            });
                            toastr.error(errorsToDisplay.join('<br />'), 'Validation errors', {timeOut: 4000});
                        }
                        else {
                            toastr.error('Code: ' + jqXHR.status, 'Error', {timeOut: 4000});
                        }
                    })
                    .done(function (data) {
                        // 8. set the page content and update the browser's url
                        document.querySelector('#page-content').innerHTML = data;
                        ProjectsRouter.navigate(getRelativeUrl(xhr.responseURL, rootUrl));
                    });
            }

            return false;
        });
    })(jQuery, Backbone, toastr, ProjectsRouter);
