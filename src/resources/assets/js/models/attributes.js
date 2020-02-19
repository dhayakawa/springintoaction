(function (App) {
    App.Models.Attributes = Backbone.Model.extend({
        idAttribute: "id",
        url: '/admin/attributes',
        defaults: {
            'attribute_code':'',
            'default_value':'',
            'input':'text',
            'options_source':'',
            'label':'',
            'table':'',
            'DisplaySequence':''
        },
        getAttributesDataByTable: function(table){
            return JSON.parse(JSON.stringify(App.Collections.attributesManagementCollection.getTableOptions(table, false)));
        }
    });
})(window.App);
