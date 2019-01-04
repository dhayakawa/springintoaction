(function (App) {
    App.Models.Volunteer = Backbone.Model.extend({
        idAttribute: "VolunteerID",
        url: '/admin/volunteer',
        defaults: {
            'Active': 1,
            'LastName': '',
            'FirstName': '',
            'MobilePhoneNumber': '',
            'HomePhoneNumber': '',
            'Email': '',
            'PrimarySkill': '',
            'Status': '',
            'Comments': '',
            'ProjectRoleID': App.Vars.workerRoleID,
            'PreferredSiteID': '',
            'DateSubmitted': '',
            'DateModified': '',
            'ResponseID': '',
            'ConfirmationCode': '',
            'FullName': '',
            'IndividualID': '',
            'EnteredFirstName': '',
            'EnteredLastName': '',
            'ContactPhone': '',
            'AgeRange': '',
            'LG': '',
            'Family': '',
            'CFE': '',
            'CFP': '',
            'Painting': '',
            'Landscaping': '',
            'Construction': '',
            'Electrical': '',
            'CabinetryFinishWork': '',
            'Plumbing': '',
            'NotesOnYourSkillAssessment': '',
            'PhysicalRestrictions': '',
            'SchoolPreference': '',
            'Equipment': '',
            'TeamLeaderWilling': '',
            'Church': '',
            'AssignmentInformationSendStatus': ''
        },
        getStatusOptions: function (bReturnHtml) {
            let options = _.pairs(App.Vars.selectOptions['VolunteerStatusOptions']);
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        },
        getAgeRangeOptions: function (bReturnHtml) {
            let options = _.pairs(App.Vars.selectOptions['VolunteerAgeRangeOptions']);
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        },
        getSchoolOptions: function (bReturnHtml) {
            let options = [
                ['', ''],
                ['PJ Jacobs', 'PJ Jacobs'],
                ['Roosevelt', 'Roosevelt'],
                ['McKinley', 'McKinley'],
                ['Kennedy', 'Kennedy'],
                ['Madison', 'Madison'],
                ['SPASH', 'SPASH'],
                ['Jefferson', 'Jefferson'],
                ['McDill', 'McDill'],
                ['Bannach', 'Bannach'],
                ['Washington', 'Washington'],
                ['Charles F. Fernandez Center', 'Charles F. Fernandez Center'],
                ['Ben Franklin', 'Ben Franklin'],
                ['Plover-Whiting', 'Plover-Whiting'],
                ['Boston School Forest', 'Boston School Forest'],
                ['Point of Discovery', 'Point of Discovery']
            ];
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        },
        getRoleOptions: function (bReturnHtml) {
            let options = _.pairs(App.Vars.selectOptions['project_roles']);
            if (bReturnHtml) {
                return _.map(options, function (value) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {

                return options;
            }
        },
        getPrimarySkillOptions: function (bReturnHtml) {
            let options = _.pairs(App.Vars.selectOptions['VolunteerPrimarySkillOptions']);

            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        },
        getSkillLevelOptions: function (bReturnHtml) {
            let options = _.pairs(App.Vars.selectOptions['VolunteerSkillLevelOptions']);

            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        },
        getSendOptions: function (bReturnHtml) {
            let options = _.pairs(App.Vars.selectOptions['SendStatusOptions']);
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        }
    });
})(window.App);
