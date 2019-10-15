(function (App) {
    App.Views.ProjectsDropDownOption = App.Views.Backend.fullExtend({
        tagName: 'option',
        initialize: function (options) {
            _.bindAll(this, 'render');
        },
        render: function () {
            let self = this;
            this.$el.attr('value', self.model.get('ProjectID'))
                .html(self.model.get('SequenceNumber'));
            return this;
        }
    });
    App.Views.ProjectsDropDown = App.Views.Backend.fullExtend({
        initialize: function (options) {
            let self = this;
            this.options = options;
            this.optionsView = [];
            this.parentView = this.options.parentView;
            _.bindAll(this, 'addOne', 'addAll', 'changeSelected');
            self.listenTo(self.collection, "reset", self.addAll);
        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (projectDropDown) {
            let option = new App.Views.ProjectsDropDownOption({model: projectDropDown});
            this.optionsView.push(option);
            this.$el.append(option.render().el);
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
            let $option = this.$el.find(':selected');
            if (!$option.length) {
                $option = this.$el.find(':first-child');
            }
            this.setSelectedId(this.parentView.$('select#site_years option').filter(':selected').text(), this.parentView.$('select#sites').val(), $option.val());
        },
        setSelectedId: function (Year, SiteID, ProjectID) {
            let self = this;
            if (App.Vars.mainAppDoneLoading) {
                _log('App.Views.ProjectsDropDown.setSelectedId.event', 'new project selected', ProjectID);
                self.parentView.setIFrame(Year, SiteID, ProjectID);
            }
        }
    });

    App.Views.ReportsManagement = App.Views.Backend.fullExtend({
        sitesDropdownViewClass: App.Views.SitesDropdown,
        siteYearsDropdownViewClass: App.Views.SiteYearsDropdown,
        projectsDropDownViewClass: App.Views.ProjectsDropDown,
        template: template('reportManagementTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'render','handleSiteStatusIDChange');
            let self = this;
            this.options = options;
            this.viewClassName = this.options.viewClassName;
            self.modelNameLabel = this.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase().replace(' ','_');
            this.viewName = 'App.Views.ReportsManagement';
            this.localStorageKey = self.modelNameLabel;
            this.backgridWrapperClassSelector = '.backgrid-wrapper';
            this.ajaxWaitingSelector = '.' + this.viewClassName + ' ' + this.backgridWrapperClassSelector;
            this.reportType = this.options.reportType;

            _log(this.viewName + '.initialize', options, this);
        },
        events: {},
        render: function () {
            let self = this;
            this.$el.html(this.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            this.sitesDropdownView = new this.sitesDropdownViewClass({
                el: this.$('select#sites'),
                parentView: this,
                collection: App.Collections.sitesDropDownCollection
            });
            this.sitesDropdownView.render();


            this.siteYearsDropdownView = new this.siteYearsDropdownViewClass({
                el: this.$('select#site_years'),
                parentView: this,
                collection: App.Collections.siteYearsDropDownCollection
            });
            this.siteYearsDropdownView.render();

            this.projectsDropDownView = new this.projectsDropDownViewClass({
                el: this.$('select#projects'),
                parentView: this,
                collection: App.Collections.projectsDropDownCollection
            });
            this.projectsDropDownView.render();

            this.listenTo(this.siteYearsDropdownView, 'site-status-id-change', function (e) {
                self.handleSiteStatusIDChange(e);
            });
            this.listenTo(this.sitesDropdownView, 'site-id-change', function (e) {
                self.handleSiteStatusIDChange(e);
            });

            if (this.reportType !== 'projects') {
                this.$('.project-dropdown').hide();
            } else {
                this.$('.project-dropdown').show();
            }

            if (this.reportType === 'sites') {
                this.$('.site-management-selects').hide();
            }
            this.$('.site-management-selects').hide();
            this.$('.project-dropdown').hide();
            this.handleSiteStatusIDChange();
            window.ajaxWaiting('remove', self.ajaxWaitingSelector);

            return this;
        },
        handleSiteStatusIDChange: function (e) {
            let self = this;
            if (this.reportType !== 'projects') {
                self.setIFrame(this.$('select#site_years option').filter(':selected').text(), this.$('select#sites').val(), this.$('select#projects').val());
            } else {
                self.setIFrame(this.$('select#site_years option').filter(':selected').text(), this.$('select#sites').val());
            }
        },
        setIFrame: function (Year, SiteID, ProjectID) {
            let self = this;
            switch (self.reportType) {
                case 'sites':
                    App.Models.reportModel.url = '/admin/report/'+ self.reportType+'/' + Year + '/' + SiteID + '/' + ProjectID;
                    break;
                case 'projects':
                    App.Models.reportModel.url = '/admin/report/'+ self.reportType+'/' + Year + '/' + SiteID + '/' + ProjectID;
                    break;
                    case 'early_start_projects':
                    App.Models.reportModel.url = '/admin/report/'+ self.reportType+'/' + Year + '/' + SiteID + '/' + ProjectID;
                    break;
                case 'volunteers':
                    App.Models.reportModel.url = '/admin/report/'+ self.reportType+'/' + Year + '/' + SiteID + '/' + ProjectID;
                    break;
                default:
                    App.Models.reportModel.url = '/admin/report/'+ self.reportType+'/' + Year + '/' + SiteID + '/' + ProjectID;
            }
            self.$('.download-pdf').attr('href', App.Models.reportModel.url + '/pdf');
            self.$('.download-csv').attr('href', App.Models.reportModel.url + '/csv');
            self.$('.download-spreadsheet').attr('href', App.Models.reportModel.url + '/spreadsheet');
            // fetch new report
            $.ajax({
                type: "get",
                dataType: "html",
                url: App.Models.reportModel.url,
                success: function (response) {
                    self.$('.report-wrapper').html(response)
                },
                fail: function (response) {
                    console.error(response)
                }
            })

        }
    });


})(window.App);
