(function (App) {
    App.Collections.allProjectsCollection = new App.Collections.Project([{"ProjectID":391,"SiteName":"Bannach Elementary School","ProjectDescription":"","PrimarySkillNeeded":"3","ChildFriendly":0,"VolunteersNeededEst":10,"VolunteersAssigned":0,"PeopleNeeded":10}]);
    App.Collections.volunteersCollection = new App.Collections.Volunteer([]);

    App.Collections.siteFiltersCollection= new App.Collections.ProjectFilters([{"filterIcon":"","filterName":"filter[site][]","filterLabel":"Bannach Elementary School","FilterIsChecked":"","Field":"sites.SiteName","FieldID":1}]);
    App.Collections.skillFiltersCollection= new App.Collections.ProjectFilters([{"filterIcon":"\u003Ci title=\u0022Painting\u0022 class=\u0022skills-icon filter-list-item-icon painting-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"Painting","FilterIsChecked":"","Field":"projects.PrimarySkillNeeded","FieldID":3}]);
    App.Collections.childFriendlyFiltersCollection= new App.Collections.ProjectFilters([{"filterIcon":"\u003Ci title=\u0022Child Friendly\u0022 class=\u0022text-danger fas fa-child\u0022\u003E\u003C\/i\u003E","filterName":"filter[childFriendly][]","filterLabel":"No","FilterIsChecked":"","Field":"projects.ChildFriendly","FieldID":""}]);
    App.Collections.peopleNeededFiltersCollection= new App.Collections.ProjectFilters([{"filterIcon":"","filterName":"filter[peopleNeeded][]","filterLabel":10,"FilterIsChecked":"","Field":"projects.PeopleNeeded","FieldID":""}]);
    // Predefining the view so they exist on load
    App.Views.registrationView = {};
    App.Views.projectListView = {};
    App.Views.siteFilterGroup= {};
    App.Views.skillFilterGroup= {};
    App.Views.childFriendlyFilterGroup= {};
    App.Views.peopleNeededFilterGroup= {};
})(window.App);
