(function (App) {
    App.Collections.Report = Backbone.Collection.extend({
        url:'/admin/report',
        model: App.Models.Report
    });
    App.Collections.ProjectsDropDown = Backbone.Collection.extend({
        url:'/admin/project/year/list/all',
        model: App.Models.ProjectDropDown
    });

})(window.App);
