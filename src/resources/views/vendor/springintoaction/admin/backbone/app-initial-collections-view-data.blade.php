(function (App) {
    App.Collections.siteSettingsCollection = new App.Collections.SiteSetting(@json($appInitialData['site_settings']));
    App.Collections.statusManagementCollection = new App.Collections.StatusManagement(@json($appInitialData['status_management_records']));
    App.Collections.sitesDropDownCollection = new App.Collections.Site(@json($appInitialData['sites']));
    App.Collections.siteYearsDropDownCollection = new App.Collections.SiteYear(@json($appInitialData['site_years']));
    App.Collections.projectsDropDownCollection = new App.Collections.ProjectsDropDown(@json($appInitialData['select_options']['projects_dropdown']));
    App.PageableCollections.projectCollection = new App.PageableCollections.Project(@json($appInitialData['projects']));
    App.Collections.allProjectsCollection = new App.Collections.Project(@json($appInitialData['all_projects']));
    App.PageableCollections.siteVolunteersRoleCollection= new App.PageableCollections.SiteVolunteerRoles(@json($appInitialData['site_volunteers']));
    // project tabs
    App.PageableCollections.projectLeadsCollection = new App.PageableCollections.Volunteer(@json($appInitialData['project_leads']));
    App.PageableCollections.projectBudgetsCollection = new App.PageableCollections.Budget(@json($appInitialData['project_budgets']));
    App.PageableCollections.projectContactsCollection = new App.PageableCollections.Contact(@json($appInitialData['project_contacts']));
    App.PageableCollections.projectVolunteersCollection = new App.PageableCollections.Volunteer(@json($appInitialData['project_volunteers']));
    App.PageableCollections.projectAttachmentsCollection = new App.PageableCollections.ProjectAttachment(@json($appInitialData['project_attachments']));

    // @App.Collections.projectVolunteersCollection- This is for the drop down in the select new project lead form
    App.Collections.projectVolunteersCollection = new App.Collections.Volunteer(@json($appInitialData['volunteers']));
    // @App.Collections.contactsManagementCollection- This is for the drop down in the select new project contact form
    App.Collections.contactsManagementCollection = new App.Collections.Contact(@json($appInitialData['all_contacts']));

    // This is for the volunteer management view
    App.PageableCollections.volunteersManagementCollection = new App.PageableCollections.Volunteer(@json($appInitialData['volunteers']));
    App.PageableCollections.contactsManagementCollection = new App.PageableCollections.Contact(@json($appInitialData['all_contacts']));
    App.Collections.annualBudgetsManagementCollection = new App.Collections.Budget(@json($appInitialData['annual_budgets']));
    // @App.PageableCollections.backGridFiltersPanelCollection - filter for volunteer collection
    App.PageableCollections.backGridFiltersPanelCollection = App.PageableCollections.volunteersManagementCollection;
    // This is for the project volunteers tab
    App.PageableCollections.unassignedProjectVolunteersCollection = new App.PageableCollections.Volunteer();
    App.PageableCollections.unassignedProjectVolunteersCollection.url = '/admin/project_volunteer/unassigned/' + App.Models.siteStatusModel.get('SiteID') + '/' + App.Models.siteStatusModel.get('Year');
    App.PageableCollections.unassignedProjectVolunteersCollection.fetch({reset: true});
    // Predefining the view so they exist on load
    App.Views.dashboardView = {};
    App.Views.settingsManagementView = {};
    App.Views.siteManagementView = {};
    App.Views.siteYearsDropDownView = {};
    App.Views.projectManagementView = {};
    App.Views.siteProjectTabsView = {};
    App.Views.projectsView = {};
    App.Views.contactsManagementView = {};
    App.Views.volunteersManagementView = {};
    App.Views.budgetManagementView = {};
    App.Views.reportsManagementView = [];
    App.Views.projectsDropDownView = {};
    App.Views.statusManagementView = {};
})(window.App);
