(function (App) {
    App.Views.ProjectTab = Backbone.View.extend({
        initialize: function (options) {
            this.options = options;
            _.bindAll(this, 'render', 'update', 'updateProjectTabView', 'getModalForm', 'create', 'destroy','toggleDeleteBtn');
            this.rowBgColor = 'lightYellow';
            // apparently backgrid is managing the collection reset thing
            //this.collection.bind('reset', this.render, this);
            _log('App.Views.ProjectTab.initialize', options);
        },
        events: {
            'focusin tbody tr': 'updateProjectTabView'
        },
        render: function (e) {
            let self = this;
            this.hideCellCnt = this.options.hideCellCnt;
            this.$tabBtnPane = $(this.options.parentViewEl).find('.' + this.options.tab + '.tabButtonPane');
            this.$tabBtnPanePaginationContainer = this.$tabBtnPane.find('.tab-pagination-controls');
            this.model = App.Vars.currentTabModels[this.options.tab];
            this.columnCollectionDefinitions = this.options.columnCollectionDefinitions;

            this.columnCollection = new Backgrid.Extension.OrderableColumns.orderableColumnCollection(this.columnCollectionDefinitions);
            this.columnCollection.setPositions().sort();

            let Header = Backgrid.Extension.GroupedHeader;
            this.backgrid = new Backgrid.Grid({
                header: Header,
                columns: this.columnCollection,
                collection: this.collection
            });

            let initialColumnsVisible = this.columnCollectionDefinitions.length - this.hideCellCnt;
            let colManager = new Backgrid.Extension.ColumnManager(this.columnCollection, {
                initialColumnsVisible: initialColumnsVisible,
                trackSize: true,
                trackOrder: true,
                trackVisibility: true,
                saveState: true,
                saveStateKey: 'site-project-tab-' + this.options.tab,
                loadStateOnInit: true,
                stateChecking: "loose"
            });

            let colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                columnManager: colManager
            });
            _log('App.Views.ProjectTab.render', this.options.tab, $(this.options.parentViewEl), this.$tabBtnPane, _.isUndefined(e) ? 'no event passed in for this call.' : e);

            let $gridContainer = this.$el.html(this.backgrid.render().el);

            let paginator = new Backgrid.Extension.Paginator({
                collection: this.collection
            });

            // Render the paginator
            this.$tabBtnPanePaginationContainer.html(paginator.render().el);

            // Add sizeable columns
            let sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                collection: this.collection,
                columns: this.columnCollection,
                grid: this.backgrid
            });
            $gridContainer.find('thead').before(sizeAbleCol.render().el);

            // Add resize handlers
            let sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                sizeAbleColumns: sizeAbleCol,
                saveColumnWidth: true
            });
            $gridContainer.find('thead').before(sizeHandler.render().el);

            // Make columns reorderable
            let orderHandler = new Backgrid.Extension.OrderableColumns({
                grid: this.backgrid,
                sizeAbleColumns: sizeAbleCol
            });
            $gridContainer.find('thead').before(orderHandler.render().el);

            // since we're appending and not replacing we need to remove the last visibility control
            this.$tabBtnPane.find('.columnmanager-visibilitycontrol-container').html(colVisibilityControl.render().el);

            // When a backgrid cell's model is updated it will trigger a 'backgrid:edited' event which will bubble up to the backgrid's collection
            this.backgrid.collection.on('backgrid:edited', function (e) {
                self.update(e);
            });
            this.backgrid.collection.on('backgrid:selected', function (e) {
                self.toggleDeleteBtn(e);
            });

            _log('App.Views.ProjectTab.render', this.options.tab, 'Set the current model id on the tab so we can reference it in other views. this.model:', this.model);
            // Set the current model id on the tab so we can reference it in other views
            $('#' + this.options.tab).data('current-model-id', this.model.get(this.model.idAttribute));

            return this;
        },
        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        updateProjectTabView: function (e) {
            let self = this;
            let currentModelID = 0;
            // console.log(e)
            if (typeof e === 'object' && !_.isUndefined(e.target)) {
                let $TableRowElement = $(e.currentTarget);
                let $RadioElement = $TableRowElement.find('input[type="radio"][name="' + this.model.idAttribute + '"]');
                // click is only a visual indication that the row is selected. nothing should be listening for this click
                $RadioElement.trigger('click');
                currentModelID = $RadioElement.val();

                // Highlight row
                $TableRowElement.siblings().css('background-color', 'white');
                $TableRowElement.css('background-color', self.rowBgColor);

            }

            if (App.Vars.mainAppDoneLoading && currentModelID && $('#' + this.options.tab).data('current-model-id') != currentModelID) {
                // Refresh tabs on new row select
                this.model.url = '/admin/' + self.options.tab + '/' + currentModelID;
                this.model.fetch({reset: true});
            }

        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                let attributes = _.extend({[self.model.idAttribute]: currentModelID}, e.changed);
                _log('App.Views.ProjectTab.update', self.options.tab, e.changed, attributes, this.model);
                this.model.url = '/admin/' + self.options.tab + '/' + currentModelID;
                this.model.save(attributes ,
                    {
                        success: function (model, response, options) {
                            _log('App.Views.ProjectTab.update', self.options.tab + ' save', model, response, options);
                            growl(response.msg, response.success ? 'success' : 'error');
                        },
                        error: function (model, response, options) {
                            console.error('App.Views.ProjectTab.update', self.options.tab + ' save', model, response, options);
                            growl(response.msg, 'error')
                        }
                    });
            } else {
            }
        },
        create: function (attributes) {
            var self = this;
            _log('App.Views.ProjectTab.create', self.options.tab, attributes, this.model);
            this.model.url = '/admin/' + self.options.tab;
            this.model.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.collection.url = '/admin/' + self.options.tab + '/all/' + App.Models.projectModel.get(App.Models.projectModel.idAttribute);
                        window.ajaxWaiting('show', '.tab-content.backgrid-wrapper');

                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            _log('App.Views.ProjectTab.create.event', self.options.tab + ' collection fetch promise done');
                            window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error');
                        window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
                    }
                });
        },
        getModalForm: function () {
            return '';
        },
        toggleDeleteBtn: function (e) {
            var self = this;
            let selectedModels = self.backgrid.getSelectedModels();
            _log('App.Views.ProjectTab.toggleDeleteBtn.event', self.options.tab, selectedModels.length, e);
            let toggleState = selectedModels.length === 0 ? 'disable' : 'enable';
            App.Views.siteProjectTabsView.trigger('toggle-delete-btn', {toggle: toggleState, tab: self.options.tab});
        },
        destroy: function (attributes) {
            var self = this;

            bootbox.confirm("Do you really want to delete the checked " + self.options.tab + "s?", function (bConfirmed) {
                if (bConfirmed) {
                    attributes = _.extend(attributes, {
                        ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute),
                        ProjectRoleID: self.model.get('ProjectRoleID')
                    });
                    _log('App.Views.ProjectTab.destroy', self.options.tab, attributes);
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: '/admin/' + self.options.tab + '/batch/destroy',
                        data: attributes,
                        success: function (response) {
                            window.growl(response.msg, response.success ? 'success' : 'error');
                            self.collection.url = '/admin/' + self.options.tab + '/all/' + App.Models.projectModel.get(App.Models.projectModel.idAttribute);
                            self.collection.fetch({reset: true});
                        },
                        fail: function (response) {
                            window.growl(response.msg, 'error')
                        }
                    })
                }
            });

        }
    });
})(window.App);

(function (App) {
    App.Views.Budget = App.Views.ProjectTab.fullExtend({
        getModalForm: function () {
            let template = window.template('newBudgetTemplate');

            let tplVars = {
                ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute),
                budgetSourceOptions: App.Models.projectBudgetModel.getSourceOptions(true),
                statusOptions: App.Models.projectBudgetModel.getStatusOptions(true)
            };
            return template(tplVars);
        },
        create: function (attributes) {
            let self = this;
            let newModel = new App.Models.Budget();
            newModel.url = '/admin/' + this.options.tab;
            _log('App.Views.Budget.create', newModel.url, attributes);
            newModel.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.collection.url = '/admin/project/budget/' + App.Models.projectModel.get(App.Models.projectModel.idAttribute);
                        self.collection.fetch({reset:true});
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error')
                    }
                });
        }
    });
})(window.App);

