(function (App) {
    App.Views.SiteManagement = App.Views.Management.fullExtend({
        sitesDropdownViewClass: App.Views.SitesDropdown,
        siteYearsDropdownViewClass: App.Views.SiteYearsDropdown,
        siteViewClass: App.Views.Site,
        siteStatusViewClass: App.Views.SiteStatus,
        siteVolunteersViewClass: App.Views.SiteVolunteer,
        attributes: {
            class: 'site-management-view route-view box box-primary'
        },
        template: template('siteManagementTemplate'),
        viewName: 'site-management-view',
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'addSite', 'deleteSite');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            this._initialize(options);
        },
        events: {
            'click #btnAddSite': 'addSite',
            'click #btnDeleteSite': 'deleteSite'
        },
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(self.template());
            if (!App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager) {
                self.$el.find('#btnAddSite').hide();
            }
            if (!App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager) {
                self.$el.find('#btnDeleteSite').hide();
            }

            self.renderSiteDropdowns();

            self.siteView = new self.siteViewClass({
                el: self.$('.site-view'),
                ajaxWaitingTargetClassSelector: '#site-well',
                model: App.Models.siteModel,
                collection: App.Collections.sitesDropDownCollection,
                mainApp: self.mainApp,
                parentView: self,
                sitesDropdownView: self.sitesDropdownView,
                viewName: 'site-view'
            });
            self.siteView.render();

            self.siteStatusView = new self.siteStatusViewClass({
                el: self.$('.site-status-view'),
                ajaxWaitingTargetClassSelector: '#site-well',
                model: App.Models.siteStatusModel,
                mainApp: self.mainApp,
                parentView: self,
                viewName: 'site-status-view'
            });
            self.siteStatusView.render();

            self.siteVolunteersView = new self.siteVolunteersViewClass({
                ajaxWaitingTargetClassSelector: '.site-volunteers-view',
                backgridWrapperClassSelector: '.site-volunteers-backgrid-wrapper',
                collection: App.PageableCollections.siteVolunteersRoleCollection,
                columnCollectionDefinitions: App.Vars.siteVolunteersBackgridColumnDefinitions,
                currentModelIDDataStoreSelector: 'body',
                el: self.$('.site-volunteers-backgrid-wrapper'),
                gridManagerContainerToolbarClassName: 'site-volunteers-grid-manager-container',
                mainApp: self.mainApp,
                model: App.Models.siteVolunteerRoleModel,
                modelNameLabel: 'Site Volunteers',
                parentView: self,
                hideCellCnt: 0
            });
            self.siteVolunteerGridManagerContainerToolbar = new App.Views.SiteVolunteerGridManagerContainerToolbar({
                el: self.$('.site-volunteers-grid-manager-container'),
                parentView: self,
                mainApp: self.mainApp,
                managedGridView: self.siteVolunteersView,
                viewName: 'site-volunteers-grid-manager-toolbar'
            });
            self.siteVolunteerGridManagerContainerToolbar.render();

            self.siteVolunteersView.render();
            self.siteVolunteersView.setGridManagerContainerToolbar(self.siteVolunteerGridManagerContainerToolbar);

            self.childViews.push(self.sitesDropdownView);
            self.childViews.push(self.siteYearsDropdownView);
            self.childViews.push(self.siteView);
            self.childViews.push(self.siteStatusView);
            self.childViews.push(self.siteVolunteerGridManagerContainerToolbar);
            self.childViews.push(self.siteVolunteersView);

            return self;
        },
        addSite: function () {
            let self = this;
            self.getModalElement().one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('New Site');
                modal.find('.modal-body').html(self.siteView.getModalForm());

                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    self.siteView.create($.unserialize(modal.find('form').serialize()));


                    self.getModalElement().modal('hide');
                });

            });
            self.getModalElement().modal('show');
        },
        deleteSite: function () {
            let self = this;
            bootbox.confirm("Do you really want to delete the "+ App.Models.siteModel.get('SiteName') +" site and all of its projects?", function (bConfirmed) {
                if (bConfirmed) {
                    self.siteView.destroy();
                }
            });
        }
    });
})(window.App);
