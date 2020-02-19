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
        getStatusOptions: function (bReturnHtml, defaultOption) {
            let options = _.pairs(App.Vars.selectOptions['BudgetStatusOptions']);
            if (bReturnHtml) {
                //options.shift();
                return _.map(options, function (value, key) {
                    let bMatches = false;
                    if (!_.isUndefined(defaultOption)) {
                        if (!_.isNull(defaultOption) && (_.isNumber(defaultOption) || defaultOption.toString().match(/^[\d]+$/))) {
                            bMatches = parseInt(defaultOption) === parseInt(value[1]);
                        } else {
                            bMatches = defaultOption === value[0];
                        }
                    }
                    let selected = !_.isUndefined(defaultOption) && bMatches ? 'selected' : '';
                    return "<option " + selected + " value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        },
        getSourceOptions: function (bReturnHtml, defaultOption) {
            let options = _.pairs(App.Vars.selectOptions['BudgetSourceOptions']);
            if (bReturnHtml) {
                //options.shift();
                return _.map(options, function (value, key) {
                    let bMatches = false;
                    if (!_.isUndefined(defaultOption)) {
                        if (!_.isNull(defaultOption) && (_.isNumber(defaultOption) || defaultOption.toString().match(/^[\d]+$/))) {
                            bMatches = parseInt(defaultOption) === parseInt(value[1]);
                        } else {
                            bMatches = defaultOption === value[0];
                        }
                    }
                    let selected = !_.isUndefined(defaultOption) && bMatches ? 'selected' : '';
                    return "<option " + selected + " value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        }
    });


})(window.App);
