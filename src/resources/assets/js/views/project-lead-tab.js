(function (App) {
    App.Views.ProjectLead = App.Views.ProjectTab.extend({
        getModalForm: function () {
            let self = this;
            let template = window.template('newProjectLeadTemplate');

            let volunteerSelect = new App.Views.Select({
                el: '',
                attributes: {id: 'selectVolunteerID', name: 'VolunteerID', class: 'form-control'},
                buildHTML: true,
                collection: App.Collections.projectVolunteersCollection,
                optionValueModelAttrName: 'VolunteerID',
                optionLabelModelAttrName: ['LastName', 'FirstName']
            });
            let tplVars = {
                ProjectID: self.managedGridView.getViewDataStore('current-model-id'),
                volunteerSelect: volunteerSelect.getHtml(),
                projectRoleOptions: App.Models.volunteerModel.getRoleOptions(true),
                statusOptions: App.Models.volunteerModel.getStatusOptions(true)
            };
            return template(tplVars);
        }
    });
})(window.App);
