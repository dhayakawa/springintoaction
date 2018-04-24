(function (App) {
    App.Models.SiteRole = Backbone.Model.extend({
        url: '/admin/site_role',
        idAttribute: "SiteRoleID",
        defaults: {
            'Role': '',
            'DisplaySequence': ''
        }
    });
})(window.App);
