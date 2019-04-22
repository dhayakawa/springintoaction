(function (App) {
    App.Models.ProjectVolunteer = Backbone.Model.extend({
        url: '/admin/project_volunteer',
        idAttribute: "ProjectVolunteerRoleID",
        defaults: {
            'ProjectID': '',
            'ProjectVolunteerID': '',
            'VolunteerID': '',
            'ProjectRoleID': '',
            'Comments': '',
            'Status': '',
            'ProjectVolunteerRoleStatus': ''
        }
    });
})(window.App);
