(function (App) {
    App.Views.ProjectAttachment = App.Views.ProjectTab.extend({
        getModalForm: function () {
            let self = this;
            let template = window.template('newProjectAttachmentTemplate');

            let tplVars = {
                ProjectID: self.managedGridView.getViewDataStore('current-model-id')
            };

            return template(tplVars);
        }
    });
})(window.App);
