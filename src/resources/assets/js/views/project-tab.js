(function (App) {
    App.Views.ProjectTab = Backbone.View.extend({
        initialize: function (options) {
            this.options = options;
            _.bindAll(this, 'render', 'update', 'updateProjectTabView', 'getModalForm', 'create', 'destroy');
            this.rowBgColor = 'lightYellow';
            // apparently backgrid is managing the collection reset thing
            //this.collection.bind('reset', this.render, this);
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
                saveState: true,
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

            // since we're appending and not replacing we need to remove the last visibility control
            this.$tabBtnPane.find('.columnmanager-visibilitycontrol-container').html(colVisibilityControl.render().el);

            // When a backgrid cell's model is updated it will trigger a 'backgrid:edited' event which will bubble up to the backgrid's collection
            this.backgrid.collection.on('backgrid:edited', function (e) {
                self.update(e);
            });
            // Set the current model id on the tab so we can reference it in other views
            $('#' + this.options.tab).data('current-model-id', this.model.get(this.model.idAttribute));

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
                $TableRowElement.siblings().css('background-color', 'white');
                $TableRowElement.css('background-color', self.rowBgColor);

            }

            if (App.Vars.mainAppDoneLoading && currentModelID && $('#' + this.options.tab).data('current-model-id') != currentModelID) {
                // Refresh tabs on new row select
                this.model.url = self.options.tab + '/' + currentModelID;
                this.model.fetch({reset: true});
            }

        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                this.model.url = self.options.tab + '/' + currentModelID;
                this.model.save(_.extend({[self.model.idAttribute]: currentModelID}, e.changed),
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
            _log('App.Views.ProjectTab.create', self.options.tab, attributes, this.model);
            this.model.url = self.options.tab;
            this.model.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.collection.url = 'project/' + self.options.tab + 's/' + App.Models.projectModel.get(App.Models.projectModel.idAttribute);
                        self.collection.fetch({reset: true});
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error')
                    }
                });
        },
        getModalForm: function () {
            return '';
        },
        destroy: function (attributes) {
            var self = this;
            e.preventDefault();

            bootbox.confirm("Do you really want to delete the checked " + self.options.tab + "s?", function (bConfirmed) {
                if (bConfirmed) {
                    attributes = _.extend(attributes, {
                        ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute),
                        ProjectRoleID: self.model.get('ProjectRoleID')
                    });
                    _log('App.Views.ProjectTab.destroy', self.options.tab, attributes);
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: self.options.tab + '/batch/destroy',
                        data: attributes,
                        success: function (response) {
                            window.growl(response.msg, response.success ? 'success' : 'error');
                            self.collection.url = 'project/' + self.options.tab + 's/' + App.Models.projectModel.get(App.Models.projectModel.idAttribute);
                            self.collection.fetch({reset: true});
                        },
                        fail: function (response) {
                            window.growl(response.msg, 'error')
                        }
                    })
                }
            });

        }
    });
})(window.App);
