(function (App) {
    /**
     * Bootstap Backbone models & collections for initial page load
     * Set App.Vars
     */

    App.Vars.appInitialData = {"random":554303901,"churchIPAddress":"","remoteIPAddress":"10.0.2.2","all_projects":[{"ProjectID":508,"SiteName":"Ben Franklin Junior High","ProjectDescription":"Paint main hallways on each floor - Call Don Keck to talk about.","PrimarySkillNeeded":"3","ChildFriendly":0,"VolunteersAssigned":7,"PeopleNeeded":"73","VolunteersNeededEst":80}],"project":[],"select_options":{"ProjectSkillNeededOptions":{"Construction":2,"Painting":3,"Landscaping":4,"Furniture Making \/ Woodworking":5,"General Carpentry":6,"Cabinetry":7,"General":8,"Cleaning":9}},"bIsLocalEnv":true,"auth":[],"project_volunteers":[],"volunteers":[],"projectFilters":{"skill":[{"filterIcon":"\u003Ci title=\u0022Painting\u0022 class=\u0022skills-icon filter-list-item-icon painting-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"Painting","filterId":"filter_skill_3","FilterIsChecked":false,"Field":"projects.PrimarySkillNeeded","FieldID":3}],"site":[{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_2","filterLabel":"Ben Franklin Junior High","FilterIsChecked":false,"Field":"sites.SiteName","FieldID":2}],"peopleNeeded":[{"filterIcon":"","filterName":"filter[peopleNeeded][]","filterId":"filter_peopleNeeded0","filterLabel":10,"FilterIsChecked":false,"Field":"projects.PeopleNeeded","FieldID":""}],"childFriendly":[{"filterIcon":"\u003Ci title=\u0022Child Friendly\u0022 class=\u0022text-danger fas fa-child\u0022\u003E\u003C\/i\u003E","filterName":"filter[childFriendly][]","filterId":"filter_childFriendly_No","filterLabel":"No","FilterIsChecked":false,"Field":"projects.ChildFriendly","FieldID":""}]}};
    App.Vars.Auth = App.Vars.appInitialData['auth'];
    App.Vars.devMode = App.Vars.appInitialData['bIsLocalEnv'];
    App.Vars.selectOptions = App.Vars.appInitialData['select_options'];
    App.Vars.churchIPAddress = App.Vars.appInitialData['churchIPAddress'];
    App.Vars.remoteIPAddress = App.Vars.appInitialData['remoteIPAddress'];
    App.Models.projectModel = new App.Models.Project([]);

    /**
     * Models for the contacts and volunteer management
     */
    App.Models.volunteerModel = new App.Models.Volunteer(false);

})(window.App);
