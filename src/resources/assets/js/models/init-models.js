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
