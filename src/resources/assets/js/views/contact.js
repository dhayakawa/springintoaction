(function (App) {
    App.Views.Contact = Backbone.View.extend({
        getModalForm: function () {
            let template = window.template('newContactTemplate');

            let tplVars = {
                SiteID: App.Models.siteModel.get(App.Models.siteModel.idAttribute),
                ProjectID: localStorage.getItem('projects-view.project-model.current-id')
            };
            return template(tplVars);
        }
    });
    App.Views.ProjectContact = App.Views.ProjectTab.fullExtend({
        getModalForm: function () {
            let self = this;
            let template = window.template('newProjectContactTemplate');

            let siteContacts = App.Collections.contactsManagementCollection.where({SiteID: App.Vars.currentSiteID});
            let siteContactsCollection = new App.Collections.Contact(siteContacts);
            let contactsSelect = new App.Views.Select({
                el: '',
                attributes: {id: 'ContactID', name: 'ContactID', class: 'form-control'},
                buildHTML: true,
                collection: siteContactsCollection,
                optionValueModelAttrName: 'ContactID',
                optionLabelModelAttrName: ['LastName', 'FirstName', 'ContactType']
            });
            let tplVars = {
                SiteID: App.Models.siteModel.get(App.Models.siteModel.idAttribute),
                ProjectID: self.projectsView.model.get(self.projectsView.model.idAttribute),
                contactsSelect: contactsSelect.getHtml()
            };
            return template(tplVars);
        }
    });
})(window.App);