(function (App) {
    App.Views.Contact = Backbone.View.extend({
        getModalForm: function () {
            let template = window.template('newContactTemplate');

            let tplVars = {
                SiteID: App.Models.siteModel.get(App.Models.siteModel.idAttribute),
                ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute)
            };
            return template(tplVars);
        }
    });
    App.Views.ProjectContact = App.Views.ProjectTab.fullExtend({
        getModalForm: function () {
            let template = window.template('newProjectContactTemplate');

            let siteContacts = App.Collections.contactsManagementCollection.where({SiteID: App.Vars.currentSiteID});
            let siteContactsCollection = new App.Collections.Contact(siteContacts);
            let contactsSelect = new App.Views.Select({
                el: '',
                attributes: {id: 'ContactID', name: 'ContactID', class: 'form-control'},
                buildHTML: true,
                collection: siteContactsCollection,
                optionValueModelAttrName: 'ContactID',
                optionLabelModelAttrName: ['LastName', 'FirstName', 'ContactType']
            });
            let tplVars = {
                SiteID: App.Models.siteModel.get(App.Models.siteModel.idAttribute),
                ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute),
                contactsSelect: contactsSelect.getHtml()
            };
            return template(tplVars);
        }
    });
})(window.App);

(function (App) {
    App.Views.ProjectLead = App.Views.ProjectTab.fullExtend({
        getModalForm: function () {
            let template = window.template('newProjectLeadTemplate');

            let volunteerSelect = new App.Views.Select({
                el: '',
                attributes: {id: 'VolunteerID', name: 'selectVolunteerID', class: 'form-control'},
                buildHTML: true,
                collection: App.Collections.projectVolunteersCollection,
                optionValueModelAttrName: 'VolunteerID',
                optionLabelModelAttrName: ['LastName', 'FirstName']
            });
            let tplVars = {
                ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute),
                volunteerSelect: volunteerSelect.getHtml(),
                projectRoleOptions: App.Models.volunteerModel.getRoleOptions(true),
                statusOptions: App.Models.volunteerModel.getStatusOptions(true)
            };
            return template(tplVars);
        }
    });
    App.Views.ProjectVolunteer = App.Views.ProjectTab.fullExtend({
        getModalForm: function () {
            let template = window.template('addProjectVolunteerTemplate');
            let form = template({ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute)});
            let $gridContainer = $(form);
            $gridContainer.find('.form-group').append($('<div><div class="backgrid-wrapper"></div><div class="modal-grid-manager-container"><div class="modal-pagination-controls"></div></div></div>'));
            let gridCollection = App.PageableCollections.unassignedProjectVolunteersCollection;

            App.Views.backGridFiltersPanel = new App.Views.BackGridFiltersPanel({
                collection: gridCollection,
                parentEl: $gridContainer
            });

            $gridContainer.prepend(App.Views.backGridFiltersPanel.render().$el);

            // override default definitions to clean up visible columns for just choosing
            let gridColumnDefinitions = _.map(App.Vars.volunteersBackgridColumnDefinitions, function (def) {
                def.editable=false;
                if (def.name.match(/(ID|_at)$/) || def.label.match(/^Grove/)){
                    def.renderable = false;
                }
                return def;
            });
            let backgridColumnCollection = new Backgrid.Extension.OrderableColumns.orderableColumnCollection(gridColumnDefinitions);
            let Header = Backgrid.Extension.GroupedHeader;
            this.backgrid = new Backgrid.Grid({
                //header: Header,
                columns: gridColumnDefinitions,
                collection: gridCollection
            });

            // Hide db record foreign key ids
            let hideCellCnt = 0;//9 + 25;
            let initialColumnsVisible = gridColumnDefinitions.length - hideCellCnt;
            let colManager = new Backgrid.Extension.ColumnManager(backgridColumnCollection, {
                initialColumnsVisible: initialColumnsVisible,
                saveState: true,
                saveStateKey: 'volunteer-chooser',
                loadStateOnInit: true
            });
            // Add control
            let colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                columnManager: colManager
            });
            $gridContainer.find('.backgrid-wrapper').html(this.backgrid.render().el);

            let paginator = new Backgrid.Extension.Paginator({
                collection: gridCollection
            });

            // Render the paginator
            $gridContainer.find('.modal-pagination-controls').html(paginator.render().el);

            //Add sizeable columns
            let sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                collection: gridCollection,
                columns: backgridColumnCollection,
                grid: this.backgrid
            });
            $gridContainer.find('thead').before(sizeAbleCol.render().el);

            //Add resize handlers
            let sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                sizeAbleColumns: sizeAbleCol,
                saveColumnWidth: false
            });
            $gridContainer.find('thead').before(sizeHandler.render().el);

            //Make columns reorderable
            let orderHandler = new Backgrid.Extension.OrderableColumns({
                grid: this.backgrid,
                sizeAbleColumns: sizeAbleCol
            });
            $gridContainer.find('thead').before(orderHandler.render().el);
            $('#sia-modal .modal-dialog').css('width', '98%');
            return $gridContainer;
        },
        create: function (attributes) {
            let self = this;
            let model = App.Models.projectVolunteerModel.clone().clear({silent: true});
            model.url = '/admin/project_volunteer/batch/store';
            _log('App.Views.ProjectVolunteer.create', attributes, model);
            model.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.collection.url = '/admin/project_volunteer/all/' + App.Models.projectModel.get(App.Models.projectModel.idAttribute);
                        window.ajaxWaiting('show', '.tab-content.backgrid-wrapper');

                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            _log('App.Views.ProjectVolunteer.create.event', 'project_volunteers collection fetch promise done');
                            window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error');
                        window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
                    }
                });
        }
    });
})(window.App);

