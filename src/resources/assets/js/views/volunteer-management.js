(function (App) {
    App.Views.VolunteersManagement = App.Views.Management.fullExtend({
        volunteersViewClass: App.Views.Volunteer,
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

            self.volunteersView = new self.volunteersViewClass({
                ajaxWaitingTargetClassSelector: '.volunteers-view',
                backgridWrapperClassSelector: '.backgrid-wrapper',
                collection: App.PageableCollections.volunteersManagementCollection,
                columnCollectionDefinitions: App.Vars.volunteersBackgridColumnDefinitions,
                currentModelIDDataStoreSelector: '.volunteers-view',
                el: self.$('.backgrid-wrapper'),
                gridManagerContainerToolbarClassName: 'grid-manager-container',
                mainApp: self.mainApp,
                model: App.Models.volunteerModel,
                modelNameLabel: 'Volunteers',
                parentView: self,
                viewName: 'volunteers'
            });

            self.volunteersGridManagerContainerToolbar = new App.Views.VolunteerGridManagerContainerToolbar({
                el: self.$('.grid-manager-container'),
                parentView: self,
                mainApp: self.mainApp,
                managedGridView: self.volunteersView,
                viewName: 'volunteers-grid-manager-toolbar'
            });

            self.volunteersGridManagerContainerToolbar.render();
            self.childViews.push(self.volunteersGridManagerContainerToolbar);
            self.volunteersView.setGridManagerContainerToolbar(self.volunteersGridManagerContainerToolbar);

            self.volunteersView.render();
            self.childViews.push(self.volunteersView);

            return self;
        }
    });
})(window.App);
