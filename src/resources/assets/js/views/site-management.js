(function (App) {
    App.Views.SiteManagement = Backbone.View.extend({
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
            this.options = options;
            this.childViews = [];
            this.mainApp = this.options.mainApp;
            _.bindAll(this, 'render', 'addSite', 'deleteSite');
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
            App.Views.sitesDropDownView = this.sitesDropDownView = new this.sitesViewClass({
                el: this.$('select#sites'),
                collection: App.Collections.sitesDropDownCollection
            });
            this.sitesDropDownView.render();

            App.Views.siteYearsDropDownView = this.siteYearsDropDownView = new this.siteYearsViewClass({
                el: this.$('select#site_years'),
                parentView: this,
                collection: App.Collections.siteYearsDropDownCollection
            });
            this.siteYearsDropDownView.render();

            App.Views.siteView = this.siteView = new this.siteViewClass({
                el: this.$('.site-view'),
                model: App.Models.siteModel,
                collection: App.Collections.sitesDropDownCollection
            });
            this.siteView.render();

            App.Views.siteStatusView = this.siteStatusView = new this.siteStatusViewClass({
                el: this.$('.site-status-view'),
                model: App.Models.siteStatusModel
            });
            this.siteStatusView.render();

            App.Views.siteVolunteersView = this.siteVolunteersView = new this.siteVolunteersViewClass({
                el: this.$('.site-volunteers-backgrid-wrapper'),
                parentView: this,
                model: App.Models.siteVolunteerModel,
                modelNameLabel: 'SiteVolunteer',
                collection: App.PageableCollections.siteVolunteersCollection,
                columnCollectionDefinitions: App.Vars.siteVolunteersBackgridColumnDefinitions,
                hideCellCnt: 0//2
            });
            this.siteVolunteersView.render();

            return this;
        },
        addSite: function () {
            $('#sia-modal').one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('New Site');
                modal.find('.modal-body').html(App.Views.siteView.getModalForm());

                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    App.Views.siteView.create($.unserialize(modal.find('form').serialize()));


                    $('#sia-modal').modal('hide');
                });

            });
            $('#sia-modal').modal('show');
        },
        deleteSite: function () {
            bootbox.confirm("Do you really want to delete the "+ App.Models.siteModel.get('SiteName') +" site and all of its projects?", function (bConfirmed) {
                if (bConfirmed) {
                    App.Views.siteView.destroy();
                }
            });
        }
    });
})(window.App);
