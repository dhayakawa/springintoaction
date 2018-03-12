(function (App) {
    App.Views.ProjectGridManagerContainerToolbar = Backbone.View.extend({
        template: template('projectGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'render', 'initializeFileUploadObj','addGridRow','deleteCheckedRows','clearStoredColumnState');
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
                    let self = this
                    console.log(this,  data)
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
            if ($(e.target).hasClass('disabled')){
                growl('Please check a box to delete a project.');
                return;
            }
            bootbox.confirm("Do you really want to delete the checked projects?", function (bConfirmed) {
                if (bConfirmed){
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
        clearStoredColumnState(e){
            e.preventDefault();
            growl('Resetting project columns. Please wait while the page refreshes.', 'success');
            localStorage.removeItem('backgrid-colmgr-site-projects');
            location.reload();
        }

    });
    App.Views.Projects = Backbone.View.extend({
        initialize: function (options) {
            this.options = options;
            _.bindAll(this, 'render','update','getModalForm');
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
            _log('App.Views.Projects.render', '$gridContainer', $gridContainer,'$gridContainer.find(\'thead\')',$gridContainer.find('thead'));
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
            App.Vars.currentProjectID = this.collection.at(0).get('ProjectID');

            // Set the "current project to load the tabbed project data"
            $gridContainer.find('input[type="radio"][name="ProjectID"][value="' + App.Vars.currentProjectID + '"]').parents('tr').trigger('focusin');

            // When a backgrid cell's model is updated it will trigger a 'backgrid:edited' event which will bubble up to the backgrid's collection
            this.backgrid.collection.on('backgrid:edited', function (e) {
                _log('App.Views.Projects.render', 'projects backgrid.collection.on backgrid:edited', e);
                self.update(e);
            });

            window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
            // Show a popup of the text that has been truncated
            $gridContainer.find('td[class^="text"],td[class^="string"],td[class^="number"],td[class^="integer"]').popover({
                placement:'auto right',
                padding: 0,
                container: 'body',
                content: function () {
                    return $(this).text()
                }
            });
            // hide popover if it is not overflown
            $gridContainer.find('td[class^="text"],td[class^="string"],td[class^="number"],td[class^="integer"]').on('show.bs.popover',function () {
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
                _log('App.Views.Projects.updateProjectDataViews.event', 'event triggered:' + e.handleObj.type + ' ' + e.handleObj.selector, 'last chosen ProjectID:'+$('.site-projects-tabs').data('project-id'), 'fetching new chosen project model:'+ProjectID);
                // Refresh tabs on new row select
                App.Models.projectModel.url = '/admin/project/' + ProjectID;
                App.Models.projectModel.fetch({reset: true});
            }

        },
        update: function (e) {
            if (!_.isEmpty(e.changed)){
                //'event triggered:' + e.handleObj.type + ' ' + e.handleObj.selector
                _log('App.Views.Projects.update.event', e,'updating project model:'+ e.attributes.ProjectID,e);
                App.Models.projectModel.url = '/admin/project/' + e.attributes.ProjectID;
                App.Models.projectModel.save(_.extend({ProjectID: e.attributes.ProjectID}, e.changed),
                    {
                        success: function (model, response, options) {
                            growl(response.msg, response.success ? 'success' : 'error');
                        },
                        error: function (model, response, options) {
                            growl(response.msg, 'error')
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
            if (_.isEmpty(attributes['SequenceNumber'])){
                attributes['SequenceNumber'] = App.PageableCollections.projectCollection.fullCollection.length;
            }
            // Need to add some default values to the attributes array for fields we do not show in the create form
            attributes['Attachments'] = '';
            _log('App.Views.Project.create',  attributes, this.model, App.PageableCollections.projectCollection);
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
                        window.growl(response.msg, 'error')
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
        }
    });
})(window.App);