(function (App) {
    App.Views.ProjectGridManagerContainerToolbar = Backbone.View.extend({

        template: template('projectGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(this, 'render', 'initializeFileUploadObj', 'addGridRow', 'deleteCheckedRows', 'clearStoredColumnState','toggleDeleteBtn');
            this.listenTo(App.Views.siteManagementView, 'toggle-delete-btn', function (e) {
                self.toggleDeleteBtn(e);
            });
        },
        events: {
            'click #btnAddProject': 'addGridRow',
            'click #btnDeleteCheckedProjects': 'deleteCheckedRows',
            'click #btnClearStored': 'clearStoredColumnState',
        },
        render: function () {
            this.$el.html(this.template());
            // initialize all file upload inputs on the page at load time
            this.initializeFileUploadObj(this.$el.find('input[type="file"]'));
            return this;
        },
        initializeFileUploadObj: function (el) {
            $(el).fileupload({
                url: App.Vars.sAjaxFileUploadURL,
                dataType: 'json',
                done: function (e, data) {
                    let self = this;
                    $('#file_progress_' + self.id).fadeTo(0, 'slow');
                    $('#file_' + self.id).val('')
                    $('#file_chosen_' + self.id).empty()
                    $.each(data.files, function (index, file) {
                        let sFileName = file.name
                        let sExistingVal = $('#file_' + self.id).val().length > 0 ? $('#file_' + self.id).val() + ',' : ''
                        $('#file_' + self.id).val(sExistingVal + sFileName)
                        $('#file_chosen_' + self.id).append(sFileName + '<br>')
                    });
                },
                start: function (e) {
                    let self = this
                    $('#file_progress_' + self.id).fadeTo('fast', 1);
                    $('#file_progress_' + self.id).find('.meter').removeClass('green');
                },
                progress: function (e, data) {
                    let self = this
                    let progress = parseInt(data.loaded / data.total * 100, 10);

                    $('#file_progress_' + self.id + ' .meter').addClass('green').css(
                        'width',
                        progress + '%'
                    ).find('p').html(progress + '%');
                }
            }).prop('disabled', !$.support.fileInput)
                .parent().addClass($.support.fileInput ? undefined : 'disabled');
        },
        addGridRow: function (e) {
            var self = this;
            e.preventDefault();
            $('#sia-modal').one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('New Project');
                modal.find('.modal-body').html(App.Views.projectsView.getModalForm());

                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    App.Views.projectsView.create($.unserialize(modal.find('form').serialize()));
                    $('#sia-modal').modal('hide');
                });

            });
            $('#sia-modal').modal('show');

        },
        deleteCheckedRows: function (e) {
            e.preventDefault();
            if ($(e.target).hasClass('disabled')) {
                growl('Please check a box to delete a project.');
                return;
            }
            bootbox.confirm("Do you really want to delete the checked projects?", function (bConfirmed) {
                if (bConfirmed) {
                    let selectedModels = App.Views.projectsView.backgrid.getSelectedModels();
                    // clear or else the previously selected models remain as undefined
                    App.Views.projectsView.backgrid.clearSelectedModels();
                    _log('App.Views.ProjectGridManagerContainerToolbar.deleteCheckedRows', 'selectedModels', selectedModels);
                    let modelIDs = _.map(selectedModels, function (model) {
                        return model.get(model.idAttribute);
                    });

                    App.Views.projectsView.destroy({deleteModelIDs: modelIDs});
                }
            });
        },
        clearStoredColumnState(e) {
            e.preventDefault();
            growl('Resetting project columns. Please wait while the page refreshes.', 'success');
            localStorage.removeItem('backgrid-colmgr-site-projects');
            location.reload();
        },
        toggleDeleteBtn: function (e) {
            let toggle = e.toggle;

            _log('App.Views.ProjectGridManagerContainerToolbar.toggleDeleteBtn.event', e.toggle, e);
            if (toggle === 'disable') {
                this.$el.find('#btnDeleteCheckedProjects').addClass('disabled');
            } else {
                this.$el.find('#btnDeleteCheckedProjects').removeClass('disabled');
            }

        }

    });
    App.Views.Projects = Backbone.View.extend({
        initialize: function (options) {
            this.options = options;
            _.bindAll(this, 'render', 'update', 'getModalForm','toggleDeleteBtn');
            this.rowBgColor = 'lightYellow';
            //this.collection.bind('reset', this.render, this);
            this.columnCollectionDefinitions = this.options.columnCollectionDefinitions;
        },
        events: {
            'focusin tbody tr': 'updateProjectDataViews'
        },
        render: function () {
            let self = this;

            // I believe we have to re-build this collection every time the view is created or else a js error is thrown when looping through the column elements
            let backgridOrderableColumnCollection = new Backgrid.Extension.OrderableColumns.orderableColumnCollection(this.columnCollectionDefinitions);
            backgridOrderableColumnCollection.setPositions().sort();

            let Header = Backgrid.Extension.GroupedHeader;
            this.backgrid = new Backgrid.Grid({
                header: Header,
                columns: backgridOrderableColumnCollection,
                collection: this.collection
            });

            // Hide db record foreign key ids
            let hideCellCnt = 0;//9 + 25;
            let initialColumnsVisible = App.Vars.projectsBackgridColumnDefinitions.length - hideCellCnt;
            this.colManager = new Backgrid.Extension.ColumnManager(backgridOrderableColumnCollection, {
                initialColumnsVisible: initialColumnsVisible,
                trackSize: true,
                trackOrder: true,
                trackVisibility: true,
                saveState: true,
                saveStateKey: 'site-projects',
                //saveStateKey: 'site-projects-' + App.Models.siteModel.get(App.Models.siteModel.idAttribute) + '-' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute) + '-' + _.uniqueId('-'),
                loadStateOnInit: true,
                stateChecking: "loose"
            });

            let colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                columnManager: this.colManager
            });
            let $gridContainer = this.$el.html(this.backgrid.render().el);

            this.projectGridManagerContainerToolbar = new App.Views.ProjectGridManagerContainerToolbar({
                el: '.projects-grid-manager-container'
            });
            this.projectGridManagerContainerToolbar.render();

            let paginator = new Backgrid.Extension.Paginator({
                collection: this.collection
            });

            // Render the paginator
            this.projectGridManagerContainerToolbar.$el.find('.project-pagination-controls').html(paginator.render().el);
            _log('App.Views.Projects.render', '$gridContainer', $gridContainer, '$gridContainer.find(\'thead\')', $gridContainer.find('thead'));
            //Add sizeable columns
            let sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                collection: this.collection,
                columns: backgridOrderableColumnCollection,
                grid: this.backgrid
            });
            $gridContainer.find('thead').before(sizeAbleCol.render().el);
            _log('App.Views.Projects.render', 'after sizeAbleCol.render()');

            //Add resize handlers
            let sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                sizeAbleColumns: sizeAbleCol,
                saveColumnWidth: true
            });
            $gridContainer.find('thead').before(sizeHandler.render().el);
            _log('App.Views.Projects.render', 'after sizeHandler.render()');

            //Make columns reorderable
            let orderHandler = new Backgrid.Extension.OrderableColumns({
                grid: this.backgrid,
                sizeAbleColumns: sizeAbleCol
            });
            $gridContainer.find('thead').before(orderHandler.render().el);
            _log('App.Views.Projects.render', 'after orderHandler.render()');
            //this.options.mainAppEl is passed in through constructor
            this.projectGridManagerContainerToolbar.$el.find('.file-upload-container').before(colVisibilityControl.render().el);

            // Always assumes the first row of the backgrid/collection is the current model
            App.Vars.currentProjectID = this.collection.length ? this.collection.at(0).get('ProjectID') : null;

            // Set the "current project to load the tabbed project data"
            $gridContainer.find('input[type="radio"][name="ProjectID"][value="' + App.Vars.currentProjectID + '"]').parents('tr').trigger('focusin');

            // When a backgrid cell's model is updated it will trigger a 'backgrid:edited' event which will bubble up to the backgrid's collection
            this.backgrid.collection.on('backgrid:edited', function (e) {
                _log('App.Views.Projects.render', 'projects backgrid.collection.on backgrid:edited', e);
                self.update(e);
            });
            this.backgrid.collection.on('backgrid:selected', function (e) {
                self.toggleDeleteBtn(e);
            });
            window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
            // Show a popup of the text that has been truncated
            $gridContainer.find('td[class^="text"],td[class^="string"],td[class^="number"],td[class^="integer"]').popover({
                placement: 'auto right',
                padding: 0,
                container: 'body',
                content: function () {
                    return $(this).text()
                }
            });
            // hide popover if it is not overflown
            $gridContainer.find('td[class^="text"],td[class^="string"],td[class^="number"],td[class^="integer"]').on('show.bs.popover', function () {
                let element = this;

                let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
                if (!bOverflown) {
                    $gridContainer.find('td.renderable').popover('hide')
                }
            });

            return this;

        },
        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        updateProjectDataViews: function (e) {
            let self = this;
            let ProjectID = 0;

            if (typeof e === 'object' && !_.isUndefined(e.target)) {
                let $TableRowElement = $(e.currentTarget);
                let $RadioElement = $TableRowElement.find('input[type="radio"][name="ProjectID"]');
                // click is only a visual indication that the row is selected. nothing should be listening for this click
                $RadioElement.trigger('click');
                ProjectID = $RadioElement.val();

                // Highlight row
                $TableRowElement.siblings().css('background-color', 'white');
                $TableRowElement.css('background-color', self.rowBgColor);
            }

            if (App.Vars.mainAppDoneLoading && ProjectID && $('.site-projects-tabs').data('project-id') != ProjectID) {
                window.ajaxWaiting('show', '.tab-content.backgrid-wrapper');
                _log('App.Views.Projects.updateProjectDataViews.event', 'event triggered:' + e.handleObj.type + ' ' + e.handleObj.selector, 'last chosen ProjectID:' + $('.site-projects-tabs').data('project-id'), 'fetching new chosen project model:' + ProjectID);
                // Refresh tabs on new row select
                App.Models.projectModel.url = '/admin/project/' + ProjectID;
                App.Models.projectModel.fetch({reset: true});
            }

        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let bFetchCollection = false;
                if (_.findKey(e.changed, 'SequenceNumber') !== 'undefined') {
                    // Fetch reordered list
                    bFetchCollection = true;
                    window.ajaxWaiting('show', '.projects-backgrid-wrapper');
                }
                //'event triggered:' + e.handleObj.type + ' ' + e.handleObj.selector
                _log('App.Views.Projects.update.event', e, 'updating project model id:' + e.attributes.ProjectID);
                App.Models.projectModel.url = '/admin/project/' + e.attributes.ProjectID;
                App.Models.projectModel.save(_.extend({ProjectID: e.attributes.ProjectID}, e.changed),
                    {
                        success: function (model, response, options) {
                            if (bFetchCollection) {
                                response.msg = response.msg + ' The re-sequenced list is being refreshed.'
                            }
                            growl(response.msg, response.success ? 'success' : 'error');
                            if (bFetchCollection) {

                                self.collection.url = '/admin/project/all/' + App.Models.projectModel.get('SiteStatusID');
                                $.when(
                                    self.collection.fetch({reset: true})
                                ).then(function () {
                                    //initialize your views here
                                    _log('App.Views.Project.update.event', 'SequenceNumber updated. project collection fetch promise done');
                                    window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                                });
                            }
                        },
                        error: function (model, response, options) {
                            growl(response.msg, 'error');
                            window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                        }
                    });
            }
        },
        getModalForm: function () {
            let template = window.template('newProjectTemplate');
            let contactSelect = new App.Views.Select({
                el: '',
                attributes: {id: 'ContactID', name: 'selectContactID', class: 'form-control'},
                buildHTML: true,
                collection: App.Collections.contactsManagementCollection,
                optionValueModelAttrName: 'ContactID',
                optionLabelModelAttrName: ['LastName', 'FirstName', 'Title']
            });
            let tplVars = {
                SiteID: App.Models.siteModel.get(App.Models.siteModel.idAttribute),
                SiteStatusID: App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute),
                yesNoOptions: App.Models.projectModel.getYesNoOptions(true),
                contactSelect: contactSelect.getHtml(),
                primarySkillNeededOptions: App.Models.projectModel.getSkillsNeededOptions(true),
                statusOptions: App.Models.projectModel.getStatusOptions(true),
                projectSendOptions: App.Models.projectModel.getSendOptions(true),
                budgetSourceOptions: App.Models.projectBudgetModel.getSourceOptions(true),
                testString: 'test',
                testNumber: '1',
                testFloat: '1.00'
            };
            return template(tplVars);
        },
        create: function (attributes) {
            var self = this;
            window.ajaxWaiting('show', '.projects-backgrid-wrapper');
            // Set the sequence to the end if it was left empty
            if (_.isEmpty(attributes['SequenceNumber'])) {
                attributes['SequenceNumber'] = App.PageableCollections.projectCollection.fullCollection.length;
            }
            // Need to add some default values to the attributes array for fields we do not show in the create form
            attributes['Attachments'] = '';
            _log('App.Views.Project.create', attributes, this.model, App.PageableCollections.projectCollection);
            let newModel = new App.Models.Project();
            newModel.url = '/admin/project';
            newModel.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.collection.url = '/admin/project/all/' + App.Models.projectModel.get('SiteStatusID');
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            _log('App.Views.Project.create.event', 'project collection fetch promise done');
                            window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error');
                        window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                    }
                });
        },
        destroy: function (attributes) {
            var self = this;
            window.ajaxWaiting('show', '.projects-backgrid-wrapper');
            attributes = _.extend(attributes, {
                ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute),
                ProjectRoleID: this.model.get('ProjectRoleID')
            });
            _log('App.Views.Project.destroy', attributes);
            $.ajax({
                type: "POST",
                dataType: "json",
                url: '/admin/project/batch/destroy',
                data: attributes,
                success: function (response) {
                    window.growl(response.msg, response.success ? 'success' : 'error');
                    self.collection.url = '/admin/project/all/' + App.Models.projectModel.get('SiteStatusID');
                    $.when(
                        self.collection.fetch({reset: true})
                    ).then(function () {
                        //initialize your views here
                        _log('App.Views.Project.destroy.event', 'project collection fetch promise done');
                        window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                    });
                },
                fail: function (response) {
                    window.growl(response.msg, 'error')
                }
            })
        },
        toggleDeleteBtn: function (e) {
            var self = this;
            let selectedModels = self.backgrid.getSelectedModels();
            _log('App.Views.Project.toggleDeleteBtn.event', selectedModels.length, e);
            let toggleState = selectedModels.length === 0 ? 'disable' : 'enable';
            App.Views.siteManagementView.trigger('toggle-delete-btn', {toggle: toggleState});
        },
    });
})(window.App);

