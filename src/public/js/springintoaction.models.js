(function (App) {
    App.Models.Budget = Backbone.Model.extend({
        idAttribute: "BudgetID",
        url: '/admin/project_budget',
        defaults: {
            'ProjectID': '',
            'BudgetSource': '',
            'BudgetAmount': '',
            'Status': '',
            'Comments': ''
        },
        getStatusOptions: function (bReturnHtml) {
            let options = [
                ['Proposed', 'Proposed'],
                ['Approved', 'Approved'],
                ['Paid', 'Paid'],
                ['Rejected', 'Rejected']
            ];
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[0] + "'>" + value[1] + "</option>";
                })
            } else {
                return options;
            }
        },
        getSourceOptions: function (bReturnHtml) {
            let options = [
                ['',''],
                ['PTO', 'PTO'],
                ['School', 'School'],
                ['School (OLC funds)', 'School (OLC funds)'],
                ['District', 'District'],
                ['Woodlands', 'Woodlands'],
                ['Grant', 'Grant'],
                ['CF Grant', 'CF Grant'],
                ['Thrivent', 'Thrivent'],
                ['Unknown', 'Unknown']
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

(function (App) {
    App.Models.Contact = Backbone.Model.extend({
        idAttribute: "ContactID",
        url: '/admin/contact',
        defaults: {
            'SiteID': '',
            'Active': '',
            'FirstName': '',
            'LastName': '',
            'Title': '',
            'Email': '',
            'Phone': '',
            'ContactType': ''
        }
    });

})(window.App);

(function (App) {
    App.Models.ProjectContact = Backbone.Model.extend({
        idAttribute: "ProjectContactID",
        url: '/admin/project_contact',
        defaults: {
            'ProjectID': '',
            'ContactID': ''
        }
    });
})(window.App);

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


(function (App) {
    App.Models.ProjectRole = Backbone.Model.extend({
        url: '/admin/project_role',
        idAttribute: "ProjectRoleID",
        defaults: {
            'Role': '',
            'DisplaySequence': ''
        }
    });
})(window.App);

(function (App) {
    App.Models.ProjectVolunteer = Backbone.Model.extend({
        url: '/admin/project_volunteer',
        idAttribute: "ProjectVolunteerID",
        defaults: {
            'VolunteerID': '',
            'ProjectID': ''
        }
    });
})(window.App);

(function (App) {
    App.Models.Site = Backbone.Model.extend({
        idAttribute: "SiteID",
        url: '/admin/site',
        defaults: {
            'SiteName': '',
            'EquipmentLocation': '',
            'DebrisLocation': '',
            'Active': '1',
        },
        validate: function (attributes) {
            if (attributes.SiteName.length === 0) {
                return 'Site Name is required.';
            }
        },


    });

    /**
     * This is the site years drop down
     */
    App.Models.SiteYear = Backbone.Model.extend({
        defaults: {
            'SiteID': '',
            'Year': new Date('Y')
        }
    });

})(window.App);

(function (App) {

    App.Models.SiteStatus = Backbone.Model.extend({
        idAttribute: "SiteStatusID",
        url: '/admin/sitestatus',
        defaults: {
            'SiteID': '',
            'Year': '',
            'ProjectDescriptionComplete': '',
            'BudgetEstimationComplete': '',
            'VolunteerEstimationComplete': '',
            'VolunteerAssignmentComplete': '',
            'BudgetActualComplete': '',
            'EstimationComments': ''
        },
        getData: function () {
            return this.get('SiteID') + 'is TBD.';
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

(function (App) {
    App.Models.ProjectVolunteerRole = Backbone.Model.extend({
        url: '/admin/project_lead',
        idAttribute: "ProjectVolunteerRoleID",
        defaults: {
            'ProjectID': '',
            'VolunteerID': '',
            'ProjectRoleID': '',
            'Comments': '',
            'Status': ''
        }
    });
})(window.App);
