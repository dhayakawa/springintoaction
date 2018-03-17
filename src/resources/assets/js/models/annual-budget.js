(function (App) {
    App.Models.AnnualBudget = Backbone.Model.extend({
        idAttribute: "AnnualBudgetID",
        url: '/admin/annualbudget',
        defaults: {
            'BudgetAmount': 0.00,
            'Year': ''
        },
    });
})(window.App);
