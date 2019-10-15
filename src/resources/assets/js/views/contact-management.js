(function (App) {
    App.Views.ContactsManagement = App.Views.Management.fullExtend({
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
                backgridWrapperClassSelector: '.backgrid-wrapper',
                collection: App.PageableCollections.contactsManagementCollection,
                columnCollectionDefinitions: App.Vars.ContactsBackgridColumnDefinitions,
                currentModelIDDataStoreSelector: '.contacts-view',
                el: self.$('.backgrid-wrapper'),
                gridManagerContainerToolbarClassName: 'grid-manager-container',
                mainApp: self.mainApp,
                model: App.Models.contactModel,
                modelNameLabel: 'Contact',
                parentView: self,
                viewName: 'contacts'
            });

            self.contactsGridManagerContainerToolbar = new App.Views.ContactGridManagerContainerToolbar({
                el: self.$('.grid-manager-container'),
                parentView: self,
                mainApp: self.mainApp,
                managedGridView: self.contactsView,
                viewName: 'contacts-grid-manager-toolbar'
            });

            self.contactsGridManagerContainerToolbar.render();
            self.childViews.push(self.contactsGridManagerContainerToolbar);
            self.contactsView.setGridManagerContainerToolbar(self.contactsGridManagerContainerToolbar);

            self.contactsView.render();
            self.childViews.push(self.contactsView);

            return self;

        }
    });
})(window.App);
