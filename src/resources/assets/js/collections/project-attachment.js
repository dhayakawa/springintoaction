(function (App) {
    App.Collections.ProjectAttachment = Backbone.Collection.extend({
        model: App.Models.ProjectAttachment
    });

    App.PageableCollections.ProjectAttachment            = Backbone.PageableCollection.extend({
        model: App.Models.ProjectAttachment,
        state: {
            pageSize: 10
        },
        mode: "client" // page entirely on the client side
    });
    App.Vars.ProjectAttachmentsBackgridColumnDefinitions = [
        {
            // name is a required parameter, but you don't really want one on a select all column
            name: "",
            label: "",
            // Backgrid.Extension.SelectRowCell lets you select individual rows
            cell: "select-row",
            // Backgrid.Extension.SelectAllHeaderCell lets you select all the row on a page
            headerCell: "select-all",
            resizeable: false,
            orderable: false,
            width: "30"
        },
        {
            name: "ProjectAttachmentID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="ProjectAttachmentID" value="' + rawValue + '" />';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30"
        },
        {
            name: "AttachmentPath",
            label: "Attachment URL",
            cell: "uri",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "*"
        }
    ];
    _log('App.Vars.CollectionsGroup', 'App.Vars.ProjectAttachmentsBackgridColumnDefinitions:', App.Vars.ProjectAttachmentsBackgridColumnDefinitions);
})(window.App);
