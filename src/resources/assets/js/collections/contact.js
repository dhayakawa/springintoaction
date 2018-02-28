(function (App) {
    App.Collections.Contact = Backbone.PageableCollection.extend({
        model: App.Models.Contact,
        state: {
            pageSize: 10
        },
        mode: "client" // page entirely on the client side
    });

    App.Vars.ContactsBackgridColumnDefinitions = [
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
            name: "Active",
            label: "Active",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: false,
            width: "50"
        },
        {
            name: "FirstName",
            label: "FirstName",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "LastName",
            label: "LastName",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "Title",
            label: "Title",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "Email",
            label: "Email",
            cell: "email",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "Phone",
            label: "Phone",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "ContactType",
            label: "ContactType",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        }, {
            name: "ContactID",
            label: "ContactID",
            editable: false,
            cell: Backgrid.IntegerCell.extend({
                orderSeparator: ''
            }),
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "SiteID",
            label: "SiteID",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "created_at",
            label: "created_at",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "updated_at",
            label: "updated_at",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        }
    ];
    App.Vars.ContactsBackgridColumnCollection = new Backgrid.Extension.OrderableColumns.orderableColumnCollection(App.Vars.ContactsBackgridColumnDefinitions);
    App.Vars.ContactsBackgridColumnCollection.setPositions().sort();
    //console.log('ContactsBackgridColumnCollection:', App.Vars.ContactsBackgridColumnCollection)

})(window.App);