(function (App) {
    // This is the sites drop down
    App.Views.SiteOption = Backbone.View.extend({
        tagName: 'option',
        initialize: function () {
            _.bindAll(this, 'render');
        },
        render: function () {
            $(this.el).attr('value',
                this.model.get('SiteID')).html(this.model.get('SiteName'));
            return this;
        }
    });

    App.Views.Sites = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this, 'addOne', 'addAll', 'render','changeSelected','setSelectedId');
            this.collection.bind('reset', this.addAll);
        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (site) {
            $(this.el).append(
                new App.Views.SiteOption({model: site}).render().el);
        },
        addAll: function () {
            _log('App.Views.Sites.addAll', 'sites dropdown');
            this.$el.empty();
            this.collection.each(this.addOne);
        },
        render: function () {
            this.addAll();
            return this;
        },
        changeSelected: function () {
            this.setSelectedId($(this.el).val());
        },
        setSelectedId: function (SiteID) {
            _log('App.Views.Sites.setSelectedId.event', 'new site selected', SiteID);
            // fetch new site model
            App.Models.siteModel.url = '/admin/site/' + SiteID;
            App.Models.siteModel.fetch();
            App.Collections.siteYearsDropDownCollection.url = '/admin/sitestatus/all/site/years/' + SiteID;
            App.Collections.siteYearsDropDownCollection.fetch({reset: true});
        }
    });
    App.Views.SiteYearsOption = Backbone.View.extend({
        tagName: 'option',
        initialize: function () {
            _.bindAll(this, 'render');
        },
        render: function () {
            $(this.el).attr('value', this.model.get('Year'))
                .attr('data-siteid', this.model.get('SiteID'))
                .attr('data-sitestatusid', this.model.get('SiteStatusID'))
                .html(this.model.get('Year'));
            return this;
        }
    });
    App.Views.SiteYears = Backbone.View.extend({
        initialize: function () {
            this.optionsView = [];
            _.bindAll(this, 'addOne', 'addAll', 'changeSelected');
            this.collection.bind('reset', this.addAll, this);
        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (site) {
            let option = new App.Views.SiteYearsOption({model: site});
            this.optionsView.push(option);
            $(this.el).append(option.render().el);
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
            let $option = $(this.el).find(':selected');

            this.setSelectedId($option.data('siteid'), $option.data('sitestatusid'), $option.val());
        },
        setSelectedId: function (SiteID, SiteStatusID, Year) {
            if (App.Vars.mainAppDoneLoading) {
                _log('App.Views.SiteYears.setSelectedId.event', 'new year selected', SiteID, SiteStatusID, Year);
                window.ajaxWaiting('show','#site-well');
                window.ajaxWaiting('show','.projects-backgrid-wrapper');
                window.ajaxWaiting('show','.tab-content.backgrid-wrapper');
                // fetch new sitestatus
                App.Models.siteStatusModel.url = '/admin/sitestatus/' + SiteStatusID;
                App.Models.siteStatusModel.fetch({reset: true});

                // fetch new product collection
                App.PageableCollections.projectCollection.url = '/admin/project/all/' + SiteStatusID;
                App.PageableCollections.projectCollection.fetch({
                    reset: true,
                    success: function (model, response, options) {
                        //console.log('project collection fetch success', model, response, options)
                        if (!_.isUndefined(response[0])) {
                            App.Vars.currentProjectID = response[0]['ProjectID'];
                            App.Models.projectModel.set(response[0])
                        } else {
                            window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
                        }
                        window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'error');
                        window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                        window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
                    }

                });


            }
        }
    });

    /**
     * This is the site form
     */
    App.Views.Site = Backbone.View.extend({
        tagName: 'div',
        template: template('siteTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'update');
            this.model.on('change', this.render, this);
            this.model.on('set', this.render, this);
        },
        events: {
            'change input[type="text"]': 'update'
        },
        update: function (e) {

            let attrName = $(e.target).attr('name');
            let attrValue = $(e.target).val();
            this.model.url = '/admin/site/' + this.model.get('SiteID');
            this.model.save({[attrName]: attrValue},
                {
                    success: function (model, response, options) {
                        growl(response.msg, response.success ? 'success' : 'error');
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'error')
                    }
                });
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        getModalForm: function () {
            let template = window.template('siteTemplate');

            let tplVars = {
                SiteID: '',
                SiteName: 'test',
                EquipmentLocation: 'test',
                DebrisLocation: 'test'
            };
            return template(tplVars);
        },
        create: function (attributes) {
            var self = this;
            window.ajaxWaiting('show', '#site-well');
            attributes = _.omit(attributes, 'SiteID');
            _log('App.Views.Site.create', attributes, this.model);
            let newModel = new App.Models.Site();
            newModel.url = '/admin/site';
            newModel.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        App.Collections.sitesDropDownCollection.url = '/admin/site/list/all';
                        $.when(
                            App.Collections.sitesDropDownCollection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            _log('App.Views.Site.create.event', 'site collection fetch promise done');
                            window.ajaxWaiting('remove', '#site-well');
                            App.Views.sitesDropDownView.$el.val(response.new_site_id)
                            App.Views.sitesDropDownView.$el.trigger('change')
                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error');
                        window.ajaxWaiting('remove', '#site-well');
                    }
                });
        },
        destroy: function () {
            var self = this;
            _log('App.Views.Project.destroy', self.model);
            self.model.destroy({
                success: function (model, response, options) {
                    window.growl(response.msg, response.success ? 'success' : 'error');
                    App.Collections.sitesDropDownCollection.url = '/admin/site/list/all';
                    $.when(
                        App.Collections.sitesDropDownCollection.fetch({reset: true})
                    ).then(function () {
                        //initialize your views here
                        _log('App.Views.Site.destroy.event', 'site collection fetch promise done');
                        window.ajaxWaiting('remove', '#site-well');
                        App.Views.sitesDropDownView.$el.trigger('change')
                    });
                },
                error: function (model, response, options) {
                    window.growl(response.msg, 'error');
                    window.ajaxWaiting('remove', '#site-well');
                }
            });
        }
    });

    App.Views.SiteStatus = Backbone.View.extend({
        template: template('siteStatusTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'update');
            this.model.on('change', this.render, this);
            this.model.on('destroy', this.remove, this); // 3.
        },
        events: {
            'click input[type="checkbox"]': 'update',
            'change input[type="text"]': 'update',
            'click .delete': 'destroy'	/// 1. Binding a Destroy for the listing to click event on delete button..
        },
        update: function (e) {
            let $target = $(e.target);
            let attrType = $target.attr('type');
            let attrName = $target.attr('name');
            let attrValue = $target.val();

            let selected = $target.is(':checked');
            if (attrType === 'checkbox') {
                attrValue = selected ? 1 : 0;
            }
            //console.log('attrType:' + attrType, 'selected: ', selected, 'attrName:' + attrName, 'value: ', attrValue);
            this.model.url = '/admin/sitestatus/' + this.model.get('SiteStatusID');
            this.model.save({[attrName]: attrValue},
                {
                    success: function (model, response, options) {
                        growl(response.msg, response.success ? 'success' : 'error');
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'error')
                    }
                });
        },
        destroy: function () {
            this.model.destroy();  // 2. calling backbone js destroy function to destroy that model object
        },
        remove: function () {
            this.$el.remove();  // 4. Calling Jquery remove function to remove that HTML li tag element..
        },
        render: function () {
            let checkedBoxes = {
                'ProjectDescriptionCompleteIsChecked': this.model.get('ProjectDescriptionComplete') === 1 ? 'checked' : '',
                'BudgetEstimationCompleteIsChecked': this.model.get('BudgetEstimationComplete') === 1 ? 'checked' : '',
                'VolunteerEstimationCompleteIsChecked': this.model.get('VolunteerEstimationComplete') === 1 ? 'checked' : '',
                'VolunteerAssignmentCompleteIsChecked': this.model.get('VolunteerAssignmentComplete') === 1 ? 'checked' : '',
                'BudgetActualCompleteIsChecked': this.model.get('BudgetActualComplete') === 1 ? 'checked' : '',
                'EstimationCommentsIsChecked': this.model.get('EstimationComments') === 1 ? 'checked' : ''
            };
            this.$el.html(this.template(_.extend(this.model.toJSON(), checkedBoxes)));
            window.ajaxWaiting('remove', '#site-well');
            return this;
        }
    });
})(window.App);

