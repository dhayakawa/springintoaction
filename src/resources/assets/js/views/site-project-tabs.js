(function (App) {
    App.Views.ProjectTabsGridManagerContainerToolbar = Backbone.View.extend({
        template: template('projectTabsGridManagerContainerToolbarsTemplate'),
        initialize: function (options) {
            let self = this;
            this.parentChildViews = options.parentChildViews;
            _.bindAll(this, 'toggleProjectTabToolbars', 'addGridRow', 'deleteCheckedRows', 'clearStoredColumnState');
            this.options = options;
            this.tabs = $(self.options.parentViewEl).find('.nav-tabs [role="tab"]');
            this.listenTo(App.Views.siteProjectTabsView, 'cleared-child-views', function () {
                self.remove();
            });
            this.listenTo(App.Views.siteProjectTabsView, 'tab-toggled', this.toggleProjectTabToolbars);
        },
        events: {
            'click .btnTabAdd': 'addGridRow',
            'click .btnTabDeleteChecked': 'deleteCheckedRows',
            'click .btnTabClearStored': 'clearStoredColumnState',
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
                    if (tabName === 'volunteer') {
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
        deleteCheckedRows: function (e) {
            let tabName = $(e.target).parents('.tabButtonPane').data('tab-name');
            let tabView = _.find(this.parentChildViews, function (val) {
                return _.has(val, tabName)
            });
            let selectedModels = tabView[tabName].backgrid.getSelectedModels();
            // clear or else the previously selected models remain as undefined
            tabView[tabName].backgrid.clearSelectedModels();
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
        contactsViewClass: App.Views.Contact,
        volunteersViewClass: App.Views.Volunteer,
        projectLeadsViewClass: App.Views.ProjectLead,
        budgetViewClass: App.Views.Budget,
        initialize: function (options) {
            this.options = options;
            this.childViews = [];
            _.bindAll(this, 'render', 'removeChildViews', 'updateProjectTabViewTitle', 'remove', 'notifyProjectTabToolbar', 'fetchIfNewProjectID');
            // this.model is App.Models.projectModel
            this.listenTo(this.model, "change", this.fetchIfNewProjectID);
        },
        events: {
            'shown.bs.tab a[data-toggle="tab"]': 'notifyProjectTabToolbar',
            'clear-child-views': 'removeChildViews'
        },
        render: function () {
            /**
             * Handles the buttons below the tabbed grids
             */
            App.Views.contactsView = this.contactsView = new this.contactsViewClass({
                el: this.$('.project-contacts-backgrid-wrapper'),
                tab: 'contact',
                mainAppEl: this.options.mainAppEl,
                parentViewEl: this.el,
                collection: App.PageableCollections.contactsCollection,
                columnCollectionDefinitions: App.Vars.ContactsBackgridColumnDefinitions,
                hideCellCnt: 0//2
            });
            this.childViews.push({contact: this.contactsView});


            App.Views.volunteersView = this.volunteersView = new this.volunteersViewClass({
                el: this.$('.project-volunteers-backgrid-wrapper'),
                tab: 'volunteer',
                parentViewEl: this.el,
                mainAppEl: this.options.mainAppEl,
                collection: App.PageableCollections.volunteersCollection,
                columnCollectionDefinitions: App.Vars.volunteersBackgridColumnDefinitions,
                hideCellCnt: 0//8
            });
            this.childViews.push({volunteer: this.volunteersView});


            App.Views.projectLeadView = this.projectLeadView = new this.projectLeadsViewClass({
                el: this.$('.project-leads-backgrid-wrapper'),
                mainAppEl: this.options.mainAppEl,
                tab: 'project_lead',
                parentViewEl: this.el,
                collection: App.PageableCollections.projectLeadCollection,
                columnCollectionDefinitions: App.Vars.volunteersBackgridColumnDefinitions,
                hideCellCnt: 0//8
            });
            this.childViews.push({project_lead: this.projectLeadView});


            App.Views.budgetView = this.budgetView = new this.budgetViewClass({
                el: this.$('.project-budget-backgrid-wrapper'),
                mainAppEl: this.options.mainAppEl,
                tab: 'budget',
                parentViewEl: this.el,
                collection: App.PageableCollections.budgetCollection,
                columnCollectionDefinitions: App.Vars.BudgetsBackgridColumnDefinitions,
                hideCellCnt: 0//1
            });
            this.childViews.push({budget: this.budgetView});

            App.Views.projectTabsGridManagerContainerToolbarView = this.projectTabsGridManagerContainerToolbarView = new App.Views.ProjectTabsGridManagerContainerToolbar({
                parentViewEl: this.el,
                el: '.project-tabs-grid-manager-container',
                parentChildViews: this.childViews
            });

            this.projectTabsGridManagerContainerToolbarView.render();
            this.contactsView.render();
            this.volunteersView.render();
            this.projectLeadView.render();
            this.budgetView.render();

            $(this.options.mainAppEl).find('h3.box-title small').html(this.model.get('ProjectDescription'));
            _log('App.Views.SiteProjectTabs.render', 'set tabs project title to:' + this.model.get('ProjectDescription'), 'setting data-project-id to ' + this.model.get('ProjectID') + ' on', this.$el);
            this.$el.data('project-id', this.model.get('ProjectID'));
            window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');

            return this;
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
                App.PageableCollections.contactsCollection.url = 'project/contact/' + ProjectID;
                //App.PageableCollections.contactsCollection.fetch({reset: true});
                App.PageableCollections.volunteersCollection.url = 'project/volunteers/' + ProjectID;
                //App.PageableCollections.volunteersCollection.fetch({reset: true});
                App.PageableCollections.projectLeadCollection.url = 'project/project_leads/' + ProjectID;
                //App.PageableCollections.projectLeadCollection.fetch({reset: true});
                App.PageableCollections.budgetCollection.url = 'project/budget/' + ProjectID;
                //App.PageableCollections.budgetCollection.fetch({reset: true});
                $.when(
                    App.PageableCollections.contactsCollection.fetch({reset: true}),
                    App.PageableCollections.volunteersCollection.fetch({reset: true}),
                    App.PageableCollections.projectLeadCollection.fetch({reset: true}),
                    App.PageableCollections.budgetCollection.fetch({reset: true})
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
            this.trigger('removed-child-views');
        },
        remove: function () {
            _log('App.Views.SiteProjectTabs.remove', 'remove stub');
            //this.$el.remove();  // 4. Calling Jquery remove function to remove that HTML li tag element..
        },
        notifyProjectTabToolbar: function (e) {
            let clickedTab = $(e.currentTarget).attr('aria-controls');
            this.trigger('tab-toggled', {data: clickedTab});
        }
    });
})(window.App);
