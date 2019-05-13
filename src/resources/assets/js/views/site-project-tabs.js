(function (App) {
    App.Views.ProjectTabsGridManagerContainerToolbar = Backbone.View.extend({
        template: template('projectTabsGridManagerContainerToolbarsTemplate'),
        initialize: function (options) {
            let self = this;
            this.parentChildViews = options.parentChildViews;
            _.bindAll(this, 'toggleProjectTabToolbars', 'addGridRow', 'deleteCheckedRows', 'clearStoredColumnState', 'toggleDeleteBtn');
            this.options = options;
            this.parentView = this.options.parentView;
            this.tabs = this.parentView.$('.nav-tabs [role="tab"]');
            this.childViews = [];
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
                self.getTabView(clickedTab)[clickedTab].updateProjectTabView(e);
            } catch (e) {
                console.log(e)
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
            this.options = options;
            this.mainApp = this.options.mainApp;
            this.parentView = this.options.parentView;
            this.options.mainAppEl = this.mainApp.el;
            this.childTabViews = [];
            this.childViews = [];
            _.bindAll(this, 'render', 'removeChildViews', 'updateProjectTabViewTitle', 'remove', 'notifyProjectTabToolbar', 'fetchIfNewProjectID', 'toggleProductTabsBox');
            // this.model is App.Models.projectModel
            this.listenTo(this.model, "change", this.fetchIfNewProjectID);
            this.listenTo(App.Views.projectsView, 'toggle-project-tabs-box', this.toggleProductTabsBox);
        },
        events: {
            'shown.bs.tab a[data-toggle="tab"]': 'notifyProjectTabToolbar',
            'clear-child-views': 'removeChildViews'
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
            App.Views.projectLeadsView = this.projectLeadsView = new this.projectLeadsViewClass({
                el: this.$('.project-leads-backgrid-wrapper'),
                mainAppEl: this.mainApp.el,
                tab: 'project_lead',
                parentViewEl: this.el,
                collection: App.PageableCollections.projectLeadsCollection,
                columnCollectionDefinitions: App.Vars.volunteerLeadsBackgridColumnDefinitions,
                hideCellCnt: 0//8
            });
            this.childTabViews.push({project_lead: this.projectLeadsView});

            App.Views.projectBudgetView = this.projectBudgetView = new this.projectBudgetViewClass({
                el: this.$('.project-budget-backgrid-wrapper'),
                mainAppEl: this.mainApp.el,
                tab: 'project_budget',
                parentViewEl: this.el,
                collection: App.PageableCollections.projectBudgetsCollection,
                columnCollectionDefinitions: App.Vars.BudgetsBackgridColumnDefinitions,
                hideCellCnt: 0//1
            });
            this.childTabViews.push({project_budget: this.projectBudgetView});

            App.Views.projectContactsView = this.projectContactsView = new this.projectContactsViewClass({
                el: this.$('.project-contacts-backgrid-wrapper'),
                tab: 'project_contact',
                mainAppEl: this.mainApp.el,
                parentViewEl: this.el,
                collection: App.PageableCollections.projectContactsCollection,
                columnCollectionDefinitions: App.Vars.projectContactsBackgridColumnDefinitions,
                hideCellCnt: 0//2
            });
            this.childTabViews.push({project_contact: this.projectContactsView});

            App.Views.projectVolunteersView = this.projectVolunteersView = new this.projectVolunteersViewClass({
                el: this.$('.project-volunteers-backgrid-wrapper'),
                tab: 'project_volunteer',
                parentViewEl: this.el,
                mainAppEl: this.mainApp.el,
                collection: App.PageableCollections.projectVolunteersCollection,
                columnCollectionDefinitions: App.Vars.projectVolunteersBackgridColumnDefinitions,
                hideCellCnt: 0//8
            });
            this.childTabViews.push({project_volunteer: this.projectVolunteersView});

            App.Views.projectAttachmentsView = this.projectAttachmentsView = new this.projectAttachmentsViewClass({
                el: this.$('.project-attachments-backgrid-wrapper'),
                tab: 'project_attachment',
                parentViewEl: this.el,
                mainAppEl: this.mainApp.el,
                collection: App.PageableCollections.projectAttachmentsCollection,
                columnCollectionDefinitions: App.Vars.ProjectAttachmentsBackgridColumnDefinitions,
                hideCellCnt: 0//8
            });
            this.childTabViews.push({project_attachment: this.projectAttachmentsView});

            /**
             * Handles the buttons below the tabbed grids
             */
            App.Views.projectTabsGridManagerContainerToolbarView = this.projectTabsGridManagerContainerToolbarView = new App.Views.ProjectTabsGridManagerContainerToolbar({
                parentView: this,
                el: this.parentView.$('.project-tabs-grid-manager-container'),
                parentChildViews: this.childTabViews
            });
            this.childViews = _.values(this.childTabViews);
            this.childViews.push(this.projectTabsGridManagerContainerToolbarView);
            this.projectTabsGridManagerContainerToolbarView.render();
            this.projectLeadsView.render();
            this.projectBudgetView.render();
            this.projectContactsView.render();
            this.projectVolunteersView.render();
            this.projectAttachmentsView.render();
            let titleDescription = App.Views.projectsView.collection.length === 0 ? 'No projects created yet.' : this.model.get('ProjectDescription');
            self.mainApp.$('h3.box-title small').html(titleDescription);
            _log('App.Views.SiteProjectTabs.render', 'set tabs project title to:' + titleDescription, 'setting data-project-id to ' + this.model.get('ProjectID') + ' on', this.$el);
            this.$el.data('project-id', this.model.get('ProjectID'));
            window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
            self.toggleProductTabsBox();

            return this;
        },
        toggleProductTabsBox: function () {
            let self = this;
            _log('App.Views.SiteProjectTabs.toggleProductTabsBox', 'App.Views.projectsView.collection.length:' + App.Views.projectsView.collection.length);
            if (App.Views.projectsView.collection.length === 0) {
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
                _log('App.Views.SiteProjectTabs.fetchIfNewProjectID.event', 'ProjectID has changed. Fetching new data for tab collections.', this.model.get('ProjectID'));
                let ProjectID = this.model.get('ProjectID');
                App.PageableCollections.projectLeadsCollection.url = '/admin/project/project_leads/' + ProjectID;
                App.PageableCollections.projectBudgetsCollection.url = '/admin/project/budgets/' + ProjectID;
                App.PageableCollections.projectContactsCollection.url = '/admin/project/contacts/' + ProjectID;
                App.PageableCollections.projectVolunteersCollection.url = '/admin/project/volunteers/' + ProjectID;
                App.PageableCollections.projectAttachmentsCollection.url = '/admin/project/project_attachment/' + ProjectID;

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
                    window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
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
        /**
         * Not called anywhere anymore...
         * @param ProjectID
         */
        updateProjectTabViewTitle: function (ProjectID) {
            let self = this;
            _log('App.Views.SiteProjectTabs.updateProjectTabViewTitle', 'update project tabs title', ProjectID);
            if (typeof ProjectID === 'string') {
                let currentProjectModel = self.collection.findWhere({ProjectID: parseInt(ProjectID)});
                self.mainApp.$('.site-projects-tabs .box-title small').html(currentProjectModel.get('ProjectDescription'))
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
