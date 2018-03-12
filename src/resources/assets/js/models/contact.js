(function (App) {
    App.Models.Contact = Backbone.Model.extend({
        idAttribute: "ContactID",
        url: '/admin/contact',
        defaults: {
            'SiteID': '',
            'Active': '',
            'FirstName': '',
            'LastName': '',
            'Title': '',
            'Email': '',
            'Phone': '',
            'ContactType': ''
        }
    });

})(window.App);
