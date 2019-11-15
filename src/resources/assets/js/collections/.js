(function (App) {
    App.Collections.ProjectAttributes = Backbone.Collection.extend({
        url: '/admin/-=_/list/all',
        model: App.Models.ProjectAttributes
    });
})(window.App);
