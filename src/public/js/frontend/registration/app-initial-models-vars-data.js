(function (App) {


/**
     * Bootstap Backbone models & collections for initial page load
     */

    App.Vars.appInitialData = {"random":29711709,"all_projects":[{"ProjectID":392,"SiteName":"Bannach Elementary School","ProjectDescription":"Project Description is not set yet.","PrimarySkillNeeded":"8","ChildFriendly":0,"VolunteersAssigned":0,"PeopleNeeded":"8","VolunteersNeededEst":8},{"ProjectID":391,"SiteName":"Bannach Elementary School","ProjectDescription":"test","PrimarySkillNeeded":"3","ChildFriendly":0,"VolunteersAssigned":25,"PeopleNeeded":"295","VolunteersNeededEst":320},{"ProjectID":493,"SiteName":"Bannach Elementary School","ProjectDescription":"The location is in the hallway very near the main office. I believe the hallway runs east. The tallest tree should be around 88\u0022, shorter is alright. Should look similar to the blue ribbon school of excellence tree. and the wall will need to be cleaned before the tree is painted.","PrimarySkillNeeded":"3","ChildFriendly":0,"VolunteersAssigned":0,"PeopleNeeded":"3","VolunteersNeededEst":3},{"ProjectID":494,"SiteName":"Bannach Elementary School","ProjectDescription":"3 targets for throwing balls at are to be painted on the south half green wall on the playground behind the school. See Deb Neff for the designs that she would like painted on the wall.","PrimarySkillNeeded":"3","ChildFriendly":1,"VolunteersAssigned":0,"PeopleNeeded":"2","VolunteersNeededEst":2}],"project":[],"select_options":{"ProjectSkillNeededOptions":{"Construction":2,"Painting":3,"Landscaping":4,"Finish Carpentry":5,"General Carpentry":6,"Cabinetry":7,"General":8,"Cleaning":9}},"bIsLocalEnv":true,"auth":[],"project_volunteers":[],"volunteers":[],"projectFilters":{"site":[{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_1","filterLabel":"Bannach Elementary School","FilterIsChecked":"","Field":"sites.SiteName","FieldID":1}],"skill":[{"filterIcon":"\u003Ci title=\u0022General\u0022 class=\u0022skills-icon filter-list-item-icon general-skill-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"General","filterId":"filter_skill_8","FilterIsChecked":"","Field":"projects.PrimarySkillNeeded","FieldID":8},{"filterIcon":"\u003Ci title=\u0022Painting\u0022 class=\u0022skills-icon filter-list-item-icon painting-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"Painting","filterId":"filter_skill_3","FilterIsChecked":"","Field":"projects.PrimarySkillNeeded","FieldID":3}],"childFriendly":[{"filterIcon":"\u003Ci title=\u0022Child Friendly\u0022 class=\u0022text-danger fas fa-child\u0022\u003E\u003C\/i\u003E","filterName":"filter[childFriendly][]","filterId":"filter_childFriendly_No","filterLabel":"No","FilterIsChecked":"","Field":"projects.ChildFriendly","FieldID":""},{"filterIcon":"\u003Ci title=\u0022Child Friendly\u0022 class=\u0022text-success fas fa-child\u0022\u003E\u003C\/i\u003E","filterName":"filter[childFriendly][]","filterId":"filter_childFriendly_Yes","filterLabel":"Yes","FilterIsChecked":"","Field":"projects.ChildFriendly","FieldID":""}],"peopleNeeded":[{"filterIcon":"","filterName":"filter[peopleNeeded][]","filterId":"filter_peopleNeeded0","filterLabel":5,"FilterIsChecked":"","Field":"projects.PeopleNeeded","FieldID":""},{"filterIcon":"","filterName":"filter[peopleNeeded][]","filterId":"filter_peopleNeeded1","filterLabel":10,"FilterIsChecked":"","Field":"projects.PeopleNeeded","FieldID":""}]}};
    App.Vars.Auth = App.Vars.appInitialData['auth'];
    App.Vars.devMode = App.Vars.appInitialData['bIsLocalEnv'];
    App.Vars.selectOptions = App.Vars.appInitialData['select_options'];

    App.Models.projectModel = new App.Models.Project([]);

    /**
     * Models for the contacts and volunteer management
     */
    App.Models.volunteerModel = new App.Models.Volunteer(false);

})(window.App);
