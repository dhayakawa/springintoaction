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
        getStatusOptions: function (bReturnHtml) {
            let options = [
                ['',''],
                ['DN-District', 'DN-District'],
                ['DN-Woodlands', 'DN-Woodlands'],
                ['NA-District', 'NA-District'],
                ['NA-Woodlands', 'NA-Woodlands'],
                ['Pending', 'Pending'],
                ['Approved', 'Approved'],
                ['Cancelled', 'Cancelled']
            ];
            if (bReturnHtml) {
                options.shift();
                return _.map(options, function (value, key) {
                    return "<option value='" + value[0] + "'>" + value[1] + "</option>";
                })
            } else {
                return options;
            }
        },
        getSkillsNeededOptions: function (bReturnHtml) {
            let options = [
                ['Construction', 'Construction'],
                ['Painting', 'Painting'],
                ['Landscaping', 'Landscaping'],
                ['Finish Carpentry', 'Finish Carpentry'],
                ['General Carpentry', 'General Carpentry'],
                ['Cabinetry', 'Cabinetry']
            ];
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[0] + "'>" + value[1] + "</option>";
                })
            } else {
                return options;
            }
        },
        getSendOptions: function (bReturnHtml) {
            let options = [
                ['Not Ready', 'Not Ready'],
                ['Ready', 'Ready'],
                ['Sent', 'Sent']
            ];
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[0] + "'>" + value[1] + "</option>";
                })
            } else {
                return options;
            }
        },
        getYesNoOptions: function (bReturnHtml) {
            bReturnHtml = !_.isBoolean(bReturnHtml) ? false : bReturnHtml;
            let options = [
                ['No', 0],
                ['Yes', 1]
            ];
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                })
            } else {
                return options;
            }
        }
    });
})(window.App);

