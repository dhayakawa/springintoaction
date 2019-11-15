(function (App) {
    App.Models.Workflow = Backbone.Model.extend({
        idAttribute: "id",
        url: '/admin/workflow',
        defaults: {
            'label':'',
            'workflow_code':'',
            'DisplaySequence':''
        }
    });
})(window.App);
