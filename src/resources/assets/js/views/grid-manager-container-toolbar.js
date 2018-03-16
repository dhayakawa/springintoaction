(function (App) {
    App.Views.GridManagerContainerToolbar = Backbone.View.extend({
        template: template('gridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;

            _.bindAll(this, 'render', 'initializeFileUploadObj', 'addGridRow', 'deleteCheckedRows', 'clearStoredColumnState', 'toggleDeleteBtn');
            this.options = options;
            this.localStorageKey = this.options.localStorageKey;
            this.parentView = this.options.parentView;
            this.modelNameLabel = this.parentView.modelNameLabel;
            this.modelNameLabelLowerCase = this.parentView.modelNameLabelLowerCase;
            this.sAjaxFileUploadURL = this.options.sAjaxFileUploadURL;
            this.listenTo(this.parentView, 'toggle-delete-btn', function (e) {
                self.toggleDeleteBtn(e);
            });
        },
        events: {
            'click .btnAdd': 'addGridRow',
            'click .btnDeleteChecked': 'deleteCheckedRows',
            'click .btnClearStored': 'clearStoredColumnState',
        },
        render: function () {
            this.$el.html(this.template({modelName: this.modelNameLabel}));
            // initialize all file upload inputs on the page at load time
            this.initializeFileUploadObj(this.$el.find('input[type="file"]'));

            return this;
        },
        initializeFileUploadObj: function (el) {
            var selfView = this;
            $(el).fileupload({
                url: self.sAjaxFileUploadURL,
                dataType: 'json',
                done: function (e, data) {
                    selfView.$el.find('.file_progress').fadeTo(0, 'slow');
                    selfView.$el.find('.file').val('');
                    selfView.$el.find('.file_chosen').empty();
                    $.each(data.files, function (index, file) {
                        let sFileName = file.name;
                        let sExistingVal = selfView.$el.find('.file').val().length > 0 ? selfView.$el.find('.file').val() + ',' : '';
                        selfView.$el.find('.file').val(sExistingVal + sFileName);
                        selfView.$el.find('.file_chosen').append(sFileName + '<br>')
                    });
                },
                start: function (e) {
                    selfView.$el.find('.file_progress').fadeTo('fast', 1);
                    selfView.$el.find('.file_progress').find('.meter').removeClass('green');
                },
                progress: function (e, data) {
                    let progress = parseInt(data.loaded / data.total * 100, 10);

                    selfView.$el.find('.file_progress .meter').addClass('green').css(
                        'width',
                        progress + '%'
                    ).find('p').html(progress + '%');
                }
            }).prop('disabled', !$.support.fileInput)
                .parent().addClass($.support.fileInput ? undefined : 'disabled');
        },
        addGridRow: function (e) {
            var self = this;
            e.preventDefault();
            $('#sia-modal').one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('New ' + self.modelNameLabel);
                modal.find('.modal-body').html(self.parentView.getModalForm());

                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    self.parentView.create($.unserialize(modal.find('form').serialize()));
                    $('#sia-modal').modal('hide');
                });

            });
            $('#sia-modal').modal('show');

        },
        deleteCheckedRows: function (e) {
            var self = this;
            e.preventDefault();
            if ($(e.target).hasClass('disabled')) {
                growl('Please check a box to delete a ' + self.modelNameLabel + '.');
                return;
            }
            bootbox.confirm("Do you really want to delete the checked " + self.modelNameLabel + "s?", function (bConfirmed) {
                if (bConfirmed) {
                    let selectedModels = self.parentView.backgrid.getSelectedModels();
                    // clear or else the previously selected models remain as undefined
                    self.parentView.backgrid.clearSelectedModels();
                    _log('App.Views.GridManagerContainerToolbar.deleteCheckedRows', self.modelNameLabel, 'selectedModels', selectedModels);
                    let modelIDs = _.map(selectedModels, function (model) {
                        return model.get(model.idAttribute);
                    });

                    self.parentView.batchDestroy({deleteModelIDs: modelIDs});
                }
            });
        },
        clearStoredColumnState(e) {
            var self = this;
            e.preventDefault();
            growl('Resetting ' + self.modelNameLabel + ' columns. Please wait while the page refreshes.', 'success');
            localStorage.removeItem('backgrid-colmgr-' + self.localStorageKey);
            location.reload();
        },
        toggleDeleteBtn: function (e) {
            let self = this;
            let toggle = e.toggle;

            _log('App.Views.GridManagerContainerToolbar.toggleDeleteBtn.event', this.modelNameLabel, e.toggle, e);
            if (toggle === 'disable') {
                this.$el.find('.btnDeleteChecked').addClass('disabled');
            } else {
                this.$el.find('.btnDeleteChecked').removeClass('disabled');
            }

        }

    });
})(window.App);
