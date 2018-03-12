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
            let options = [
                ['Proposed', 'Proposed'],
                ['Approved', 'Approved'],
                ['Paid', 'Paid'],
                ['Rejected', 'Rejected']
            ];
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[0] + "'>" + value[1] + "</option>";
                })
            } else {
                return options;
            }
        },
        getSourceOptions: function (bReturnHtml) {
            let options = [
                ['PTO', 'PTO'],
                ['School', 'School'],
                ['School (OLC funds)', 'School (OLC funds)'],
                ['District', 'District'],
                ['Woodlands', 'Woodlands'],
                ['Grant', 'Grant'],
                ['CF Grant', 'CF Grant'],
                ['Thrivent', 'Thrivent'],
                ['Unknown', 'Unknown']
            ];
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[0] + "'>" + value[1] + "</option>";
                })
            } else {
                return options;
            }
        }
    });


})(window.App);
