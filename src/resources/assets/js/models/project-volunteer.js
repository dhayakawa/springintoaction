(function (App) {
    App.Models.ProjectVolunteer = Backbone.Model.extend({
        url: 'project_volunteer',
        idAttribute: "ProjectVolunteerID",
        defaults: {
            'ProjectVolunteerID': '',
            'VolunteerID': '',
            'ProjectID': ''
        }
    });
})(window.App);
