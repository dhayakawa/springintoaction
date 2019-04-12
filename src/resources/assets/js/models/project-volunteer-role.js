(function (App) {
    App.Models.ProjectVolunteerRole = Backbone.Model.extend({
        url: '/admin/project_lead',
        idAttribute: "ProjectVolunteerRoleID",
        defaults: {
            'ProjectID': '',
            'ProjectVolunteerID': '',
            'VolunteerID': '',
            'ProjectRoleID': '',
            'Comments': '',
            'Status': '',
            'ProjectVolunteerRoleStatus':''
        }
    });
})(window.App);
