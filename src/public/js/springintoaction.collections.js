(function (App) {
    App.Collections.DashboardPanel = Backbone.Collection.extend({
        model: App.Models.DashboardPanel
    });
    App.Collections.DashboardPanelLinksListItem = Backbone.Collection.extend({
        model: App.Models.DashboardPanelLinksListItem
    });
})(window.App);

(function (App) {
    App.Collections.SiteSetting = Backbone.Collection.extend({
        model: App.Models.SiteSetting
    });
})(window.App);

(function (App) {
    App.Collections.ProjectAttachment = Backbone.Collection.extend({
        model: App.Models.ProjectAttachment
    });

    App.PageableCollections.ProjectAttachment            = Backbone.PageableCollection.extend({
        model: App.Models.ProjectAttachment,
        state: {
            pageSize: 10
        },
        mode: "client" // page entirely on the client side
    });
    App.Vars.ProjectAttachmentsBackgridColumnDefinitions = [
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
            name: "ProjectAttachmentID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="ProjectAttachmentID" value="' + rawValue + '" />';
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
            name: "AttachmentPath",
            label: "Attachment URL",
            cell: "uri",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "*"
        }
    ];
    _log('App.Vars.CollectionsGroup', 'App.Vars.ProjectAttachmentsBackgridColumnDefinitions:', App.Vars.ProjectAttachmentsBackgridColumnDefinitions);
})(window.App);

(function (App) {
    App.Collections.Budget = Backbone.Collection.extend({
        url: '/admin/annualbudget/list/all',
        model: App.Models.Budget
    });

    App.PageableCollections.Budget = Backbone.PageableCollection.extend({
        url: function (ProjectID) {
            return this.document.url() + '/admin/project/budgets/' + ProjectID;
        },
        model: App.Models.Budget,
        state: {
            pageSize: 10
        },
        mode: "client" // page entirely on the client side
    });
    let BudgetStatusCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple: false
        },
        optionValues: [{
            values: App.Models.projectBudgetModel.getStatusOptions(false)
        }]

    });
    App.Vars.BudgetsBackgridColumnDefinitions = [
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
            name: "BudgetID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="BudgetID" value="' + rawValue + '" />';
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
            name: "BudgetSource",
            label: "BudgetSource",
            cell: App.Vars.budgetSourceCell,
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "175"
        },
        {
            name: "BudgetAmount",
            label: "BudgetAmount",
            cell: "number",
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "60"
        },
        {
            name: "Status",
            label: "Status",
            cell: BudgetStatusCell,
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150"
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "*"
        }
    ];
    let projectOptions = function () {
        let options = [];
        _.each(App.Vars.appInitialData['all_projects'], function (model) {
            options.push([model['ProjectDescription'], model['ProjectID']]);
        });

        return options;
    };
    let ProjectsCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple: false
        },
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : _.map(formattedValue, function (v) {
                    return parseInt(v);
                })
            }
        }),
        _optionValues: projectOptions(),
        updateInterval: 5000,
        fetching: false,
        optionValues: [{
            values: function () {
                let self = this;

                // Updates the option values in the background periodically to maintain freshness
                setInterval(function () {
                    self.fetching = true;

                    $.get("/admin/project/year/list/all").done(function (data) {
                        self._optionValues = [];
                        _.each(data, function (model) {
                            self._optionValues.push([model['ProjectDescription'], model['ProjectID']]);
                        });

                        self.fetching = false;
                    });
                }, self.updateInterval);

                // poor man's semaphore
                while (self.fetching) {
                }

                return self._optionValues;
            }
        }]
    });

    App.Vars.annualBudgetsBackgridColumnDefinitions = [];
    _.each(App.Vars.BudgetsBackgridColumnDefinitions, function (value, key) {
        if (_.indexOf(['', 'BudgetID'], value.name) !== -1) {
            return;
        }
        value = _.clone(value);
        value.editable = false;
        value.orderable = false;
        if (value.name === 'ProjectID') {
            value.cell = ProjectsCell;
        }
        if (value.name === 'BudgetSource') {
            value.width = 100;
        }
        if (value.name === 'BudgetAmount') {
            value.label = 'Budget';
        }
        App.Vars.annualBudgetsBackgridColumnDefinitions.push(value);
    });
    _log('App.Vars.CollectionsGroup', 'App.Vars.BudgetsBackgridColumnDefinitions:', App.Vars.BudgetsBackgridColumnDefinitions);
})(window.App);

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
            editable: App.Vars.Auth.bCanEditProjectGridFields, resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "255",
            displayOrder: displayOrderCnt++
        },
        {
            name: "PaintOrdered",
            label: "Paint Ordered",
            cell: "string",
            editable: App.Vars.Auth.bCanEditProjectGridFields, resizeable: App.Vars.bAllowManagedGridColumns,
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
            editable: App.Vars.Auth.bCanEditProjectGridFields, resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "FinalCompletionAssessment",
            label: "Final Completion Assessment",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields, resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "255",
            displayOrder: displayOrderCnt++
        },
        {
            name: "updated_at",
            label: "updated_at",
            cell: "string",
            editable: false,
            editable: App.Vars.Auth.bCanEditProjectGridFields, resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            renderable: true,
            displayOrder: displayOrderCnt++
        }

    ];


    _log('App.Vars.CollectionsGroup', 'App.Vars.projectsBackgridColumnDefinitions', App.Vars.projectsBackgridColumnDefinitions);
})(window.App);

