(function (App) {

    App.Models.SiteStatus = Backbone.Model.extend({
        url: 'sitestatus',
        defaults: {
            'SiteStatusID': '',
            'SiteID': '',
            'Year': '',
            'ProjectDescriptionComplete': '',
            'BudgetEstimationComplete': '',
            'VolunteerEstimationComplete': '',
            'VolunteerAssignmentComplete': '',
            'BudgetActualComplete': '',
            'EstimationComments': '',
            'created_at': '',
            'updated_at': ''
        },
        getData: function () {
            return this.get('SiteID') + 'is TBD.';
        }
    });

})(window.App);


