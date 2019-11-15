(function (App) {
    App.Views.ProjectScope = App.Views.Backend.extend({
        template: template('projectScopeTemplate'),
        viewName: 'project-scope-view',
        events: {
            'change input,textarea,select': 'formChanged',
            'invalid .list-item-input': 'flagAsInvalid',
            'click [name^="primary_skill_needed"]': 'handleProjectTypeChange',
            'change [name="permit_required"]': 'handlePermitRequiredChange',
            'change [name="status"]': 'handleStatusChange',
            'click .add-material-needed-and-cost': 'addMaterialAndCostRow',
            'click .calculate-total-from-material-cost': 'calculateFromMaterialAndCost'
        },
        initialize: function (options) {
            let self = this;

            try {
                _.bindAll(self, 'render', 'formChanged', 'handleProjectIDChange', 'handleProjectTypeChange', 'handlePermitRequiredChange', 'addMaterialAndCostRow', 'calculateFromMaterialAndCost');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            self._initialize(options);
            self.bDoneLoadingForm = false;
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            self.sitesDropdownView = self.options.parentView.sitesDropdownView;
            self.projectsDropDownView = self.options.parentView.projectsDropDownView;
            self.listenTo(self.projectsDropDownView, "project-id-change", self.handleProjectIDChange);

            self.projectAttributes = JSON.parse(JSON.stringify(App.Collections.projectAttributesManagementCollection.where({workflow_id: 1})));
            self.attributesOptions = JSON.parse(JSON.stringify(App.Collections.attributesManagementCollection.getTableOptions('projects', false)));
            //console.log({attributesOptions: self.attributesOptions})
            self.attributesOptionsCnt = self.attributesOptions.length;
            self.workflowOptions = JSON.parse(JSON.stringify(App.Collections.workflowManagementCollection.getOptions(false)));
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

        },
        formChanged: function() {
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
            self.render();
        },
        render: function (e) {
            let self = this;
            if (_.isUndefined(self.model.get(self.model.idAttribute)) || _.isEmpty(self.model.get(self.model.idAttribute))) {
                self.$el.html('No Projects Found');
            } else {
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                self.model.url = self.getModelUrl(self.model.get(self.model.idAttribute));
                $.when(
                    self.model.fetch({reset: true})
                ).then(function () {
                    //console.log('project scope model', self.model)
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
                    self.currentTypes = self.model.get('primary_skill_needed') !== '' ? JSON.parse(self.model.get('primary_skill_needed')) : [App.Vars.selectOptions['ProjectSkillNeededOptions']['General']];

                    let defaultOptions = [];
                    _.each(self.currentTypes, function (val,idx) {
                        defaultOptions.push(self.getSkillsNeededLabel(val));
                    });
                    //console.log('render', {currentTypes: self.currentTypes, defaultOptions: defaultOptions})
                    let tplVars = {
                        projectTypeCheckboxList: App.Models.projectModel.getSkillsNeededCheckboxList(true, defaultOptions.join(',')),
                        SiteID: self.sitesDropdownView.model.get(self.sitesDropdownView.model.idAttribute),
                        contactSelect: contactSelect.getHtml(),
                        project: self.model
                    };
                    self.$el.html(self.template(tplVars));

                    if (self.$('[name="Comments"]').val() === '') {
                        self.$('[name="Comments"]').attr('rows', 3);
                    }
                    self.finishRenderingForm();

                });
            }

            return self;
        },
        addMaterialAndCostRow: function (e) {
            let self = this;
            e.preventDefault();
            let $table = self.$('.material-needed-and-cost');
            let x = $table.find('tbody > tr').length;
            let attribute_id = _.findWhere(self.attributesOptions, {attribute_code: 'material_needed_and_cost'}).attribute_id;
            let row = self.getMaterialCostRowHtml('material_needed_and_cost', x, attribute_id, ['','']);
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
            let $checked = self.$('[name^="primary_skill_needed"]:checked');
            if ($checked.length === 0) {
                alert('There needs to be at least one Project Type. Defaulting to General');
                self.$('#primary_skill_needed_'+ App.Vars.selectOptions['ProjectSkillNeededOptions']['General']).prop('checked', true);

                $checked = self.$('[name^="primary_skill_needed"]:checked');
            }
            let aIds = [];
            $checked.each(function (idx, el) {
                aIds.push($(el).val());
            });
            let removed = _.difference(self.currentTypes,aIds);
            if (removed.length){
                console.log('removed',removed)
                _.each(removed, function (project_type_id, idx) {
                    _.each(self.getProjectTypeAttributes(project_type_id), function (pta, idx) {
                        let attribute = _.where(self.attributesOptions, {id: pta.attribute_id});
                        // console.log(project_type_id, pta.attribute_id,attribute)
                        self.$('[name="'+ attribute[0].attribute_code+'"]').val(attribute[0].default_value);
                    });
                })
            }

            self.currentTypes = aIds;
            self.buildFormElements(aIds);
        },
        finishRenderingForm: function () {
            let self = this;

            self.buildFormElements(self.currentTypes);

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
        getSkillsNeededLabel: function (id){
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
            let materialNeed = aRowValues[0];
            let cost = aRowValues[1];
            return '<tr><td><input data-attribute-id="' + attribute_id + '" name="' + attribute_code + '[material][]" class="form-control material" id="' + attribute_code + '_cost_' + x + '" placeholder="" value="' + materialNeed + '"/></td><td><div class="input-group"><div class="input-group-addon">$</div><input type="number" title="Money format only please. With or without cents." data-attribute-id="' + attribute_id + '" name="' + attribute_code + '[cost][]" class="form-control material-cost" id="' + attribute_code + '_cost_' + x + '" placeholder="0.00" value="' + cost + '" step="0.01"/></div></td></tr>';
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
                        html += '<tfoot><tr><td colspan="2" align="right"><button class="btn btn-secondary add-material-needed-and-cost">Add another material</button></td></tr></tfoot>';
                        html += '</table>';
                    }
                    break;
                case 'text':
                    html += '<input type="text" data-attribute-id="' + attribute_id + '" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="' + placeholder + '" ' + pattern + ' value="' + value + '"/>';
                    break;
                case 'textarea':
                    if (attribute_code === 'special_instructions') {
                        placeholder = '';
                        helpBlock = '<p class="help-block special-instructions"></p>';
                    }
                    let rowsVisible = value === '' ? 3 : 5;
                    html = '<textarea style="resize:vertical" rows="' + rowsVisible + '" data-attribute-id="' + attribute_id + '" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="' + placeholder + '">' + value + '</textarea>' + helpBlock;
                    break;
                case 'select':
                    html = '<select data-attribute-id="' + attribute_id + '" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '">' + optionHtml + '</select>';
                    break;
                case 'bool':
                    html = '<div class="admin__actions-switch" data-role="switcher">' +
                           '    <input name="' + attribute_code + '" class="admin__actions-switch-checkbox" type="checkbox">' +
                           '    <label class="admin__actions-switch-label">' +
                           '        <span class="admin__actions-switch-text">No</span>' +
                           '    </label>' +
                           '</div>';
                    break;
                case 'number':
                    bCloseInputGroup = false;
                    let numberStepAttr = '';
                    if (attribute_code === 'estimated_total_cost' || attribute_code === 'actual_cost') {
                        bCloseInputGroup = true;
                        html += '<div class="input-group"><div class="input-group-addon">$</div>';
                        placeholder = '0.00';
                        numberStepAttr = ' step="0.01" ';
                        helpBlock = '<p class="help-block">Money format only please. With or without cents.</p>';
                    }
                    html += '<input data-attribute-id="' + attribute_id + '" type="number" '+ numberStepAttr +' name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="" value="' + value + '"/>';
                    if (bCloseInputGroup) {
                        if (attribute_code === 'estimated_total_cost') {
                            html += '<div class="input-group-btn"><button class="btn btn-primary calculate-total-from-material-cost">Calculate Total From Material Cost</button></div>';
                        }
                        html += '</div>';
                    }
                    html += helpBlock;
                    break;
                default:
                    html = '<input data-attribute-id="' + attribute_id + '" type="text" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="" value="' + value + '"/>';
            }
            return html;
        },
        getAttributesForForm: function(projectTypeId){
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
        buildFormElements: function (projectTypeId) {
            let self = this;
            let aProjectTypeAttributes = self.getAttributesForForm(projectTypeId);

            for (let i = 0; i < self.attributesOptionsCnt; i++) {
                let attribute = self.attributesOptions[i];
                if (_.where(aProjectTypeAttributes, {attribute_id: attribute.id}).length) {

                    if (self.$('[name^="' + attribute.attribute_code + '"]').length === 0) {
                        let value = self.model.get(attribute.attribute_code);
                        let optionHtml = attribute.options_source !== '' && !_.isUndefined(self.selectOptions[attribute.options_source]) ? self.selectOptions[attribute.options_source] : '';

                        let hideClass = '';
                        if ('status_reason' === attribute.attribute_code || 'permit_required_for' === attribute.attribute_code || 'would_like_team_lead_to_contact' === attribute.attribute_code) {
                            hideClass = 'hide';
                        }
                        let row = '<div class="dynamic form-group ' + hideClass + '">' +
                                  '    <label for="' + attribute.attribute_code + '">' + attribute.label + '</label>' +
                                  self.getInputHtml(attribute.input, attribute.attribute_code, attribute.id, value, optionHtml) +
                                  '</div>';
                        self.$('[name="projectScope"]').append(row);
                        if (attribute.input === 'select') {
                            self.$('[name="' + attribute.attribute_code + '"]').val(value);
                        } else if (attribute.input === 'bool') {
                            self.$('[name="' + attribute.attribute_code + '"]').prop('checked', value === 1);
                        }
                    } else {

                        self.$('[name="' + attribute.attribute_code + '"]').parents('.dynamic').show();
                    }
                } else {
                    if (self.$('[name="' + attribute.attribute_code + '"]').length) {
                        self.$('[name="' + attribute.attribute_code + '"]').parents('.dynamic').hide();
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
            console.log('flagAsInvalid', {e: e, currentTarget: e.currentTarget})
            $(e.currentTarget).css('border-color', 'red');
        }
    });
})(window.App);
