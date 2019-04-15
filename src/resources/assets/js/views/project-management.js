(function (App) {
    App.Views.ProjectManagement = Backbone.View.extend({
        sitesViewClass: App.Views.Sites,
        siteYearsViewClass: App.Views.SiteYears,
        siteProjectTabsViewClass: App.Views.SiteProjectTabs,
        projectsViewClass: App.Views.Projects,
        attributes: {
            class: 'project-management-view route-view box box-primary'
        },
        template: template('projectManagementTemplate'),
        initialize: function (options) {
            this.options    = options;
            this.childViews = [];
            this.mainApp    = this.options.mainApp;
            _.bindAll(this, 'render', 'updateProjectDataViews', 'updateProjectDataTabButtons');
        },
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template());

            App.Views.sitesDropDownView = this.sitesDropDownView = new this.sitesViewClass({
                el: this.$('select#sites'),
                collection: App.Collections.sitesDropDownCollection
            });
            this.sitesDropDownView.render();
            this.childViews.push(this.sitesDropDownView);

            App.Views.siteYearsDropDownView = this.siteYearsDropDownView = new this.siteYearsViewClass({
                el: this.$('select#site_years'),
                parentView: this,
                collection: App.Collections.siteYearsDropDownCollection
            });
            this.siteYearsDropDownView.render();
            this.childViews.push(this.siteYearsDropDownView);

            App.Views.projectsView = this.projectsView = new this.projectsViewClass({
                el: this.$('.projects-backgrid-wrapper'),
                parentView: this,
                collection: App.PageableCollections.projectCollection,
                columnCollectionDefinitions: App.Vars.projectsBackgridColumnDefinitions,
                model: App.Models.projectModel
            });
            this.projectsView.render();
            this.childViews.push(this.projectsView);

            App.Views.siteProjectTabsView = this.siteProjectTabsView = new this.siteProjectTabsViewClass({
                el: this.$('.site-projects-tabs'),
                mainApp: self.mainApp,
                parentView: this,
                model: App.Models.projectModel
            });
            this.siteProjectTabsView.render();
            this.childViews.push(this.siteProjectTabsView);

            return this;
        },
        /**
         * ProjectID can also be an event
         * @param ProjectID
         */
        updateProjectDataViews: function (ProjectID) {
            let self = this;

            if (typeof ProjectID === 'string') {
                let currentProjectModel = self.collection.findWhere({ProjectID: parseInt(ProjectID)});
                self.mainApp.$('.site-projects-tabs .box-title small').html(currentProjectModel.get('ProjectDescription'))
            }
        },
        updateProjectDataTabButtons: function (e) {
            console.log('updateProjectDataTabButtons triggered')
        }
    });
})(window.App);
