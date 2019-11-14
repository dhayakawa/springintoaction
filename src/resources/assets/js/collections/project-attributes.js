(function (App) {
    App.Collections.ProjectAttributes = Backbone.Collection.extend({
        url: '/admin/project_attributes/list/all',
        model: App.Models.ProjectAttributes
    });
})(window.App);
