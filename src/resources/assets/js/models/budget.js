(function (App) {
    App.Models.Budget = Backbone.Model.extend({
        idAttribute: "BudgetID",
        url: '/admin/project_budget',
        defaults: {
            'ProjectID': '',
            'BudgetSource': '',
            'BudgetAmount': '',
            'Status': '',
            'Comments': ''
        },
        getStatusOptions: function (bReturnHtml) {
            let options = _.pairs(App.Vars.selectOptions['BudgetStatusOptions']);
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                })
            } else {
                return options;
            }
        },
        getSourceOptions: function (bReturnHtml) {
            let options = _.pairs(App.Vars.selectOptions['BudgetSourceOptions']);
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                })
            } else {
                return options;
            }
        }
    });


})(window.App);
