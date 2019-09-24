(function (App) {
    App.Views.ProjectManagement = App.Views.Backend.fullExtend({
        sitesViewClass: App.Views.Sites,
        siteYearsViewClass: App.Views.SiteYears,
        siteProjectTabsViewClass: App.Views.SiteProjectTabs,
        projectsViewClass: App.Views.Projects,
        attributes: {
            class: 'project-management-view route-view box box-primary'
        },
        template: template('projectManagementTemplate'),
        initialize: function (options) {
            _.bindAll(this, '_initialize','render', 'updateProjectDataViews', 'updateProjectDataTabButtons');
            this._initialize(options);
        },
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template());
            self.siteYearsDropDownView = new self.siteYearsViewClass({
                el: self.$('select#site_years'),
                parentView: this,
                collection: new App.Collections.SiteYear(App.Vars.appInitialData.site_years)
            });
            // App.Vars.appInitialData.sites
            self.sitesDropDownView = new self.sitesViewClass({
                el: self.$('select#sites'),
                collection: new App.Collections.Site(App.Vars.appInitialData.sites),
                parentView: self,
                siteYearsDropDownView: self.siteYearsDropDownView
            });
            self.sitesDropDownView.render();
            self.childViews.push(self.sitesDropDownView);


            self.siteYearsDropDownView.render();
            self.childViews.push(self.siteYearsDropDownView);

            self.projectsView = new self.projectsViewClass({
                ajaxWaitingTargetClassSelector: '.projects-view',
                backgridWrapperClassSelector: '.projects-backgrid-wrapper',
                collection: App.PageableCollections.projectCollection,
                columnCollectionDefinitions: App.Vars.projectsBackgridColumnDefinitions,
                currentModelIDDataStoreSelector: '.site-projects-tabs-view',
                el: self.$('.projects-backgrid-wrapper'),
                gridManagerContainerToolbarClassName: 'projects-grid-manager-container',
                mainApp: self.mainApp,
                model: App.Models.projectModel,
                modelNameLabel: 'Project',
                parentView: self,
                siteYearsDropDownView: self.siteYearsDropDownView,
                viewName: 'projects'
            });

            self.projectGridManagerContainerToolbar = new App.Views.ProjectGridManagerContainerToolbar({
                el: self.$('.projects-grid-manager-container'),
                parentView: self,
                projectsView: self.projectsView
            });
            self.projectGridManagerContainerToolbar.render();
            self.childViews.push(self.projectGridManagerContainerToolbar);

            self.projectsView.render();
            self.childViews.push(self.projectsView);

            self.siteProjectTabsView = new self.siteProjectTabsViewClass({
                el: self.$('.site-projects-tabs-view'),
                mainApp: self.mainApp,
                parentView: self,
                projectsView: self.projectsView,
                model: self.projectsView.model
            });
            self.siteProjectTabsView.render();
            self.childViews.push(self.siteProjectTabsView);

            if (!_.isEmpty(self.projectsView.getViewDataStore('current-tab'))) {
                try {
                    self.$el.find('.nav-tabs [href="#' + self.projectsView.getViewDataStore('current-tab') + '"]').tab('show');
                    self.$el.find('.tab-content .tab-pane').removeClass('active');
                    self.$el.find('.tab-content .tab-pane#' + self.projectsView.getViewDataStore('current-tab')).addClass('active');
                } catch (e) {
                    console.log(e, self.projectsView.getViewDataStore('current-tab'))
                }

                //console.log('just set the tab', self.projectsView.getViewDataStore('current-tab'), self.$el.find('.nav-tabs [href="#' + self.projectsView.getViewDataStore('current-tab') + '"]'))
            } else {
                self.$el.find('.nav-tabs #project_lead').tab('show');
            }
            return self;
        },
        /**
         * ProjectID can also be an event
         * @param ProjectID
         */
        updateProjectDataViews: function (ProjectID) {
            let self = this;

            if (typeof ProjectID === 'string') {
                let currentProjectModel = self.collection.findWhere({ProjectID: parseInt(ProjectID)});
                self.mainApp.$('.site-projects-tabs-view .box-title small').html(currentProjectModel.get('ProjectDescription'))
            }
        },
        updateProjectDataTabButtons: function (e) {
            console.log('updateProjectDataTabButtons triggered')
        }
    });
})(window.App);
