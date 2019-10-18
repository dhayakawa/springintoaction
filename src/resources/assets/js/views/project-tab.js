(function (App) {
    App.Views.ProjectTab = App.Views.ManagedGrid.extend({
        initialize: function (options) {
            let self = this;

            try {
                _.bindAll(self, 'update', 'refreshView', 'getModalForm', 'create', 'destroy', 'toggleDeleteBtn', 'showColumnHeaderLabel', 'showTruncatedCellContentPopup', 'hideTruncatedCellContentPopup');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            self._initialize(options);
            self.managedGridView = self.options.parentView.managedGridView;
            self.sitesDropdownView = self.options.parentView.sitesDropdownView;
            self.siteYearsDropdownView = self.options.parentView.siteYearsDropdownView;

            _log('App.Views.ProjectTab.initialize', options);
        },
        events: {

        },
        render: function (e) {
            let self = this;
            let currentModelId = self.getViewDataStore('current-model-id');
            if (!_.isNumber(currentModelId)) {
                self.setViewDataStoreValue('current-model-id', self.collection.length ? self.collection.at(0).get(self.model.idAttribute) : null);
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
                if (attributes[self.managedGridView.model.idAttribute] === '') {
                    attributes[self.managedGridView.model.idAttribute] = self.managedGridView.getViewDataStore('current-model-id');
                }
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                //console.log('App.Views.ProjectTab.update', self.options.tab, {eChanged: e.changed, saveAttributes: attributes, tModel: self.model});
                self.model.url = self.getModelUrl(currentModelID);
                self.model.save(attributes,
                    {
                        success: function (model, response, options) {
                            _log('App.Views.ProjectTab.update', self.options.tab + ' save', model, response, options);
                            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                            growl(response.msg, response.success ? 'success' : 'error');
                        },
                        error: function (model, response, options) {
                            console.error('App.Views.ProjectTab.update', self.options.tab + ' save', model, response, options);
                            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                            growl(response.msg, 'error')
                        }
                    });
            }
        },
        create: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            attributes = _.extend(attributes, {
                ProjectID: self.managedGridView.model.get(self.managedGridView.model.idAttribute)
            });
            let model = self.model.clone().clear({silent: true});
            //console.log('App.Views.ProjectTab.create', self.options.tab, {attributes: attributes, model: model, thisModel: self.model});
            model.url = self.getModelRoute();
            //console.log('create',{viewName:self.viewName,attributes:attributes})
            $.when(
                model.save(attributes,
                    {
                        success: function (model, response, options) {
                            window.growl(response.msg, response.success ? 'success' : 'error');
                            self.collection.url = self.getCollectionUrl(self.managedGridView.model.get(self.managedGridView.model.idAttribute));
                            $.when(
                                self.collection.fetch({reset: true})
                            ).then(function () {
                                _log('App.Views.ProjectTab.create.event', self.options.tab + ' collection fetch promise done');
                            });
                        },
                        error: function (model, response, options) {
                            window.growl(response.msg, 'error');
                        }
                    })
            ).then(function () {
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });

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
                    window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);

                    attributes = _.extend(attributes, {
                        ProjectID: self.managedGridView.model.get(self.managedGridView.model.idAttribute),
                        ProjectRoleID: self.model.get('ProjectRoleID')
                    });
                    // console.log('App.Views.ProjectTab.destroy', self.options.tab, attributes, 'deleteCnt:' + deleteCnt, 'self.collection.fullCollection.length:' +
                    //                                                                                                    self.collection.fullCollection.length, self.model);
                    $.when(
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            url: self.getModelRoute() + '/batch/destroy',
                            data: attributes,
                            success: function (response) {
                                window.growl(response.msg, response.success ? 'success' : 'error');
                                self.collection.url = self.getCollectionUrl(self.managedGridView.model.get(self.managedGridView.model.idAttribute));
                                $.when(
                                    self.collection.fetch({reset: true})
                                ).then(function () {
                                    _log('App.Views.ProjectTab.destroy.event', self.options.tab + ' collection fetch promise done');
                                });
                            },
                            fail: function (response) {
                                window.growl(response.msg, 'error');
                            }
                        })
                    ).then(function () {
                        window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                    });

                }
            });

        },

    });
})(window.App);