(function (App) {
    App.Views.SiteManagement = Backbone.View.extend({
        sitesViewClass: App.Views.Sites,
        siteYearsViewClass: App.Views.SiteYears,
        siteViewClass: App.Views.Site,
        siteStatusViewClass: App.Views.SiteStatus,
        projectsViewClass: App.Views.Projects,
        initialize: function (options) {
            this.options = options;
            this.childViews = [];
        },
        events: {
            'click #btnAddSite': 'addSite',
            'click #btnDeleteSite': 'deleteSite'
        },
        render: function () {

            App.Views.sitesDropDownView = this.sitesDropDownView = new this.sitesViewClass({
                el: this.$('select#sites'),
                collection: App.Collections.sitesDropDownCollection
            });
            this.sitesDropDownView.render();


            App.Views.siteYearsDropDownView = this.siteYearsDropDownView = new this.siteYearsViewClass({
                el: this.$('select#site_years'),
                collection: App.Collections.siteYearsDropDownCollection
            });
            this.siteYearsDropDownView.render();


            App.Views.siteView = this.siteView = new this.siteViewClass({
                el: this.$('.site-view'),
                mainAppEl: this.el,
                model: App.Models.siteModel,
                collection: App.Collections.sitesDropDownCollection
            });
            this.siteView.render();


            App.Views.siteStatusView = this.siteStatusView = new this.siteStatusViewClass({
                el: this.$('.site-status-view'),
                model: App.Models.siteStatusModel
            });
            this.siteStatusView.render();


            App.Views.projectsView = this.projectsView = new this.projectsViewClass({
                el: this.$('.projects-backgrid-wrapper'),
                parentViewEl: this.el,
                collection: App.PageableCollections.projectCollection,
                columnCollectionDefinitions: App.Vars.projectsBackgridColumnDefinitions,
                model: App.Models.projectModel
            });
            this.projectsView.render();
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
                $(self.options.mainAppEl).find('.site-projects-tabs .box-title small').html(currentProjectModel.get('ProjectDescription'))
            }
        },
        updateProjectDataTabButtons: function (e) {
            console.log('updateProjectDataTabButtons triggered')
        },
        addSite: function () {

            $('#sia-modal').one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('New Site');
                modal.find('.modal-body').html(App.Views.siteView.getModalForm());

                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    App.Views.siteView.create($.unserialize(modal.find('form').serialize()));


                    $('#sia-modal').modal('hide');
                });

            });
            $('#sia-modal').modal('show');
        },
        deleteSite: function () {
            bootbox.confirm("Do you really want to delete this site?", function (result) {
                App.Views.siteView.destroy();
            });
        }
    });
})(window.App);

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
        projectContactsViewClass: App.Views.ProjectContact,
        projectVolunteersViewClass: App.Views.ProjectVolunteer,
        projectLeadsViewClass: App.Views.ProjectLead,
        projectBudgetViewClass: App.Views.Budget,
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

