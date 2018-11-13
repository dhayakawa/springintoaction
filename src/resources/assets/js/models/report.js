(function (App) {
    App.Models.Report = Backbone.Model.extend({
        idAttribute: "id",
        url: '/admin/report',
        defaults: {
            'ReportName' : '',
            'ReportUrl':''
        },
    });
    /**
     * This is the site years drop down
     */
    App.Models.ProjectDropDown = Backbone.Model.extend({
        defaults: {
            'ProjectID': '',
            'SequenceNumber': 1
        }
    });
})(window.App);
