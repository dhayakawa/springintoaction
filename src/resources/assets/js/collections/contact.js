(function (App) {
    App.Collections.Contact = Backbone.Collection.extend({
        model: App.Models.Contact
    });
    App.PageableCollections.Contact = Backbone.PageableCollection.extend({
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
            name: "ContactID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="ContactID" value="' + rawValue + '" />';
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
    _log('App.Vars.CollectionsGroup', 'App.Vars.ContactsBackgridColumnDefinitions:', App.Vars.ContactsBackgridColumnDefinitions);
})(window.App);
