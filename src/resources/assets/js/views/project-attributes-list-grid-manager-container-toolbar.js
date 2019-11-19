(function (App) {
    App.Views.ProjectAttributesGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        viewName: 'project-attributes-grid-manager-container-toolbar-view',
        template: template('listGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'saveList', 'addListItem', 'toggleSaveBtn');
            } catch (e) {
                console.error(options, e);
            }
            // Required call for inherited class
            self._initialize(options);
            self._newListItemTemplate = '<tr id="<%= listItemId %>">' +
                                        '<td class="list-item-label required">' +
                                        '    <select class="list-item-input" name="list_item[<%= id %>][attribute_id]" data-id="<%= id %>"><%= attributesOptions %></select>' +
                                        '</td>' +
                                        '<td class="list-item-label required">' +
                                        '    <select class="list-item-input" name="list_item[<%= id %>][workflow_id]" data-id="<%= id %>"><%= workflowOptions %></select>' +
                                        '</td>' +
                                        '<td class="list-item-label">' +
                                        '    <select class="list-item-input" name="list_item[<%= id %>][project_skill_needed_option_id]" data-id="<%= id %>"><%= projectSkillNeededOptions %></select>' +
                                        '</td>' +
                                        '<td class="list-item-label">' +
                                        '    <span data-list-item-id="<%= listItemId %>" class="ui-icon ui-icon-trash"></span>' +
                                        '</td>' +
                                        '<td></td>' +
                                        '</table>';
            self.listenTo(self.options.managedGridView, 'list-changed', self.toggleSaveBtn);
            self.$form = self.options.managedGridView.$('form[name="list-items"]');

            _log('App.Views.ProjectAttributesGridManagerContainerToolbar.initialize', options);
        },
        events: {
            'click .btnSave': 'saveList',
            'click .btnAdd': 'addListItem'
        },
        render: function () {
            let self = this;
            self._render();

            return self;
        },
        /**
         * This is a little hack to use the browsers native form validation
         * @returns {boolean}
         */
        validateForm: function(){
            let self = this;
            let bIsValid = self.$form[0].checkValidity();

            if (!bIsValid) {
                self.$form.find('.list-item-input').on('invalid', function (e) {
                    self.options.managedGridView.flagAsInvalid(e);
                    $(this).off(e);
                });
                self.$form[0].reportValidity();
            }
            return bIsValid;
        },
        saveList: function (e) {
            let self = this;
            self.$form = self.options.managedGridView.$('form[name="list-items"]');
            if (!self.validateForm()){
                growl('Please fix form errors.', 'error');
                return;
            }
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            let data = {
                deletedListItemIds: self.options.managedGridView.deletedListItemIds,
                listItems: self.$form.serialize()
            };

            let growlMsg = '';
            let growlType = '';
            $.when(
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: 'admin/project_attributes/list/' + self.options.managedGridView.options.listItemType,
                    data: data,
                    success: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                        self.options.managedGridView.collection.url = self.managedGridView.getCollectionUrl(self.options.managedGridView.options.listItemType);
                        $.when(
                            self.options.managedGridView.collection.fetch({reset: true})
                        ).then(function () {

                        });
                    },
                    fail: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                    }
                })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
        addListItem: function (e) {
            let self = this;
            let newListItemTemplate = _.template(self._newListItemTemplate);
            let id = _.uniqueId('new');
            let listItemId = 'list_item_' + id;
            // do not allow the ability to set the skills needed attribute
            let aCurrentAttributeIds = [42];
            $('.list-items tr:not(.filtered) select[name$="[attribute_id]"]').each(function (idx,el) {
                aCurrentAttributeIds.push(parseInt($(el).val()));
            });

            self.options.managedGridView.$sortableElement.append(newListItemTemplate({
                id: id,
                listItemId: listItemId,
                labelAttribute: self.options.managedGridView.labelAttribute,
                attributesOptions: App.Collections.attributesManagementCollection.getTableOptions('projects', true),
                workflowOptions: App.Collections.workflowManagementCollection.getOptions(true),
                projectSkillNeededOptions: App.Models.projectModel.getSkillsNeededOptions(true, self.options.managedGridView.parentView.$('#ProjectTypesFilter').text())
            }));

            let $attributeId = self.options.managedGridView.$('[name="list_item[' + id + '][attribute_id]"]');
            $attributeId.find('option').each(function (idx, el) {
                //console.log({optionval: parseInt($(el).attr('value')),index: _.indexOf(aCurrentAttributeIds, parseInt($(el).attr('value')))});
                if (_.indexOf(aCurrentAttributeIds, parseInt($(el).attr('value')))!==-1){
                    $(el).remove()
                }
            });
            let $projectSkillNeededOptionId = self.options.managedGridView.$('[name="list_item[' + id + '][project_skill_needed_option_id]"]');
            $projectSkillNeededOptionId.val(self.options.managedGridView.parentView.$('#ProjectTypesFilter').val());
            $attributeId.trigger('change');
        },
        toggleSaveBtn: function (e) {
            let self = this;

            let toggleState = 'enable';
            _log(self.viewName + '.toggleSaveBtn.event', {e: e, toggleState: toggleState});

            if (toggleState === 'disable') {
                self.$('.btnSave').addClass('disabled');
            } else {
                self.$('.btnSave').removeClass('disabled');
            }
        },
    });
})(window.App);
