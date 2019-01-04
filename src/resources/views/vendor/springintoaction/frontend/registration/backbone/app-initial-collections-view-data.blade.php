(function (App) {
    App.Collections.allProjectsCollection = new App.Collections.Project(@json($appInitialData['all_projects']));
    App.Collections.volunteersCollection = new App.Collections.Volunteer(@json($appInitialData['volunteers']));

    App.Collections.siteFiltersCollection= new App.Collections.ProjectFilters(@json($appInitialData['projectFilters']['site']));
    App.Collections.skillFiltersCollection= new App.Collections.ProjectFilters(@json($appInitialData['projectFilters']['skill']));
    App.Collections.childFriendlyFiltersCollection= new App.Collections.ProjectFilters(@json($appInitialData['projectFilters']['childFriendly']));
    App.Collections.peopleNeededFiltersCollection= new App.Collections.ProjectFilters(@json($appInitialData['projectFilters']['peopleNeeded']));
    // Predefining the view so they exist on load
    App.Views.registrationView = {};
    App.Views.projectListView = {};
    App.Views.siteFilterGroup= {};
    App.Views.skillFilterGroup= {};
    App.Views.childFriendlyFilterGroup= {};
    App.Views.peopleNeededFilterGroup= {};
})(window.App);
