(function (App) {
    App.Collections.AnnualBudget = Backbone.Collection.extend({
        url: '/admin/annualbudget/list/all',
        model: App.Models.Budget
    });

    App.PageableCollections.ProjectBudget = Backbone.PageableCollection.extend({
        url: '/admin/project_budget/list/all',
        model: App.Models.Budget,
        state: {
            pageSize: 5000
        },
        mode: "client" // page entirely on the client side
    });
    let BudgetStatusCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple: false
        },
        optionValues: [{
            values: App.Models.projectBudgetModel.getStatusOptions(false)
        }]

    });
    App.Vars.BudgetsBackgridColumnDefinitions = [
        {
            // name is a required parameter, but you don't really want one on a select all column
            name: "",
            label: "",
            // Backgrid.Extension.SelectRowCell lets you select individual rows
            cell: "select-row",
            // Backgrid.Extension.SelectAllHeaderCell lets you select all the row on a page
            headerCell: "select-all",
            resizeable: false,
            orderable: false,
            width: "30"
        },
        {
            name: "BudgetID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="BudgetID" value="' + rawValue + '" />';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30"
        },
        {
            name: "BudgetSource",
            label: "BudgetSource",
            cell: App.Vars.budgetSourceCell,
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "175"
        },
        {
            name: "BudgetAmount",
            label: "BudgetAmount",
            cell: "number",
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "60"
        },
        {
            name: "Status",
            label: "Status",
            cell: BudgetStatusCell,
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150"
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "*"
        }
    ];
    let projectOptions = function () {
        let options = [];
        _.each(App.Vars.appInitialData['all_projects'], function (model) {
            options.push([model['ProjectDescription'], model['ProjectID']]);
        });

        return options;
    };
    let ProjectsCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple: false
        },
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : _.map(formattedValue, function (v) {
                    return parseInt(v);
                })
            }
        }),
        _optionValues: projectOptions(),
        updateInterval: 5000,
        fetching: false,
        optionValues: [{
            values: function () {
                let self = this;

                // Updates the option values in the background periodically to maintain freshness
                setInterval(function () {
                    self.fetching = true;

                    $.get("/admin/project/year/all").done(function (data) {
                        self._optionValues = [];
                        _.each(data, function (model) {
                            self._optionValues.push([model['ProjectDescription'], model['ProjectID']]);
                        });

                        self.fetching = false;
                    });
                }, self.updateInterval);

                // poor man's semaphore
                while (self.fetching) {
                }

                return self._optionValues;
            }
        }]
    });

    App.Vars.annualBudgetsBackgridColumnDefinitions = [];
    _.each(App.Vars.BudgetsBackgridColumnDefinitions, function (value, key) {
        if (_.indexOf(['', 'BudgetID'], value.name) !== -1) {
            return;
        }
        value = _.clone(value);
        value.editable = false;
        value.orderable = false;
        if (value.name === 'ProjectID') {
            value.cell = ProjectsCell;
        }
        if (value.name === 'BudgetSource') {
            value.width = 100;
        }
        if (value.name === 'BudgetAmount') {
            value.label = 'Budget';
        }
        App.Vars.annualBudgetsBackgridColumnDefinitions.push(value);
    });
    if (!App.Vars.bAllowBackgridInlineEditing) {
        _.each(App.Vars.BudgetsBackgridColumnDefinitions, function (value, key) {
            value.editable = false;
        });
        _.each(App.Vars.annualBudgetsBackgridColumnDefinitions, function (value, key) {
            value.editable = false;
        });
    }
    _log('App.Vars.CollectionsGroup', 'App.Vars.BudgetsBackgridColumnDefinitions:', App.Vars.BudgetsBackgridColumnDefinitions);
    _log('App.Vars.CollectionsGroup', 'App.Vars.annualBudgetsBackgridColumnDefinitions:', App.Vars.annualBudgetsBackgridColumnDefinitions);
})(window.App);
