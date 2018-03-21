(function (App) {
    App.Collections.sitesDropDownCollection = new App.Collections.Site();
    App.Collections.siteYearsDropDownCollection = new App.Collections.SiteYear();
    App.PageableCollections.projectCollection = new App.PageableCollections.Project();
    App.Collections.allProjectsCollection = new App.Collections.Project();

    // project tabs
    App.PageableCollections.projectLeadsCollection = new App.PageableCollections.Volunteer();
    App.PageableCollections.projectBudgetsCollection = new App.PageableCollections.Budget();
    App.PageableCollections.projectContactsCollection = new App.PageableCollections.Contact();
    App.PageableCollections.projectVolunteersCollection = new App.PageableCollections.Volunteer();

    // @App.Collections.projectVolunteersCollection- This is for the drop down in the select new project lead form
    App.Collections.projectVolunteersCollection = new App.Collections.Volunteer();
    // @App.Collections.contactsManagementCollection- This is for the drop down in the select new project contact form
    App.Collections.contactsManagementCollection = new App.Collections.Contact();

    // This is for the volunteer management view
    App.PageableCollections.volunteersManagementCollection = new App.PageableCollections.Volunteer();
    App.PageableCollections.contactsManagementCollection = new App.PageableCollections.Contact();
    App.Collections.annualBudgetsManagementCollection = new App.Collections.Budget();
    // @App.PageableCollections.backGridFiltersPanelCollection - filter for volunteer collection
    App.PageableCollections.backGridFiltersPanelCollection = App.PageableCollections.volunteersManagementCollection;
    // This is for the project volunteers tab
    App.PageableCollections.unassignedProjectVolunteersCollection = new App.PageableCollections.Volunteer();

})(window.App);
