(function (App) {
    App.Models.ProjectScope = Backbone.Model.extend({
        url: '/admin/project_scope',
        idAttribute: "ProjectID",
        defaults: {

        }
    });
})(window.App);
