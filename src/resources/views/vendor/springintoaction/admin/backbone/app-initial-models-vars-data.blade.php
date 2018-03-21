(function (App) {


/**
     * Bootstap Backbone models & collections for initial page load
     */
    App.Vars.appInitialData = @json($appInitialData);


    App.Models.siteModel = new App.Models.Site(@json($appInitialData['site']));
    App.Models.siteStatusModel = new App.Models.SiteStatus(@json($appInitialData['siteStatus']));
    App.Models.projectModel = new App.Models.Project(@json($appInitialData['project']));
    /**
     * Models for the contacts and volunteer management
     */
    App.Models.contactModel = new App.Models.Contact(@json(current($appInitialData['contacts'])));
    App.Models.volunteerModel = new App.Models.Volunteer(@json(current($appInitialData['project_volunteers'])));
    /**
     * For the initial site data load, the project tab models are set to the first item in the array
     */
    App.Models.projectContactModel = new App.Models.ProjectContact(@json(current($appInitialData['project_contacts'])));
    App.Models.projectLeadModel = new App.Models.Volunteer(@json(current($appInitialData['project_leads'])));
    App.Models.projectBudgetModel = new App.Models.Budget(@json(current($appInitialData['project_budgets'])));
    App.Models.projectVolunteerModel = new App.Models.ProjectVolunteer();
    App.Models.projectVolunteerRoleModel = new App.Models.ProjectVolunteerRole();
    App.Models.annualBudgetModel = new App.Models.AnnualBudget(@json(current($appInitialData['annual_budget'])));
    /**
     * Global var defining the project tab models
     *
     */
    App.Vars.currentTabModels =
        {
            project_lead: App.Models.projectLeadModel,
            project_budget: App.Models.projectBudgetModel,
            project_contact: App.Models.projectContactModel,
            project_volunteer: App.Models.volunteerModel
        }
    ;

    /**
     * Global grid select2 cell definitions used by more than one grid collection
     */
    App.Vars.yesNoCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [
            {
                values: App.Models.projectModel.getYesNoOptions(false)
            }],
        // since the value obtained from the underlying `select` element will always be a string,
        // you'll need to provide a `toRaw` formatting method to convert the string back to a
        // type suitable for your model, which is an integer in this case.
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : _.map(formattedValue, function (v) {
                    return parseInt(v);
                })
            }
        })
    });

    App.Vars.budgetSourceCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple: true
        },
        optionValues: [{
            values: App.Models.projectBudgetModel.getSourceOptions(false)
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

    App.Vars.sendCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getSendOptions(false)
        }]
    });

    App.Vars.VolunteerStatusCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getStatusOptions(false)
        }]

    });
})(window.App);
