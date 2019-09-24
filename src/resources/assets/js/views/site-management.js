(function (App) {
    App.Views.SiteManagement = App.Views.Backend.fullExtend({
        sitesViewClass: App.Views.Sites,
        siteYearsViewClass: App.Views.SiteYears,
        siteViewClass: App.Views.Site,
        siteStatusViewClass: App.Views.SiteStatus,
        siteVolunteersViewClass: App.Views.SiteVolunteer,
        attributes: {
            class: 'site-management-view route-view box box-primary'
        },
        template: template('siteManagementTemplate'),
        initialize: function (options) {
            _.bindAll(this, '_initialize','render', 'addSite', 'deleteSite');
            this._initialize(options);
        },
        events: {
            'click #btnAddSite': 'addSite',
            'click #btnDeleteSite': 'deleteSite'
        },
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template());
            if (!App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager) {
                self.$el.find('#btnAddSite').hide();
            }
            if (!App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager) {
                self.$el.find('#btnDeleteSite').hide();
            }

            this.siteVolunteersView = new this.siteVolunteersViewClass({
                el: this.$('.site-volunteers-backgrid-wrapper'),
                viewName: 'site-volunteers',
                parentView: this,
                model: App.Models.siteVolunteerRoleModel,
                modelNameLabel: 'SiteVolunteerRole',
                collection: App.PageableCollections.siteVolunteersRoleCollection,
                columnCollectionDefinitions: App.Vars.siteVolunteersBackgridColumnDefinitions,
                hideCellCnt: 0,
                currentModelIDDataStoreSelector: 'body',
                ajaxWaitingTargetClassSelector: '.site-volunteers-view',
                backgridWrapperClassSelector: '.site-volunteers-backgrid-wrapper',
                gridManagerContainerToolbarClassName: 'site-volunteers-grid-manager-container',
                mainApp: self.mainApp

            });
            this.siteYearsDropDownView = new this.siteYearsViewClass({
                el: this.$('select#site_years'),
                parentView: this,
                collection: new App.Collections.SiteYear(App.Vars.appInitialData.site_years),
                siteVolunteersView: this.siteVolunteersView
            });

            this.sitesDropDownView = new this.sitesViewClass({
                el: this.$('select#sites'),
                collection: new App.Collections.Site(App.Vars.appInitialData.sites),
                parentView: this,
                siteYearsDropDownView: this.siteYearsDropDownView
            });
            this.sitesDropDownView.render();


            this.siteYearsDropDownView.render();

            this.siteView = new this.siteViewClass({
                el: this.$('.site-view'),
                model: App.Models.siteModel,
                collection: App.Collections.sitesDropDownCollection,
                sitesDropDownView: this.sitesDropDownView
            });
            this.siteView.render();

            this.siteStatusView = new this.siteStatusViewClass({
                el: this.$('.site-status-view'),
                model: App.Models.siteStatusModel
            });
            this.siteStatusView.render();


            this.siteVolunteersView.render();

            self.childViews.push(this.sitesDropDownView);
            self.childViews.push(this.siteYearsDropDownView);
            self.childViews.push(this.siteView);
            self.childViews.push(this.siteStatusView);
            self.childViews.push(this.siteVolunteersView);

            return self;
        },
        addSite: function () {
            let self = this;
            $('#sia-modal').one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('New Site');
                modal.find('.modal-body').html(self.siteView.getModalForm());

                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    self.siteView.create($.unserialize(modal.find('form').serialize()));


                    $('#sia-modal').modal('hide');
                });

            });
            $('#sia-modal').modal('show');
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
