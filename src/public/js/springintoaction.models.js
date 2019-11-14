
(function (App) {
    App.Models.DashboardPanelLinksListItem = Backbone.Model.extend({
        defaults: {
            'linkText': '',
            'badgeCount': '',
            'route': ''
        }
    });

    App.Models.DashboardPanel = Backbone.Model.extend({
        defaults: {
            'panelBgColor': '',
            'panelFAIconClass': '',
            'panelName':'',
            'panelDescription':'',
            'panelLinksListView':{}
        }
    });

})(window.App);

(function (App) {
    App.Models.SiteSetting = Backbone.Model.extend({
        url: '/admin/site_setting',
        idAttribute: "SiteSettingID",
        defaults: {
            'setting':'',
            'value':'',
            'description':'',
            'message':'',
            'sunrise':'',
            'sunset':''
        }
    });
})(window.App);

(function (App) {
    App.Models.ProjectAttachment = Backbone.Model.extend({
        url: '/admin/project_attachment',
        idAttribute: "ProjectAttachmentID",
        defaults: {
            'ProjectID': '',
            'AttachmentPath': ''
        }
    });
})(window.App);

(function (App) {
    App.Models.AnnualBudget = Backbone.Model.extend({
        idAttribute: "AnnualBudgetID",
        url: '/admin/annualbudget',
        defaults: {
            'BudgetAmount': 0.00,
            'Year': ''
        },
    });
})(window.App);

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
            let options = _.pairs(App.Vars.selectOptions['BudgetStatusOptions']);
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        },
        getSourceOptions: function (bReturnHtml) {
            let options = _.pairs(App.Vars.selectOptions['BudgetSourceOptions']);
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
        idAttribute: "ProjectContactsID",
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
        }, getPermitRequiredOptions: function (bReturnHtml, defaultOption) {
            let options = _.pairs(App.Vars.selectOptions['PermitRequiredOptions']);

            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    let selected = !_.isUndefined(defaultOption) && defaultOption === value[0] ? 'selected' : '';
                    return "<option " + selected + " value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        }, getWhenWillProjectBeCompletedOptions: function (bReturnHtml, defaultOption) {
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
        idAttribute: "SiteStatusID",
        url: '/admin/sitestatus',
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
    App.Models.ProjectVolunteerRole = Backbone.Model.extend({
        url: '/admin/project_lead',
        idAttribute: "ProjectVolunteerRoleID",
        defaults: {
            'ProjectID': '',
            'ProjectVolunteerID': '',
            'VolunteerID': '',
            'ProjectRoleID': '',
            'Comments': '',
            'Status': '',
            'ProjectVolunteerRoleStatus':''
        }
    });
})(window.App);

(function (App) {
    App.Models.SiteRole = Backbone.Model.extend({
        url: '/admin/site_role',
        idAttribute: "SiteRoleID",
        defaults: {
            'Role': '',
            'DisplaySequence': ''
        }
    });
})(window.App);

