(function (App) {
    App.Views.mainApp = Backbone.View.extend({
        siteManagementViewClass: App.Views.SiteManagement,
        siteProjectTabsViewClass: App.Views.SiteProjectTabs,
        contactsManagementViewClass: App.Views.ContactsManagement,
        volunteersManagementViewClass: App.Views.VolunteersManagement,
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

            App.Views.contactsManagementView = this.contactsManagementView = new this.contactsManagementViewClass({
                className: 'box box-primary collapsed-box contacts-management-view',
                viewClassName: 'contacts-management-view',
                mainAppEl: this.el,
                modelNameLabel: 'Contact',
                collection: App.PageableCollections.contactsManagementCollection,
                columnCollectionDefinitions: App.Vars.ContactsBackgridColumnDefinitions,
                hideCellCnt: 0
            });
            this.$el.append(this.contactsManagementView.render().el);

            App.Views.volunteersManagementView = this.volunteersManagementView = new this.volunteersManagementViewClass({
                className: 'box box-primary collapsed-box volunteers-management-view',
                viewClassName: 'volunteers-management-view',
                mainAppEl: this.el,
                modelNameLabel: 'Volunteer',
                collection: App.PageableCollections.volunteersManagementCollection,
                columnCollectionDefinitions: App.Vars.volunteersBackgridColumnDefinitions,
                hideCellCnt: 0
            });
            this.$el.append(this.volunteersManagementView.render().el);

            _log('App.Views.mainApp.render', 'render', this.$el);
            App.Vars.mainAppDoneLoading = true;
            _log('App.Views.mainApp.render', 'App.Vars.mainAppDoneLoading = true');
            return this;
        }
    });

})(window.App);
