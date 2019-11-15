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
            self.$form = self.options.managedGridView.$('form[name="projectScope"]');
            if (!self.validateForm()){
                growl('Please fix form errors.', 'error');
                return;
            }
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            console.log()
            let data = $.unserialize(self.$form.serialize());
            let growlMsg = '';
            let growlType = '';
            $.when(
                self.options.managedGridView.model.save(data,
                    {
                        success: function (model, response, options) {
                            _log('App.Views.ProjectScope.update', self.viewName + ' save', model, response, options);
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
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
    });
})(window.App);
