(function (App) {
    App.Views.Volunteer = App.Views.ManagedGrid.fullExtend({
        viewName: 'volunteers-view',
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

            _log('App.Views.Volunteer.initialize', options);
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
                attributes: {id: 'PreferredSiteID', name: 'PreferredSiteID', class: 'form-control'},
                buildHTML: true,
                collection: App.Collections.sitesDropDownCollection,
                optionValueModelAttrName: 'SiteID',
                optionLabelModelAttrName: ['SiteName'],
                addBlankOption: true
            });
            let tplVars = {
                testString: '',
                testEmail: '',
                testDBID: 0,
                siteSelect: siteSelect.getHtml(),
                primarySkillOptions: App.Models.volunteerModel.getPrimarySkillOptions(true),
                schoolPreferenceOptions: App.Models.volunteerModel.getSchoolOptions(true),
                statusOptions: App.Models.volunteerModel.getStatusOptions(true),
                ageRangeOptions: App.Models.volunteerModel.getAgeRangeOptions(true),
                skillLevelOptions: App.Models.volunteerModel.getSkillLevelOptions(true),
                yesNoOptions: App.Models.projectModel.getYesNoOptions(true),
                sendStatusOptions: App.Models.volunteerModel.getSendOptions(true),
            };
            return template(tplVars);
        }
    });
})(window.App);
