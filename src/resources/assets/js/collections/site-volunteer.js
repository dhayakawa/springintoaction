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
