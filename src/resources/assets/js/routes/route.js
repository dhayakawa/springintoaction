(function (App) {
    App.BackboneRouter = Backbone.Router.extend({
        bAllowPreRender: true,
        dashboardViewClass: App.Views.Dashboard,
        dashboardView: null,
        projectScopeManagementViewClass: App.Views.ProjectScopeManagement,
        workflowManagementViewClass: App.Views.WorkflowManagement,
        projectAttributesManagementViewClass: App.Views.ProjectAttributesManagement,
        attributesManagementViewClass: App.Views.AttributesManagement,
        optionManagementViewClass: App.Views.OptionManagement,
        siteSettingsManagementViewClass: App.Views.SiteSettingsManagement,
        siteManagementViewClass: App.Views.SiteManagement,
        projectManagementViewClass: App.Views.ProjectManagement,
        siteProjectTabsViewClass: App.Views.SiteProjectTabs,
        contactsManagementViewClass: App.Views.ContactsManagement,
        volunteersManagementViewClass: App.Views.VolunteersManagement,
        annualBudgetsManagementViewClass: App.Views.AnnualBudgetsManagement,
        reportsManagementViewClass: App.Views.ReportsManagement,
        statusRecordManagementViewClass: App.Views.StatusRecordManagement,
        managementViews: {},
        bRouteViewRendered: false,
        routeRequested: '',
        initialize: function (options) {
            let self = this;
            _.bindAll(self, 'dashboard', 'loadView', 'getShouldBuildView');
            App.Views.mainApp = new App.Views.MainApp({
                parentView: self
            });
            self.viewsToPreRender = {
                // 'site_management': ['site', 'management'],
                // 'project_management': ['project', 'management'],
                // 'project_status': ['project', 'status'],
                // 'site_contacts_management': ['site_contacts', 'management'],
                // 'volunteers_management': ['volunteers', 'management']
            };
        },
        routes: {
            '': 'dashboard',
            'view/:route/:action(/:type)': 'loadView',
            '*default': 'loadView'
        },
        preRouteViewRender: function () {
            let self = this;

            //App.Views.mainApp.$el.find('> .route-view').filter(":visible").hide();
            App.Views.mainApp.$el.find('.route-view.dashboard').hide();
            //console.trace('preRouteViewRender',{'App.Views.mainApp': App.Views.mainApp,"App.Views.mainApp.$el.find('> .route-view')": App.Views.mainApp.$el.find('> .route-view')})
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
            self.routeRequested = 'dashboard';
            growl('SIA dashboard/index route has been called');
            self.preRouteViewRender();


            if (self.getShouldBuildView(self.routeRequested)) {
                let aDashboardPanelViews = [];
                /**
                 * Put new dashboard panel below.
                 */
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
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Projects Status',
                                            'badgeCount': '',
                                            'route': 'view/project/status'
                                        })
                                    ])
                                }).render().$el.html()
                            })
                    }).render().$el.html());
                }/**/
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
                }/**/
                if (App.Vars.Auth.bCanSiteManagement) {
                    aDashboardPanelViews.push(new App.Views.DashboardPanel({
                        model:
                            new App.Models.DashboardPanel({
                                'panelBgColor': 'maroon',
                                'panelFAIconClass': 'fa-cogs',
                                'panelName': 'Settings Management',
                                'panelDescription': '',
                                'panelLinksListView': new App.Views.DashboardPanelLinksList({
                                    collection: new App.Collections.DashboardPanelLinksListItem([
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Settings',
                                            'badgeCount': '',
                                            'route': 'view/settings/management'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Budget Source Options',
                                            'badgeCount': '',
                                            'route': 'view/option/management/budget_source_options'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Budget Status Options',
                                            'badgeCount': '',
                                            'route': 'view/option/management/budget_status_options'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Project Skill Needed Options',
                                            'badgeCount': '',
                                            'route': 'view/option/management/project_skill_needed_options'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Project Status Options',
                                            'badgeCount': '',
                                            'route': 'view/option/management/project_status_options'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Site Roles',
                                            'badgeCount': '',
                                            'route': 'view/option/management/site_roles'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Project Roles',
                                            'badgeCount': '',
                                            'route': 'view/option/management/project_roles'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Volunteer Status Options',
                                            'badgeCount': '',
                                            'route': 'view/option/management/volunteer_status_options'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Send Status Options',
                                            'badgeCount': '',
                                            'route': 'view/option/management/send_status_options'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'When Will Project Be Completed Options',
                                            'badgeCount': '',
                                            'route': 'view/option/management/when_will_project_be_completed_options'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Attributes',
                                            'badgeCount': '',
                                            'route': 'view/attributes/management'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Assign Project Attributes',
                                            'badgeCount': '',
                                            'route': 'view/project_attributes/management'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Workflow',
                                            'badgeCount': '',
                                            'route': 'view/workflow/management'
                                        }),
                                    ])
                                }).render().$el.html()
                            })
                    }).render().$el.html());
                }/**/
                if (App.Vars.Auth.bCanProjectManagement) {
                    aDashboardPanelViews.push(new App.Views.DashboardPanel({
                        model:
                            new App.Models.DashboardPanel({
                                'panelBgColor': 'orange',
                                'panelFAIconClass': 'fa-university',
                                'panelName': 'Project Managers',
                                'panelDescription': '',
                                'panelLinksListView': new App.Views.DashboardPanelLinksList({
                                    collection: new App.Collections.DashboardPanelLinksListItem([
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Manage Projects',
                                            'badgeCount': '',
                                            'route': 'view/project_scope/management'
                                        }),

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
                                            'badgeCount': '',
                                            'route': 'view/reports/management/sites'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Project List w/ All Data',
                                            'badgeCount': '',
                                            'route': 'view/reports/management/projects_full'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Project List',
                                            'badgeCount': '',
                                            'route': 'view/reports/management/projects'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Budget Allocation',
                                            'badgeCount': '',
                                            'route': 'view/reports/management/budget'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Budget and Volunteer Estimates',
                                            'badgeCount': '',
                                            'route': 'view/reports/management/budget_and_volunteer'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Early Start',
                                            'badgeCount': '',
                                            'route': 'view/reports/management/early_start'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Project List - Final Completion Assessment',
                                            'badgeCount': '',
                                            'route': 'view/reports/management/projects_final_completion_assessment'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Volunteer Assignment - Alpha Order - For Packets',
                                            'badgeCount': '',
                                            'route': 'view/reports/management/volunteer_assignment_for_packets'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Volunteer Assignment - For Mailmerge - Packets',
                                            'badgeCount': '',
                                            'route': 'view/reports/management/volunteer_assignment_for_mailmerge'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Registered Volunteer Emails',
                                            'badgeCount': '',
                                            'route': 'view/reports/management/registered_volunteer_emails'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Registered Team Leader Emails',
                                            'badgeCount': '',
                                            'route': 'view/reports/management/registered_team_leader_emails'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Registered Project Manager Emails',
                                            'badgeCount': '',
                                            'route': 'view/reports/management/registered_project_manager_emails'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Volunteer Assignment',
                                            'badgeCount': '',
                                            'route': 'view/reports/management/volunteer_assignment'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Volunteers Needed',
                                            'badgeCount': '',
                                            'route': 'view/reports/management/volunteers_needed'
                                        }),
                                        new App.Models.DashboardPanelLinksListItem({
                                            'linkText': 'Scout-Liaison Estimator',
                                            'badgeCount': '',
                                            'route': 'view/reports/management/scout_liaison_estimator'
                                        }),
                                    ])
                                }).render().$el.html()
                            })
                    }).render().$el.html());
                }/**/

                self.managementViews['dashboard'] = new self.dashboardViewClass({
                    dashboardPanelViews: aDashboardPanelViews
                });

                // pre-render core management views so triggers b/w views work
                self.preRenderViews();
            }
            App.Views.mainApp.setRouteView(self.managementViews['dashboard']).render();
            self.bRouteViewRendered = true;
            self.postRouteViewRender();
        },
        preRenderViews: function () {
            let self = this;
            if (!self.bAllowPreRender) {
                return;
            }
            App.Views.mainApp.preRenderedView = true;
            _.each(_.values(self.viewsToPreRender), function (aViewRoute, idx) {
                self.loadView(aViewRoute[0], aViewRoute[1], '');
            });
            let maxAttempts = 5;
            let attempts = 0;
            let iVisible;
            do {
                App.Views.mainApp.$el.find('> .route-view').hide();
                iVisible = App.Views.mainApp.$el.find('> .route-view').filter(":visible").length;
                //console.log('preRenderViews', {attempts: attempts, iVisible: iVisible, 'route-views': App.Views.mainApp.$el.find('> .route-view')})
                attempts++;
            } while (iVisible > 0 && attempts <= maxAttempts);


            App.Views.mainApp.preRenderedView = false;
        },
        loadView: function (route, action, type) {
            let self = this;
            type = typeof type !== 'undefined' ? type : '';
            self.routeRequested = route + '_' + action;
            self.preRouteViewRender();
            if (self.bAllowPreRender && !App.Views.mainApp.preRenderedView) {
                if (self.getShouldPreRenderViews()) {
                    // save route or it will be lost after running self.preRenderViews()
                    let currentRouteRequested = self.routeRequested;
                    self.preRenderViews();
                    self.routeRequested = currentRouteRequested;
                }
            }

            if (App.Vars.devMode && !App.Views.mainApp.preRenderedView) {
                growl('SIA loadView route has been called:' + route + '_' + action);
            }


            // The backbone View to render
            let routeView = null;
            if (!App.Views.mainApp.preRenderedView) {
                window.ajaxWaiting('show', '.sia-main-app');
            }
            try {
                switch (self.routeRequested) {
                    case 'project_scope_management':
                        if (self.getShouldBuildView(self.routeRequested + '-' + type)) {
                            self.managementViews[self.routeRequested] = new self.projectScopeManagementViewClass({
                                viewName: self.routeRequested,
                                modelNameLabel: 'Project',
                                loadProject: type
                            });
                        }

                        routeView = self.managementViews[self.routeRequested];
                        break;
                        case 'settings_management':
                        if (self.getShouldBuildView(self.routeRequested)) {
                            self.managementViews[self.routeRequested] = new self.siteSettingsManagementViewClass({
                                model: App.Models.siteSettingModel,
                                viewName: self.routeRequested,
                                modelNameLabel: 'Site Settings Management',
                                collection: App.Collections.siteSettingsCollection
                            });
                        }

                        routeView = self.managementViews[self.routeRequested];
                        break;
                    case 'site_management':
                        if (self.getShouldBuildView(self.routeRequested)) {
                            self.managementViews[self.routeRequested] = new self.siteManagementViewClass({
                                viewName: self.routeRequested
                            });
                        }

                        routeView = self.managementViews[self.routeRequested];
                        break;
                    case 'project_management':
                        if (self.getShouldBuildView(self.routeRequested)) {
                            self.managementViews[self.routeRequested] = new self.projectManagementViewClass({
                                viewName: self.routeRequested

                            });
                        }

                        routeView = self.managementViews[self.routeRequested];

                        break;
                    case 'project_status':
                        if (self.getShouldBuildView(self.routeRequested)) {
                            self.managementViews[self.routeRequested] = new self.statusRecordManagementViewClass({
                                collection: App.Collections.statusManagementCollection,
                                viewName: self.routeRequested
                            });
                        }

                        routeView = self.managementViews[self.routeRequested];

                        break;
                    case 'site_contacts_management':
                        if (self.getShouldBuildView(self.routeRequested)) {
                            self.managementViews[self.routeRequested] = new self.contactsManagementViewClass({
                                className: 'route-view box box-primary contacts-management-view',
                                viewClassName: 'contacts-management-view',
                                modelNameLabel: 'Contact',
                                collection: App.PageableCollections.contactsManagementCollection,
                                columnCollectionDefinitions: App.Vars.ContactsBackgridColumnDefinitions,
                                hideCellCnt: 0,
                                viewName: self.routeRequested
                            });
                        }
                        routeView = self.managementViews[self.routeRequested];

                        break;
                    case 'volunteers_management':
                        if (self.getShouldBuildView(self.routeRequested)) {
                            self.managementViews[self.routeRequested] = new self.volunteersManagementViewClass({
                                className: 'route-view box box-primary volunteers-management-view',
                                viewClassName: 'volunteers-management-view',
                                modelNameLabel: 'Volunteer',
                                collection: App.PageableCollections.volunteersManagementCollection,
                                columnCollectionDefinitions: App.Vars.volunteersBackgridColumnDefinitions,
                                hideCellCnt: 0,
                                viewName: self.routeRequested
                            });
                        }
                        routeView = self.managementViews[self.routeRequested];

                        break;
                    case 'budget_management':
                        if (self.getShouldBuildView(self.routeRequested)) {
                            self.managementViews[self.routeRequested] = new self.annualBudgetsManagementViewClass({
                                className: 'route-view box box-primary annualbudgets-management-view',
                                viewClassName: 'annualbudgets-management-view',
                                model: App.Models.annualBudgetModel,

                                modelNameLabel: 'AnnualBudget',
                                collection: App.Collections.annualBudgetsManagementCollection,
                                columnCollectionDefinitions: App.Vars.annualBudgetsBackgridColumnDefinitions,
                                hideCellCnt: 0,
                                viewName: self.routeRequested
                            });
                        }
                        routeView = self.managementViews[self.routeRequested];


                        break;
                    case 'reports_management':
                        if (self.getShouldBuildView(self.routeRequested + '-' + type)) {
                            self.managementViews[self.routeRequested] = new self.reportsManagementViewClass({
                                className: 'route-view box box-primary reports-management-view',
                                viewClassName: 'reports-management-view',
                                model: App.Models.reportModel,

                                modelNameLabel: type.charAt(0).toUpperCase() + type.substr(1) + ' Report',
                                collection: App.Collections.reportsManagementCollection,
                                columnCollectionDefinitions: [],
                                hideCellCnt: 0,
                                reportType: type,
                                viewName: self.routeRequested
                            });

                        }
                        routeView = self.managementViews[self.routeRequested];

                        break;
                    case 'option_management':
                        if (self.getShouldBuildView(self.routeRequested + '-' + type)) {
                            let optionModel = App.Models.optionModel;
                            let optionCollection = App.Collections.optionsManagementCollection;
                            let optionIdAttribute = 'id';
                            let labelAttribute = 'option_label';
                            if (type === 'site_roles') {
                                optionModel = new App.Models.SiteRole();
                                optionCollection = App.Collections.optionsManagementSiteRoleCollection;
                                optionIdAttribute = 'SiteRoleID';
                                labelAttribute = 'Role';
                            } else if (type === 'project_roles') {
                                optionModel = new App.Models.ProjectRole();
                                optionCollection = App.Collections.optionsManagementProjectRoleCollection;
                                optionIdAttribute = 'ProjectRoleID';
                                labelAttribute = 'Role';
                            }
                            self.managementViews[self.routeRequested + '-' + type] = new self.optionManagementViewClass({
                                className: 'route-view box box-primary option-management-view option-management-view' + '-' + type,
                                model: optionModel,
                                viewName: self.routeRequested + '-' + type,
                                ajaxWaitingTargetClassSelector: '.backgrid-wrapper',
                                modelNameLabel: type.charAt(0).toUpperCase() + type.substr(1),
                                optionType: type,
                                optionIdAttribute: optionIdAttribute,
                                labelAttribute: labelAttribute,
                                collection: optionCollection,
                                columnCollectionDefinitions: [],
                            });
                        }

                        routeView = self.managementViews[self.routeRequested + '-' + type];
                        break;
                    case 'attributes_management':
                        if (self.getShouldBuildView(self.routeRequested)) {
                            self.managementViews[self.routeRequested] = new self.attributesManagementViewClass({
                                className: 'route-view box box-primary attributes-management-view',
                                model: App.Models.attributesModel,
                                viewName: self.routeRequested,
                                ajaxWaitingTargetClassSelector: '.backgrid-wrapper',
                                modelNameLabel: 'Attribute',
                                listItemType: 'attributes',
                                modelIdAttribute: App.Models.attributesModel.idAttribute,
                                labelAttribute: 'label',
                                collection: App.Collections.attributesManagementCollection,
                                columnCollectionDefinitions: [],
                            });
                        }

                        routeView = self.managementViews[self.routeRequested];
                        break;
                        case 'workflow_management':
                        if (self.getShouldBuildView(self.routeRequested)) {
                            self.managementViews[self.routeRequested] = new self.workflowManagementViewClass({
                                className: 'route-view box box-primary workflow-management-view',
                                model: App.Models.workflowModel,
                                viewName: self.routeRequested,
                                ajaxWaitingTargetClassSelector: '.backgrid-wrapper',
                                modelNameLabel: 'Workflow',
                                listItemType: 'workflow',
                                modelIdAttribute: App.Models.workflowModel.idAttribute,
                                labelAttribute: 'label',
                                collection: App.Collections.workflowManagementCollection,
                                columnCollectionDefinitions: [],
                            });
                        }

                        routeView = self.managementViews[self.routeRequested];
                        break;
                    case 'project_attributes_management':
                        if (self.getShouldBuildView(self.routeRequested)) {
                            self.managementViews[self.routeRequested] = new self.projectAttributesManagementViewClass({
                                className: 'route-view box box-primary project-attributes-management-view',
                                model: App.Models.projectAttributesModel,
                                viewName: self.routeRequested,
                                ajaxWaitingTargetClassSelector: '.backgrid-wrapper',
                                modelNameLabel: 'Project Attribute',
                                listItemType: 'project_attributes',
                                modelIdAttribute: App.Models.attributesModel.idAttribute,
                                labelAttribute: 'label',
                                collection: App.Collections.projectAttributesManagementCollection,
                                columnCollectionDefinitions: [],
                            });
                        }

                        routeView = self.managementViews[self.routeRequested];
                        break;
                    default:
                        routeView = null;
                        self.bRouteViewRendered = false;
                }
            } catch (e) {
                console.error('routeView instantiation exception for routeRequested:' + self.routeRequested, 'Exception:' + e);
                self.bRouteViewRendered = false;
            }

            if (routeView !== null) {
                //try {
                App.Views.mainApp.setRouteView(routeView).render();
                self.bRouteViewRendered = true;
                //} catch (e) {
                //console.error('App.Views.mainApp.setRouteView render exception for routeRequested:' + self.routeRequested, 'Exception:' + e);
                // self.bRouteViewRendered = false;
                //}

            }
            self.postRouteViewRender();

        },
        getShouldBuildView: function (view) {
            let self = this;
            return _.isUndefined(self.managementViews[view]) || (!_.isUndefined(self.managementViews[view]) && _.isNull(self.managementViews[view]));
        },
        getShouldPreRenderViews: function () {
            let self = this;
            return !App.Views.mainApp.$el.find('> .route-view').length;
        }
    });

})(window.App);
