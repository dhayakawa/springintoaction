(function (App) {
    App.Models.Option = Backbone.Model.extend({
        idAttribute: "id",
        url: '/admin/option',
        defaults: {
            'option_label': '',
            'DisplaySequence': ''
        },
    });
})(window.App);
