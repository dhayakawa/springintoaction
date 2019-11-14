(function (App) {
    App.Views.ProjectScopeDropDownOption = App.Views.Backend.extend({
        tagName: 'option',
        initialize: function (options) {
            _.bindAll(this, 'render');
        },
        render: function () {
            let self = this;
            this.$el.attr('value', self.model.get('ProjectID'))
                .html('Project #:' + self.model.get('SequenceNumber'));
            return this;
        }
    });
    App.Views.ProjectScopeDropDown = App.Views.Backend.extend({
        initialize: function (options) {
            let self = this;
            this.options = options;
            this.optionsView = [];
            this.parentView = this.options.parentView;
            _.bindAll(this, 'addOne', 'addAll', 'changeSelected');
            self.projectScopeSitesDropdown = self.options.projectScopeSitesDropdown;
            self.listenTo(self.projectScopeSitesDropdown, "site-id-change", self.updateCollectionBySite);
            self.listenTo(self.collection, "reset", self.addAll);
        },
        events: {
            "change": "changeSelected"
        },
        updateCollectionBySite: function (e) {
            let self = this;

            self.collection.url = '/admin/project_scope/projects/' + e.SiteStatusID;
            self.collection.fetch({reset: true});
        },
        addOne: function (projectDropDown) {
            let option = new App.Views.ProjectScopeDropDownOption({model: projectDropDown});
            this.optionsView.push(option);
            this.$el.append(option.render().el);
        },
        addAll: function () {
            _.each(this.optionsView, function (option) {
                option.remove();
            });

            this.collection.each(this.addOne);
            this.$el.trigger('change');
        },
        render: function () {
            this.addAll();
            return this;
        },
        changeSelected: function () {
            let $option = this.$el.find(':selected');
            if (!$option.length) {
                $option = this.$el.find(':first-child');
            }
            this.setSelectedId(this.parentView.$('select#site_years option').filter(':selected').text(), this.parentView.$('select#site_years option').filter(':selected').data('site-status-id'), $option.val());
        },
        setSelectedId: function (SiteID, SiteStatusID, ProjectID) {
            let self = this;
            if (App.Vars.mainAppDoneLoading) {
                _log('App.Views.ProjectScopeProjectsDropDown.setSelectedId.event', 'new project selected', ProjectID);
                //console.log({SiteID: SiteID, SiteStatusID: SiteStatusID, ProjectID: ProjectID})
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
            // Force related views to updatesite-volunteers-grid-manager-toolbar
            //console.log({'this.options.selectedSiteID': this.options.selectedSiteID})
            if (!_.isUndefined(self.options.selectedSiteID) && !_.isNull(self.options.selectedSiteID)) {
                self.$el.val(self.options.selectedSiteID);
                self.options.selectedSiteID = null;
            }

            self.changeSelected();
        },
        render: function () {
            let self = this;
            self.addAll();

            return self;
        },
        changeSelected: function () {
            let self = this;
            self.setSelectedId(self.$el.val(), self.$el.find('option:selected').data('site-status-id'));
        },
        setSelectedId: function (SiteID, SiteStatusID) {
            let self = this;
            self.trigger('site-id-change', {SiteID: SiteID, SiteStatusID: SiteStatusID});
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
            // try {
            //     _.bindAll(self, '');
            // } catch (e) {
            //     console.error(options, e);
            // }
            // Required call for inherited class
            self._initialize(options);
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
        },
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template({
                modelNameLabelLowerCase:self.modelNameLabelLowerCase,
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
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
            });
            self.gridManagerContainerToolbar.render();
            self.childViews.push(self.gridManagerContainerToolbar);
            self.projectScopeView.setGridManagerContainerToolbar(self.gridManagerContainerToolbar);

            self.$('.backgrid-wrapper').html(self.projectScopeView.render().el);

            self.childViews.push(self.projectScopeView);

            return self;
        },
        renderSiteDropdowns: function () {
            let self = this;

            let selectedSiteID = App.Vars.appInitialData.project_manager_sites[0].SiteID;

            self.sitesDropdownView = new self.sitesDropdownViewClass({
                el: self.$('select#sites'),
                model: new App.Models.Site(),
                collection: new App.Collections.Site(App.Vars.appInitialData.project_manager_sites),
                parentView: self,
                selectedSiteID: selectedSiteID,
            });
            self.projectsDropDownView = new this.projectScopeDropdownViewClass({
                el: this.$('select#projects'),
                parentView: this,
                projectScopeSitesDropdown: self.sitesDropdownView,
                collection: new App.Collections.ProjectsDropDown(App.Vars.appInitialData.project_manager_projects)
            });
            self.projectsDropDownView.render();
            self.listenTo(self.sitesDropdownView, 'site-id-change', self.handleSiteIDChange);
            self.sitesDropdownView.render();
            self.childViews.push(self.sitesDropdownView);
            self.childViews.push(self.projectsDropDownView);


        }
    });
})(window.App);
