(function (App) {
    App.Models.Site = Backbone.Model.extend({
        idAttribute: "SiteID",
        url: 'site',
        defaults: {
            'SiteName': '',
            'EquipmentLocation': '',
            'DebrisLocation': '',
            'Active': '1',
        },
        validate: function (attributes) {
            if (attributes.SiteName.length === 0) {
                return 'Site Name is required.';
            }
        },

    });

    /**
     * This is the site years drop down
     */
    App.Models.SiteYear = Backbone.Model.extend({
        defaults: {
            'SiteID': '',
            'Year': new Date('Y')
        }
    });

})(window.App);
