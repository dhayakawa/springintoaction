(function (App) {
    App.Views.ProjectTab = Backbone.View.extend({
        initialize: function (options) {
            let self = this;
            this.options = options;
            _.bindAll(this, 'render', 'update', 'updateProjectTabView', 'getModalForm', 'create', 'destroy','toggleDeleteBtn');
            self.backgridWrapperClassSelector = '.tab-content.backgrid-wrapper';
            _log('App.Views.ProjectTab.initialize', options);
        },
        events: {
            'focusin tbody tr': 'updateProjectTabView'
        },
        render: function (e) {
            let self = this;
            this.hideCellCnt = this.options.hideCellCnt;
            this.$tabBtnPane = $(this.options.parentViewEl).find('.' + this.options.tab + '.tabButtonPane');
            this.$tabBtnPanePaginationContainer = this.$tabBtnPane.find('.tab-pagination-controls');
            this.model = App.Vars.currentTabModels[this.options.tab];
            this.columnCollectionDefinitions = this.options.columnCollectionDefinitions;

            this.columnCollection = new Backgrid.Extension.OrderableColumns.orderableColumnCollection(this.columnCollectionDefinitions);
            this.columnCollection.setPositions().sort();

            let Header = Backgrid.Extension.GroupedHeader;
            this.backgrid = new Backgrid.Grid({
                header: Header,
                columns: this.columnCollection,
                collection: this.collection
            });

            let initialColumnsVisible = this.columnCollectionDefinitions.length - this.hideCellCnt;
            let colManager = new Backgrid.Extension.ColumnManager(this.columnCollection, {
                initialColumnsVisible: initialColumnsVisible,
                trackSize: true,
                trackOrder: true,
                trackVisibility: true,
                saveState: App.Vars.bBackgridColumnManagerSaveState,
                saveStateKey: 'site-project-tab-' + this.options.tab,
                loadStateOnInit: true,
                stateChecking: "loose"
            });

            let colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                columnManager: colManager
            });
            _log('App.Views.ProjectTab.render', this.options.tab, $(this.options.parentViewEl), this.$tabBtnPane, _.isUndefined(e) ? 'no event passed in for this call.' : e);

            let $gridContainer = this.$el.html(this.backgrid.render().el);

            let paginator = new Backgrid.Extension.Paginator({
                collection: this.collection
            });

            // Render the paginator
            this.$tabBtnPanePaginationContainer.html(paginator.render().el);

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

            // When a backgrid cell's model is updated it will trigger a 'backgrid:edited' event which will bubble up to the backgrid's collection
            this.backgrid.collection.on('backgrid:edited', function (e) {
                self.update(e);
            });
            this.backgrid.collection.on('backgrid:selected', function (e) {
                self.toggleDeleteBtn(e);
            });
            window.ajaxWaiting('remove', self.ajaxWaitingSelector);
            _log('App.Views.ProjectTab.render', this.options.tab, 'Set the current model id on the tab so we can reference it in other views. this.model:', this.model);
            // Set the current model id on the tab so we can reference it in other views
            $('#' + this.options.tab).data('current-model-id', this.model.get(this.model.idAttribute));

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
            $gridContainer.find('td[class^="text"],td[class^="string"],td[class^="number"],td[class^="integer"]').on('show.bs.popover', function () {
                let element = this;

                let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
                if (!bOverflown) {
                    $gridContainer.find('td.renderable').popover('hide')
                }
            });

            return this;
        },
        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        updateProjectTabView: function (e) {
            let self = this;
            let currentModelID = 0;
            // console.log(e)
            if (typeof e === 'object' && !_.isUndefined(e.target)) {
                let $TableRowElement = $(e.currentTarget);
                let $RadioElement = $TableRowElement.find('input[type="radio"][name="' + this.model.idAttribute + '"]');
                // click is only a visual indication that the row is selected. nothing should be listening for this click
                $RadioElement.trigger('click');
                currentModelID = $RadioElement.val();

                // Highlight row
                $TableRowElement.siblings().removeAttr('style');
                $TableRowElement.css('background-color', App.Vars.rowBgColorSelected);

            }

            if (App.Vars.mainAppDoneLoading && currentModelID && $('#' + this.options.tab).data('current-model-id') !== currentModelID) {
                // Refresh tabs on new row select
                this.model.url = '/admin/' + self.options.tab + '/' + currentModelID;
                this.model.fetch({reset: true});
            }

        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                let attributes = _.extend({[self.model.idAttribute]: currentModelID}, e.changed);
                if (attributes['ProjectID'] === ''){
                    attributes['ProjectID'] = App.Vars.currentProjectID;
                }
                _log('App.Views.ProjectTab.update', self.options.tab, e.changed, attributes, this.model);
                this.model.url = '/admin/' + self.options.tab + '/' + currentModelID;
                this.model.save(attributes ,
                    {
                        success: function (model, response, options) {
                            _log('App.Views.ProjectTab.update', self.options.tab + ' save', model, response, options);
                            growl(response.msg, response.success ? 'success' : 'error');
                        },
                        error: function (model, response, options) {
                            console.error('App.Views.ProjectTab.update', self.options.tab + ' save', model, response, options);
                            growl(response.msg, 'error')
                        }
                    });
            } else {
            }
        },
        create: function (attributes) {
            var self = this;
            window.ajaxWaiting('show', self.backgridWrapperClassSelector);
            _log('App.Views.ProjectTab.create', self.options.tab, attributes, this.model);
            this.model.url = '/admin/' + self.options.tab;
            this.model.save(attributes,
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
        getModalForm: function () {
            return '';
        },
        toggleDeleteBtn: function (e) {
            var self = this;
            let selectedModels = self.backgrid.getSelectedModels();
            _log('App.Views.ProjectTab.toggleDeleteBtn.event', self.options.tab, selectedModels.length, e);
            let toggleState = selectedModels.length === 0 ? 'disable' : 'enable';
            App.Views.siteProjectTabsView.trigger('toggle-delete-btn', {toggle: toggleState, tab: self.options.tab});
        },
        destroy: function (attributes) {
            var self = this;

            bootbox.confirm("Do you really want to delete the checked " + self.options.tab + "s?", function (bConfirmed) {
                if (bConfirmed) {
                    window.ajaxWaiting('show', self.backgridWrapperClassSelector);
                    attributes = _.extend(attributes, {
                        ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute),
                        ProjectRoleID: self.model.get('ProjectRoleID')
                    });
                    _log('App.Views.ProjectTab.destroy', self.options.tab, attributes);
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

        }
    });
})(window.App);
