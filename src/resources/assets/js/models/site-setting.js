(function (App) {
    App.Models.SiteSetting = Backbone.Model.extend({
        url: '/admin/site_setting',
        idAttribute: "SiteSettingID",
        defaults: {
            'setting':'',
            'value':'',
            'description':'',
            'message':'',
            'sunrise':'',
            'sunset':''
        }
    });
})(window.App);
