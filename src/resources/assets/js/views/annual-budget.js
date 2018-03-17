(function (App) {
    App.Views.AnnualBudgetView = Backbone.View.extend({
        template: template('annualBudgetTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'render', 'update');
            this.options = options;
            this.model.on('change', this.render, this);
            _log(this.viewName + '.initialize', options, this);
        },
        events: {
            'click .btnUpdate': 'update'
        },
        render: function () {
            let self = this;
            this.$el.html(this.template({
                annualBudgetID: this.model.get('AnnualBudgetID'),
                budgetAmount: this.model.get('BudgetAmount'),
                year: this.model.get('Year')
            }));
            return this;
        },
        update: function (e) {
            e.preventDefault();
            let attrName = 'BudgetAmount';
            let attrValue = this.$el.find('[name="BudgetAmount"]').val();
            this.model.url = '/admin/annualbudget/' + this.model.get(this.model.idAttribute);
            this.model.save({[attrName]: attrValue},
                {
                    success: function (model, response, options) {
                        growl(response.msg, response.success ? 'success' : 'error');
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'error')
                    }
                });
        }
    });
})(window.App);
