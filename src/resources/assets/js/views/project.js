(function (App) {
    App.Views.ProjectGridManagerContainerToolbar = Backbone.View.extend({
        template: template('projectsGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            this.options = options;
            self.parentView = this.options.parentView;
            self.projectsView = this.options.projectsView;
            _.bindAll(this, 'render', 'initializeFileUploadObj', 'addGridRow', 'editGridRow','deleteCheckedRows', 'clearStoredColumnState', 'toggleDeleteBtn', 'setStickyColumns');
            this.listenTo(self.parentView, 'toggle-delete-btn', function (e) {
                self.toggleDeleteBtn(e);
            });
        },
        events: {
            'click #btnAddProject': 'addGridRow',
            'click #btnEditProject': 'editGridRow',
            'click #btnDeleteCheckedProjects': 'deleteCheckedRows',
            'click #btnClearStored': 'clearStoredColumnState',
        },
        render: function () {
            this.$el.html(this.template());
            // initialize all file upload inputs on the page at load time
            this.initializeFileUploadObj(this.$el.find('input[type="file"]'));
            if (!App.Vars.Auth.bCanAddProject) {
                this.$el.find('#btnAddProject').hide();
            }
            if (!App.Vars.Auth.bCanDeleteProject) {
                this.$el.find('#btnDeleteCheckedProjects').hide();
            }
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
            self.getModalElement().off().one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('New Project');
                modal.find('.modal-body').html(self.projectsView.getModalForm());

                modal.find('.save.btn').off().one('click', function (e) {
                    e.preventDefault();
                    self.projectsView.create($.unserialize(modal.find('form').serialize()));
                    self.getModalElement().modal('hide');
                });

            });
            self.getModalElement().modal('show');

        },
        editGridRow: function (e) {
            let self = this;
            e.preventDefault();
            self.getModalElement().off().one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('Edit Project');
                modal.find('.modal-body').html(self.projectsView.getEditForm());

                modal.find('.save.btn').off().one('click', function (e) {
                    e.preventDefault();

                    let data = $.unserialize(modal.find('form').serialize());
                    // fix multi valued select values
                    data.PrimarySkillNeeded = modal.find('form').find('[name="PrimarySkillNeeded"]').val().join();

                    self.projectsView.saveEditForm(data);
                    self.getModalElement().modal('hide');
                });

            });
            self.getModalElement().modal('show');

        },
        deleteCheckedRows: function (e) {
            let self = this;
            e.preventDefault();
            if ($(e.target).hasClass('disabled')) {
                growl('Please check a box to delete a project.');
                return;
            }
            bootbox.confirm("Do you really want to delete the checked projects?", function (bConfirmed) {
                if (bConfirmed) {
                    let selectedModels = self.projectsView.backgrid.getSelectedModels();
                    // clear or else the previously selected models remain as undefined
                    try {
                        self.projectsView.backgrid.clearSelectedModels();
                    } catch (e) {
                    }
                    _log('App.Views.ProjectGridManagerContainerToolbar.deleteCheckedRows', 'selectedModels', selectedModels);
                    let modelIDs = _.map(selectedModels, function (model) {
                        return model.get(model.idAttribute);
                    });

                    self.projectsView.destroy({deleteModelIDs: modelIDs});
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

        },
        setStickyColumns: function (colIdx) {
            let self = this;
            self.parentView.find('.cloned-backgrid-table-wrapper').remove();
            let left = 0;
            let $backgridTable = self.parentView.find('table.backgrid');
            let backgridTableHeight = $backgridTable.height();
            $backgridTable.find('tbody tr:first-child td:nth-child(-n+' +
                                colIdx + ')').each(function (idx, el) {
                let w = $(el).css('width');
                left += parseInt(w.replace('px', ''));
            });
            let $tCloneWrapper = $('<div class="cloned-backgrid-table-wrapper"></div>');
            $backgridTable.parent().parent().append($tCloneWrapper);
            $tCloneWrapper.css({
                'width': left + 10,
                'height': backgridTableHeight - 1
            });
            let $tClone = $backgridTable.clone();
            $tClone.addClass('cloned-backgrid-table').css({
                'width': left
            });
            $tClone.find('>div').remove();
            let nextColIdx = colIdx + 1;
            $tClone.find('colgroup col:nth-child(n+' +
                         nextColIdx + ')').remove();
            $tClone.find('thead tr th:nth-child(n+' +
                         nextColIdx + ')').remove();
            $tClone.find('tbody tr td:nth-child(n+' +
                         nextColIdx + ')').remove();

            $tCloneWrapper.append($tClone);

        }

    });
    App.Views.Projects = App.Views.ManagedGrid.fullExtend({
        initialize: function (options) {
            let self = this;

            _.bindAll(self,
                '_initialize',
                'close',
                'removeChildViews',
                'getViewClassName',
                'setModelRoute',
                'getModelRoute',
                'refreshView',
                'getModalForm',
                'destroy',
                'toggleDeleteBtn',
                'showColumnHeaderLabel',
                'showTruncatedCellContentPopup',
                'hideTruncatedCellContentPopup',
                'handleSiteStatusIDChange');

            self._initialize(options);

            this.listenTo(self.options.siteYearsDropDownView, 'site-status-id-change', function (e) {
                self.handleSiteStatusIDChange(e);
            });
            _log('App.Views.Projects.initialize', options);
        },
        events: {

        },
        render: function (e) {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            if (!_.isNumber(self.getViewDataStore('current-model-id'))) {
                self.setViewDataStoreValue('current-model-id', self.collection.length ? self.collection.at(0).get(self.model.idAttribute) : null);
            }
            self.renderGrid(e, 'site-projects');


            return self;

        },
        handleSiteStatusIDChange: function (e) {
            let self = this;

            let SiteStatusID = e.SiteStatusID;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            //window.ajaxWaiting('show', '.tab-content.backgrid-wrapper');
            // fetch new product collection
            App.PageableCollections.projectCollection.url = self.getModelRoute() + '/list/all/' + SiteStatusID;
            App.PageableCollections.projectCollection.fetch({
                reset: true,
                success: function (model, response, options) {
                    //console.log('handleSiteStatusIDChange project collection fetch success', {model: model, response: response, response_0: response[0], options: options})
                    if (!_.isUndefined(response[0])) {
                        //App.Vars.currentProjectID = response[0]['ProjectID'];
                        self.setViewDataStoreValue('current-model-id', response[0][self.model.idAttribute]);
                        self.model.set(response[0]);
                        //App.Models.projectModel.set(response[0]);
                        self.refocusGridRecord();
                    } else {
                        window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
                    }
                    window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                    self.trigger('toggle-project-tabs-box');
                },
                error: function (model, response, options) {
                    growl(response.msg, 'error');
                    window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                    window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
                    self.trigger('toggle-project-tabs-box');
                }
            });
        },
        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        refreshView: function (e) {
            let self = this;

            self._refreshView(e);

        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let bFetchCollection = false;
                if (_.findKey(e.changed, 'SequenceNumber') !== 'undefined') {
                    // Fetch reordered list
                    bFetchCollection = true;
                    window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                }
                //'event triggered:' + e.handleObj.type + ' ' + e.handleObj.selector
                _log('App.Views.Projects.update.event', e, 'updating project model id:' + e.attributes.ProjectID);
                if (e.attributes.ProjectID !== self.model.get(self.model.idAttribute)) {
                    growl('I just caught the disappearing project bug scenario and have cancelled the update so it does not disappear.', 'error');
                }
                self.model.url = self.getModelRoute() + '/' + e.attributes.ProjectID;
                let projectData = _.extend({ProjectID: e.attributes.ProjectID}, e.changed);
                //console.log('projectView update', {currentProjectID: App.Vars.currentProjectID,e_changed: e.changed, e_attributes: e.attributes, projectData: projectData, projectModel: App.Models.projectModel, url: App.Models.projectModel.url});

                self.model.save(projectData,
                    {
                        success: function (model, response, options) {
                            if (bFetchCollection) {
                                response.msg = response.msg + ' The re-sequenced list is being refreshed.'
                            }
                            growl(response.msg, response.success ? 'success' : 'error');
                            if (bFetchCollection) {

                                self.collection.url = self.getModelRoute() + '/list/all/' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute);
                                $.when(
                                    self.collection.fetch({reset: true})
                                ).then(function () {
                                    //initialize your views here
                                    self.refocusGridRecord();
                                    _log('App.Views.Project.update.event', 'SequenceNumber updated. project collection fetch promise done');
                                    window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);

                                });
                            }
                        },
                        error: function (model, response, options) {
                            growl(response.msg, 'error');
                            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                        }
                    });
            }
        },
        saveEditForm: function (data) {
            let self = this;
            let bSave = true;
            if (bSave) {
                let bFetchCollection = true;
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                self.model.url = '/admin/project/' + self.model.get(self.model.idAttribute);
                let projectData = _.extend({ProjectID: self.model.get(self.model.idAttribute)}, data);
                //console.log('projectView saveEditForm',{data:data, projectData:projectData,projectModel: App.Models.projectModel, url: App.Models.projectModel.url});
                self.model.save(projectData,
                    {
                        success: function (model, response, options) {
                            if (bFetchCollection) {
                                response.msg = response.msg + ' The list is being refreshed.'
                            }
                            growl(response.msg, response.success ? 'success' : 'error');
                            if (bFetchCollection) {

                                self.collection.url = self.getModelRoute() + '/list/all/' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute);
                                $.when(
                                    self.collection.fetch({reset: true})
                                ).then(function () {
                                    //initialize your views here
                                    self.refocusGridRecord();
                                    _log('App.Views.Project.update.event', 'project updated. project collection fetch promise done');
                                    window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                                });
                            }
                        },
                        error: function (model, response, options) {
                            growl(response.msg, 'error');
                            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
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

            let sequenceNumber = App.PageableCollections.projectCollection.fullCollection.models.length > 0 ? _.max(App.PageableCollections.projectCollection.fullCollection.models, function (project) {
                return parseInt(project.get("SequenceNumber"));
            }).get('SequenceNumber') : 1;

            let tplVars = {
                SiteID: App.Models.siteModel.get(App.Models.siteModel.idAttribute),
                SiteStatusID: App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute),
                yesNoIsActiveOptions: App.Models.projectModel.getYesNoOptions(true, 'Yes'),
                yesNoOptions: App.Models.projectModel.getYesNoOptions(true),
                contactSelect: contactSelect.getHtml(),
                primarySkillNeededOptions: App.Models.projectModel.getSkillsNeededOptions(true, ''),
                statusOptions: App.Models.projectModel.getStatusOptions(true, 'Pending'),
                projectSendOptions: App.Models.projectModel.getSendOptions(true),
                SequenceNumber: parseInt(sequenceNumber) + 1,
                OriginalRequest: '',
                ProjectDescription: '',
                Comments: '',
                VolunteersNeededEst: '',
                StatusReason: '',
                MaterialsNeeded: '',
                EstimatedCost: '',
                ActualCost: '',
                BudgetAvailableForPC: '',
                SpecialEquipmentNeeded: '',
                PermitsOrApprovalsNeeded: '',
                PrepWorkRequiredBeforeSIA: '',
                SetupDayInstructions: '',
                SIADayInstructions: '',
                Area: '',
                PaintOrBarkEstimate: '',
                PaintAlreadyOnHand: '',
                PaintOrdered: '',
                FinalCompletionAssessment: '',
                bSetValues: false,
                data: {
                    Active: '',
                    ChildFriendly: '',
                    PrimarySkillNeeded: '',
                    Status: '',
                    NeedsToBeStartedEarly: '',
                    CostEstimateDone: '',
                    MaterialListDone: '',
                    BudgetAllocationDone: '',
                    VolunteerAllocationDone: '',
                    NeedSIATShirtsForPC: '',
                    ProjectSend: '',
                    FinalCompletionStatus: '',
                    PCSeeBeforeSIA: ''
                }
            };
            return template(tplVars);
        },
        getEditForm: function () {
            let self = this;
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
                yesNoIsActiveOptions: self.model.getYesNoOptions(true, 'Yes'),
                yesNoOptions: self.model.getYesNoOptions(true),
                contactSelect: contactSelect.getHtml(),
                primarySkillNeededOptions: self.model.getSkillsNeededOptions(true),
                statusOptions: self.model.getStatusOptions(true, 'Pending'),
                projectSendOptions: self.model.getSendOptions(true),
                SequenceNumber: self.model.get("SequenceNumber"),
                OriginalRequest: self.model.get("OriginalRequest"),
                ProjectDescription: self.model.get("ProjectDescription"),
                Comments: self.model.get("Comments"),
                VolunteersNeededEst: self.model.get("VolunteersNeededEst"),
                StatusReason: self.model.get("StatusReason"),
                MaterialsNeeded: self.model.get("MaterialsNeeded"),
                EstimatedCost: self.model.get("EstimatedCost"),
                ActualCost: self.model.get("ActualCost"),
                BudgetAvailableForPC: self.model.get("BudgetAvailableForPC"),
                SpecialEquipmentNeeded: self.model.get("SpecialEquipmentNeeded"),
                PermitsOrApprovalsNeeded: self.model.get("PermitsOrApprovalsNeeded"),
                PrepWorkRequiredBeforeSIA: self.model.get("PrepWorkRequiredBeforeSIA"),
                SetupDayInstructions: self.model.get("SetupDayInstructions"),
                SIADayInstructions: self.model.get("SIADayInstructions"),
                Area: self.model.get("Area"),
                PaintOrBarkEstimate: self.model.get("PaintOrBarkEstimate"),
                PaintAlreadyOnHand: self.model.get("PaintAlreadyOnHand"),
                PaintOrdered: self.model.get("PaintOrdered"),
                FinalCompletionAssessment: self.model.get("FinalCompletionAssessment"),
                bSetValues: true,
                data: {
                    Active: self.model.get("Active"),
                    ChildFriendly: self.model.get("ChildFriendly"),
                    PrimarySkillNeeded: self.model.get("PrimarySkillNeeded"),
                    Status: self.model.get("Status"),
                    NeedsToBeStartedEarly: self.model.get("NeedsToBeStartedEarly"),
                    CostEstimateDone: self.model.get("CostEstimateDone"),
                    MaterialListDone: self.model.get("MaterialListDone"),
                    BudgetAllocationDone: self.model.get("BudgetAllocationDone"),
                    VolunteerAllocationDone: self.model.get("VolunteerAllocationDone"),
                    NeedSIATShirtsForPC: self.model.get("NeedSIATShirtsForPC"),
                    ProjectSend: self.model.get("ProjectSend"),
                    FinalCompletionStatus: self.model.get("FinalCompletionStatus"),
                    PCSeeBeforeSIA: self.model.get("PCSeeBeforeSIA")
                }
            };
            return template(tplVars);
        },
        create: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            // Set the sequence to the end if it was left empty
            if (_.isEmpty(attributes['SequenceNumber'])) {
                attributes['SequenceNumber'] = App.PageableCollections.projectCollection.fullCollection.length;
            }
            // Need to add some default values to the attributes array for fields we do not show in the create form
            attributes['Attachments'] = '';
            _log('App.Views.Project.create', attributes, this.model, App.PageableCollections.projectCollection);
            let newModel = new App.Models.Project();
            newModel.url = self.getModelRoute();
            newModel.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        //App.Vars.currentProjectID = !_.isUndefined(response.ProjectID) ? response.ProjectID : null;
                        self.setViewDataStoreValue('current-model-id', !_.isUndefined(response[App.Models.Project.idAttribute]) ? response[App.Models.Project.idAttribute] : null);
                        self.collection.url = self.getModelRoute() + '/list/all/' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute);
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            self.refocusGridRecord();
                            _log('App.Views.Project.create.event', 'project collection fetch promise done');
                            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                            self.trigger('toggle-project-tabs-box');
                            self.$el.find('tbody tr:first-child').trigger('focusin');
                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error');
                        window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                        self.trigger('toggle-project-tabs-box');
                    }
                });
        },
        destroy: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            attributes = _.extend(attributes, {
                ProjectID: self.model.get(self.model.idAttribute),
                ProjectRoleID: self.model.get('ProjectRoleID')
            });
            _log('App.Views.Project.destroy', attributes);
            $.ajax({
                type: "POST",
                dataType: "json",
                url: self.getModelRoute() + '/batch/destroy',
                data: attributes,
                success: function (response) {
                    window.growl(response.msg, response.success ? 'success' : 'error');
                    self.collection.url = self.getModelRoute() + '/list/all/' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute);
                    $.when(
                        self.collection.fetch({reset: true})
                    ).then(function () {
                        //App.Vars.currentProjectID = self.collection.length ? self.collection.at(0).get('ProjectID') : null;
                        self.setViewDataStoreValue('current-model-id', self.collection.length ? self.collection.at(0).get(self.model.idAttribute) : null);
                        self.refocusGridRecord();
                        //initialize your views here
                        _log('App.Views.Project.destroy.event', 'project collection fetch promise done');
                        window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                        self.trigger('toggle-project-tabs-box');
                    });
                },
                fail: function (response) {
                    window.growl(response.msg, 'error');
                    window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                    self.trigger('toggle-project-tabs-box');
                }
            })
        },


    });
})(window.App);
