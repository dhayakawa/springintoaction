(function (App) {
    App.Views.mainApp = Backbone.View.extend({
        siteManagementViewClass: App.Views.SiteManagement,
        siteProjectTabsViewClass: App.Views.SiteProjectTabs,
        el: $(".sia-main-app"),
        initialize: function () {
            console.log('MainApp', 'initialize')
            _.bindAll(this, 'render');
        },
        render: function () {
            //console.log('appInitialData', appInitialData);
            App.Vars.currentSiteID = appInitialData.site.SiteID;
            App.Vars.currentProjectID = appInitialData.project.ProjectID;
            App.Vars.mainAppDoneLoading = false;

            App.Views.siteManagementView = this.siteManagementView = new this.siteManagementViewClass({
                el: this.$('.site-management-view')
            });
            this.siteManagementView.render();


            App.Views.siteProjectTabsView = this.siteProjectTabsView = new this.siteProjectTabsViewClass({
                el: this.$('.site-projects-tabs'),
                mainAppEl: this.el,
                model: App.Models.projectModel
            });
            this.siteProjectTabsView.render();
            App.Vars.mainAppDoneLoading = true;

            return this;
        }
    });

})(window.App);
