(function (App) {
    App.Views.ContactGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.fullExtend({
        viewName: 'contact-grid-manager-container-toolbar-view',
        initialize: function (options) {
            let self = this;
            // Required call for inherited class
            self._initialize(options);
            _log('App.Views.ContactGridManagerContainerToolbar.initialize', options);
        },
        events: {},
        render: function () {
            let self = this;
            self._render();

            return self;
        }
    });
})(window.App);
