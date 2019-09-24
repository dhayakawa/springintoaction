(function (App) {
    App.Views.ProjectTab = App.Views.ManagedGrid.fullExtend({
        initialize: function (options) {
            let self = this;

            _.bindAll(this, '_initialize','render', 'update', 'refreshView', 'getModalForm', 'create', 'destroy', 'toggleDeleteBtn', 'showColumnHeaderLabel', 'showTruncatedCellContentPopup', 'hideTruncatedCellContentPopup');
            self._initialize(options);
            self.projectsView = self.options.parentView.projectsView;
            //self.backgridWrapperClassSelector = '.tab-content.backgrid-wrapper';
            _log('App.Views.ProjectTab.initialize', options);
        },
        events: {

        },

        render: function (e) {
            let self = this;
            if (self.viewName === 'project-leads') {
                let cmi = self.getViewDataStore('current-model-id');
                console.log('render', self.viewName,  _.isEmpty(cmi),self.getViewDataStore('current-model-id'))
            }
            if (!_.isNumber(self.getViewDataStore('current-model-id'))) {
                self.setViewDataStoreValue('current-model-id', self.collection.length ? self.collection.at(0).get(self.model.idAttribute) : null);
                if (self.viewName === 'project-leads') {
                    console.log('render setting current model id', self.viewName, self.getViewDataStore('current-model-id'))
                }
            }
            self.renderGrid(e, 'site-project-tab-' + self.options.tab);


            return self;
        },

        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        refreshView: function (e) {
            let self = this;

            //console.trace(e)
            self._refreshView(e);
        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                let attributes = _.extend({[self.model.idAttribute]: currentModelID}, e.changed);
                if (attributes[self.projectsView.model.idAttribute] === '') {
                    attributes[self.projectsView.model.idAttribute] = self.projectsView.getViewDataStore('current-model-id');
                }
                window.ajaxWaiting('show', self.backgridWrapperClassSelector);
                console.log('App.Views.ProjectTab.update', self.options.tab, {eChanged: e.changed, saveAttributes: attributes, tModel: this.model});
                this.model.url = self.getModelRoute() + '/' + currentModelID;
                this.model.save(attributes,
                    {
                        success: function (model, response, options) {
                            _log('App.Views.ProjectTab.update', self.options.tab + ' save', model, response, options);
                            window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                            growl(response.msg, response.success ? 'success' : 'error');
                        },
                        error: function (model, response, options) {
                            console.error('App.Views.ProjectTab.update', self.options.tab + ' save', model, response, options);
                            window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                            growl(response.msg, 'error')
                        }
                    });
            } else {
            }
        },
        create: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', self.backgridWrapperClassSelector);

            let model = this.model.clone().clear({silent: true});
            console.log('App.Views.ProjectTab.create', self.options.tab, {attributes: attributes, model: model, thisModel: this.model});
            model.url = self.getModelRoute();
            model.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.collection.url = self.getModelRoute() + '/all/' + self.projectsView.model.get(self.projectsView.model.idAttribute);
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            _log('App.Views.ProjectTab.create.event', self.options.tab + ' collection fetch promise done');
                            window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error');
                        window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                    }
                });
        },
        toggleDeleteBtn: function (e) {
            let self = this;
            let selectedModels = self.backgrid.getSelectedModels();
            _log('App.Views.ProjectTab.toggleDeleteBtn.event', self.options.tab, 'selectedModels.length:' + selectedModels.length, e);
            let toggleState = selectedModels.length === 0 ? 'disable' : 'enable';
            self.parentView.trigger('toggle-delete-btn', {toggle: toggleState, tab: self.options.tab});
        },
        destroy: function (attributes) {
            let self = this;
            let deleteCnt = attributes.deleteModelIDs.length;
            let confirmMsg = "Do you really want to delete the checked " + self.options.tab + "s?";
            if (deleteCnt === self.collection.fullCollection.length) {
                confirmMsg = "You are about to delete every checked " + self.options.tab + ". Do you really want to" +
                             " continue with deleting them all?";
            }

            bootbox.confirm(confirmMsg, function (bConfirmed) {
                if (bConfirmed) {
                    window.ajaxWaiting('show', self.backgridWrapperClassSelector);

                    attributes = _.extend(attributes, {
                        ProjectID: self.projectsView.model.get(self.projectsView.model.idAttribute),
                        ProjectRoleID: self.model.get('ProjectRoleID')
                    });
                    // console.log('App.Views.ProjectTab.destroy', self.options.tab, attributes, 'deleteCnt:' + deleteCnt, 'self.collection.fullCollection.length:' +
                    //                                                                                                     self.collection.fullCollection.length, self.model);
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: self.getModelRoute() + '/batch/destroy',
                        data: attributes,
                        success: function (response) {
                            window.growl(response.msg, response.success ? 'success' : 'error');
                            self.collection.url = self.getModelRoute() + '/all/' + self.projectsView.model.get(self.projectsView.model.idAttribute);
                            $.when(
                                self.collection.fetch({reset: true})
                            ).then(function () {
                                _log('App.Views.ProjectTab.destroy.event', self.options.tab + ' collection fetch promise done');
                                window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                            });
                        },
                        fail: function (response) {
                            window.growl(response.msg, 'error');
                            window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                        }
                    })
                }
            });

        },

    });
})(window.App);