(function (App) {

    let BackGridFiltersPanelSelectFilter = Backgrid.Extension.BackGridFiltersPanelSelectFilter = Backbone.View.extend({
        tagName: "select",
        className: "backgrid-filter",
        template: _.template([
            "<% for (let i=0; i < options.length; i++) { %>",
            "  <option value='<%=JSON.stringify(options[i].value)%>' <%=options[i].value === initialValue ? 'selected=\"selected\"' : ''%>><%=options[i].label%></option>",
            "<% } %>"
        ].join("\n")),
        defaults: {
            selectOptions: undefined,
            field: undefined,
            clearValue: null,
            initialValue: undefined
        },
        filterName: '',
        initialize: function (options) {
            BackGridFiltersPanelSelectFilter.__super__.initialize.apply(this, arguments);

            _.defaults(this, options || {}, this.defaults);

            if (_.isEmpty(this.selectOptions) || !_.isArray(this.selectOptions)) throw "Invalid or missing selectOptions.";
            if (_.isEmpty(this.field) || !this.field.length) throw "Invalid or missing field.";
            if (this.initialValue === undefined) this.initialValue = this.clearValue;

        },
        render: function () {
            this.$el.empty().append(this.template({
                options: this.selectOptions,
                initialValue: this.initialValue
            }));

            return this;
        }

    });
    /**
     BackGridFiltersPanelClientSideFilter forks ClientSideFilter
     BackGridFiltersPanelClientSideFilter is a search form widget that searches a collection for
     model matches against a query on the client side. The exact matching
     algorithm can be overriden by subclasses.

     @class Backgrid.Extension.BackGridFiltersPanelClientSideFilter
     */
    let BackGridFiltersPanelClientSideFilter = Backgrid.Extension.BackGridFiltersPanelClientSideFilter = Backbone.View.extend({
        /** @property */
        tagName: "div",

        /** @property */
        className: "backgrid-filter form-search",

        /** @property {function(Object, ?Object=): string} template */
        template: function (data) {
            return '<span class="search">&nbsp;</span><input data-filter-name="' + data.filterName + '" type="search" ' + (data.placeholder ? 'placeholder="' + data.placeholder + '"' : '') + ' name="' + data.name + '" ' + (data.value ? 'value="' + data.value + '"' : '') + '/><a class="clear" data-backgrid-action="clear" href="#">&times;</a>';
        },
        filterName: '',
        /** @property {string} [name='q'] Query key */
        name: "q",

        /** @property {string} [value] The search box value.  */
        value: null,
        /**
         @property {string} [placeholder] The HTML5 placeholder to appear beneath
         the search box.
         */
        placeholder: null,
        /**
         @property {?Array.<string>} [fields] A list of model field names to
         search for matches. If null, all of the fields will be searched.
         */
        fields: null,

        /**
         Debounces the #search and #clear methods and makes a copy of the given
         collection for searching.

         @param {Object} options
         @param {Backbone.Collection} options.collection
         @param {string} [options.placeholder]
         @param {string} [options.fields]
         @param {string} [options.wait=149]
         */
        initialize: function (options) {
            BackGridFiltersPanelClientSideFilter.__super__.initialize.apply(this, arguments);
            this.filterName = options.filterName || this.filterName;
            this.name = options.name || this.name;
            this.value = options.value || this.value;
            this.placeholder = options.placeholder || this.placeholder;
            this.template = options.template || this.template;
            this.fields = options.fields || this.fields;

        },

        /**
         Renders a search form with a text box, optionally with a placeholder and
         a preset value if supplied during initialization.
         */
        render: function () {
            // _log('BackGridFiltersPanelClientSideFilter.render', {
            //     filterName: this.filterName,
            //     name: this.name,
            //     placeholder: this.placeholder,
            //     value: this.value
            // });
            this.$el.empty().append(this.template({
                filterName: this.filterName,
                name: this.name,
                placeholder: this.placeholder,
                value: this.value
            }));

            this.delegateEvents();
            return this;
        }
    });

    App.Views.BackGridFiltersPanel = Backbone.View.extend({
        tagName: 'div',
        /**
         @property [wait=149] The time in milliseconds to wait since the last
         change to the search box's value before searching. This value can be
         adjusted depending on how often the search box is used and how large the
         search index is.
         */
        wait: 149,
        selectClearValue: "null",
        template: template('backgridFiltersPanelTemplate'),
        initialize: function (options) {
            //_log('App.Views.BackGridFiltersPanel.initialize');
            _.bindAll(this,
                'render',
                'clearSearchBox',
                'getFilterName',
                'showClearButtonMaybe',
                'searchBox',
                'clearButton',
                'query',
                'makeRegExp',
                'makeMatcher',
                'search',
                'clear',
                'applyFilters',
                'getSearchSelect',
                'currentSelectValue',
                'onChange');
            this.parentEl = $(options.parentEl);
            this.wait = options.wait || this.wait;
            // fullCollection is so we can get the entire collection for pageable collections instead of just the collection for the first page
            let collection = this.collection = this.collection.fullCollection || this.collection;
            this.origCollection = collection.clone();

            this._debounceMethods(["search", "clear"]);

            this.listenTo(collection, "add", function (model, collection, options) {
                this.origCollection.add(model, options);
            });
            this.listenTo(collection, "remove", function (model, collection, options) {
                this.origCollection.remove(model, options);
            });
            this.listenTo(collection, "sort", function (col) {
                if (!this.query()) this.origCollection.reset(col.models);
            });
            this.listenTo(collection, "reset", function (col, options) {
                options = _.extend({reindex: true}, options || {});
                if (options.reindex && options.from == null && options.to == null) {
                    this.origCollection.reset(col.models);
                }
            });
        },
        events: {
            "keyup input[type=search]": "showClearButtonMaybe",
            "click a[data-backgrid-action=clear]": function (e) {
                e.preventDefault();
                this.clear(e);
            },
            "keydown input[type=search]": "search",
            "submit": function (e) {
                e.preventDefault();
                this.search(e);
            },
            "change select": "onChange"
        },
        _debounceMethods: function (methodNames) {
            if (_.isString(methodNames)) methodNames = [methodNames];

            this.undelegateEvents();

            for (let i = 0, l = methodNames.length; i < l; i++) {
                let methodName = methodNames[i];
                let method = this[methodName];
                this[methodName] = _.debounce(method, this.wait);
            }

            this.delegateEvents();
        },
        render: function () {

            this.filterQueryValue = {};
            let $filtersPanel = $(this.template());
            $filtersPanel.boxWidget({
                animationSpeed: 500,
                collapseTrigger: '[data-widget="collapse"]',
                collapseIcon: 'fa-minus',
                expandIcon: 'fa-plus'
            });
            //_log('App.Views.BackGridFiltersPanel.render', $filtersPanel);
            let inputTypeFilterDefinitions = [
                {name: 'FirstName', fields: ['FirstName'], placeholder: 'First Name'},
                {name: 'LastName', fields: ['LastName'], placeholder: 'Last Name'},
                {name: 'LG', fields: ['LG'], placeholder: 'Life Group'},
                {name: 'Church', fields: ['Church'], placeholder: 'Church'},
            ];
            this.inputTypeFilters = [];
            for (let x in inputTypeFilterDefinitions) {
                this.inputTypeFilters[inputTypeFilterDefinitions[x].name] = new Backgrid.Extension.BackGridFiltersPanelClientSideFilter({
                    filterName: inputTypeFilterDefinitions[x].name,
                    fields: inputTypeFilterDefinitions[x].fields,
                    placeholder: inputTypeFilterDefinitions[x].placeholder,
                    value: this.filterQueryValue[inputTypeFilterDefinitions[x].name],
                    wait: 149
                });

                $filtersPanel.find('.' + inputTypeFilterDefinitions[x].name).append(this.inputTypeFilters[inputTypeFilterDefinitions[x].name].render().el);
            }

            let skillOptions = App.Models.volunteerModel.getSkillLevelOptions();
            skillOptions.shift();
            let ageRangeOptions = App.Models.volunteerModel.getAgeRangeOptions();
            let primarySkillOptions = App.Models.volunteerModel.getPrimarySkillOptions();
            let statusOptions = App.Models.volunteerModel.getStatusOptions();
            let schoolOptions = App.Models.volunteerModel.getSchoolOptions();
            this.selectTypeFilterDefinitions = [
                {name: 'Status', options: statusOptions},
                {name: 'PrimarySkill', options: primarySkillOptions},
                {name: 'AgeRange', options: ageRangeOptions},
                {name: 'Painting', options: skillOptions},
                {name: 'Landscaping', options: skillOptions},
                {name: 'Construction', options: skillOptions},
                {name: 'Electrical', options: skillOptions},
                {name: 'CabinetryFinishWork', options: skillOptions},
                {name: 'Plumbing', options: skillOptions},
                {name: 'SchoolPreference', options: schoolOptions}
            ];

            this.selectTypeFilters = [];
            for (let x in this.selectTypeFilterDefinitions) {
                this.selectTypeFilters[this.selectTypeFilterDefinitions[x].name] = new Backgrid.Extension.BackGridFiltersPanelSelectFilter({
                    attributes: {'data-filter-name': this.selectTypeFilterDefinitions[x].name},
                    className: "backgrid-filter form-control",
                    field: this.selectTypeFilterDefinitions[x].name,
                    selectOptions: _.union([{label: "All", value: null}],
                        _.map(this.selectTypeFilterDefinitions[x].options, function (o) {
                            return {label: o[0], value: o[1]};
                        }))
                });
                $filtersPanel.find('.' + this.selectTypeFilterDefinitions[x].name).append(this.selectTypeFilters[this.selectTypeFilterDefinitions[x].name].render().el);
            }

            this.$el.html($filtersPanel);

            this.parentEl.find('.result_count').html(this.origCollection.length);
            return this;
        },
        /**
         Returns the search select.
         */
        getSearchSelect: function (e) {
            return this.$el.find(e.target);
        },
        currentSelectValue: function (e) {
            return JSON.parse(this.getSearchSelect(e).val());
        },
        onChange: function (e) {
            if (this.currentSelectValue(e) !== this.selectClearValue && this.currentSelectValue(e) !== null) {
                this.filterQueryValue[this.getFilterName(e)] = this.currentSelectValue(e);
                this.applyFilters();
            } else {
                this.filterQueryValue = _.omit(this.filterQueryValue, this.getFilterName(e));
                this.clear(e);
            }
        },
        /**
         Event handler. Clear the search box and reset the internal search value.
         */
        clearSearchBox: function (e) {
            this.filterQueryValue = _.omit(this.filterQueryValue, this.getFilterName(e));
            this.searchBox(e).val(null);
            this.showClearButtonMaybe(e);
        },
        getFilterName: function (e) {
            return this.searchBox(e).data('filter-name')
        },
        /**
         Event handler. Show the clear button when the search box has text, hide
         it otherwise.
         */
        showClearButtonMaybe: function (e) {
            //_log('App.Views.BackGridFiltersPanel.showClearButtonMaybe', e);
            let $clearButton = this.clearButton(e);
            let searchTerms = this.filterQueryValue[this.getFilterName(e)];
            if (searchTerms) $clearButton.show();
            else $clearButton.hide();
        },

        /**
         Returns the search input box.
         */
        searchBox: function (e) {
            if (e.target.localName === 'a' && $(e.target).hasClass('clear')) {
                return this.$el.find(e.target).siblings("input[type=search]");
            }
            return this.$el.find(e.target);
        },

        /**
         Returns the clear button.
         */
        clearButton: function (e) {
            return this.$el.find(e.target).siblings("a[data-backgrid-action=clear]");
        },

        /**
         Returns the current search query.
         */
        query: function (e) {
            this.filterQueryValue[this.getFilterName(e)] = this.searchBox(e).val();
            //_log('App.Views.BackGridFiltersPanel.query', e, 'this.searchBox(e):', this.searchBox(e), 'this.getFilterName(e):' + this.getFilterName(e), 'this.filterQueryValue[this.getFilterName(e)]:' + this.filterQueryValue[this.getFilterName(e)]);
            return this.filterQueryValue[this.getFilterName(e)];
        },

        /**
         Constructs a Javascript regular expression object for #makeMatcher.

         This default implementation takes a query string and returns a Javascript
         RegExp object that matches any of the words contained in the query string
         case-insensitively. Override this method to return a different regular
         expression matcher if this behavior is not desired.

         @param {string} query The search query in the search box.
         @return {RegExp} A RegExp object to match against model #fields.
         */
        makeRegExp: function (query) {
            let queryRegexStr = query.trim().split(/\s+/).join("|");
            //_log('App.Views.BackGridFiltersPanel.makeRegExp', 'query:', query, 'queryRegexStr:', queryRegexStr);

            return new RegExp(queryRegexStr, "i");
        },

        /**
         This default implementation takes a query string and returns a matcher
         function that looks for matches in the model's #fields or all of its
         fields if #fields is null, for any of the words in the query
         case-insensitively using the regular expression object returned from
         #makeRegExp.

         Most of time, you'd want to override the regular expression used for
         matching. If so, please refer to the #makeRegExp documentation,
         otherwise, you can override this method to return a custom matching
         function.

         Subclasses overriding this method must take care to conform to the
         signature of the matcher function. The matcher function is a function
         that takes a model as paramter and returns true if the model matches a
         search, or false otherwise.

         In addition, when the matcher function is called, its context will be
         bound to this ClientSideFilter object so it has access to the filter's
         attributes and methods.

         @param {string} query The search query in the search box.
         @return {function(Backbone.Model):boolean} A matching function.
         */
        makeMatcher: function (filterName, query) {
            let bIsSelect = -1 !== _.indexOf(_.pluck(this.selectTypeFilterDefinitions, 'name'), filterName);
            if (!bIsSelect) {
                let regexp = this.makeRegExp(query);
                //_log('App.Views.BackGridFiltersPanel.makeMatcher', 'input', 'query:', query, 'regexp:', regexp);
                return function (model) {
                    let keys = this.inputTypeFilters[filterName].fields || model.keys();
                    for (let i = 0, l = keys.length; i < l; i++) {
                        if (regexp.test(model.get(keys[i]) + "")) return true;
                    }
                    return false;
                };
            } else {
                //_log('App.Views.BackGridFiltersPanel.makeMatcher', filterName +' select', 'query:', query);
                return function (model) {
                    return model.get(filterName) == query;
                };
            }
        },
        /**
         Takes the query from the search box, constructs a matcher with it and
         loops through collection looking for matches. Reset the given collection
         when all the matches have been found.

         If the collection is a PageableCollection, searching will go back to the
         first page.
         */
        search: function (e) {
            let logCnt = 0;
            //_log('App.Views.BackGridFiltersPanel.search' + logCnt++, 'event:', e);
            // adds query to this.filterQueryValue
            this.query(e);
            this.applyFilters();

            //_log('App.Views.BackGridFiltersPanel.search' + logCnt++, 'done. grid should be filtered now.');
        },

        /**
         Clears the search box and reset the collection to its correct filter state.

         If the collection is a PageableCollection, clearing will go back to the
         first page.
         */
        clear: function (e) {
            let self = this;
            let bIsSelect = -1 !== _.indexOf(_.pluck(this.selectTypeFilterDefinitions, 'name'), this.getFilterName(e));
            if (!bIsSelect) {
                this.clearSearchBox(e);
            }
            this.filterQueryValue = _.omit(this.filterQueryValue, this.getFilterName(e));
            if (_.isEmpty(this.filterQueryValue)) {
                //_log('App.Views.BackGridFiltersPanel.clear', e, 'no filters left');
                let col = this.collection;
                if (col.pageableCollection) col.pageableCollection.getFirstPage({silent: true});
                col.reset(this.origCollection.models, {reindex: false});
                this.parentEl.find('.result_count').html(col.length);
            } else {
                //_log('App.Views.BackGridFiltersPanel.clear', e, 'found filters. need to loop through and rebuild search');
                this.applyFilters();
            }
        },
        applyFilters: function () {
            //_log('App.Views.BackGridFiltersPanel.applyFilters', 'this.filterQueryValue:', this.filterQueryValue);

            if (!_.isEmpty(this.filterQueryValue)) {
                this.shadowCollection = this.origCollection.clone();
                let col = this.collection;
                if (col.pageableCollection) col.pageableCollection.getFirstPage({silent: true});
                for (let x in this.filterQueryValue) {
                    let filterName = x;
                    let query = this.filterQueryValue[x];
                    if (!_.isNull(query)) {
                        let matcher = _.bind(this.makeMatcher(filterName, query), this);
                        this.shadowCollection = this.shadowCollection.filter(matcher)
                    }
                }

                col.reset(this.shadowCollection, {reindex: false});
                this.parentEl.find('.result_count').html(col.length)
            }
        }
    });
})(window.App);

