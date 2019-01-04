(function (App) {
    App.BackboneRouter = Backbone.Router.extend({
        registrationViewClass: App.Views.Registration,
        bRouteViewRendered: false,
        registrationView: null,
        routeRequested: '',
        initialize: function (options) {
            let self = this;
            _.bindAll(self, 'registration', 'loadView');
            self.mainApp = new App.Views.mainApp;
        },
        routes: {
            '': 'registration',
            'view/:route/:action(/:type)': 'loadView',
            '*default': 'loadView'
        },
        preRouteViewRender: function () {
            let self = this;
            self.mainApp.$el.html('');
            self.bRouteViewRendered = false;
        },
        postRouteViewRender: function () {
            let self = this;
            // Just in case we need to do anything after each route view render
            if (!self.bRouteViewRendered) {
                growl('Sorry, The Page you were looking for was not found. If you think this is an error, let Woodlands know about it.', 'danger');
                // missing route requests get the dashboard route view as long as it's not the dashboard view that's missing
                if (self.routeRequested !== 'registration') {
                    if (App.Vars.devMode) {
                        // This keeps the route url visible so we can troubleshoot etc.
                        self.registration();
                    } else {
                        window.location.href = '#';
                    }
                }
            }
            self.bRouteViewRendered = false;
        },
        registration: function () {
            let self = this;
            self.preRouteViewRender();
            self.routeRequested = 'registration';
            growl('SIA registration route has been called');
            if (self.registrationView === null) {
                    App.Views.registrationView = self.registrationView = new self.registrationViewClass({
                        parentView: self.mainApp.el
                    });
            }
            self.mainApp.setRouteView(self.registrationView).render();
            self.bRouteViewRendered = true;
            self.postRouteViewRender();
        },
        loadView: function (route, action, type) {
            let self = this;
            type     = typeof type !== 'undefined' ? type : '';
            self.preRouteViewRender();
            if (App.Vars.devMode) {
                growl('SIA loadView route has been called:' + route + '_' + action);
            }
            self.routeRequested = route + '_' + action;

            // The backbone View to render
            let routeView = null;

            try {
                switch (self.routeRequested) {

                    case 'volunteers_management':
                        // if (self.volunteersManagementView === null) {
                        //     App.Views.volunteersManagementView = self.volunteersManagementView = new self.volunteersManagementViewClass({
                        //         className: 'box box-primary volunteers-management-view',
                        //         viewClassName: 'volunteers-management-view',
                        //         mainAppEl: self.mainApp.el,
                        //         mainApp: self.mainApp,
                        //         modelNameLabel: 'Volunteer',
                        //         collection: App.PageableCollections.volunteersManagementCollection,
                        //         columnCollectionDefinitions: App.Vars.volunteersBackgridColumnDefinitions,
                        //         hideCellCnt: 0
                        //     });
                        // }
                        // routeView = self.volunteersManagementView;
                        //
                        // break;

                    default:
                        routeView               = null;
                        self.bRouteViewRendered = false;
                }
            } catch (e) {
                console.log('routeView instantiation exception:', e);
                self.bRouteViewRendered = false;
            }

            if (routeView !== null) {
                try {
                    self.mainApp.setRouteView(routeView).render();
                    self.bRouteViewRendered = true;
                } catch (e) {
                    console.log('self.mainApp.setRouteView render exception:', e);
                    self.bRouteViewRendered = false;
                }

            }
            self.postRouteViewRender();

        }
    });

})(window.App);
