(function (App) {
    App.Collections.ProjectAttachment = Backbone.Collection.extend({
        model: App.Models.ProjectAttachment
    });

    App.PageableCollections.ProjectAttachment = Backbone.PageableCollection.extend({
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
            name: "ProjectID",
            label: "Project ID",
            cell: "integer",
            resizeable: true,
            orderable: true,
            editable: false,
            width: "50"
        },
        {
            name: "AttachmentPath",
            label: "Attachment URL",
            cell: "uri",
            resizeable: true,
            orderable: true,
            width: "*"
        }
    ];
    _log('App.Vars.CollectionsGroup', 'App.Vars.ProjectAttachmentsBackgridColumnDefinitions:', App.Vars.ProjectAttachmentsBackgridColumnDefinitions);
})(window.App);

(function (App) {
    App.Collections.Budget = Backbone.Collection.extend({
        model: App.Models.Budget
    });

    App.PageableCollections.Budget = Backbone.PageableCollection.extend({
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
            openOnEnter: false
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
            resizeable: true,
            orderable: true,
            width: "175"
        },
        {
            name: "BudgetAmount",
            label: "BudgetAmount",
            cell: "number",
            resizeable: true,
            orderable: true,
            width: "30"
        },
        {
            name: "Status",
            label: "Status",
            cell: BudgetStatusCell,
            resizeable: true,
            orderable: true,
            width: "50"
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
            name: "ProjectID",
            label: "Project",
            cell: "integer",
            resizeable: true,
            orderable: true,
            width: "150"
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
        },
        {
            name: "SiteID",
            label: "Site",
            cell: SitesCell,
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
            width: "150",
            filterType: "string"
        },
        {
            name: "FirstName",
            label: "FirstName",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "150",
            filterType: "string"
        },
        {
            name: "MobilePhoneNumber",
            label: "MobilePhoneNumber",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "150",
            filterType: "string"
        },
        {
            name: "HomePhoneNumber",
            label: "HomePhoneNumber",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "150",
            filterType: "string"
        },
        {
            name: "Email",
            label: "Email",
            cell: "email",
            resizeable: true,
            orderable: true,
            width: "175",
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
            cell: App.Vars.TextareaCell,
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
            cell: App.Vars.TextareaCell,
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
            cell: App.Vars.yesNoCell,
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
            name: "PreferredSiteID",
            label: "PreferredSiteID",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "250"
        }
    ];
    let displayOrderCnt = 1;
    _.each(App.Vars.volunteersBackgridColumnDefinitions, function (value, key) {
        value.displayOrder = displayOrderCnt++;
    });
    App.Vars.volunteerLeadsBackgridColumnDefinitions = [];
    let sharedCells = ['', 'VolunteerID', 'Active', 'Status', 'LastName', 'FirstName', 'MobilePhoneNumber', 'HomePhoneNumber', 'Email', 'Comments'];
    _.each(sharedCells, function (value, key) {
        let cellDefinition = _.findWhere(App.Vars.volunteersBackgridColumnDefinitions, {name: value});
        cellDefinition = _.clone(cellDefinition);
        if (cellDefinition.name === 'Status') {
            cellDefinition.name = 'ProjectVolunteerRoleStatus';
        }
        if (cellDefinition.name === 'Active' || cellDefinition.name === 'FirstName' || cellDefinition.name === 'LastName' || cellDefinition.name === 'MobilePhoneNumber' || cellDefinition.name === 'HomePhoneNumber' || cellDefinition.name === 'Email') {
            cellDefinition.editable = false;
        }
        App.Vars.volunteerLeadsBackgridColumnDefinitions.push(cellDefinition);
        if (cellDefinition.name === 'Active') {
            App.Vars.volunteerLeadsBackgridColumnDefinitions.push({
                name: "ProjectRoleID",
                label: "Project Lead Role",
                cell: VolunteerRoleCell,
                resizeable: true,
                orderable: true,
                width: "250",
                filterType: "string",
                displayOrder: value.displayOrder++
            });
        }
    });


    _log('App.Vars.CollectionsGroup', 'App.Vars.volunteersBackgridColumnDefinitions:', App.Vars.volunteersBackgridColumnDefinitions);
    _log('App.Vars.CollectionsGroup', 'App.Vars.volunteerLeadsBackgridColumnDefinitions:', App.Vars.volunteerLeadsBackgridColumnDefinitions);
})(window.App);

(function (App) {
    App.PageableCollections.ProjectVolunteer = Backbone.PageableCollection.extend({
        model: App.Models.ProjectVolunteer,
        state: {
            pageSize: 10
        },
        mode: "client" // page entirely on the client side
    });
})(window.App);

(function (App) {
    App.PageableCollections.SiteVolunteer = Backbone.PageableCollection.extend({
        model: App.Models.SiteVolunteer,
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
            values: App.Models.siteVolunteerModel.getRoleOptions(false)
        }],
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : _.map(formattedValue, function (v) {
                    return parseInt(v);
                })
            }
        })

    });
    App.Vars.siteVolunteersBackgridColumnDefinitions = [];

    _.each(App.Vars.volunteerLeadsBackgridColumnDefinitions, function (value, key) {

        let cellDefinition = _.clone(value);

        if (cellDefinition.name === 'ProjectVolunteerRoleStatus') {
            cellDefinition.name = 'SiteVolunteerRoleStatus';
        } else if (cellDefinition.name === 'ProjectRoleID') {
            cellDefinition.name = 'SiteRoleID';
            cellDefinition.label = "Site Volunteer Role";
            cellDefinition.cell= SiteVolunteerRoleCell;
        }
        App.Vars.siteVolunteersBackgridColumnDefinitions.push(cellDefinition);

    });
    _log('App.Vars.CollectionsGroup', 'App.Vars.siteVolunteersBackgridColumnDefinitions:', App.Vars.siteVolunteersBackgridColumnDefinitions);

})(window.App);
