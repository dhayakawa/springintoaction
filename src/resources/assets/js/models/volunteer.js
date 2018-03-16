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
            let options = [
                ['Candidate','Candidate'],
                ['Proposed', 'Proposed'],
                ['Undecided', 'Undecided'],
                ['Agreed', 'Agreed'],
                ['Declined', 'Declined']
            ];
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[0] + "'>" + value[1] + "</option>";
                })
            } else {
                return options;
            }
        },
        getAgeRangeOptions: function (bReturnHtml) {
            let options = [
                ['Child under 1', 'Child under 1'],
                ['Child (1-11)', 'Child (1-11)'],
                ['Youth (12-17)', 'Youth (12-17)'],
                ['Adult (18+)', 'Adult (18+)']
            ];
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[0] + "'>" + value[1] + "</option>";
                })
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
                    return "<option value='" + value[0] + "'>" + value[1] + "</option>";
                })
            } else {
                return options;
            }
        },
        getRoleOptions: function (bReturnHtml) {
            let options = [
                ['Liaison', 7],
                ['Scout', 6],
                ['Estimator', 2],
                ['Site Coordinator', 68],
                ['Project Coordinator', 3],
                ['Team Leader', 25],
                ['Worker', App.Vars.workerRoleID]
            ];
            if (bReturnHtml) {
                return _.map(options, function (value) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                })
            } else {
                return options;
            }
        },
        getPrimarySkillOptions: function (bReturnHtml) {
            let options = [
                ['', ''],
                ['Painting', 'Painting'],
                ['Landscaping', 'Landscaping'],
                ['Construction', 'Construction'],
                ['Electrical', 'Electrical'],
                ['Cabinetry Finish Work', 'CabinetryFinishWork'],
                ['Plumbing', 'Plumbing']
            ];
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[0] + "'>" + value[1] + "</option>";
                })
            } else {
                return options;
            }
        },
        getSkillLevelOptions: function (bReturnHtml) {
            let options = [
                ['',''],
                ['Unskilled', 'Unskilled'],
                ['Fair', 'Fair'],
                ['Good', 'Good'],
                ['Excellent', 'Excellent']
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
        }
    });
})(window.App);
