(function (App) {
    App.Views.StatusManagementRecord = Backbone.View.extend({
        tagName: 'div',
        attributes: {
            class: 'row'
        },
        template: template('statusManagementRecordTemplate'),
        initialize: function (options) {
            let self = this;
            this.options = options;

            _.bindAll(this, 'render');
        },
        events: {
            'click button': 'update',
            'change .form-control': 'enableSave',
            'change [name="value"]': 'enableSave',
        },
        render: function () {
            let self = this;
            //console.log(self.model.attributes)
            let $statusManagementRecord = self.template({model: self.setTemplateVars(self.model.attributes)});
            $(self.el).append($statusManagementRecord);

            return this;
        },
        setTemplateVars: function (modelAttributes) {

            let projectCnt = modelAttributes.projects.length;
            let iProjectDescriptionCompleteCnt = 0;
            let iBudgetEstimationCompleteCnt = 0;
            let iBudgetActualCompleteCnt = 0;
            let iVolunteerEstimationCompleteCnt = 0;
            let iVolunteerAssignmentCompleteCnt = 0;

            for (let i = 0; i < projectCnt; i++) {
                modelAttributes.projects[i].statusState = 'fa fa-circle text-danger not-approved';
                if (modelAttributes.projects[i].Status === '7') {
                    modelAttributes.projects[i].statusState = 'fa fa-circle text-success approved-state';
                } else if (modelAttributes.projects[i].Status === '6') {
                    modelAttributes.projects[i].statusState = 'fa fa-circle text-warning pending-state';
                }

                if (modelAttributes.projects[i].EstimatedCost !== '0.0000' && modelAttributes.projects[i].CostEstimateDone === 0) {
                    modelAttributes.projects[i].costEstimateState = 'fas fa-dot-circle text-warning';
                } else {
                    modelAttributes.projects[i].costEstimateState = 'fa fa-circle ' + (modelAttributes.projects[i].CostEstimateDone === '1' ? 'text-success' : 'text-danger');
                    if (modelAttributes.projects[i].CostEstimateDone === '1'){
                        iBudgetEstimationCompleteCnt++;
                    }
                }

                if (modelAttributes.projects[i].BudgetSources !== '' && modelAttributes.projects[i].BudgetAllocationDone === 0) {
                    modelAttributes.projects[i].budgetAllocationState = 'fas fa-dot-circle text-warning';
                } else {
                    modelAttributes.projects[i].budgetAllocationState = 'fa fa-circle ' + (modelAttributes.projects[i].BudgetAllocationDone === '1' ? 'text-success' : 'text-danger');
                    if (modelAttributes.projects[i].BudgetAllocationDone === '1') {
                        iBudgetActualCompleteCnt++;
                    }
                }

                if (modelAttributes.projects[i].MaterialsNeeded !== '' && modelAttributes.projects[i].MaterialListDone === 0) {
                    modelAttributes.projects[i].materialListState = 'fas fa-dot-circle text-warning';
                } else {
                    modelAttributes.projects[i].materialListState = 'fa fa-circle ' + (modelAttributes.projects[i].MaterialListDone === '1' ? 'text-success' : 'text-danger');
                }

                if (modelAttributes.projects[i].VolunteersNeededEst !== 0 && modelAttributes.projects[i].VolunteerAllocationDone === 0) {
                    modelAttributes.projects[i].volunteerAllocationState = 'fas fa-dot-circle text-warning';
                } else {
                    modelAttributes.projects[i].volunteerAllocationState = 'fa fa-circle ' + (modelAttributes.projects[i].VolunteerAllocationDone === '1' ? 'text-success' : 'text-danger');
                    if (modelAttributes.projects[i].VolunteerAllocationDone === '1') {
                        iVolunteerEstimationCompleteCnt++;
                    }
                }
                modelAttributes.projects[i].finalCompletionStatusStatus = 'fa fa-circle ' +(modelAttributes.projects[i].FinalCompletionStatus === '1' ? 'text-success' : 'text-danger');

                if (modelAttributes.projects[i].VolunteersNeededEst !== 0 && modelAttributes.projects[i].VolunteersAssigned === modelAttributes.projects[i].VolunteersNeededEst) {
                    iVolunteerAssignmentCompleteCnt++;
                }

                modelAttributes.projects[i].projectSendState = 'fa fa-circle text-danger not-ready-state';
                if (modelAttributes.projects[i].Status === '4') {
                    modelAttributes.projects[i].projectSendState = 'fa fa-circle text-success sent-state';
                } else if (modelAttributes.projects[i].Status === '2') {
                    modelAttributes.projects[i].projectSendState = 'far fa-circle text-success ready-state';
                }

                if (modelAttributes.projects[i].ProjectDescription === '') {
                    modelAttributes.projects[i].descriptionState = 'text-danger';
                    modelAttributes.projects[i].ProjectDescription = 'Project Description is not set yet.';
                } else {
                    modelAttributes.projects[i].descriptionState = 'text-success';
                    iProjectDescriptionCompleteCnt++;
                }

            }

            if (iProjectDescriptionCompleteCnt === projectCnt && modelAttributes.ProjectDescriptionComplete === 0) {
                modelAttributes.projectDescriptionState = 'fas fa-dot-circle text-warning';
            } else {
                modelAttributes.projectDescriptionState = 'fa fa-circle ' + (modelAttributes.ProjectDescriptionComplete === '1' ? 'text-success' : 'text-danger');
            }

            if (iBudgetEstimationCompleteCnt === projectCnt && modelAttributes.BudgetEstimationComplete === 0) {
                modelAttributes.budgetEstimationState = 'fas fa-dot-circle text-warning';
            } else {
                modelAttributes.budgetEstimationState = 'fa fa-circle ' + (modelAttributes.BudgetEstimationComplete === '1' ? 'text-success' : 'text-danger');
            }

            if (iBudgetEstimationCompleteCnt === projectCnt && modelAttributes.BudgetActualComplete === 0) {
                modelAttributes.budgetActualState = 'fas fa-dot-circle text-warning';
            } else {
                modelAttributes.budgetActualState = 'fa fa-circle ' + (modelAttributes.BudgetActualComplete === '1' ? 'text-success' : 'text-danger');
            }

            if (iVolunteerEstimationCompleteCnt === projectCnt && modelAttributes.VolunteerEstimationComplete === 0) {
                modelAttributes.volunteerEstimationState = 'fas fa-dot-circle text-warning';
            } else {
                modelAttributes.volunteerEstimationState = 'fa fa-circle ' + (modelAttributes.VolunteerEstimationComplete === '1' ? 'text-success' : 'text-danger');
            }

            if (iVolunteerAssignmentCompleteCnt === projectCnt && modelAttributes.VolunteerAssignmentComplete === 0) {
                modelAttributes.volunteerAssignmentState = 'fas fa-dot-circle text-warning';
            } else {
                modelAttributes.volunteerAssignmentState = 'fa fa-circle ' + (modelAttributes.VolunteerEstimationComplete === '1' ? 'text-success' : 'text-danger');
            }

            return modelAttributes;
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
            self.$el.find('[data-toggle="tooltip"]').tooltip();
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
