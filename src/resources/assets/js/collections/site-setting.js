(function (App) {
    App.Collections.SiteSetting = Backbone.Collection.extend({
        url:'/admin/site_setting/list/all',
        model: App.Models.SiteSetting
    });
})(window.App);
