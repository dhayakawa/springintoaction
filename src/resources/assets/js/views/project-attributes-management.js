(function (App) {
    App.Views.ProjectAttributesManagement = App.Views.Management.extend({
        className: 'route-view box box-primary project-attributes-management-view',
        template: template('managementTemplate'),
        gridManagerContainerToolbarClass: App.Views.ProjectAttributesGridManagerContainerToolbar,
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'filterList');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            this._initialize(options);

            self.modelIdAttribute = self.options.modelIdAttribute;
            self.labelAttribute = self.options.labelAttribute;

        },
        events: {'change #ProjectTypesFilter': 'filterList'},
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
                let $listItem = new App.Views.ProjectAttributes({
                    collection: self.collection,
                    listItemType: self.options.listItemType,
                    model: self.model,
                    modelNameLabel: self.modelNameLabel,
                    modelIdAttribute: self.modelIdAttribute,
                    labelAttribute: self.labelAttribute,
                    ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                    parentView: self
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
                let $filter = $('<select id="ProjectTypesFilter" name="ProjectTypesFilter" class="site-management-selects form-control input-sm inline"></select>').html(App.Models.projectModel.getSkillsNeededOptions(true));
                self.$('h3.project-attributes-management.box-title').after($filter);
                self.filterList();
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });

            return self;
        },
        filterList: function (e) {
            let self = this;
            if (self.$('#ProjectTypesFilter').length) {
                let projectTypeId = self.$('#ProjectTypesFilter').val();
                self.$('.list-items > tbody > tr').addClass('filtered');
                self.$('.list-items').find('[name*="project_skill_needed_option_id"] option[value="' + projectTypeId + '"]:selected').parents('tr').removeClass('filtered');
            }
        },
    });
})(window.App);
