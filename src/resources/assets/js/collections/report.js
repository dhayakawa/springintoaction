(function (App) {
    App.Collections.Report = Backbone.Collection.extend({
        model: App.Models.Report
    });
    App.Collections.ProjectsDropDown = Backbone.Collection.extend({
        model: App.Models.ProjectDropDown
    });

})(window.App);
