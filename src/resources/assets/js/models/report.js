(function (App) {
    App.Models.Report = Backbone.Model.extend({
        idAttribute: "id",
        url: '/admin/report',
        defaults: {
            'ReportName' : '',
            'ReportUrl':''
        },
    });

    App.Models.ProjectDropDown = Backbone.Model.extend({
        idAttribute: "ProjectID",
        url: '/admin/project',
        defaults: {
            'ProjectID': '',
            'SequenceNumber': 1
        }
    });
})(window.App);
