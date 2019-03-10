(function (App) {
    /**
     * Bootstap Backbone models & collections for initial page load
     * Set App.Vars
     */

    App.Vars.appInitialData = @json($appInitialData);
    App.Vars.Auth = App.Vars.appInitialData['auth'];
    App.Vars.devMode = App.Vars.appInitialData['bIsLocalEnv'];
    App.Vars.selectOptions = App.Vars.appInitialData['select_options'];
    App.Vars.churchIPAddress = App.Vars.appInitialData['churchIPAddress'];
    App.Vars.remoteIPAddress = App.Vars.appInitialData['remoteIPAddress'];
    App.Models.projectModel = new App.Models.Project(@json($appInitialData['project']));

    /**
     * Models for the contacts and volunteer management
     */
    App.Models.volunteerModel = new App.Models.Volunteer(@json(current($appInitialData['project_volunteers'])));

})(window.App);
