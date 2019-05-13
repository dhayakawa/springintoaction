(function (App) {
    App.Views.ProjectTab = App.Views.ManagedGrid.fullExtend({
        initialize: function (options) {
            let self = this;
            this.options = options;
            this.childViews = [];
            this.currentModelID = null;
            this.$currentRow = null;
            _.bindAll(this, 'render', 'update', 'updateProjectTabView', 'getModalForm', 'create', 'destroy', 'toggleDeleteBtn', 'showColumnHeaderLabel', 'showTruncatedCellContentPopup', 'hideTruncatedCellContentPopup');
            self.backgridWrapperClassSelector = '.tab-content.backgrid-wrapper';
            _log('App.Views.ProjectTab.initialize', options);
        },
        events: {
            'focusin tbody tr': 'updateProjectTabView',
            'mouseenter thead th button': 'showColumnHeaderLabel',
            'mouseenter tbody td': 'showTruncatedCellContentPopup',
            'mouseleave tbody td': 'hideTruncatedCellContentPopup',
            'click .overlay-top,.overlay-bottom': 'showRadioBtnEditHelpMsg'
        },

        render: function (e) {
            let self = this;
            this.$el.empty();
            this.hideCellCnt = this.options.hideCellCnt;
            this.$tabBtnPane = $(this.options.parentViewEl).find('.' + this.options.tab + '.tabButtonPane');
            this.$tabBtnPanePaginationContainer = this.$tabBtnPane.find('.tab-pagination-controls');
            this.model = App.Vars.currentTabModels[this.options.tab];
            this.currentModelID = this.model.get(this.model.idAttribute);
            // Set the current model id on the tab so we can reference it in other views
            $('#' + this.options.tab).data('current-model-id', this.currentModelID);
            this.columnCollectionDefinitions = this.options.columnCollectionDefinitions;
            this.columnCollection = this.columnCollectionDefinitions;

            if (App.Vars.bAllowManagedGridColumns) {
                this.columnCollection = new Backgrid.Extension.OrderableColumns.orderableColumnCollection(this.columnCollectionDefinitions);
                this.columnCollection.setPositions().sort();
                let initialColumnsVisible = this.columnCollectionDefinitions.length - this.hideCellCnt;
                let colManager = new Backgrid.Extension.ColumnManager(this.columnCollection, {
                    initialColumnsVisible: initialColumnsVisible,
                    trackSize: true,
                    trackOrder: true,
                    trackVisibility: true,
                    saveState: App.Vars.bBackgridColumnManagerSaveState,
                    saveStateKey: 'site-project-tab-' + this.options.tab,
                    loadStateOnInit: App.Vars.bBackgridColumnManagerLoadStateOnInit,
                    stateChecking: "strict"
                });

                let colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                    columnManager: colManager
                });
            }
            let Header = Backgrid.Header;
            this.backgrid = new Backgrid.Grid({
                header: Header,
                columns: this.columnCollection,
                collection: this.collection
            });
            this.listenTo(this.backgrid, 'backgrid:rendered', function (e) {
                self.positionOverlays(e);
            });

            _log('App.Views.ProjectTab.render', this.options.tab, $(this.options.parentViewEl), this.$tabBtnPane, _.isUndefined(e) ? 'no event passed in for this call.' : e);

            let $gridContainer = this.$el.html(this.backgrid.render().el);
            this.$gridContainer = $gridContainer;
            this.$el.append('<div class="overlay-top"></div><div class="overlay-bottom"></div>');
            let paginator = new Backgrid.Extension.Paginator({
                collection: this.collection
            });

            // Render the paginator
            this.$tabBtnPanePaginationContainer.html(paginator.render().el);

            if (App.Vars.bAllowManagedGridColumns) {
                // Add sizeable columns
                let sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                    collection: this.collection,
                    columns: this.columnCollection,
                    grid: this.backgrid
                });
                $gridContainer.find('thead').before(sizeAbleCol.render().el);
                // Add resize handlers
                let sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                    sizeAbleColumns: sizeAbleCol,
                    saveColumnWidth: true
                });
                $gridContainer.find('thead').before(sizeHandler.render().el);

                // Make columns reorderable
                let orderHandler = new Backgrid.Extension.OrderableColumns({
                    grid: this.backgrid,
                    sizeAbleColumns: sizeAbleCol
                });
                $gridContainer.find('thead').before(orderHandler.render().el);

                this.$tabBtnPane.find('.columnmanager-visibilitycontrol-container').html(colVisibilityControl.render().el);
            }

            // When a backgrid cell's model is updated it will trigger a 'backgrid:edited' event which will bubble up to the backgrid's collection
            this.listenTo(this.backgrid.collection, 'backgrid:editing', function (e) {
                _log('App.Views.ProjectTab.render', self.options.tab, 'backgrid.collection.on backgrid:editing', e);
                self.updateProjectTabView(e);
            });

            this.listenTo(this.backgrid.collection, 'backgrid:edited', function (e) {
                self.update(e);
            });

            this.listenTo(this.backgrid.collection, 'backgrid:selected', function (e) {
                self.toggleDeleteBtn(e);
            });

            window.ajaxWaiting('remove', self.ajaxWaitingSelector);
            _log('App.Views.ProjectTab.render', this.options.tab, 'Set the current model id on the tab so we can reference it in other views. this.model:', this.model);

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
            this.listenTo($cells, 'show.bs.popover', function (e) {
                let element = this;

                let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
                if (!bOverflown) {
                    $gridContainer.find('td.renderable').popover('hide')
                }
            });

            let $cell = $gridContainer.find('td');
            this.listenTo($cell, 'click', function (e) {
                $gridContainer.find('td.renderable').popover('hide')
            });
            // $gridContainer.find('td').on('click', function () {
            //     $gridContainer.find('td.renderable').popover('hide')
            // });


            this.childViews.push(this.backgrid);
            this.childViews.push(this.projectGridManagerContainerToolbar);
            this.childViews.push(this.paginator);
            if (App.Vars.bAllowManagedGridColumns) {
                this.childViews.push(colVisibilityControl);
                this.childViews.push(sizeAbleCol);
                this.childViews.push(sizeHandler);
                this.childViews.push(orderHandler);
            }

            return this;
        },

        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        updateProjectTabView: function (e) {
            let self = this;
            let currentModelID = 0;
            let $RadioElement = null;
            let $TableRowElement = null;
            _log('App.Views.ProjectTab.updateProjectTabView.event', 'event triggered:', e);
            if (typeof e === 'object' && !_.isUndefined(e.id) && !_.isUndefined(e.attributes)) {
                $RadioElement = self.$gridContainer.find('input[type="radio"][name="' + this.model.idAttribute + '"][value="' + e.id + '"]');
                $TableRowElement = $RadioElement.parents('tr');
            } else if (typeof e === 'object' && !_.isUndefined(e.target)) {
                $TableRowElement = $(e.currentTarget);
                $RadioElement = $TableRowElement.find('input[type="radio"][name="' + this.model.idAttribute + '"]');
            } else if (typeof e === 'object' && !_.isUndefined(e.data)) {
                if (self.$gridContainer.find('[type="radio"][name="ProjectID"]:checked').length === 0){
                    $TableRowElement = self.$gridContainer.find('tbody tr:first-child');
                    $RadioElement = $TableRowElement.find('input[type="radio"]');
                } else {
                    $RadioElement = self.$gridContainer.find('[type="radio"][name="ProjectID"]:checked');
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
            self.positionOverlays(self.backgrid);
            if (App.Vars.mainAppDoneLoading && currentModelID && $('#' + this.options.tab).data('current-model-id') !== currentModelID) {
                window.ajaxWaiting('show', self.backgridWrapperClassSelector);
                // Refresh tabs on new row select
                this.model.url = '/admin/' + self.options.tab + '/' + currentModelID;
                this.model.fetch({
                    reset: true,
                    success: function (model, response, options) {
                        self.currentModelID = self.model.get(self.model.idAttribute);
                        $('#' + self.options.tab).data('current-model-id', self.currentModelID);
                        //console.log('tab model fetch', self.options.tab, currentModelID, self.model)
                        window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                    },
                    error: function (model, response, options) {
                        window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                        growl(response.msg, 'error')
                    }
                });

            }

        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                let attributes = _.extend({[self.model.idAttribute]: currentModelID}, e.changed);
                if (attributes['ProjectID'] === '') {
                    attributes['ProjectID'] = App.Vars.currentProjectID;
                }
                window.ajaxWaiting('show', self.backgridWrapperClassSelector);
                console.log('App.Views.ProjectTab.update', self.options.tab, {eChanged: e.changed, saveAttributes: attributes, tModel: this.model});
                this.model.url = '/admin/' + self.options.tab + '/' + currentModelID;
                this.model.save(attributes,
                    {
                        success: function (model, response, options) {
                            _log('App.Views.ProjectTab.update', self.options.tab + ' save', model, response, options);
                            window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                            growl(response.msg, response.success ? 'success' : 'error');
                        },
                        error: function (model, response, options) {
                            console.error('App.Views.ProjectTab.update', self.options.tab + ' save', model, response, options);
                            window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                            growl(response.msg, 'error')
                        }
                    });
            } else {
            }
        },
        create: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', self.backgridWrapperClassSelector);

            let model = this.model.clone().clear({silent: true});
            console.log('App.Views.ProjectTab.create', self.options.tab, {attributes: attributes, model: model, thisModel: this.model});
            model.url = '/admin/' + self.options.tab;
            model.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.collection.url = '/admin/' + self.options.tab + '/all/' + App.Models.projectModel.get(App.Models.projectModel.idAttribute);
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            _log('App.Views.ProjectTab.create.event', self.options.tab + ' collection fetch promise done');
                            window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error');
                        window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                    }
                });
        },
        toggleDeleteBtn: function (e) {
            let self = this;
            let selectedModels = self.backgrid.getSelectedModels();
            _log('App.Views.ProjectTab.toggleDeleteBtn.event', self.options.tab, 'selectedModels.length:' + selectedModels.length, e);
            let toggleState = selectedModels.length === 0 ? 'disable' : 'enable';
            App.Views.siteProjectTabsView.trigger('toggle-delete-btn', {toggle: toggleState, tab: self.options.tab});
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
                    window.ajaxWaiting('show', self.backgridWrapperClassSelector);

                    attributes = _.extend(attributes, {
                        ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute),
                        ProjectRoleID: self.model.get('ProjectRoleID')
                    });
                    // console.log('App.Views.ProjectTab.destroy', self.options.tab, attributes, 'deleteCnt:' + deleteCnt, 'self.collection.fullCollection.length:' +
                    //                                                                                                     self.collection.fullCollection.length, self.model);
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: '/admin/' + self.options.tab + '/batch/destroy',
                        data: attributes,
                        success: function (response) {
                            window.growl(response.msg, response.success ? 'success' : 'error');
                            self.collection.url = '/admin/' + self.options.tab + '/all/' + App.Models.projectModel.get(App.Models.projectModel.idAttribute);
                            $.when(
                                self.collection.fetch({reset: true})
                            ).then(function () {
                                _log('App.Views.ProjectTab.destroy.event', self.options.tab + ' collection fetch promise done');
                                window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                            });
                        },
                        fail: function (response) {
                            window.growl(response.msg, 'error');
                            window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                        }
                    })
                }
            });

        },

    });
})(window.App);
