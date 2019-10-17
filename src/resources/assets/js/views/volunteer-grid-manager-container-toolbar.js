(function (App) {
    App.Views.VolunteerGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        viewName: 'volunteer-grid-manager-container-toolbar-view',
        initialize: function (options) {
            let self = this;
            // Required call for inherited class
            self._initialize(options);
            _log('App.Views.VolunteerGridManagerContainerToolbar.initialize', options);
        },
        events: {},
        render: function () {
            let self = this;
            self._render();

            return self;
        }
    });
})(window.App);
