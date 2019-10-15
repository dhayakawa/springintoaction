(function (App) {
    App.Views.Option = App.Views.Backend.fullExtend({
        template: template('optionTemplate'),
        viewName: 'option-view',
        events: {
          'click .ui-icon-trash' : 'delete'
        },
        initialize: function (options) {
            let self = this;

            // try {
            //     _.bindAll(self, 'update', 'refreshView', 'getModalForm', 'create', 'destroy', 'toggleDeleteBtn', 'showColumnHeaderLabel', 'showTruncatedCellContentPopup', 'hideTruncatedCellContentPopup');
            // } catch (e) {
            //     console.error(options, e)
            // }
            // Required call for inherited class
            self._initialize(options);
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            self.ajaxWaitingTargetClassSelector = self.options.ajaxWaitingTargetClassSelector;
            self.$sortableElement = null;
        },
        render: function () {
            let self = this;
            self.$el.html(self.template({
                options: self.collection.models
            }));

            self.$sortableElement = self.$el.find('.table.options tbody');
            self.$sortableElement.sortable({
                axis: 'y',
                revert: true,
                delay: 150,
                cursor: "move",
                update: function (event, ui) {
                    self.$sortableElement.sortable("refreshPositions");
                    let aSortedIDs = self.$sortableElement.sortable("toArray");
                    let serialized = self.$sortableElement.sortable("serialize", {key: "sort"});
                    //console.log('update',{ui: ui, aSortedIDs: aSortedIDs, serialized: serialized});

                    let iSequence = 1;
                    self.$sortableElement.find('tr').each(function (idx, tr) {
                        let id = tr.id.replace(/option_/, '');
                        if (id !== '') {
                            //console.log({tr: tr,'tr.id': tr.id, 'data-id': id, idx: idx, iSequence: iSequence, label: $(tr).find('[name="option_label"]').val()});
                            self.$sortableElement.find('[name="DisplaySequence"][data-id="' + id + '"]').val(iSequence++);
                        }
                    });
                    self.trigger('option-list-changed');
                },
            });
            return self;
        },
        setGridManagerContainerToolbar: function ($gridManagerContainerToolbar) {
            let self = this;
            self.$gridManagerContainerToolbar = $gridManagerContainerToolbar;
        },
        delete: function (e) {
            let self = this;
            console.log('delete',e)
            bootbox.confirm("Do you really want to delete this option?", function (bConfirmed) {
                if (bConfirmed) {

                }
            });
        }
    });
})(window.App);
