(function (App) {
    App.Views.mainApp = Backbone.View.extend({
        siteManagementViewClass: App.Views.SiteManagement,
        siteProjectTabsViewClass: App.Views.SiteProjectTabs,
        el: $(".sia-main-app"),
        initialize: function (options) {
            _log('App.Views.mainApp.initialize', 'MainApp', 'initialize');
            _.bindAll(this, 'render');
        },
        render: function () {
            _log('App.Views.mainApp.render', 'appInitialData', appInitialData);
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

            // App.Views.volunteerManagementView = this.volunteerManagementView = new App.Views.VolunteerManagement({
            //     el: this.$('.volunteers-management-view'),
            //     mainAppEl: this.el,
            //     collection: App.PageableCollections.volunteersManagementCollection,
            //     columnCollectionDefinitions: App.Vars.volunteersBackgridColumnDefinitions,
            //     columnCollection: App.Vars.VolunteersBackgridColumnCollection,
            //     hideCellCnt: 0
            // });
            // //this.volunteerManagementView.render();
            //
            // App.Views.contactManagementView = this.contactManagementView = new App.Views.ContactManagement({
            //     el: this.$('.contacts-management-view'),
            //     mainAppEl: this.el,
            //     collection: App.PageableCollections.contactsManagementCollection,
            //     columnCollectionDefinitions: App.Vars.ContactsBackgridColumnDefinitions,
            //     columnCollection: App.Vars.ContactsBackgridColumnCollection,
            //     hideCellCnt: 0
            // });
            //this.contactManagementView.render();

            App.Vars.mainAppDoneLoading = true;
            _log('App.Views.mainApp.render', 'App.Vars.mainAppDoneLoading = true');
            return this;
        }
    });

})(window.App);
