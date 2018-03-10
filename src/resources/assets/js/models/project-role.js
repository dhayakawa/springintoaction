(function (App) {
    App.Models.ProjectRole = Backbone.Model.extend({
        url: 'project_role',
        idAttribute: "ProjectRoleID",
        defaults: {
            'ProjectRoleID': '',
            'Role': '',
            'DisplaySequence': ''
        }
    });
})(window.App);
