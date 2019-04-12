(function (App) {
    App.Models.SiteVolunteer = Backbone.Model.extend({
        url: '/admin/site_volunteer',
        idAttribute: "SiteVolunteerID",
        defaults: {
            'VolunteerID': '',
            'SiteStatusID': ''
        },
        getRoleOptions: function (bReturnHtml) {
            let options = _.pairs(App.Vars.selectOptions['site_roles']);
            if (bReturnHtml) {
                return _.map(options, function (value) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        }
    });
    App.Models.SiteVolunteerRole = Backbone.Model.extend({
        url: '/admin/site_volunteer_role',
        idAttribute: "SiteVolunteerRoleID",
        defaults: {
            'VolunteerID': '',
            'SiteStatusID': '',
            'SiteRoleID': '',
            'SiteVolunteerID': '',
            'Comments': '',
            'Status': '',
            'SiteVolunteerRoleStatus': '',
            'LastName': '',
            'FirstName': '',
            'MobilePhoneNumber': '',
            'HomePhoneNumber': '',
            'Email':'',
            'Active':''
        },
        getRoleOptions: function (bReturnHtml) {
            let options = _.pairs(App.Vars.selectOptions['site_roles']);
            if (bReturnHtml) {
                return _.map(options, function (value) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        }
    });
})(window.App);
