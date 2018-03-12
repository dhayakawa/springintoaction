(function (App) {
    App.Models.ProjectContact = Backbone.Model.extend({
        idAttribute: "ProjectContactID",
        url: '/admin/project_contact',
        defaults: {
            'ProjectID': '',
            'ContactID': ''
        }
    });
})(window.App);
