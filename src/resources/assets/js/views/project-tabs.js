(function (App) {
    App.Views.SiteProjectTabs = App.Views.ManagedGridTabs.fullExtend({
        projectContactsViewClass: App.Views.ProjectContact,
        projectVolunteersViewClass: App.Views.ProjectVolunteer,
        projectLeadsViewClass: App.Views.ProjectLead,
        projectBudgetViewClass: App.Views.Budget,
        projectAttachmentsViewClass: App.Views.ProjectAttachment,
        initialize: function (options) {
            let self = this;

            // Required call for inherited class
            self._initialize(options);
            self.sitesDropdownView = self.options.parentView.sitesDropdownView;
            self.siteYearsDropdownView = self.options.parentView.siteYearsDropdownView;
        },


        render: function () {
            let self = this;

            self.projectLeadsView = new self.projectLeadsViewClass({
                el: self.$('.project-leads-backgrid-wrapper'),
                viewName: 'project-leads',
                tab: 'project_lead',
                collection: App.PageableCollections.projectLeadsCollection,
                model: App.Vars.currentTabModels['project_lead'],
                columnCollectionDefinitions: App.Vars.volunteerLeadsBackgridColumnDefinitions,
                hideCellCnt: 0,//8,
                currentModelIDDataStoreSelector: '#project_lead',
                parentView: this,
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                gridManagerContainerToolbarClassName: 'project-tabs-grid-manager-container',
                modelNameLabel: 'Project Leads',
                mainApp: self.mainApp

            });
            self.childTabViews.push({project_lead: self.projectLeadsView});

            self.projectBudgetView = new self.projectBudgetViewClass({
                el: self.$('.project-budgets-backgrid-wrapper'),
                viewName: 'project-budgets',
                tab: 'project_budget',
                collection: App.PageableCollections.projectBudgetsCollection,
                model: App.Vars.currentTabModels['project_budget'],
                columnCollectionDefinitions: App.Vars.BudgetsBackgridColumnDefinitions,
                hideCellCnt: 0,
                currentModelIDDataStoreSelector: '#project_budget',
                parentView: self,
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                gridManagerContainerToolbarClassName: 'project-tabs-grid-manager-container',
                modelNameLabel: 'Project Budget',
                mainApp: self.mainApp
            });
            self.childTabViews.push({project_budget: self.projectBudgetView});

            self.projectContactsView = new self.projectContactsViewClass({
                el: self.$('.project-contacts-backgrid-wrapper'),
                viewName: 'project-contacts',
                tab: 'project_contact',
                collection: App.PageableCollections.projectContactsCollection,
                model: App.Vars.currentTabModels['project_contact'],
                columnCollectionDefinitions: App.Vars.projectContactsBackgridColumnDefinitions,
                hideCellCnt: 0,
                currentModelIDDataStoreSelector: '#project_contact',
                parentView: self,
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                gridManagerContainerToolbarClassName: 'project-tabs-grid-manager-container',
                modelNameLabel: 'Project Contact',
                mainApp: self.mainApp
            });
            self.childTabViews.push({project_contact: self.projectContactsView});

            self.projectVolunteersView = new self.projectVolunteersViewClass({
                el: self.$('.project-volunteers-backgrid-wrapper'),
                viewName: 'project-volunteers',
                tab: 'project_volunteer',
                collection: App.PageableCollections.projectVolunteersCollection,
                model: App.Vars.currentTabModels['project_volunteer'],
                columnCollectionDefinitions: App.Vars.projectVolunteersBackgridColumnDefinitions,
                hideCellCnt: 0,
                currentModelIDDataStoreSelector: '#project_volunteer',
                parentView: self,
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                gridManagerContainerToolbarClassName: 'project-tabs-grid-manager-container',
                modelNameLabel: 'Project Volunteer',
                mainApp: self.mainApp
            });
            self.childTabViews.push({project_volunteer: self.projectVolunteersView});

            self.projectAttachmentsView = new self.projectAttachmentsViewClass({
                el: self.$('.project-attachments-backgrid-wrapper'),
                tab: 'project_attachment',
                viewName: 'project-attachments',
                collection: App.PageableCollections.projectAttachmentsCollection,
                model: App.Vars.currentTabModels['project_attachment'],
                columnCollectionDefinitions: App.Vars.ProjectAttachmentsBackgridColumnDefinitions,
                hideCellCnt: 0,
                currentModelIDDataStoreSelector: '#project_attachment',
                parentView: self,
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                gridManagerContainerToolbarClassName: 'project-tabs-grid-manager-container',
                modelNameLabel: 'Project Attachment',
                mainApp: self.mainApp
            });
            self.childTabViews.push({project_attachment: self.projectAttachmentsView});

            _.each(App.Vars.currentTabModels, function (model, key) {
                let managedGridView = null;
                _.each(self.childTabViews, function (value) {
                    if (!_.isUndefined(value[key])) {
                        managedGridView = value[key];
                    }
                });

                /**
                 * Handles the buttons below the tabbed grids
                 */
                let view = new App.Views.ProjectTabGridManagerContainerToolbar({
                    parentView: self,
                    el: self.parentView.$('.' + key + '.tab-grid-manager-container'),
                    bAppend: true,
                    parentChildViews: self.childTabViews,
                    mainApp: self.mainApp,
                    managedGridView: managedGridView,
                    viewName: 'tab-' + key + '-grid-manager-toolbar',
                    tabId: key
                });
                self.childTabsGridManagerContainerToolbarViews.push({[key]: view});
            });

            self.childViews = _.values(self.childTabViews);
            self.childViews.concat(_.values(self.childTabsGridManagerContainerToolbarViews));
            //self.childViews.push(self.projectTabsGridManagerContainerToolbarView);
            //self.projectTabsGridManagerContainerToolbarView.render();
            _.each(self.childTabsGridManagerContainerToolbarViews, function (view) {
                let childTabGridManager = _.values(view)[0];
                childTabGridManager.render();
                childTabGridManager.managedGridView.setGridManagerContainerToolbar(childTabGridManager);
            });
            self.projectLeadsView.render();
            self.projectBudgetView.render();
            self.projectContactsView.render();
            self.projectVolunteersView.render();
            self.projectAttachmentsView.render();
            let titleDescription = self.managedGridView.collection.length === 0 ? 'No projects created yet.' : self.model.get('ProjectDescription');
            self.mainApp.$('h3.box-title small').html(titleDescription);
            _log('App.Views.SiteProjectTabs.render', 'set tabs project title to:' + titleDescription, 'setting data-project-id to ' + self.model.get(self.model.idAttribute) + ' on', self.$el);
            self.$el.data('project-id', self.model.get(self.model.idAttribute));
            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            self.toggleTabsBox();

            return this;
        },

        /**
         * Rebuild the Project Tabs if the project has changed
         * @returns {App.Views.SiteProjectTabs}
         */
        fetchIfNewID: function (e) {
            var self = this;
            if (self.model.hasChanged(self.model.idAttribute)) {
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                let newId = self.model.get(self.model.idAttribute);
                if (!_.isUndefined(newId)) {
                    _log(self.viewName + '.fetchIfNewID.event', 'model primary key value has changed. Fetching new data for tab collections.', newId);

                    self.projectLeadsView.collection.url = self.projectLeadsView.getCollectionUrl(newId);
                    self.projectBudgetView.collection.url = self.projectBudgetView.getCollectionUrl(newId);
                    self.projectContactsView.collection.url = self.projectContactsView.getCollectionUrl(newId);
                    self.projectVolunteersView.collection.url = self.projectVolunteersView.getCollectionUrl(newId);
                    self.projectAttachmentsView.collection.url = self.projectAttachmentsView.getCollectionUrl(newId);

                    let fetchArgs = {reset: true, silent: false, success: self.tabFetchSuccess};
                    self.updateMainAppBoxTitleContentPreFetchTabCollections(newId);
                    $.when(
                        self.projectLeadsView.collection.fetch(fetchArgs),
                        self.projectBudgetView.collection.fetch(fetchArgs),
                        self.projectContactsView.collection.fetch(fetchArgs),
                        self.projectVolunteersView.collection.fetch(fetchArgs),
                        self.projectAttachmentsView.collection.fetch(fetchArgs)
                    ).then(function () {
                        //initialize your views here
                        _log(self.viewName + '.fetchIfNewID.event', 'tab collections fetch promise done');
                        self.updateMainAppBoxTitleContentPostFetchTabCollections(newId);
                        // DO NOT RE-Render tab views or duplicate data and events start up
                        window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                    });
                }

            } else {
                _log(self.viewName + '.fetchIfNewID.event', 'fetchIfNewID has not changed', self.model.get(self.model.idAttribute));
            }
            return this;
        },
        updateMainAppBoxTitleContentPreFetchTabCollections: function(newId){
            let self = this;
            self.mainApp.$('h3.box-title small').html('Updating Tabs. Please wait...');
        },
        updateMainAppBoxTitleContentPostFetchTabCollections: function (newId) {
            let self = this;
            self.mainApp.$('h3.box-title small').html(self.model.get('ProjectDescription'));
            _log(self.viewName + '.fetchIfNewID.event', 'setting data-project-id to ' + newId + ' on', self.$el);
            self.$el.data('project-id', newId);
        }
    });
})(window.App);
