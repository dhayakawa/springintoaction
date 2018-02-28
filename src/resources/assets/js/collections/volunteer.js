(function (App) {
    App.Collections.Volunteer = Backbone.PageableCollection.extend({
        model: App.Models.Volunteer,
        state: {
            pageSize: 10
        },
        mode: "client" // page entirely on the client side
    });
    var SkillsCell = Backgrid.Extension.Select2Cell.extend({
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: [
                ['Unskilled', 'Unskilled'],
                ['Fair', 'Fair'],
                ['Good', 'Good'],
                ['Excellent', 'Excellent']
            ]
        }]

    });
    var VolunteerStatusCell = Backgrid.Extension.Select2Cell.extend({
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: [
                ['Agreed', 'Agreed'],
                ['Declined', 'Declined']
            ]
        }]

    });
    var VolunteerPrimarySkillCell = Backgrid.Extension.Select2Cell.extend({
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: [
                ['Painting', 'Painting'],
                ['Landscaping', 'Landscaping'],
                ['Construction', 'Construction'],
                ['Electrical', 'Electrical'],
                ['Cabinetry Finish Work', 'CabinetryFinishWork'],
                ['Plumbing', 'Plumbing']
            ]
        }]

    });
    var VolunteerRoleCell = Backgrid.Extension.Select2Cell.extend({
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: [
                ['Liaison', 'Liaison'],
                ['Scout', 'Scout'],
                ['Estimator', 'Estimator'],
                ['Site Coordinator', 'Site Coordinator'],
                ['Project Coordinator', 'Project Coordinator'],
                ['Team Leader', 'Team Leader'],
                ['Worker', 'Worker']
            ]
        }]

    });
    var SchoolCell = Backgrid.Extension.Select2Cell.extend({
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: [
                ['PJ Jacobs', 'PJ Jacobs'],
                ['Roosevelt', 'Roosevelt'],
                ['McKinley', 'McKinley'],
                ['Kennedy', 'Kennedy'],
                ['Madison', 'Madison'],
                ['SPASH', 'SPASH'],
                ['Jefferson', 'Jefferson'],
                ['McDill', 'McDill'],
                ['Bannach', 'Bannach'],
                ['Washington', 'Washington'],
                ['Charles F. Fernandez Center', 'Charles F. Fernandez Center'],
                ['Ben Franklin', 'Ben Franklin'],
                ['Plover-Whiting', 'Plover-Whiting'],
                ['Boston School Forest', 'Boston School Forest'],
                ['Point of Discovery', 'Point of Discovery']
            ]
        }]

    });
    var AgeRangeCell = Backgrid.Extension.Select2Cell.extend({
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: [
                ['Adult 18+-', 'Adult 18+-'],
                ['Adult 18+-,Child under 12-', 'Adult 18+-,Child under 12-'],
                ['Child under 12-', 'Child under 12-'],
                ['Adult 18+-,Youth 12-17-,Child under 1', 'Adult 18+-,Youth 12-17-,Child under 1'],
                ['Youth 12-17-', 'Youth 12-17-'],
                ['Adult 18+-,Youth 12-17-', 'Adult 18+-,Youth 12-17-'],
                ['Youth 12-17-,Child under 12-', 'Youth 12-17-,Child under 12-'],
                ['Adult (18+)', 'Adult (18+)'],
                ['Youth (12-17)', 'Youth (12-17)']
            ]
        }]

    });
    App.Vars.VolunteersBackgridColumnDefinitions = [
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
            name: "Role",
            label: "Role",
            cell: VolunteerRoleCell,
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "Status",
            label: "Status",
            cell: VolunteerStatusCell,
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
            name: "FirstName",
            label: "FirstName",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "MobilePhoneNumber",
            label: "MobilePhoneNumber",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "HomePhoneNumber",
            label: "HomePhoneNumber",
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
            name: "PrimarySkill",
            label: "PrimarySkill",
            cell: VolunteerPrimarySkillCell,
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
            name: "ContactPhone",
            label: "ContactPhone",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "AgeRange",
            label: "AgeRange",
            cell: AgeRangeCell,
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "LG",
            label: "LG",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "Family",
            label: "Family",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "CFE",
            label: "CFE",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "CFP",
            label: "CFP",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "Painting",
            label: "Painting",
            cell: SkillsCell,
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "Landscaping",
            label: "Landscaping",
            cell: SkillsCell,
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "Construction",
            label: "Construction",
            cell: SkillsCell,
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "Electrical",
            label: "Electrical",
            cell: SkillsCell,
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "CabinetryFinishWork",
            label: "CabinetryFinishWork",
            cell: SkillsCell,
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "Plumbing",
            label: "Plumbing",
            cell: SkillsCell,
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "NotesOnYourSkillAssessment",
            label: "NotesOnYourSkillAssessment",
            cell: "text",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "PhysicalRestrictions",
            label: "PhysicalRestrictions",
            cell: SkillsCell,
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "SchoolPreference",
            label: "SchoolPreference",
            cell: SchoolCell,
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "Equipment",
            label: "Equipment",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "TeamLeaderWilling",
            label: "TeamLeaderWilling",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "Church",
            label: "Church",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "AssignmentInformationSendStatus",
            label: "AssignmentInformationSendStatus",
            cell: App.Vars.sendCell,
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "ConfirmationCode",
            label: "GroveConfirmationCode",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250",
            renderable: false
        },
        {
            name: "FullName",
            label: "FullName",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250",
            renderable: false
        },

        {
            name: "EnteredFirstName",
            label: "GroveEnteredFirstName",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250",
            renderable: false
        },
        {
            name: "EnteredLastName",
            label: "GroveEnteredLastName",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250",
            renderable: false
        },
        {
            name: "VolunteerID",
            label: "VolunteerID",
            editable: false,
            cell: Backgrid.IntegerCell.extend({
                orderSeparator: ''
            }),
            resizeable: true,
            orderable: true,
            width: "50",
            renderable: false
        }, {
            name: "IndividualID",
            label: "GroveIndividualID",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        }, {
            name: "DateSubmitted",
            label: "GroveDateSubmitted",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "DateModified",
            label: "GroveDateModified",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        }, {
            name: "PreferredSiteID",
            label: "PreferredSiteID",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        },
        {
            name: "ResponseID",
            label: "GroveResponseID",
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
            name: "updated_at: ",
            label: "updated_at: ",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        }

    ];

    App.Vars.VolunteersBackgridColumnCollection = new Backgrid.Extension.OrderableColumns.orderableColumnCollection(App.Vars.VolunteersBackgridColumnDefinitions);
    App.Vars.VolunteersBackgridColumnCollection.setPositions().sort();
    //console.log('VolunteersBackgridColumnCollection:', App.Vars.VolunteersBackgridColumnCollection)
})(window.App);
