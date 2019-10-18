(function (App) {
    App.Views.VolunteersManagement = App.Views.Management.extend({
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
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            self.$el.html(self.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));

            self.volunteersView = new self.volunteersViewClass({
                ajaxWaitingTargetClassSelector: '.volunteers-view',
                backgridWrapperClassSelector: '.backgrid-wrapper',
                collection: App.PageableCollections.volunteersManagementCollection,
                columnCollectionDefinitions: App.Vars.volunteersBackgridColumnDefinitions,
                currentModelIDDataStoreSelector: '.volunteers-view',
                el: self.$('.backgrid-wrapper'),
                gridManagerContainerToolbarClassName: 'grid-manager-container',

                model: App.Models.volunteerModel,
                modelNameLabel: 'Volunteers',
                parentView: self,
                viewName: 'volunteers'
            });

            self.volunteersGridManagerContainerToolbar = new App.Views.VolunteerGridManagerContainerToolbar({
                el: self.$('.grid-manager-container'),
                parentView: self,

                managedGridView: self.volunteersView,
                viewName: 'volunteers-grid-manager-toolbar'
            });

            self.volunteersGridManagerContainerToolbar.render();
            self.childViews.push(self.volunteersGridManagerContainerToolbar);
            self.volunteersView.setGridManagerContainerToolbar(self.volunteersGridManagerContainerToolbar);

            self.volunteersView.render();
            self.childViews.push(self.volunteersView);

            self.backGridFiltersPanel = new App.Views.BackGridFiltersPanel({
                collection: self.collection,
                parentEl: self.volunteersView.$gridContainer
            });

            self.volunteersView.$gridContainer.prepend(self.backGridFiltersPanel.render().$el);
            self.childViews.push(self.backGridFiltersPanel);

            return self;
        }
    });
})(window.App);
