
(function (App) {
    App.Models.DashboardPanelLinksListItem = Backbone.Model.extend({
        defaults: {
            'linkText': '',
            'badgeCount': '',
            'route': ''
        }
    });

    App.Models.DashboardPanel = Backbone.Model.extend({
        defaults: {
            'panelBgColor': '',
            'panelFAIconClass': '',
            'panelName':'',
            'panelDescription':'',
            'panelLinksListView':{}
        }
    });

})(window.App);
