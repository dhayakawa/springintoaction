(function (App) {
    App.Views.StatusManagementRecord = Backbone.View.extend({
        tagName: 'div',
        attributes: {
            class: 'row'
        },
        template: template('statusManagementRecordTemplate'),
        initialize: function (options) {
            let self = this;
            this.options = options;

            _.bindAll(this, 'render');
        },
        events: {
            'click button': 'update',
            'change .form-control': 'enableSave',
            'change [name="value"]': 'enableSave',
        },
        render: function () {
            let self = this;
            //console.log(self.model.attributes)
            let $statusManagementRecord = self.template({model:self.model.attributes});
            $(self.el).append($statusManagementRecord);

            return this;
        },
        enableSave: function () {
            let self = this;
            //self.$el.find('button').removeClass('disabled');
        },
        disableSave: function () {
            let self = this;
            //self.$el.find('button').addClass('disabled');
        },
        update: function (e) {
            e.preventDefault();
            let self = this;

            /*if ($(e.target).hasClass('disabled')) {
                return;
            }
            let formData = $.unserialize(self.$el.find('form').serialize());

            let currentModelID = formData[self.model.idAttribute];

            let attributes = _.extend({[self.model.idAttribute]: currentModelID}, formData);
            if (attributes['SiteSettingID'] === '') {
                attributes['SiteSettingID'] = currentModelID;
            }
            _log('App.Views.SiteSetting.update', self.options.tab, e.changed, attributes, this.model);
            this.model.url = '/admin/site_setting/' + currentModelID;
            window.ajaxWaiting('show', 'form[name="SiteSetting' + currentModelID + '"]');
            this.model.save(attributes,
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
                });*/
        },
    });

    App.Views.StatusManagement = Backbone.View.extend({
        attributes: {
            class: 'status-management-view route-view box box-primary'
        },
        template: template('statusManagementTemplate'),
        initialize: function (options) {
            let self = this;
            this.options = options;

            _.bindAll(this, 'render','addOne','addAll');
            this.collection.bind('reset', this.addAll, this);
        },
        events: {},
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template());
            this.addAll();
            self.$el.find('[data-toggle="tooltip"]').tooltip();
            return this;
        },
        addOne: function (StatusManagement) {
            if (StatusManagement.attributes.projects.length) {
                let $settingItem = new App.Views.StatusManagementRecord({model: StatusManagement});
                this.$el.find('.status-management-wrapper').append($settingItem.render().el);
            }
        },
        addAll: function () {
            this.$el.find('.status-management-wrapper').empty();
            //this.$el.find('.status-management-wrapper').append($('<ul class="nav nav-stacked"></ul>'));
            this.collection.each(this.addOne);
        }
    });
})(window.App);
