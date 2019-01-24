(function (App) {


/**
     * Bootstap Backbone models & collections for initial page load
     */

    App.Vars.appInitialData = {"random":1366835040,"all_projects":[{"ProjectID":391,"SiteName":"Bannach Elementary School","ProjectDescription":"Paint rooms 101 and 102 and 103","PrimarySkillNeeded":"2,3,4,9","ChildFriendly":1,"VolunteersNeededEst":8,"VolunteersAssigned":1,"PeopleNeeded":7}],"project":[],"select_options":{"ProjectSkillNeededOptions":{"Construction":2,"Painting":3,"Landscaping":4,"Finish Carpentry":5,"General Carpentry":6,"Cabinetry":7,"General":8,"Cleaning":9}},"bIsLocalEnv":true,"auth":[],"project_volunteers":[],"volunteers":[],"projectFilters":{"site":[{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_1","filterLabel":"Bannach Elementary School","FilterIsChecked":"","Field":"sites.SiteName","FieldID":1}],"skill":[{"filterIcon":"\u003Ci title=\u0022Cleaning\u0022 class=\u0022skills-icon filter-list-item-icon cleaning-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"Cleaning","filterId":"filter_skill_9","FilterIsChecked":"","Field":"projects.PrimarySkillNeeded","FieldID":9},{"filterIcon":"\u003Ci title=\u0022Construction\u0022 class=\u0022skills-icon filter-list-item-icon construction-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"Construction","filterId":"filter_skill_2","FilterIsChecked":"","Field":"projects.PrimarySkillNeeded","FieldID":2},{"filterIcon":"\u003Ci title=\u0022Landscaping\u0022 class=\u0022skills-icon filter-list-item-icon landscaping-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"Landscaping","filterId":"filter_skill_4","FilterIsChecked":"","Field":"projects.PrimarySkillNeeded","FieldID":4},{"filterIcon":"\u003Ci title=\u0022Painting\u0022 class=\u0022skills-icon filter-list-item-icon painting-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"Painting","filterId":"filter_skill_3","FilterIsChecked":"","Field":"projects.PrimarySkillNeeded","FieldID":3}],"childFriendly":[{"filterIcon":"\u003Ci title=\u0022Child Friendly\u0022 class=\u0022text-success fas fa-child\u0022\u003E\u003C\/i\u003E","filterName":"filter[childFriendly][]","filterId":"filter_childFriendly_Yes","filterLabel":"Yes","FilterIsChecked":"","Field":"projects.ChildFriendly","FieldID":""}],"peopleNeeded":[{"filterIcon":"","filterName":"filter[peopleNeeded][]","filterId":"filter_peopleNeeded0","filterLabel":7,"FilterIsChecked":"","Field":"projects.PeopleNeeded","FieldID":""}]}};
    App.Vars.Auth = App.Vars.appInitialData['auth'];
    App.Vars.devMode = App.Vars.appInitialData['bIsLocalEnv'];
    App.Vars.selectOptions = App.Vars.appInitialData['select_options'];

    App.Models.projectModel = new App.Models.Project([]);

    /**
     * Models for the contacts and volunteer management
     */
    App.Models.volunteerModel = new App.Models.Volunteer(false);

})(window.App);
