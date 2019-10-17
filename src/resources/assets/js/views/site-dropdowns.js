(function (App) {
    // This is the sites drop down
    App.Views.SiteOption = App.Views.Backend.extend({
        viewName: 'sites-dropdown-option',
        tagName: 'option',
        initialize: function (options) {
            let self = this;
            _.bindAll(self, 'render');
            self._initialize(options);
        },
        render: function () {
            let self = this;
            self.$el.attr('value',
                self.model.get(self.model.idAttribute)).html(self.model.get('SiteName'));
            return self;
        }
    });
    App.Views.SitesDropdown = App.Views.Backend.extend({
        viewName: 'sites-dropdown',
        initialize: function (options) {
            let self = this;

            _.bindAll(self, 'addOne', 'addAll', 'render', 'changeSelected', 'setSelectedId');
            self._initialize(options);
            self.listenTo(self.collection, "reset", self.addAll);

            self.parentView = self.options.parentView;

        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (site) {
            let self = this;
            self.$el.append(
                new App.Views.SiteOption({
                    model: site,
                                    }).render().el);
        },
        addAll: function () {
            let self = this;
            _log('App.Views.SitesDropdown.addAll', 'sites dropdown');
            self.$el.empty();
            self.collection.each(self.addOne);
            // Force related views to updatesite-volunteers-grid-manager-toolbar
            //console.log({'this.options.selectedSiteID': this.options.selectedSiteID})
            if (!_.isUndefined(self.options.selectedSiteID) && !_.isNull(self.options.selectedSiteID)) {
                self.$el.val(self.options.selectedSiteID);
                self.options.selectedSiteID = null;
            }
            self.changeSelected();
        },
        render: function () {
            let self = this;
            self.addAll();

            return self;
        },
        changeSelected: function () {
            let self = this;
            self.setSelectedId(self.$el.val());
        },
        setSelectedId: function (SiteID) {
            let self = this;

            // fetch new site model
            self.model.url = self.getModelUrl(SiteID);

            $.when(
                self.model.fetch({reset: true})
            ).then(function () {
                _log('App.Views.SitesDropdown.setSelectedId.event', 'new site selected', SiteID, 'parentView', self.parentView);
                self.trigger('site-id-change', {SiteID: SiteID});
            });
        }
    });
    App.Views.SiteYearsOption = App.Views.Backend.extend({
        viewName: 'site-years-dropdown-option',
        tagName: 'option',
        initialize: function (options) {
            let self = this;
            _.bindAll(self, 'render');
            self._initialize(options);
        },
        render: function () {
            let self = this;
            self.$el.attr('value', self.model.get('Year'))
                .attr('data-siteid', self.model.get('SiteID'))
                .attr('data-sitestatusid', self.model.get('SiteStatusID'))
                .html(self.model.get('Year'));
            return self;
        }
    });
    App.Views.SiteYearsDropdown = App.Views.Backend.extend({
        viewName: 'site-years-dropdown',
        initialize: function (options) {
            let self = this;

            _.bindAll(self, 'render', 'addOne', 'addAll', 'changeSelected', 'setSelectedId');
            self._initialize(options);
            self.optionsView = [];
            self.parentView = self.options.parentView;
            self.sitesDropdownView = self.options.sitesDropdownView;
            self.listenTo(self.sitesDropdownView, "site-id-change", self.updateCollectionBySite);
            self.listenTo(self.collection, "reset", self.addAll);

        },
        events: {
            "change": "changeSelected"
        },
        updateCollectionBySite: function(e) {
            let self = this;
            let SiteID = e[self.sitesDropdownView.model.idAttribute];
            self.collection.url = self.getCollectionUrl(SiteID);
            self.collection.fetch({reset: true});
        },
        addOne: function (site) {
            let self = this;
            let option = new App.Views.SiteYearsOption({
                model: site,
                            });
            this.optionsView.push(option);
            self.$el.append(option.render().el);
        },
        addAll: function () {
            let self = this;
            _.each(self.optionsView, function (option) {
                option.remove();
            });
            self.collection.each(self.addOne);
            //console.log({'this.options.selectedSiteStatusID': self.options.selectedSiteStatusID})
            if (!_.isUndefined(self.options.selectedSiteStatusID) && !_.isNull(self.options.selectedSiteStatusID)) {
                let $option = self.$el.find('[data-sitestatusid="' + self.options.selectedSiteStatusID + '"]');
                //console.log({selectedSiteStatusID: self.options.selectedSiteStatusID, 'el': self.$el, option: $option})
                if ($option.length) {
                    $option[0].selected = true;
                    self.options.selectedSiteStatusID = null;
                }
            }
            self.$el.trigger('change');
        },
        render: function () {
            let self = this;
            self.addAll();
            return self;
        },
        changeSelected: function () {
            let self = this;
            let $option = self.$el.find(':selected');

            self.setSelectedId($option.data('siteid'), $option.data('sitestatusid'), $option.val());
        },
        setSelectedId: function (SiteID, SiteStatusID, Year) {
            let self = this;

            self.model.url = self.getModelUrl(SiteStatusID);

            $.when(
                self.model.fetch({reset: true})
            ).then(function () {
                _log('App.Views.SiteYearsDropdown.setSelectedId.event', 'new year selected', SiteID, SiteStatusID, Year, 'parentView', self.parentView);
                self.trigger('site-status-id-change', {SiteID: SiteID, SiteStatusID: SiteStatusID, Year: Year});
            });
        },

    });
})(window.App);
