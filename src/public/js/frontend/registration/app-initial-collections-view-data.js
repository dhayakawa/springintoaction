(function (App) {
    App.Collections.allProjectsCollection = new App.Collections.Project([]);
    App.Collections.volunteersCollection = new App.Collections.Volunteer([]);

    App.Collections.siteFiltersCollection= new App.Collections.ProjectFilters([]);
    App.Collections.skillFiltersCollection= new App.Collections.ProjectFilters([]);
    App.Collections.childFriendlyFiltersCollection= new App.Collections.ProjectFilters([]);
    App.Collections.peopleNeededFiltersCollection= new App.Collections.ProjectFilters([]);
    // Predefining the view so they exist on load
    App.Views.registrationView = {};
    App.Views.projectListView = {};
    App.Views.siteFilterGroup= {};
    App.Views.skillFilterGroup= {};
    App.Views.childFriendlyFilterGroup= {};
    App.Views.peopleNeededFilterGroup= {};
})(window.App);
