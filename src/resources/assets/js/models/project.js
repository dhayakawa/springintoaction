(function (App) {
    App.Models.Project = Backbone.Model.extend({
        idAttribute: "ProjectID",
        url: '/admin/project',
        defaults: {
            'SiteStatusID': '',
            'Active': '',
            'SequenceNumber': '',
            'OriginalRequest': '',
            'ProjectDescription': '',
            'Comments': '',
            'BudgetSources': '',
            'ChildFriendly': '',
            'PrimarySkillNeeded': '',
            'VolunteersNeededEst': '',
            'VolunteersAssigned': '',
            'Status': '',
            'StatusReason': '',
            'MaterialsNeeded': '',
            'EstimatedCost': '',
            'ActualCost': '',
            'BudgetAvailableForPC': '',
            'VolunteersLastYear': '',
            'NeedsToBeStartedEarly': '',
            'PCSeeBeforeSIA': '',
            'SpecialEquipmentNeeded': '',
            'PermitsOrApprovalsNeeded': '',
            'PrepWorkRequiredBeforeSIA': '',
            'SetupDayInstructions': '',
            'SIADayInstructions': '',
            'Attachments': '',
            'Area': '',
            'PaintOrBarkEstimate': '',
            'PaintAlreadyOnHand': '',
            'PaintOrdered': '',
            'CostEstimateDone': '',
            'MaterialListDone': '',
            'BudgetAllocationDone': '',
            'VolunteerAllocationDone': '',
            'NeedSIATShirtsForPC': '',
            'ProjectSend': '',
            'FinalCompletionStatus': '',
            'FinalCompletionAssessment': ''
        },
        getStatusOptions: function (bReturnHtml, defaultOption) {
            let options = _.pairs(App.Vars.selectOptions['ProjectStatusOptions']);

            if (bReturnHtml) {
                options.shift();
                return _.map(options, function (value, key) {
                    let selected = !_.isUndefined(defaultOption) && defaultOption === value[0] ? 'selected' : '';
                    return "<option " + selected +" value='" + value[1] + "'>" + value[0] + "</option>";
                })
            } else {
                return options;
            }
        },
        getSkillsNeededOptions: function (bReturnHtml, defaultOption) {
            let options = _.pairs(App.Vars.selectOptions['ProjectSkillNeededOptions']);

            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    let selected = !_.isUndefined(defaultOption) && defaultOption === value[0] ? 'selected' : '';
                    return "<option " + selected +" value='" + value[1] + "'>" + value[0] + "</option>";
                })
            } else {
                return options;
            }
        },
        getSendOptions: function (bReturnHtml, defaultOption) {
            let options = _.pairs(App.Vars.selectOptions['SendStatusOptions']);
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    let selected = !_.isUndefined(defaultOption) && defaultOption === value[0] ? 'selected' : '';
                    return "<option " + selected +" value='" + value[1] + "'>" + value[0] + "</option>";
                })
            } else {
                return options;
            }
        },
        getYesNoOptions: function (bReturnHtml, defaultOption) {
            bReturnHtml = !_.isBoolean(bReturnHtml) ? false : bReturnHtml;
            let options = [
                ['No', 0],
                ['Yes', 1]
            ];
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    let selected = !_.isUndefined(defaultOption) && defaultOption === value[0] ? 'selected' : '';
                    return "<option " + selected +" value='" + value[1] + "'>" + value[0] + "</option>";
                })
            } else {
                return options;
            }
        }
    });
})(window.App);

