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
            'VolunteersNeededEstimate': '',
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
                    return "<option " + selected + " value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        },
        getPermitRequiredStatusOptions: function (bReturnHtml, defaultOption) {
            let options = _.pairs(App.Vars.selectOptions['PermitRequiredStatusOptions']);

            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    let selected = !_.isUndefined(defaultOption) && defaultOption === value[0] ? 'selected' : '';
                    return "<option " + selected + " value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        },
        getPermitRequiredOptions: function (bReturnHtml, defaultOption) {
            let options = _.pairs(App.Vars.selectOptions['PermitRequiredOptions']);

            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    let selected = !_.isUndefined(defaultOption) && defaultOption === value[0] ? 'selected' : '';
                    return "<option " + selected + " value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        },
        getWhenWillProjectBeCompletedOptions: function (bReturnHtml, defaultOption) {
            let options = _.pairs(App.Vars.selectOptions['WhenWillProjectBeCompletedOptions']);

            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    let selected = !_.isUndefined(defaultOption) && defaultOption === value[0] ? 'selected' : '';
                    return "<option " + selected + " value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        },
        getSkillsNeededOptions: function (bReturnHtml, defaultOption) {
            let options = _.pairs(App.Vars.selectOptions['ProjectSkillNeededOptions']);

            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    let selected = !_.isUndefined(defaultOption) && defaultOption === value[0] ? 'selected' : '';
                    return "<option " + selected + " value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        },
        getSkillsNeededCheckboxList: function (bReturnHtml, defaultOption) {
            let options = _.pairs(App.Vars.selectOptions['ProjectSkillNeededOptions']);

            if (bReturnHtml) {
                let defaultOptions = !_.isUndefined(defaultOption) ? defaultOption.split(/,/) : [];
                return _.map(options, function (value, key) {
                    let checked = _.indexOf(defaultOptions, value[0]) !== -1 ? 'checked' : '';
                    let id = 'primary_skill_needed_' + value[1];
                    return "<label class='skills-needed-checkbox-label checkbox-inline' for='"+ id+"'><input type='checkbox' " + checked + " id='"+id+"' name='primary_skill_needed[]' value='" + value[1] + "'"  + "/>" + value[0]+'</label>';
                }).join('');
            } else {
                return options;
            }
        },
        getSendOptions: function (bReturnHtml, defaultOption) {
            let options = _.pairs(App.Vars.selectOptions['SendStatusOptions']);
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    let selected = !_.isUndefined(defaultOption) && defaultOption === value[0] ? 'selected' : '';
                    return "<option " + selected + " value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
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
                    return "<option " + selected + " value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        }
    });
})(window.App);

