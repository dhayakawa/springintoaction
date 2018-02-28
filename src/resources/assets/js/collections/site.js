(function (App) {
    App.Collections.Site = Backbone.Collection.extend({
        model: App.Models.Site
    });
    App.Collections.SiteYear = Backbone.Collection.extend({
        url: 'site/years',
        model: App.Models.SiteYear
    });
})(window.App);

