(function (App) {
    App.Models.ProjectVolunteerRole = Backbone.Model.extend({
        url: 'project_lead',
        idAttribute: "ProjectVolunteerRoleID",
        defaults: {
            'ProjectVolunteerRoleID': '',
            'ProjectID': '',
            'VolunteerID': '',
            'ProjectRoleID': '',
            'Comments': '',
            'Status': '',
            'created_at': '',
            'updated_at': ''
        }
    });
})(window.App);
