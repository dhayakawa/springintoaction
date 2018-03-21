(function (App) {
    App.Views.ProjectTabsGridManagerContainerToolbar = Backbone.View.extend({
        template: template('projectTabsGridManagerContainerToolbarsTemplate'),
        initialize: function (options) {
            let self = this;
            this.parentChildViews = options.parentChildViews;
            _.bindAll(this, 'toggleProjectTabToolbars', 'addGridRow', 'deleteCheckedRows', 'clearStoredColumnState', 'toggleDeleteBtn');
            this.options = options;
            this.tabs = $(self.options.parentViewEl).find('.nav-tabs [role="tab"]');
            this.listenTo(App.Views.siteProjectTabsView, 'cleared-child-views', function () {
                self.remove();
            });
            this.listenTo(App.Views.siteProjectTabsView, 'toggle-delete-btn', function (e) {
                self.toggleDeleteBtn(e);
            });
            this.listenTo(App.Views.siteProjectTabsView, 'tab-toggled', this.toggleProjectTabToolbars);

        },
        events: {
            'click .btnTabAdd': 'addGridRow',
            'click .btnTabDeleteChecked': 'deleteCheckedRows',
            'click .btnTabClearStored': 'clearStoredColumnState'
        },
        render: function () {
            let self = this;
            self.$el.empty();
            self.tabs.each(function (idx, el) {
                let tabName = $(el).attr('aria-controls');
                let tabButtonLabel = $(el).text();
                self.$el.append(self.template({TabName: tabName, btnLabel: tabButtonLabel}));
                if (idx === 0) {
                    $('.tabButtonPane.' + tabName).show()
                }
            });

            return self;
        },
        toggleProjectTabToolbars: function (e) {
            let clickedTab = e.data;
            //App.Vars.currentTabModels[clickedTab]
            this.$el.find('.tabButtonPane').hide();
            this.$el.find('.' + clickedTab + '.tabButtonPane').show();
            let tabView = _.find(this.parentChildViews, function (val) {
                return _.has(val, clickedTab)
            });

        },
        addGridRow: function (e) {
            var self = this;
            let tabName = $(e.target).parents('.tabButtonPane').data('tab-name');
            let tabView = _.find(this.parentChildViews, function (val) {
                return _.has(val, tabName)
            });

            _log('App.Views.ProjectTabsGridManagerContainerToolbar.addGridRow', e, tabName, tabView);

            $('#sia-modal').one('show.bs.modal', function (event) {
                let button = $(event.relatedTarget); // Button that triggered the modal
                let recipient = button.data('whatever'); // Extract info from data-* attributes
                // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
                // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
                let modal = $(this);
                modal.find('.modal-title').html($(self.options.parentViewEl).find('h3.box-title').html());
                modal.find('.modal-body').html(tabView[tabName].getModalForm());

                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    if (tabName === 'project_volunteer') {
                        let formData = $.unserialize(modal.find('form').serialize());
                        let selectedModels = tabView[tabName].backgrid.getSelectedModels();
                        let volunteerIDs = _.map(selectedModels, function (model) {
                            return model.get(model.idAttribute);
                        });
                        // Can't be VolunteerID or backbone will flag as an update instead of create
                        formData.VolunteerIDs = volunteerIDs;

                        tabView[tabName].create(formData);
                    } else {
                        tabView[tabName].create($.unserialize(modal.find('form').serialize()));
                    }

                    $('#sia-modal').modal('hide');
                });

            });
            $('#sia-modal').modal('show');

        },
        toggleDeleteBtn: function (e) {
            let toggle = e.toggle;
            let tab = e.tab;
            _log('App.Views.ProjectTabsGridManagerContainerToolbar.toggleDeleteBtn.event', e.toggle, e.tab, e);
            if (toggle === 'disable') {
                this.$el.find('.' + tab + '.tabButtonPane .btnTabDeleteChecked').addClass('disabled');
            } else {
                this.$el.find('.' + tab + '.tabButtonPane .btnTabDeleteChecked').removeClass('disabled');
            }

        },
        deleteCheckedRows: function (e) {
            let tabName = $(e.target).parents('.tabButtonPane').data('tab-name');

            if ($(e.target).hasClass('disabled')) {
                try {
                    let tabTxt = $('[href="#' + tabName + '"]').html()
                } catch (e) {
                    let tabTxt = tabName;
                }
                growl('Please check a box to delete items from the ' + tabTxt + ' tab.');
                return;
            }

            let tabView = _.find(this.parentChildViews, function (val) {
                return _.has(val, tabName)
            });
            let selectedModels = tabView[tabName].backgrid.getSelectedModels();
            // clear or else the previously selected models remain as undefined
            try {
                tabView[tabName].backgrid.clearSelectedModels();
            } catch (e) {
            }
            let modelIDs = _.map(selectedModels, function (model) {
                return model.get(model.idAttribute);
            });

            tabView[tabName].destroy({deleteModelIDs: modelIDs});
        },
        clearStoredColumnState(e) {
            e.preventDefault();
            let tabName = $(e.target).parents('.tabButtonPane').data('tab-name');
            growl('Resetting ' + tabName + ' columns. Please wait while the page refreshes.', 'success');
            localStorage.removeItem('backgrid-colmgr-site-project-tab-' + tabName);
            location.reload();
        }
    });

    App.Views.SiteProjectTabs = Backbone.View.extend({
        projectContactsViewClass: App.Views.ProjectContact,
        projectVolunteersViewClass: App.Views.ProjectVolunteer,
        projectLeadsViewClass: App.Views.ProjectLead,
        projectBudgetViewClass: App.Views.Budget,
        initialize: function (options) {
            this.options = options;
            this.childViews = [];
            _.bindAll(this, 'render', 'removeChildViews', 'updateProjectTabViewTitle', 'remove', 'notifyProjectTabToolbar', 'fetchIfNewProjectID','toggleProductTabsBox');
            // this.model is App.Models.projectModel
            this.listenTo(this.model, "change", this.fetchIfNewProjectID);
            this.listenTo(App.Views.siteYearsDropDownView, 'toggle-product-tabs-box', this.toggleProductTabsBox);
        },
        events: {
            'shown.bs.tab a[data-toggle="tab"]': 'notifyProjectTabToolbar',
            'clear-child-views': 'removeChildViews'
        },
        render: function () {
            let self = this;
            App.Views.projectLeadsView = this.projectLeadsView = new this.projectLeadsViewClass({
                el: this.$('.project-leads-backgrid-wrapper'),
                mainAppEl: this.options.mainAppEl,
                tab: 'project_lead',
                parentViewEl: this.el,
                collection: App.PageableCollections.projectLeadsCollection,
                columnCollectionDefinitions: App.Vars.volunteerLeadsBackgridColumnDefinitions,
                hideCellCnt: 0//8
            });
            this.childViews.push({project_lead: this.projectLeadsView});

            App.Views.projectBudgetView = this.projectBudgetView = new this.projectBudgetViewClass({
                el: this.$('.project-budget-backgrid-wrapper'),
                mainAppEl: this.options.mainAppEl,
                tab: 'project_budget',
                parentViewEl: this.el,
                collection: App.PageableCollections.projectBudgetsCollection,
                columnCollectionDefinitions: App.Vars.BudgetsBackgridColumnDefinitions,
                hideCellCnt: 0//1
            });
            this.childViews.push({project_budget: this.projectBudgetView});

            App.Views.projectContactsView = this.projectContactsView = new this.projectContactsViewClass({
                el: this.$('.project-contacts-backgrid-wrapper'),
                tab: 'project_contact',
                mainAppEl: this.options.mainAppEl,
                parentViewEl: this.el,
                collection: App.PageableCollections.projectContactsCollection,
                columnCollectionDefinitions: App.Vars.projectContactsBackgridColumnDefinitions,
                hideCellCnt: 0//2
            });
            this.childViews.push({project_contact: this.projectContactsView});

            App.Views.projectVolunteersView = this.projectVolunteersView = new this.projectVolunteersViewClass({
                el: this.$('.project-volunteers-backgrid-wrapper'),
                tab: 'project_volunteer',
                parentViewEl: this.el,
                mainAppEl: this.options.mainAppEl,
                collection: App.PageableCollections.projectVolunteersCollection,
                columnCollectionDefinitions: App.Vars.volunteersBackgridColumnDefinitions,
                hideCellCnt: 0//8
            });
            this.childViews.push({project_volunteer: this.projectVolunteersView});

            /**
             * Handles the buttons below the tabbed grids
             */
            App.Views.projectTabsGridManagerContainerToolbarView = this.projectTabsGridManagerContainerToolbarView = new App.Views.ProjectTabsGridManagerContainerToolbar({
                parentViewEl: this.el,
                el: '.project-tabs-grid-manager-container',
                parentChildViews: this.childViews
            });

            this.projectTabsGridManagerContainerToolbarView.render();
            this.projectLeadsView.render();
            this.projectBudgetView.render();
            this.projectContactsView.render();
            this.projectVolunteersView.render();
            let titleDescription = App.Views.projectsView.collection.length === 0 ? 'No projects created yet.' : this.model.get('ProjectDescription');
            $(this.options.mainAppEl).find('h3.box-title small').html(titleDescription);
            _log('App.Views.SiteProjectTabs.render', 'set tabs project title to:' + titleDescription, 'setting data-project-id to ' + this.model.get('ProjectID') + ' on', this.$el);
            this.$el.data('project-id', this.model.get('ProjectID'));
            window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
            self.toggleProductTabsBox();

            return this;
        },
        toggleProductTabsBox: function () {
            let self = this;
            _log('App.Views.SiteProjectTabs.toggleProductTabsBox', 'App.Views.projectsView.collection.length:'+ App.Views.projectsView.collection.length);
            if (App.Views.projectsView.collection.length === 0) {
                if (!self.$el.hasClass('collapsed-box')) {
                    self.$el.find('.btn-box-tool').trigger('click');
                }
                self.$el.find('.btn-box-tool').hide();
                $(this.options.mainAppEl).find('h3.box-title small').html('No projects created yet.');
            } else {
                self.$el.find('.btn-box-tool').show();

                if (self.$el.hasClass('collapsed-box')) {
                    self.$el.find('.btn-box-tool').trigger('click');
                    self.$el.removeClass('collapsed-box')
                }
            }
        },
        /**
         * Rebuild the Project Tabs if the project has changed
         * @returns {App.Views.SiteProjectTabs}
         */
        fetchIfNewProjectID: function () {
            var self = this;
            if (this.model.hasChanged('ProjectID')) {
                _log('App.Views.SiteProjectTabs.fetchIfNewProjectID.event', 'ProjectID has changed. Fetching new data for tab collections.', this.model.get('ProjectID'));
                let ProjectID = this.model.get('ProjectID');
                App.PageableCollections.projectLeadsCollection.url = '/admin/project/project_leads/' + ProjectID;
                App.PageableCollections.projectBudgetsCollection.url = '/admin/project/budgets/' + ProjectID;
                App.PageableCollections.projectContactsCollection.url = '/admin/project/contacts/' + ProjectID;
                App.PageableCollections.projectVolunteersCollection.url = '/admin/project/volunteers/' + ProjectID;

                $.when(
                    App.PageableCollections.projectLeadsCollection.fetch({reset: true}),
                    App.PageableCollections.projectBudgetsCollection.fetch({reset: true}),
                    App.PageableCollections.projectContactsCollection.fetch({reset: true}),
                    App.PageableCollections.projectVolunteersCollection.fetch({reset: true})
                ).then(function () {
                    //initialize your views here
                    _log('App.Views.SiteProjectTabs.fetchIfNewProjectID.event', 'tab collections fetch promise done');
                    $(self.options.mainAppEl).find('h3.box-title small').html(self.model.get('ProjectDescription'));
                    window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
                });
                _log('App.Views.SiteProjectTabs.fetchIfNewProjectID.event', 'setting data-project-id to ' + this.model.get('ProjectID') + ' on', this.$el);
                this.$el.data('project-id', this.model.get('ProjectID'));
            } else {
                _log('App.Views.SiteProjectTabs.fetchIfNewProjectID.event', 'fetchIfNewProjectID has not changed', this.model.get('ProjectID'));
            }
            return this;
        },
        /**
         * Not called anywhere anymore...
         * @param ProjectID
         */
        updateProjectTabViewTitle: function (ProjectID) {
            let self = this;
            _log('App.Views.SiteProjectTabs.updateProjectTabViewTitle', 'update project tabs title', ProjectID);
            if (typeof ProjectID === 'string') {
                let currentProjectModel = self.collection.findWhere({ProjectID: parseInt(ProjectID)});
                $(self.options.mainAppEl).find('.site-projects-tabs .box-title small').html(currentProjectModel.get('ProjectDescription'))
            }
        },
        removeChildViews: function () {
            //console.log('App.Views.SiteProjectTabs removeChildViews ');
            _.each(this.childViews, function (view) {
                view.remove();
            });
            _log('App.Views.SiteProjectTabs.removeChildViews.event', 'trigger removed-child-views');
            this.trigger('removed-child-views');
        },
        notifyProjectTabToolbar: function (e) {
            let clickedTab = $(e.currentTarget).attr('aria-controls');
            _log('App.Views.SiteProjectTabs.notifyProjectTabToolbar.event', 'trigger tab-toggled');
            this.trigger('tab-toggled', {data: clickedTab});
        }
    });
})(window.App);
