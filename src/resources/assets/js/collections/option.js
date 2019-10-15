(function (App) {
    App.Collections.Option = Backbone.Collection.extend({
        url: '/admin/option/list/all',
        model: App.Models.Option
    });
})(window.App);
