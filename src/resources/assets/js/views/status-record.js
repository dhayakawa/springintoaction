(function (App) {
    App.Views.StatusRecord = App.Views.Backend.extend({
        tagName: 'div',
        attributes: {
            class: 'row'
        },
        template: template('statusRecordTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(self, 'render', 'setPopOverContent', 'cancelSaveStatusManagementOption', 'saveStatusManagementOption');
            self.options = options;
            self.defaultStateIcon = 'fa fa-circle';
            self.doneIcon = self.defaultStateIcon + ' text-success';
            self.pendingIcon = self.defaultStateIcon + ' text-warning';
            self.validateIcon = 'fas fa-dot-circle text-warning';
            self.notDoneIcon = self.defaultStateIcon + ' text-danger';
            /**
             * Init oFieldCnts values.
             * Needs to be in sync with self.oStatusManagementRecordModels.oFieldCnts
             * @type {number}
             */
            let iProjectDescriptionCompleteCnt = 0;
            let iBudgetEstimationCompleteCnt = 0;
            let iBudgetActualCompleteCnt = 0;
            let iVolunteerEstimationCompleteCnt = 0;
            let iVolunteerAssignmentCompleteCnt = 0;
            self.oStatusManagementRecordModels = {
                oFieldCnts: {
                    iBudgetEstimationCompleteCnt: iBudgetEstimationCompleteCnt,
                    iBudgetActualCompleteCnt: iBudgetActualCompleteCnt,
                    iVolunteerEstimationCompleteCnt: iVolunteerEstimationCompleteCnt,
                    iVolunteerAssignmentCompleteCnt: iVolunteerAssignmentCompleteCnt,
                    iProjectDescriptionCompleteCnt: iProjectDescriptionCompleteCnt
                },
                sitestatus: {
                    aFields: ['ProjectDescriptionComplete', 'BudgetEstimationComplete', 'BudgetActualComplete', 'VolunteerEstimationComplete', 'VolunteerAssignmentComplete'],
                    oFieldCntsMap: {
                        ProjectDescriptionComplete: {fieldCntsKey: 'iProjectDescriptionCompleteCnt'},
                        BudgetEstimationComplete: {fieldCntsKey: 'iBudgetEstimationCompleteCnt'},
                        BudgetActualComplete: {fieldCntsKey: 'iBudgetActualCompleteCnt'},
                        VolunteerEstimationComplete: {fieldCntsKey: 'iVolunteerEstimationCompleteCnt'},
                        VolunteerAssignmentComplete: {fieldCntsKey: 'iVolunteerAssignmentCompleteCnt'}
                    },
                    oStatusEntryFieldsMap: {
                        ProjectDescriptionComplete: {fieldName: 'ProjectDescription', incompleteValue: ''},
                        BudgetEstimationComplete: {fieldName: 'CostEstimateDone', incompleteValue: '0'},
                        BudgetActualComplete: {fieldName: 'BudgetAllocationDone', incompleteValue: '0'},
                        VolunteerEstimationComplete: {fieldName: 'VolunteerAllocationDone', incompleteValue: '0'},
                        VolunteerAssignmentComplete: {fieldName: '', incompleteValue: false, condition: "project.VolunteersNeededEst.toString() !== oStatusEntryFields['VolunteerEstimationComplete'].incompleteValue.toString() && project.VolunteersNeededEst.toString() !== '0' && project.VolunteersAssigned.toString() === project.VolunteersNeededEst.toString()"}
                    }
                },
                project: {
                    aFields: ['ProjectDescription', 'Status', 'CostEstimateDone', 'BudgetAllocationDone', 'MaterialListDone', 'VolunteerAllocationDone', 'ProjectSend', 'FinalCompletionStatus'],
                    oValidation: {
                        default: ['1'],
                        Status: [],
                        ProjectSend: [] // doesn't need validation
                    },
                    oFieldCntsMap: {
                        ProjectDescription: {fieldCntsKey: 'iProjectDescriptionCompleteCnt'},
                        CostEstimateDone: {fieldCntsKey: 'iBudgetEstimationCompleteCnt'},
                        BudgetAllocationDone: {fieldCntsKey: 'iBudgetActualCompleteCnt'},
                        VolunteerAllocationDone: {fieldCntsKey: 'iVolunteerEstimationCompleteCnt'}
                    },
                    oStatusEntryFieldsMap: {
                        ReadyForRegistration: {fieldName: '', incompleteValue: false, condition: "project.CostEstimateDone.toString() === 1 && project.BudgetAllocationDone.toString() === 1 && project.MaterialListDone.toString() === 1 && project.VolunteerAllocationDone.toString() === 1"},
                        ProjectDescription: {fieldName: 'ProjectDescription', incompleteValue: ''},
                        CostEstimateDone: {fieldName: 'EstimatedCost', incompleteValue: ''},
                        BudgetAllocationDone: {fieldName: 'BudgetSources', incompleteValue: ''},
                        MaterialListDone: {fieldName: 'MaterialsNeeded', incompleteValue: ''},
                        VolunteerAllocationDone: {fieldName: 'VolunteersNeededEst', incompleteValue: '0'},
                        VolunteerAssignmentComplete: {fieldName: '', completeValue: true, condition: "project.VolunteersNeededEst.toString() !== oStatusEntryFields['VolunteerAllocationDone'].incompleteValue.toString() && project.VolunteersNeededEst.toString() !== '0' && project.VolunteersAssigned.toString() === project.VolunteersNeededEst.toString()"}
                    }
                }
            };

        },
        events: {
            'click button': 'update',
            'change .form-control': 'enableSave',
            'change [name="value"]': 'enableSave',
            'inserted.bs.popover [data-popover="true"]': 'setPopOverContent',
            'click .popover-status-management-form .cancel': 'cancelSaveStatusManagementOption',
            'click .popover-status-management-form .save': 'saveStatusManagementOption'
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
            let oFieldCnts = self.oStatusManagementRecordModels.oFieldCnts;

            for (let i = 0; i < projectCnt; i++) {
                [modelAttributes.projects[i], oFieldCnts] = self.setProjectStatusStates(modelAttributes.projects[i], oFieldCnts);
            }
            /**
             * Setup for Site Statuses
             */

            modelAttributes = self.setSiteStatusStates(modelAttributes, oFieldCnts);

            return modelAttributes;
        },
        calculateSiteStatusCompletedFieldCnt: function (sFieldName, modelAttributes, oStatusEntryFields) {
            let self = this;
            let projectCnt = modelAttributes.projects.length;
            let iFieldCnt = 0;
            //console.log('calculateSiteStatusFieldCnt', sFieldName, oStatusEntryFields[sFieldName], oStatusEntryFields, modelAttributes)
            for (let i = 0; i < projectCnt; i++) {
                let project = modelAttributes.projects[i];
                if (oStatusEntryFields[sFieldName].fieldName !== '') {
                    if (project[oStatusEntryFields[sFieldName].fieldName].toString() !== oStatusEntryFields[sFieldName].incompleteValue.toString()) {
                        iFieldCnt++;
                    }
                } else if (typeof oStatusEntryFields[sFieldName].condition !== 'undefined') {
                    if (eval(oStatusEntryFields[sFieldName].condition) !== oStatusEntryFields[sFieldName].incompleteValue) {
                        iFieldCnt++;
                    }
                }
            }

            return iFieldCnt;
        },
        setSiteStatusStates: function (modelAttributes, oFieldCnts) {
            let self = this;
            let oMappedFieldCnts = self.oStatusManagementRecordModels.sitestatus.oFieldCntsMap;
            let projectCnt = modelAttributes.projects.length;
            _.each(self.oStatusManagementRecordModels.sitestatus.aFields, function (sFieldName, key) {
                let sStateKey = self.buildStateKey(sFieldName);
                let sToolTipKey = self.buildToolTipContentKey(sFieldName);
                let fieldCnt = typeof oFieldCnts !== 'undefined' ? self.getFieldCnt(oMappedFieldCnts[sFieldName].fieldCntsKey, oFieldCnts) : self.calculateSiteStatusCompletedFieldCnt(sFieldName, modelAttributes, self.oStatusManagementRecordModels.sitestatus.oStatusEntryFieldsMap);
                if (fieldCnt.toString() === projectCnt.toString() && modelAttributes[sFieldName].toString() === '0') {
                    modelAttributes[sStateKey] = self.validateIcon;
                } else {
                    modelAttributes[sStateKey] = (modelAttributes[sFieldName].toString() === '1' ? self.doneIcon : self.notDoneIcon);
                }
                /**
                 * Setup for tooltips
                 */
                modelAttributes[sToolTipKey] = self.cleanForToolTip(self.getYesNoOptionLabel(modelAttributes[sFieldName]));
            });

            return modelAttributes;
        },
        buildStateKey: function (val) {
            return s.decapitalize(val) + 'State';
            //return val.charAt(0).toLowerCase() + val.slice(1) + 'State';
        },
        buildToolTipContentKey: function (val) {
            return val + 'ToolTipContent';
        },
        getFieldCnt: function (FieldCntName, oFieldCnts) {
            let self = this;
            return oFieldCnts[FieldCntName];
        },
        incrementFieldCnt: function (FieldCntName, oFieldCnts) {
            let self = this;
            if (typeof oFieldCnts[FieldCntName] !== 'undefined') {
                oFieldCnts[FieldCntName]++;
            }
            return oFieldCnts;
        },
        setProjectStatusStates: function (project, oFieldCnts) {
            let self = this;
            let oMappedFieldCnts = self.oStatusManagementRecordModels.project.oFieldCntsMap;
            let oStatusEntryFields = self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap;

            _.each(self.oStatusManagementRecordModels.project.aFields, function (sFieldName, key) {
                let bFlaggedAsComplete = null;
                let sStateKey = self.buildStateKey(sFieldName);
                let sStatusEntryField = typeof oStatusEntryFields[sFieldName] !== 'undefined' ? oStatusEntryFields[sFieldName].fieldName : null;
                let sIncompleteStatusEntryValue = typeof oStatusEntryFields[sFieldName] !== 'undefined' ? oStatusEntryFields[sFieldName].incompleteValue : '';
                let sToolTipKey = self.buildToolTipContentKey(sFieldName);

                // If the db value is null set it to its expected incomplete value
                if (!_.isNull(sStatusEntryField) && _.isNull(project[sStatusEntryField])) {
                    project[sStatusEntryField] = sIncompleteStatusEntryValue;
                }
                switch (sFieldName) {
                    case 'Status':
                        switch (project[sFieldName].toString()) {
                            case '1':
                                project[sStateKey] = self.notDoneIcon + ' blank';
                                break;
                            case '2':
                                project[sStateKey] = self.doneIcon + ' dn-district';
                                break;
                            case '3':
                                project[sStateKey] = self.doneIcon + ' dn-woodlands';
                                break;
                            case '4':
                                project[sStateKey] = self.doneIcon + ' na-district';
                                break;
                            case '5':
                                project[sStateKey] = self.doneIcon + ' na-woodlands';
                                break;
                            case '6':
                                project[sStateKey] = self.pendingIcon + ' pending';
                                break;
                            case '7':
                                project[sStateKey] = self.doneIcon + ' approved';
                                break;
                            case '8':
                                project[sStateKey] = self.doneIcon + ' cancelled';
                                break;
                            default:
                                project[sStateKey] = self.notDoneIcon;
                        }
                        project[sToolTipKey] = self.cleanForToolTip(self.getProjectStatusOptionLabel(project[sFieldName]));
                        break;
                    case 'ProjectSend':
                        switch (project[sFieldName].toString()) {
                            case '3':
                                project[sStateKey] = self.validateIcon + ' ready-state';
                                break;
                            case '4':
                                project[sStateKey] = self.doneIcon + ' sent-state';
                                break;
                            default:
                                project[sStateKey] = self.notDoneIcon + ' not-ready-state';
                        }
                        project[sToolTipKey] = self.cleanForToolTip(self.getSendStatusOptionLabel(project[sFieldName]));
                        break;
                    case 'ProjectDescription':
                        if (sStatusEntryField !== null && project[sStatusEntryField].toString() === sIncompleteStatusEntryValue.toString()) {
                            project[sStateKey] = 'fa fa-info-circle text-danger';
                            project[sToolTipKey] = self.cleanForToolTip(sStatusEntryField.split(/(?=[A-Z])/).join(" ") + ' is empty.');
                        } else {
                            project[sStateKey] = 'fa fa-info-circle text-success';
                            if (typeof oMappedFieldCnts[sFieldName] !== 'undefined' && oMappedFieldCnts[sFieldName] !== null) {
                                oFieldCnts = self.incrementFieldCnt(oMappedFieldCnts[sFieldName].fieldCntsKey, oFieldCnts);
                            }
                            project[sToolTipKey] = self.cleanForToolTip(project[sStatusEntryField].toString());
                        }

                        break;
                    case 'BudgetAllocationDone':
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

                        project[sToolTipKey] = self.cleanForToolTip(budgetToolTip);
                    default:
                        bFlaggedAsComplete = project[sFieldName].toString() === '1';
                        // Has ability to be validated
                        // console.log({sFieldName: sFieldName, sStatusEntryField: sStatusEntryField, sIncompleteStatusEntryValue: sIncompleteStatusEntryValue, project_sStatusEntryField: project[sStatusEntryField],project: project})

                        if (sStatusEntryField !== null && (project[sStatusEntryField].toString() !== sIncompleteStatusEntryValue.toString() && !bFlaggedAsComplete)) {
                            project[sStateKey] = self.validateIcon;
                        } else {
                            project[sStateKey] = (bFlaggedAsComplete ? self.doneIcon : self.notDoneIcon);
                            if (bFlaggedAsComplete) {
                                if (typeof oMappedFieldCnts[sFieldName] !== 'undefined' && oMappedFieldCnts[sFieldName] !== null) {
                                    oFieldCnts = self.incrementFieldCnt(oMappedFieldCnts[sFieldName].fieldCntsKey, oFieldCnts);
                                }
                            } else {
                                if (sStatusEntryField !== null && sIncompleteStatusEntryValue.toString() === '' && (project[sStatusEntryField].toString() === sIncompleteStatusEntryValue.toString())) {
                                    project[sToolTipKey] = self.cleanForToolTip(sStatusEntryField.split(/(?=[A-Z])/).join(" ") + ' is empty.');
                                }
                            }
                        }
                        if (typeof project[sToolTipKey] === 'undefined') {
                            if (sStatusEntryField !== null) {
                                project[sToolTipKey] = self.cleanForToolTip(project[sStatusEntryField]);
                            } else {
                                project[sToolTipKey] = self.cleanForToolTip(self.getYesNoOptionLabel(project[sFieldName]));
                            }
                        }
                }
            });

            if (typeof oFieldCnts !== 'undefined' && eval(oStatusEntryFields['VolunteerAssignmentComplete'].condition) === oStatusEntryFields['VolunteerAssignmentComplete'].completeValue) {
                oFieldCnts = self.incrementFieldCnt('iVolunteerAssignmentCompleteCnt', oFieldCnts);
            }

            if (typeof oFieldCnts !== 'undefined') {
                return [project, oFieldCnts];
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
        getYesNoOptionLabel: function (optionId) {
            return optionId.toString() === '1' ? 'Yes' : 'No';
        },
        cleanForToolTip: function (str) {
            // converts unicode to html entities
            // replaces double quotes with html entity
            return (str === '' || str === null || typeof str === 'undefined') ? '' : str.toString().replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
                return '&#' + i.charCodeAt(0) + ';';
            }).replace('"', '&quot;');
        },
        setPopOverContent: function (e) {
            let self = this;
            let aOptions = [];
            let $icon = $(e.currentTarget);
            let $oModel = null;
            if ($icon.data('model-type') === 'project') {
                switch ($icon.data('field')) {
                    case 'CostEstimateDone':
                    case 'BudgetAllocationDone':
                    case 'MaterialListDone':
                    case 'VolunteerAllocationDone':
                    case 'VolunteerEstimationComplete':
                    case 'VolunteerAssignmentComplete':
                    case 'ProjectDescriptionComplete':
                    case 'BudgetEstimationComplete':
                        aOptions = App.Models.projectModel.getYesNoOptions();
                        break;
                    case 'Status':
                        aOptions = App.Models.projectModel.getStatusOptions();
                        break;
                    case 'ProjectSend':
                        aOptions = App.Models.projectModel.getSendOptions();
                        break;
                }
                $oModel = App.Collections.allProjectsCollection.get(parseInt($icon.data('id')));
            } else if ($icon.data('model-type') === 'sitestatus') {
                aOptions = App.Models.projectModel.getYesNoOptions();
                $oModel = App.Collections.statusManagementCollection.find({SiteStatusID: parseInt($icon.data('id'))});
            }
            // Remove the empty option if it exists
            if (typeof aOptions[0][''] !== 'undefined') {
                aOptions.shift();
            }
            let $popover = $icon.siblings('.popover');
            $popover.find('.popover-title').html('<strong>' + $icon.data('field').split(/(?=[A-Z])/).join(" ") + '</strong>');
            let sOptions = _.map(aOptions, function (option, key) {
                let checked = $oModel !== null && $oModel.get($icon.data('field')).toString() === option[1].toString() ? 'checked' : '';
                return '<div class="radio"><label><input type="radio" ' + checked + ' name="' + $icon.data('field') + '" value="' + option[1] + '"/>' + option[0] + '</label></div>';
            }).join('');
            let sHiddenInputs = '<input type="hidden" name="model-type" value="' + $icon.data('model-type') + '"/><input type="hidden" name="id" value="' + $icon.data('id') + '"/><input type="hidden" name="field" value="' + $icon.data('field') + '"/>';
            let sForm = '<form class="popover-status-management-form" name="status-management-option-update-' + $icon.data('field') + '-' + $icon.data('id') + '">' + sHiddenInputs + sOptions + '<div class="text-right"><button class="cancel btn btn-default">Cancel</button> <button class="save btn btn-primary">Save</button></div></form>';
            $popover.find('.popover-content').html(sForm);

        },
        validateOptionToSave: function (modelType, modelField, modelId, modelFieldValue) {
            let self = this;
            let validationMsg = '';
            let errMsg = 'This "' + modelField.split(/(?=[A-Z])/).join(" ") + '" status does not look ready. Are you sure you want to save?';
            if (modelType === 'sitestatus') {
                if (modelFieldValue.toString() === '1') {
                    let $statusManagementRecord = App.Collections.statusManagementCollection.find({SiteStatusID: parseInt(modelId)});
                    let completedCnt = self.calculateSiteStatusCompletedFieldCnt(modelField, $statusManagementRecord.attributes, self.oStatusManagementRecordModels.sitestatus.oStatusEntryFieldsMap);
                    if (completedCnt !== $statusManagementRecord.attributes.projects.length) {
                        validationMsg = errMsg;
                    }
                }
            } else {
                let aValidationIds = typeof self.oStatusManagementRecordModels.project.oValidation[modelField] !== 'undefined' ? self.oStatusManagementRecordModels.project.oValidation[modelField] : self.oStatusManagementRecordModels.project.oValidation.default;
                let bRequiresValidation = _.contains(aValidationIds, modelId.toString());
                if (bRequiresValidation) {
                    let project = App.Collections.allProjectsCollection.get(parseInt(modelId));
                    if (typeof self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap[modelField] !== 'undefined' && self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap[modelField].fieldName !== '') {
                        if (project[self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap[modelField].fieldName].toString() === self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap[modelField].toString()) {
                            validationMsg = errMsg;
                        } else {
                            if (typeof self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap[modelField].condition !== 'undefined') {
                                if (eval(self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap[modelField].condition) !== self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap[modelField].incompleteValue) {
                                    validationMsg = errMsg;
                                }
                            }
                        }
                    }
                }
            }

            return validationMsg;
        },
        closeStatusFormPopover: function ($icon) {
            $icon.trigger('click');
        },
        saveStatusManagementOption: function (e) {
            let self = this;
            e.preventDefault();
            let $form = $(e.currentTarget).parents('form');
            let modelType = $form.find('[name="model-type"]').val();
            let modelField = $form.find('[name="field"]').val();
            let modelId = $form.find('[name="id"]').val();
            let modelFieldValue = $form.find('[name="' + modelField + '"]:checked').val();
            let $icon = $form.parents('.popover').siblings('i');
            let bSaveOptionValue = true;
            let validationMsg = self.validateOptionToSave(modelType, modelField, modelId, modelFieldValue);
            if (validationMsg !== '') {
                if (!confirm(validationMsg)) {
                    self.closeStatusFormPopover($icon);
                    bSaveOptionValue = false;
                    return;
                }
            }
            if (bSaveOptionValue) {
                window.ajaxWaiting('show', $form);
                if (modelType === 'project') {
                    let projectModel = App.Collections.allProjectsCollection.get(modelId);
                    projectModel.url = '/admin/project/' + modelId;
                    projectModel.save({[modelField]: modelFieldValue},
                        {
                            success: function (savedModel, response, options) {
                                $.when(
                                    App.Collections.statusManagementCollection.fetch({reset: true})
                                ).then(function (data, textStatus, jqXHR) {
                                    growl(response.msg, response.success ? 'success' : 'error');
                                    self.closeStatusFormPopover($icon);
                                    $icon.removeClass();
                                    $icon.addClass(self.getStatusCSS(savedModel, modelType, modelField));
                                    // These fields do not have the status state in their tooltip
                                    let aSkipTooltipStatusUpdate = ['CostEstimateDone', 'BudgetAllocationDone', 'MaterialListDone', 'VolunteerAllocationDone'];
                                    if (!_.contains(aSkipTooltipStatusUpdate, modelField)) {
                                        let optionLabel = '';
                                        switch (modelField) {
                                            case 'Status':
                                                optionLabel = self.getProjectStatusOptionLabel(modelFieldValue);
                                                break;
                                            case 'ProjectSend':
                                                optionLabel = self.getSendStatusOptionLabel(modelFieldValue);
                                                break;
                                            default:
                                                optionLabel = self.getYesNoOptionLabel(modelFieldValue);
                                                break;
                                        }
                                        // update tooltip with new status
                                        $icon.attr('title', optionLabel);
                                        $icon.removeAttr('data-original-title');
                                        $icon.tooltip('fixTitle');
                                    }
                                });
                            },
                            error: function (model, response, options) {
                                growl(response.msg, 'error');
                            }
                        });
                } else if (modelType === 'sitestatus') {
                    let siteStatusModel = new App.Models.SiteStatus();
                    siteStatusModel.url = '/admin/sitestatus/' + modelId;
                    $.when(
                        siteStatusModel.fetch({reset: true})
                    ).then(function () {
                        siteStatusModel.save({[modelField]: modelFieldValue}, {
                            success: function (savedModel, response, options) {
                                $.when(
                                    App.Collections.statusManagementCollection.fetch({reset: true})
                                ).then(function (data, textStatus, jqXHR) {
                                    growl(response.msg, response.success ? 'success' : 'error');
                                    self.closeStatusFormPopover($icon);
                                    $icon.removeClass();
                                    $icon.addClass(self.getStatusCSS(savedModel, modelType, modelField));
                                    let optionLabel = self.getYesNoOptionLabel(modelFieldValue);
                                    // update tooltip with new status
                                    $icon.attr('title', optionLabel);
                                    $icon.removeAttr('data-original-title');
                                    $icon.tooltip('fixTitle');
                                });
                            },
                            error: function (model, response, options) {
                                growl(response.msg, 'error');
                            }
                        });
                    });
                }
            }
        },
        cancelSaveStatusManagementOption: function (e) {
            let self = this;
            e.preventDefault();
            let $icon = $(e.currentTarget).parents('.popover').siblings('i');
            self.closeStatusFormPopover($icon);
        },
        getStatusCSS: function (savedModel, modelType, modelField) {
            let self = this;
            let savedModelAttributes = null;
            if (modelType === 'project') {
                savedModelAttributes = self.setProjectStatusStates(savedModel.attributes, self.oStatusManagementRecordModels.oFieldCnts)[0];
            } else if (modelType === 'sitestatus') {
                let $statusManagementRecord = App.Collections.statusManagementCollection.find({SiteStatusID: parseInt(savedModel.get('SiteStatusID'))});
                savedModelAttributes = self.setSiteStatusStates($statusManagementRecord.attributes);
            }
            let fieldStateVar = self.buildStateKey(modelField);
            //console.log('getStatusCSS', fieldStateVar, savedModelAttributes, savedModel)
            return typeof savedModelAttributes[fieldStateVar] !== 'undefined' ? savedModelAttributes[fieldStateVar] : '';
        },
    });
})(window.App);
