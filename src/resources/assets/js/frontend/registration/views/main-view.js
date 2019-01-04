(function (App) {
    App.Views.mainApp = Backbone.View.extend({
        registrationViewClass: App.Views.Registration,
        el: $(".sia-registration-app"),
        initialize: function (options) {
            _log('App.Views.mainApp.initialize', 'MainApp', 'initialize');
            _.bindAll(this, 'render', 'setRouteView');
            this.routeView              = null;
            this.bOnlyRenderRouteView   = false;
            App.Vars.currentProjectID   = App.Vars.appInitialData.project.ProjectID;
            App.Vars.mainAppDoneLoading = false;
        },
        setRouteView: function (view, bOnlyRenderRouteView) {
            this.routeView = view;
            if (typeof bOnlyRenderRouteView !== 'undefined') {
                this.bOnlyRenderRouteView = bOnlyRenderRouteView;
            }
            return this;
        },
        render: function () {
            let self = this;

            if (self.routeView !== null) {
                if (self.bOnlyRenderRouteView) {
                    /**
                     * The routeView had to execute $(this.options.mainApp.el).html(this.template());
                     * in order to render its own child views.
                     * Don't do it again or it will remove everything the routeView created
                     */
                    self.routeView.render();

                } else {

                    this.$el.html(self.routeView.render().el);
                }
            }

            _log('App.Views.mainApp.render', 'render', 'routeView:' + self.routeView.$el.attr('class'), this.$el);
            if (App.Vars.mainAppDoneLoading === false) {
                App.Vars.mainAppDoneLoading = true;
                _log('App.Views.mainApp.render', 'App.Vars.mainAppDoneLoading = true');
            }
            // Hack to force grid columns to work
            $('body').trigger('resize');
            return this;
        }
    });

})(window.App);
