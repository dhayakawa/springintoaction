(function (App) {
    App.Models.StatusManagement = Backbone.Model.extend({
        url: '/admin/status_management',
        idAttribute: "SiteID",
        defaults: {

        }
    });
})(window.App);
