(function (App) {
    App.Views.Contact = App.Views.ProjectTab.fullExtend({
        getModalForm: function () {
            let template = window.template('newContactTemplate');

            let tplVars = {
                SiteID: App.Models.siteModel.get(App.Models.siteModel.idAttribute),
                ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute)
            };
            return template(tplVars);
        }
    });
})(window.App);
