(function (App) {
    App.Views.ProjectTabsGridManagerContainerToolbar = Backbone.View.extend({
        template: template('projectTabsGridManagerContainerToolbarsTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(self, 'toggleProjectTabToolbars', 'addGridRow', 'deleteCheckedRows', 'clearStoredColumnState', 'toggleDeleteBtn');
            self.options = options;
            self.parentChildViews = self.options.parentChildViews;
            self.parentView = self.options.parentView;
            self.projectsView = self.options.parentView.projectsView;
            self.tabs = this.parentView.$('.nav-tabs [role="tab"]');
            self.childViews = [];
            self.listenTo(self.parentView, 'cleared-child-views', function () {
                self.remove();
            });
            self.listenTo(self.parentView, 'toggle-delete-btn', function (e) {
                self.toggleDeleteBtn(e);
            });
            self.listenTo(self.parentView, 'tab-toggled', this.toggleProjectTabToolbars);

        },
        events: {
            'click .btnTabAdd': 'addGridRow',
            'click .btnTabDeleteChecked': 'deleteCheckedRows',
            'click .btnTabClearStored': 'clearStoredColumnState'
        },
        close: function () {
            this.remove();
            // handle other unbinding needs, here
            _.each(this.childViews, function (childView) {
                if (childView.close) {
                    try {
                        childView.close();
                    } catch (e) {
                    }
                } else if (childView.remove) {
                    try {
                        childView.remove();
                    } catch (e) {
                    }
                }
            })
        },
        render: function () {
            let self = this;
            self.$el.empty();
            self.tabs.each(function (idx, el) {
                let tabName = $(el).attr('aria-controls');
                let tabButtonLabel = $(el).text();
                self.$el.append(self.template({TabName: tabName, btnLabel: tabButtonLabel}));

                if (idx === 0) {
                    self.$('.tabButtonPane.' + tabName).show()
                }
            });
            if (!App.Vars.Auth.bCanAddProjectTabModel) {
                this.$el.find('.btnTabAdd').hide();
            }
            if (!App.Vars.Auth.bCanDeleteProjectTabModel) {
                this.$el.find('.btnTabDeleteChecked').hide();
            }
            return self;
        },
        toggleProjectTabToolbars: function (e) {
            let self = this;
            let clickedTab = e.data;
            //App.Vars.currentTabModels[clickedTab]
            this.$el.find('.tabButtonPane').hide();
            this.$el.find('.' + clickedTab + '.tabButtonPane').show();
            // Hack to force grid columns to work
            $('body').trigger('resize');
            //$(e.target).parents('.tabButtonPane').data('tab-name')

            try {
                self.projectsView.setViewDataStoreValue('current-tab',clickedTab);
            } catch (e) {
                console.error(e)
            }
        },
        getTabView: function (tabName) {
            let self = this;
            return _.find(self.parentChildViews, function (val) {
                return _.has(val, tabName)
            });
        },
        addGridRow: function (e) {
            let self = this;
            let tabName = $(e.target).parents('.tabButtonPane').data('tab-name');
            let tabView = self.getTabView(tabName);

            _log('App.Views.ProjectTabsGridManagerContainerToolbar.addGridRow', e, tabName, tabView);

            $('#sia-modal').one('show.bs.modal', function (event) {
                let $fileInput = null;
                let button = $(event.relatedTarget); // Button that triggered the modal
                let recipient = button.data('whatever'); // Extract info from data-* attributes
                // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
                // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
                let modal = $(this);
                modal.find('.modal-title').html(self.parentView.$('h3.box-title').html());
                modal.find('.modal-body').html(tabView[tabName].getModalForm());
                if (tabName === 'project_attachment') {
                    let selfView = modal.find('form[name="newProjectAttachment"]');
                    let sAjaxFileUploadURL = '/admin/project_attachment/upload';
                    $fileInput = $(selfView.find('input[type="file"]'));
                    $fileInput.fileupload({
                        url: sAjaxFileUploadURL,
                        dataType: 'json',
                        done: function (e, data) {
                            selfView.find('.file_progress').fadeTo(0, 'slow');
                            selfView.find('.files').val('');
                            selfView.find('.file_chosen').empty();
                            $.each(data.files, function (index, file) {
                                let sFileName = file.name;
                                let sExistingVal = selfView.find('.files').val().length > 0 ? selfView.find('.files').val() + ',' : '';
                                selfView.find('.files').val(sExistingVal + sFileName);
                                selfView.find('.file_chosen').append(sFileName + '<br>')
                            });
                            modal.find('.save.btn').trigger('click')
                        },
                        start: function (e) {
                            selfView.find('.file_progress').fadeTo('fast', 1);
                            selfView.find('.file_progress').find('.meter').removeClass('green');
                        },
                        progress: function (e, data) {
                            let progress = parseInt(data.loaded / data.total * 100, 10);
                            selfView.find('.file_progress .meter').addClass('green').css(
                                'width',
                                progress + '%'
                            ).find('p').html(progress + '%');
                        }
                    }).prop('disabled', !$.support.fileInput)
                        .parent().addClass($.support.fileInput ? undefined : 'disabled');
                }
                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    if (tabName === 'project_volunteer') {
                        let formData = $.unserialize(modal.find('form').serialize());
                        let selectedModels = tabView[tabName].modalBackgrid.getSelectedModels();
                        tabView[tabName].modalBackgrid.clearSelectedModels();
                        let volunteerIDs = _.map(selectedModels, function (model) {
                            return model.get('VolunteerID');
                        });
                        // Can't be VolunteerID or backbone will flag as an update instead of create
                        formData.VolunteerIDs = volunteerIDs;
                        tabView[tabName].create(formData);
                    } else {
                        tabView[tabName].create($.unserialize(modal.find('form').serialize()));
                    }
                    if (tabName === 'project_attachment') {
                        try {
                            $fileInput.fileupload('destroy');
                        } catch (e) {
                        }
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
        projectAttachmentsViewClass: App.Views.ProjectAttachment,
        initialize: function (options) {
            let self = this;
            self.options = options;
            self.mainApp = self.options.mainApp;
            self.parentView = self.options.parentView;
            self.projectsView = self.options.projectsView;
            self.childTabViews = [];
            self.childViews = [];
            self.ajaxWaitingTargetClassSelector = '.tabs-content-container';
            _.bindAll(self, 'render', 'removeChildViews',  'remove', 'notifyProjectTabToolbar', 'fetchIfNewProjectID', 'toggleProductTabsBox');
            // this.model is App.Models.projectModel
            this.listenTo(self.model, "change", self.fetchIfNewProjectID);
            this.listenTo(self.projectsView, 'toggle-project-tabs-box', self.toggleProductTabsBox);
        },
        events: {
            'shown.bs.tab a[data-toggle="tab"]': 'notifyProjectTabToolbar',
            'clear-child-views': 'removeChildViews'
        },

        render: function () {
            let self = this;

            /**
             * Handles the buttons below the tabbed grids
             */
            this.projectTabsGridManagerContainerToolbarView = new App.Views.ProjectTabsGridManagerContainerToolbar({
                parentView: this,
                el: this.parentView.$('.project-tabs-grid-manager-container'),
                parentChildViews: this.childTabViews
            });

            this.projectLeadsView = new this.projectLeadsViewClass({
                el: this.$('.project-leads-backgrid-wrapper'),
                viewName: 'project-leads',
                tab: 'project_lead',
                collection: App.PageableCollections.projectLeadsCollection,
                model: App.Vars.currentTabModels['project_lead'],
                columnCollectionDefinitions: App.Vars.volunteerLeadsBackgridColumnDefinitions,
                hideCellCnt: 0,//8,
                currentModelIDDataStoreSelector: '#project_lead',
                parentView: this,
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                backgridWrapperClassSelector: '.project-leads-backgrid-wrapper',
                gridManagerContainerToolbarClassName: 'project-tabs-grid-manager-container',
                modelNameLabel: 'Project Leads',
                mainApp: self.mainApp

            });
            this.childTabViews.push({project_lead: this.projectLeadsView});

            this.projectBudgetView = new this.projectBudgetViewClass({
                el: this.$('.project-budgets-backgrid-wrapper'),
                viewName: 'project-budgets',
                tab: 'project_budget',
                collection: App.PageableCollections.projectBudgetsCollection,
                model: App.Vars.currentTabModels['project_budget'],
                columnCollectionDefinitions: App.Vars.BudgetsBackgridColumnDefinitions,
                hideCellCnt: 0,
                currentModelIDDataStoreSelector: '#project_budget',
                parentView: self,
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                backgridWrapperClassSelector: '.project-budgets-backgrid-wrapper',
                gridManagerContainerToolbarClassName: 'project-tabs-grid-manager-container',
                modelNameLabel: 'Project Budget',
                mainApp: self.mainApp
            });
            this.childTabViews.push({project_budget: this.projectBudgetView});

            this.projectContactsView = new this.projectContactsViewClass({
                el: this.$('.project-contacts-backgrid-wrapper'),
                viewName: 'project-contacts',
                tab: 'project_contact',
                collection: App.PageableCollections.projectContactsCollection,
                model: App.Vars.currentTabModels['project_contact'],
                columnCollectionDefinitions: App.Vars.projectContactsBackgridColumnDefinitions,
                hideCellCnt: 0,
                currentModelIDDataStoreSelector: '#project_contact',
                parentView: self,
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                backgridWrapperClassSelector: '.project-contacts-backgrid-wrapper',
                gridManagerContainerToolbarClassName: 'project-tabs-grid-manager-container',
                modelNameLabel: 'Project Contact',
                mainApp: self.mainApp
            });
            this.childTabViews.push({project_contact: this.projectContactsView});

            this.projectVolunteersView = new this.projectVolunteersViewClass({
                el: this.$('.project-volunteers-backgrid-wrapper'),
                viewName: 'project-volunteers',
                tab: 'project_volunteer',
                collection: App.PageableCollections.projectVolunteersCollection,
                model: App.Vars.currentTabModels['project_volunteer'],
                columnCollectionDefinitions: App.Vars.projectVolunteersBackgridColumnDefinitions,
                hideCellCnt: 0,
                currentModelIDDataStoreSelector: '#project_volunteer',
                parentView: self,
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                backgridWrapperClassSelector: '.project-volunteers-backgrid-wrapper',
                gridManagerContainerToolbarClassName: 'project-tabs-grid-manager-container',
                modelNameLabel: 'Project Volunteer',
                mainApp: self.mainApp
            });
            this.childTabViews.push({project_volunteer: this.projectVolunteersView});

            this.projectAttachmentsView = new this.projectAttachmentsViewClass({
                el: this.$('.project-attachments-backgrid-wrapper'),
                tab: 'project_attachment',
                viewName: 'project-attachments',
                collection: App.PageableCollections.projectAttachmentsCollection,
                model: App.Vars.currentTabModels['project_attachment'],
                columnCollectionDefinitions: App.Vars.ProjectAttachmentsBackgridColumnDefinitions,
                hideCellCnt: 0,
                currentModelIDDataStoreSelector: '#project_attachment',
                parentView: self,
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                backgridWrapperClassSelector: '.project-attachments-backgrid-wrapper',
                gridManagerContainerToolbarClassName: 'project-tabs-grid-manager-container',
                modelNameLabel: 'Project Attachment',
                mainApp: self.mainApp
            });
            this.childTabViews.push({project_attachment: this.projectAttachmentsView});

            this.childViews = _.values(this.childTabViews);
            this.childViews.push(this.projectTabsGridManagerContainerToolbarView);
            this.projectTabsGridManagerContainerToolbarView.render();
            this.projectLeadsView.render();
            this.projectBudgetView.render();
            this.projectContactsView.render();
            this.projectVolunteersView.render();
            this.projectAttachmentsView.render();
            let titleDescription = self.projectsView.collection.length === 0 ? 'No projects created yet.' : this.model.get('ProjectDescription');
            self.mainApp.$('h3.box-title small').html(titleDescription);
            _log('App.Views.SiteProjectTabs.render', 'set tabs project title to:' + titleDescription, 'setting data-project-id to ' + this.model.get('ProjectID') + ' on', this.$el);
            this.$el.data('project-id', this.model.get('ProjectID'));
            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            self.toggleProductTabsBox();

            return this;
        },
        toggleProductTabsBox: function () {
            let self = this;
            _log('App.Views.SiteProjectTabs.toggleProductTabsBox', 'App.Views.projectsView.collection.length:' + self.projectsView.collection.length);
            if (self.projectsView.collection.length === 0) {
                if (!self.$el.hasClass('collapsed-box')) {
                    self.$el.find('.btn-box-tool').trigger('click');
                }
                self.$el.find('.btn-box-tool').hide();
                self.mainApp.$('h3.box-title small').html('No projects created yet.');
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
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                _log('App.Views.SiteProjectTabs.fetchIfNewProjectID.event', 'ProjectID has changed. Fetching new data for tab collections.', this.model.get('ProjectID'));
                let ProjectID = this.model.get('ProjectID');
                App.PageableCollections.projectLeadsCollection.url = '/admin/project/project_leads/' + ProjectID;
                App.PageableCollections.projectBudgetsCollection.url = '/admin/project/budgets/' + ProjectID;
                App.PageableCollections.projectContactsCollection.url = '/admin/project/contacts/' + ProjectID;
                App.PageableCollections.projectVolunteersCollection.url = '/admin/project/volunteers/' + ProjectID;
                App.PageableCollections.projectAttachmentsCollection.url = '/admin/project/project_attachment/' + ProjectID;
                self.mainApp.$('h3.box-title small').html('Updating Tabs. Please wait...');
                $.when(
                    App.PageableCollections.projectLeadsCollection.fetch({reset: true, success: self.tabFetchSuccess}),
                    App.PageableCollections.projectBudgetsCollection.fetch({reset: true, success: self.tabFetchSuccess}),
                    App.PageableCollections.projectContactsCollection.fetch({reset: true, success: self.tabFetchSuccess}),
                    App.PageableCollections.projectVolunteersCollection.fetch({reset: true, success: self.tabFetchSuccess}),
                    App.PageableCollections.projectAttachmentsCollection.fetch({reset: true, success: self.tabFetchSuccess})
                ).then(function () {
                    //initialize your views here
                    _log('App.Views.SiteProjectTabs.fetchIfNewProjectID.event', 'tab collections fetch promise done');
                    self.mainApp.$('h3.box-title small').html(self.model.get('ProjectDescription'));
                    // DO NOT RE-Render or duplicate data and events start up
                    // self.projectLeadsView.render();
                    // self.projectBudgetView.render();
                    // self.projectContactsView.render();
                    // self.projectVolunteersView.render();
                    // self.projectAttachmentsView.render();
                    window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                });
                _log('App.Views.SiteProjectTabs.fetchIfNewProjectID.event', 'setting data-project-id to ' + this.model.get('ProjectID') + ' on', this.$el);
                this.$el.data('project-id', this.model.get('ProjectID'));
            } else {
                _log('App.Views.SiteProjectTabs.fetchIfNewProjectID.event', 'fetchIfNewProjectID has not changed', this.model.get('ProjectID'));
            }
            return this;
        },
        tabFetchSuccess: function (model, response, options) {
            //console.log('tabFetchSuccess',model, response, options)
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
