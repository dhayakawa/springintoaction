(function (App) {
    App.Views.Budget = App.Views.ProjectTab.fullExtend({
        getModalForm: function () {
            let self = this;
            let template = window.template('newBudgetTemplate');

            let tplVars = {
                ProjectID: self.projectsView.model.get(self.projectsView.model.idAttribute),
                budgetSourceOptions: App.Models.projectBudgetModel.getSourceOptions(true),
                statusOptions: App.Models.projectBudgetModel.getStatusOptions(true)
            };
            return template(tplVars);
        },
        create: function (attributes) {
            let self = this;
            let newModel = new App.Models.Budget();
            newModel.url = self.getModelRoute();
            _log('App.Views.Budget.create', newModel.url, attributes);
            newModel.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.collection.url = '/admin/project/budgets/' + self.projectsView.model.get(self.projectsView.model.idAttribute);
                        self.collection.fetch({reset:true});
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error')
                    }
                });
        }
    });
})(window.App);
