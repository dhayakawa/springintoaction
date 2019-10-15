(function (App) {
    App.Views.StatusRecordManagement = App.Views.Management.fullExtend({
        attributes: {
            class: 'route-view box box-primary status-record-management-view'
        },
        template: template('statusRecordManagementTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(self, '_initialize','render', 'addOne', 'addAll');
            this._initialize(options);
            self.listenTo(self.collection, 'reset', self.addAll);
        },
        events: {},
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(self.template());
            self.addAll();

            return self;
        },
        addOne: function (StatusRecord) {
            let self = this;
            if (StatusRecord.attributes.projects.length) {
                let $settingItem = new App.Views.StatusRecord({model: StatusRecord});
                self.$el.find('.status-record-management-wrapper').append($settingItem.render().el);
            }
        },
        addAll: function () {
            let self = this;
            self.$el.find('.status-record-management-wrapper').empty();

            self.collection.each(this.addOne);
            self.$el.find('[data-toggle="tooltip"]').tooltip({html: true});
            self.$el.find('[data-popover="true"]').popover({html: true, title: ''});
        }
    });
})(window.App);
