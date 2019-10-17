(function (App) {
    App.Views.OptionGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        viewName: 'option-grid-manager-container-toolbar-view',
        template: template('optionGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'saveOptionList', 'addOption', 'toggleSaveBtn');
            } catch (e) {
                console.error(options, e);
            }
            // Required call for inherited class
            self._initialize(options);
            self._newOptionTemplate = '<tr id="<%= optionId %>">' +
                                      '    <td class="display-sequence">' +
                                      '        <span class="ui-icon ui-icon-arrowthick-2-n-s"></span>' +
                                      '        <input name="option[<%= id %>][DisplaySequence]"  data-id="<%= id %>" value="<%= DisplaySequence %>" readonly>' +
                                      '    </td>' +
                                      '    <td class="option-label">' +
                                      '        <input name="option[<%= id %>][<%= labelAttribute %>]" data-id="<%= id %>" value="">' +
                                      '        <span data-option-id="<%= optionId %>" class="ui-icon ui-icon-trash"></span>' +
                                      '    </td>' +
                                      '</tr>';
            self.listenTo(self.options.managedGridView, 'option-list-changed', self.toggleSaveBtn);
            _log('App.Views.OptionGridManagerContainerToolbar.initialize', options);
        },
        events: {
            'click .btnSave': 'saveOptionList',
            'click .btnAdd': 'addOption',
        },
        render: function () {
            let self = this;
            self._render();

            return self;
        },
        saveOptionList: function (e) {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            let data = {
                deletedOptionIds: self.options.managedGridView.deletedOptionIds,
                optionList: $('form[name="option"]').serialize()
            };

            let growlMsg = '';
            let growlType = '';
            $.when(
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: 'admin/option/list/' + self.options.managedGridView.options.optionType,
                    data: data,
                    success: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                        self.options.managedGridView.collection.url = self.managedGridView.getCollectionUrl(self.options.managedGridView.options.optionType);
                        $.when(
                            self.options.managedGridView.collection.fetch({reset: true})
                        ).then(function () {
                            //_log('App.Views.ProjectTab.destroy.event', self.options.tab + ' collection fetch promise done');
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
        addOption: function (e) {
            let self = this;
            let newOptionTemplate = _.template(self._newOptionTemplate);
            let id = _.uniqueId('new');
            let optionId = 'option_' + id;
            let aSorted = self.options.managedGridView.$sortableElement.sortable("toArray");
            let lastOptionId = _.last(aSorted);
            let lastDisplaySequence = self.options.managedGridView.$sortableElement.find('[name="option[' + lastOptionId.replace(/option_/, '') + '][DisplaySequence]"]').val();

            let DisplaySequence = parseInt(lastDisplaySequence) + 1;
            self.options.managedGridView.$sortableElement.append(newOptionTemplate({
                id: id,
                optionId: optionId,
                DisplaySequence: DisplaySequence,
                labelAttribute: self.options.managedGridView.labelAttribute
            }));
            self.options.managedGridView.$sortableElement.sortable("refresh");


        },
        toggleSaveBtn: function (e) {
            let self = this;

            let toggleState = 'enable';//selectedModels.length === 0 ? 'disable' : 'enable';
            _log(self.viewName + '.toggleSaveBtn.event', {e: e, toggleState: toggleState});
            //console.log({viewName: self.viewName, toggleState: toggleState})
            if (toggleState === 'disable') {
                self.$('.btnSave').addClass('disabled');
            } else {
                self.$('.btnSave').removeClass('disabled');
            }
        },
    });
})(window.App);
