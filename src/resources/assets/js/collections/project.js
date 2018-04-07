(function (App) {
    App.Collections.Project = Backbone.Collection.extend({
        model: App.Models.Project
    });
    App.PageableCollections.Project = Backbone.PageableCollection.extend({
        model: App.Models.Project,
        state: {
            pageSize: 10
        },
        mode: "client" // page entirely on the client side
    });
    let SkillsNeededCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple: true
        },
        optionValues: [{
            values: App.Models.projectModel.getSkillsNeededOptions(false)
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
                if (_.isString(rawValue) && rawValue.match(/,/)){
                    rawValue = rawValue.split(',');
                }
                return _.isArray(rawValue) ? rawValue : rawValue != null ? [rawValue] : [];
            }
        })

    });

    let StatusCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.projectModel.getStatusOptions(false)
        }]

    });
    // Override until the textarea cell works
    //TextareaCell = 'string';
    // Resizeable columns must have a pixel width defined
    App.Vars.projectsBackgridColumnDefinitions = [
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
            displayOrder: 1
        },
        {
            name: "ProjectID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="ProjectID" value="' + rawValue + '" />';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30",
            displayOrder: 2
        },
        {
            name: "Active",
            label: "Active",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: false,
            width: "50",
            displayOrder: 3
        },
        {
            name: "SequenceNumber",
            label: "Project ID",
            cell: "integer",
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 4
        },
        {
            name: "OriginalRequest",
            label: "Original Request",
            cell: App.Vars.TextareaCell,
            resizeable: true,
            orderable: true,
            width: "250",
            displayOrder: 5
        },
        {
            name: "ProjectDescription",
            label: "Project Description",
            cell: App.Vars.TextareaCell,
            resizeable: true,
            orderable: false,
            width: "250",
            displayOrder: 6
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            resizeable: true,
            orderable: true,
            width: "250",
            displayOrder: 7
        },
        {
            name: "Status",
            label: "Status",
            cell: StatusCell,
            resizeable: true,
            orderable: true,
            width: "66",
            displayOrder: 8
        },
        {
            name: "StatusReason",
            label: "Status Reason",
            cell: App.Vars.TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 9
        },
        {
            name: "BudgetSources",
            label: "Budget Sources",
            cell: App.Vars.budgetSourceCell,
            resizeable: true,
            orderable: true,
            width: "125",
            displayOrder: 10
        },
        {
            name: "ChildFriendly",
            label: "Child Friendly",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 11
        },
        {
            name: "PrimarySkillNeeded",
            label: "Primary Skill Needed",
            cell: SkillsNeededCell.extend({multiple: true}),
            resizeable: true,
            orderable: true,
            width: "150",
            displayOrder: 12
        },
        {
            name: "VolunteersNeededEst",
            label: "Volunteers Needed Est",
            cell: "integer",
            resizeable: true,
            orderable: true,
            width: "166",
            displayOrder: 13
        },
        {
            name: "VolunteersAssigned",
            label: "Volunteers Assigned",
            cell: "integer",
            resizeable: true,
            orderable: true,
            width: "145",
            displayOrder: 14
        },
        {
            name: "MaterialsNeeded",
            label: "Materials Needed",
            cell: App.Vars.TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 15
        },
        {
            name: "EstimatedCost",
            label: "Estimated Cost",
            cell: "number",
            resizeable: true,
            orderable: true,
            width: "120",
            displayOrder: 16
        },
        {
            name: "ActualCost",
            label: "Actual Cost",
            cell: "number",
            resizeable: true,
            orderable: true,
            width: "95",
            displayOrder: 17
        },
        {
            name: "BudgetAvailableForPC",
            label: "Budget Available For PC",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "178",
            displayOrder: 18
        },
        {
            name: "VolunteersLastYear",
            label: "Volunteers Last Year",
            cell: "integer",
            resizeable: true,
            orderable: true,
            width: "153",
            displayOrder: 19
        },
        {
            name: "NeedsToBeStartedEarly",
            label: "Needs To Be Started Early",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 20
        },
        {
            name: "PCSeeBeforeSIA",
            label: "PCSeeBeforeSIA",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 21
        },
        {
            name: "SpecialEquipmentNeeded",
            label: "Special Equipment Needed",
            cell: App.Vars.TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 22
        },
        {
            name: "PermitsOrApprovalsNeeded",
            label: "Permits Or Approvals Needed",
            cell: App.Vars.TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 23
        },
        {
            name: "PrepWorkRequiredBeforeSIA",
            label: "Prep Work Required Before SIA",
            cell: App.Vars.TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 24
        },
        {
            name: "SetupDayInstructions",
            label: "Setup Day Instructions",
            cell: App.Vars.TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 25
        },
        {
            name: "SIADayInstructions",
            label: "SIA Day Instructions",
            cell: App.Vars.TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 26
        },
        {
            name: "Attachments",
            label: "Attachments",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "100",
            displayOrder: 27
        },
        {
            name: "Area",
            label: "Area",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 28
        },
        {
            name: "PaintOrBarkEstimate",
            label: "Paint Or Bark Estimate",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 29
        },
        {
            name: "PaintAlreadyOnHand",
            label: "Paint Already On Hand",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 30
        },
        {
            name: "PaintOrdered",
            label: "Paint Ordered",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 31
        },
        {
            name: "CostEstimateDone",
            label: "Cost Estimate Done",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 32
        },
        {
            name: "MaterialListDone",
            label: "Material List Done",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 33
        },
        {
            name: "BudgetAllocationDone",
            label: "Budget Allocation Done",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 34
        },
        {
            name: "VolunteerAllocationDone",
            label: "Volunteer Allocation Done",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 35
        },
        {
            name: "NeedSIATShirtsForPC",
            label: "Need SIA TShirts For PC",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 36
        },
        {
            name: "ProjectSend",
            label: "Project Send",
            cell: App.Vars.sendCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 37
        },
        {
            name: "FinalCompletionStatus",
            label: "Project Completed",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 38
        },
        {
            name: "FinalCompletionAssessment",
            label: "Final Completion Assessment",
            cell: App.Vars.TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 39
        },
        {
            name: "updated_at",
            label: "updated_at",
            cell: "string",
            editable: false,
            resizeable: true,
            orderable: true,
            width: "50",
            renderable: true,
            displayOrder: 40
        }

    ];


    _log('App.Vars.CollectionsGroup', 'App.Vars.projectsBackgridColumnDefinitions', App.Vars.projectsBackgridColumnDefinitions);
})(window.App);
