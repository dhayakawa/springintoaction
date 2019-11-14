(function (App) {
    App.Views.AttributesManagement = App.Views.Management.extend({
        className: 'route-view box box-primary attributes-management-view',
        template: template('managementTemplate'),
        gridManagerContainerToolbarClass: App.Views.AttributesGridManagerContainerToolbar,
        initialize: function (options) {
            let self = this;
            // try {
            //     _.bindAll(self, '');
            // } catch (e) {
            //     console.error(options, e)
            // }
            // Required call for inherited class
            this._initialize(options);

            self.modelIdAttribute = self.options.modelIdAttribute;
            self.labelAttribute = self.options.labelAttribute;

        },
        events: {},
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.modelNameLabel = self.options.modelNameLabel.replace(/_/g, ' ').replace(/s$/, '');
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase().replace(/ /g, '-');
            self.$el.html(self.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            self.collection.url = self.getCollectionUrl(self.options.listItemType);
            $.when(
                self.collection.fetch({reset: true})
            ).then(function () {
                let $listItem = new App.Views.Attributes({
                    collection: self.collection,
                    listItemType: self.options.listItemType,
                    model: self.model,
                    modelNameLabel: self.modelNameLabel,
                    modelIdAttribute: self.modelIdAttribute,
                    labelAttribute: self.labelAttribute,
                    ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector
                });

                self.gridManagerContainerToolbar = new self.gridManagerContainerToolbarClass({
                    el: self.$('.grid-manager-container'),
                    parentView: self,
                    managedGridView: $listItem,
                    ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                });
                self.gridManagerContainerToolbar.render();
                self.childViews.push(self.gridManagerContainerToolbar);
                $listItem.setGridManagerContainerToolbar(self.gridManagerContainerToolbar);

                self.$('.backgrid-wrapper').html($listItem.render().el);
                self.childViews.push($listItem);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });

            return self;
        },

    });
})(window.App);
