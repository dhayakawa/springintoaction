(function (App) {
    App.Views.OptionGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.fullExtend({
        viewName: 'option-grid-manager-container-toolbar-view',
        template: template('optionGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'saveOptionList', 'addOption','toggleSaveBtn');
            } catch (e) {
                console.error(options, e);
            }
            // Required call for inherited class
            self._initialize(options);
            self.listenTo(self.options.managedGridView, 'option-list-changed', self.toggleSaveBtn);
            _log('App.Views.OptionGridManagerContainerToolbar.initialize', options);
        },
        events: {
            'click .btnSave': 'saveOptionList',
            'click .btnAdd': 'addOption',
        },
        render: function () {
            let self = this;
            self._render();

            return self;
        },
        saveOptionList: function (e) {

        },
        addOption: function (e) {

        },
        toggleSaveBtn: function (e) {
            let self = this;
            let selectedModels = self.backgrid.getSelectedModels();
            let toggleState = selectedModels.length === 0 ? 'disable' : 'enable';
            _log(self.viewName + '.toggleSaveBtn.event', {'selectedModels.length': selectedModels.length, e: e, toggleState: toggleState});
            console.log({viewName: self.viewName, toggleState: toggleState, gridManagerContainerToolbar: self.$gridManagerContainerToolbar})
            if (toggleState === 'disable') {
                self.$gridManagerContainerToolbar.$('.btnDeleteChecked').addClass('disabled');
            } else {
                self.$gridManagerContainerToolbar.$('.btnDeleteChecked').removeClass('disabled');
            }
        },
    });
})(window.App);