(function (App) {
    App.Collections.Site = Backbone.Collection.extend({
        model: App.Models.Site
    });
    App.Collections.SiteYear = Backbone.Collection.extend({
        url: 'site/years',
        model: App.Models.SiteYear
    });
})(window.App);


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
        value.editable = false;
        App.Vars.projectContactsBackgridColumnDefinitions.push(value);
    });

    _log('App.Vars.CollectionsGroup', 'App.Vars.ContactsBackgridColumnDefinitions:', App.Vars.ContactsBackgridColumnDefinitions);
})(window.App);

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
            multiple: true
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
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "50",
            filterType: "integer"
        },
        {
            name: "LastName",
            label: "LastName",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        },
        {
            name: "FirstName",
            label: "FirstName",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        },
        {
            name: "Status",
            label: "Status",
            cell: App.Vars.VolunteerStatusCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "MobilePhoneNumber",
            label: "MobilePhoneNumber",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        },
        {
            name: "HomePhoneNumber",
            label: "HomePhoneNumber",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        },
        {
            name: "Email",
            label: "Email",
            cell: "email",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "175",
            filterType: "string"
        },
        {
            name: "PrimarySkill",
            label: "PrimarySkill",
            cell: VolunteerPrimarySkillCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "ContactPhone",
            label: "ContactPhone",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "AgeRange",
            label: "AgeRange",
            cell: AgeRangeCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "LG",
            label: "LG",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Family",
            label: "Family",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "CFE",
            label: "CFE",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "CFP",
            label: "CFP",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Painting",
            label: "Painting",
            cell: SkillsCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Landscaping",
            label: "Landscaping",
            cell: SkillsCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Construction",
            label: "Construction",
            cell: SkillsCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Electrical",
            label: "Electrical",
            cell: SkillsCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "CabinetryFinishWork",
            label: "CabinetryFinishWork",
            cell: SkillsCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Plumbing",
            label: "Plumbing",
            cell: SkillsCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "NotesOnYourSkillAssessment",
            label: "NotesOnYourSkillAssessment",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "PhysicalRestrictions",
            label: "PhysicalRestrictions",
            cell: SkillsCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "SchoolPreference",
            label: "SchoolPreference",
            cell: SchoolCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Equipment",
            label: "Equipment",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "TeamLeaderWilling",
            label: "TeamLeaderWilling",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Church",
            label: "Church",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "AssignmentInformationSendStatus",
            label: "AssignmentInformationSendStatus",
            cell: App.Vars.sendCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "PreferredSiteID",
            label: "PreferredSiteID",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        }
    ];
    let displayOrderCnt = 1;
    _.each(App.Vars.volunteersBackgridColumnDefinitions, function (value, key) {
        value.displayOrder = displayOrderCnt++;
    });



    _log('App.Vars.CollectionsGroup', 'App.Vars.volunteersBackgridColumnDefinitions:', App.Vars.volunteersBackgridColumnDefinitions);

})(window.App);

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
            multiple: true
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
                return formattedValue === null ? [] : parseInt(formattedValue)
            }
        })
    });
    App.Vars.projectVolunteersBackgridColumnDefinitions = [
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
            width: "30"
        },
        {
            name: "Active",
            label: "Active",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "50",
            filterType: "integer"
        },
        {
            name: "VolunteerID",
            label: "VolunteerID",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            renderable: false,
            width: "30",
            filterType: "string",
        },
        {
            name: "LastName",
            label: "LastName",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        },
        {
            name: "FirstName",
            label: "FirstName",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        }, {
            name: "ProjectRoleID",
            label: "Project Volunteer Role",
            cell: VolunteerRoleCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "integer"
        },
        {
            name: "ProjectVolunteerRoleStatus",
            label: "Status",
            cell: VolunteerRoleStatusCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "MobilePhoneNumber",
            label: "MobilePhoneNumber",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        },
        {
            name: "HomePhoneNumber",
            label: "HomePhoneNumber",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        },
        {
            name: "Email",
            label: "Email",
            cell: "email",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "175",
            filterType: "string"
        },
        {
            name: "PrimarySkill",
            label: "PrimarySkill",
            cell: VolunteerPrimarySkillCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "ContactPhone",
            label: "ContactPhone",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "AgeRange",
            label: "AgeRange",
            cell: AgeRangeCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "LG",
            label: "LG",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Family",
            label: "Family",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "CFE",
            label: "CFE",
            cell: App.Vars.yesNoCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "CFP",
            label: "CFP",
            cell: App.Vars.yesNoCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Painting",
            label: "Painting",
            cell: SkillsCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Landscaping",
            label: "Landscaping",
            cell: SkillsCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Construction",
            label: "Construction",
            cell: SkillsCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Electrical",
            label: "Electrical",
            cell: SkillsCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "CabinetryFinishWork",
            label: "CabinetryFinishWork",
            cell: SkillsCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Plumbing",
            label: "Plumbing",
            cell: SkillsCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "NotesOnYourSkillAssessment",
            label: "NotesOnYourSkillAssessment",
            cell: App.Vars.TextareaCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "PhysicalRestrictions",
            label: "PhysicalRestrictions",
            cell: SkillsCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "SchoolPreference",
            label: "SchoolPreference",
            cell: SchoolCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Equipment",
            label: "Equipment",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "TeamLeaderWilling",
            label: "TeamLeaderWilling",
            cell: App.Vars.yesNoCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Church",
            label: "Church",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "AssignmentInformationSendStatus",
            label: "AssignmentInformationSendStatus",
            cell: App.Vars.sendCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "PreferredSiteID",
            label: "PreferredSiteID",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        }
    ];
    let displayOrderCnt = 1;
    _.each(App.Vars.projectVolunteersBackgridColumnDefinitions, function (value, key) {
        value.displayOrder = displayOrderCnt++;
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
            resizeable: App.Vars.bAllowManagedGridColumns,
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
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            renderable: false,
            width: "30",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "LastName",
            label: "LastName",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "FirstName",
            label: "FirstName",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        }, {
            name: "ProjectRoleID",
            label: "Project Volunteer Role",
            cell: VolunteerRoleCell,
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "integer",
            displayOrder: displayOrder++
        },
        {
            name: "ProjectVolunteerRoleStatus",
            label: "Status",
            cell: VolunteerRoleStatusCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "integer",
            displayOrder: displayOrder++
        },
        {
            name: "MobilePhoneNumber",
            label: "MobilePhoneNumber",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "HomePhoneNumber",
            label: "HomePhoneNumber",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "Email",
            label: "Email",
            cell: "email",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "175",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            displayOrder: displayOrder++
        }
    ];

    _log('App.Vars.CollectionsGroup', 'App.Vars.projectVolunteerLeadsBackgridColumnDefinitions:', App.Vars.projectVolunteersBackgridColumnDefinitions);
    _log('App.Vars.CollectionsGroup', 'App.Vars.volunteerLeadsBackgridColumnDefinitions:', App.Vars.volunteerLeadsBackgridColumnDefinitions);
})(window.App);

