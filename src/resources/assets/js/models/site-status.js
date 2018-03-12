(function (App) {

    App.Models.SiteStatus = Backbone.Model.extend({
        idAttribute: "SiteStatusID",
        url: '/admin/sitestatus',
        defaults: {
            'SiteID': '',
            'Year': '',
            'ProjectDescriptionComplete': '',
            'BudgetEstimationComplete': '',
            'VolunteerEstimationComplete': '',
            'VolunteerAssignmentComplete': '',
            'BudgetActualComplete': '',
            'EstimationComments': ''
        },
        getData: function () {
            return this.get('SiteID') + 'is TBD.';
        }
    });

})(window.App);


