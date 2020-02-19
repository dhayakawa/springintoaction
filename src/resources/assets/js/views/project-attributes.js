(function (App) {
    App.Views.ProjectAttributes = App.Views.Backend.extend({
        template: template('projectAttributesListItemTemplate'),
        viewName: 'project-attributes-list-item-view',
        events: {
            'click .ui-icon-trash': 'delete',
            'change .list-item-input': 'listChanged',
            'change .list-item-input[name$="[workflow_requirement]"]': 'setWorkflowRequirementDependsOn',
            'change .list-item-input[name$="[workflow_requirement_depends_on]"]': 'setWorkflowRequirementDependsOnCond',
        },
        initialize: function (options) {
            let self = this;

            try {
                _.bindAll(self, 'render', 'delete', 'listChanged');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            self._initialize(options);
            self.listenTo(self.collection, 'reset', self.render);
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            self.$sortableElement = null;
            self.deletedListItemIds = [];
            self.modelIdAttribute = self.options.modelIdAttribute;
            self.labelAttribute = self.options.labelAttribute;
            self.projectAttributes = App.Collections.attributesManagementCollection.getTableOptions('projects', false);
            self.workflowRequirementsDependsOn = '<option data-is-core=\'0\' value=\'\'>N/A</option>' + App.Collections.attributesManagementCollection.getTableOptions('projects', true);
            self.workflowRequirementsDependsOnCondition = '';

        },
        render: function (e) {
            let self = this;

            self.$el.html(self.template({
                idAttribute: self.modelIdAttribute,
                labelAttribute: self.labelAttribute,
                listItems: self.collection.models,
                attributesOptions: App.Collections.attributesManagementCollection.getTableOptions('projects', true),
                workflowOptions: App.Collections.workflowManagementCollection.getOptions(true),
                projectSkillNeededOptions: App.Models.projectModel.getSkillsNeededOptions(true),
                workflowRequirements: App.Models.projectModel.getYesNoOptions(true, 'Yes') + "<option  value='3'>Yes, if depends on condition is met</option>",
                workflowRequirementsDependsOn:self.workflowRequirementsDependsOn,
                workflowRequirementsDependsOnCondition:self.workflowRequirementsDependsOnCondition,
                view: self
            }));

            let listItems= JSON.parse(JSON.stringify(self.collection.models));
            let listItemsCnt = listItems.length;
            for (let i = 0; i < listItemsCnt; i++) {
                let listItem = listItems[i];
                let id = listItem[self.modelIdAttribute];
                let $attributeId = self.$('[name="list_item[' + id + '][attribute_id]"]');
                let $workflowId = self.$('[name="list_item[' + id + '][workflow_id]"]');
                let $workflowRequirement = self.$('[name="list_item[' + id + '][workflow_requirement]"]');
                let $projectSkillNeededOptionId = self.$('[name="list_item[' + id + '][project_skill_needed_option_id]"]');

                $attributeId.val(listItem['attribute_id']);
                let $deleteBtn = $attributeId.parents('tr').find('.ui-icon-trash');
                let bIsCoreAttribute = $attributeId.find('option:selected').data('is-core');

                $workflowId.val(listItem['workflow_id']);


                // if (id===12) {
                //     console.log({
                //         listItem: listItem,
                //         id: id,
                //         $attributeId: $attributeId,
                //         'set attribute_id to': listItem['attribute_id'],
                //         $workflowId: $workflowId,
                //         $projectSkillNeededOptionId: $projectSkillNeededOptionId,
                //         $deleteBtn: $deleteBtn
                //     });
                // }
                $workflowRequirement.val(listItem['workflow_requirement']);
                if(!_.isNull(listItem['workflow_requirement_depends_on']) && listItem['workflow_requirement_depends_on'].toString().match(/^[\d]+$/)){
                    $workflowRequirement.data('depends-on',listItem['workflow_requirement_depends_on']);
                    $workflowRequirement.data('depends-on-cond',listItem['workflow_requirement_depends_on_condition']);
                }
                // show/hide/set depends on fields
                $workflowRequirement.trigger('change');

                $projectSkillNeededOptionId.val(listItem['project_skill_needed_option_id']);


                if (bIsCoreAttribute) {
                    $deleteBtn.hide();
                    $deleteBtn.parent().find('.msg').remove();
                    $deleteBtn.parent().append('<div class="msg">Core attributes are required.</div>');

                    $attributeId.attr('disabled', true);
                    $attributeId.after($('<input type="hidden" name="' + $attributeId.attr('name') + '" data-id="' + $attributeId.data('id') + '"/>').val($attributeId.val()));
                    $projectSkillNeededOptionId.attr('disabled', true);
                    $projectSkillNeededOptionId.hide();
                    $projectSkillNeededOptionId.parent().append('<div class="msg">Will be applied to every project type.</div>');
                    $projectSkillNeededOptionId.after($('<input type="hidden" name="' + $projectSkillNeededOptionId.attr('name') + '" data-id="' + $projectSkillNeededOptionId.data('id') + '"/>').val($projectSkillNeededOptionId.val()));
                } else {
                    // to simplify things, only let non core options be chosen for non-core project attribute selects
                    $attributeId.find('option').each(function (idx, el) {
                        if ($(el).data('is-core')) {
                            $(el).remove()
                        }
                    });
                }
            }
            self.$sortableElement = self.$el.find('.table.list-items tbody');
            self.parentView.filterList();

            return self;
        },
        setWorkflowRequirementDependsOn: function(e){
            let self = this;
            //console.log('setWorkflowRequirementDependsOn',{e:e});
            let $workflowRequirement = $(e.currentTarget);
            let id = $workflowRequirement.data('id');
            let workflowRequirementValue = $workflowRequirement.val();
            let $workflowRequirementDependsOn = self.$('select[name="list_item[' + id + '][workflow_requirement_depends_on]"]');
            let $workflowRequirementDependsOnCondition = self.$('[name="list_item[' + id + '][workflow_requirement_depends_on_condition]"]');
            //console.log('setWorkflowRequirementDependsOn',{id:id,workflowRequirementValue:workflowRequirementValue,e:e});
            //
            if(workflowRequirementValue === '3'){
                if (self.$('input[type="hidden"][name="list_item[' + id + '][workflow_requirement_depends_on]"]').length) {
                    self.$('input[type="hidden"][name="list_item[' + id + '][workflow_requirement_depends_on]"]').remove();
                }
                $workflowRequirementDependsOn.parent().find('.msg').remove();
                $workflowRequirementDependsOn.siblings('input[type="hidden"]').remove();
                $workflowRequirementDependsOn.removeAttr('disabled');
                $workflowRequirementDependsOn.val($workflowRequirement.data('depends-on'));
                $workflowRequirementDependsOn.data('depends-on-cond',$workflowRequirement.data('depends-on-cond'));
                $workflowRequirementDependsOn.show();
                $workflowRequirementDependsOn.trigger('change');
                //console.log('setWorkflowRequirementDependsOn',{depOnVal:$workflowRequirement.data('depends-on'),depOnCond:$workflowRequirement.data('depends-on-cond')});
            } else {
                $workflowRequirementDependsOn.val('');
                $workflowRequirementDependsOn.attr('disabled', true);
                $workflowRequirementDependsOn.hide();
                $workflowRequirementDependsOn.parent().find('.msg').remove();
                $workflowRequirementDependsOn.parent().append('<div class="msg">N/A</div>');
                if (!self.$('input[type="hidden"][name="list_item[' + id + '][workflow_requirement_depends_on]"]').length) {
                    $workflowRequirementDependsOn.after($('<input type="hidden" name="' + $workflowRequirementDependsOn.attr('name') + '" data-id="' + $workflowRequirementDependsOn.data('id') + '"/>').val($workflowRequirementDependsOn.val()));
                }

                let bIsHiddenInput = self.$('input[type="hidden"][name="list_item[' + id + '][workflow_requirement_depends_on_condition]"]').length;
                $workflowRequirementDependsOnCondition.val('');
                if (!bIsHiddenInput) {
                    $workflowRequirementDependsOnCondition.attr('disabled', true);
                    $workflowRequirementDependsOnCondition.hide();
                } else {
                    $workflowRequirementDependsOnCondition.removeAttr('disabled');
                    $workflowRequirementDependsOnCondition.show();
                }
                $workflowRequirementDependsOnCondition.parent().find('.msg').remove();
                $workflowRequirementDependsOnCondition.parent().append('<div class="msg">N/A</div>');
                if (!bIsHiddenInput) {
                    $workflowRequirementDependsOnCondition.after($('<input type="hidden" name="' + $workflowRequirementDependsOnCondition.attr('name') + '" data-id="' + $workflowRequirementDependsOnCondition.data('id') + '"/>').val($workflowRequirementDependsOnCondition.val()));
                    $workflowRequirementDependsOnCondition.remove();
                }

            }
            /**/
        },
        setWorkflowRequirementDependsOnCond: function(e){
            let self = this;
            let attributeOptionsSource = '';
            let attributeInputType = '';
            let $workflowRequirementDependsOn = $(e.currentTarget);

            let id = $workflowRequirementDependsOn.data('id');
            let workflowRequirementDependsOnValue = $workflowRequirementDependsOn.val() !== '' ? parseInt($workflowRequirementDependsOn.val()) : '';
            let workflowRequirementDependsOnCondValue = $workflowRequirementDependsOn.data('depends-on-cond');
            let $workflowRequirementDependsOnCondition = self.$('[name="list_item[' + id + '][workflow_requirement_depends_on_condition]"]');
            let currentTagType = $workflowRequirementDependsOnCondition[0].localName;
            let condition = '';
            $workflowRequirementDependsOnCondition.parent().find('.msg').remove();
            if (_.isNumber(workflowRequirementDependsOnValue)) {
                let attribute = App.Collections.attributesManagementCollection.get(parseInt(workflowRequirementDependsOnValue));
                attributeInputType = attribute.get('input');
                attributeOptionsSource = attribute.get('options_source');
            }
            let bRequiresSelectType = (attributeInputType === 'select' || attributeInputType === 'bool');
            if(bRequiresSelectType && currentTagType === 'input'){
                $workflowRequirementDependsOnCondition.hide();
                $workflowRequirementDependsOnCondition.after($('<select multiple name="' + $workflowRequirementDependsOnCondition.attr('name') + '" data-id="' + $workflowRequirementDependsOnCondition.data('id') + '"></select>'));
                $workflowRequirementDependsOnCondition.remove();
                $workflowRequirementDependsOnCondition = self.$('[name="list_item[' + id + '][workflow_requirement_depends_on_condition]"]');
                $workflowRequirementDependsOnCondition.empty();
            } else if (!bRequiresSelectType && currentTagType === 'select') {
                $workflowRequirementDependsOnCondition.hide();
                $workflowRequirementDependsOnCondition.after($('<input type="text" name="' + $workflowRequirementDependsOnCondition.attr('name') + '" data-id="' + $workflowRequirementDependsOnCondition.data('id') + '"/>'));
                $workflowRequirementDependsOnCondition.remove();
                $workflowRequirementDependsOnCondition = self.$('[name="list_item[' + id + '][workflow_requirement_depends_on_condition]"]');
            }
            if (!bRequiresSelectType) {
                $workflowRequirementDependsOnCondition.attr('type','text');
                $workflowRequirementDependsOnCondition.val(workflowRequirementDependsOnCondValue);
            } else {
                let selectOptions = {
                    bool: App.Models.projectModel.getYesNoOptions(true, workflowRequirementDependsOnCondValue),
                    permit_required_status_options: App.Models.projectModel.getPermitRequiredStatusOptions(true, workflowRequirementDependsOnCondValue),
                    permit_required_options: App.Models.projectModel.getPermitRequiredOptions(true, workflowRequirementDependsOnCondValue),
                    project_skill_needed_options: App.Models.projectModel.getSkillsNeededOptions(true, workflowRequirementDependsOnCondValue),
                    project_status_options: self.addNegativeOptions(App.Models.projectModel.getStatusOptions(false), workflowRequirementDependsOnCondValue),
                    send_status_options: App.Models.projectModel.getSendOptions(true, workflowRequirementDependsOnCondValue),
                    when_will_project_be_completed_options: App.Models.projectModel.getWhenWillProjectBeCompletedOptions(true, workflowRequirementDependsOnCondValue)
                };
                if(attributeInputType === 'bool'){
                    $workflowRequirementDependsOnCondition.append(selectOptions.bool);
                } else if(attributeInputType === 'select'){
                    $workflowRequirementDependsOnCondition.append(selectOptions[attributeOptionsSource]);
                    let bIsMultipleDefaults = workflowRequirementDependsOnCondValue.split(/,/).length > 1;
                    if(bIsMultipleDefaults){
                        _.each(workflowRequirementDependsOnCondValue.split(/,/), function(val,key){
                            $workflowRequirementDependsOnCondition.find('option[value="'+val+'"]').attr('selected','selected');
                        });
                    }

                }
            }
            // $workflowRequirementDependsOnCondition.after($('<input type="hidden" name="' + $workflowRequirementDependsOnCondition.attr('name') + '" data-id="' + $workflowRequirementDependsOnCondition.data('id') + '"/>').val($workflowRequirementDependsOnCondition.val()));
            // $workflowRequirementDependsOnCondition.remove();
            //$workflowRequirementDependsOnCondition.siblings('input[type="hidden"]').remove();
            $workflowRequirementDependsOnCondition.show();
            //console.log('setWorkflowRequirementDependsOnCond',{id:id,workflowRequirementDependsOnValue:workflowRequirementDependsOnValue,attributeInputType:attributeInputType,currentTagType:currentTagType,workflowRequirementDependsOnCondition:$workflowRequirementDependsOnCondition, e:e});
        },
        addNegativeOptions: function(options, defaultOption){
            let neg = [];
            _.each(options, function(val,key){
                neg.push(['Not '+val[0],'not '+val[1]]);
            });
            options = options.concat(neg);
            return _.map(options, function (value, key) {
                let bMatches = false;
                if (!_.isUndefined(defaultOption)&&!_.isNull(defaultOption)) {
                    let bIsMultipleDefaults = defaultOption.split(/,/).length > 1;
                    if (!bIsMultipleDefaults) {
                        if (!_.isNull(defaultOption) && (_.isNumber(defaultOption) || defaultOption.toString().match(/^[\d]+$/))) {
                            bMatches = parseInt(defaultOption) === parseInt(value[1]);
                        } else {
                            bMatches = defaultOption === value[0];
                        }
                    }
                }
                let selected = !_.isUndefined(defaultOption) && bMatches ? 'selected' : '';
                return "<option " + selected + " value='" + value[1] + "'>" + value[0] + "</option>";
            }).join('');
        },
        setGridManagerContainerToolbar: function ($gridManagerContainerToolbar) {
            let self = this;
            self.$gridManagerContainerToolbar = $gridManagerContainerToolbar;
        },
        delete: function (e) {
            let self = this;
            let $parentRow = $(e.currentTarget).parents('tr');
            let id = $parentRow.attr('id').replace(/list_item_/, '');

            bootbox.confirm("Do you really want to delete this item?", function (bConfirmed) {
                if (bConfirmed) {
                    self.deletedListItemIds.push(id);
                    $parentRow.remove();
                    self.trigger('list-changed');
                }
            });
        },
        listChanged: function (e) {
            let self = this;
            if ($(e.currentTarget).attr('name').match(/\[attribute_id\]$/)){
                // do not allow the ability to set the skills needed attribute
                let aCurrentAttributeIds = [42];
                // collect set attribute_ids
                $('.list-items tr:not(.filtered) select[name$="[attribute_id]"]').each(function (idx, el) {
                    if ($(el).attr('name') !== $(e.currentTarget).attr('name')) {
                        aCurrentAttributeIds.push(parseInt($(el).val()));
                    }
                });
                // do not allow duplicate attribute_ids
                if (_.indexOf(aCurrentAttributeIds, parseInt($(e.currentTarget).val())) !== -1) {
                    let $modelFound = self.collection.get($(e.currentTarget).data('id'));
                    // console.log({ctarget: $(e.currentTarget), $modelFound: $modelFound, models: self.collection.models})

                    if (!_.isUndefined($modelFound)) {
                        $(e.currentTarget).val($modelFound.get('attribute_id'));
                    }
                    growl('That attribute already is set. Please choose a different one.','warning');
                    return false;
                }
                let bIsCoreAttribute = $(e.currentTarget).find('option:selected').data('is-core');
                // console.log({currentTarget: e.currentTarget, bIsCoreAttribute: bIsCoreAttribute});
                let $projectSkillNeededOptionId = $(e.currentTarget).parents('tr').find('select[name$="[project_skill_needed_option_id]"]');
                let $deleteBtn = $(e.currentTarget).parents('tr').find('.ui-icon-trash');
                if (bIsCoreAttribute) {
                    // Do not allow core attributes to be deleted
                    $deleteBtn.hide();
                    $deleteBtn.parent().find('.msg').remove();
                    $deleteBtn.parent().append('<div class="msg">Core attributes are required.</div>');

                    $projectSkillNeededOptionId.attr('disabled', true);
                    $projectSkillNeededOptionId.hide();
                    $projectSkillNeededOptionId.parent().find('.msg').remove();
                    $projectSkillNeededOptionId.parent().append('<div class="msg">Core attributes are applied to every project type.</div>');
                    $projectSkillNeededOptionId.after($('<input type="hidden" name="' + $projectSkillNeededOptionId.attr('name') + '" data-id="' + $projectSkillNeededOptionId.data('id') + '"/>').val('*'));
                } else {
                    $deleteBtn.show();
                    $deleteBtn.parent().find('.msg').remove();
                    $projectSkillNeededOptionId.parent().find('.msg').remove();
                    $projectSkillNeededOptionId.removeAttr('disabled');
                    $projectSkillNeededOptionId.show();
                    $projectSkillNeededOptionId.siblings('input[type="hidden"][name="' + $projectSkillNeededOptionId.attr('name') + '"]').remove();
                }
            }
            // FYI- If e is undefined it has probably been called from the underscore/backbone template
            self.trigger('list-changed');
        }
    });
})(window.App);
