(function (App) {
    App.Views.ProjectTabGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        template: template('tabGridManagerContainerToolbarsTemplate'),
        initialize: function (options) {
            let self = this;
            // Required call for inherited class
            self._initialize(options);

            if (_.isUndefined(self.options.bAppend)) {
                console.error("options.bAppend is a required option", self);
                throw "options.bAppend is a required option";
            }
            if (_.isUndefined(self.options.tabId)) {
                console.error("options.tabId is a required option", self);
                throw "options.tabId is a required option";
            }
            self.tabId = self.options.tabId;
            self.parentChildViews = self.options.parentChildViews;
            self.parentView = self.options.parentView;
            self.managedGridView = self.options.managedGridView;
            self.tabs = self.parentView.$('.nav-tabs [role="tab"]');

            self.listenTo(self.parentView, 'cleared-child-views', self.remove);
        },
        close: function () {
            this.remove();
            // handle other unbinding needs, here
            _.each(this.childViews, function (childView) {
                if (childView.close) {
                    try {
                        childView.close();
                    } catch (e) {
                    }
                } else if (childView.remove) {
                    try {
                        childView.remove();
                    } catch (e) {
                    }
                }
            })
        },
        render: function () {
            let self = this;

            self.tabs.each(function (idx, el) {
                let tabName = $(el).attr('aria-controls');
                let tabButtonLabel = $(el).text();
                if (self.tabId === tabName) {
                    //console.log({idx: idx, tabName: tabName, tabButtonLabel: tabButtonLabel,'tabButtonPane': self.$('.tabButtonPane.' + tabName)})
                    // override template vars
                    self.templateVars = {
                        TabName: tabName,
                        btnLabel:
                        tabButtonLabel
                    };
                }
            });

            self._render();
            //console.log('ProjectTabGridManagerContainerToolbar render', {'self': self, '$el': self.$el, 'self.tabs': self.tabs, bCanAddProjectTabModel: App.Vars.Auth.bCanAddProjectTabModel, bCanDeleteProjectTabModel: App.Vars.Auth.bCanDeleteProjectTabModel, 'tabAdd': self.getAddBtn(), 'tabDeleteChecked': self.getDeleteCheckedBtn()})

            if (!App.Vars.Auth.bCanAddProjectTabModel) {
                self.getAddBtn().hide();
            }
            if (!App.Vars.Auth.bCanDeleteProjectTabModel) {
                self.getDeleteCheckedBtn().hide();
            }
            return self;
        },
        getTabView: function (tabName) {
            let self = this;
            return _.find(self.parentChildViews, function (val) {
                return _.has(val, tabName)
            });
        },
        addGridRow: function (e) {
            let self = this;
            let tabName = $(e.target).parents('.tabButtonPane').data('tab-name');
            let tabView = self.getTabView(self.tabId);

            _log('App.Views.ProjectTabGridManagerContainerToolbar.addGridRow', e, self.tabId, tabView);

            self.getModalElement().one('show.bs.modal', function (event) {
                let $fileInput = null;
                let button = $(event.relatedTarget); // Button that triggered the modal
                let recipient = button.data('whatever'); // Extract info from data-* attributes
                // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
                // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
                let modal = $(this);
                modal.find('.modal-title').html(self.parentView.$('h3.box-title').html());
                modal.find('.modal-body').html(tabView[self.tabId].getModalForm());
                if (tabName === 'project_attachment') {
                    let selfView = modal.find('form[name="newProjectAttachment"]');
                    let sAjaxFileUploadURL = '/admin/project_attachment/upload';
                    $fileInput = $(selfView.find('input[type="file"]'));
                    $fileInput.fileupload({
                        url: sAjaxFileUploadURL,
                        dataType: 'json',
                        done: function (e, data) {
                            selfView.find('.file_progress').fadeTo(0, 'slow');
                            selfView.find('.files').val('');
                            selfView.find('.file_chosen').empty();
                            $.each(data.files, function (index, file) {
                                let sFileName = file.name;
                                let sExistingVal = selfView.find('.files').val().length > 0 ? selfView.find('.files').val() + ',' : '';
                                selfView.find('.files').val(sExistingVal + sFileName);
                                selfView.find('.file_chosen').append(sFileName + '<br>')
                            });
                            modal.find('.save.btn').trigger('click')
                        },
                        start: function (e) {
                            selfView.find('.file_progress').fadeTo('fast', 1);
                            selfView.find('.file_progress').find('.meter').removeClass('green');
                        },
                        progress: function (e, data) {
                            let progress = parseInt(data.loaded / data.total * 100, 10);
                            selfView.find('.file_progress .meter').addClass('green').css(
                                'width',
                                progress + '%'
                            ).find('p').html(progress + '%');
                        }
                    }).prop('disabled', !$.support.fileInput)
                        .parent().addClass($.support.fileInput ? undefined : 'disabled');
                }
                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    if (self.tabId === 'project_volunteer') {
                        let formData = $.unserialize(modal.find('form').serialize());
                        let selectedModels = tabView[self.tabId].modalBackgrid.getSelectedModels();
                        tabView[self.tabId].modalBackgrid.clearSelectedModels();
                        let volunteerIDs = _.map(selectedModels, function (model) {
                            return model.get('VolunteerID');
                        });
                        // Can't be VolunteerID or backbone will flag as an update instead of create
                        formData.VolunteerIDs = volunteerIDs;
                        tabView[self.tabId].create(formData);
                    } else {
                        tabView[self.tabId].create($.unserialize(modal.find('form').serialize()));
                    }
                    if (self.tabId === 'project_attachment') {
                        try {
                            $fileInput.fileupload('destroy');
                        } catch (e) {
                        }
                    }
                    self.getModalElement().modal('hide');
                });

            });
            self.getModalElement().modal('show');

        },
        // toggleDeleteBtn: function (e) {
        //     let toggle = e.toggle;
        //     let tab = e.tab;
        //     _log('App.Views.ProjectTabGridManagerContainerToolbar.toggleDeleteBtn.event', e.toggle, e.tab, e);
        //     if (toggle === 'disable') {
        //         this.$el.find('.' + tab + '.tabButtonPane .btnTabDeleteChecked').addClass('disabled');
        //     } else {
        //         this.$el.find('.' + tab + '.tabButtonPane .btnTabDeleteChecked').removeClass('disabled');
        //     }
        //
        // },
        deleteCheckedRows: function (e) {
            let tabName = $(e.target).parents('.tabButtonPane').data('tab-name');

            if ($(e.target).hasClass('disabled')) {
                try {
                    let tabTxt = $('[href="#' + tabName + '"]').html()
                } catch (e) {
                    let tabTxt = tabName;
                }
                growl('Please check a box to delete items from the ' + tabTxt + ' tab.');
                return;
            }

            let tabView = _.find(this.parentChildViews, function (val) {
                return _.has(val, tabName)
            });
            let selectedModels = tabView[tabName].backgrid.getSelectedModels();
            // clear or else the previously selected models remain as undefined
            try {
                tabView[tabName].backgrid.clearSelectedModels();
            } catch (e) {
            }
            let modelIDs = _.map(selectedModels, function (model) {
                return model.get(model.idAttribute);
            });

            tabView[tabName].destroy({deleteModelIDs: modelIDs});
        },
        clearStoredColumnState(e) {
            e.preventDefault();
            let tabName = $(e.target).parents('.tabButtonPane').data('tab-name');
            growl('Resetting ' + tabName + ' columns. Please wait while the page refreshes.', 'success');
            localStorage.removeItem('backgrid-colmgr-site-project-tab-' + tabName);
            location.reload();
        }
    });
})(window.App);
