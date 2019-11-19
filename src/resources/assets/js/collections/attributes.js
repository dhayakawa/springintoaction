(function (App) {
    App.Collections.Attributes = Backbone.Collection.extend({
        url: '/admin/attributes/list/all',
        model: App.Models.Attributes,
        getTableOptions: function (table, bReturnHtml, defaultOption) {
            if (bReturnHtml) {
                return _.map(this.models, function (value, key) {
                    if (table === value.get('table')) {
                        let selected = !_.isUndefined(defaultOption) && defaultOption === value.get('id') ? 'selected' : '';
                        return "<option data-is-core='" + value.get('is_core') + "' " + selected + " value='" + value.get('id') + "'>" + value.get('label') + "</option>";
                    } else {
                        return '';
                    }
                }).join('');
            } else {
                return this.models;
            }
        },
    });
})(window.App);
