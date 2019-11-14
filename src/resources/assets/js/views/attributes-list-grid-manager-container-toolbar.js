(function (App) {
    App.Views.AttributesGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        viewName: 'attributes-grid-manager-container-toolbar-view',
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
                                      '    <td class="display-sequence">' +
                                      '        <span class="ui-icon ui-icon-arrowthick-2-n-s"></span>' +
                                      '        <input name="list_item[<%= id %>][DisplaySequence]"  data-id="<%= id %>" value="<%= DisplaySequence %>" readonly>' +
                                      '    </td>' +
                                      '    <td class="option-label">' +
                                      '        <input name="list_item[<%= id %>][<%= labelAttribute %>]" data-id="<%= id %>" value="">' +
                                      '        <span data-list-item-id="<%= listItemId %>" class="ui-icon ui-icon-trash"></span>' +
                                      '    </td>' +
                                      '</tr>';
            self.listenTo(self.options.managedGridView, 'list-changed', self.toggleSaveBtn);
            _log('App.Views.AttributesGridManagerContainerToolbar.initialize', options);
        },
        events: {
            'click .btnSave': 'saveList',
            'click .btnAdd': 'addListItem',
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
                    url: 'admin/attributes/list/' + self.options.managedGridView.options.listItemType,
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
            let aSorted = self.options.managedGridView.$sortableElement.sortable("toArray");
            let lastListItemId = _.last(aSorted);
            let lastDisplaySequence = self.options.managedGridView.$sortableElement.find('[name="list_item[' + lastListItemId.replace(/list_item_/, '') + '][DisplaySequence]"]').val();

            let DisplaySequence = parseInt(lastDisplaySequence) + 1;
            self.options.managedGridView.$sortableElement.append(newListItemTemplate({
                id: id,
                listItemId: listItemId,
                DisplaySequence: DisplaySequence,
                labelAttribute: self.options.managedGridView.labelAttribute
            }));
            self.options.managedGridView.$sortableElement.sortable("refresh");


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
