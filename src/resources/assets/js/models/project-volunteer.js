(function (App) {
    App.Models.ProjectVolunteer = Backbone.Model.extend({
        url: '/admin/project_volunteer',
        idAttribute: "ProjectVolunteerID",
        defaults: {
            'VolunteerID': '',
            'ProjectID': ''
        }
    });
})(window.App);
