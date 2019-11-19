(function (App) {
    App.Views.ProjectAttributes = App.Views.Backend.extend({
        template: template('projectAttributesListItemTemplate'),
        viewName: 'project-attributes-list-item-view',
        events: {
            'click .ui-icon-trash': 'delete',
            'change .list-item-input': 'listChanged',
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
                view: self
            }));
            self.$sortableElement = self.$el.find('.table.list-items tbody');
            self.parentView.filterList();
            return self;
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
                // do not allow attribute_ids
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
                if (bIsCoreAttribute) {
                    $projectSkillNeededOptionId.attr('disabled', true);
                    $projectSkillNeededOptionId.hide();
                    $projectSkillNeededOptionId.parent().find('.msg').remove();
                    $projectSkillNeededOptionId.parent().append('<div class="msg">Will be applied to every project type.</div>');
                    $projectSkillNeededOptionId.after($('<input type="hidden" name="' + $projectSkillNeededOptionId.attr('name') + '" data-id="' + $projectSkillNeededOptionId.data('id') + '"/>').val('*'));
                } else {
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
