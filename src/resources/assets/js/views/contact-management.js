(function (App) {
    App.Views.ContactsManagement = App.Views.Management.extend({
        contactsViewClass: App.Views.Contact,
        template: template('managementTemplate'),
        initialize: function (options) {
            let self = this;
            // try {
            //     _.bindAll(self, '');
            // } catch (e) {
            //     console.error(options, e);
            // }
            // Required call for inherited class
            self._initialize(options);

        },
        events: {

        },
        render: function () {
            let self = this;
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            self.$el.html(self.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));

            self.contactsView = new self.contactsViewClass({
                ajaxWaitingTargetClassSelector: '.contacts-view',
                collection: App.PageableCollections.contactsManagementCollection,
                columnCollectionDefinitions: App.Vars.ContactsBackgridColumnDefinitions,
                currentModelIDDataStoreSelector: '.contacts-view',
                el: self.$('.backgrid-wrapper'),
                gridManagerContainerToolbarClassName: 'grid-manager-container',

                model: App.Models.contactModel,
                modelNameLabel: 'Contact',
                parentView: self,
                viewName: 'contacts'
            });

            self.contactsGridManagerContainerToolbar = new App.Views.ContactGridManagerContainerToolbar({
                el: self.$('.grid-manager-container'),
                parentView: self,

                managedGridView: self.contactsView,
                viewName: 'contacts-grid-manager-toolbar'
            });

            self.contactsGridManagerContainerToolbar.render();
            self.childViews.push(self.contactsGridManagerContainerToolbar);
            self.contactsView.setGridManagerContainerToolbar(self.contactsGridManagerContainerToolbar);

            self.contactsView.render();
            self.childViews.push(self.contactsView);

            self.backGridFiltersPanel = new App.Views.BackGridContactsFiltersPanel({
                collection: self.collection,
                parentEl: self.contactsView.$gridContainer
            });

            self.contactsView.$gridContainer.prepend(self.backGridFiltersPanel.render().$el);
            self.childViews.push(self.backGridFiltersPanel);

            return self;

        }
    });
})(window.App);