(function (App) {
    App.Models.SiteVolunteer = Backbone.Model.extend({
        url: '/admin/site_volunteer',
        idAttribute: "SiteVolunteerID",
        defaults: {
            'VolunteerID': '',
            'SiteStatusID': ''
        },
        getRoleOptions: function (bReturnHtml) {
            let options = _.pairs(App.Vars.selectOptions['site_roles']);
            if (bReturnHtml) {
                return _.map(options, function (value) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        }
    });
    App.Models.SiteVolunteerRole = Backbone.Model.extend({
        url: '/admin/site_volunteer_role',
        idAttribute: "SiteVolunteerRoleID",
        defaults: {
            'VolunteerID': '',
            'SiteStatusID': '',
            'SiteRoleID': '',
            'SiteVolunteerID': '',
            'Comments': '',
            'Status': '',
            'SiteVolunteerRoleStatus': '',
            'LastName': '',
            'FirstName': '',
            'MobilePhoneNumber': '',
            'HomePhoneNumber': '',
            'Email':'',
            'Active':''
        },
        getRoleOptions: function (bReturnHtml) {
            let options = _.pairs(App.Vars.selectOptions['site_roles']);
            if (bReturnHtml) {
                return _.map(options, function (value) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        }
    });
})(window.App);

(function (App) {
    App.Models.Report = Backbone.Model.extend({
        idAttribute: "id",
        url: '/admin/report',
        defaults: {
            'ReportName' : '',
            'ReportUrl':''
        },
    });

    App.Models.ProjectDropDown = Backbone.Model.extend({
        idAttribute: "ProjectID",
        url: '/admin/project',
        defaults: {
            'ProjectID': '',
            'SequenceNumber': 1
        }
    });
})(window.App);

(function (App) {
    App.Models.StatusManagement = Backbone.Model.extend({
        url: '/admin/status_management',
        idAttribute: "SiteID",
        defaults: {

        }
    });
})(window.App);

(function (App) {
    App.Models.Option = Backbone.Model.extend({
        idAttribute: "id",
        url: '/admin/option',
        defaults: {
            'option_label': '',
            'DisplaySequence': ''
        },
    });
})(window.App);

(function (App) {
    App.Models.Attributes = Backbone.Model.extend({
        idAttribute: "id",
        url: '/admin/attributes',
        defaults: {
            'attribute_code':'',
            'default_value':'',
            'input':'text',
            'options_source':'',
            'label':'',
            'table':'',
            'DisplaySequence':''
        },
    });
})(window.App);

(function (App) {
    App.Models.ProjectAttributes = Backbone.Model.extend({
        idAttribute: "id",
        url: '/admin/project_attributes',
        defaults: {
            'attribute_id':'',
            'workflow_id':'',
            'project_skill_needed_option_id':''
        },
    });
})(window.App);

(function (App) {
    App.Models.Workflow = Backbone.Model.extend({
        idAttribute: "id",
        url: '/admin/workflow',
        defaults: {
            'label':'',
            'workflow_code':'',
            'DisplaySequence':''
        }
    });
})(window.App);

(function (App) {
    App.Models.ProjectScope = Backbone.Model.extend({
        url: '/admin/project_scope',
        idAttribute: "ProjectID",
        defaults: {

        }
    });
})(window.App);

(function (App) {
    App.Models.siteSettingModel = new App.Models.SiteSetting();
    App.Models.siteModel = new App.Models.Site();
    App.Models.siteStatusModel = new App.Models.SiteStatus();
    App.Models.projectModel = new App.Models.Project();
    App.Models.siteVolunteerModel = new App.Models.SiteVolunteer();
    App.Models.siteVolunteerRoleModel = new App.Models.SiteVolunteerRole();

    /**
     * Models for the contacts and volunteer management
     */
    App.Models.contactModel = new App.Models.Contact();
    App.Models.volunteerModel = new App.Models.Volunteer();
    /**
     * For the initial site data load, the project tab models are set to the first item in the array
     */
    App.Models.projectContactModel = new App.Models.ProjectContact();
    App.Models.projectLeadModel = new App.Models.ProjectVolunteerRole();
    App.Models.projectBudgetModel = new App.Models.Budget();
    App.Models.projectVolunteerModel = new App.Models.ProjectVolunteer();
    App.Models.projectVolunteerRoleModel = new App.Models.ProjectVolunteerRole();
    App.Models.annualBudgetModel = new App.Models.AnnualBudget();
    App.Models.reportModel = new App.Models.Report();
    App.Models.statusManagementModel = new App.Models.StatusManagement();
    App.Models.optionModel = new App.Models.Option();
    App.Models.attributesModel = new App.Models.Attributes();
    App.Models.projectScopeModel = new App.Models.ProjectScope();
    App.Models.projectAttributesModel = new App.Models.ProjectAttributes();
    App.Models.workflowModel = new App.Models.Workflow();
})(window.App);
