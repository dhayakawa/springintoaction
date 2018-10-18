(function (App) {
    App.Collections.DashboardPanel = Backbone.Collection.extend({
        model: App.Models.DashboardPanel
    });
    App.Collections.DashboardPanelLinksListItem = Backbone.Collection.extend({
        model: App.Models.DashboardPanelLinksListItem
    });
})(window.App);
