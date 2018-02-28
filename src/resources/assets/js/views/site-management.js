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
            'click #btnDeleteSite': 'deleteSite',
            'click #btnAddProject': 'addProject',
            'click #btnDeleteCheckedProjects': 'deleteCheckedProjects'
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
                model: App.Models.siteModel
            });
            this.siteView.render();


            App.Views.siteStatusView = this.siteStatusView = new this.siteStatusViewClass({
                el: this.$('.site-status-view'),
                model: App.Models.siteStatusModel
            });
            this.siteStatusView.render();


            App.Views.projectsView = this.projectsView = new this.projectsViewClass({
                el: this.$('.projects-backgrid-wrapper'),
                parentViewEl: this.el,
                collection: App.Collections.projectCollection
            });
            this.projectsView.render();
            return this;
        },
        /**
         * ProjectID can also be an event
         * @param ProjectID
         */
        updateProjectDataViews: function (ProjectID) {
            var self = this;

            if (typeof ProjectID === 'string') {
                var currentProjectModel = self.collection.findWhere({ProjectID: parseInt(ProjectID)});
                $(self.options.mainAppEl).find('.site-projects-tabs .box-title small').html(currentProjectModel.get('ProjectDescription'))
            }
        },
        updateProjectDataTabButtons: function (e) {
            console.log('updateProjectDataTabButtons triggered')
        },
        addSite: function () {
            App.Views.mainApp.$el.trigger('clear-site-project-tab-view');

            this.projectsView.remove();
            // TODO: figure out if this needs to be a template and removed due to existing events that affect the projects backgrid
            //this.$el.find('.projects-grid-manager-container').hide();
            this.$el.find('.site-create-toolbar').show();
        },
        deleteSite: function () {
            bootbox.confirm("Do you really want to delete this site?", function (result) {
                console.log('Result: ' + result);
            });
        },
        addProject: function () {

        },
        deleteCheckedProjects: function () {
            bootbox.confirm("Do you really want to delete the checked projects?", function (result) {
                console.log('Result: ' + result);
            });
        }
    });
})(window.App);
