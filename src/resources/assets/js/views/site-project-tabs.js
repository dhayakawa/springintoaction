(function (App) {
    App.Views.ProjectTabsGridManagerContainerToolbar = Backbone.View.extend({
        template: template('projectTabsGridManagerContainerToolbarsTemplate'),
        initialize: function (options) {
            var self = this;
            _.bindAll(this, 'toggleProjectTabToolbars');
            this.options = options;
            this.tabs = $(self.options.parentViewEl).find('.nav-tabs [role="tab"]');
            this.listenTo(App.Views.siteProjectTabsView, 'cleared-child-views', function () {
                self.remove();
            });
            this.listenTo(App.Views.siteProjectTabsView, 'tab-toggled', this.toggleProjectTabToolbars);
        },
        render: function () {
            var self = this;
            self.$el.empty();
            self.tabs.each(function (idx, el) {
                var tabName = $(el).attr('aria-controls');
                var tabButtonLabel = $(el).text();
                self.$el.append(self.template({TabName: tabName, btnLabel: tabButtonLabel}));
                if (idx === 0) {
                    $('.tabButtonPane.' + tabName).show()
                }
            });

            return self;
        },
        toggleProjectTabToolbars: function (e) {
            var clickedTab = e.data;
            this.$el.find('.tabButtonPane').hide();
            this.$el.find('.' + clickedTab + '.tabButtonPane').show();
        }
    });

    App.Views.SiteProjectTabs = Backbone.View.extend({
        contactsViewClass: App.Views.Contact,
        volunteersViewClass: App.Views.Volunteer,
        projectLeadsViewClass: App.Views.ProjectLead,
        budgetViewClass: App.Views.Budget,
        initialize: function (options) {
            this.options = options;
            this.childViews = [];
            _.bindAll(this, 'render','removeChildViews','updateProjectTabViews','remove','notifyProjectTabToolbar','fetchIfNewProjectID');
            this.listenTo(this.model, "change", this.fetchIfNewProjectID);
        },
        events: {
            'shown.bs.tab a[data-toggle="tab"]': 'notifyProjectTabToolbar',
            'clear-child-views': 'removeChildViews'
        },
        render: function () {
            /**
             * Handles the buttons below the tabbed grids
             */
            App.Views.projectTabsGridManagerContainerToolbarView = this.projectTabsGridManagerContainerToolbarView = new App.Views.ProjectTabsGridManagerContainerToolbar({
                parentViewEl: this.el,
                el: '.project-tabs-grid-manager-container'
            });
            this.projectTabsGridManagerContainerToolbarView.render();
            this.childViews.push(this.projectTabsGridManagerContainerToolbarView);

            App.Views.contactsView = this.contactsView = new this.contactsViewClass({
                el: this.$('.project-contacts-backgrid-wrapper'),
                tab: 'contacts',
                mainAppEl: this.options.mainAppEl,
                parentViewEl: this.el,
                collection: App.Collections.contactsCollection
            });
            this.contactsView.render();
            this.childViews.push(this.contactsView);


            App.Views.volunteersView = this.volunteersView = new this.volunteersViewClass({
                el: this.$('.project-volunteers-backgrid-wrapper'),
                tab: 'volunteers',
                parentViewEl: this.el,
                mainAppEl: this.options.mainAppEl,
                collection: App.Collections.volunteersCollection
            });
            this.volunteersView.render();
            this.childViews.push(this.volunteersView);


            App.Views.projectLeadView = this.projectLeadView = new this.projectLeadsViewClass({
                el: this.$('.project-leads-backgrid-wrapper'),
                mainAppEl: this.options.mainAppEl,
                tab: 'project_leads',
                parentViewEl: this.el,
                collection: App.Collections.projectLeadCollection
            });
            this.projectLeadView.render();
            this.childViews.push(this.projectLeadView);


            App.Views.budgetView = this.budgetView = new this.budgetViewClass({
                el: this.$('.project-budget-backgrid-wrapper'),
                mainAppEl: this.options.mainAppEl,
                tab: 'budget',
                parentViewEl: this.el,
                collection: App.Collections.budgetCollection
            });
            this.budgetView.render();
            this.childViews.push(this.budgetView);
            console.log(this.model)
            this.$el.find('h3.box-title small').html(this.model.get('ProjectDescription'));

            return this;
        },
        /**
         * Rebuild the Project Tabs if the project has changed
         * @returns {App.Views.SiteProjectTabs}
         */
        fetchIfNewProjectID: function () {
            if(this.model.hasChanged('ProjectID')){
                console.log('fetchIfNewProjectID has changed',this.model.get('ProjectID'));
                var ProjectID = this.model.get('ProjectID');
                App.Collections.contactsCollection.url = 'project/contact/' + ProjectID;
                App.Collections.contactsCollection.fetch({reset:true});
                App.Collections.volunteersCollection.url = 'project/volunteers/' + ProjectID;
                App.Collections.volunteersCollection.fetch({reset: true});
                App.Collections.projectLeadCollection.url = 'project/lead_volunteers/' + ProjectID;
                App.Collections.projectLeadCollection.fetch({reset: true});
                App.Collections.budgetCollection.url = 'project/budget/' + ProjectID;
                App.Collections.budgetCollection.fetch({reset: true});
            } else {
                console.log('fetchIfNewProjectID has not changed', this.model.get('ProjectID'));
            }
            return this;
        },
        /**
         * ProjectID can also be an event
         * @param ProjectID
         */
        updateProjectTabViews: function (ProjectID) {
            var self = this;
            console.log('update project tabs title', ProjectID)
            if (typeof ProjectID === 'string') {
                var currentProjectModel = self.collection.findWhere({ProjectID: parseInt(ProjectID)});
                $(self.options.mainAppEl).find('.site-projects-tabs .box-title small').html(currentProjectModel.get('ProjectDescription'))
            }
        },
        removeChildViews: function () {
            //console.log('App.Views.SiteProjectTabs removeChildViews ');
            _.each(this.childViews,function (view) {
                view.remove();
            });
            this.trigger('removed-child-views');
        },
        remove: function () {
            console.log('remove stub')
            //this.$el.remove();  // 4. Calling Jquery remove function to remove that HTML li tag element..
        },
        notifyProjectTabToolbar: function (e) {
            var clickedTab = $(e.currentTarget).attr('aria-controls');
            this.trigger('tab-toggled', {data: clickedTab});
        }
    });
})(window.App);
