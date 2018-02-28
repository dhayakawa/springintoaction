(function (App) {
    App.Collections.Budget = Backbone.PageableCollection.extend({
        model: App.Models.Budget,
        state: {
            pageSize: 10
        },
        mode: "client" // page entirely on the client side
    });
    var BudgetStatusCell = Backgrid.Extension.Select2Cell.extend({
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: [
                ['Proposed', 'Unskilled'],
                ['Approved', 'Fair'],
                ['Paid', 'Good'],
                ['Excellent', 'Excellent']
            ]
        }]

    });
    App.Vars.BudgetsBackgridColumnDefinitions = [
        {
            // name is a required parameter, but you don't really want one on a select all column
            name: "",
            // Backgrid.Extension.SelectRowCell lets you select individual rows
            cell: "select-row",
            // Backgrid.Extension.SelectAllHeaderCell lets you select all the row on a page
            headerCell: "select-all",
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
            width: "250"
        },
        {
            name: "BudgetAmount",
            label: "BudgetAmount",
            cell: "number",
            resizeable: true,
            orderable: true,
            width: "100"
        },
        {
            name: "Status",
            label: "Status",
            cell: BudgetStatusCell,
            resizeable: true,
            orderable: true,
            width: "250"
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
            name: "BudgetID",
            label: "BudgetID",
            editable: false,
            cell: Backgrid.IntegerCell.extend({
                orderSeparator: ''
            }),
            resizeable: true,
            orderable: true,
            width: "250",
            renderable: false
        },
        {
            name: "ProjectID",
            label: "ProjectID",
            cell: "integer",
            resizeable: true,
            orderable: true,
            width: "250",
            renderable: false
        },
        {
            name: "created_at",
            label: "created_at",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250",
            renderable: false
        },
        {
            name: "updated_at",
            label: "updated_at",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250",
            renderable: false
        }
    ];
    App.Vars.BudgetsBackgridColumnCollection = new Backgrid.Extension.OrderableColumns.orderableColumnCollection(App.Vars.BudgetsBackgridColumnDefinitions);
    App.Vars.BudgetsBackgridColumnCollection.setPositions().sort();
    //console.log('BudgetsBackgridColumnCollection:', App.Vars.BudgetsBackgridColumnCollection)
})(window.App);
