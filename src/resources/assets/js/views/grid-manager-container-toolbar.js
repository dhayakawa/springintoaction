(function (App) {
    App.Views.oldGridManagerContainerToolbar = App.Views.Backend.extend({
        template: template('gridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(this, 'render', 'initializeFileUploadObj', 'addGridRow', 'deleteCheckedRows', 'clearStoredColumnState', 'toggleDeleteBtn');
            this.options = options;
            this.localStorageKey = this.options.localStorageKey;
            this.parentView = this.options.parentView;
            self.modelNameLabel = this.parentView.modelNameLabel;
            self.modelNameLabelLowerCase = this.parentView.modelNameLabelLowerCase;
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
        close: function () {
            try {
                this.$el.find('input[type="file"]').fileupload('destroy');
            } catch (e) {
            }
            this.remove();
        },
        render: function () {
            let self = this;
            this.$el.html(this.template({modelName: self.modelNameLabel}));
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

            _log('App.Views.GridManagerContainerToolbar.toggleDeleteBtn.event', self.modelNameLabel, e.toggle, e);
            if (toggle === 'disable') {
                this.$el.find('.btnDeleteChecked').addClass('disabled');
            } else {
                this.$el.find('.btnDeleteChecked').removeClass('disabled');
            }

        },
        setStickyColumns: function (colIdx) {
            let self = this;
            self.parentView.find('.cloned-backgrid-table-wrapper').remove();
            let left = 0;
            let $backgridTable = self.parentView.find('table.backgrid');
            let backgridTableHeight = $backgridTable.height();
            $backgridTable.find('tbody tr:first-child td:nth-child(-n+' +
                colIdx + ')').each(function (idx, el) {
                let w = $(el).css('width');
                left += parseInt(w.replace('px', ''));
            });
            let $tCloneWrapper = $('<div class="cloned-backgrid-table-wrapper"></div>');
            $backgridTable.parent().parent().append($tCloneWrapper);
            $tCloneWrapper.css({
                'width': left + 10,
                'height': backgridTableHeight - 1
            });
            let $tClone = $backgridTable.clone();
            $tClone.addClass('cloned-backgrid-table').css({
                'width': left
            });
            $tClone.find('>div').remove();
            let nextColIdx = colIdx + 1;
            $tClone.find('colgroup col:nth-child(n+' +
                nextColIdx + ')').remove();
            $tClone.find('thead tr th:nth-child(n+' +
                nextColIdx + ')').remove();
            $tClone.find('tbody tr td:nth-child(n+' +
                nextColIdx + ')').remove();

            $tCloneWrapper.append($tClone);
            // console.log('$backgridTable', $backgridTable, backgridTableHeight)
            // console.log('$tCloneWrapper', $tCloneWrapper)
        }

    });
})(window.App);
