(function (App) {
    App.Collections.Project = Backbone.Collection.extend({
        model: App.Models.Project
    });
    App.Collections.ProjectFilters = Backbone.Collection.extend({
        model: App.Models.ProjectFilter
    });

})(window.App);
