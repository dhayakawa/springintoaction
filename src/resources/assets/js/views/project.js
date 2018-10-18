(function (App) {
    App.Views.ProjectGridManagerContainerToolbar = Backbone.View.extend({
        template: template('projectsGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(this, 'render', 'initializeFileUploadObj', 'addGridRow', 'deleteCheckedRows', 'clearStoredColumnState', 'toggleDeleteBtn');
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
                url: '/admin/project/list/upload',
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
                    let self = this;
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
            let self = this;
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
                    try {
                        App.Views.projectsView.backgrid.clearSelectedModels();
                    } catch (e) {
                    }
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
            let self = this;
            this.options = options;
            _.bindAll(this, 'render', 'update', 'updateProjectDataViews', 'getModalForm', 'create', 'destroy', 'toggleDeleteBtn', 'showColumnHeaderLabel', 'showTruncatedCellContentPopup', 'hideTruncatedCellContentPopup','handleSiteStatusIDChange');
            this.rowBgColor = 'lightYellow';
            this.columnCollectionDefinitions = this.options.columnCollectionDefinitions;
            this.parentView = this.options.parentView;
            this.listenTo(App.Views.siteYearsDropDownView, 'site-status-id-change', function (e) {
                self.handleSiteStatusIDChange(e);
            });
            _log('App.Views.Projects.initialize', options);
        },
        events: {
            'focusin tbody tr': 'updateProjectDataViews',
            'mouseenter thead th button': 'showColumnHeaderLabel',
            'mouseenter tbody td': 'showTruncatedCellContentPopup',
            'click tbody td': 'hideTruncatedCellContentPopup',
            'mouseleave tbody td': 'hideTruncatedCellContentPopup'
        },
        render: function (e) {
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
                saveState: App.Vars.bBackgridColumnManagerSaveState,
                saveStateKey: 'site-projects',
                //saveStateKey: 'site-projects-' + App.Models.siteModel.get(App.Models.siteModel.idAttribute) + '-' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute) + '-' + _.uniqueId('-'),
                loadStateOnInit: true,
                stateChecking: "loose"
            });

            let colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                columnManager: this.colManager
            });
            // This is the current View
            let $backgridWrapper = this.$el.html(this.backgrid.render().el);

            this.projectGridManagerContainerToolbar = new App.Views.ProjectGridManagerContainerToolbar({
                el: this.parentView.$('.projects-grid-manager-container')
            });
            this.projectGridManagerContainerToolbar.render();

            let paginator = new Backgrid.Extension.Paginator({
                collection: this.collection
            });

            // Render the paginator
            this.projectGridManagerContainerToolbar.$('.projects-pagination-controls').html(paginator.render().el);
            _log('App.Views.Projects.render', '$backgridWrapper', $backgridWrapper, '$backgridWrapper.find(\'thead\')', $backgridWrapper.find('thead'));
            //Add sizeable columns
            let sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                collection: this.collection,
                columns: backgridOrderableColumnCollection,
                grid: this.backgrid
            });
            $backgridWrapper.find('thead').before(sizeAbleCol.render().el);
            _log('App.Views.Projects.render', 'after sizeAbleCol.render()');

            //Add resize handlers
            let sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                sizeAbleColumns: sizeAbleCol,
                saveColumnWidth: true
            });
            $backgridWrapper.find('thead').before(sizeHandler.render().el);
            _log('App.Views.Projects.render', 'after sizeHandler.render()');

            //Make columns reorderable
            let orderHandler = new Backgrid.Extension.OrderableColumns({
                grid: this.backgrid,
                sizeAbleColumns: sizeAbleCol
            });
            $backgridWrapper.find('thead').before(orderHandler.render().el);
            _log('App.Views.Projects.render', 'after orderHandler.render()');
            //this.options.mainAppEl is passed in through constructor
            this.projectGridManagerContainerToolbar.$('.file-upload-container').before(colVisibilityControl.render().el);

            // Always assumes the first row of the backgrid/collection is the current model
            App.Vars.currentProjectID = this.collection.length ? this.collection.at(0).get('ProjectID') : null;

            // Set the "current project to load the tabbed project data"
            $backgridWrapper.find('input[type="radio"][name="ProjectID"][value="' + App.Vars.currentProjectID + '"]').parents('tr').trigger('focusin');

            // When a backgrid cell's model is updated it will trigger a 'backgrid:edited' event which will bubble up to the backgrid's collection
            this.backgrid.collection.on('backgrid:editing', function (e) {
                _log('App.Views.Projects.render', 'projects backgrid.collection.on backgrid:editing', e);
                self.updateProjectDataViews(e);
            });
            this.backgrid.collection.on('backgrid:edited', function (e) {
                _log('App.Views.Projects.render', 'projects backgrid.collection.on backgrid:edited', e);
                self.update(e);
            });
            this.backgrid.collection.on('backgrid:selected', function (e) {
                self.toggleDeleteBtn(e);
            });
            window.ajaxWaiting('remove', '.projects-backgrid-wrapper');

            this.$gridContainer = $backgridWrapper;
            return this;

        },
        handleSiteStatusIDChange: function () {
            window.ajaxWaiting('show', '.projects-backgrid-wrapper');
            //window.ajaxWaiting('show', '.tab-content.backgrid-wrapper');
            // fetch new product collection
            App.PageableCollections.projectCollection.url = '/admin/project/list/all/' + SiteStatusID;
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
                    self.trigger('toggle-project-tabs-box');
                },
                error: function (model, response, options) {
                    growl(response.msg, 'error');
                    window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                    window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
                    self.trigger('toggle-project-tabs-box');
                }
            });
        },
        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        updateProjectDataViews: function (e) {
            let self = this;
            let ProjectID = 0;
            let $RadioElement = null;
            let $TableRowElement = null;
            _log('App.Views.Projects.updateProjectDataViews.event', 'event triggered:', e);
            if (typeof e === 'object' && !_.isUndefined(e.id) && !_.isUndefined(e.attributes)) {
                $RadioElement = this.$gridContainer.find('input[type="radio"][name="ProjectID"][value="' + e.id + '"]');
                $TableRowElement = $RadioElement.parents('tr');
            } else if (typeof e === 'object' && !_.isUndefined(e.target)) {
                $TableRowElement = $(e.currentTarget);
                $RadioElement = $TableRowElement.find('input[type="radio"][name="ProjectID"]');
            }
            if ($RadioElement !== null) {
                // click is only a visual indication that the row is selected. nothing should be listening for this click
                $RadioElement.trigger('click');
                ProjectID = $RadioElement.val();

                // Highlight row
                $TableRowElement.siblings().removeAttr('style');
                $TableRowElement.css('background-color', App.Vars.rowBgColorSelected);
            }
            if (App.Vars.mainAppDoneLoading && ProjectID && $('.site-projects-tabs').data('project-id') != ProjectID) {
                window.ajaxWaiting('show', '.tab-content.backgrid-wrapper');
                _log('App.Views.Projects.updateProjectDataViews.event', 'event triggered:', e, 'last chosen' +
                    ' ProjectID:' + $('.site-projects-tabs').data('project-id'), 'fetching new chosen project model:' + ProjectID);
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

                                self.collection.url = '/admin/project/list/all/' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute);
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

            let sequenceNumber = _.max(App.PageableCollections.projectCollection.fullCollection.models,function (project) {
                return parseInt(project.get("SequenceNumber"));
            }).get('SequenceNumber');

            let tplVars = {
                SiteID: App.Models.siteModel.get(App.Models.siteModel.idAttribute),
                SiteStatusID: App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute),
                yesNoIsActiveOptions: App.Models.projectModel.getYesNoOptions(true, 'Yes'),
                yesNoOptions: App.Models.projectModel.getYesNoOptions(true),
                contactSelect: contactSelect.getHtml(),
                primarySkillNeededOptions: App.Models.projectModel.getSkillsNeededOptions(true, ''),
                statusOptions: App.Models.projectModel.getStatusOptions(true, 'Pending'),
                projectSendOptions: App.Models.projectModel.getSendOptions(true),
                budgetSourceOptions: App.Models.projectBudgetModel.getSourceOptions(true),
                SequenceNumber: parseInt(sequenceNumber) + 1,
                testString: '',
                testNumber: '0',
                testFloat: '0.00'
            };
            return template(tplVars);
        },
        create: function (attributes) {
            let self = this;
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
                        self.collection.url = '/admin/project/list/all/' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute);
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            _log('App.Views.Project.create.event', 'project collection fetch promise done');
                            window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                            self.trigger('toggle-project-tabs-box');
                            self.$el.find('tbody tr:first-child').trigger('focusin');
                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error');
                        window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                        self.trigger('toggle-project-tabs-box');
                    }
                });
        },
        destroy: function (attributes) {
            let self = this;
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
                    self.collection.url = '/admin/project/list/all/' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute);
                    $.when(
                        self.collection.fetch({reset: true})
                    ).then(function () {
                        //initialize your views here
                        _log('App.Views.Project.destroy.event', 'project collection fetch promise done');
                        window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                        self.trigger('toggle-project-tabs-box');
                    });
                },
                fail: function (response) {
                    window.growl(response.msg, 'error');
                    window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                    self.trigger('toggle-project-tabs-box');
                }
            })
        },
        toggleDeleteBtn: function (e) {
            let self = this;
            let selectedModels = self.backgrid.getSelectedModels();
            _log('App.Views.Projects.toggleDeleteBtn.event', selectedModels.length, e);
            let toggleState = selectedModels.length === 0 ? 'disable' : 'enable';
            //App.Views.siteManagementView.trigger('toggle-delete-btn', {toggle: toggleState});
            _log('App.Views.Projects.toggleDeleteBtn.event', 'toggleState:' + toggleState, self.parentView.el);
            if (toggleState === 'disable') {
                self.parentView.$('#btnDeleteCheckedProjects').addClass('disabled');
            } else {
                self.parentView.$('#btnDeleteCheckedProjects').removeClass('disabled');
            }
        },
        showColumnHeaderLabel: function (e) {
            let self = this;
            let $element = $(e.currentTarget).parents('th');
            let element = $element[0];

            let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
            if (bOverflown) {
                $element.attr('title', $element.find('button').text());
            }
            //_log('App.Views.Projects.showColumnHeaderLabel.event', e);
        },
        showTruncatedCellContentPopup: function (e) {
            let self = this;

            let $element = $(e.currentTarget);
            let element = e.currentTarget;
            if ($element.find('> select').length){
                return;
            }
            let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
            if (bOverflown) {
                $element.popover({
                    placement: 'auto auto',
                    padding: 0,
                    container: 'body',
                    content: function () {
                        return $(this).text()
                    }
                });
                $element.popover('show');
            }
            //_log('App.Views.Projects.showTruncatedCellContent.event', e, '$element.text():' + $element.text());
        },
        hideTruncatedCellContentPopup: function (e) {
            let self = this;

            let $element = $(e.currentTarget);
            $element.popover('hide');
            //_log('App.Views.Projects.showTruncatedCellContent.event', e, '$element.text():' + $element.text());
        }
    });
})(window.App);
