(function (App) {
    App.BackboneRouter = Backbone.Router.extend({
        dashboardViewClass: App.Views.Dashboard,
        siteManagementViewClass: App.Views.SiteManagement,
        projectManagementViewClass: App.Views.ProjectManagement,
        siteProjectTabsViewClass: App.Views.SiteProjectTabs,
        contactsManagementViewClass: App.Views.ContactsManagement,
        volunteersManagementViewClass: App.Views.VolunteersManagement,
        annualBudgetsManagementViewClass: App.Views.AnnualBudgetsManagement,
        reportsManagementViewClass: App.Views.ReportsManagement,
        dashboardView: null,
        siteManagementView: null,
        projectManagementView: null,
        siteProjectTabsView: null,
        contactsManagementView: null,
        volunteersManagementView: null,
        annualBudgetsManagementView: null,
        reportsManagementView: [],
        bRouteViewRendered: false,
        routeRequested: '',
        initialize: function (options) {
            let self = this;
            _.bindAll(self, 'dashboard', 'loadView');
            self.mainApp = new App.Views.mainApp;
        },
        routes: {
            '': 'dashboard',
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
                if (self.routeRequested !== 'dashboard') {
                    if (App.Vars.devMode) {
                        // This keeps the route url visible so we can troubleshoot etc.
                        self.dashboard();
                    } else {
                        window.location.href = '#';
                    }
                }
            }
            self.bRouteViewRendered = false;
        },
        dashboard: function () {
            let self = this;
            self.preRouteViewRender();
            self.routeRequested = 'dashboard';
            //growl('SIA index route has been called');
            if (self.dashboardView === null) {
                let aDashboardPanelViews = [];
                if (App.Vars.Auth.bCanSiteManagement) {
                    aDashboardPanelViews.push(new App.Views.DashboardPanel({
                        model:
                            new App.Models.DashboardPanel({
                                'panelBgColor': 'aqua',
                                'panelFAIconClass': 'fa-university',
                                'panelName': 'Site Management',
                                'panelDescription': '',
                                'panelLinksListView': new App.Views.DashboardPanelLinksList({
                                    collection: new App.Collections.DashboardPanelLinksListItem([
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Sites',
                                            'badgeCount': App.Vars.appInitialData.sites.length,
                                            'route': 'view/site/management'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Projects',
                                            'badgeCount': App.Vars.appInitialData.all_projects.length,
                                            'route': 'view/project/management'
                                        })
                                    ])
                                }).render().$el.html()
                            })
                    }).render().$el.html());
                }
                if (App.Vars.Auth.bCanPeopleManagement) {
                    aDashboardPanelViews.push(new App.Views.DashboardPanel({
                        model:
                            new App.Models.DashboardPanel({
                                'panelBgColor': 'green',
                                'panelFAIconClass': 'fa-users',
                                'panelName': 'People Management',
                                'panelDescription': '',
                                'panelLinksListView': new App.Views.DashboardPanelLinksList({
                                    collection: new App.Collections.DashboardPanelLinksListItem([
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Site Contacts',
                                            'badgeCount': App.Vars.appInitialData.all_contacts.length,
                                            'route': 'view/site_contacts/management'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Volunteers',
                                            'badgeCount': App.Vars.appInitialData.volunteers.length,
                                            'route': 'view/volunteers/management'
                                        })
                                    ])
                                }).render().$el.html()
                            })
                    }).render().$el.html());
                }
                if (App.Vars.Auth.bCanProjectManagement) {
                    aDashboardPanelViews.push(new App.Views.DashboardPanel({
                        model:
                            new App.Models.DashboardPanel({
                                'panelBgColor': 'orange',
                                'panelFAIconClass': 'fa-bar-chart',
                                'panelName': 'Reports',
                                'panelDescription': '',
                                'panelLinksListView': new App.Views.DashboardPanelLinksList({
                                    collection: new App.Collections.DashboardPanelLinksListItem([
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Sites',
                                            'badgeCount': '1',
                                            'route': 'view/reports/management/sites'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Projects',
                                            'badgeCount': '1',
                                            'route': 'view/reports/management/projects'
                                        }),
                                        // new App.Models.DashboardPanelLinksListItem({
                                        //     'linkText': 'Volunteers',
                                        //     'badgeCount': '0',
                                        //     'route': 'view/reports/management/volunteers'
                                        // })
                                    ])
                                }).render().$el.html()
                            })
                    }).render().$el.html());
                }
                if (App.Vars.Auth.bCanBudgetManagement) {
                    aDashboardPanelViews.push(new App.Views.DashboardPanel({
                        model:
                            new App.Models.DashboardPanel({
                                'panelBgColor': 'purple',
                                'panelFAIconClass': 'fa-calculator',
                                'panelName': 'Budget Management',
                                'panelDescription': '',
                                'panelLinksListView': new App.Views.DashboardPanelLinksList({
                                    collection: new App.Collections.DashboardPanelLinksListItem([
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Review ' + App.Vars.appInitialData.annual_budget[0].Year,
                                            'badgeCount': '$' + App.Vars.appInitialData.annual_budget[0].BudgetAmount,
                                            'route': 'view/budget/management'
                                        })
                                    ])
                                }).render().$el.html()
                            })
                    }).render().$el.html());
                }

                App.Views.dashboardView = self.dashboardView = new self.dashboardViewClass({
                    dashboardPanelViews: aDashboardPanelViews
                });
            }
            self.mainApp.setRouteView(self.dashboardView).render();
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
                    case 'site_management':
                        if (self.siteManagementView === null) {
                            App.Views.siteManagementView = self.siteManagementView = new self.siteManagementViewClass({
                                mainApp: self.mainApp
                            });
                        }

                        routeView = self.siteManagementView;
                        break;
                    case 'project_management':
                        if (self.projectManagementView === null) {
                            App.Views.projectManagementView = self.projectManagementView = new self.projectManagementViewClass({
                                mainApp: self.mainApp

                            });
                        }

                        routeView = self.projectManagementView;

                        break;
                    case 'site_contacts_management':
                        if (self.contactsManagementView === null) {
                            App.Views.contactsManagementView = self.contactsManagementView = new self.contactsManagementViewClass({
                                className: 'box box-primary contacts-management-view',
                                viewClassName: 'contacts-management-view',
                                mainAppEl: self.mainApp.el,
                                mainApp: self.mainApp,
                                modelNameLabel: 'Contact',
                                collection: App.PageableCollections.contactsManagementCollection,
                                columnCollectionDefinitions: App.Vars.ContactsBackgridColumnDefinitions,
                                hideCellCnt: 0
                            });
                        }
                        routeView = self.contactsManagementView;

                        break;
                    case 'volunteers_management':
                        if (self.volunteersManagementView === null) {
                            App.Views.volunteersManagementView = self.volunteersManagementView = new self.volunteersManagementViewClass({
                                className: 'box box-primary volunteers-management-view',
                                viewClassName: 'volunteers-management-view',
                                mainAppEl: self.mainApp.el,
                                mainApp: self.mainApp,
                                modelNameLabel: 'Volunteer',
                                collection: App.PageableCollections.volunteersManagementCollection,
                                columnCollectionDefinitions: App.Vars.volunteersBackgridColumnDefinitions,
                                hideCellCnt: 0
                            });
                        }
                        routeView = self.volunteersManagementView;

                        break;
                    case 'budget_management':
                        if (self.annualBudgetsManagementView === null) {
                            App.Views.annualBudgetsManagementView = self.annualBudgetsManagementView = new self.annualBudgetsManagementViewClass({
                                className: 'box box-primary annualbudgets-management-view',
                                viewClassName: 'annualbudgets-management-view',
                                model: App.Models.annualBudgetModel,
                                mainAppEl: self.mainApp.el,
                                mainApp: self.mainApp,
                                modelNameLabel: 'AnnualBudget',
                                collection: App.Collections.annualBudgetsManagementCollection,
                                columnCollectionDefinitions: App.Vars.annualBudgetsBackgridColumnDefinitions,
                                hideCellCnt: 0
                            });
                        }
                        routeView = self.annualBudgetsManagementView;


                        break;
                    case 'reports_management':
                        if (typeof self.reportsManagementView[type] === 'undefined' || self.reportsManagementView[type] === null) {
                            App.Views.reportsManagementView.push(type);
                            App.Views.reportsManagementView[type] = new self.reportsManagementViewClass({
                                className: 'box box-primary reports-management-view',
                                viewClassName: 'reports-management-view',
                                model: App.Models.reportModel,
                                mainAppEl: self.mainApp.el,
                                mainApp: self.mainApp,
                                modelNameLabel: type.charAt(0).toUpperCase() + type.substr(1) + ' Report',
                                collection: App.Collections.reportsManagementCollection,
                                columnCollectionDefinitions: [],
                                hideCellCnt: 0,
                                reportType: type
                            });
                            self.reportsManagementView.push(type);
                            self.reportsManagementView[type]= App.Views.reportsManagementView[type];
                        }
                        routeView = self.reportsManagementView[type];

                        break;
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


(function (App) {
    /**
     * All the view logic is in the router
     */
    new App.BackboneRouter;

    let rootUrl = $('.sia-main-app').length ? $('.sia-main-app').data('rooturl') : 'http://homestead.test/admin';
    if (!rootUrl.endsWith('/')) {
        //rootUrl += '/';
    }
    let rootPath = rootUrl.replace('://', '');
    let index = rootPath.indexOf('/');
    rootPath = (index !== -1 && index + 1 < rootPath.length) ? rootPath.substr(index) : rootPath = '/';

    let getRelativeUrl = function (url, rootUrl) {
        let index = url.indexOf(rootUrl);
        return (index > -1 ? url.substr(index + rootUrl.length) : url);
    };

    if (rootUrl.match(/homestead/i)){
        App.Vars.devMode = true;
    }

    Backbone.history.start({
        pushState: false,
        root: rootPath
    });

})(window.App);

