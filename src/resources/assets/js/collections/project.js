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

    let WhenWillProjectBeCompletedOptionsCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.projectModel.getWhenWillProjectBeCompletedOptions(false)
        }]

    });

let PermitRequiredOptionsCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.projectModel.getPermitRequiredOptions(false)
        }]

    });

let PermitRequiredStatusOptionsCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.projectModel.getPermitRequiredStatusOptions(false)
        }]

    });

//##DYNAMIC_CELL_TYPES

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
            name: "status",
            label: "Status",
            cell: StatusCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "125",
            displayOrder: displayOrderCnt++
        },
        {
            name: "status_reason",
            label: "Status Reason",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "88",
            displayOrder: displayOrderCnt++
        },
        {
            name: "primary_skill_needed",
            label: "Primary Skill Needed",
            cell: SkillsNeededCell.extend({multiple: true}),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "130",
            displayOrder: displayOrderCnt++
        },
        {
            name: "budget_sources",
            label: "Budget Sources",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "94",
            displayOrder: displayOrderCnt++
        },
        {
            name: "location",
            label: "Location",
            cell: "string",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "58",
            displayOrder: displayOrderCnt++
        },
        {
            name: "dimensions",
            label: "Dimensions",
            cell: "string",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "70",
            displayOrder: displayOrderCnt++
        },
        {
            name: "material_needed_and_cost",
            label: "Material Needed and Cost",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "154",
            displayOrder: displayOrderCnt++
        },
        {
            name: "estimated_total_cost",
            label: "Estimated Total Cost",
            cell: "number",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "130",
            displayOrder: displayOrderCnt++
        },
        {
            name: "special_instructions",
            label: "Special Instructions",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "130",
            displayOrder: displayOrderCnt++
        },
        {
            name: "team_leaders_needed_estimate",
            label: "Team Leaders Needed Estimate",
            cell: "integer",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "178",
            displayOrder: displayOrderCnt++
        },
        {
            name: "volunteers_needed_estimate",
            label: "Volunteers Needed Estimate",
            cell: "integer",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "166",
            displayOrder: displayOrderCnt++
        },
        {
            name: "estimated_time_to_complete",
            label: "Estimated time to complete the project?",
            cell: "string",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "244",
            displayOrder: displayOrderCnt++
        },
        {
            name: "when_will_project_be_completed",
            label: "Will this project be completed before or during Spring into Action?",
            cell: WhenWillProjectBeCompletedOptionsCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "125",
            displayOrder: displayOrderCnt++
        },
        {
            name: "prep_work_required",
            label: "Prep Work Required",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "118",
            displayOrder: displayOrderCnt++
        },
        {
            name: "permit_required",
            label: "Is a permit required for this project? (Please see the SIA Manual regarding permits)",
            cell: PermitRequiredOptionsCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "125",
            displayOrder: displayOrderCnt++
        },
        {
            name: "permit_required_for",
            label: "What is the permit required for?",
            cell: "string",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "202",
            displayOrder: displayOrderCnt++
        },
        {
            name: "would_like_team_lead_to_contact",
            label: "Would you like a member of the lead team to contact you regarding this project? ",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "special_equipment_needed",
            label: "Is any special equipment needed for the project? ",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "304",
            displayOrder: displayOrderCnt++
        },
        {
            name: "painting_dimensions",
            label: "Wall Dimensions (Square feet est.) ",
            cell: "string",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "220",
            displayOrder: displayOrderCnt++
        },
        {
            name: "estimated_paint_cans_needed",
            label: "Estimated Number of Paint Cans needed",
            cell: "integer",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "232",
            displayOrder: displayOrderCnt++
        },
        {
            name: "estimated_paint_tape_rolls_needed",
            label: "Estimated rolls of painters tape needed",
            cell: "integer",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "244",
            displayOrder: displayOrderCnt++
        },
        {
            name: "paint_already_on_hand",
            label: "Paint already on hand",
            cell: "string",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "136",
            displayOrder: displayOrderCnt++
        },
        {
            name: "paint_ordered",
            label: "Paint ordered",
            cell: "string",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "88",
            displayOrder: displayOrderCnt++
        },
        {
            name: "needs_to_be_started_early",
            label: "Needs To Be Started Early",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "actual_cost",
            label: "Actual Cost",
            cell: "number",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "76",
            displayOrder: displayOrderCnt++
        },
        {
            name: "child_friendly",
            label: "Child Friendly",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "pc_see_before_sia",
            label: "PC See Before SIA",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "setup_day_instructions",
            label: "Setup Day Instructions",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "142",
            displayOrder: displayOrderCnt++
        },
        {
            name: "sia_day_instructions",
            label: "SIA Day Instructions",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "130",
            displayOrder: displayOrderCnt++
        },
        {
            name: "need_sia_tshirts_for_pc",
            label: "Need SIA TShirts For PC",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "project_send",
            label: "Project Send",
            cell: App.Vars.sendCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "125",
            displayOrder: displayOrderCnt++
        },
        {
            name: "cost_estimate_done",
            label: "Cost Estimate Done",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "material_list_done",
            label: "Material List Done",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "volunteer_allocation_done",
            label: "Volunteer Allocation Done",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "permits_or_approvals_done",
            label: "Permits Or Approvals Done",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "permits_or_approvals_status",
            label: "Permits Or Approvals Status",
            cell: PermitRequiredStatusOptionsCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "125",
            displayOrder: displayOrderCnt++
        },
        {
            name: "final_completion_assessment",
            label: "Final Completion Assessment",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "172",
            displayOrder: displayOrderCnt++
        },
        {
            name: "final_completion_status",
            label: "Final Completion Status",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "project_attachments",
            label: "Project Attachments",
            cell: "string",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "124",
            displayOrder: displayOrderCnt++
        },

];

    if (!App.Vars.bAllowBackgridInlineEditing) {
        _.each(App.Vars.projectsBackgridColumnDefinitions, function (value, key) {
            value.editable = false;
        });
    }
    _log('App.Vars.CollectionsGroup', 'App.Vars.projectsBackgridColumnDefinitions', App.Vars.projectsBackgridColumnDefinitions);
})(window.App);
