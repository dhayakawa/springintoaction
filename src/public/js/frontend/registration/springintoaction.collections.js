(function (App) {
    App.Collections.Project = Backbone.Collection.extend({
        model: App.Models.Project
    });
    App.Collections.ProjectFilters = Backbone.Collection.extend({
        model: App.Models.ProjectFilter
    });

})(window.App);

(function (App) {
    App.Collections.Volunteer = Backbone.Collection.extend({
        model: App.Models.Volunteer
    });


})(window.App);

(function (App) {
    App.Collections.allProjectsCollection = new App.Collections.Project();
    App.Collections.volunteersCollection = new App.Collections.Volunteer();
    App.Collections.siteFiltersCollection = new App.Collections.ProjectFilters();
    App.Collections.skillFiltersCollection = new App.Collections.ProjectFilters();
    App.Collections.childFriendlyFiltersCollection = new App.Collections.ProjectFilters();
    App.Collections.peopleNeededFiltersCollection = new App.Collections.ProjectFilters();
})(window.App);
