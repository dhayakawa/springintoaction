(function (App) {
    App.Views.Contact = App.Views.ManagedGrid.fullExtend({
        viewName: 'contacts-view',
        events: {},
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self,
                    'update');
            } catch (e) {
                console.error(options, e)
            }

            // Required call for inherited class
            self._initialize(options);

            if (self.collection.length === 0) {
                self.setViewDataStoreValue('current-model-id', null);
            }

            _log('App.Views.Contact.initialize', options);
        },
        render: function (e) {
            let self = this;

            // Need to set the current model id every time the view is rendered
            self.setViewDataStoreValue('current-model-id', self.collection.length ? self.collection.at(0).get(self.model.idAttribute) : null);
            self.renderGrid(e, self.viewName);

            return self;

        },
        getModalForm: function () {
            let self = this;
            let template = window.template('new' + self.modelNameLabel + 'Template');
            let siteSelect = new App.Views.Select({
                el: '',
                attributes: {id: 'SiteID', name: 'SiteID', class: 'form-control'},
                buildHTML: true,
                collection: App.Collections.sitesDropDownCollection,
                optionValueModelAttrName: 'SiteID',
                optionLabelModelAttrName: ['SiteName']
            });
            let tplVars = {
                siteSelect: siteSelect.getHtml()
            };
            return template(tplVars);
        }
    });
})(window.App);
