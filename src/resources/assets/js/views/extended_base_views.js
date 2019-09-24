(function (App) {
    App.Views.Backend = Backbone.View.extend({
        _initialize: function (options) {
            let self = this;
            self.childViews = [];
            self.options = options;
            if (_.isUndefined(self.options.mainApp)) {
                throw self.options.viewName + " options.mainApp is a required option";
            }
            self.mainApp = self.options.mainApp;
            _.bindAll(self, 'close', 'getViewDataStore','setViewDataStoreValue','removeViewDataStore','removeChildViews', 'getViewClassName');

        },
        close: function () {
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
            return self.getModalElement();
        },
        getViewDataStore: function (data) {
            let self = this;
            let dataStore = localStorage.getItem(self.viewName);

            if (dataStore) {
                dataStore = JSON.parse(dataStore);
                if (!_.isUndefined(data) && !_.isUndefined(dataStore[data])) {
                    return dataStore[data];
                } else {
                    dataStore = {};
                }
            } else {
                dataStore = {};
            }

            return dataStore;
        },
        setViewDataStoreValue: function (data, value) {
            let self = this;
            let dataStore = self.getViewDataStore();
            dataStore[data] = value;
            localStorage.setItem(self.viewName, JSON.stringify(dataStore));
        },
        removeViewDataStore: function () {
            let self = this;

            localStorage.removeItem(self.viewName);
        },
    });

    App.Views.ManagedGrid = App.Views.Backend.fullExtend({
        _initialize: function (options) {
            let self = this;
            self.childViews = [];
            self.options = options;

            _.bindAll(
                self,
                'close',
                'removeChildViews',
                'getViewClassName',
                '_destroy',
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
                'removeViewDataStore'
            );
            self.rowBgColor = 'lightYellow';
            self.$currentRow = null;
            self.currentModelID = null;

            if (_.isUndefined(self.options.ajaxWaitingTargetClassSelector)) {
                throw "options.ajaxWaitingTargetClassSelector is a required option";
            }
            self.ajaxWaitingTargetClassSelector = self.options.ajaxWaitingTargetClassSelector;

            if (_.isUndefined(self.options.viewName)) {
                throw "options.viewName is a required option";
            }
            self.viewName = self.options.viewName;

            if (_.isUndefined(self.options.mainApp)) {
                throw "options.mainApp is a required option";
            }
            self.mainApp = self.options.mainApp;
            if (_.isUndefined(self.options.currentModelIDDataStoreSelector)) {
                throw "options.currentModelIDDataStoreSelector is a required option";
            }
            self.currentModelIDDataStoreSelector = self.options.currentModelIDDataStoreSelector;
            if (_.isUndefined(self.options.columnCollectionDefinitions)) {
                throw "options.columnCollectionDefinitions is a required option";
            }
            self.columnCollectionDefinitions = self.options.columnCollectionDefinitions;
            if (_.isUndefined(self.options.parentView)) {
                throw "options.parentView is a required option";
            }
            self.parentView = self.options.parentView;
            if (_.isUndefined(self.options.backgridWrapperClassSelector)) {
                throw "options.backgridWrapperClassSelector is a required option";
            }
            self.backgridWrapperClassSelector = self.options.backgridWrapperClassSelector;
            if (_.isUndefined(self.options.gridManagerContainerToolbarClassName)) {
                throw "options.gridManagerContainerToolbarClassName is a required option";
            }
            self.gridManagerContainerToolbarClassName = self.options.gridManagerContainerToolbarClassName;
            self.gridManagerContainerToolbarSelector = '.' + self.gridManagerContainerToolbarClassName;
            self.$gridManagerContainer = self.parentView.$(self.gridManagerContainerToolbarSelector);

            if (_.isUndefined(self.options.modelNameLabel)) {
                throw "options.modelNameLabel is a required option";
            }
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();

            if (_.isUndefined(self.options.model)) {
                throw "options.model is a required option";
            }
            self.model = !_.isUndefined(self.model) ? self.model : !_.isUndefined(self.options.model) ? self.options.model : null;
            if (_.isUndefined(self.model) || _.isNull(self.model)) {
                //console.log('missing model', options, self.options.model);
                self.modelRoute = null;
            } else {
                //console.log(' model', self.model, self.model._super.idAttribute, self.model._super.url);
                if (!_.isUndefined(self.model.__proto__.url)) {
                    self.setModelRoute(self.model.__proto__.url);
                } else {
                    self.setModelRoute('');
                }
            }
        },
        events: {
            'focusin tbody tr': 'refreshView',
            'mouseenter thead th button': 'showColumnHeaderLabel',
            'mouseenter tbody td': 'showTruncatedCellContentPopup',
            'mouseleave tbody td': 'hideTruncatedCellContentPopup',
            'click tbody td': 'hideTruncatedCellContentPopup',
            'click .overlay-top,.overlay-bottom': 'showRadioBtnEditHelpMsg',
        },
        renderGrid: function(e, saveStateKey){
            let self = this;
            let colVisibilityControl, sizeAbleCol, sizeHandler, orderHandler, Header, hideCellCnt, initialColumnsVisible, colManager;
            self.$el.empty();
if (self.viewName === 'project-leads'){
    console.log('renderGrid',self.viewName, self.getViewDataStore('current-model-id'))
}
            //this.model = App.Vars.currentTabModels[this.options.tab];
            //self.currentModelID = self.model.get(self.model.idAttribute);
            // Set the current model id on the tab so we can reference it in other views
            //$(self.currentModelIDDataStoreSelector).data('current-model-id', self.currentModelID);
            self.columnCollectionDefinitions = self.options.columnCollectionDefinitions;
            self.columnCollection = self.columnCollectionDefinitions;

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
                    saveStateKey: saveStateKey,
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
                self.setCurrentRow(e);
            });

            let $gridContainer = this.$el.html(self.backgrid.render().el);
            self.$gridContainer = $gridContainer;
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
                $gridContainer.find('thead').before(sizeAbleCol.render().el);
                // Add resize handlers
                sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                    sizeAbleColumns: sizeAbleCol,
                    saveColumnWidth: true
                });
                $gridContainer.find('thead').before(sizeHandler.render().el);

                // Make columns reorderable
                orderHandler = new Backgrid.Extension.OrderableColumns({
                    grid: self.backgrid,
                    sizeAbleColumns: sizeAbleCol
                });
                $gridContainer.find('thead').before(orderHandler.render().el);

                self.parentView.$('.columnmanager-visibilitycontrol-container').html(colVisibilityControl.render().el);
            }

            // When a backgrid cell's model is updated it will trigger a 'backgrid:edited' event which will bubble up to the backgrid's collection
            self.listenTo(self.backgrid.collection, 'backgrid:editing', function (e) {
                self.refreshView(e);
            });

            self.listenTo(self.backgrid.collection, 'backgrid:edited', function (e) {
                self.update(e);
            });

            self.listenTo(self.backgrid.collection, 'backgrid:selected', function (e) {
                self.toggleDeleteBtn(e);
            });

            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            //_log('App.Views.ProjectTab.render', self.options.tab, 'Set the current model id on the tab so we can reference it in other views. this.model:', self.model);

            // Show a popup of the text that has been truncated
            $gridContainer.find('table tbody tr td[class^="text"],table tbody tr td[class^="string"],table tbody tr td[class^="number"],table tbody tr td[class^="integer"]').popover({
                placement: 'auto right',
                padding: 0,
                container: 'body',
                content: function () {
                    return $(this).text()
                }
            });
            // hide popover if it is not overflown
            let $cells = $gridContainer.find('td[class^="text"],td[class^="string"],td[class^="number"],td[class^="integer"]');
            self.listenTo($cells, 'show.bs.popover', function (e) {
                let element = this;

                let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
                if (!bOverflown) {
                    $gridContainer.find('td.renderable').popover('hide')
                }
            });

            let $cell = $gridContainer.find('td');
            self.listenTo($cell, 'click', function (e) {
                $gridContainer.find('td.renderable').popover('hide')
            });

            self.childViews.push(self.backgrid);
            self.childViews.push(self.projectGridManagerContainerToolbar);
            self.childViews.push(self.paginator);
            if (App.Vars.bAllowManagedGridColumns) {
                self.childViews.push(colVisibilityControl);
                self.childViews.push(sizeAbleCol);
                self.childViews.push(sizeHandler);
                self.childViews.push(orderHandler);
            }
        },
        getModelRoute: function () {
            return this.modelRoute;
        },
        setModelRoute: function (modelRoute) {
            this.modelRoute = modelRoute;
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
            console.log('_refreshView',self.viewName, currentModelID,self.getViewDataStore('current-model-id'));
            if (App.Vars.mainAppDoneLoading && currentModelID && self.getViewDataStore('current-model-id') !== currentModelID) {
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                // Refresh tabs on new row select
                this.model.url = self.getModelRoute() + '/' + currentModelID;
                this.model.fetch({
                    reset: true,
                    success: function (model, response, options) {
                        self.currentModelID = self.model.get(self.model.idAttribute);
                        self.setViewDataStoreValue('current-model-id', self.model.get(self.model.idAttribute));
                        console.log('model fetch set current-model-id', self.viewName, currentModelID, self.model)
                        window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                    },
                    error: function (model, response, options) {
                        window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                        growl(response.msg, 'error')
                    }
                });

            }

        },
        setCurrentRow: function (e) {
            let self = this;
            let currentModelID = 0;
            let $RadioElement = null;
            let $TableRowElement = null;

            if (typeof e === 'object' && !_.isUndefined(e.id) && !_.isUndefined(e.attributes)) {

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
        getModalForm: function () {
            return '';
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
            _log(self.getViewClassName() + '.toggleDeleteBtn.event', selectedModels.length, e);
            let toggleState = selectedModels.length === 0 ? 'disable' : 'enable';
            //App.Views.siteManagementView.trigger('toggle-delete-btn', {toggle: toggleState});
            _log(self.getViewClassName() + '.toggleDeleteBtn.event', 'toggleState:' + toggleState, self.parentView.el);
            if (toggleState === 'disable') {
                self.parentView.$('.btn-delete-checked-models').addClass('disabled');
            } else {
                self.parentView.$('.btn-delete-checked-models').removeClass('disabled');
            }
        },
        _destroy: function (attributes, parentModelId) {
            let self = this;
            let deleteCnt = attributes.deleteModelIDs.length;
            let confirmMsg = "Do you really want to delete the checked " + self.modelNameLabel + "s?";
            if (deleteCnt === self.collection.fullCollection.length) {
                confirmMsg = "You are about to delete every checked " + self.modelNameLabel + ". Do you really want to" +
                             " continue with deleting them all?";
            }

            bootbox.confirm(confirmMsg, function (bConfirmed) {
                if (bConfirmed) {
                    window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);

                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: self.getModelRoute() + '/batch/destroy',
                        data: attributes,
                        success: function (response) {
                            window.growl(response.msg, response.success ? 'success' : 'error');
                            self.collection.url = self.getModelRoute() + '/all/' + parentModelId;
                            $.when(
                                self.collection.fetch({reset: true})
                            ).then(function () {
                                _log('App.Views.ProjectTab.destroy.event', self.modelNameLabel + ' collection fetch promise done');
                                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                            });
                        },
                        fail: function (response) {
                            window.growl(response.msg, 'error');
                            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                        }
                    })
                }
            });

        },

    });
})(window.App);
