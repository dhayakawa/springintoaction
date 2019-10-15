(function (App) {
    App.Collections.allProjectsCollection = new App.Collections.Project([{"ProjectID":508,"SiteName":"Ben Franklin Junior High","ProjectDescription":"Paint main hallways on each floor - Call Don Keck to talk about.","PrimarySkillNeeded":"3","ChildFriendly":0,"VolunteersAssigned":7,"PeopleNeeded":"73","VolunteersNeededEst":80}]);
    App.Collections.volunteersCollection = new App.Collections.Volunteer([]);

    App.Collections.siteFiltersCollection= new App.Collections.ProjectFilters([{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_2","filterLabel":"Ben Franklin Junior High","FilterIsChecked":false,"Field":"sites.SiteName","FieldID":2}]);
    App.Collections.skillFiltersCollection= new App.Collections.ProjectFilters([{"filterIcon":"\u003Ci title=\u0022Painting\u0022 class=\u0022skills-icon filter-list-item-icon painting-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"Painting","filterId":"filter_skill_3","FilterIsChecked":false,"Field":"projects.PrimarySkillNeeded","FieldID":3}]);
    App.Collections.childFriendlyFiltersCollection= new App.Collections.ProjectFilters([{"filterIcon":"\u003Ci title=\u0022Child Friendly\u0022 class=\u0022text-danger fas fa-child\u0022\u003E\u003C\/i\u003E","filterName":"filter[childFriendly][]","filterId":"filter_childFriendly_No","filterLabel":"No","FilterIsChecked":false,"Field":"projects.ChildFriendly","FieldID":""}]);
    App.Collections.peopleNeededFiltersCollection= new App.Collections.ProjectFilters([{"filterIcon":"","filterName":"filter[peopleNeeded][]","filterId":"filter_peopleNeeded0","filterLabel":10,"FilterIsChecked":false,"Field":"projects.PeopleNeeded","FieldID":""}]);
    // Predefining the view so they exist on load
    App.Views.registrationView = {};
    App.Views.projectListView = {};
    App.Views.siteFilterGroup= {};
    App.Views.skillFilterGroup= {};
    App.Views.childFriendlyFilterGroup= {};
    App.Views.peopleNeededFilterGroup= {};
})(window.App);
