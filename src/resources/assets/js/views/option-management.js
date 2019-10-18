(function (App) {
    App.Views.OptionManagement = App.Views.Management.extend({
        attributes: {
            class: 'route-view box box-primary option-management-view'
        },
        template: template('managementTemplate'),
        initialize: function (options) {
            let self = this;
            // try {
            //     _.bindAll(self, 'addSite', 'deleteSite');
            // } catch (e) {
            //     console.error(options, e)
            // }
            // Required call for inherited class
            this._initialize(options);

            self.optionIdAttribute = self.options.optionIdAttribute;
            self.labelAttribute = self.options.labelAttribute;

        },
        events: {

        },
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.modelNameLabel = self.options.modelNameLabel.replace(/_/g,' ').replace(/s$/,'');
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase().replace(/ /g,'-');
            self.$el.html(self.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            self.collection.url = self.getCollectionUrl(self.options.optionType);
            $.when(
                self.collection.fetch({reset:true})
            ).then(function () {
                let $option = new App.Views.Option({
                                        collection: self.collection,
                    optionType: self.options.optionType,
                    model: self.model,
                    modelNameLabel: self.modelNameLabel,
                    optionIdAttribute: self.optionIdAttribute,
                    labelAttribute: self.labelAttribute,
                    ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector
                });

                self.optionGridManagerContainerToolbar = new App.Views.OptionGridManagerContainerToolbar({
                    el: self.$('.grid-manager-container'),
                    parentView: self,

                    managedGridView: $option,
                    ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                    viewName: 'option-grid-manager-toolbar'
                });
                self.optionGridManagerContainerToolbar.render();
                self.childViews.push(self.optionGridManagerContainerToolbar);
                $option.setGridManagerContainerToolbar(self.optionGridManagerContainerToolbar);

                self.$('.backgrid-wrapper').html($option.render().el);
                self.childViews.push($option);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });

            return self;
        },

    });
})(window.App);
