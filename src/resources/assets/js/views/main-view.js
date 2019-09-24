(function (App) {
    App.Views.mainApp = Backbone.View.extend({
        el: $(".sia-main-app"),
        initialize: function (options) {
            let self = this;
            _log('App.Views.mainApp.initialize', 'MainApp', 'initialize');
            _.bindAll(self, 'render', 'setRouteView');
            self.preRenderedView = false;
            self.routeView              = null;
            self.bOnlyRenderRouteView   = false;
            App.Vars.currentSiteID      = App.Vars.appInitialData.site.SiteID;
            //App.Vars.currentProjectID   = App.Vars.appInitialData.project.ProjectID;
            localStorage.setItem('projects-view.project-model.current-id', App.Vars.appInitialData.project.ProjectID);
            App.Vars.currentSiteVolunteerRoleID   = App.Vars.appInitialData.site_volunteer.SiteVolunteerRoleID;
            App.Vars.mainAppDoneLoading = false;
            self.listenTo(App.Models.projectModel, 'sync', function (e) {
                App.Collections.statusManagementCollection.fetch({reset: true})
            });
            self.listenTo(App.Models.siteStatusModel, 'sync', function (e) {
                App.Collections.statusManagementCollection.fetch({reset: true})
            });
            self.listenTo(App.Models.siteModel, 'sync', function (e) {
                App.Collections.statusManagementCollection.fetch({reset: true})
            });
            self.listenTo(App.Models.projectBudgetModel, 'sync', function (e) {
                App.Collections.annualBudgetsManagementCollection.fetch({reset: true})
            });
            self.checkBrowser();
            self.checkMobileDevice();
        },
        checkBrowser: function(){
            let bIsChrome = navigator.userAgent.indexOf('Chrome') > -1;
            let bIsExplorer = navigator.userAgent.indexOf('MSIE') > -1;
            let bIsFirefox = navigator.userAgent.indexOf('Firefox') > -1;
            let bIsSafari = navigator.userAgent.indexOf("Safari") > -1;
            let bIsOpera = navigator.userAgent.toLowerCase().indexOf("op") > -1;
            if ((bIsChrome) && (bIsSafari)) {
                bIsSafari = false;
            }
            if ((bIsChrome) && (bIsOpera)) {
                bIsChrome = false;
            }

            if (bIsSafari) {
                alert('Sorry, the Safari browser is not supported yet and things will randomly not work if you continue to use it. Please use Chrome or Firefox.');
            }
        },
        checkMobileDevice: function(){
            if((typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)){
                alert('The Spring Into Action admin has not been developed for mobile devices. Use at your own risk.')
            }
        },
        setRouteView: function (view, bOnlyRenderRouteView) {
            this.routeView = view;
            if (typeof bOnlyRenderRouteView !== 'undefined') {
                this.bOnlyRenderRouteView = bOnlyRenderRouteView;
            }
            return this;
        },
        getRouteViewExists: function($el){
            return this.$el.find($el).length;
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
                    if (self.getRouteViewExists(self.routeView.$el)) {
                        window.ajaxWaiting('remove', '.sia-main-app');
                        self.routeView.$el.show()
                    } else {
                        let viewEl = self.routeView.render().el;
                        if (self.preRenderedView){
                            $(viewEl).hide();
                        } else {
                            window.ajaxWaiting('remove', '.sia-main-app');
                        }
                        this.$el.append(viewEl);
                    }
                }
            }

            _log('App.Views.mainApp.render', 'render', 'routeView:' + self.routeView.$el.attr('class'), this.$el);
            if (self.preRenderedView === false && App.Vars.mainAppDoneLoading === false) {
                App.Vars.mainAppDoneLoading = true;
                _log('App.Views.mainApp.render', 'App.Vars.mainAppDoneLoading = true');
                // Hack to force grid columns to work
                $('body').trigger('resize');
            }

            return this;
        }
    });

})(window.App);
