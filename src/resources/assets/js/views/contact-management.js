(function (App) {
    App.Views.ContactManagement = Backbone.View.extend({
        initialize: function (options) {
            this.options = options;
            _.bindAll(this, 'render', 'update', 'updateProjectTabView', 'getModalForm', 'create');
            this.rowBgColor = 'lightYellow';
            this.collection.bind('reset', this.render, this);
            _log('App.Views.ContactManagement.initialize', options);
        },
        events: {
            'click [data-widget="collapse"]': 'loadFirstTime'
        },
        render: function () {
            let self = this;
            this.hideCellCnt = this.options.hideCellCnt;
            this.$tabBtnPane = $(this.options.parentViewEl).find('.contacts-grid-manager-container');
            this.$tabBtnPanePaginationContainer = this.$tabBtnPane.find('.pagination-controls');
            this.model = this.collection.at(0);
            this.columnCollectionDefinitions = this.options.columnCollectionDefinitions;
            this.columnCollection = this.options.columnCollection;

            let Header = Backgrid.Extension.GroupedHeader;
            let backgrid = new Backgrid.Grid({
                header: Header,
                columns: this.columnCollection,
                collection: this.collection
            });

            let initialColumnsVisible = this.columnCollectionDefinitions.length - this.hideCellCnt;
            let colManager = new Backgrid.Extension.ColumnManager(this.columnCollection, {
                initialColumnsVisible: initialColumnsVisible,
                saveState: true,
                saveStateKey: 'contact-management',
                loadStateOnInit: true
            });
            // Add control
            let colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                columnManager: colManager
            });

            let $grid = this.$el.find('.contacts-backgrid-wrapper').html(backgrid.render().el);

            let paginator = new Backgrid.Extension.Paginator({
                collection: this.collection
            });

            // Render the paginator
            this.$tabBtnPanePaginationContainer.html(paginator.render().el);

            // Add sizeable columns
            let sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                collection: this.collection,
                columns: this.columnCollection,
                grid: backgrid
            });
            $grid.find('thead').before(sizeAbleCol.render().el);

            // Add resize handlers
            let sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                sizeAbleColumns: sizeAbleCol,
                saveColumnWidth: true
            });
            $grid.find('thead').before(sizeHandler.render().el);

            // Make columns reorderable
            let orderHandler = new Backgrid.Extension.OrderableColumns({
                grid: backgrid,
                sizeAbleColumns: sizeAbleCol
            });
            $grid.find('thead').before(orderHandler.render().el);
            this.$tabBtnPane.remove('.columnmanager-visibilitycontrol').append(colVisibilityControl.render().el);
            backgrid.collection.on('backgrid:edited', function (e) {
                self.update(e);
            });
            this.$el.data('current-model-id', this.model.get(this.model.idAttribute));
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

            if (App.Vars.mainAppDoneLoading && currentModelID && this.$el.data('current-model-id') != currentModelID) {
                // Refresh tabs on new row select
                this.model.url =  'contact/' + currentModelID;
                this.model.fetch({reset: true});
            }

        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                this.model.url = 'contact/' + currentModelID;
                this.model.save(_.extend({[self.model.idAttribute]: currentModelID}, e.changed),
                    {
                        success: function (model, response, options) {
                            _log('App.Views.ContactManagement.update',  'contact save', model, response, options);
                            growl(response.msg, response.success ? 'success' : 'error');
                        },
                        error: function (model, response, options) {
                            console.error('App.Views.ContactManagement.update',  'contact save', model, response, options)
                            growl(response.msg, 'error')
                        }
                    });
            } else {
            }
        },
        create: function (attributes) {

        },
        getModalForm: function () {
            return '';
        },
        loadFirstTime: function () {
            if (this.$el.find('.backgrid').length === 0) {
                this.render();
            }
        }
    });
})(window.App);
