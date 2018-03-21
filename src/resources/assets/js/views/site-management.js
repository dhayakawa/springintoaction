(function (App) {
    App.Views.SiteManagement = Backbone.View.extend({
        sitesViewClass: App.Views.Sites,
        siteYearsViewClass: App.Views.SiteYears,
        siteViewClass: App.Views.Site,
        siteStatusViewClass: App.Views.SiteStatus,
        projectsViewClass: App.Views.Projects,
        initialize: function (options) {
            this.options = options;
            this.childViews = [];
        },
        events: {
            'click #btnAddSite': 'addSite',
            'click #btnDeleteSite': 'deleteSite'
        },
        render: function () {

            App.Views.sitesDropDownView = this.sitesDropDownView = new this.sitesViewClass({
                el: this.$('select#sites'),
                collection: App.Collections.sitesDropDownCollection
            });
            this.sitesDropDownView.render();


            App.Views.siteYearsDropDownView = this.siteYearsDropDownView = new this.siteYearsViewClass({
                el: this.$('select#site_years'),
                collection: App.Collections.siteYearsDropDownCollection
            });
            this.siteYearsDropDownView.render();


            App.Views.siteView = this.siteView = new this.siteViewClass({
                el: this.$('.site-view'),
                mainAppEl: this.el,
                model: App.Models.siteModel,
                collection: App.Collections.sitesDropDownCollection
            });
            this.siteView.render();


            App.Views.siteStatusView = this.siteStatusView = new this.siteStatusViewClass({
                el: this.$('.site-status-view'),
                model: App.Models.siteStatusModel
            });
            this.siteStatusView.render();


            App.Views.projectsView = this.projectsView = new this.projectsViewClass({
                el: this.$('.projects-backgrid-wrapper'),
                parentViewEl: this.$el,
                collection: App.PageableCollections.projectCollection,
                columnCollectionDefinitions: App.Vars.projectsBackgridColumnDefinitions,
                model: App.Models.projectModel
            });
            this.projectsView.render();
            return this;
        },
        /**
         * ProjectID can also be an event
         * @param ProjectID
         */
        updateProjectDataViews: function (ProjectID) {
            let self = this;

            if (typeof ProjectID === 'string') {
                let currentProjectModel = self.collection.findWhere({ProjectID: parseInt(ProjectID)});
                $(self.options.mainAppEl).find('.site-projects-tabs .box-title small').html(currentProjectModel.get('ProjectDescription'))
            }
        },
        updateProjectDataTabButtons: function (e) {
            console.log('updateProjectDataTabButtons triggered')
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
            bootbox.confirm("Do you really want to delete this site?", function (result) {
                App.Views.siteView.destroy();
            });
        }
    });
})(window.App);
