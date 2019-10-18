(function (App) {
    App.Collections.StatusManagement = Backbone.Collection.extend({
        url: '/admin/sitestatus/list/all/statusmanagementrecords',
        model: App.Models.StatusManagement
    });
})(window.App);
