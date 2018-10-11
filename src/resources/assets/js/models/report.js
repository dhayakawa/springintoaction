(function (App) {
    App.Models.Report = Backbone.Model.extend({
        idAttribute: "id",
        url: '/admin/report',
        defaults: {
            'ReportName' : '',
            'url':''
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
