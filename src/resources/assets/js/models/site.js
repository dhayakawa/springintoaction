(function (App) {
    App.Models.Site = Backbone.Model.extend({
        url: 'site',
        defaults: {
            'SiteID': '',
            'SiteName': '',
            'EquipmentLocation': '',
            'DebrisLocation': '',
            'Active': '1',
            'created_at ': '',
            'updated_at': ''
        },
        validate: function (attributes) {
            if (attributes.SiteName.length === 0) {
                return 'Site Name is required.';
            }
        }
    });

    /**
     * This is the site years drop down
     */
    App.Models.SiteYear = Backbone.Model.extend({
        defaults: {
            'SiteID': '',
            'SiteStatusID': '',
            'Year': new Date('Y')
        }
    });

    /*
        var addPersonView = new App.Views.AddPerson({ collection: peopleCollection });
        peopleView = new App.Views.People({ collection: peopleCollection });
        $(document.body).append(peopleView.render().el);
     */
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
            'EstimationComments': ''
        },
        validate: function (attributes) {
            if (attributes.SiteName.length === 0) {
                return 'Site Name is required.';
            }
        }
    });

})(window.App);
