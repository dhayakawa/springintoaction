(function (App) {
    App.Collections.Volunteer = Backbone.Collection.extend({
        model: App.Models.Volunteer
    });

    App.PageableCollections.Volunteer = Backbone.PageableCollection.extend({
        model: App.Models.Volunteer,
        state: {
            pageSize: 10
        },
        mode: "client" // page entirely on the client side
    });

    let SkillsCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getSkillLevelOptions(false)
        }]

    });

    let VolunteerPrimarySkillCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getPrimarySkillOptions(false)
        }]

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
                return formattedValue === null ? [] : _.map(formattedValue, function (v) {
                    return parseInt(v);
                })
            }
        })

    });
    let SchoolCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getSchoolOptions(false)
        }]

    });
    let AgeRangeCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple:true
        },
        optionValues: [{
            values: App.Models.volunteerModel.getAgeRangeOptions(false)
        }],
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {

            /**
             Normalizes raw scalar or array values to an array.

             @member Backgrid.SelectFormatter
             @param {*} rawValue
             @param {Backbone.Model} model Used for more complicated formatting
             @return {Array.<*>}
             */
            fromRaw: function (rawValue, model) {
                if (_.isString(rawValue) && rawValue.match(/,/)) {
                    rawValue = rawValue.split(',');
                }
                return _.isArray(rawValue) ? rawValue : rawValue != null ? [rawValue] : [];
            }
        })

    });
    App.Vars.volunteersBackgridColumnDefinitions = [
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
            name: "VolunteerID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="VolunteerID" value="' + rawValue + '" />';
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
            width: "50",
            filterType: "integer"
        },
        {
            name: "Status",
            label: "Status",
            cell: App.Vars.VolunteerStatusCell,
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string"
        },
        {
            name: "LastName",
            label: "LastName",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string"
        },
        {
            name: "FirstName",
            label: "FirstName",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string"
        },
        {
            name: "MobilePhoneNumber",
            label: "MobilePhoneNumber",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string"
        },
        {
            name: "HomePhoneNumber",
            label: "HomePhoneNumber",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string"
        },
        {
            name: "Email",
            label: "Email",
            cell: "email",
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string"
        },
        {
            name: "PrimarySkill",
            label: "PrimarySkill",
            cell: VolunteerPrimarySkillCell,
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string"
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
            width: "250",
            filterType: "string"
        },
        {
            name: "AgeRange",
            label: "AgeRange",
            cell: AgeRangeCell,
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string"
        },
        {
            name: "LG",
            label: "LG",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string"
        },
        {
            name: "Family",
            label: "Family",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string"
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
            width: "250",
            filterType: "string"
        },
        {
            name: "Landscaping",
            label: "Landscaping",
            cell: SkillsCell,
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string"
        },
        {
            name: "Construction",
            label: "Construction",
            cell: SkillsCell,
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string"
        },
        {
            name: "Electrical",
            label: "Electrical",
            cell: SkillsCell,
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string"
        },
        {
            name: "CabinetryFinishWork",
            label: "CabinetryFinishWork",
            cell: SkillsCell,
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string"
        },
        {
            name: "Plumbing",
            label: "Plumbing",
            cell: SkillsCell,
            resizeable: true,
            orderable: true,
            width: "250",
            filterType: "string"
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
            width: "250",
            filterType: "string"
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
            width: "250",
            filterType: "string"
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
            renderable: false,
            filterType: "string"
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
        }
    ];

    App.Vars.volunteerLeadsBackgridColumnDefinitions = [];
    let sharedCells = ['', 'VolunteerID', 'Active', 'Status', 'LastName', 'FirstName', 'MobilePhoneNumber', 'HomePhoneNumber', 'Email'];
    _.each(sharedCells,  function (value, key) {
        let cellDefinition = _.findWhere(App.Vars.volunteersBackgridColumnDefinitions, {name: value});
        if (value === 'Status') {
            cellDefinition.name = 'ProjectVolunteerRoleStatus';
        }
        App.Vars.volunteerLeadsBackgridColumnDefinitions.push(cellDefinition);
        if (value === 'Active'){
            App.Vars.volunteerLeadsBackgridColumnDefinitions.push({
                name: "ProjectRoleID",
                label: "Project Lead Role",
                cell: VolunteerRoleCell,
                resizeable: true,
                orderable: true,
                width: "250",
                filterType: "string"
            });
        }
    });


    _log('App.Vars.CollectionsGroup', 'App.Vars.volunteersBackgridColumnDefinitions:', App.Vars.volunteersBackgridColumnDefinitions);
    _log('App.Vars.CollectionsGroup', 'App.Vars.volunteerLeadsBackgridColumnDefinitions:', App.Vars.volunteerLeadsBackgridColumnDefinitions);
})(window.App);
