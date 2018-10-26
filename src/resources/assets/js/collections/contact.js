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
    let siteOptions = function () {
        let options = [];
        _.each(App.Vars.appInitialData['sites'], function (model) {
            options.push([model['SiteName'], model['SiteID']]);
        });

        return options;
    };

    let SitesCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple: false
        },
        optionValues: [{
            values: siteOptions()
        }],
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : _.map(formattedValue, function (v) {
                    return parseInt(v);
                })
            }
        })

    });
    let contactsBackgridColumnDefinitions = [
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
            name: "SiteID",
            label: "Site",
            cell: SitesCell,
            resizeable: true,
            orderable: true,
            width: "250"
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
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
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
        }
    ];
    App.Vars.ContactsBackgridColumnDefinitions = [];
    _.each(contactsBackgridColumnDefinitions, function (value, key) {
        value = _.clone(value);
        if (value.name !== 'ContactID') {
            value.editable = true;
        }
        App.Vars.ContactsBackgridColumnDefinitions.push(value);
    });

    App.Vars.projectContactsBackgridColumnDefinitions = [];
    _.each(contactsBackgridColumnDefinitions, function (value, key) {
        value = _.clone(value);
        value.editable = false;
        App.Vars.projectContactsBackgridColumnDefinitions.push(value);
    });

    _log('App.Vars.CollectionsGroup', 'App.Vars.ContactsBackgridColumnDefinitions:', App.Vars.ContactsBackgridColumnDefinitions);
})(window.App);
