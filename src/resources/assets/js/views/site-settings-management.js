(function (App) {
    App.Views.SiteSetting = App.Views.Backend.fullExtend({
        tagName: 'li',
        template: template('siteSettingTemplate'),
        viewName: 'site-setting-view',
        initialize: function (options) {
            let self = this;
            _.bindAll(this, '_initialize','render');
            this._initialize(options);

        },
        events: {
            'click button': 'update',
            'change .form-control': 'enableSave',
            'change [name="value"]': 'enableSave'
        },
        render: function () {
            let self = this;
            let settingLabel = _.map(self.model.get('setting').replace(/_/g, ' ').split(' '), function (word) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }).join(' ');
            let $setting = self.template({
                'SiteSettingID': self.model.get('SiteSettingID'),
                'settingLabel': settingLabel,
                'setting': self.model.get('setting'),
                'input_type': self.model.get('input_type'),
                'value': self.model.get('value'),
                'description': self.model.get('description'),
                'message': self.model.get('message'),
                'sunrise': self.model.get('sunrise'),
                'sunset': self.model.get('sunset')
            });
            $(self.el).append($setting);
            let autoUpdateInput = self.model.get('sunrise') !== '';
            //Date range picker with time picker
            self.$el.find('[name="sunrise_sunset"]').daterangepicker({
                timePicker: true,
                timePicker24Hour: true,
                timePickerIncrement: 30,
                autoUpdateInput: autoUpdateInput,
                startDate: self.model.get('sunrise'),
                endDate: self.model.get('sunset'),
                locale:{
                    format: 'YYYY-MM-DD HH:mm:ss',
                    cancelLabel: 'Clear',
                }
            });

            //2019-01-27 00:00:53
            self.$el.find('[name="sunrise_sunset"]').on('apply.daterangepicker', function (ev, picker) {
                $(this).val(picker.startDate.format('YYYY-MM-DD HH:mm:ss') + ' - ' + picker.endDate.format('YYYY-MM-DD HH:mm:ss'));
                self.$el.find('[name="sunrise"]').val(picker.startDate.format('YYYY-MM-DD HH:mm:ss')).trigger('change');
                self.$el.find('[name="sunset"]').val(picker.endDate.format('YYYY-MM-DD HH:mm:ss')).trigger('change');

            });

            self.$el.find('[name="sunrise_sunset"]').on('cancel.daterangepicker', function (ev, picker) {
                $(this).val('');
                self.$el.find('[name="sunrise"]').val('').trigger('change');
                self.$el.find('[name="sunset"]').val('').trigger('change');
            });
            return this;
        },
        enableSave: function () {
            let self = this;
            self.$el.find('button').removeClass('disabled');
        },
        disableSave: function () {
            let self = this;
            self.$el.find('button').addClass('disabled');
        },
        update: function (e) {
            e.preventDefault();
            let self = this;

            if ($(e.target).hasClass('disabled')) {
                return;
            }
            let formData = $.unserialize(self.$el.find('form').serialize());

            let currentModelID = formData[self.model.idAttribute];

            let attributes = _.extend({[self.model.idAttribute]: currentModelID}, formData);
            if (attributes['SiteSettingID'] === '') {
                attributes['SiteSettingID'] = currentModelID;
            }
            _log('App.Views.SiteSetting.update', self.options.tab, e.changed, attributes, self.model);
            self.model.url = self.getModelUrl(currentModelID);
            window.ajaxWaiting('show', 'form[name="SiteSetting' + currentModelID + '"]');
            self.model.save(attributes,
                {
                    success: function (model, response, options) {
                        _log('App.Views.SiteSetting.update', self.options.tab + ' save', model, response, options);
                        growl(response.msg, response.success ? 'success' : 'error');
                        self.disableSave();
                        window.ajaxWaiting('remove', 'form[name="SiteSetting' + currentModelID + '"]');
                    },
                    error: function (model, response, options) {
                        console.error('App.Views.SiteSetting.update', self.options.tab + ' save', model, response, options);
                        growl(response.msg, 'error');
                        self.disableSave();
                        window.ajaxWaiting('remove', 'form[name="SiteSetting' + currentModelID + '"]');
                    }
                });
        },
    });

    App.Views.SiteSettingsManagement = App.Views.Backend.fullExtend({
        attributes: {
            class: 'site-settings-management-view route-view box box-primary'
        },
        template: template('siteSettingsManagementTemplate'),
        viewName: 'site-settings-management-view',
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'addOne', 'addAll', 'render');
            } catch (e) {
                console.error(options, e);
            }

            this._initialize(options);
            self.itemsView = [];
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase().replace(' ', '_');

            self.listenTo(self.collection, "reset", self.addAll);
        },
        events: {},
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(self.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            self.addAll();
            return self;
        },
        addOne: function (SiteSetting) {
            let self = this;
            let $settingItem = new App.Views.SiteSetting({
                model: SiteSetting,
                mainApp: self.mainApp
            });
            self.itemsView.push($settingItem);
            self.$el.find('ul').append($settingItem.render().el);
        },
        addAll: function () {
            let self = this;
            self.$el.find('.site-settings-management-wrapper').empty();
            self.$el.find('.site-settings-management-wrapper').append($('<ul class="nav nav-stacked"></ul>'));
            self.collection.each(self.addOne);
        }
    });
})(window.App);
