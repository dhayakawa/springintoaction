(function (App) {
    App.Views.ProjectsDropDownOption = Backbone.View.extend({
        tagName: 'option',
        initialize: function (options) {
            _.bindAll(this, 'render');
        },
        render: function () {
            $(this.el).attr('value', this.model.get('ProjectID'))
                .html(this.model.get('Year'));
            return this;
        }
    });
    App.Views.ProjectsDropDown = Backbone.View.extend({
        initialize: function (options) {
            this.options     = options;
            this.optionsView = [];
            this.parentView  = this.options.parentView;
            _.bindAll(this, 'addOne', 'addAll', 'changeSelected');
            this.collection.bind('reset', this.addAll, this);
        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (projectDropDown) {
            let option = new App.Views.ProjectsDropDownOption({model: projectDropDown});
            this.optionsView.push(option);
            $(this.el).append(option.render().el);
        },
        addAll: function () {
            _.each(this.optionsView, function (option) {
                option.remove();
            });
            this.collection.each(this.addOne);
            this.$el.trigger('change');
        },
        render: function () {
            this.addAll();
            return this;
        },
        changeSelected: function () {
            let $option = $(this.el).find(':selected');

            this.setSelectedId($option.val());
        },
        setSelectedId: function (Year, SiteID, ProjectID) {
            let self = this;
            if (App.Vars.mainAppDoneLoading) {
                _log('App.Views.ProjectsDropDown.setSelectedId.event', 'new project selected', ProjectID);
                // fetch new report
                App.Models.siteStatusModel.url = '/admin/report/project/' + Year + '/' + SiteID + '/' + ProjectID;
                App.Models.siteStatusModel.fetch({reset: true});


                if (!self.parentView.$el.hasClass('site-management-view')) {
                    self.trigger('site-status-id-change', {SiteStatusID: SiteStatusID});
                }
            }
        }
    });

    App.Views.ReportsManagement = Backbone.View.extend({
        sitesViewClass: App.Views.Sites,
        siteYearsViewClass: App.Views.SiteYears,
        projectsDropDownViewClass: App.Views.ProjectsDropDown,
        template: template('reportManagementTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.options                              = options;
            this.viewClassName                        = this.options.viewClassName;
            this.modelNameLabel                       = this.options.modelNameLabel;
            this.modelNameLabelLowerCase              = this.modelNameLabel.toLowerCase();
            this.viewName                             = 'App.Views.ReportsManagement';
            this.localStorageKey                      = this.modelNameLabel;
            this.backgridWrapperClassSelector         = '.backgrid-wrapper';
            this.ajaxWaitingSelector                  = '.' + this.viewClassName + ' ' + this.backgridWrapperClassSelector;
            _log(this.viewName + '.initialize', options, this);
        },
        events: {

        },
        render: function () {
            let self = this;
            this.$el.html(this.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
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

            App.Views.projectsDropDownView = this.projectsDropDownView = new this.projectsDropDownViewClass({
                el: this.$('select#projects'),
                collection: App.Collections.projectsDropDownCollection
            });
            this.projectsDropDownView.render();
            //
            // if (this.collection && this.collection.length) {
            //     this.model = this.collection.at(0);
            // }
            //
            // if (this.collection && this.collection.length) {
            //     this.$el.data('current-model-id', this.model.get(this.model.idAttribute));
            // }

            window.ajaxWaiting('remove', self.ajaxWaitingSelector);

            return this;
        },
    });


})(window.App);