(function (App) {
    App.PageableCollections.SiteVolunteerRoles = Backbone.PageableCollection.extend({
        model: App.Models.SiteVolunteerRole,
        state: {
            pageSize: 10
        },
        mode: "client" // page entirely on the client side
    });

    let SiteVolunteerRoleCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.siteVolunteerRoleModel.getRoleOptions(false)
        }],
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : _.map(formattedValue, function (v) {
                    return parseInt(v);
                })
            }
        })

    });
    let SiteVolunteerRoleStatusCell = Backgrid.Extension.Select2Cell.extend({
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
    App.Vars.siteVolunteersBackgridColumnDefinitions = [
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
            name: "SiteVolunteerRoleID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="SiteVolunteerRoleID" value="' + rawValue + '" />';
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
            resizeable: App.Vars.bAllowManagedGridColumns,
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
            resizeable: App.Vars.bAllowManagedGridColumns,
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
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "FirstName",
            label: "FirstName",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        }, {
            name: "SiteRoleID",
            label: "Site Volunteer Role",
            cell: SiteVolunteerRoleCell,
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "SiteVolunteerRoleStatus",
            label: "Status",
            cell: SiteVolunteerRoleStatusCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "MobilePhoneNumber",
            label: "MobilePhoneNumber",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "HomePhoneNumber",
            label: "HomePhoneNumber",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "Email",
            label: "Email",
            cell: "email",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "175",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            displayOrder: displayOrder++
        }
    ];


    _log('App.Vars.CollectionsGroup', 'App.Vars.siteVolunteersBackgridColumnDefinitions:', App.Vars.siteVolunteersBackgridColumnDefinitions);

})(window.App);

