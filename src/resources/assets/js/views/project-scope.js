(function (App) {
    App.Views.ProjectScope = App.Views.Backend.extend({
        template: template('projectScopeTemplate'),
        viewName: 'project-scope-view',
        events: {
            'change .list-item-input': 'listChanged',
            'invalid .list-item-input': 'flagAsInvalid',
        },
        initialize: function (options) {
            let self = this;

            try {
                _.bindAll(self, 'render', 'handleProjectIDChange');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            self._initialize(options);
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            self.sitesDropdownView = self.options.parentView.sitesDropdownView;
            self.projectsDropDownView = self.options.parentView.projectsDropDownView;
            self.listenTo(self.projectsDropDownView, "project-id-change", self.handleProjectIDChange);
        },
        handleProjectIDChange: function(e){
            let self = this;
            self.model.set('ProjectID',e.ProjectID);
            self.render();
        },
        render: function (e) {
            let self = this;
            if (_.isUndefined(self.model.get(self.model.idAttribute)) || _.isEmpty(self.model.get(self.model.idAttribute))){
                self.$el.html('No Projects Found');
            } else {


                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                self.model.url = self.getModelUrl(self.model.get(self.model.idAttribute));
                $.when(
                    self.model.fetch({reset: true})
                ).then(function () {
                    console.log('project scope model',  self.model)
                    let contactSelect = new App.Views.Select({
                        el: '',
                        attributes: {id: 'ContactID', name: 'selectContactID', class: 'form-control'},
                        buildHTML: true,
                        collection: App.Collections.contactsManagementCollection,
                        optionValueModelAttrName: 'ContactID',
                        optionLabelModelAttrName: ['LastName', 'FirstName', 'Title']
                    });
                    self.childViews.push(contactSelect);
                    let sequenceNumber = 9;

                    let tplVars = {
                        projectAttributes: App.Collections.projectAttributesManagementCollection.where({workflow_id: 1}),
                        attributesOptions: App.Collections.attributesManagementCollection.getTableOptions('projects', false),
                        workflowOptions: App.Collections.workflowManagementCollection.getOptions(false),
                        projectTypeOptions: App.Models.projectModel.getSkillsNeededOptions(true, 'General'),
                        SiteID: self.sitesDropdownView.model.get(self.sitesDropdownView.model.idAttribute),
                        //SiteStatusID: self.siteYearsDropdownView.model.get(self.siteYearsDropdownView.model.idAttribute),
                        contactSelect: contactSelect.getHtml(),
                        options: {
                            yesNoIsActiveOptions: App.Models.projectModel.getYesNoOptions(true, 'Yes'),
                            bool: '',
                            permit_required_status_options: App.Models.projectModel.getPermitRequiredStatusOptions(true),
                            permit_required_options: App.Models.projectModel.getPermitRequiredOptions(true),
                            project_skill_needed_options: App.Models.projectModel.getSkillsNeededOptions(true),
                            project_status_options: App.Models.projectModel.getStatusOptions(true, 'Pending'),
                            send_status_options: App.Models.projectModel.getSendOptions(true),
                            when_will_project_be_completed_options: App.Models.projectModel.getWhenWillProjectBeCompletedOptions(true)
                        },
                        SequenceNumber: sequenceNumber,
                        OriginalRequest: '',
                        ProjectDescription: '',
                        Comments: '',
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
                    self.$el.html(self.template(tplVars));
                    window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                });
            }

            return self;
        },

        setGridManagerContainerToolbar: function ($gridManagerContainerToolbar) {
            let self = this;
            self.$gridManagerContainerToolbar = $gridManagerContainerToolbar;
        },
        flagAsInvalid: function (e) {
            let self = this;
            console.log('flagAsInvalid', {e: e, currentTarget: e.currentTarget})
            $(e.currentTarget).css('border-color', 'red');
        }
    });
})(window.App);
