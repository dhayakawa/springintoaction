
(function (App) {
    /**
     * All the view logic is in the router
     */
    new App.BackboneRouter;

    let rootUrl = $('.sia-registration-app').length ? $('.sia-registration-app').data('rooturl') : window.location.origin + '/admin';
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

    if (rootUrl.match(/homestead/i)){
        App.Vars.devMode = true;
    }
    //console.log({index:index, rootUrl: rootUrl,rootPath:rootPath,relativeUrl:getRelativeUrl(window.location.href,rootUrl),ll: $('.sia-registration-app').data('rooturl')});
    Backbone.history.start({
        pushState: false,
        root: rootPath
    });

})(window.App);

