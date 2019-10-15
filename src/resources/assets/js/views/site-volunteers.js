(function (App) {
    App.Views.SiteVolunteerGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.fullExtend({
        viewName: 'site-volunteers-grid-manager-container-toolbar-view',
        initialize: function (options) {
            let self = this;
            self._initialize(options);
            _log('App.Views.SiteVolunteerGridManagerContainerToolbar.initialize', options);
        }
    });

    App.Views.SiteVolunteer = App.Views.ManagedGrid.fullExtend({
        viewName: 'site-volunteers-view',
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'update', 'renderGrid', 'refreshView', 'getModalForm', 'create', 'batchDestroy', 'showColumnHeaderLabel', 'showTruncatedCellContentPopup', 'hideTruncatedCellContentPopup');
            } catch (e) {
                console.error(self.viewName, e)
            }

            self._initialize(options);
            self.listenTo(self.options.parentView.siteYearsDropdownView, 'site-status-id-change', self.fetchIfNewID);
            _log('App.Views.SiteVolunteer.initialize', options);
        },
        events: {},
        getCollectionQueryString: function () {
            let self = this;

            return self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute);
        },
        fetchIfNewID: function (e) {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            self.collection.url = self.getCollectionUrl();
            $.when(
                self.collection.fetch({reset: true})
            ).then(function () {

                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                if (self.collection.length) {
                    App.Vars.currentSiteVolunteerRoleID = self.collection.at(0).get(self.model.idAttribute);
                    self.model.set(self.collection.at(0));
                    self.refocusSiteVolunteerRecord();
                }
            });
        },
        refocusSiteVolunteerRecord: function () {
            let self = this;
            let recordIdx = 1;

            this.paginator.collection.fullCollection.each(function (model, idx) {

                if (model.get(self.model.idAttribute) === App.Vars.currentSiteVolunteerRoleID) {
                    recordIdx = idx;
                }
            });
            recordIdx = recordIdx === 0 ? 1 : recordIdx;
            let page = Math.ceil(recordIdx / this.paginator.collection.state.pageSize)
            if (page > 1) {
                _.each(this.paginator.handles, function (handle, idx) {
                    if (handle.pageIndex === page && handle.label === page) {
                        //console.log(handle, handle.pageIndex, handle.el)
                        $(handle.el).find('a').trigger('click')
                    }
                })
            }
            //console.log(recordIdx, this.paginator.collection.state.pageSize, page, this.backgrid, this.paginator, this.backgrid.collection)
            self.$el.find('input[type="radio"][name="' + self.model.idAttribute + '"][value="' + App.Vars.currentSiteVolunteerRoleID + '"]').parents('tr').trigger('focusin');
        },
        render: function (e) {
            let self = this;

            // Need to set the current model id every time the view is rendered
            self.setViewDataStoreValue('current-model-id', self.collection.length ? self.collection.at(0).get(self.model.idAttribute) : null);
            self.renderGrid(e, self.viewName);

            return this;
        },
        getModalForm: function () {
            let self = this;
            let template = window.template('newSiteVolunteerTemplate');

            let volunteerSelect = new App.Views.Select({
                el: '',
                attributes: {id: 'VolunteerID', name: 'VolunteerID', class: 'form-control'},
                buildHTML: true,
                collection: App.Collections.projectVolunteersCollection,
                optionValueModelAttrName: 'VolunteerID',
                optionLabelModelAttrName: ['LastName', 'FirstName']
            });
            let tplVars = {
                SiteStatusID: self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute),
                volunteerSelect: volunteerSelect.getHtml(),
                siteRoleOptions: App.Models.siteVolunteerModel.getRoleOptions(true),
                statusOptions: App.Models.volunteerModel.getStatusOptions(true)
            };
            return template(tplVars);
        },
        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        refreshView: function (e) {
            let self = this;

            self._refreshView(e);
        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                if (!_.isUndefined(e.changed['SiteVolunteerRoleStatus'])) {
                    e.changed['Status'] = e.changed['SiteVolunteerRoleStatus'];
                }
                let attributes = _.extend({[self.model.idAttribute]: currentModelID}, e.changed);
                //console.log('update', {currentModelID: currentModelID, parentSiteStatusID: self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute)})
                attributes['SiteStatusID'] = self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute);
                _log('App.Views.SiteVolunteer.update', self.viewName, e.changed, attributes, self.model);
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                self.model.url = self.getModelUrl(currentModelID);
                let growlMsg = '';
                let growlType = '';
                $.when(
                    self.model.save(attributes,
                        {
                            success: function (model, response, options) {
                                _log('App.Views.SiteVolunteer.update', self.viewName + ' save', model, response, options);
                                growlMsg = response.msg;
                                growlType = response.success ? 'success' : 'error';
                            },
                            error: function (model, response, options) {
                                console.error('App.Views.SiteVolunteer.update', self.viewName + ' save', model, response, options);
                                growlMsg = response.msg;
                                growlType = response.success ? 'success' : 'error';
                            }
                        })
                ).then(function () {
                    growl(growlMsg, growlType);
                    window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                });
            }
        },
        create: function (attributes) {
            var self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);

            let model = self.model.clone().clear({silent: true});
            _log('App.Views.SiteVolunteer.create', self.viewName, attributes, model, self.ajaxWaitingSelector);
            model.url = self.getModelRoute();
            attributes['SiteStatusID'] = self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute);
            let growlMsg = '';
            let growlType = '';
            $.when(
                model.save(attributes,
                    {
                        success: function (model, response, options) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                            self.collection.url = self.getCollectionUrl(self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute));
                            $.when(
                                self.collection.fetch({reset: true})
                            ).then(function () {
                                _log('App.Views.SiteVolunteer.create.event', self.viewName + ' collection fetch promise done');
                            });
                        },
                        error: function (model, response, options) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                        }
                    })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
        batchDestroy: function (attributes) {
            var self = this;
            window.ajaxWaiting('show', this.ajaxWaitingSelector);

            _log(this.viewName + '.destroy', attributes);
            let growlMsg = '';
            let growlType = '';
            $.when(
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: self.getModelRoute() + '/batch/destroy',
                    data: attributes,
                    success: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                        console.log('destroy', {currentModelID: self.model.get(self.model.idAttribute), parentSiteStatusID: self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute)})
                        self.collection.url = self.getCollectionUrl(self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute));
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            _log(self.viewName + '.destroy.event', self.viewName + ' collection fetch promise done');
                        });
                    },
                    fail: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                    }
                })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
    });
})(window.App);
