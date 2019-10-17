(function (App) {
    App.Collections.Option = Backbone.Collection.extend({
        url: '/admin/option/list/all',
        model: App.Models.Option
    });
    App.Collections.SiteRoleOption = Backbone.Collection.extend({
        url: '/admin/option/list/all',
        model: App.Models.SiteRole
    });
    App.Collections.ProjectRoleOption = Backbone.Collection.extend({
        url: '/admin/option/list/all',
        model: App.Models.ProjectRole
    });
})(window.App);
