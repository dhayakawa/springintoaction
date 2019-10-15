(function (App) {
    App.Views.ExampleDashboardManagement = App.Views.Backend.fullExtend({
        attributes: {
            class: 'example-dashboard-management-view route-view box box-primary'
        },
        template: template('exampleDashboardManagementTemplate'),
        initialize: function (options) {
            let self = this;
            this.options = options;

            _.bindAll(this, 'render');
        },
        events: {},
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template());
            return this;
        }
    });
})(window.App);
