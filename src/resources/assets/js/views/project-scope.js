(function (App) {
    App.Views.ProjectScope = App.Views.Backend.extend({
        template: template('projectScopeTemplate'),
        viewName: 'project-scope-view',
        events: {
            'change input,textarea,select': 'formChanged',
            'click .admin__actions-switch': 'formChanged',
            'invalid .list-item-input': 'flagAsInvalid',
            'click [name^="primary_skill_needed"]': 'handleProjectTypeChange',
            'change [name="permit_required"]': 'handlePermitRequiredChange',
            'change [name="status"]': 'handleStatusChange',
            'click .add-material-needed-and-cost': 'addMaterialAndCostRow',
            'click .calculate-total-from-material-cost': 'calculateFromMaterialAndCost',
            'click .add-project-attachment': 'clickFileUpload',
            'click .project-attachment-delete': 'deleteProjectAttachment',
            'click .email-project-report': 'emailProjectReport',
            'click .check-all-leadership': 'checkAllLeadership',
            'click [data-widget="custom-collapse"]': 'toggleCollapse'
        },
        initialize: function (options) {
            let self = this;

            try {
                _.bindAll(self, 'render', 'formChanged', 'handleProjectIDChange', 'handleProjectTypeChange', 'handlePermitRequiredChange', 'addMaterialAndCostRow', 'calculateFromMaterialAndCost', 'saveProjectAttachments', 'clickFileUpload', 'deleteProjectAttachment', 'emailProjectReport', 'checkAllLeadership');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            self._initialize(options);
            // <i class="fas fa-tasks"></i>
            // <i class="fas fa-exclamation-triangle"></i>
            // <i class="far fa-check-circle"></i>
            self.workflowState = {};
            self.currentProjectTypes = null;
            self.workflowStatusLabelWaitingClass = 'label-default';
            self.workflowStatusLabelNotFinishClass = 'label-warning';
            self.workflowStatusLabelLateClass = 'label-danger';
            self.workflowStatusLabelDoneClass = 'label-success';
            self.defaultWorkflowStatusLabelClass = self.workflowStatusLabelWaitingClass;

            self.workflowStatusIconNotFinishClass = 'fa-tasks';
            self.workflowStatusIconLateClass = 'fa-exclamation-triangle';
            self.workflowStatusIconDoneClass = 'fa-check-circle';
            self.defaultWorkflowStatusIconClass = self.workflowStatusIconNotFinishClass;

            self.bIsAddNew = false;
            self.bDoneLoadingForm = false;
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            self.sitesDropdownView = self.options.parentView.sitesDropdownView;
            self.projectsDropDownView = self.options.parentView.projectsDropDownView;
            self.listenTo(self.projectsDropDownView, "project-id-change", self.handleProjectIDChange);
            self.workflowOptions = JSON.parse(JSON.stringify(App.Collections.workflowManagementCollection.getOptions(false)));
            self.initialWorkflowId = self.workflowOptions[0].id;
            self.initialWorkflowCode = self.workflowOptions[0].workflow_code;
            self.initialWorkflowLabel = self.workflowOptions[0].label;
            self.initialWorkflowStatusLabelClass = self.workflowStatusLabelNotFinishClass;
            self.projectAttributes = JSON.parse(JSON.stringify(App.Collections.projectAttributesManagementCollection));
            self.attributesOptions = JSON.parse(JSON.stringify(App.Collections.attributesManagementCollection.getTableOptions('projects', false)));
            //console.log({attributesOptions: self.attributesOptions})
            self.aCurrentProjectTypeAttributes = [];
            self.projectAttributeWorkflowIds = {};
            // for(let i = 1; i <= self.workflowOptions.length; i++){
            //     self.projectAttributes = self.projectAttributes.concat(JSON.parse(JSON.stringify(App.Collections.projectAttributesManagementCollection.where({workflow_id: i}))));
            // }
            self.workflowRequirementsConfig = {};
            self.setProjectWorkflowConfig();
            self.attributesOptionsCnt = self.attributesOptions.length;

            self.selectOptions = {
                yesNoIsActiveOptions: App.Models.projectModel.getYesNoOptions(true, 'Yes'),
                bool: '',
                permit_required_status_options: App.Models.projectModel.getPermitRequiredStatusOptions(true),
                permit_required_options: App.Models.projectModel.getPermitRequiredOptions(true),
                project_skill_needed_options: App.Models.projectModel.getSkillsNeededOptions(true),
                project_status_options: App.Models.projectModel.getStatusOptions(true, 'Pending'),
                send_status_options: App.Models.projectModel.getSendOptions(true),
                when_will_project_be_completed_options: App.Models.projectModel.getWhenWillProjectBeCompletedOptions(true)
            };
            self.projectScopeContacts = [];
            self.projectScopeTeam = [];

        },
        toggleCollapse: function (e) {
            let self = this;
            e.preventDefault();
            let $btn = $(e.currentTarget);
            let $icon = $btn.find('i');
            $($btn.data('target')).toggle();

            if ($icon.hasClass('fa-plus')) {
                $icon.removeClass('fa-plus').addClass('fa-minus');
            } else {
                $icon.removeClass('fa-minus').addClass('fa-plus');
            }
        },
        initWorkflowDisplay: function () {
            let self = this;
            var $boxOne = self.$('.workflow-status-display .workflow-status-display-progress-box');
            let $progressBox = $boxOne.find('.wf-progress');
            _.each(self.workflowOptions, function (workflow, idx) {
                if (!$progressBox.find('.point[data-workflow-id="' + workflow.id + '"]').length) {
                    // <i class="fas fa-exclamation-triangle"></i>
                    // exclamation-circle <i class="fas fa-exclamation-circle"></i>
                    // <i class="far fa-check-circle"></i>
                    let pointActive = 'point--active';
                    let pointComplete = 'point--complete';
                    let pointClasses = '';
                    let str = '<div data-workflow-id="' + workflow.id + '" data-workflow-code="' + workflow.workflow_code + '" class="point ' + pointClasses + '">' +
                        '    <div class="bullet"></div>' +
                        '    <label class="wf-label">' + workflow.label + '</label>' +
                        '</div>';

                    $progressBox.append($(str));
                }
            });
            var boxOne = new TimelineMax();

            boxOne.to($boxOne, 0.6, {
                opacity: 1,
                scale: 1,
                ease: Back.easeOut
            }, 1.2);

            /**
             * Point Animation
             */
            $('.point').on('click', function (e) {
                var getTotalPoints = $('.point').length,
                    getIndex = $(this).index(),
                    getCompleteIndex = $('.point--active').index();

                TweenMax.to($('.bar__fill'), 0.6, {
                    width: (getIndex - 1) / (getTotalPoints - 1) * 100 + '%'
                });

                if (getIndex => getCompleteIndex) {
                    $('.point--active').addClass('point--complete').removeClass('point--active');

                    $(this).addClass('point--active');
                    $(this).prevAll().addClass('point--complete');
                    $(this).nextAll().removeClass('point--complete');
                }
            });

            /*
              Demo Purposes
            */
            var progressAnimation = function () {
                var getTotalPoints = $('.point').length,
                    getIndex = Math.floor(Math.random() * 4) + 1,
                    getCompleteIndex = $('.point--active').index();

                TweenMax.to($('.bar__fill'), 0.6, {
                    width: (getIndex - 1) / (getTotalPoints - 1) * 100 + '%'
                });

                if (getIndex => getCompleteIndex) {
                    $('.point--active').addClass('point--complete').removeClass('point--active');

                    $('.point:nth-child(' + (getIndex + 1) + ')').addClass('point--active');
                    $('.point:nth-child(' + (getIndex + 1) + ')').prevAll().addClass('point--complete');
                    $('.point:nth-child(' + (getIndex + 1) + ')').nextAll().removeClass('point--complete');
                }
            };
            //progressAnimation();
            // var animateProgress = setInterval(progressAnimation, 1200);
            //
            // $(document).hover(function() {
            //     clearInterval(animateProgress)
            // });
        },
        getAttributeFormElementName: function(attributeCode){
            let self =this;
            let name = '';
            let result = App.Collections.attributesManagementCollection.where({attribute_code:attributeCode});
            let attribute = result[0];
            if(attribute.get('input')==='bool' || attribute.get('input')==='checkbox'){
                name = attributeCode + '[]';
            } else {
                name = attributeCode;
            }
            return name;
        },
        getAttributeFormElementValue: function($el){
            let elementType = $el[0].type;
            let value = '';
            if(elementType === 'checkbox'){
                let $checkedBoxes = $($el.attr('name')+':checked');
                if($checkedBoxes.length){
                    value = [];
                    $checkedBoxes.each(function(box){
                        value.push($(box).val());
                    });
                }
            } else if(elementType === 'radio') {
                let $checkedRadio = $($el.attr('name')+':checked');
                if($checkedRadio.length){
                    value = $checkedRadio.val();
                }
            } else if(elementType === 'select') {
                value = $el.val();
            } else {
                value = $el.val();
            }
            return value;
        },
        getAttributeMeetsWorkflowRequirement: function(workflowId,attributeId,bUseForm,dependentOn,dependentOnCond){
            let self = this;
            let bMeetsRequirement = false;
            let attribute = App.Collections.attributesManagementCollection.get(parseInt(attributeId));
            let attributeCode = attribute.get('attribute_code');
            let attributeValue;
            let bIsDependent = !_.isNull(dependentOn) && !_.isUndefined(dependentOn);
            if (bIsDependent) {
                let bIsRequired = true;
                let dependsOnAttribute = App.Collections.attributesManagementCollection.get(parseInt(dependentOn));
                //console.log({dependentOn:dependentOn,dependsOnAttribute:dependsOnAttribute})

                let dependsOnAttributeInputType = dependsOnAttribute.get('input');
                let bIsSelectType = (dependsOnAttributeInputType === 'select' || dependsOnAttributeInputType === 'bool');
                let dependsOnAttributeCode = dependsOnAttribute.get('attribute_code');
                let dependsOnAttributeValue;

                if(bUseForm){
                    bIsRequired = self.getAttributeIsWorkflowRequirement(parseInt(dependentOn));
                    if(bIsRequired){
                        attributeValue = self.getAttributeFormElementValue($('[name="' + self.getAttributeFormElementName(attributeCode) + '"]'));
                        bMeetsRequirement = attributeValue !== '';
                    } else {
                        bMeetsRequirement = true;
                    }
                } else {
                    attributeValue = self.model.get(attributeCode);
                    dependsOnAttributeValue = self.model.get(dependsOnAttributeCode);
                    if (bIsSelectType) {
                        _.each(dependentOnCond.split(/,/), function (val, key) {
                            if (val.match(/^not/)) {
                                let optionVal = val.replace(/^not /, '');
                                if(dependsOnAttributeValue.toString() === optionVal){
                                    bIsRequired = false;
                                }
                            } else {
                                if(dependsOnAttributeValue.toString() !== val){
                                    bIsRequired = false;
                                }

                            }
                        });
                        if(bIsRequired){
                            bMeetsRequirement = attributeValue !== '';
                        } else {
                            bMeetsRequirement = true;
                        }
                    } else {
                        bIsRequired = dependsOnAttributeValue === dependentOnCond;
                        if(bIsRequired){
                            bMeetsRequirement = attributeValue !== '';
                        } else {
                            bMeetsRequirement = true;
                        }
                    }

                    //console.log({bMeetsRequirement:bMeetsRequirement,workflowId:workflowId,attribute_code:attributeCode,attributeValue:attributeValue,dependentOnCond:dependentOnCond})
                }
            } else {

                if(bUseForm){
                    attributeValue = self.getAttributeFormElementValue($('[name="' + attributeCode + '"]'));
                } else {

                    attributeValue = self.model.get(attributeCode);

                    //console.log({bMeetsRequirement:bMeetsRequirement,workflowId:workflowId,attribute_code:attributeCode,value:value,isNull:_.isNull(value),isUndef:_.isUndefined(value)})
                }
                bMeetsRequirement = attributeValue !== '';
            }



            return bMeetsRequirement;
        },
        updateProjectWorkflowState: function (bUseForm=true) {
            let self = this;
            let req = self.getApplicableWorkflowRequirements();
            self.workflowState = {};
            let lastCompleted = false;
            let foundInProgress = false;
            _.each(self.workflowOptions, function(wfOption,idx){
                let bComplete = true;
                let workflowId = wfOption.id;
                _.each(req.requirements[workflowId], function(reqData,key){
                    if(!self.getAttributeMeetsWorkflowRequirement(workflowId,reqData.attribute_id,bUseForm)){
                        bComplete = false;
                    }
                });
                _.each(req.dependents[workflowId], function(reqData,key){
                    if(!self.getAttributeMeetsWorkflowRequirement(workflowId,reqData.attribute_id,bUseForm,reqData.workflow_requirement_depends_on,reqData.workflow_requirement_depends_on_condition)){
                        bComplete = false;
                    }
                });
                if (_.isUndefined(self.workflowState[workflowId])) {
                    self.workflowState[workflowId]={complete:false, in_progress:false, late:false};
                }
                self.workflowState[workflowId].complete = bComplete;
                if(foundInProgress === false && lastCompleted === false && !bComplete){
                    self.workflowState[workflowId].in_progress = true;
                    foundInProgress = true;
                }
                lastCompleted = bComplete;
            });
            console.log({workflowState:self.workflowState})

        },
        getApplicableWorkflowRequirements: function(){
            let self = this;
            // console.log('getProjectWorkflowState', {
            //     model: self.model,
            //     workflowOptions: self.workflowOptions,
            //     projectAttributes: self.projectAttributes,
            //     currentProjectTypes:self.currentProjectTypes
            // });

            let applicableRequirements = {};
            let applicableDependents = {};
            _.each(self.workflowRequirementsConfig.requirements, function(projectTypeRequirements,workflowId){
                if(_.isUndefined(applicableRequirements[workflowId])){
                    applicableRequirements[workflowId] = [];
                }
                _.each(self.currentProjectTypes,function(projectTypeId,key){
                    _.each(projectTypeRequirements[projectTypeId],function(reqData,key){
                        if (!_.where(applicableRequirements[workflowId],{attribute_id:reqData.attribute_id}).length) {
                            applicableRequirements[workflowId].push(reqData);
                        }
                    })
                });

            });
            _.each(self.workflowRequirementsConfig.dependents, function(projectTypeRequirements,workflowId){
                if(_.isUndefined(applicableDependents[workflowId])){
                    applicableDependents[workflowId] = [];
                }
                _.each(self.currentProjectTypes,function(projectTypeId,key){
                    _.each(projectTypeRequirements[projectTypeId],function(reqData,key){
                        if (!_.where(applicableDependents[workflowId],{attribute_id:reqData.attribute_id}).length) {
                            applicableDependents[workflowId].push(reqData);
                        }
                    })
                });

            });
            //console.log({applicableRequirements:applicableRequirements,applicableDependents:applicableDependents})
            return {requirements: applicableRequirements,dependents: applicableDependents};
        },
        setProjectWorkflowConfig: function () {
            let self = this;

            let aSkillIds = App.Models.projectModel.getSkillsNeededIdList();
            let workflowRequirements = {};
            let workflowDependsOn = {};
            _.each(self.workflowOptions, function(wfOption,idx){
                let workflowId = wfOption.id;
                _.each(aSkillIds, function(aSkill,idx){
                    let skillId = parseInt(aSkill.id);
                    if (_.isUndefined(workflowRequirements[workflowId])) {
                        workflowRequirements[workflowId]={};
                    }
                    if (_.isUndefined(workflowRequirements[workflowId][aSkill.id])) {
                        workflowRequirements[workflowId][aSkill.id]=[];
                    }
                    workflowRequirements[workflowId][aSkill.id] = _.where(self.projectAttributes,{workflow_id:workflowId,workflow_requirement:1,project_skill_needed_option_id:skillId});

                    if (_.isUndefined(workflowDependsOn[workflowId])) {
                        workflowDependsOn[workflowId]={};
                    }
                    if (_.isUndefined(workflowDependsOn[workflowId][aSkill.id])) {
                        workflowDependsOn[workflowId][aSkill.id]=[];
                    }
                    workflowDependsOn[workflowId][aSkill.id] = _.where(self.projectAttributes,{workflow_id:workflowId,workflow_requirement:3,project_skill_needed_option_id:skillId});
                })

            });

            self.workflowRequirementsConfig = {requirements: workflowRequirements, dependents: workflowDependsOn};
            //console.log('setProjectWorkflowConfig',{workflowRequirementsConfig:self.workflowRequirementsConfig,workflowRequirements:workflowRequirements,workflowDependsOn:workflowDependsOn})
        },
        formChanged: function () {
            let self = this;
            if (self.bDoneLoadingForm) {
                self.trigger('changed');
            }
        },
        handleStatusChange: function (e) {
            let self = this;
            let status = parseInt(self.$('[name="status"]').val());

            if (status === App.Vars.selectOptions['ProjectStatusOptions']['Approved'] || status === App.Vars.selectOptions['ProjectStatusOptions']['Pending']) {
                self.$('[name="status_reason"]').val('').parents('.dynamic').addClass('hide');
            } else {
                self.$('[name="status_reason"]').parents('.dynamic').removeClass('hide');
            }
        },
        handleProjectIDChange: function (e) {
            let self = this;
            self.model.set('ProjectID', e.ProjectID);
            self.bDoneLoadingForm = false;
            if (e.ProjectID === 'new') {
                self.bIsAddNew = true;
            }
            self.render();
        },
        setCurrentProjectTypes: function (bUseCurrentForm = false) {
            let self = this;
            if (bUseCurrentForm) {
                let $checked = self.$('[name^="primary_skill_needed"]:checked');
                if ($checked.length === 0) {
                    alert('There needs to be at least one Project Type. Defaulting to General');
                    self.$('#primary_skill_needed_' + App.Vars.selectOptions['ProjectSkillNeededOptions']['General']).prop('checked', true);

                    $checked = self.$('[name^="primary_skill_needed"]:checked');
                }
                let aIds = [];
                $checked.each(function (idx, el) {
                    aIds.push($(el).val());
                });
                self.currentProjectTypes = aIds;
            } else {
                //console.log('setCurrentProjectTypes',{model:JSON.parse(JSON.stringify(self.model))})
                self.currentProjectTypes = self.model.get('primary_skill_needed') !== '' ? JSON.parse(self.model.get('primary_skill_needed')) : [App.Vars.selectOptions['ProjectSkillNeededOptions']['General']];
            }

        },
        getCurrentProjectTypes: function () {
            let self = this;
            if(_.isNull(self.currentProjectTypes)){
                self.setCurrentProjectTypes();
            }

            return self.currentProjectTypes;
        },
        render: function (e) {
            let self = this;
            if (_.isUndefined(self.model.get(self.model.idAttribute)) || self.model.get(self.model.idAttribute) === '') {
                self.$el.html('No Projects Found');
            } else {
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                self.model.url = self.getModelUrl(self.model.get(self.model.idAttribute));
                $.when(
                    self.model.fetch({reset: true})
                ).then(function () {
                    //console.log('project scope model', self.model)

                    if (self.model.get(self.model.idAttribute) === null && self.model.get("SequenceNumber") === 99999) {
                        let sequenceNumber = self.projectsDropDownView.collection.models.length > 0 ? _.max(self.projectsDropDownView.collection.models, function (project) {
                            return parseInt(project.get("SequenceNumber"));
                        }).get('SequenceNumber') : 1;

                        self.model.set('SequenceNumber', sequenceNumber + 1);
                    }
                    self.projectScopeContacts = self.model.get('contacts');
                    let contactSelect = new App.Views.Select({
                        el: '',
                        attributes: {id: 'ContactID', name: 'selectContactID', class: 'form-control'},
                        buildHTML: true,
                        bAllowMultiple: true,
                        collection: App.Collections.contactsManagementCollection,
                        optionValueModelAttrName: 'ContactID',
                        optionLabelModelAttrName: ['LastName', 'FirstName', 'Title']
                    });
                    self.childViews.push(contactSelect);
                    self.setCurrentProjectTypes();
                    //self.currentProjectTypes = self.getCurrentProjectTypes();

                    let defaultProjectTypeOptions = [];
                    _.each(self.currentProjectTypes, function (val, idx) {
                        defaultProjectTypeOptions.push(self.getSkillsNeededLabel(val));
                    });
                    self.updateProjectWorkflowState(false);
                    self.workflow_state = 1;//self.bIsAddNew ? 1 : self.updateProjectWorkflowState();
                    //console.log('render', {currentTypes: self.currentProjectTypes, defaultProjectTypeOptions: defaultProjectTypeOptions})
                    let tplVars = {
                        projectTypeCheckboxList: App.Models.projectModel.getSkillsNeededCheckboxList(true, defaultProjectTypeOptions.join(',')),
                        SiteID: self.sitesDropdownView.model.get(self.sitesDropdownView.model.idAttribute),
                        teamMembers: self.getTeamMembersList(),
                        contactSelect: contactSelect.getHtml(),
                        project: self.model,
                        initialWorkflowId: self.initialWorkflowId,
                        initialWorkflowCode: self.initialWorkflowCode,
                        initialWorkflowLabel: self.initialWorkflowLabel,
                        defaultWorkflowStatusLabelClass: self.initialWorkflowStatusLabelClass,
                        defaultWorkflowStatusIconClass: self.defaultWorkflowStatusIconClass
                    };
                    self.$el.html(self.template(tplVars));

                    if (self.$('[name="Comments"]').val() === '') {
                        self.$('[name="Comments"]').attr('rows', 3);
                    }

                    _.each(self.workflowOptions, function (workflow, idx) {
                        if (!$('.workflow-attributes-group[data-workflow-id="' + workflow.id + '"]').length) {
                            // <i class="fas fa-exclamation-triangle"></i>
                            // exclamation-circle <i class="fas fa-exclamation-circle"></i>
                            // <i class="far fa-check-circle"></i>
                            let $workflowFieldset = $('<fieldset class="workflow-attributes-group" data-workflow-id="' + workflow.id + '" data-workflow-code="' + workflow.workflow_code + '"><legend>Information Needed During <span class="label label-default">' + workflow.label + '</span> Stage <span class="workflow-status-label label ' + self.defaultWorkflowStatusLabelClass + '"><i class="fas ' + self.defaultWorkflowStatusIconClass + '"></i></span></legend><div class="workflow-attributes-group-content"></fieldset>');
                            self.$('[name="projectScope"]').append($workflowFieldset);
                        }
                    });
                    self.initWorkflowDisplay();
                    self.finishRenderingForm();

                    if (self.bIsAddNew) {
                        self.sitesDropdownView.$el.prop('disabled', true);
                        self.projectsDropDownView.$el.prepend('<option>New Project</option>');
                        self.projectsDropDownView.$el.prop('disabled', true);
                    } else {

                    }
                });
            }

            return self;
        },
        getWorkflowIdByAttributeId: function (attributeId) {
            let self = this;
            if (_.isUndefined(self.projectAttributeWorkflowIds[attributeId])) {
                let aResults = App.Collections.projectAttributesManagementCollection.where({attribute_id: attributeId});
                if (aResults.length) {
                    self.projectAttributeWorkflowIds[attributeId] = aResults[0].get('workflow_id');
                } else {
                    // default to 1 to keep attributes from disappearing
                    self.projectAttributeWorkflowIds[attributeId] = 1;
                }
            }

            return self.projectAttributeWorkflowIds[attributeId];
        },
        checkAllLeadership: function (e) {
            let self = this;
            let $checkbox = $(e.currentTarget);

            if ($checkbox.prop('checked')) {
                self.$('[name="email_team_member[]"]').each(function (idx, el) {
                    let $el = $(el);
                    if (!$el.prop('checked')) {
                        $el.prop('checked', true);
                        $el.attr('checked', 'checked');
                    }
                })
            } else {
                self.$('[name="email_team_member[]"]').each(function (idx, el) {
                    let $el = $(el);
                    if ($el.prop('checked')) {
                        $el.prop('checked', false);
                        $el.removeAttr('checked');
                    }
                })
            }
        },
        emailProjectReport: function (e) {
            let self = this;
            e.preventDefault();

            let emails = [];
            $('[name="email_team_member[]"]').each(function (idx, el) {
                if ($(el).prop('checked')) {
                    emails.push($(el).val());
                }
            });
            //console.log({emails:emails,siteId:self.getViewDataStore('current-site-id','project_scope_management'),sitestatusid:self.getViewDataStore('current-site-status-id','project_scope_management'),modelid:self.getViewDataStore('current-model-id','project_scope_management')});
            if (emails.length) {
                let $btn = $(e.currentTarget);
                $btn.siblings('.spinner').remove();
                $btn.before(App.Vars.spinnerHtml);

                let data = {
                    SiteID: self.getViewDataStore('current-site-id', 'project_scope_management'),
                    SiteStatusID: self.getViewDataStore('current-site-status-id', 'project_scope_management'),
                    ProjectID: self.getViewDataStore('current-model-id', 'project_scope_management'),
                    emails: emails,
                    site_wide: false
                };

                let growlMsg = '';
                let growlType = '';
                $.when(
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: 'admin/project_scope/email_report',
                        data: data,
                        success: function (response) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';

                        },
                        fail: function (response) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                        }
                    })
                ).then(function () {
                    growl(growlMsg, growlType);
                    $btn.siblings('.spinner').remove();
                });
            } else {
                growl('Please check a team member to be emailed.', 'error');
            }
        },
        getTeamMembersList: function () {
            let self = this;
            let html = '';
            self.projectScopeTeam = self.model.get('team');
            html = '<table class="table team">';
            html += '<thead><tr><th style="width:auto">Role</th><th>Name</th><th>Mobile</th><th>Home</th><th>Email</th><th>Status</th></tr></thead>';
            html += '<tbody>';
            for (let x = 0; x < self.projectScopeTeam.length; x++) {
                let mobilePhone = !_.isNull(self.projectScopeTeam[x]['MobilePhoneNumber']) ? self.projectScopeTeam[x]['MobilePhoneNumber'] : '';
                let homePhone = !_.isNull(self.projectScopeTeam[x]['HomePhoneNumber']) ? self.projectScopeTeam[x]['HomePhoneNumber'] : '';
                let email = !_.isNull(self.projectScopeTeam[x]['Email']) ? self.projectScopeTeam[x]['Email'] : '';
                let fname = !_.isNull(self.projectScopeTeam[x]['FirstName']) ? self.projectScopeTeam[x]['FirstName'] : '';
                let lname = !_.isNull(self.projectScopeTeam[x]['LastName']) ? self.projectScopeTeam[x]['LastName'] : '';

                html += '<tr><td><label class="checkbox-inline"><input type="checkbox" name="email_team_member[]" value="' + email + '"/>&nbsp;' + self.projectScopeTeam[x]['Role'] + '</label></td><td>' + fname + ' ' + lname + '</td><td>' + mobilePhone + '</td><td>' + homePhone + '</td><td><a target="_blank" href="mailto:' + email + '">' + email + '</a></td><td>' + self.projectScopeTeam[x]['ProjectVolunteerRoleStatusLabel'] + '</td></tr>';
                if (self.projectScopeTeam[x]['Comments'] !== '') {
                    html += '<tr><td class="comments-row" colspan="6"><strong>Comments:</strong> ' + self.projectScopeTeam[x]['Comments'] + '</td></tr>';
                }
            }
            html += '</tbody>';
            if (self.projectScopeTeam.length) {
                html += '<tfoot><tr><td colspan="2"><label class="checkbox-inline"><input type="checkbox" class="check-all-leadership" name="check-all-leadership"/> Select all</label></td><td colspan="4" align="right"><button class="btn btn-primary email-project-report">Email Project Report to checked leadership team members</button></td></tr></tfoot>';
            }
            html += '</table>';
            return html;
        },
        addMaterialAndCostRow: function (e) {
            let self = this;
            e.preventDefault();
            let $table = self.$('.material-needed-and-cost');
            let x = $table.find('tbody > tr').length;
            let attribute_id = _.findWhere(self.attributesOptions, {attribute_code: 'material_needed_and_cost'}).attribute_id;
            let row = self.getMaterialCostRowHtml('material_needed_and_cost', x, attribute_id, ['', '']);
            $table.find('tbody').append(row);
        },
        calculateFromMaterialAndCost: function (e) {
            let self = this;
            e.preventDefault();
            let totalCost = 0.00;
            self.$('[name^="material_needed_and_cost[cost]"]').each(function (idx, el) {
                let amt = $(el).val();
                if (amt !== '') {
                    totalCost += parseFloat(amt);
                }
            });
            self.$('#estimated_total_cost').val(totalCost.toFixed(2));
        },
        handlePermitRequiredChange: function (e) {
            let self = this;
            if ($(e.currentTarget).val() === "2") {
                self.$('[name="permit_required_for"]').parent().removeClass('hide');
            } else if ($(e.currentTarget).val() === "3") {
                self.$('[name="permit_required_for"]').parent().addClass('hide');
                self.$('[name="would_like_team_lead_to_contact"]').parent().removeClass('hide');
            } else {
                self.$('[name="permit_required_for"]').parent().addClass('hide');
                self.$('[name="would_like_team_lead_to_contact"]').parent().addClass('hide');
            }
        },
        handleProjectTypeChange: function (e) {
            let self = this;

            let typesBeforeChange = _.clone(self.currentProjectTypes);
            self.setCurrentProjectTypes(true);

            let removed = _.difference(typesBeforeChange, self.currentProjectTypes);
            if (removed.length) {
                _.each(removed, function (project_type_id, idx) {
                    _.each(self.getProjectTypeAttributes(project_type_id), function (pta, idx) {
                        let attribute = _.where(self.attributesOptions, {id: pta.attribute_id});
                        //console.log(self.$('[name="'+ attribute[0].attribute_code+'"]'),project_type_id, pta.attribute_id,attribute)
                        let defaultValue = attribute.input === 'input' || attribute.input === 'textarea' ? self.cleanTextInputValue(attribute[0].default_value) : attribute[0].default_value;
                        self.$('[name="' + attribute[0].attribute_code + '"]').val(defaultValue);
                    });
                })
            }


            self.buildFormElements(self.currentProjectTypes);
        },
        finishRenderingForm: function () {
            let self = this;

            self.buildFormElements(self.currentProjectTypes);

            self.$('[name="Active"]').val(self.model.get('Active')).trigger('change');
            if (self.projectScopeContacts.length) {
                self.$('[name="selectContactID"] option').each(function (idx, option) {
                    let val = parseInt($(option).val());
                    if (_.indexOf(self.projectScopeContacts, val) !== -1) {
                        $(option).prop("selected", true);
                    }
                });
            }

            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            self.bDoneLoadingForm = true;
        },
        getProjectTypeAttributes: function (id) {
            let self = this;
            //console.log('getProjectTypeAttributes',{id:id,  projectAttributes: self.projectAttributes});
            return _.where(self.projectAttributes, {project_skill_needed_option_id: parseInt(id)});
        },
        getMaterialNeededAndCostItemCnt: function () {
            let self = this;
            let lineCnt = self.model.get('material_needed_and_cost') !== '' ? JSON.parse(self.model.get('material_needed_and_cost')).length : 0;
            // provide an empty line to be nice
            return lineCnt > 5 ? lineCnt + 1 : 5;
        },
        geProjectAttachmentsItemCnt: function () {
            let self = this;
            let lineCnt = self.model.get('project_attachments') !== '' ? JSON.parse(self.model.get('project_attachments')).length : 0;

            return lineCnt;
        },
        getSkillsNeededLabel: function (id) {
            let skillOpts = {};
            _.each(App.Vars.selectOptions['ProjectSkillNeededOptions'], function (val, key) {
                skillOpts[val] = key;
            });
            return skillOpts[id];
        },
        setSpecialInstructionHelpBlockMsg: function () {
            let self = this;
            let msg = '';
            let skillOpts = {};
            _.each(App.Vars.selectOptions['ProjectSkillNeededOptions'], function (val, key) {
                skillOpts[val] = key;
            });
            self.$('[name^="primary_skill_needed"]:checked').each(function (idx, el) {

                let id = $(el).val();
                //console.log({skillOpts: skillOpts, name:skillOpts[id]});
                switch (skillOpts[id]) {
                    case 'Construction':
                        msg += 'considerations for building…<br>';
                        break;
                    case 'General Carpentry':
                        break;
                    case 'Landscaping':
                        msg += 'i.e. where will the mulch be placed?<br>';
                        break;
                    case 'Painting':
                        msg += 'i.e. will items need to be covered or moved?<br>';
                        break;
                }
            });
            self.$('.help-block.special-instructions').html(msg);
        },
        getMaterialCostRowHtml: function (attribute_code, x, attribute_id, aRowValues) {
            let self = this;
            let materialNeed = self.cleanTextInputValue(aRowValues[0]);
            let cost = self.cleanTextInputValue(aRowValues[1]);
            return '<tr><td><input data-attribute-id="' + attribute_id + '" name="' + attribute_code + '[material][]" class="form-control material" id="' + attribute_code + '_material_' + x + '" placeholder="" value="' + materialNeed + '"/></td><td><div class="input-group"><div class="input-group-addon">$</div><input type="number" title="Money format only please. With or without cents." data-attribute-id="' + attribute_id + '" name="' + attribute_code + '[cost][]" class="form-control material-cost" id="' + attribute_code + '_cost_' + x + '" placeholder="0.00" value="' + cost + '" step="0.01"/></div></td></tr>';
        },
        basename: function (path) {
            let rx1 = /(.*)\/+([^/]*)$/;  // (dir/) (optional_file)
            let rx2 = /()(.*)$/;// ()     (file)
            return (rx1.exec(path) || rx2.exec(path))[2];
        },
        getProjectAttachmentsRowHtml: function (attribute_code, x, attribute_id, aRowValues) {
            let self = this;
            let ProjectAttachmentID = aRowValues[0];
            let url = aRowValues[1];

            return '<tr><td><a href="' + url + '" target="_blank">' + self.basename(url) + '</a></td><td><button class="btn btn-secondary project-attachment-delete" data-id="' + ProjectAttachmentID + '" id="' + attribute_code + '_delete_' + x + '" ><span class="ui-icon ui-icon-trash"></span></button></div></td></tr>';
        },
        getInputHtml: function (inputType, attribute_code, attribute_id, value, optionHtml) {
            let self = this;
            let html = '';
            let pattern = '';
            let placeholder = '';
            let helpBlock = '';
            let bCloseInputGroup = false;

            switch (inputType) {
                case 'table':
                    if (attribute_code === 'material_needed_and_cost') {
                        html = '<table class="table material-needed-and-cost">';
                        html += '<thead><tr><th style="width:80%">Material</th><th>Cost</th></tr></thead>';
                        html += '<tbody>';
                        let aRowValues = value !== '' ? JSON.parse(value) : [];
                        for (let x = 0; x <= self.getMaterialNeededAndCostItemCnt(); x++) {
                            let aRowValue = !_.isUndefined(aRowValues[x]) ? aRowValues[x] : ['', ''];
                            html += self.getMaterialCostRowHtml(attribute_code, x, attribute_id, aRowValue);
                        }
                        html += '</tbody>';
                        html += '<tfoot><tr><td colspan="2" align="right"><button class="btn btn-secondary add-material-needed-and-cost">Add another material</input></td></tr></tfoot>';
                        html += '</table>';
                    } else if (attribute_code === 'project_attachments') {
                        html = '<table class="table project-attachments">';
                        html += '<thead><tr><th style="width:80%">Attachment</th><th></th></tr></thead>';
                        html += '<tbody>';
                        let aRowValues = value !== '' ? JSON.parse(value) : [];
                        _.each(aRowValues, function (val, key) {
                            if (val !== 'undefined') {
                                html += self.getProjectAttachmentsRowHtml(attribute_code, key, attribute_id, [key, val]);
                            }
                        });
                        for (let x = 0; x < self.geProjectAttachmentsItemCnt(); x++) {
                            let aRowValue = !_.isUndefined(aRowValues[x]) ? aRowValues[x] : ['', ''];
                            html += self.getProjectAttachmentsRowHtml(attribute_code, x, attribute_id, aRowValue);
                        }
                        html += '</tbody>';
                        html += '<tfoot><tr><td colspan="2" align="right"><button class="btn btn-secondary add-project-attachment">Add attachment</button></td></tr></tfoot>';
                        html += '</table>';
                    }
                    break;
                case 'text':
                    html += '<input type="text" data-attribute-id="' + attribute_id + '" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="' + placeholder + '" ' + pattern + ' value="' + self.cleanTextInputValue(value) + '"/>';
                    break;
                case 'textarea':
                    if (attribute_code === 'special_instructions') {
                        placeholder = '';
                        helpBlock = '<p class="help-block special-instructions"></p>';
                    }
                    let rowsVisible = value === '' ? 3 : 5;
                    html = '<textarea style="resize:vertical" rows="' + rowsVisible + '" data-attribute-id="' + attribute_id + '" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="' + placeholder + '">' + self.cleanTextInputValue(value) + '</textarea>' + helpBlock;
                    break;
                case 'select':
                    html = '<select data-attribute-id="' + attribute_id + '" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '">' + optionHtml + '</select>';
                    break;
                case 'bool':
                    html = '<div>';
                    for(let x = 0; x <= 1; x++) {
                        let boolLabel = x === 0 ? 'No' : 'Yes';
                        let checked = value === x ? 'checked' : '';
                        html +=
                            '    <label class="bool-label checkbox-inline" for="' + attribute_code + '_'+x+'">' +
                            '        <input type="radio" ' + checked + ' id="' + attribute_code + '_'+x+'" name="' + attribute_code + '[]" value="'+x+'"> ' + boolLabel +
                            '    </label>';
                    }
                    html += '</div>';
                    break;
                case 'number':
                    bCloseInputGroup = false;
                    let numberStepAttr = '';
                    if (attribute_code === 'estimated_total_cost' || attribute_code === 'actual_cost') {
                        bCloseInputGroup = true;
                        html += '<div class="input-group"><div class="input-group-addon">$</div>';
                        placeholder = '';
                        numberStepAttr = ' step="0.01" ';
                        helpBlock = '<p class="help-block">Money format only please. With or without cents. Valid format examples: 0.50 or .50 or 10 or 10.00 or 10.01</p>';
                    }
                    html += '<input data-attribute-id="' + attribute_id + '" type="number" ' + numberStepAttr + ' name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="' + placeholder + '" value="' + value + '"/>';
                    if (bCloseInputGroup) {
                        if (attribute_code === 'estimated_total_cost') {
                            html += '<div class="input-group-btn"><button class="btn btn-primary calculate-total-from-material-cost">Calculate Total From Material Cost</button></div>';
                        }
                        html += '</div>';
                    }
                    html += helpBlock;
                    break;
                default:
                    html = '<input data-attribute-id="' + attribute_id + '" type="text" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="" value="' + self.cleanTextInputValue(value) + '"/>';
            }
            return html;
        },
        getAttachmentModalForm: function () {
            let self = this;
            let template = window.template('newProjectAttachmentTemplate');

            let tplVars = {
                ProjectID: self.model.get(self.model.idAttribute)
            };

            return template(tplVars);
        },
        clickFileUpload: function (e) {
            let self = this;
            e.preventDefault();
            self.getModalElement().one('show.bs.modal', function (event) {
                let $fileInput = null;

                // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
                // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
                let modal = $(this);
                modal.find('.modal-title').html(self.parentView.$('h3.box-title').html());
                modal.find('.modal-body').html(self.getAttachmentModalForm());
                let selfView = modal.find('form[name="newProjectAttachment"]');

                let sAjaxFileUploadURL = '/admin/project_attachment/upload';
                $fileInput = $(selfView.find('input[type="file"]'));
                $fileInput.fileupload({
                    url: sAjaxFileUploadURL,
                    dataType: 'json',
                    done: function (e, data) {
                        //console.log({e:e, data:data,filesClass: selfView.find('[name="files[]"]')})
                        selfView.find('.progress').fadeTo(0, 'slow');
                        selfView.find('[name="AttachmentPath"]').val('');
                        selfView.find('.files').empty();
                        _.each(data.jqXHR.responseJSON.files, function (file, index) {
                            let sFileName = file.name;
                            //let sExistingVal = selfView.find('[name="AttachmentPath"]').val().length > 0 ? selfView.find('[name="AttachmentPath"]').val() + "\n" : '';
                            //selfView.find('[name="AttachmentPath"]').val(sExistingVal + file.url);
                            selfView.find('.files').append(sFileName + '<br>');
                            //console.log({fileUrl:file.url, sExistingVal: sExistingVal,textarea: selfView.find('[name="AttachmentPath"]')});
                        });
                        modal.find('.save.btn').trigger('click')
                    },
                    start: function (e) {
                        selfView.find('.progress').fadeTo('fast', 1);
                        selfView.find('.progress').find('.meter').removeClass('green');
                    },
                    progress: function (e, data) {
                        let progress = parseInt(data.loaded / data.total * 100, 10);
                        selfView.find('.progress .progress-bar').addClass('green').css(
                            'width',
                            progress + '%'
                        ).find('p').html(progress + '%');
                    }
                }).prop('disabled', !$.support.fileInput)
                    .parent().addClass($.support.fileInput ? undefined : 'disabled');
                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    try {
                        $fileInput.fileupload('destroy');
                    } catch (e) {
                    }
                    let data = $.unserialize(modal.find('form').serialize());
                    self.model.set(self.model.idAttribute, data[self.model.idAttribute]);
                    if (modal.find('[name="AttachmentPath"]').val() !== '') {
                        self.saveProjectAttachments(data);
                        self.getModalElement().modal('hide');
                    } else {
                        self.getModalElement().modal('hide');
                        self.render();
                    }


                });

            });
            self.getModalElement().modal('show');
        },
        deleteProjectAttachment: function (e) {
            let self = this;
            e.preventDefault();
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            let growlMsg = '';
            let growlType = '';
            let projectAttachment = new App.Models.ProjectAttachment();
            projectAttachment.set(projectAttachment.idAttribute, $(e.currentTarget).data('id'));
            projectAttachment.url = '/admin/project_attachment/destroy/' + $(e.currentTarget).data('id');
            $.when(projectAttachment.destroy(
                {
                    success: function (model, response, options) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                    },
                    error: function (model, response, options) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                    }
                })).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);

                self.render();
            });
        },
        saveProjectAttachments: function (data) {
            let self = this;
            let projectAttachment = new App.Models.ProjectAttachment();
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            let growlMsg = '';
            let growlType = '';
            //console.log({data:data})
            projectAttachment.url = '/admin/project_attachment';
            $.when(
                projectAttachment.save(data,
                    {
                        success: function (model, response, options) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                        },
                        error: function (model, response, options) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                        }
                    })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                self.model.set(self.model.idAttribute, data[self.model.idAttribute]);
                self.render();
            });
        },
        getAttributesForForm: function (projectTypeId) {
            let self = this;
            let aProjectTypeAttributes = [];
            let aProjectTypeId = [];
            if (_.isArray(projectTypeId)) {
                aProjectTypeId = _.map(projectTypeId, function (val, key) {
                    return parseInt(val);
                });
            } else {
                aProjectTypeId.push(projectTypeId);
            }
            _.each(aProjectTypeId, function (project_type_id, idx) {
                _.each(self.getProjectTypeAttributes(project_type_id), function (id, idx) {
                    if (_.indexOf(aProjectTypeAttributes, id) === -1) {
                        aProjectTypeAttributes.push(id);
                    }
                });
            });
            return aProjectTypeAttributes;
        },
        getAttributeIsWorkflowRequirement: function (attributeId) {
            let self = this;
            let bIsRequired = true;

            let aProjectAttributes = _.where(self.aCurrentProjectTypeAttributes, {attribute_id: attributeId});
            _.each(aProjectAttributes, function (projectAttribute, idx) {

                if (projectAttribute.workflow_requirement === 0) {
                    bIsRequired = false;
                } else if (projectAttribute.workflow_requirement === 3) {

                    let dependsOnAttribute = App.Collections.attributesManagementCollection.get(parseInt(projectAttribute.workflow_requirement_depends_on));

                    let $dependsOnAttributeEl = $('[name="' + self.getAttributeFormElementName(dependsOnAttribute.get('attribute_code')) + '"]');
                    let dependsOnAttributeValue = self.getAttributeFormElementValue($dependsOnAttributeEl);
                    let bIsSelectType = (projectAttribute.input === 'select' || projectAttribute.input === 'bool');
                    if (bIsSelectType) {
                        _.each(projectAttribute.workflow_requirement_depends_on_condition.split(/,/), function (val, key) {

                            if (val.match(/^not/)) {
                                let optionVal = val.replace(/^not /, '');
                                if ($dependsOnAttributeEl.find('option[value="' + optionVal + '"]').prop('selected')) {
                                    bIsRequired = false;
                                }
                            } else {
                                if (!$dependsOnAttributeEl.find('option[value="' + val + '"]').prop('selected')) {
                                    bIsRequired = false;
                                }
                            }
                        });
                    } else {
                        if (dependsOnAttributeValue !== projectAttribute.workflow_requirement_depends_on_condition) {
                            bIsRequired = false;
                        }
                    }
                }
            });
            return bIsRequired;
        },
        getIsAttributeDependentOn: function (attributeId) {
            let self = this;
            let bIsDependentOn = false;
            let aProjectAttributes = _.where(self.aCurrentProjectTypeAttributes, {attribute_id: attributeId});
            _.each(aProjectAttributes, function (projectAttribute, idx) {
                if (projectAttribute.workflow_requirement === 3) {
                    bIsDependentOn = true;
                }
            });

            return bIsDependentOn;
        },
        buildFormElements: function (projectTypeId) {
            let self = this;
            self.aCurrentProjectTypeAttributes = self.getAttributesForForm(projectTypeId);

            for (let i = 0; i < self.attributesOptionsCnt; i++) {
                let attribute = self.attributesOptions[i];
                if (attribute.attribute_code === 'primary_skill_needed') {
                    continue;
                }
                let attributeFormGroupClassname = 'form-group-' + attribute.attribute_code.replace('_', '-');
                // only add or show attribute form element that is applicable to the currently chosen project types
                let aProjectAttributes = _.where(self.aCurrentProjectTypeAttributes, {attribute_id: attribute.id});
                //console.log({projectTypeId:projectTypeId,attribute:attribute,aProjectAttributes:aProjectAttributes,model:self.model});
                if (aProjectAttributes.length) {
                    if (self.$('.' + attributeFormGroupClassname).length === 0) {

                        let value = self.model.get(attribute.attribute_code);
                        let optionHtml = attribute.options_source !== '' && !_.isUndefined(self.selectOptions[attribute.options_source]) ? self.selectOptions[attribute.options_source] : '';

                        let requiredClass = self.getAttributeIsWorkflowRequirement(attribute.id) ? 'required' : '';
                        let hideClass = '';

                        if (self.getIsAttributeDependentOn(attribute.id) && requiredClass === '') {
                            hideClass = 'hide';
                        }

                        let row = '<div class="dynamic form-group ' + attributeFormGroupClassname + ' ' + hideClass + ' ' + requiredClass + '">' +
                            '    <label for="' + attribute.attribute_code + '">' + attribute.label + '</label>' +
                            self.getInputHtml(attribute.input, attribute.attribute_code, attribute.id, value, optionHtml) +
                            '</div>';
                        // append row to correct workflow fieldset
                        self.$('fieldset[data-workflow-id="' + self.getWorkflowIdByAttributeId(attribute.id) + '"] .workflow-attributes-group-content').append(row);
                        if (attribute.input === 'select') {
                            self.$('[name="' + attribute.attribute_code + '"]').val(value);
                        } else if (attribute.input === 'bool') {
                            if (value !== '') {
                                self.$('#' + attribute.attribute_code + '_' + value).prop('checked', true);
                            }
                        }
                    } else {
                        self.$('.' + attributeFormGroupClassname).show();
                    }
                } else {
                    if (self.$('.' + attributeFormGroupClassname).length) {
                        self.$('.' + attributeFormGroupClassname).hide();
                    }
                }
            }
            self.setSpecialInstructionHelpBlockMsg();
        },
        setGridManagerContainerToolbar: function ($gridManagerContainerToolbar) {
            let self = this;
            self.$gridManagerContainerToolbar = $gridManagerContainerToolbar;
        },
        flagAsInvalid: function (e) {
            let self = this;
            //console.log('flagAsInvalid', {e: e, currentTarget: e.currentTarget})
            $(e.currentTarget).css('border-color', 'red');
        }
    });
})(window.App);
