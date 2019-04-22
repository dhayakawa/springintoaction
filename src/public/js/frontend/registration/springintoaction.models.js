(function (App) {
    App.Models.ProjectFilter = Backbone.Model.extend({
        idAttribute: "ProjectFilterID",
        url: '/registration/project',
        defaults: {
            'filterIcon':'',
            'filterName':'',
            'filterId':'',
            'filterLabel':'',
            'FilterIsChecked':'',
            'Field':'',
            'FieldID':''
        }
    });
    App.Models.Project = Backbone.Model.extend({
        idAttribute: "ProjectID",
        url: '/registration/project/filter',
        defaults: {
            'SiteStatusID': '',
            'SiteName': '',
            'ProjectDescription': '',
            'ChildFriendly': '',
            'PrimarySkillNeeded': '',
            'VolunteersNeededEst':'',
            'VolunteersAssigned': '',
            'PeopleNeeded': '',
        },
        getVolunteersNeeded: function() {
            let needed = this.get('PeopleNeeded');
            // Just in case it is a negative number
            return needed > 0 ? needed : 0;
        },
        getSkillsNeededList: function(){
            let self = this;
            let skillsNeededList = '';
            let options = _.pairs(App.Vars.selectOptions['ProjectSkillNeededOptions']);
            let generalOptionID = App.Vars.selectOptions['ProjectSkillNeededOptions']['General'];

            let filtered = [];
            _.each(options, function (value,key) {
                let regex = new RegExp(value[1]);
                let primarySkillNeeded = self.get('PrimarySkillNeeded');
                if (primarySkillNeeded === ''){
                    primarySkillNeeded = generalOptionID.toString();
                }
                if (primarySkillNeeded.match(regex)) {
                    filtered.push(value[0]);
                }
            });
            let icons = {
                'General':'<i title="General" data-toggle="tooltip" data-placement="top" class="skills-icon general-skill-icon"></i>',
                'Painting':'<i title="Painting" data-toggle="tooltip" data-placement="top" class="skills-icon painting-icon"></i>',
                'General Carpentry':'<i title="General Carpentry" data-toggle="tooltip" data-placement="top" class="skills-icon general-carpentry-icon"></i>',
                'Furniture Making / Woodworking':'<i title="Furniture Making / Woodworking" data-toggle="tooltip" data-placement="top" class="skills-icon finish-carpentry-icon"></i>',
                'Landscaping':'<i title="Landscaping" data-toggle="tooltip" data-placement="top" class="skills-icon landscaping-icon"></i>',
                'Construction':'<i title="Construction" data-toggle="tooltip" data-placement="top" class="skills-icon construction-icon"></i>',
                'Cabinetry':'<i title="Cabinetry" data-toggle="tooltip" data-placement="top" class="skills-icon cabinetry-icon"></i>',
                'Cleaning': '<i title="Cleaning" data-toggle="tooltip" data-placement="top" class="skills-icon cleaning-icon"></i>'
            };
            let filteredCnt = filtered.length;
            _.each(filtered,  function (value, key) {
                //let lineBreak = key < (filteredCnt-1) ? '<br>' : '';
                skillsNeededList +=  icons[value] ;
            });
            return skillsNeededList;
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


(function (App) {
    App.Models.ProjectVolunteer = Backbone.Model.extend({
        url: '/admin/project_volunteer',
        idAttribute: "ProjectVolunteerRoleID",
        defaults: {
            'ProjectID': '',
            'ProjectVolunteerID': '',
            'VolunteerID': '',
            'ProjectRoleID': '',
            'Comments': '',
            'Status': '',
            'ProjectVolunteerRoleStatus': ''
        }
    });
})(window.App);

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

(function (App) {
    App.Models.projectModel = new App.Models.Project();
    App.Models.volunteerModel = new App.Models.Volunteer();
    App.Models.projectFilterModel = new App.Models.ProjectFilter();


})(window.App);
