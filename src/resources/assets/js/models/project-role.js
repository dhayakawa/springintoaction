(function (App) {
    App.Models.ProjectRole = Backbone.Model.extend({
        url: '/admin/project_role',
        idAttribute: "ProjectRoleID",
        defaults: {
            'Role': '',
            'DisplaySequence': ''
        }
    });
})(window.App);
