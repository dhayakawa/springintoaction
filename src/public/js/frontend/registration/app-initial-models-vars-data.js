(function (App) {


/**
     * Bootstap Backbone models & collections for initial page load
     */

    App.Vars.appInitialData = {"random":323491789,"all_projects":[{"ProjectID":391,"SiteName":"Bannach Elementary School","ProjectDescription":"test","PrimarySkillNeeded":"3","ChildFriendly":0,"VolunteersAssigned":23,"PeopleNeeded":"297","VolunteersNeededEst":320}],"project":[],"select_options":{"ProjectSkillNeededOptions":{"Construction":2,"Painting":3,"Landscaping":4,"Finish Carpentry":5,"General Carpentry":6,"Cabinetry":7,"General":8,"Cleaning":9}},"bIsLocalEnv":true,"auth":[],"project_volunteers":[],"volunteers":[],"projectFilters":{"site":[{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_1","filterLabel":"Bannach Elementary School","FilterIsChecked":"","Field":"sites.SiteName","FieldID":1}],"skill":[{"filterIcon":"\u003Ci title=\u0022Painting\u0022 class=\u0022skills-icon filter-list-item-icon painting-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"Painting","filterId":"filter_skill_3","FilterIsChecked":"","Field":"projects.PrimarySkillNeeded","FieldID":3}],"childFriendly":[{"filterIcon":"\u003Ci title=\u0022Child Friendly\u0022 class=\u0022text-danger fas fa-child\u0022\u003E\u003C\/i\u003E","filterName":"filter[childFriendly][]","filterId":"filter_childFriendly_No","filterLabel":"No","FilterIsChecked":"","Field":"projects.ChildFriendly","FieldID":""}],"peopleNeeded":[{"filterIcon":"","filterName":"filter[peopleNeeded][]","filterId":"filter_peopleNeeded0","filterLabel":"297","FilterIsChecked":"","Field":"projects.PeopleNeeded","FieldID":""}]}};
    App.Vars.Auth = App.Vars.appInitialData['auth'];
    App.Vars.devMode = App.Vars.appInitialData['bIsLocalEnv'];
    App.Vars.selectOptions = App.Vars.appInitialData['select_options'];

    App.Models.projectModel = new App.Models.Project([]);

    /**
     * Models for the contacts and volunteer management
     */
    App.Models.volunteerModel = new App.Models.Volunteer(false);

})(window.App);
