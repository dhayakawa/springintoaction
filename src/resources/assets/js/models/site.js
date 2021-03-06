(function (App) {
    App.Models.Site = Backbone.Model.extend({
        idAttribute: "SiteID",
        url: '/admin/site',
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
        idAttribute: "SiteStatusID",
        url: '/admin/sitestatus',
        defaults: {
            'SiteID': '',
            'Year': new Date('Y')
        }
    });

})(window.App);
