(function (App) {
    App.Models.SiteVolunteer = Backbone.Model.extend({
        url: '/admin/site_volunteer',
        idAttribute: "SiteVolunteerID",
        defaults: {
            'VolunteerID': '',
            'SiteStatusID': '',
            'SiteVolunteerRoleID': ''
        },
        getRoleOptions: function (bReturnHtml) {
            let options = _.pairs(App.Vars.selectOptions['site_roles']);
            if (bReturnHtml) {
                return _.map(options, function (value) {
                    return "<option value='" + value[1] + "'>" + value[0] + "</option>";
                })
            } else {
                return options;
            }
        }
    });
})(window.App);
