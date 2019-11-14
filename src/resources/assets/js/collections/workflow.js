(function (App) {
    App.Collections.Workflow = Backbone.Collection.extend({
        url: '/admin/workflow/list/all',
        model: App.Models.Workflow,
        getOptions: function (bReturnHtml, defaultOption ) {
            if (bReturnHtml) {
                return _.map(this.models, function (value, key) {
                    let selected = !_.isUndefined(defaultOption) && defaultOption === value.get('id') ? 'selected' : '';
                    return "<option " + selected + " value='" + value.get('id') + "'>" + value.get('label') + "</option>";
                }).join('');
            } else {
                return this.models;
            }
        }
    });
})(window.App);
