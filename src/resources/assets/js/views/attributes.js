(function (App) {
    App.Views.Attributes = App.Views.Backend.extend({
        template: template('attributesListItemTemplate'),
        viewName: 'attributes-list-item-view',
        events: {
            'click .ui-icon-trash': 'delete',
            'change .list-item-input': 'listChanged',
            'invalid .list-item-input': 'flagAsInvalid',
        },
        initialize: function (options) {
            let self = this;

            try {
                _.bindAll(self, 'render', 'delete', 'listChanged', 'flagAsInvalid');
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
                highestSequenceNumber: self.getHighestSequenceNumber(),
                view: self
            }));

            self.$sortableElement = self.$el.find('.table.list-items tbody');
            self.$sortableElement.sortable({
                axis: 'y',
                revert: true,
                delay: 150,
                update: function (event, ui) {
                    self.$sortableElement.sortable("refreshPositions");
                    let iSequence = 1;
                    self.$sortableElement.find('tr').each(function (idx, tr) {
                        let id = tr.id.replace(/list_item_/, '');
                        if (id !== '') {
                            //console.log({tr: tr,'tr.id': tr.id, 'data-id': id, idx: idx, iSequence: iSequence, label: $(tr).find('[name="option_label"]').val()});
                            self.$sortableElement.find('[name="list_item[' + id + '][DisplaySequence]"]').val(iSequence++);
                        }
                    });
                    self.trigger('list-changed');
                },
            });

            return self;
        },
        getHighestSequenceNumber: function() {
            let self = this;
            let highest = 0;
            _.each(self.collection.models, function (val,idx) {
                if (val > highest){
                    highest = val;
                }
            });
            return highest;
        },
        setGridManagerContainerToolbar: function ($gridManagerContainerToolbar) {
            let self = this;
            self.$gridManagerContainerToolbar = $gridManagerContainerToolbar;
        },
        delete: function (e) {
            let self = this;
            let $parentRow = $(e.currentTarget).parents('tr');
            let id = $parentRow.attr('id').replace(/list_item_/, '');
            let listItemLabel = self.$sortableElement.find('[name="list_item[' + id + ']['+ self.labelAttribute+ ']"]').val();
            bootbox.confirm("Do you really want to delete this item: " + listItemLabel + "?", function (bConfirmed) {
                if (bConfirmed) {
                    self.deletedListItemIds.push(id);
                    $parentRow.remove();
                    self.trigger('list-changed');
                }
            });
        },
        listChanged: function (e) {
            let self = this;
            // FYI- If e is undefined it has probably been called from the underscore/backbone template
            self.trigger('list-changed');
        },
        flagAsInvalid: function (e) {
            let self = this;
            console.log('flagAsInvalid',{e:e, currentTarget:e.currentTarget})
            $(e.currentTarget).css('border-color','red');
        }
    });
})(window.App);
