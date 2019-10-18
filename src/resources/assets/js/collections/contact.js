(function (App) {
    App.Collections.Contact = Backbone.Collection.extend({
        url: '/admin/contact/list/all',
        model: App.Models.Contact
    });
    App.PageableCollections.Contact = Backbone.PageableCollection.extend({
        url: '/admin/contact/list/all',
        model: App.Models.Contact,
        state: {
            pageSize: 5000
        },
        mode: "client" // page entirely on the client side
    });
    App.PageableCollections.ProjectContact = Backbone.PageableCollection.extend({
        url: '/admin/project_contact/list/all',
        model: App.Models.ProjectContact,
        state: {
            pageSize: 5000
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
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "50"
        },
        {
            name: "SiteID",
            label: "Site",
            cell: SitesCell,
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "FirstName",
            label: "FirstName",
            cell: "string",
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "LastName",
            label: "LastName",
            cell: "string",
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Title",
            label: "Title",
            cell: "string",
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Email",
            label: "Email",
            cell: "email",
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Phone",
            label: "Phone",
            cell: "string",
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "ContactType",
            label: "ContactType",
            cell: "string",
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        }
    ];
    App.Vars.ContactsBackgridColumnDefinitions = [];
    _.each(contactsBackgridColumnDefinitions, function (value, key) {
        value = _.clone(value);
        if (value.name !== 'ContactID') {
            value.editable = App.Vars.Auth.bCanEditProjectTabGridFields;
        }
        App.Vars.ContactsBackgridColumnDefinitions.push(value);
    });

    App.Vars.projectContactsBackgridColumnDefinitions = [];
    _.each(contactsBackgridColumnDefinitions, function (value, key) {
        value = _.clone(value);
        if (value.name === 'ContactID') {
            value.name = 'ProjectContactsID';
            value.formatter = _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="ProjectContactsID" value="' + rawValue + '" />';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            });
        }
        value.editable = false;
        App.Vars.projectContactsBackgridColumnDefinitions.push(value);
    });
    if (!App.Vars.bAllowBackgridInlineEditing) {
        _.each(App.Vars.ContactsBackgridColumnDefinitions, function (value, key) {
            value.editable = false;
        });
    }
    _log('App.Vars.CollectionsGroup', 'App.Vars.ContactsBackgridColumnDefinitions:', App.Vars.ContactsBackgridColumnDefinitions);
    _log('App.Vars.CollectionsGroup', 'App.Vars.projectContactsBackgridColumnDefinitions:', App.Vars.projectContactsBackgridColumnDefinitions);
})(window.App);
