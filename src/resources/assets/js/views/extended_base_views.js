(function (App) {
    App.Views.Backend = Backbone.View.extend({
        _initialize: function (options) {
            try {
                _.bindAll(this, 'close', 'getViewDataStore', 'setViewDataStoreValue', 'removeViewDataStore', 'removeChildViews', 'getViewClassName');
            } catch (e) {
                console.error(options, e)
            }
            //console.log('Backend _initialize called with options:',{options: options,this:this})
            this.childViews = [];
            this.options = options;
            this._validateRequiredOptions(options);
            this.setModelRoute();
            this.setViewName();
            this.mainApp = this.options.mainApp;

        },
        setViewName: function(){
            let self = this;
            self.viewName = !_.isUndefined(self.options.viewName) ? self.options.viewName : self.__proto__.viewName;
        },
        _validateRequiredOptions: function(options) {
            let self = this;
            if (_.isUndefined(options.viewName) && _.isUndefined(self.__proto__.viewName)) {
                console.error("options.viewName is a required option", {self: self, options: options});
                throw "options.viewName is a required option";
            }
            if (_.isUndefined(options.mainApp)) {
                console.error(options.viewName + " options.mainApp is a required option", {self:self, options:options});
                throw options.viewName + " options.mainApp is a required option";
            }
        },
        close: function () {
            let self = this;
            self._close();
        },
        _close: function () {
            this.$el.hide();
            // handle other unbinding needs, here
            if (!_.isUndefined(this.childViews)) {
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
            }
            this.remove();

        },
        removeChildViews: function () {
            //console.log('App.Views.SiteProjectTabs removeChildViews ');
            _.each(this.childViews, function (view) {
                view.remove();
            });
            //_log(self.getViewClassName() + '.removeChildViews.event', 'trigger removed-child-views');
            this.trigger('removed-child-views');
        },
        getViewClassName: function () {
            return this.constructor.name;
        },
        getModalElement: function () {
            return $('#sia-modal');
        },
        getModalForm: function () {
            return '';
        },
        getViewDataStore: function (data, _viewName) {
            let self = this;
            let viewName = !_.isUndefined(_viewName) ? _viewName : self.viewName;
            let dataStore = localStorage.getItem(viewName);

            if (dataStore) {
                dataStore = JSON.parse(dataStore);
                if (!_.isUndefined(data) && !_.isUndefined(dataStore[data])) {
                    return dataStore[data];
                } else if (!_.isUndefined(data)){
                    return null;
                }
            } else {
                dataStore = null;
            }
            //console.log('getViewDataStoreValue', {'viewName': viewName, dataStore: dataStore, data: data})
            return dataStore;
        },
        setViewDataStoreValue: function (data, value, _viewName) {
            let self = this;
            let origDataStore = self.getViewDataStore();
            let dataStore = self.getViewDataStore();
            if (_.isNull(dataStore)) {
                dataStore = {};
            }
            let viewName = !_.isUndefined(_viewName) ? _viewName : self.viewName;
            dataStore[data] = value;
            localStorage.setItem(viewName, JSON.stringify(dataStore));
            if (_.isUndefined(viewName)) {
                console.error('setViewDataStoreValue', {self:self, origDataStore: origDataStore, data: data, value: value})
            }
        },
        removeViewDataStore: function (_viewName) {
            let self = this;
            let viewName = !_.isUndefined(_viewName) ? _viewName : self.viewName;
            localStorage.removeItem(viewName);
        },
        findModelRoute: function(model) {
            let self = this;
            let bFoundRoute = true;
            let viewModel = !_.isUndefined(self.model) && !_.isNull(self.model) ? self.model : !_.isUndefined(self.options.model) && !_.isNull(self.options.model)? self.options.model : null;
            model = !_.isUndefined(model) ? model : viewModel;

            if (_.isNull(model) && !_.isUndefined(self.collection) && self.collection.length){
                model = self.collection.at(0);
            } else if (_.isNull(model) && !_.isUndefined(self.options.collection) && self.options.collection.length){
                model = self.options.collection.at(0);
            }
            if (_.isUndefined(model) || _.isNull(model)) {
                let bShowError = true;
                if ((!_.isUndefined(self.viewName) && self.viewName.match(/(management|toolbar)/)) ||
                    (!_.isUndefined(self.options.viewName) && self.options.viewName.match(/(management|toolbar)/))){
                    bShowError = false;
                }
                if (bShowError) {
                    console.error('findModelRoute missing model', {self: self, options: self.options});
                }
                self.modelRoute = '';
            } else {
                //console.log({model: model,url: model.__proto__.url, self: self, options: self.options})
                if (!_.isUndefined(model.__proto__.url)) {
                    self.modelRoute = model.__proto__.url;
                } else {
                    self.modelRoute = '';
                    bFoundRoute = false;
                    console.log('model.__proto__.url was undefined',{model: model, url: model.__proto__, self: self, options: self.options})
                }
                if (!bFoundRoute) {
                    console.error('findModelRoute', {self: self, options: self.options,viewName: self.viewName, modelRoute: self.modelRoute, model: model, protoUrl: !_.isUndefined(model.__proto__) ? model.__proto__ : 'proto url not set', superIdAttributeOrUrl: !_.isUndefined(model._super) ? model._super : '_super not set'});
                }

            }
            return self.modelRoute;
        },
        getModelRoute: function (model) {
            let self = this;
            if (_.isUndefined(self.modelRoute)) {
                self.modelRoute = self.findModelRoute(model);
            }
            return self.modelRoute;
        },
        setModelRoute: function (modelRoute) {
            let self = this;
            if (!_.isUndefined(modelRoute)) {
                self.modelRoute = modelRoute;
                //console.log('setModelRoute modelRoute passed in', modelRoute, {self: self, options: self.options});
            } else{
                self.modelRoute = self.findModelRoute();
            }
        },
        getModelUrl: function (modelId) {
            let self = this;
            let modelQS = '';
            if (!_.isUndefined(modelId)) {
                if (!_.isString(modelId)) {
                    modelId = modelId.toString();
                }
                modelQS =  '/' + modelId;
            }
            let modelRoute = self.getModelRoute();
            if (modelRoute === '') {
                console.error('getModelUrl getModelRoute was set to ""', {modelRoute: modelRoute,self: self, viewName: self.viewName, modelId: modelId});
                throw self.viewName + ' getModelUrl getModelRoute was set to ""';
            }

            return modelRoute + modelQS;
        },
        findCollectionRoute: function(collection){
            let self = this;
            let viewCollection = !_.isUndefined(self.collection) && !_.isNull(self.collection) ? self.collection : !_.isUndefined(self.options.collection) && !_.isNull(self.options.collection) ? self.options.collection : null;
            collection = !_.isUndefined(collection) ? collection : viewCollection;

            //console.log('findCollectionRoute',{collection: collection, options: self.options, self: self})
            if (!_.isUndefined(collection) || !_.isNull(collection)) {
                if (!_.isUndefined(collection.__proto__.url)) {
                    self.collectionRoute = collection.__proto__.url;
                } else {
                    self.collectionRoute = '';
                    }
            }
            return self.collectionRoute;
        },
        getCollectionRoute: function(collection){
            let self = this;
            if (_.isUndefined(self.collectionRoute)) {
                self.collectionRoute = self.findCollectionRoute(collection);
            }
            return self.collectionRoute;
        },
        getCollectionUrl: function (qs) {
            let self = this;

            qs = _.isUndefined(qs) ? self.getCollectionQueryString() : qs;
            if (!_.isString(qs)){
                qs = qs.toString();
            }
            if (qs !== '' && !qs.match(/^\//)) {
                qs = '/' + qs;
            }
            let collectionRoute = self.getCollectionRoute();
            if (collectionRoute==='') {
                let modelRoute = self.getModelRoute();
                collectionRoute = modelRoute + '/list/all' + qs;
            }

            //console.error('getCollectionUrl', {collectionRoute: collectionRoute, self: self, viewName: self.viewName, qs: qs, options: self.options})
            return collectionRoute + qs;
        },
        getCollectionQueryString: function () {
            return '';
        },
        handleSiteIDChange: function (e) {
            let self = this;

            self.setViewDataStoreValue('current-site-id', e[self.sitesDropdownView.model.idAttribute]);
        },
        handleSiteStatusIDChange: function (e) {
            let self = this;

            self.setViewDataStoreValue('current-site-status-id', e[self.siteYearsDropdownView.model.idAttribute]);
        },
    });

    App.Views.Management = App.Views.Backend.fullExtend({
        bModelExpected: false,
        events: {

        },
        _initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self,
                    'render',

                );
            } catch (e) {
                console.error(options, e)
            }
            self.childViews = [];
            self.options = options;
            self._validateRequiredOptions(options);
            self.model = !_.isUndefined(self.model) ? self.model : !_.isUndefined(self.options.model) ? self.options.model : null;
            self.setModelRoute();
            self.setViewName();
            self.mainApp = self.options.mainApp;

        },
        renderSiteDropdowns: function () {
            let self = this;

            self.sitesDropdownView = new self.sitesDropdownViewClass({
                el: self.$('select#sites'),
                model: new App.Models.Site(),
                collection: new App.Collections.Site(App.Vars.appInitialData.sites),
                parentView: self,
                selectedSiteID: self.getViewDataStore('current-site-id'),
                mainApp: self.mainApp
            });
            self.siteYearsDropdownView = new self.siteYearsDropdownViewClass({
                el: self.$('select#site_years'),
                parentView: this,
                model: new App.Models.SiteYear(),
                collection: new App.Collections.SiteYear(App.Vars.appInitialData.site_years),
                sitesDropdownView: self.sitesDropdownView,
                selectedSiteStatusID: self.getViewDataStore('current-site-status-id'),
                mainApp: self.mainApp
            });
            self.listenTo(self.sitesDropdownView, 'site-id-change', self.handleSiteIDChange);
            self.sitesDropdownView.render();
            self.childViews.push(self.sitesDropdownView);
            self.listenTo(self.siteYearsDropdownView, 'site-status-id-change', self.handleSiteStatusIDChange);
            self.siteYearsDropdownView.render();

            self.childViews.push(self.siteYearsDropdownView);
        }
    });

    App.Views.GridManagerContainerToolbar = App.Views.Backend.fullExtend({
        bModelExpected: false,
        events: {
            'click .btnAdd': 'addGridRow',
            'click .btnEdit': 'editGridRow',
            'click .btnDeleteChecked': 'deleteCheckedRows',
            'click .btnClearStored': 'clearStoredColumnState',
        },
        template: template('gridManagerContainerToolbarTemplate'),
        _initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'addGridRow', 'deleteCheckedRows', 'clearStoredColumnState', 'setStickyColumns');
            } catch (e) {
                console.error(options, e)
            }
            self.childViews = [];
            self.options = options;
            self._validateRequiredOptions(options);
            self.setModelRoute();
            self.bAppend = !_.isUndefined(self.options.bAppend) ? self.options.bAppend : false;
            self.setViewName();
            self.mainApp = self.options.mainApp;
            if (_.isUndefined(self.options.managedGridView)) {
                console.error("options.managedGridView is a required option", self);
                throw "options.managedGridView is a required option";
            }
            self.managedGridView = self.options.managedGridView;

            self.singleModelName = self.managedGridView.modelNameLabel.replace(/s$/, '');
            self.templateVars = {btnLabel: self.singleModelName};
        },
        getAddBtn: function () {
            let self = this;
            return self.$el.find('.btnAdd');
        },
        getEditBtn: function() {
            let self = this;
            return self.$el.find('.btnEdit');
        },
        getDeleteCheckedBtn: function() {
            let self = this;
            return self.$el.find('.btnDeleteChecked');
        },
        getFileUploadsContainer: function () {
            let self = this;
            return self.$el.find('.file-upload-container');
        },
        getResetColumnsBtn: function () {
            let self = this;
            return self.$el.find('.btnClearStored');
        },
        _render: function () {
            let self = this;

            if (self.bAppend) {
                self.$el.append(self.template(self.templateVars));
            }else{
                self.$el.html(self.template(self.templateVars));
            }
            // initialize all file upload inputs on the page at load time
            self.initializeFileUploadObj(self.$el.find('input[type="file"]'));
            let managedGridViewFunctions = _.functions(self.managedGridView);
            //console.log('hide edit btn?',{viewName:self.viewName, 'self.$el': self.$el,'btn-edit-model': self.$el.find('.btn-edit-model'),indexOf: _.indexOf(managedGridViewFunctions, 'getEditForm'), hide: _.indexOf(managedGridViewFunctions, 'getEditForm') === -1})
            if (_.indexOf(managedGridViewFunctions,'getEditForm') === -1){
                self.getEditBtn().hide();
            }
            if (!App.Vars.bAllowManagedGridColumns) {
                self.getResetColumnsBtn().hide();
            }
            if (!App.Vars.bAllowCSVFileImports) {
                self.getFileUploadsContainer().hide();
            }
            return self;
        },
        render: function () {
            let self = this;
            self._render();

            return this;
        },
        close: function () {
            let self = this;
            try {
                self.$el.find('input[type="file"]').fileupload('destroy');
            } catch (e) {
            }
            self._close();
        },
        initializeFileUploadObj: function (el) {
            let self = this;
            $(el).fileupload({
                url: self.managedGridView.getModelRoute() + '/list/upload',
                dataType: 'json',
                done: function (e, data) {
                    let self = this;
                    $('#file_progress_' + self.id).fadeTo(0, 'slow');
                    $('#file_' + self.id).val('')
                    $('#file_chosen_' + self.id).empty()
                    $.each(data.files, function (index, file) {
                        let sFileName = file.name
                        let sExistingVal = $('#file_' + self.id).val().length > 0 ? $('#file_' + self.id).val() + ',' : ''
                        $('#file_' + self.id).val(sExistingVal + sFileName)
                        $('#file_chosen_' + self.id).append(sFileName + '<br>')
                    });
                },
                start: function (e) {
                    let self = this;
                    $('#file_progress_' + self.id).fadeTo('fast', 1);
                    $('#file_progress_' + self.id).find('.meter').removeClass('green');
                },
                progress: function (e, data) {
                    let self = this
                    let progress = parseInt(data.loaded / data.total * 100, 10);

                    $('#file_progress_' + self.id + ' .meter').addClass('green').css(
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
            self.getModalElement().one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('New ' + self.singleModelName);
                modal.find('.modal-body').html(self.managedGridView.getModalForm());

                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    self.managedGridView.create($.unserialize(modal.find('form').serialize()));
                    self.getModalElement().modal('hide');
                });

            });
            self.getModalElement().modal('show');

        },
        deleteCheckedRows: function (e) {
            let self = this;
            e.preventDefault();
            if ($(e.target).hasClass('disabled')) {
                growl('Please check a box to delete a ' + self.singleModelName + '.');
                return;
            }
            bootbox.confirm("Do you really want to delete the checked " + self.managedGridView.modelNameLabel + "?", function (bConfirmed) {
                if (bConfirmed) {
                    let selectedModels = self.managedGridView.backgrid.getSelectedModels();
                    // clear or else the previously selected models remain as undefined
                    try {
                        self.managedGridView.backgrid.clearSelectedModels();
                    } catch (e) {
                    }
                    _log('App.Views.GridManagerContainerToolbar.deleteCheckedRows', {viewName: self.viewName, 'selectedModels': selectedModels});
                    let modelIDs = _.map(selectedModels, function (model) {
                        return model.get(self.managedGridView.model.idAttribute);
                    });

                    self.managedGridView.batchDestroy({deleteModelIDs: modelIDs});
                }
            });
        },
        clearStoredColumnState(e) {
            let self = this;
            e.preventDefault();
            if (!_.isUndefined(self.managedGridView.gridColumnSaveStateKey) && localStorage.getItem(self.managedGridView.gridColumnSaveStateKey)) {
                growl('Resetting ' + self.managedGridView.modelNameLabel + ' columns. Please wait while the page refreshes.', 'success');
                localStorage.removeItem(self.managedGridView.gridColumnSaveStateKey);
                location.reload();
            } else {
                growl('Automatically resetting ' + self.managedGridView.modelNameLabel + ' columns is not possible at the moment, Sorry. If you know how to, you can manually clear your browsers local storage using your browsers Dev Tool inspector or you can clear your browser history cache.', 'error');
            }
        },
        editGridRow: function (e) {
            let self = this;
            e.preventDefault();
            self.getModalElement().off().one('show.bs.modal', function (event) {
                let $modal = $(this);
                $modal.find('.modal-title').html('Edit ' + self.singleModelName);
                $modal.find('.modal-body').html(self.managedGridView.getEditForm());

                $modal.find('.save.btn').off().one('click', function (e) {
                    e.preventDefault();

                    let data = $.unserialize($modal.find('form').serialize());
                    // fix multi valued select values
                    // untested!!!!!!
                    _.each(data,  function (value,idx) {
                        if (_.isArray(value)) {
                            data[idx] = value.join();
                            console.log(idx, data[idx])
                        }
                    });

                    self.managedGridView.saveEditForm(data);
                    self.getModalElement().modal('hide');
                });

            });
            self.getModalElement().modal('show');

        },
        setStickyColumns: function (colIdx) {
            let self = this;
            // Doesn't work yet.
            return;

            self.managedGridView.find('.cloned-backgrid-table-wrapper').remove();
            let left = 0;
            let $backgridTable = self.managedGridView.find('table.backgrid');
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

        }
    });

    App.Views.ManagedGrid = App.Views.Backend.fullExtend({
        bModelExpected: true,
        events: {
            'focusin tbody tr': 'refreshView',
            'mouseenter thead th button': 'showColumnHeaderLabel',
            'mouseenter tbody td': 'showTruncatedCellContentPopup',
            'mouseleave tbody td': 'hideTruncatedCellContentPopup',
            'click tbody td': 'hideTruncatedCellContentPopup',
            'click .overlay-top,.overlay-bottom': 'showRadioBtnEditHelpMsg',
        },
        _initialize: function (options) {
            let self = this;

            try {
                _.bindAll(self,
                    'close',
                    'removeChildViews',
                    'getViewClassName',
                    'batchDestroy',
                    'getModalForm',
                    'getModelRoute',
                    'hideTruncatedCellContentPopup',
                    'positionOverlays',
                    '_refreshView',
                    'renderGrid',
                    'setCurrentRow',
                    'setModelRoute',
                    'showColumnHeaderLabel',
                    'showRadioBtnEditHelpMsg',
                    'showTruncatedCellContentPopup',
                    'toggleDeleteBtn',
                    'refocusGridRecord',
                    'getViewDataStore',
                    'setViewDataStoreValue',
                    'removeViewDataStore',
                    'setGridManagerContainerToolbar',
                    'update'
                );
            } catch (e) {
                console.error(options, e)
            }
            self.childViews = [];
            self.options = options;
            self._validateRequiredOptions(options);
            self.model = !_.isUndefined(self.model) ? self.model : !_.isUndefined(self.options.model) ? self.options.model : null;
            self.setModelRoute();
            self.setViewName();
            self.mainApp = self.options.mainApp;

            self.rowBgColor = 'lightYellow';
            self.$currentRow = null;
            self.currentModelID = null;

            if (_.isUndefined(self.options.ajaxWaitingTargetClassSelector)) {
                console.error("options.ajaxWaitingTargetClassSelector is a required option", self);
                throw "options.ajaxWaitingTargetClassSelector is a required option";
            }
            self.ajaxWaitingTargetClassSelector = self.options.ajaxWaitingTargetClassSelector;

            if (_.isUndefined(self.options.currentModelIDDataStoreSelector)) {
                console.error("options.currentModelIDDataStoreSelector is a required option", self);
                throw "options.currentModelIDDataStoreSelector is a required option";
            }
            self.currentModelIDDataStoreSelector = self.options.currentModelIDDataStoreSelector;
            if (_.isUndefined(self.options.columnCollectionDefinitions)) {
                console.error("options.columnCollectionDefinitions is a required option", self);
                throw "options.columnCollectionDefinitions is a required option";
            }
            self.columnCollectionDefinitions = self.options.columnCollectionDefinitions;
            if (_.isUndefined(self.options.parentView)) {
                console.error("options.parentView is a required option", self);
                throw "options.parentView is a required option";
            }
            self.parentView = self.options.parentView;

            self.$gridManagerContainerToolbar = null;

            if (_.isUndefined(self.options.modelNameLabel)) {
                console.error("options.modelNameLabel is a required option", self);
                throw "options.modelNameLabel is a required option";
            }
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();

            if (_.isUndefined(self.options.model)) {
                console.error("options.model is a required option", self);
                throw "options.model is a required option";
            }

            self.gridColumnSaveStateKey = '';
        },
        setGridManagerContainerToolbar: function ($gridManagerContainerToolbar) {
            let self = this;
            self.$gridManagerContainerToolbar = $gridManagerContainerToolbar;
        },
        renderGrid: function (e, saveStateKey) {
            let self = this;
            let colVisibilityControl, sizeAbleCol, sizeHandler, orderHandler, Header, hideCellCnt, initialColumnsVisible, colManager;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            self.$el.empty();
            self.columnCollectionDefinitions = self.options.columnCollectionDefinitions;
            self.columnCollection = self.columnCollectionDefinitions;
            self.gridColumnSaveStateKey = 'backgrid-colmgr-' + saveStateKey;
            if (App.Vars.bAllowManagedGridColumns) {
                hideCellCnt = self.options.hideCellCnt;
                self.columnCollection = new Backgrid.Extension.OrderableColumns.orderableColumnCollection(self.columnCollectionDefinitions);
                self.columnCollection.setPositions().sort();
                initialColumnsVisible = this.columnCollectionDefinitions.length - hideCellCnt;
                colManager = new Backgrid.Extension.ColumnManager(self.columnCollection, {
                    initialColumnsVisible: initialColumnsVisible,
                    trackSize: true,
                    trackOrder: true,
                    trackVisibility: true,
                    saveState: App.Vars.bBackgridColumnManagerSaveState,
                    saveStateKey: self.gridColumnSaveStateKey,
                    loadStateOnInit: App.Vars.bBackgridColumnManagerLoadStateOnInit,
                    stateChecking: "strict"
                });

                colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                    columnManager: colManager
                });
            }

            Header = Backgrid.Header;
            self.backgrid = new Backgrid.Grid({
                header: Header,
                columns: self.columnCollection,
                collection: self.collection
            });
            self.listenTo(self.backgrid, 'backgrid:rendered', function (e) {
                //console.log('set current row and set current-model-id in storage when backgrid:rendered',self.viewName)
                let currentModelID = self.setCurrentRow(e);
                self.setViewDataStoreValue('current-model-id', currentModelID);
            });

            self.$gridContainer = self.$el.html(self.backgrid.render().el);

            self.$el.append('<div class="overlay-top"></div><div class="overlay-bottom"></div>');
            self.paginator = new Backgrid.Extension.Paginator({
                collection: self.collection
            });

            // Render the paginator
            self.parentView.$('.pagination-controls').html(self.paginator.render().el);

            if (App.Vars.bAllowManagedGridColumns) {
                // Add sizeable columns
                sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                    collection: self.collection,
                    columns: self.columnCollection,
                    grid: self.backgrid
                });
                self.$gridContainer.find('thead').before(sizeAbleCol.render().el);
                // Add resize handlers
                sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                    sizeAbleColumns: sizeAbleCol,
                    saveColumnWidth: true
                });
                self.$gridContainer.find('thead').before(sizeHandler.render().el);

                // Make columns reorderable
                orderHandler = new Backgrid.Extension.OrderableColumns({
                    grid: self.backgrid,
                    sizeAbleColumns: sizeAbleCol
                });
                self.$gridContainer.find('thead').before(orderHandler.render().el);

                self.parentView.$('.columnmanager-visibilitycontrol-container').html(colVisibilityControl.render().el);
            }

            // When a backgrid cell's model is updated it will trigger a 'backgrid:edited' event which will bubble up to the backgrid's collection
            self.listenTo(self.backgrid.collection, 'backgrid:editing', self.refreshView);

            self.listenTo(self.backgrid.collection, 'reset', self.refreshView);

            self.listenTo(self.backgrid.collection, 'backgrid:edited', self.update);

            self.listenTo(self.backgrid.collection, 'backgrid:selected', self.toggleDeleteBtn);

            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            //_log('App.Views.ProjectTab.render', self.options.tab, 'Set the current model id on the tab so we can reference it in other views. self.model:', self.model);

            // Show a popup of the text that has been truncated
            self.$gridContainer.find('table tbody tr td[class^="text"],table tbody tr td[class^="string"],table tbody tr td[class^="number"],table tbody tr td[class^="integer"]').popover({
                placement: 'auto right',
                padding: 0,
                container: 'body',
                content: function () {
                    return $(this).text()
                }
            });
            // hide popover if it is not overflown
            let $cells = self.$gridContainer.find('td[class^="text"],td[class^="string"],td[class^="number"],td[class^="integer"]');
            self.listenTo($cells, 'show.bs.popover', function (e) {
                let element = this;

                let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
                if (!bOverflown) {
                    self.$gridContainer.find('td.renderable').popover('hide')
                }
            });

            let $cell = self.$gridContainer.find('td');
            self.listenTo($cell, 'click', function (e) {
                self.$gridContainer.find('td.renderable').popover('hide')
            });

            self.childViews.push(self.backgrid);
            self.childViews.push(self.paginator);
            if (App.Vars.bAllowManagedGridColumns) {
                self.childViews.push(colVisibilityControl);
                self.childViews.push(sizeAbleCol);
                self.childViews.push(sizeHandler);
                self.childViews.push(orderHandler);
            }
        },
        _refreshView: function (e) {
            let self = this;
            let currentModelID;

            /**
             * The checkbox does not select the record/row
             */
            if (!_.isUndefined(e.target) && e.target.nodeName === 'INPUT' && e.target.type === 'checkbox') {
                return;
            }
            //_log(self.getViewClassName() + '.updateProjectTabView.event', 'event triggered:', e);
            currentModelID = self.setCurrentRow(e);

            self.positionOverlays(self.backgrid);
            //$('#' + this.options.tab).data('current-model-id')
            //console.log('_refreshView current row should be set', {viewName:self.viewName});
            //console.log('_refreshView current model id should be set to currentModelID value in storage', {viewName:self.viewName, currentModelID:currentModelID});
            if (App.Vars.mainAppDoneLoading && currentModelID && self.getViewDataStore('current-model-id') !== currentModelID) {
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                // Refresh tabs on new row select
                self.model.url = self.getModelUrl(currentModelID);
                self.model.fetch({
                    reset: true,
                    success: function (model, response, options) {
                        //console.log('_refreshView', {viewName: self.viewName, 'self.model': self.model, model:model});
                        self.currentModelID = self.model.get(self.model.idAttribute);
                        self.setViewDataStoreValue('current-model-id', self.model.get(self.model.idAttribute));
                        //console.log('_refreshView set current-model-id in storage', self.viewName, currentModelID, self.model)
                        window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                    },
                    error: function (model, response, options) {
                        window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                        growl(response.msg, 'error')
                    }
                });

            } else if (App.Vars.mainAppDoneLoading && !currentModelID) {
                //console.log('_refreshView set current-model-id in storage but did not fetch new model', self.viewName, currentModelID, self.model)
                self.setViewDataStoreValue('current-model-id', currentModelID);
            }

        },
        setCurrentRow: function (e) {
            let self = this;
            let currentModelID = null;
            let $RadioElement = null;
            let $TableRowElement = null;
            //console.log('setCurrentRow',{e:e})
            if (typeof e === 'object' && !_.isUndefined(e.fullCollection)) {

                if (e.fullCollection.models.length) {
                    $RadioElement = self.$gridContainer.find('input[type="radio"][name="' + self.model.idAttribute + '"][value="' + e.fullCollection.models[0].get(self.model.idAttribute) + '"]');
                    $TableRowElement = $RadioElement.parents('tr');
                }

            } else if (typeof e === 'object' && !_.isUndefined(e.id) && !_.isUndefined(e.attributes)) {

                $RadioElement = self.$gridContainer.find('input[type="radio"][name="' + self.model.idAttribute + '"][value="' + e.id + '"]');
                $TableRowElement = $RadioElement.parents('tr');
            } else if (typeof e === 'object' && !_.isUndefined(e.target)) {

                $TableRowElement = $(e.currentTarget);
                $RadioElement = $TableRowElement.find('input[type="radio"][name="' + self.model.idAttribute + '"]');
            } else if (typeof e === 'object' && !_.isUndefined(e.$el) && e.$el.hasClass('backgrid')) {

                if (!_.isNumber(self.getViewDataStore('current-model-id')) || _.isUndefined(self.$gridContainer)) {
                    $TableRowElement = e.$el.find('tbody tr:first-child');
                    $RadioElement = $TableRowElement.find('input[type="radio"][name="' + self.model.idAttribute + '"]');
                } else {
                    $RadioElement = self.$gridContainer.find('input[type="radio"][name="' + self.model.idAttribute + '"][value="' + self.getViewDataStore('current-model-id') + '"]');
                    $TableRowElement = $RadioElement.parents('tr');
                }

            }
            self.$currentRow = $TableRowElement;

            if ($RadioElement !== null && $TableRowElement !== null) {
                // click is only a visual indication that the row is selected. nothing should be listening for this click
                $RadioElement.trigger('click');
                currentModelID = $RadioElement.val();

                // Highlight row
                $TableRowElement.siblings().removeAttr('style');
                $TableRowElement.css('background-color', App.Vars.rowBgColorSelected);
            }
            try {
                self.positionOverlays(e);
            } catch (e) {
            }

            return currentModelID;
        },
        refocusGridRecord: function () {
            let self = this;
            let recordIdx = 1;
            if (_.isNumber(self.getViewDataStore('current-model-id'))) {
                self.paginator.collection.fullCollection.each(function (model, idx) {
                    if (model.get(self.model.idAttribute) == self.getViewDataStore('current-model-id')) {
                        recordIdx = idx;
                    }
                });
                recordIdx = recordIdx === 0 ? 1 : recordIdx;
                let page = Math.ceil(recordIdx / self.paginator.collection.state.pageSize);
                if (page > 1) {
                    _.each(self.paginator.handles, function (handle, idx) {
                        if (handle.pageIndex == page && handle.label == page) {
                            //console.log(handle, handle.pageIndex, handle.el)
                            $(handle.el).find('a').trigger('click')
                        }
                    })
                }
                //console.log(recordIdx, this.paginator.collection.state.pageSize, page, this.backgrid, this.paginator, this.backgrid.collection)
                self.$el.find('input[type="radio"][name="' + self.model.idAttribute + '"][value="' + self.getViewDataStore('current-model-id') + '"]').parents('tr').trigger('focusin');
            }
        },
        showRadioBtnEditHelpMsg: function () {
            growl('Select/click the radio button at the beginning of the row to edit the data', 'info');
        },
        positionOverlays: function (e) {
            let self = this;
            let width;
            if (!_.isUndefined(self.$gridContainer)) {
                width = 0;
                self.$gridContainer.find('thead th:nth-child(n+3)').each(function (idx, el) {
                    width += parseInt($(el).outerWidth());
                });
                self.$el.find('.overlay-top,.overlay-bottom').css('width', width);
            } else {
                let ii = setInterval(function () {
                    let w = e.$el.find('thead th:nth-child(3)').outerWidth();

                    if (w > 0) {
                        width = 0;
                        e.$el.find('thead th:nth-child(n+3)').each(function (idx, el) {
                            width += parseInt($(el).outerWidth());
                        });
                        self.$el.find('.overlay-top,.overlay-bottom').css('width', width)
                        clearInterval(ii);
                    }
                }, 1000);
            }
            // get current row
            if (e && !self.$currentRow) {
                let $checkedInput = e.$el.find('[type="radio"][name="' + self.model.idAttribute + '"]:checked');
                if ($checkedInput.length) {
                    self.$currentRow = $checkedInput.parents('tr');
                }
            }

            if (!_.isNull(self.$currentRow) && !_.isUndefined(self.$currentRow[0])) {
                let rowHeight = self.$currentRow.outerHeight();
                let gridHeight = self.$currentRow.parents('.backgrid').outerHeight();
                //console.log('self.$currentRow', _.isUndefined(self.$currentRow[0].rowIndex), self.$currentRow)
                if (self.$el.find('table.backgrid tbody tr').length === 1) {
                    self.$el.find('.overlay-top,.overlay-bottom').hide();
                } else if (!_.isUndefined(self.$currentRow[0].rowIndex) && self.$currentRow[0].rowIndex === 1) {
                    self.$el.find('.overlay-top').hide();
                    self.$el.find('.overlay-bottom').show();
                    self.$el.find('.overlay-bottom').css({'top': (rowHeight * 2), 'height': gridHeight - (rowHeight * 2)})
                } else {
                    self.$el.find('.overlay-top').show();
                    self.$el.find('.overlay-top').css({'top': rowHeight, 'height': rowHeight * (self.$currentRow[0].rowIndex - 1)})
                    self.$el.find('.overlay-bottom').css({'top': (rowHeight * (1 + self.$currentRow[0].rowIndex)), 'height': gridHeight - (rowHeight * self.$currentRow[0].rowIndex) - rowHeight})
                }
            }
        },
        showColumnHeaderLabel: function (e) {
            let self = this;
            let $element = $(e.currentTarget).parents('th');
            let element = $element[0];

            let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
            if (bOverflown) {
                $element.attr('title', $element.find('button').text());
            }
            //_log(self.getViewClassName() + '.showColumnHeaderLabel.event', e);
        },
        showTruncatedCellContentPopup: function (e) {
            let self = this;

            let $element = $(e.currentTarget);
            let element = e.currentTarget;

            let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
            if (bOverflown) {
                $element.popover({
                    placement: 'auto auto',
                    padding: 0,
                    container: 'body',
                    content: function () {
                        return $(this).text()
                    }
                });
                $element.popover('show');
            }
            //_log('App.Views.SiteVolunteer.showTruncatedCellContent.event', e, element, bOverflown);
        },
        hideTruncatedCellContentPopup: function (e) {
            let self = this;

            let $element = $(e.currentTarget);
            let element = e.currentTarget;

            let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
            if (bOverflown) {
                $element.popover('hide');
            }
            //_log('App.Views.SiteVolunteer.hideTruncatedCellContent.event', e, element, bOverflown);
        },
        toggleDeleteBtn: function (e) {
            let self = this;
            let selectedModels = self.backgrid.getSelectedModels();
            let toggleState = selectedModels.length === 0 ? 'disable' : 'enable';
            _log(self.viewName + '.toggleDeleteBtn.event', {'selectedModels.length':selectedModels.length, e:e, toggleState: toggleState});
            console.log({viewName:self.viewName, toggleState: toggleState, gridManagerContainerToolbar: self.$gridManagerContainerToolbar})
            if (toggleState === 'disable') {
                self.$gridManagerContainerToolbar.$('.btnDeleteChecked').addClass('disabled');
            } else {
                self.$gridManagerContainerToolbar.$('.btnDeleteChecked').removeClass('disabled');
            }
        },
        batchDestroy: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);

            _log(self.viewName + ' batchDestroy', attributes);
            $.when(
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: self.getModelRoute() + '/batch/destroy',
                    data: attributes,
                    success: function (response) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.collection.url = self.getCollectionUrl();
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            _log(self.viewName + '.destroy.event', self.modelNameLabelLowerCase + ' collection fetch promise done');
                        });
                    },
                    fail: function (response) {
                        window.growl(response.msg, 'error');
                    }
                })
            ).then(function () {
                window.ajaxWaiting('remove', self.ajaxWaitingSelector);
            });

        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                console.log('update',{'self.model.idAttribute': self.model.idAttribute,'e.attributes[self.model.idAttribute]': e.attributes[self.model.idAttribute],e:e})
                let currentModelID = e.attributes[self.model.idAttribute];
                self.model.url = self.getModelUrl(currentModelID);
                $.when(
                    self.model.save(_.extend({[self.model.idAttribute]: currentModelID}, e.changed),
                        {
                            success: function (model, response, options) {
                                _log(self.viewName + '.update', self.modelNameLabelLowerCase + ' save', model, response, options);
                                growl(response.msg, response.success ? 'success' : 'error');
                            },
                            error: function (model, response, options) {
                                console.error(self.viewName + '.update', self.modelNameLabelLowerCase + ' save', model, response, options);
                                growl(response.msg, 'error');
                            }
                        })
                ).then(function () {
                    window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                });

            }
        },
        create: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', this.ajaxWaitingTargetClassSelector);

            _log(this.viewName + '.create', attributes, self.model);
            let newModel = self.model.clone().clear({silent: true});
            newModel.url = self.getModelUrl();
            $.when(
                newModel.save(attributes,
                    {
                        success: function (model, response, options) {
                            window.growl(response.msg, response.success ? 'success' : 'error');
                            self.collection.url = self.getCollectionUrl();
                            $.when(
                                self.collection.fetch({reset: true})
                            ).then(function () {
                                //initialize your views here
                                _log(self.viewName + '.create.event', self.modelNameLabelLowerCase + ' collection fetch promise done');
                            });
                        },
                        error: function (model, response, options) {
                            window.growl(response.msg, 'error');
                        }
                    })
            ).then(function () {
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        }

    });

    App.Views.ManagedGridTabs = App.Views.Backend.fullExtend({
        bModelExpected: false,
        events: {
            'shown.bs.tab a[data-toggle="tab"]': 'toggleTabToolbars',
            'clear-child-views': 'removeChildViews'
        },
        _initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'toggleTabsBox', 'removeChildViews', 'toggleTabToolbars', 'clearCurrentIds','fetchIfNewID');
            } catch (e) {
                console.error(options, e)
            }
            self.childViews = [];
            self.options = options;
            self._validateRequiredOptions(options);
            self.setModelRoute();
            this.setViewName();
            this.mainApp = this.options.mainApp;

            self.parentView = self.options.parentView;

            if (_.isUndefined(self.options.ajaxWaitingTargetClassSelector)) {
                console.error("options.ajaxWaitingTargetClassSelector is a required option", self);
                throw "options.ajaxWaitingTargetClassSelector is a required option";
            }
            self.ajaxWaitingTargetClassSelector = self.options.ajaxWaitingTargetClassSelector;

            if (_.isUndefined(self.options.managedGridView)) {
                console.error("options.managedGridView is a required option", self);
                throw "options.managedGridView is a required option";
            }
            self.managedGridView = self.options.managedGridView;

            self.childTabViews = [];
            self.childTabsGridManagerContainerToolbarViews = [];
            self.childViews = [];
            // self.model is App.Models.projectModel
            self.listenTo(self.model, "change", self.fetchIfNewID);
            self.listenTo(self.managedGridView, 'toggle-tabs-box', self.toggleTabsBox);
        },
        fetchIfNewID: function() {

        },
        toggleTabsBox: function () {
            let self = this;
            _log(self.viewName, 'self.managedGridView.collection.length:' + self.managedGridView.collection.length);

            if (self.managedGridView.collection.length === 0) {
                self.$el.find('.nav-tabs').hide();
                self.$el.find('.tabs-content-container').hide();
                self.$el.find('.box-footer').hide();
                self.mainApp.$('h3.box-title small').html('No projects created yet.');
            } else {
                self.$el.find('.nav-tabs').show();
                self.$el.find('.tabs-content-container').show();
                self.$el.find('.box-footer').show();
            }
        },
        toggleTabToolbars: function (e) {
            let self = this;

            let clickedTab = $(e.currentTarget).attr('aria-controls');
            self.managedGridView.setViewDataStoreValue('current-tab', clickedTab);
            //App.Vars.currentTabModels[clickedTab]
            self.parentView.$('.tab-grid-manager-container').hide();
            self.parentView.$('.' + clickedTab + '.tab-grid-manager-container').show();
            //console.log({clickedTab: clickedTab, parentView: self.parentView, tabButtonPane: self.parentView.$('.' + clickedTab + '.tab-grid-manager-container')})
            // Hack to force grid columns to work
            $('body').trigger('resize');
        },
        tabFetchSuccess: function (model, response, options) {
            //console.log('tabFetchSuccess',model, response, options)
        },
        removeChildViews: function () {
            let self = this;
            //console.log('App.Views.SiteProjectTabs removeChildViews ');
            _.each(this.childViews, function (view) {
                view.remove();
            });
            _log(self.viewName, '.removeChildViews.event', 'trigger removed-child-views');
            this.trigger('removed-child-views');
        },
        clearCurrentIds: function () {
            let self = this;
            let childTabViews = _.values(self.childTabViews);
            _.each(childTabViews, function (tab) {
                _.values(tab)[0].removeViewDataStore();
            });
        },
        updateMainAppBoxTitleContentPreFetchTabCollections: function (newId) {
            let self = this;
            self.mainApp.$('h3.box-title small').html('Updating Tabs. Please wait...');
        },
        updateMainAppBoxTitleContentPostFetchTabCollections: function (newId) {
            let self = this;
            self.mainApp.$('h3.box-title small').html('');
        }
    });
})(window.App);
