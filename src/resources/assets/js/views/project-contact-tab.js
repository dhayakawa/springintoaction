(function (App) {
    App.Views.ProjectContact = App.Views.ProjectTab.fullExtend({
        getModalForm: function () {
            let self = this;
            let template = window.template('newProjectContactTemplate');

            let siteContacts = App.Collections.contactsManagementCollection.where({SiteID: self.sitesDropdownView.model.get(App.Models.siteModel.idAttribute)});
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
                SiteID: self.sitesDropdownView.model.get(App.Models.siteModel.idAttribute),
                ProjectID: self.managedGridView.getViewDataStore('current-model-id'),
                contactsSelect: contactsSelect.getHtml()
            };
            return template(tplVars);
        }
    });
})(window.App);
