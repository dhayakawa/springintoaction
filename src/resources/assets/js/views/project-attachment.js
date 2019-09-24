(function (App) {
    App.Views.ProjectAttachment = App.Views.ProjectTab.fullExtend({
        getModalForm: function () {
            let template = window.template('newProjectAttachmentTemplate');

            let tplVars = {
                ProjectID: self.projectsView.model.get(self.projectsView.model.idAttribute)
            };

            return template(tplVars);
        },
        create: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', self.backgridWrapperClassSelector);
            let newModel = new App.Models.ProjectAttachment();
            newModel.url = self.getModelRoute();
            _log('App.Views.ProjectAttachment.create', newModel.url, attributes);
            newModel.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.collection.url = '/admin/project_attachment/all/' + self.projectsView.model.get(self.projectsView.model.idAttribute);
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            _log('App.Views.ProjectAttachment.create.event', self.options.tab + ' collection fetch promise done');
                            window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error')
                    }
                });
        }
    });
})(window.App);
