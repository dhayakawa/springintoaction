(function (App) {
    App.Collections.Site = Backbone.Collection.extend({
        url: 'admin/site/all',
        model: App.Models.Site
    });
    App.Collections.SiteYear = Backbone.Collection.extend({
        url: 'admin/sitestatus/all/site/years',
        model: App.Models.SiteYear
    });
})(window.App);