(function (App) {
    App.Collections.Report = Backbone.Collection.extend({
        model: App.Models.Report
    });
    App.Collections.ProjectsDropDown = Backbone.Collection.extend({
        model: App.Models.ProjectDropDown
    });

})(window.App);

(function (App) {
    App.Collections.StatusManagement = Backbone.Collection.extend({
        url: '/admin/sitestatus/all/statusmanagementrecords',
        model: App.Models.StatusManagement
    });
})(window.App);

(function (App) {
    App.Collections.sitesDropDownCollection = new App.Collections.Site();
    App.Collections.siteYearsDropDownCollection = new App.Collections.SiteYear();
    App.PageableCollections.projectCollection = new App.PageableCollections.Project();
    App.Collections.allProjectsCollection = new App.Collections.Project();
    App.Collections.statusManagementCollection = new App.Collections.StatusManagement();
    App.PageableCollections.siteVolunteersRoleCollection = new App.PageableCollections.SiteVolunteerRoles();

    // project tabs
    App.PageableCollections.projectLeadsCollection = new App.PageableCollections.ProjectLead();
    App.PageableCollections.projectBudgetsCollection = new App.PageableCollections.Budget();
    App.PageableCollections.projectContactsCollection = new App.PageableCollections.Contact();
    App.PageableCollections.projectVolunteersCollection = new App.PageableCollections.ProjectVolunteer();

    // @App.Collections.projectVolunteersCollection- This is for the drop down in the select new project lead form
    App.Collections.projectVolunteersCollection = new App.Collections.Volunteer();
    // @App.Collections.contactsManagementCollection- This is for the drop down in the select new project contact form
    App.Collections.contactsManagementCollection = new App.Collections.Contact();

    // This is for the volunteer management view
    App.PageableCollections.volunteersManagementCollection = new App.PageableCollections.Volunteer();
    App.PageableCollections.contactsManagementCollection = new App.PageableCollections.Contact();
    App.Collections.annualBudgetsManagementCollection = new App.Collections.Budget();
    // @App.PageableCollections.backGridFiltersPanelCollection - filter for volunteer collection
    App.PageableCollections.backGridFiltersPanelCollection = App.PageableCollections.volunteersManagementCollection;
    // This is for the project volunteers tab
    App.PageableCollections.unassignedProjectVolunteersCollection = new App.PageableCollections.ProjectVolunteer();

    // @App.Collections.reportsManagementCollection- This is for the reports management
    App.Collections.reportsManagementCollection = new App.Collections.Report();
    App.Collections.projectsDropDownCollection = new App.Collections.ProjectsDropDown();
})(window.App);
