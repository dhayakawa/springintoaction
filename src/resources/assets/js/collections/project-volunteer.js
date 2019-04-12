(function (App) {
    App.PageableCollections.ProjectVolunteer = Backbone.PageableCollection.extend({
        model: App.Models.ProjectVolunteer,
        state: {
            pageSize: 10
        },
        mode: "client" // page entirely on the client side
    });
    App.PageableCollections.ProjectLead = Backbone.PageableCollection.extend({
        model: App.Models.ProjectVolunteerRole,
        state: {
            pageSize: 10
        },
        mode: "client" // page entirely on the client side
    });
    let VolunteerRoleCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getRoleOptions(false)
        }],
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : parseInt(formattedValue);
            }
        })

    });
    let VolunteerRoleStatusCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getStatusOptions(false)
        }],
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : _.map(formattedValue, function (v) {
                    return parseInt(v);
                })
            }
        })
    });

    let displayOrder = 1;
    App.Vars.volunteerLeadsBackgridColumnDefinitions = [
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
            width: "30",
            displayOrder: displayOrder++
        },
        {
            name: "ProjectVolunteerRoleID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="ProjectVolunteerRoleID" value="' + rawValue + '" />';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30",
            displayOrder: displayOrder++
        },
        {
            name: "Active",
            label: "Active",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: true,
            orderable: false,
            width: "50",
            filterType: "integer",
            displayOrder: displayOrder++
        },
        {
            name: "VolunteerID",
            label: "VolunteerID",
            cell: "string",
            editable: false,
            resizeable: true,
            orderable: false,
            renderable: false,
            width: "15",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "LastName",
            label: "LastName",
            cell: "string",
            editable: false,
            resizeable: true,
            orderable: true,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "FirstName",
            label: "FirstName",
            cell: "string",
            editable: false,
            resizeable: true,
            orderable: true,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        }, {
            name: "ProjectRoleID",
            label: "Project Volunteer Role",
            cell: VolunteerRoleCell,
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "ProjectVolunteerRoleStatus",
            label: "Status",
            cell: VolunteerRoleStatusCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "MobilePhoneNumber",
            label: "MobilePhoneNumber",
            cell: "string",
            editable: false,
            resizeable: true,
            orderable: true,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "HomePhoneNumber",
            label: "HomePhoneNumber",
            cell: "string",
            editable: false,
            resizeable: true,
            orderable: true,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "Email",
            label: "Email",
            cell: "email",
            editable: false,
            resizeable: true,
            orderable: true,
            width: "175",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: true,
            orderable: true,
            width: "250",
            displayOrder: displayOrder++
        }
    ];

    _log('App.Vars.CollectionsGroup', 'App.Vars.volunteerLeadsBackgridColumnDefinitions:', App.Vars.volunteerLeadsBackgridColumnDefinitions);
})(window.App);
