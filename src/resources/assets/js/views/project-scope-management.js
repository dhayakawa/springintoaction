(function (App) {
    App.Views.ProjectScopeDropDownOption = App.Views.Backend.extend({
        tagName: 'option',
        initialize: function (options) {
            _.bindAll(this, 'render');
        },
        render: function () {
            let self = this;
            self.$el.attr('value', self.model.get('ProjectID'))
                .html('Project #:' + self.model.get('SequenceNumber'));
            return self;
        }
    });
    App.Views.ProjectScopeDropDown = App.Views.Backend.extend({
        initialize: function (options) {
            let self = this;
            self.options = options;

            self.optionsView = [];
            self.parentView = self.options.parentView;
            _.bindAll(self, 'addOne', 'addAll', 'changeSelected', 'updateCollectionBySite');
            self.projectScopeSitesDropdown = self.options.projectScopeSitesDropdown;
            self.listenTo(self.projectScopeSitesDropdown, "site-id-change", self.updateCollectionBySite);
            self.listenTo(self.collection, "reset", self.addAll);
        },
        events: {
            "change": "changeSelected"
        },
        updateCollectionBySite: function (e) {
            let self = this;
            self.options.selectedProjectID = e.ProjectID;
            self.collection.url = '/admin/project_scope/projects/' + e.SiteStatusID;
            self.collection.fetch({reset: true})
        },
        addOne: function (projectDropDown) {
            let self = this;
            let option = new App.Views.ProjectScopeDropDownOption({model: projectDropDown});
            self.optionsView.push(option);
            self.$el.append(option.render().el);
        },
        addAll: function () {
            let self = this;
            _.each(self.optionsView, function (option) {
                option.remove();
            });

            self.collection.each(self.addOne);

            self.$el.trigger('change');
        },
        render: function () {
            let self = this;
            self.addAll();
            return self;
        },
        changeSelected: function () {
            let self = this;
            let projectId = null;
            if (!_.isUndefined(self.options.selectedProjectID) && !_.isNull(self.options.selectedProjectID)) {
                self.$el.val(self.options.selectedProjectID);
                projectId = self.options.selectedProjectID;
                self.options.selectedProjectID = null;
            } else {
                let $option = self.$el.find(':selected');
                if (!$option.length) {
                    $option = self.$el.find(':first-child');
                }
                projectId = $option.val();
            }

            self.setSelectedId(self.parentView.$('select#sites option').filter(':selected').val(), self.parentView.$('select#sites option').filter(':selected').data('site-status-id'), projectId);
        },
        setSelectedId: function (SiteID, SiteStatusID, ProjectID) {
            let self = this;
            if (App.Vars.mainAppDoneLoading) {
                _log('App.Views.ProjectScopeProjectsDropDown.setSelectedId.event', 'new project selected', {
                    SiteID: SiteID,
                    SiteStatusID: SiteStatusID,
                    ProjectID: ProjectID
                });
                //console.log('trigger project-id-change',{SiteID: SiteID, SiteStatusID: SiteStatusID, ProjectID: ProjectID, currentProjectID:self.getViewDataStore('current-model-id')});
                self.trigger('project-id-change', {SiteID: SiteID, SiteStatusID: SiteStatusID, ProjectID: ProjectID});
            }
        }
    });
    // This is the sites drop down
    App.Views.ProjectScopeSiteOption = App.Views.Backend.extend({
        viewName: 'sites-dropdown-option',
        tagName: 'option',
        initialize: function (options) {
            let self = this;
            _.bindAll(self, 'render');
            self._initialize(options);
        },
        render: function () {
            let self = this;
            self.$el.attr('value',
                self.model.get(self.model.idAttribute)).data('site-status-id', self.model.get('SiteStatusID')).html(self.model.get('SiteName'));
            return self;
        }
    });
    App.Views.ProjectScopeSitesDropdown = App.Views.Backend.extend({
        viewName: 'sites-dropdown',
        initialize: function (options) {
            let self = this;

            _.bindAll(self, 'addOne', 'addAll', 'render', 'changeSelected', 'setSelectedId');
            self._initialize(options);
            self.listenTo(self.collection, "reset", self.addAll);

            self.parentView = self.options.parentView;

        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (site) {
            let self = this;
            self.$el.append(
                new App.Views.ProjectScopeSiteOption({
                    model: site,
                }).render().el);
        },
        addAll: function () {
            let self = this;
            _log('App.Views.ProjectScopeSitesDropdown.addAll', 'sites dropdown');
            self.$el.empty();
            self.collection.each(self.addOne);

            if (!_.isUndefined(self.options.selectedSiteID) && !_.isNull(self.options.selectedSiteID)) {
                self.$el.val(self.options.selectedSiteID);
                self.options.selectedSiteID = null;
            }
            let selectedProjectID = null;
            if (!_.isUndefined(self.options.selectedProjectID) && !_.isNull(self.options.selectedProjectID)) {
                selectedProjectID = self.options.selectedProjectID;
                self.options.selectedProjectID = null;
            }
            self.changeSelected(selectedProjectID);
        },
        render: function () {
            let self = this;
            self.addAll();

            return self;
        },
        changeSelected: function (selectedProjectID) {
            let self = this;
            // selectedProjectID might be an event
            if (!_.isNull(selectedProjectID) && !_.isUndefined(selectedProjectID.originalEvent)) {
                selectedProjectID = null;
            }
            //console.log({SiteID: self.$el.val(),selectedOption: self.$el.find('option:selected'), SiteStatusID: self.$el.find('option:selected').data('site-status-id'), ProjectID: selectedProjectID})
            self.setSelectedId(self.$el.val(), self.$el.find('option:selected').data('site-status-id'), selectedProjectID);
        },
        setSelectedId: function (SiteID, SiteStatusID, selectedProjectID) {
            let self = this;
            self.trigger('site-id-change', {SiteID: SiteID, SiteStatusID: SiteStatusID, ProjectID: selectedProjectID});
            self.trigger('site-status-id-change', {
                SiteID: SiteID,
                SiteStatusID: SiteStatusID,
                ProjectID: selectedProjectID
            });
        }
    });
    App.Views.ProjectScopeManagement = App.Views.Management.extend({
        sitesDropdownViewClass: App.Views.ProjectScopeSitesDropdown,
        projectScopeDropdownViewClass: App.Views.ProjectScopeDropDown,
        projectScopeViewClass: App.Views.ProjectScope,
        gridManagerContainerToolbarClass: App.Views.ProjectScopeGridManagerContainerToolbar,
        attributes: {
            class: 'route-view box box-primary project-scope-management-view'
        },
        template: template('projectScopeManagementTemplate'),
        viewName: 'project-scope-management-view',
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'emailProjectReport');
            } catch (e) {
                console.error(options, e);
            }
            // Required call for inherited class
            self._initialize(options);
            self.bReturnToProjectManagementView = false;
            self.bReturnToProjectStatusManagementView = false;
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
        },
        events: {
            'click .email-sitewide-project-reports': 'emailProjectReport'
        },
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template({
                modelNameLabelLowerCase: self.modelNameLabelLowerCase,
                modelNameLabel: self.modelNameLabel
            }));
            self.renderSiteDropdowns();
            //model: App.Models.projectModel,
            self.projectScopeView = new self.projectScopeViewClass({
                ajaxWaitingTargetClassSelector: '.backgrid-wrapper',
                collection: App.PageableCollections.projectCollection,
                columnCollectionDefinitions: App.Vars.projectsBackgridColumnDefinitions,
                gridManagerContainerToolbarClassName: 'grid-manager-container',
                model: App.Models.projectScopeModel,
                modelNameLabel: 'Project',
                parentView: self,
                viewName: 'project-scope'
            });
            self.gridManagerContainerToolbar = new self.gridManagerContainerToolbarClass({
                el: self.$('.grid-manager-container'),
                parentView: self,
                managedGridView: self.projectScopeView,
                ajaxWaitingTargetClassSelector: '.backgrid-wrapper',
            });
            self.gridManagerContainerToolbar.render();
            self.childViews.push(self.gridManagerContainerToolbar);
            self.projectScopeView.setGridManagerContainerToolbar(self.gridManagerContainerToolbar);

            self.$('.backgrid-wrapper').html(self.projectScopeView.render().el);

            self.childViews.push(self.projectScopeView);

            if (!_.isUndefined(self.options.loadProject) && !_.isNull(self.options.loadProject) && !_.isUndefined(App.Views.mainApp.router.managementViews['project_management'])) {
                let $projectManagementView = App.Views.mainApp.router.managementViews['project_management'].$el;

                if ($projectManagementView.length && $projectManagementView.is(':visible')) {
                    self.bReturnToProjectManagementView = true;
                    $projectManagementView.hide();
                }
            } else if (!_.isUndefined(self.options.loadProject) && !_.isNull(self.options.loadProject) && !_.isUndefined(App.Views.mainApp.router.managementViews['project_status'])) {
                let $projectStatusManagementView = App.Views.mainApp.router.managementViews['project_status'].$el;

                if ($projectStatusManagementView.length && $projectStatusManagementView.is(':visible')) {
                    self.bReturnToProjectStatusManagementView = true;
                    $projectStatusManagementView.hide();
                }
            }

            return self;
        },
        emailProjectReport: function (e) {
            let self = this;
            e.preventDefault();

            //console.log({emails:emails,siteId:self.getViewDataStore('current-site-id','project_scope_management'),sitestatusid:self.getViewDataStore('current-site-status-id','project_scope_management'),modelid:self.getViewDataStore('current-model-id','project_scope_management')});
            let $btn = $(e.currentTarget);
            $btn.siblings('.spinner').remove();
            $btn.after(App.Vars.spinnerHtml);
            let data = {
                SiteID: self.getViewDataStore('current-site-id', 'project_scope_management'),
                SiteStatusID: self.getViewDataStore('current-site-status-id', 'project_scope_management'),
                ProjectID: self.getViewDataStore('current-model-id', 'project_scope_management'),
                site_wide: true
            };

            let growlMsg = '';
            let growlType = '';
            $.when(
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: 'admin/project_scope/email_report',
                    data: data,
                    success: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';

                    },
                    fail: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                    }
                })
            ).then(function () {
                growl(growlMsg, growlType);
                $btn.siblings('.spinner').remove();
            });
        },
        renderSiteDropdowns: function () {
            let self = this;

            let selectedSiteID = App.Vars.appInitialData.project_manager_sites.length ? App.Vars.appInitialData.project_manager_sites[0].SiteID : null;
            let selectedProjectID = null;

            if (self.options.loadProject) {
                if (self.options.loadProject.match(/_/)) {
                    let parts = self.options.loadProject.split(/_/);
                    selectedSiteID = parts[0];
                    selectedProjectID = parts[1];
                }
            }
            self.sitesDropdownView = new self.sitesDropdownViewClass({
                el: self.$('select#sites'),
                model: new App.Models.Site(),
                collection: new App.Collections.Site(App.Vars.appInitialData.project_manager_sites),
                parentView: self,
                selectedSiteID: selectedSiteID,
                selectedProjectID: selectedProjectID,
            });
            self.projectsDropDownView = new this.projectScopeDropdownViewClass({
                el: this.$('select#projects'),
                parentView: this,
                projectScopeSitesDropdown: self.sitesDropdownView,
                collection: new App.Collections.ProjectsDropDown(App.Vars.appInitialData.project_manager_projects),
            });
            self.projectsDropDownView.render();
            self.listenTo(self.projectsDropDownView, 'project-id-change', self.handleProjectIDChange);
            self.listenTo(self.sitesDropdownView, 'site-id-change', self.handleSiteIDChange);
            self.listenTo(self.sitesDropdownView, 'site-status-id-change', self.handleSiteStatusIDChange);
            self.sitesDropdownView.render();
            self.childViews.push(self.sitesDropdownView);
            self.childViews.push(self.projectsDropDownView);


        },
        handleSiteStatusIDChange: function (e) {
            let self = this;

            self.setViewDataStoreValue('current-site-status-id', e['SiteStatusID']);
        },
        handleProjectIDChange: function (e) {
            let self = this;
            self.gridManagerContainerToolbar.disableSaveBtn();
            self.setViewDataStoreValue('current-model-id', e['ProjectID']);
        },
    });
})(window.App);
