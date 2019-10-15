(function (App) {
    App.Views.Projects = App.Views.ManagedGrid.fullExtend({
        viewName: 'projects-view',
        events: {},
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self,
                    'renderGrid',
                    'removeChildViews',
                    'getViewClassName',
                    'setModelRoute',
                    'getModelRoute',
                    'refreshView',
                    'getModalForm',
                    'toggleDeleteBtn',
                    'showColumnHeaderLabel',
                    'showTruncatedCellContentPopup',
                    'hideTruncatedCellContentPopup',
                    'handleSiteStatusIDChange');
            } catch (e) {
                console.error(options, e)
            }

            // Required call for inherited class
            self._initialize(options);
            self.sitesDropdownView = self.options.parentView.sitesDropdownView;
            self.siteYearsDropdownView = self.options.parentView.siteYearsDropdownView;
            //console.log('collection',self.collection.length, self.collection.models.length, self.collection.fullCollection.length)
            if (self.collection.length === 0) {
                self.setViewDataStoreValue('current-model-id', null);
            }
            self.listenTo(self.options.parentView.siteYearsDropdownView, 'site-status-id-change', self._handleSiteStatusIDChange);
            _log('App.Views.Projects.initialize', options);
        },
        render: function (e) {
            let self = this;

            // Need to set the current model id every time the view is rendered
            self.setViewDataStoreValue('current-model-id', self.collection.length ? self.collection.at(0).get(self.model.idAttribute) : null);
            self.renderGrid(e, self.viewName);

            return self;

        },
        getCollectionQueryString: function () {
            let self = this;

            return self.siteYearsDropdownView.model.get(self.siteYearsDropdownView.model.idAttribute);
        },
        _handleSiteStatusIDChange: function (e) {
            let self = this;

            // sets current site and site status ids in localstorage
            self.handleSiteStatusIDChange(e);
            let SiteStatusID = e[self.siteYearsDropdownView.model.idAttribute];
            self.parentView.siteProjectTabsView.clearCurrentIds();
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);

            // fetch new product collection
            self.collection.url = self.getCollectionUrl(SiteStatusID);
            //console.log('_handleSiteStatusIDChange',{'self.collection.url': self.collection.url, SiteStatusID: SiteStatusID})
            $.when(
                self.collection.fetch({
                    reset: true,
                    success: function (model, response, options) {
                        //console.log('_handleSiteStatusIDChange project collection fetch success', {model: model, response: response, response_0: response[0], options: options})
                        if (!_.isUndefined(response[0])) {
                            self.setViewDataStoreValue('current-model-id', response[0][self.model.idAttribute]);
                            self.model.set(response[0]);
                            self.refocusGridRecord();
                        } else {
                            self.setViewDataStoreValue('current-model-id', null);
                            // Should trigger the tabs to update
                            self.model.clear();
                        }
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'error');
                    }
                })
            ).then(function () {
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                // This collapses or opens box
                self.trigger('toggle-tabs-box');
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
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                if (_.findKey(e.changed, 'SequenceNumber') !== 'undefined') {
                    // Fetch reordered list
                    bFetchCollection = true;
                }
                _log('App.Views.Projects.update.event', e, 'updating project model id:' + e.attributes.ProjectID);
                if (e.attributes.ProjectID !== self.model.get(self.model.idAttribute)) {
                    growl('I just caught the disappearing project bug scenario and have cancelled the update so it does not disappear.', 'error');
                }
                self.model.url = self.getModelUrl(e.attributes[self.model.idAttribute]);
                let data = _.extend({[self.model.idAttribute]: e.attributes[self.model.idAttribute]}, e.changed);
                //console.log('projectView update', {currentProjectID: App.Vars.currentProjectID,e_changed: e.changed, e_attributes: e.attributes, projectData: projectData, projectModel: App.Models.projectModel, url: App.Models.projectModel.url});
                $.when(
                    self.model.save(data,
                        {
                            success: function (model, response, options) {
                                if (bFetchCollection) {
                                    response.msg = response.msg + ' The re-sequenced list is being refreshed.'
                                }
                                growl(response.msg, response.success ? 'success' : 'error');
                                if (bFetchCollection) {
                                    self.collection.url = self.getCollectionUrl();
                                    $.when(
                                        self.collection.fetch({reset: true})
                                    ).then(function () {
                                        //initialize your views here
                                        self.refocusGridRecord();
                                        _log('App.Views.Project.update.event', 'SequenceNumber updated. project collection fetch promise done');
                                    });
                                }
                            },
                            error: function (model, response, options) {
                                console.error(self.viewName + '.update', self.modelNameLabelLowerCase + ' save', model, response, options);
                                growl(response.msg, 'error');
                            }
                        })
                ).then(function () {
                    window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                });
            }
        },
        saveEditForm: function (data) {
            let self = this;
            let bSave = true;
            if (bSave) {
                let bFetchCollection = true;
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                self.model.url = self.getModelUrl(self.model.get(self.model.idAttribute));
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

                                self.collection.url = self.getCollectionUrl();
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

            let sequenceNumber = self.collection.fullCollection.models.length > 0 ? _.max(self.collection.fullCollection.models, function (project) {
                return parseInt(project.get("SequenceNumber"));
            }).get('SequenceNumber') : 1;

            let tplVars = {
                SiteID: self.sitesDropdownView.model.get(self.sitesDropdownView.model.idAttribute),
                SiteStatusID: self.siteYearsDropdownView.model.get(self.siteYearsDropdownView.model.idAttribute),
                yesNoIsActiveOptions: self.model.getYesNoOptions(true, 'Yes'),
                yesNoOptions: self.model.getYesNoOptions(true),
                contactSelect: contactSelect.getHtml(),
                primarySkillNeededOptions: self.model.getSkillsNeededOptions(true, ''),
                statusOptions: self.model.getStatusOptions(true, 'Pending'),
                projectSendOptions: self.model.getSendOptions(true),
                SequenceNumber: sequenceNumber + 1,
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
                SiteID: self.sitesDropdownView.model.get(self.sitesDropdownView.model.idAttribute),
                SiteStatusID: self.siteYearsDropdownView.model.get(self.siteYearsDropdownView.model.idAttribute),
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
                attributes['SequenceNumber'] = self.collection.fullCollection.length;
            }
            // Need to add some default values to the attributes array for fields we do not show in the create form
            attributes['Attachments'] = '';
            _log('App.Views.Project.create', attributes, self.model, self.collection);
            let newModel = new App.Models.Project();
            newModel.url = self.getModelRoute();
            $.when(
                newModel.save(attributes,
                    {
                        success: function (model, response, options) {
                            window.growl(response.msg, response.success ? 'success' : 'error');
                            //App.Vars.currentProjectID = !_.isUndefined(response.ProjectID) ? response.ProjectID : null;
                            self.setViewDataStoreValue('current-model-id', !_.isUndefined(response[App.Models.Project.idAttribute]) ? response[App.Models.Project.idAttribute] : null);
                            self.collection.url = self.getCollectionUrl(self.getCollectionQueryString());
                            $.when(
                                self.collection.fetch({reset: true})
                            ).then(function () {
                                //initialize your views here
                                self.refocusGridRecord();
                                _log('App.Views.Project.create.event', 'project collection fetch promise done');
                                //self.$el.find('tbody tr:first-child').trigger('focusin');
                            });
                        },
                        error: function (model, response, options) {
                            window.growl(response.msg, 'error');
                        }
                    })
            ).then(function () {
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                self.trigger('toggle-tabs-box');
            });

        }



    });
})(window.App);
