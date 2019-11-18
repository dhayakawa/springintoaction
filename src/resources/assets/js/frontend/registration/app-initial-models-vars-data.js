(function (App) {
    /**
     * Bootstap Backbone models & collections for initial page load
     * Set App.Vars
     */

    App.Vars.appInitialData = {"random":441941462,"churchIPAddress":"47.44.89.146","remoteIPAddress":"10.0.2.2","all_projects":[],"project":[],"select_options":{"ProjectSkillNeededOptions":{"Construction":2,"Painting":3,"Landscaping":4,"Furniture Making \/ Woodworking":5,"General Carpentry":6,"Cabinetry":7,"General":8,"Cleaning":9}},"bIsLocalEnv":true,"auth":[],"project_volunteers":[],"volunteers":[],"projectFilters":{"skill":[],"site":[],"peopleNeeded":[{"filterIcon":"","filterName":"filter[peopleNeeded][]","filterId":"filter_peopleNeeded0","filterLabel":20,"FilterIsChecked":false,"Field":"projects.PeopleNeeded","FieldID":""}],"childFriendly":[]}};
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
