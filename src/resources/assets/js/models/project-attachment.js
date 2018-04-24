(function (App) {
    App.Models.ProjectAttachment = Backbone.Model.extend({
        url: '/admin/project_attachment',
        idAttribute: "ProjectAttachmentID",
        defaults: {
            'ProjectID': '',
            'AttachmentPath': ''
        }
    });
})(window.App);
