(function (App) {
    App.Models.Budget = Backbone.Model.extend({
        url: 'budget',
        defaults: {
            'BudgetID': '',
            'ProjectID': '',
            'BudgetSource': '',
            'BudgetAmount': '',
            'Status': '',
            'Comments': '',
            'created_at': '',
            'updated_at': ''
        }
    });


})(window.App);
