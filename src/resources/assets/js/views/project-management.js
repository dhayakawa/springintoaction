(function (App) {
    App.Views.ProjectManagement = App.Views.Management.fullExtend({
        sitesDropdownViewClass: App.Views.SitesDropdown,
        siteYearsDropdownViewClass: App.Views.SiteYearsDropdown,
        siteProjectTabsViewClass: App.Views.SiteProjectTabs,
        projectsViewClass: App.Views.Projects,
        attributes: {
            class: 'project-management-view route-view box box-primary'
        },
        template: template('projectTabbedManagementTemplate'),
        viewName: 'projects-management-view',
        initialize: function (options) {
            let self = this;
            // try {
            //     _.bindAll(self, '');
            // } catch (e) {
            //     console.error(options, e);
            // }
            // Required call for inherited class
            self._initialize(options);

        },
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template());
            self.renderSiteDropdowns();

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
                viewName: 'projects'
            });

            self.projectGridManagerContainerToolbar = new App.Views.ProjectGridManagerContainerToolbar({
                el: self.$('.projects-grid-manager-container'),
                parentView: self,
                mainApp: self.mainApp,
                managedGridView: self.projectsView,
                viewName: 'projects-grid-manager-toolbar'
            });
            self.projectGridManagerContainerToolbar.render();
            self.childViews.push(self.projectGridManagerContainerToolbar);
            this.projectsView.setGridManagerContainerToolbar(self.projectGridManagerContainerToolbar);

            self.projectsView.render();
            self.childViews.push(self.projectsView);

            self.siteProjectTabsView = new self.siteProjectTabsViewClass({
                el: self.$('.site-projects-tabs-view'),
                ajaxWaitingTargetClassSelector: '.tabs-content-container',
                mainApp: self.mainApp,
                parentView: self,
                managedGridView: self.projectsView,
                model: self.projectsView.model,
                viewName: 'site-projects-tabs-view'
            });
            self.siteProjectTabsView.render();
            self.childViews.push(self.siteProjectTabsView);

            if (!_.isEmpty(self.projectsView.getViewDataStore('current-tab'))) {
                try {
                    self.$el.find('.nav-tabs [href="#' + self.projectsView.getViewDataStore('current-tab') + '"]').tab('show');
                    self.$el.find('.tab-content .tab-pane').removeClass('active');
                    self.$el.find('.tab-content .tab-pane#' + self.projectsView.getViewDataStore('current-tab')).addClass('active');
                    self.$el.find('.tab-grid-manager-container.' + self.projectsView.getViewDataStore('current-tab')).show();
                } catch (e) {
                    //console.log(e, self.managedGridView.getViewDataStore('current-tab'))
                }

                //console.log('just set the tab', self.managedGridView.getViewDataStore('current-tab'), self.$el.find('.nav-tabs [href="#' + self.managedGridView.getViewDataStore('current-tab') + '"]'))
            } else {
                self.$el.find('.nav-tabs #project_lead').tab('show');
                self.$el.find('.tab-grid-manager-container.project_lead').show();
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
        }
    });
})(window.App);
