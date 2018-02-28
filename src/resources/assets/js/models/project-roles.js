(function (App) {
    App.Models.ProjectRole = Backbone.Model.extend({
        defaults: {
            'ProjectRoleID': '',
            'Role': '',
            'DisplaySequence': ''
        }
    });
})(window.App);
