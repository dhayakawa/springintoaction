(function (App) {
    App.Views.StatusManagementRecord = Backbone.View.extend({
        tagName: 'div',
        attributes: {
            class: 'row'
        },
        template: template('statusManagementRecordTemplate'),
        initialize: function (options) {
            let self = this;
            self.options = options;
            self.defaultStateIcon = 'fa fa-circle';
            self.doneIcon = self.defaultStateIcon + ' text-success';
            self.pendingIcon = self.defaultStateIcon + ' text-warning';
            self.validateIcon = 'fas fa-dot-circle text-warning';
            self.notDoneIcon = self.defaultStateIcon + ' text-danger';
            _.bindAll(this, 'render','setPopOverContent','closeStatusManagementOptionPopover','saveStatusManagementOption');
        },
        events: {
            'click button': 'update',
            'change .form-control': 'enableSave',
            'change [name="value"]': 'enableSave',
            'inserted.bs.popover [data-popover="true"]' : 'setPopOverContent',
            'click .popover-status-management-form .cancel': 'closeStatusManagementOptionPopover',
            'click .popover-status-management-form .save': 'saveStatusManagementOption',
        },
        render: function () {
            let self = this;
            //console.log(self.model.attributes)
            let $statusManagementRecord = self.template({model: self.setTemplateVars(self.model.attributes)});
            $(self.el).append($statusManagementRecord);

            return this;
        },
        setTemplateVars: function (modelAttributes) {
            let self = this;
            let projectCnt = modelAttributes.projects.length;
            let iProjectDescriptionCompleteCnt = 0;
            let iBudgetEstimationCompleteCnt = 0;
            let iBudgetActualCompleteCnt = 0;
            let iVolunteerEstimationCompleteCnt = 0;
            let iVolunteerAssignmentCompleteCnt = 0;

            for (let i = 0; i < projectCnt; i++) {
                [modelAttributes.projects[i], iBudgetEstimationCompleteCnt, iBudgetActualCompleteCnt, iVolunteerEstimationCompleteCnt, iVolunteerAssignmentCompleteCnt, iProjectDescriptionCompleteCnt] = self.setProjectStatus(modelAttributes.projects[i], iBudgetEstimationCompleteCnt, iBudgetActualCompleteCnt, iVolunteerEstimationCompleteCnt, iVolunteerAssignmentCompleteCnt, iProjectDescriptionCompleteCnt);
            }

            /**
             * Setup for Site Statuses
             */
            if (iProjectDescriptionCompleteCnt === projectCnt && modelAttributes.ProjectDescriptionComplete === 0) {
                modelAttributes.projectDescriptionCompleteState = self.validateIcon;
            } else {
                modelAttributes.projectDescriptionCompleteState = (modelAttributes.ProjectDescriptionComplete === 1 ? self.doneIcon : self.notDoneIcon);
            }

            if (iBudgetEstimationCompleteCnt === projectCnt && modelAttributes.BudgetEstimationComplete === 0) {
                modelAttributes.budgetEstimationCompleteState = self.validateIcon;
            } else {
                modelAttributes.budgetEstimationCompleteState = (modelAttributes.BudgetEstimationComplete === 1 ? self.doneIcon : self.notDoneIcon);
            }

            if (iBudgetEstimationCompleteCnt === projectCnt && modelAttributes.BudgetActualComplete === 0) {
                modelAttributes.budgetActualCompleteState = self.validateIcon;
            } else {
                modelAttributes.budgetActualCompleteState = (modelAttributes.BudgetActualComplete === 1 ? self.doneIcon : self.notDoneIcon);
            }

            if (iVolunteerEstimationCompleteCnt === projectCnt && modelAttributes.VolunteerEstimationComplete === 0) {
                modelAttributes.volunteerEstimationCompleteState = self.validateIcon;
            } else {
                modelAttributes.volunteerEstimationCompleteState = (modelAttributes.VolunteerEstimationComplete === 1 ? self.doneIcon : self.notDoneIcon);
            }

            if (iVolunteerAssignmentCompleteCnt === projectCnt && modelAttributes.VolunteerAssignmentComplete === 0) {
                modelAttributes.volunteerAssignmentCompleteState = self.validateIcon;
            } else {
                modelAttributes.volunteerAssignmentCompleteState = (modelAttributes.VolunteerEstimationComplete === 1 ? self.doneIcon : self.notDoneIcon);
            }

            return modelAttributes;
        },
        setProjectStatus: function(project, iBudgetEstimationCompleteCnt, iBudgetActualCompleteCnt, iVolunteerEstimationCompleteCnt, iVolunteerAssignmentCompleteCnt, iProjectDescriptionCompleteCnt){
            let self = this;
            switch (project.Status) {
                case '1':
                    project.statusState = self.notDoneIcon + ' blank';
                    break;
                case 2:
                case '2':
                    project.statusState = self.doneIcon + ' dn-district';
                    break;
                case 3:
                case '3':
                    project.statusState = self.doneIcon + ' dn-woodlands';
                    break;
                case 4:
                case '4':
                    project.statusState = self.doneIcon + ' na-district';
                    break;
                case 5:
                case '5':
                    project.statusState = self.doneIcon + ' na-woodlands';
                    break;
                case 6:
                case '6':
                    project.statusState = self.pendingIcon + ' pending';
                    break;
                case 7:
                case '7':
                    project.statusState = self.doneIcon + ' approved';
                    break;
                case 8:
                case '8':
                    project.statusState = self.doneIcon + ' cancelled';
                    break;
                default:
                    project.statusState = self.notDoneIcon;
            }

            if (project.EstimatedCost !== '0.0000' && parseInt(project.CostEstimateDone) === 0) {
                project.costEstimateDoneState = self.validateIcon;
            } else {
                project.costEstimateDoneState = (parseInt(project.CostEstimateDone) === 1 ? self.doneIcon : self.notDoneIcon);
                if (parseInt(project.CostEstimateDone) === 1) {
                    if (typeof iBudgetEstimationCompleteCnt !== 'undefined') {
                        iBudgetEstimationCompleteCnt++;
                    }
                }
            }

            if (project.BudgetSources !== '' && project.BudgetAllocationDone === 0) {
                project.budgetAllocationDoneState = self.validateIcon;
            } else {
                project.budgetAllocationDoneState = (project.BudgetAllocationDone === 1 ? self.doneIcon : self.notDoneIcon);
                if (project.BudgetAllocationDone === 1) {
                    if (typeof iBudgetEstimationCompleteCnt !== 'undefined') {
                        iBudgetActualCompleteCnt++;
                    }
                }
            }

            if (project.MaterialsNeeded !== '' && project.MaterialListDone === 0) {
                project.materialListDoneState = self.validateIcon;
            } else {
                project.materialListDoneState = (project.MaterialListDone === 1 ? self.doneIcon : self.notDoneIcon);
            }

            if (project.VolunteersNeededEst !== 0 && project.VolunteerAllocationDone === 0) {
                project.volunteerAllocationDoneState = self.validateIcon;
            } else {
                project.volunteerAllocationDoneState = (project.VolunteerAllocationDone === 1 ? self.doneIcon : self.notDoneIcon);
                if (project.VolunteerAllocationDone === 1) {
                    if (typeof iBudgetEstimationCompleteCnt !== 'undefined') {
                        iVolunteerEstimationCompleteCnt++;
                    }
                }
            }
            project.finalCompletionStatusStatus = (project.FinalCompletionStatus === 1 ? self.doneIcon : self.notDoneIcon);

            if (project.VolunteersNeededEst !== 0 && project.VolunteersAssigned === project.VolunteersNeededEst) {
                if (typeof iBudgetEstimationCompleteCnt !== 'undefined') {
                    iVolunteerAssignmentCompleteCnt++;
                }
            }

            project.projectSendState = self.notDoneIcon + ' not-ready-state';
            if (project.ProjectSend === '4' || project.ProjectSend === 4) {
                project.projectSendState = self.doneIcon + ' sent-state';
            } else if (project.ProjectSend === '3' || project.ProjectSend === 3) {
                project.projectSendState = self.validateIcon + ' ready-state';
            }

            if (project.ProjectDescription === '') {
                project.projectDescriptionState = 'fa fa-info-circle text-danger';
                project.ProjectDescription = 'Project Description is not set yet.';
            } else {
                project.projectDescriptionState = 'fa fa-info-circle text-success';
                if (typeof iBudgetEstimationCompleteCnt !== 'undefined') {
                    iProjectDescriptionCompleteCnt++;
                }
            }
            /**
             * Setup for tooltips
             */
            project.ProjectDescriptionToolTipContent = self.cleanForToolTip(project.ProjectDescription);
            project.StatusToolTipContent = self.cleanForToolTip(self.getProjectStatusOptionLabel(project.Status));
            project.CostEstimateToolTipContent = self.cleanForToolTip(project.EstimatedCost);
            let budgetTotal = 0.00;
            let budgetToolTip = "<table class='tooltip-table table table-condensed'>";
            budgetToolTip += '<thead><tr><th>Amt</th><th>Source</th><th>Comment</th></tr></thead><tbody>';
            let aBudgets = App.Collections.annualBudgetsManagementCollection.where({ProjectID: project.ProjectID});
            _.each(aBudgets, function (budget, idx) {
                budgetTotal += parseFloat(budget.get('BudgetAmount'));
                budgetToolTip += '<tr><td>' + budget.get('BudgetAmount') + '</td><td>' + self.getBudgetSourceOptionLabel(budget.get('BudgetSource')) + '</td><td class=\'hide-overflow\'>' + budget.get('Comments') + '</td></tr>';
            });
            budgetToolTip += '<tr><td>' + budgetTotal.toString() + '</td><td colspan=\'2\'><strong>Total</strong></td></tr>';
            budgetToolTip += '</tbody></table>';

            project.BudgetAllocationToolTipContent = self.cleanForToolTip(budgetToolTip);
            project.MaterialListToolTipContent = self.cleanForToolTip(project.MaterialsNeeded);
            project.VolunteerAllocationToolTipContent = self.cleanForToolTip(project.VolunteersNeededEst);
            project.ProjectSendToolTipContent = self.cleanForToolTip(self.getSendStatusOptionLabel(project.ProjectSend));
            project.FinalCompletionStatusToolTipContent = self.cleanForToolTip(self.getYesNoOptionLabel(project.FinalCompletionStatus));
            if (typeof iBudgetEstimationCompleteCnt !== 'undefined') {
                return [project, iBudgetEstimationCompleteCnt, iBudgetActualCompleteCnt, iVolunteerEstimationCompleteCnt, iVolunteerAssignmentCompleteCnt, iProjectDescriptionCompleteCnt];
            } else {
                return project;
            }
        },
        getBudgetSourceOptionLabel: function (optionId) {
            let label = '';
            _.each(App.Vars.selectOptions['BudgetSourceOptions'], function (val, key) {
                if (val.toString() === optionId.toString()) {
                    label = key;
                }
            });
            return label;
        },
        getSendStatusOptionLabel: function (optionId) {
            let label = '';
            _.each(App.Vars.selectOptions['SendStatusOptions'], function (val, key) {
                if (val.toString() === optionId.toString()) {
                    label = key;
                }
            });
            return label;
        },
        getProjectStatusOptionLabel: function (optionId) {
            let label = '';
            _.each(App.Vars.selectOptions['ProjectStatusOptions'], function (val, key) {
                if (val.toString() === optionId.toString()) {
                    label = key;
                }
            });
            return label;
        },
        getYesNoOptionLabel: function(optionId) {
            return optionId.toString() === '1' ? 'Yes' : 'No';
        },
        cleanForToolTip: function (str) {
            return (str === '' || str === null) ? '' : str.toString().replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
                return '&#' + i.charCodeAt(0) + ';';
            }).replace('"', '&quot;');
        },
        setPopOverContent: function(e){
            let self = this;
            let aOptions = [];
            let aYesNoOptions = [{option_label: 'Yes',option_value: 1}, {option_label: 'No', option_value: 0}];
            let $icon = $(e.currentTarget);
            if ($icon.data('model') === 'project'){
                switch ($icon.data('field')) {
                    case 'CostEstimateDone':
                    case 'BudgetAllocationDone':
                    case 'MaterialListDone':
                    case 'VolunteerAllocationDone':
                    case 'VolunteerEstimationComplete':
                    case 'VolunteerAssignmentComplete':
                    case 'ProjectDescriptionComplete':
                    case 'BudgetEstimationComplete':
                        aOptions = aYesNoOptions;
                        break;
                    case 'Status':
                        break;
                    case 'ProjectSend':
                        break;
                }
            }
            let $popover = $icon.siblings('.popover');
            $popover.find('.popover-title').html('<strong>Update '+ $icon.data('field') +'</strong>');
            let sOptions = '';
            _.each(aOptions,  function (option,key) {
                let currentValue = App.Collections.allProjectsCollection.get($icon.data('id'));
                let checked = currentValue.get($icon.data('field')).toString() === option.option_value.toString() ? 'checked' : '';
                sOptions += '<div class="radio"><label><input type="radio" '+ checked +' name="'+ $icon.data('field')+'" value="' + option.option_value + '"/>'+ option.option_label+'</label></div>';
            });
            let sHiddenInputs = '<input type="hidden" name="model" value="'+ $icon.data('model')+'"/><input type="hidden" name="id" value="'+ $icon.data('id')+'"/><input type="hidden" name="field" value="'+ $icon.data('field')+'"/>';
            let sForm = '<form class="popover-status-management-form" name="status-management-option-update-'+ $icon.data('field')+'-'+ $icon.data('id')+'">'+ sHiddenInputs + sOptions +'<div class="text-right"><button class="cancel btn btn-default">Cancel</button> <button class="save btn btn-primary">Save</button></div></form>';
            $popover.find('.popover-content').html(sForm);

        },
        saveStatusManagementOption: function(e){
            let self = this;
            e.preventDefault();
            let $form = $(e.currentTarget).parents('form');
            let modelType = $form.find('[name="model"]').val();
            let modelField = $form.find('[name="field"]').val();
            let modelId = $form.find('[name="id"]').val();
            let modelFieldValue = $form.find('[name="'+ modelField +'"]:checked').val();
            let $icon = $form.parents('.popover').siblings('i');
            
            if (modelType==='project') {
                let projectModel = App.Collections.allProjectsCollection.get(modelId);
                projectModel.url = '/admin/project/' + modelId;
                projectModel.save({[modelField]: modelFieldValue},
                    {
                        success: function (savedModel, response, options) {
                            growl(response.msg, response.success ? 'success' : 'error');
                            $icon.trigger('click');
                            $icon.removeClass();
                            $icon.addClass(self.getStatusCSS(savedModel, modelType, modelField, modelFieldValue));
                        },
                        error: function (model, response, options) {
                            growl(response.msg, 'error');
                        }
                    });
            }
        },
        closeStatusManagementOptionPopover: function (e) {
            let self = this;
            e.preventDefault();
            let $icon = $(e.currentTarget).parents('.popover').siblings('i');
            $icon.trigger('click');
        },
        getStatusCSS: function (savedModel, modelType, modelField, modelFieldValue) {
            let self = this;
            if (modelType === 'project') {
                let savedModelAttributes = self.setProjectStatus(savedModel.attributes);
                let fieldStateVar = modelField.charAt(0).toLowerCase() + modelField.slice(1) + 'State';
                return savedModelAttributes[fieldStateVar];
            }
        },
    });

    App.Views.StatusManagement = Backbone.View.extend({
        attributes: {
            class: 'status-management-view route-view box box-primary'
        },
        template: template('statusManagementTemplate'),
        initialize: function (options) {
            let self = this;
            this.options = options;

            _.bindAll(this, 'render', 'addOne', 'addAll');
            this.collection.bind('reset', this.addAll, this);
        },
        events: {},
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template());
            this.addAll();
            self.$el.find('[data-toggle="tooltip"]').tooltip({html: true});
            self.$el.find('[data-popover="true"]').popover({html: true, title: ''});
            return this;
        },
        addOne: function (StatusManagement) {
            if (StatusManagement.attributes.projects.length) {
                let $settingItem = new App.Views.StatusManagementRecord({model: StatusManagement});
                this.$el.find('.status-management-wrapper').append($settingItem.render().el);
            }
        },
        addAll: function () {
            this.$el.find('.status-management-wrapper').empty();
            //this.$el.find('.status-management-wrapper').append($('<ul class="nav nav-stacked"></ul>'));
            this.collection.each(this.addOne);
        }
    });
})(window.App);