(function (App) {
    App.Views.VolunteerManagement = Backbone.View.extend({
        initialize: function (options) {
            this.options = options;
            _.bindAll(this, 'render', 'update', 'updateProjectTabView', 'getModalForm', 'create','loadFirstTime');
            this.rowBgColor = 'lightYellow';
            this.collection.bind('reset', this.render, this);
            _log('App.Views.VolunteerManagement.initialize', options);
        },
        events: {
            'click [data-widget="collapse"]': 'loadFirstTime'
        },
        render: function () {
            // let self = this;
            // this.hideCellCnt = this.options.hideCellCnt;
            // this.$tabBtnPane = $(this.options.parentViewEl).find('.volunteers-grid-manager-container');
            // this.$tabBtnPanePaginationContainer = this.$tabBtnPane.find('.pagination-controls');
            // this.model = this.collection.at(0);
            // this.columnCollectionDefinitions = this.options.columnCollectionDefinitions;
            // this.columnCollection = this.options.columnCollection;
            //
            // let Header = Backgrid.Extension.GroupedHeader;
            // let backgrid = new Backgrid.Grid({
            //     header: Header,
            //     columns: this.columnCollection,
            //     collection: this.collection
            // });
            //
            // let initialColumnsVisible = this.columnCollectionDefinitions.length - this.hideCellCnt;
            // let colManager = new Backgrid.Extension.ColumnManager(this.columnCollection, {
            //     initialColumnsVisible: initialColumnsVisible,
            //     saveState: true,
            //     saveStateKey: 'volunteer-management',
            //     loadStateOnInit: true
            // });
            // // Add control
            // let colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
            //     columnManager: colManager
            // });
            //
            // let $grid = this.$el.find('.volunteers-backgrid-wrapper').html(backgrid.render().el);
            //
            // let paginator = new Backgrid.Extension.Paginator({
            //     collection: this.collection
            // });
            //
            // // Render the paginator
            // this.$tabBtnPanePaginationContainer.html(paginator.render().el);
            //
            // // Add sizeable columns
            // let sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
            //     collection: this.collection,
            //     columns: this.columnCollection,
            //     grid: backgrid
            // });
            // $grid.find('thead').before(sizeAbleCol.render().el);
            //
            // // Add resize handlers
            // let sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
            //     sizeAbleColumns: sizeAbleCol,
            //     saveColumnWidth: true
            // });
            // $grid.find('thead').before(sizeHandler.render().el);
            //
            // // Make columns reorderable
            // let orderHandler = new Backgrid.Extension.OrderableColumns({
            //     grid: backgrid,
            //     sizeAbleColumns: sizeAbleCol
            // });
            // $grid.find('thead').before(orderHandler.render().el);
            // this.$tabBtnPane.remove('.columnmanager-visibilitycontrol').append(colVisibilityControl.render().el);
            // backgrid.collection.on('backgrid:edited', function (e) {
            //     self.update(e);
            // });
            // this.$el.data('current-model-id', this.model.get(this.model.idAttribute));
            // return this;
        },
        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        updateProjectTabView: function (e) {
            let self = this;
            let currentModelID = 0;
            // console.log(e)
            if (typeof e === 'object' && !_.isUndefined(e.target)) {
                let $TableRowElement = $(e.currentTarget);
                let $RadioElement = $TableRowElement.find('input[type="radio"][name="' + this.model.idAttribute + '"]');
                // click is only a visual indication that the row is selected. nothing should be listening for this click
                $RadioElement.trigger('click');
                currentModelID = $RadioElement.val();

                // Highlight row
                $TableRowElement.siblings().css('background-color', 'white');
                $TableRowElement.css('background-color', self.rowBgColor);

            }

            if (App.Vars.mainAppDoneLoading && currentModelID && this.$el.data('current-model-id') != currentModelID) {
                // Refresh tabs on new row select
                this.model.url =  'volunteer/' + currentModelID;
                this.model.fetch({reset: true});
            }

        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                this.model.url = '/admin/volunteer/' + currentModelID;
                this.model.save(_.extend({[self.model.idAttribute]: currentModelID}, e.changed),
                    {
                        success: function (model, response, options) {
                            _log('App.Views.VolunteerManagement.update',  'volunteer save', model, response, options);
                            growl(response.msg, response.success ? 'success' : 'error');
                        },
                        error: function (model, response, options) {
                            console.error('App.Views.VolunteerManagement.update',  'volunteer save', model, response, options)
                            growl(response.msg, 'error')
                        }
                    });
            } else {
            }
        },
        create: function (attributes) {

        },
        getModalForm: function () {
            return '';
        },
        loadFirstTime: function () {
            if (this.$el.find('.backgrid').length === 0){
                this.render();
            }
        }
    });
})(window.App);

