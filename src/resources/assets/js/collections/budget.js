(function (App) {
    App.PageableCollections.Budget = Backbone.PageableCollection.extend({
        model: App.Models.Budget,
        state: {
            pageSize: 10
        },
        mode: "client" // page entirely on the client side
    });
    let BudgetStatusCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.budgetModel.getStatusOptions(false)
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
            resizeable: true,
            orderable: true,
            width: "175"
        },
        {
            name: "BudgetAmount",
            label: "BudgetAmount",
            cell: "number",
            resizeable: true,
            orderable: true,
            width: "30"
        },
        {
            name: "Status",
            label: "Status",
            cell: BudgetStatusCell,
            resizeable: true,
            orderable: true,
            width: "50"
        },
        {
            name: "Comments",
            label: "Comments",
            cell: "text",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "ProjectID",
            label: "ProjectID",
            cell: "integer",
            resizeable: true,
            orderable: true,
            width: "50"
        }
    ];
    _log('App.Vars.CollectionsGroup', 'App.Vars.BudgetsBackgridColumnDefinitions:', App.Vars.BudgetsBackgridColumnDefinitions);
})(window.App);