(function (App) {
    App.Views.ProjectScopeGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        viewName: 'project-scope-grid-manager-container-toolbar-view',
        template: template('projectScopeGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'save', 'toggleSaveBtn');
            } catch (e) {
                console.error(options, e);
            }
            // Required call for inherited class
            self._initialize(options);

            self.listenTo(self.options.managedGridView, 'changed', self.toggleSaveBtn);
            self.$form = self.options.managedGridView.$('form[name="projectScope"]');
            _log('App.Views.ProjectScopeGridManagerContainerToolbar.initialize', options);
        },
        events: {
            'click .btnSave': 'save'
        },
        render: function () {
            let self = this;
            self._render();

            return self;
        },
        /**
         * This is a little hack to use the browsers native form validation
         * @returns {boolean}
         */
        validateForm: function(){
            let self = this;
            let bIsValid = self.$form[0].checkValidity();

            if (!bIsValid) {
                self.$form.find('.list-item-input').on('invalid', function (e) {
                    self.options.managedGridView.flagAsInvalid(e);
                    $(this).off(e);
                });
                self.$form[0].reportValidity();
            }
            return bIsValid;
        },
        save: function (e) {
            let self = this;
            let model;
            self.$form = self.options.managedGridView.$('form[name="projectScope"]');

            if (!self.validateForm()){
                growl('Please fix form errors.', 'error');
                return;
            }
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            let data = $.unserialize(self.$form.serialize());

            if (self.options.managedGridView.bIsAddNew){
                model = new App.Models.ProjectScope();
                model.url = self.options.managedGridView.getModelUrl();
                data.SiteStatusID = self.getViewDataStore('current-site-status-id','project_scope_management');
                delete data.ProjectID;
            } else {
                model = self.options.managedGridView.model;
            }

            let growlMsg = '';
            let growlType = '';
            let newId = null;

            $.when(
                model.save(data,
                    {
                        success: function (model, response, options) {
                            _log('App.Views.ProjectScope.update', self.viewName + ' save', model, response, options);
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';

                            if (!_.isUndefined(response[model.idAttribute])){
                                newId = response[model.idAttribute];
                            }
                        },
                        error: function (model, response, options) {
                            console.error('App.Views.ProjectScope.update', self.viewName + ' save', model, response, options);
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                        }
                    })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                if (self.parentView.bReturnToProjectManagementView || self.options.managedGridView.bIsAddNew){
                    self.options.parentView.$el.hide();
                    let SiteStatusID = _.clone(self.getViewDataStore('current-site-status-id','project_scope_management'));
                    if (self.options.managedGridView.bIsAddNew) {
                        if (newId){
                            // set so it's chosen
                            self.setViewDataStoreValue('current-model-id', newId, 'projects');
                            self.setViewDataStoreValue('current-site-status-id', SiteStatusID, 'projects');
                            self.setViewDataStoreValue('current-model-id', newId, 'project_scope_management');
                        }

                        // remove storage data so it is not reloaded accidentally
                        //self.removeViewDataStore('project_scope_management');

                    }
                    window.location.href = '#/view/project/management';
                    //console.log(App.Views.mainApp.router.managementViews)
                    if (!_.isUndefined(App.Views.mainApp.router.managementViews['project_management'])) {
                        App.Views.mainApp.router.managementViews['project_management'].siteYearsDropdownView.trigger('site-status-id-change', {'SiteStatusID': SiteStatusID});
                    }
                } else if(self.parentView.bReturnToProjectStatusManagementView){
                    self.options.parentView.$el.hide();
                    window.location.href = '#/view/project/status';
                    if (!_.isUndefined(App.Views.mainApp.router.managementViews['project_status'])) {
                        App.Views.mainApp.router.managementViews['project_status'].trigger('refresh-collection');
                    }
                }
            });
        },
        toggleSaveBtn: function (e) {
            let self = this;

            let toggleState = 'enable';
            _log(self.viewName + '.toggleSaveBtn.event', {e: e, toggleState: toggleState});

            if (toggleState === 'disable') {
                self.$('.btnSave').addClass('disabled');
            } else {
                self.$('.btnSave').removeClass('disabled');
            }
        },
        disableSaveBtn: function(){
            let self = this;
            self.$('.btnSave').addClass('disabled');
        }
    });
})(window.App);