(function (App) {
    App.Views.ContactManagement = Backbone.View.extend({
        initialize: function (options) {
            this.options = options;
            _.bindAll(this, 'render', 'update', 'updateProjectTabView', 'getModalForm', 'create');
            this.rowBgColor = 'lightYellow';
            this.collection.bind('reset', this.render, this);
            _log('App.Views.ContactManagement.initialize', options);
        },
        events: {
            'click [data-widget="collapse"]': 'loadFirstTime'
        },
        render: function () {
            let self = this;
            this.hideCellCnt = this.options.hideCellCnt;
            this.$tabBtnPane = $(this.options.parentViewEl).find('.contacts-grid-manager-container');
            this.$tabBtnPanePaginationContainer = this.$tabBtnPane.find('.pagination-controls');
            this.model = this.collection.at(0);
            this.columnCollectionDefinitions = this.options.columnCollectionDefinitions;
            this.columnCollection = this.options.columnCollection;

            let Header = Backgrid.Extension.GroupedHeader;
            let backgrid = new Backgrid.Grid({
                header: Header,
                columns: this.columnCollection,
                collection: this.collection
            });

            let initialColumnsVisible = this.columnCollectionDefinitions.length - this.hideCellCnt;
            let colManager = new Backgrid.Extension.ColumnManager(this.columnCollection, {
                initialColumnsVisible: initialColumnsVisible,
                saveState: true,
                saveStateKey: 'contact-management',
                loadStateOnInit: true
            });
            // Add control
            let colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                columnManager: colManager
            });

            let $grid = this.$el.find('.contacts-backgrid-wrapper').html(backgrid.render().el);

            let paginator = new Backgrid.Extension.Paginator({
                collection: this.collection
            });

            // Render the paginator
            this.$tabBtnPanePaginationContainer.html(paginator.render().el);

            // Add sizeable columns
            let sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                collection: this.collection,
                columns: this.columnCollection,
                grid: backgrid
            });
            $grid.find('thead').before(sizeAbleCol.render().el);

            // Add resize handlers
            let sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                sizeAbleColumns: sizeAbleCol,
                saveColumnWidth: true
            });
            $grid.find('thead').before(sizeHandler.render().el);

            // Make columns reorderable
            let orderHandler = new Backgrid.Extension.OrderableColumns({
                grid: backgrid,
                sizeAbleColumns: sizeAbleCol
            });
            $grid.find('thead').before(orderHandler.render().el);
            this.$tabBtnPane.remove('.columnmanager-visibilitycontrol').append(colVisibilityControl.render().el);
            backgrid.collection.on('backgrid:edited', function (e) {
                self.update(e);
            });
            this.$el.data('current-model-id', this.model.get(this.model.idAttribute));
            return this;
        },
        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        updateProjectTabView: function (e) {
            let self = this;
            let currentModelID = 0;
            // console.log(e)
            if (typeof e === 'object' && !_.isUndefined(e.target)) {
                let $TableRowElement = $(e.currentTarget);
                let $RadioElement = $TableRowElement.find('input[type="radio"][name="' + this.model.idAttribute + '"]');
                // click is only a visual indication that the row is selected. nothing should be listening for this click
                $RadioElement.trigger('click');
                currentModelID = $RadioElement.val();

                // Highlight row
                $TableRowElement.siblings().css('background-color', 'white');
                $TableRowElement.css('background-color', self.rowBgColor);

            }

            if (App.Vars.mainAppDoneLoading && currentModelID && this.$el.data('current-model-id') != currentModelID) {
                // Refresh tabs on new row select
                this.model.url =  'contact/' + currentModelID;
                this.model.fetch({reset: true});
            }

        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                this.model.url = '/admin/contact/' + currentModelID;
                this.model.save(_.extend({[self.model.idAttribute]: currentModelID}, e.changed),
                    {
                        success: function (model, response, options) {
                            _log('App.Views.ContactManagement.update',  'contact save', model, response, options);
                            growl(response.msg, response.success ? 'success' : 'error');
                        },
                        error: function (model, response, options) {
                            console.error('App.Views.ContactManagement.update',  'contact save', model, response, options)
                            growl(response.msg, 'error')
                        }
                    });
            } else {
            }
        },
        create: function (attributes) {

        },
        getModalForm: function () {
            return '';
        },
        loadFirstTime: function () {
            if (this.$el.find('.backgrid').length === 0) {
                this.render();
            }
        }
    });
})(window.App);

(function (App) {
    App.Views.mainApp = Backbone.View.extend({
        siteManagementViewClass: App.Views.SiteManagement,
        siteProjectTabsViewClass: App.Views.SiteProjectTabs,
        el: $(".sia-main-app"),
        initialize: function (options) {
            _log('App.Views.mainApp.initialize', 'MainApp', 'initialize');
            _.bindAll(this, 'render');
        },
        render: function () {
            _log('App.Views.mainApp.render', 'appInitialData', appInitialData);
            App.Vars.currentSiteID = appInitialData.site.SiteID;
            App.Vars.currentProjectID = appInitialData.project.ProjectID;
            App.Vars.mainAppDoneLoading = false;

            App.Views.siteManagementView = this.siteManagementView = new this.siteManagementViewClass({
                el: this.$('.site-management-view')
            });
            this.siteManagementView.render();


            App.Views.siteProjectTabsView = this.siteProjectTabsView = new this.siteProjectTabsViewClass({
                el: this.$('.site-projects-tabs'),
                mainAppEl: this.el,
                model: App.Models.projectModel
            });
            this.siteProjectTabsView.render();

            // App.Views.volunteerManagementView = this.volunteerManagementView = new App.Views.VolunteerManagement({
            //     el: this.$('.volunteers-management-view'),
            //     mainAppEl: this.el,
            //     collection: App.PageableCollections.volunteersManagementCollection,
            //     columnCollectionDefinitions: App.Vars.volunteersBackgridColumnDefinitions,
            //     columnCollection: App.Vars.VolunteersBackgridColumnCollection,
            //     hideCellCnt: 0
            // });
            // //this.volunteerManagementView.render();
            //
            // App.Views.contactManagementView = this.contactManagementView = new App.Views.ContactManagement({
            //     el: this.$('.contacts-management-view'),
            //     mainAppEl: this.el,
            //     collection: App.PageableCollections.contactsManagementCollection,
            //     columnCollectionDefinitions: App.Vars.ContactsBackgridColumnDefinitions,
            //     columnCollection: App.Vars.ContactsBackgridColumnCollection,
            //     hideCellCnt: 0
            // });
            //this.contactManagementView.render();

            App.Vars.mainAppDoneLoading = true;
            _log('App.Views.mainApp.render', 'App.Vars.mainAppDoneLoading = true');
            return this;
        }
    });

})(window.App);
