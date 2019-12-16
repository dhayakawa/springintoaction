(function (App) {
    App.Views.ProjectGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        viewName: 'project-grid-manager-container-toolbar-view',
        initialize: function (options) {
            let self = this;
            // Required call for inherited class
            self._initialize(options);
            _log('App.Views.ProjectGridManagerContainerToolbar.initialize', options);
        },
        events: {},
        render: function () {
            let self = this;
            self._render();
            if (!App.Vars.Auth.bCanAddProject) {
                this.$el.find('.btnAdd').hide();
            }
            if (!App.Vars.Auth.bCanDeleteProject) {
                this.$el.find('.btnDeleteChecked').hide();
            }
            return this;
        },
        editGridRow: function (e) {
            let self = this;
            e.preventDefault();
            let load = self.getViewDataStore('current-site-id','project_management')+'_'+ self.getViewDataStore('current-model-id','projects');
            window.location.href = '#/view/project_scope/management/' + load
        },
        addGridRow: function (e) {
            let self = this;
            e.preventDefault();
            let load = self.getViewDataStore('current-site-id', 'project_management') + '_new';
            window.location.href = '#/view/project_scope/management/' + load
        }
    });
})(window.App);
