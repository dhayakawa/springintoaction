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
            _.bindAll(this, 'render','setPopOverContent');
        },
        events: {
            'click button': 'update',
            'change .form-control': 'enableSave',
            'change [name="value"]': 'enableSave',
            'inserted.bs.popover [data-popover="true"]' : 'setPopOverContent'
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

                switch (modelAttributes.projects[i].Status) {
                    case '1':
                        modelAttributes.projects[i].statusState = self.notDoneIcon + ' blank';
                        break;
                    case 2:
                    case '2':
                        modelAttributes.projects[i].statusState = self.doneIcon + ' dn-district';
                        break;
                    case 3:
                    case '3':
                        modelAttributes.projects[i].statusState = self.doneIcon + ' dn-woodlands';
                        break;
                    case 4:
                    case '4':
                        modelAttributes.projects[i].statusState = self.doneIcon + ' na-district';
                        break;
                    case 5:
                    case '5':
                        modelAttributes.projects[i].statusState = self.doneIcon + ' na-woodlands';
                        break;
                    case 6:
                    case '6':
                        modelAttributes.projects[i].statusState = self.pendingIcon + ' pending';
                        break;
                    case 7:
                    case '7':
                        modelAttributes.projects[i].statusState = self.doneIcon + ' approved';
                        break;
                    case 8:
                    case '8':
                        modelAttributes.projects[i].statusState = self.doneIcon + ' cancelled';
                        break;
                    default:
                        modelAttributes.projects[i].statusState = self.notDoneIcon;
                }

                if (modelAttributes.projects[i].EstimatedCost !== '0.0000' && modelAttributes.projects[i].CostEstimateDone === 0) {
                    modelAttributes.projects[i].costEstimateState = self.validateIcon;
                } else {
                    modelAttributes.projects[i].costEstimateState = (modelAttributes.projects[i].CostEstimateDone === 1 ? self.doneIcon : self.notDoneIcon);
                    if (modelAttributes.projects[i].CostEstimateDone === 1) {
                        iBudgetEstimationCompleteCnt++;
                    }
                }

                if (modelAttributes.projects[i].BudgetSources !== '' && modelAttributes.projects[i].BudgetAllocationDone === 0) {
                    modelAttributes.projects[i].budgetAllocationState = self.validateIcon;
                } else {
                    modelAttributes.projects[i].budgetAllocationState = (modelAttributes.projects[i].BudgetAllocationDone === 1 ? self.doneIcon : self.notDoneIcon);
                    if (modelAttributes.projects[i].BudgetAllocationDone === 1) {
                        iBudgetActualCompleteCnt++;
                    }
                }

                if (modelAttributes.projects[i].MaterialsNeeded !== '' && modelAttributes.projects[i].MaterialListDone === 0) {
                    modelAttributes.projects[i].materialListState = self.validateIcon;
                } else {
                    modelAttributes.projects[i].materialListState = (modelAttributes.projects[i].MaterialListDone === 1 ? self.doneIcon : self.notDoneIcon);
                }

                if (modelAttributes.projects[i].VolunteersNeededEst !== 0 && modelAttributes.projects[i].VolunteerAllocationDone === 0) {
                    modelAttributes.projects[i].volunteerAllocationState = self.validateIcon;
                } else {
                    modelAttributes.projects[i].volunteerAllocationState = (modelAttributes.projects[i].VolunteerAllocationDone === 1 ? self.doneIcon : self.notDoneIcon);
                    if (modelAttributes.projects[i].VolunteerAllocationDone === 1) {
                        iVolunteerEstimationCompleteCnt++;
                    }
                }
                modelAttributes.projects[i].finalCompletionStatusStatus = (modelAttributes.projects[i].FinalCompletionStatus === 1 ? self.doneIcon : self.notDoneIcon);

                if (modelAttributes.projects[i].VolunteersNeededEst !== 0 && modelAttributes.projects[i].VolunteersAssigned === modelAttributes.projects[i].VolunteersNeededEst) {
                    iVolunteerAssignmentCompleteCnt++;
                }

                modelAttributes.projects[i].projectSendState = self.notDoneIcon + ' not-ready-state';
                if (modelAttributes.projects[i].ProjectSend === '4' || modelAttributes.projects[i].ProjectSend === 4) {
                    modelAttributes.projects[i].projectSendState = self.doneIcon + ' sent-state';
                } else if (modelAttributes.projects[i].ProjectSend === '3' || modelAttributes.projects[i].ProjectSend === 3) {
                    modelAttributes.projects[i].projectSendState = self.validateIcon + ' ready-state';
                }

                if (modelAttributes.projects[i].ProjectDescription === '') {
                    modelAttributes.projects[i].projectDescriptionState = 'fa fa-info-circle text-danger';
                    modelAttributes.projects[i].ProjectDescription = 'Project Description is not set yet.';
                } else {
                    modelAttributes.projects[i].projectDescriptionState = 'fa fa-info-circle text-success';
                    iProjectDescriptionCompleteCnt++;
                }
                /**
                 * Setup for tooltips
                 */
                modelAttributes.projects[i].ProjectDescriptionToolTipContent = self.cleanForToolTip(modelAttributes.projects[i].ProjectDescription);
                modelAttributes.projects[i].StatusToolTipContent = self.cleanForToolTip(self.getProjectStatusOptionLabel(modelAttributes.projects[i].Status));
                modelAttributes.projects[i].CostEstimateToolTipContent = self.cleanForToolTip(modelAttributes.projects[i].EstimatedCost);
                let budgetTotal = 0.00;
                let budgetToolTip = "<table class='tooltip-table table table-condensed'>";
                budgetToolTip += '<thead><tr><th>Amt</th><th>Source</th><th>Comment</th></tr></thead><tbody>';
                let aBudgets = App.Collections.annualBudgetsManagementCollection.where({ProjectID: modelAttributes.projects[i].ProjectID});
                _.each(aBudgets, function (budget, idx) {
                    budgetTotal += parseFloat(budget.get('BudgetAmount'));
                    budgetToolTip += '<tr><td>' + budget.get('BudgetAmount') + '</td><td>' + self.getBudgetSourceOptionLabel(budget.get('BudgetSource')) + '</td><td class=\'hide-overflow\'>' + budget.get('Comments') + '</td></tr>';
                });
                budgetToolTip += '<tr><td>' + budgetTotal.toString() + '</td><td colspan=\'2\'><strong>Total</strong></td></tr>';
                budgetToolTip += '</tbody></table>';

                modelAttributes.projects[i].BudgetAllocationToolTipContent = self.cleanForToolTip(budgetToolTip);
                modelAttributes.projects[i].MaterialListToolTipContent = self.cleanForToolTip(modelAttributes.projects[i].MaterialsNeeded);
                modelAttributes.projects[i].VolunteerAllocationToolTipContent = self.cleanForToolTip(modelAttributes.projects[i].VolunteersNeededEst);
                modelAttributes.projects[i].ProjectSendToolTipContent = self.cleanForToolTip(self.getSendStatusOptionLabel(modelAttributes.projects[i].ProjectSend));
                modelAttributes.projects[i].FinalCompletionStatusToolTipContent = self.cleanForToolTip(self.getYesNoOptionLabel(modelAttributes.projects[i].FinalCompletionStatus));
            }

            /**
             * Setup for Site Statuses
             */
            if (iProjectDescriptionCompleteCnt === projectCnt && modelAttributes.ProjectDescriptionComplete === 0) {
                modelAttributes.projectDescriptionState = self.validateIcon;
            } else {
                modelAttributes.projectDescriptionState = (modelAttributes.ProjectDescriptionComplete === 1 ? self.doneIcon : self.notDoneIcon);
            }

            if (iBudgetEstimationCompleteCnt === projectCnt && modelAttributes.BudgetEstimationComplete === 0) {
                modelAttributes.budgetEstimationState = self.validateIcon;
            } else {
                modelAttributes.budgetEstimationState = (modelAttributes.BudgetEstimationComplete === 1 ? self.doneIcon : self.notDoneIcon);
            }

            if (iBudgetEstimationCompleteCnt === projectCnt && modelAttributes.BudgetActualComplete === 0) {
                modelAttributes.budgetActualState = self.validateIcon;
            } else {
                modelAttributes.budgetActualState = (modelAttributes.BudgetActualComplete === 1 ? self.doneIcon : self.notDoneIcon);
            }

            if (iVolunteerEstimationCompleteCnt === projectCnt && modelAttributes.VolunteerEstimationComplete === 0) {
                modelAttributes.volunteerEstimationState = self.validateIcon;
            } else {
                modelAttributes.volunteerEstimationState = (modelAttributes.VolunteerEstimationComplete === 1 ? self.doneIcon : self.notDoneIcon);
            }

            if (iVolunteerAssignmentCompleteCnt === projectCnt && modelAttributes.VolunteerAssignmentComplete === 0) {
                modelAttributes.volunteerAssignmentState = self.validateIcon;
            } else {
                modelAttributes.volunteerAssignmentState = (modelAttributes.VolunteerEstimationComplete === 1 ? self.doneIcon : self.notDoneIcon);
            }

            return modelAttributes;
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
            let $icon = $(e.currentTarget);
            let $popover = $icon.siblings('.popover');
            $popover.find('.popover-title').html('<strong>Update '+ $icon.data('field') +'</strong>');
            $popover.find('.popover-content').html('<strong>hi</strong>');
            console.log('setPopOverContent',e, $popover)
        },
        enableSave: function () {
            let self = this;
            //self.$el.find('button').removeClass('disabled');
        }
        ,
        disableSave: function () {
            let self = this;
            //self.$el.find('button').addClass('disabled');
        }
        ,
        update: function (e) {
            e.preventDefault();
            let self = this;

            /*if ($(e.target).hasClass('disabled')) {
             return;
             }
             let formData = $.unserialize(self.$el.find('form').serialize());

             let currentModelID = formData[self.model.idAttribute];

             let attributes = _.extend({[self.model.idAttribute]: currentModelID}, formData);
             if (attributes['SiteSettingID'] === '') {
             attributes['SiteSettingID'] = currentModelID;
             }
             _log('App.Views.SiteSetting.update', self.options.tab, e.changed, attributes, this.model);
             this.model.url = '/admin/site_setting/' + currentModelID;
             window.ajaxWaiting('show', 'form[name="SiteSetting' + currentModelID + '"]');
             this.model.save(attributes,
             {
             success: function (model, response, options) {
             _log('App.Views.SiteSetting.update', self.options.tab + ' save', model, response, options);
             growl(response.msg, response.success ? 'success' : 'error');
             self.disableSave();
             window.ajaxWaiting('remove', 'form[name="SiteSetting' + currentModelID + '"]');
             },
             error: function (model, response, options) {
             console.error('App.Views.SiteSetting.update', self.options.tab + ' save', model, response, options);
             growl(response.msg, 'error');
             self.disableSave();
             window.ajaxWaiting('remove', 'form[name="SiteSetting' + currentModelID + '"]');
             }
             });*/
        }
        ,
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
