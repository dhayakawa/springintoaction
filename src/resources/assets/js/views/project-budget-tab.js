(function (App) {
    App.Views.Budget = App.Views.ProjectTab.extend({
        getModalForm: function () {
            let self = this;
            let template = window.template('newBudgetTemplate');

            let tplVars = {
                ProjectID: self.managedGridView.getViewDataStore('current-model-id'),
                budgetSourceOptions: App.Models.projectBudgetModel.getSourceOptions(true),
                statusOptions: App.Models.projectBudgetModel.getStatusOptions(true)
            };
            return template(tplVars);
        }
    });
})(window.App);
