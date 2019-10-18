(function (App) {
    App.Collections.Project = Backbone.Collection.extend({
        url: '/admin/project/list/all',
        model: App.Models.Project
    });
    App.PageableCollections.Project = Backbone.PageableCollection.extend({
        url: '/admin/project/list/all',
        model: App.Models.Project,
        state: {
            pageSize: 5000
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
                if (_.isString(rawValue) && rawValue.match(/,/)) {
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

    let displayOrderCnt = 1;
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
            displayOrder: displayOrderCnt++
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
            displayOrder: displayOrderCnt++
        },
        {
            name: "HasAttachments",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return rawValue ? '<i class="fa fa-paperclip" aria-hidden="true"></i>' : '';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30",
            displayOrder: displayOrderCnt++
        },
        {
            name: "Active",
            label: "Active",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "SequenceNumber",
            label: "Project ID",
            cell: "integer",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "OriginalRequest",
            label: "Original Request",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            displayOrder: displayOrderCnt++
        },
        {
            name: "ProjectDescription",
            label: "Project Description",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "250",
            displayOrder: displayOrderCnt++
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            displayOrder: displayOrderCnt++
        },
        {
            name: "Status",
            label: "Status",
            cell: StatusCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "66",
            displayOrder: displayOrderCnt++
        },
        {
            name: "StatusReason",
            label: "Status Reason",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "255",
            displayOrder: displayOrderCnt++
        },
        {
            name: "BudgetSources",
            label: "Budget Sources",
            cell: App.Vars.budgetSourceCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "125",
            displayOrder: displayOrderCnt++
        },
        {
            name: "ChildFriendly",
            label: "Child Friendly",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "PrimarySkillNeeded",
            label: "Primary Skill Needed",
            cell: SkillsNeededCell.extend({multiple: true}),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            displayOrder: displayOrderCnt++
        },
        {
            name: "VolunteersNeededEst",
            label: "Volunteers Needed Est",
            cell: "integer",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "166",
            displayOrder: displayOrderCnt++
        },
        {
            name: "VolunteersAssigned",
            label: "Volunteers Assigned",
            cell: "integer",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "145",
            displayOrder: displayOrderCnt++
        },
        {
            name: "MaterialsNeeded",
            label: "Materials Needed",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "255",
            displayOrder: displayOrderCnt++
        },
        {
            name: "EstimatedCost",
            label: "Estimated Cost",
            cell: "number",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "120",
            displayOrder: displayOrderCnt++
        },
        {
            name: "ActualCost",
            label: "Actual Cost",
            cell: "number",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "95",
            displayOrder: displayOrderCnt++
        },
        {
            name: "BudgetAvailableForPC",
            label: "Budget Available For PC",
            cell: "string",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "178",
            displayOrder: displayOrderCnt++
        },
        {
            name: "VolunteersLastYear",
            label: "Volunteers Last Year",
            cell: "integer",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "153",
            displayOrder: displayOrderCnt++
        },
        {
            name: "NeedsToBeStartedEarly",
            label: "Needs To Be Started Early",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "PCSeeBeforeSIA",
            label: "TLSeeBeforeSIA",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "SpecialEquipmentNeeded",
            label: "Special Equipment Needed",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "255",
            displayOrder: displayOrderCnt++
        },
        {
            name: "PermitsOrApprovalsNeeded",
            label: "Permits Or Approvals Needed",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "255",
            displayOrder: displayOrderCnt++
        },
        {
            name: "PrepWorkRequiredBeforeSIA",
            label: "Prep Work Required Before SIA",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "255",
            displayOrder: displayOrderCnt++
        },
        {
            name: "SetupDayInstructions",
            label: "Setup Day Instructions",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "255",
            displayOrder: displayOrderCnt++
        },
        {
            name: "SIADayInstructions",
            label: "SIA Day Instructions",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "255",
            displayOrder: displayOrderCnt++
        },
        {
            name: "Area",
            label: "Area",
            cell: "string",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "255",
            displayOrder: displayOrderCnt++
        },
        {
            name: "PaintOrBarkEstimate",
            label: "Paint Or Bark Estimate",
            cell: "string",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "255",
            displayOrder: displayOrderCnt++
        },
        {
            name: "PaintAlreadyOnHand",
            label: "Paint Already On Hand",
            cell: "string",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "255",
            displayOrder: displayOrderCnt++
        },
        {
            name: "PaintOrdered",
            label: "Paint Ordered",
            cell: "string",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "255",
            displayOrder: displayOrderCnt++
        },
        {
            name: "CostEstimateDone",
            label: "Cost Estimate Done",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields, resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "MaterialListDone",
            label: "Material List Done",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields, resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "BudgetAllocationDone",
            label: "Budget Allocation Done",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields, resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "VolunteerAllocationDone",
            label: "Volunteer Allocation Done",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields, resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "NeedSIATShirtsForPC",
            label: "Need SIA TShirts For PC",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields, resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "ProjectSend",
            label: "Project Send",
            cell: App.Vars.sendCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields, resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "FinalCompletionStatus",
            label: "Project Completed",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "FinalCompletionAssessment",
            label: "Final Completion Assessment",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "255",
            displayOrder: displayOrderCnt++
        },
        {
            name: "updated_at",
            label: "updated_at",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            renderable: true,
            displayOrder: displayOrderCnt++
        }

    ];

    if (!App.Vars.bAllowBackgridInlineEditing) {
        _.each(App.Vars.projectsBackgridColumnDefinitions, function (value, key) {
            value.editable = false;
        });
    }
    _log('App.Vars.CollectionsGroup', 'App.Vars.projectsBackgridColumnDefinitions', App.Vars.projectsBackgridColumnDefinitions);
})(window.App);
