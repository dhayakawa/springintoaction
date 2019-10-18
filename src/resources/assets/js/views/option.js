(function (App) {
    App.Views.Option = App.Views.Backend.extend({
        template: template('optionTemplate'),
        viewName: 'option-view',
        events: {
            'click .ui-icon-trash': 'delete'
        },
        initialize: function (options) {
            let self = this;

            try {
                _.bindAll(self, 'render', 'delete');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            self._initialize(options);
            self.listenTo(self.collection, 'reset', self.render);
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            self.$sortableElement = null;
            self.deletedOptionIds = [];
            self.optionIdAttribute = self.options.optionIdAttribute;
            self.labelAttribute = self.options.labelAttribute;
        },
        render: function (e) {
            let self = this;
            self.$el.html(self.template({
                idAttribute: self.optionIdAttribute,
                labelAttribute: self.labelAttribute,
                options: self.collection.models
            }));

            self.$sortableElement = self.$el.find('.table.options tbody');
            self.$sortableElement.sortable({
                axis: 'y',
                revert: true,
                delay: 150,
                update: function (event, ui) {
                    self.$sortableElement.sortable("refreshPositions");
                    let iSequence = 1;
                    self.$sortableElement.find('tr').each(function (idx, tr) {
                        let id = tr.id.replace(/option_/, '');
                        if (id !== '') {
                            //console.log({tr: tr,'tr.id': tr.id, 'data-id': id, idx: idx, iSequence: iSequence, label: $(tr).find('[name="option_label"]').val()});
                            self.$sortableElement.find('[name="option[' + id + '][DisplaySequence]"]').val(iSequence++);
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
            let $parentRow = $(e.currentTarget).parents('tr');
            let id = $parentRow.attr('id').replace(/option_/, '');
            let optionLabel = self.$sortableElement.find('[name="option[' + id + ']['+ self.labelAttribute+ ']"]').val();
            bootbox.confirm("Do you really want to delete this option: " + optionLabel + "?", function (bConfirmed) {
                if (bConfirmed) {

                    self.deletedOptionIds.push(id);
                    $parentRow.remove();
                    self.trigger('option-list-changed');
                }
            });
        }
    });
})(window.App);
