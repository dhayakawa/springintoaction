(function (App) {
    App.Models.ProjectAttributes = Backbone.Model.extend({
        idAttribute: "id",
        url: '/admin/project_attributes',
        defaults: {
            'attribute_id':'',
            'workflow_id':'',
            'project_skill_needed_option_id':''
        },
    });
})(window.App);
