(function (App) {
    App.Models.Contact = Backbone.Model.extend({
        url: 'contact',
        defaults: {
            'ContactID': '',
            'SiteID': '',
            'Active': '',
            'FirstName': '',
            'LastName': '',
            'Title': '',
            'Email': '',
            'Phone': '',
            'ContactType': '',
            'created_at': '',
            'updated_at': ''
        }
    });
})(window.App);
