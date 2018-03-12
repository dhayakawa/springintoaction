(function (App) {
    App.Models.ProjectVolunteerRole = Backbone.Model.extend({
        url: '/admin/project_lead',
        idAttribute: "ProjectVolunteerRoleID",
        defaults: {
            'ProjectID': '',
            'VolunteerID': '',
            'ProjectRoleID': '',
            'Comments': '',
            'Status': ''
        }
    });
})(window.App);
