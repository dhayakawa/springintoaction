(function (App) {
    App.Views.AnnualBudgetView = App.Views.Backend.fullExtend({
        template: template('annualBudgetTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(this, 'render', 'update');
            this.options = options;
            self.model.on('change', this.render, this);
            _log(this.viewName + '.initialize', options, this);
        },
        events: {
            'click .btnUpdate': 'update'
        },
        render: function () {
            let self = this;
            this.$el.html(this.template({
                annualBudgetID: self.model.get('AnnualBudgetID'),
                budgetAmount: self.model.get('BudgetAmount'),
                year: self.model.get('Year')
            }));
            return this;
        },
        update: function (e) {
            var self = this;
            e.preventDefault();
            let attrName = 'BudgetAmount';
            let attrValue = this.$el.find('[name="BudgetAmount"]').val();
            self.model.url = self.getModelUrl(self.model.get(self.model.idAttribute));
            self.model.save({[attrName]: attrValue},
                {
                    success: function (model, response, options) {
                        growl(response.msg, response.success ? 'success' : 'error');
                        self.trigger('updated');
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'error')
                    }
                });
        }
    });
})(window.App);
