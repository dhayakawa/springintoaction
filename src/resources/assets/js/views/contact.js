(function (App) {
    App.Views.Contact = Backbone.View.extend({
        initialize: function (options) {
            this.options = options;
            _.bindAll(this, 'update');
            this.$tabBtnPane = $(this.options.parentViewEl).find('.' + this.options.tab + '.tabButtonPane');
            this.$tabBtnPanePaginationContainer = this.$tabBtnPane.find('.tab-pagination-controls');
        },
        render: function () {
            var self = this;
            var Header = Backgrid.Extension.GroupedHeader;
            var backgrid = new Backgrid.Grid({
                header: Header,
                columns: App.Vars.ContactsBackgridColumnCollection,
                collection: this.collection
            });

            // Hide db record foreign key ids
            var hideCellCnt = 2;
            var initialColumnsVisible = App.Vars.ContactsBackgridColumnDefinitions.length - hideCellCnt;
            var colManager = new Backgrid.Extension.ColumnManager(App.Vars.ContactsBackgridColumnCollection, {
                initialColumnsVisible: initialColumnsVisible,
                saveState: true,
                saveStateKey: this.options.tab,
                loadStateOnInit: true
            });
            // Add control
            var colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                columnManager: colManager
            });
            this.$tabBtnPane.append(colVisibilityControl.render().el);

            var $grid = this.$el.html(backgrid.render().el);

            var paginator = new Backgrid.Extension.Paginator({
                collection: this.collection
            });

            // Render the paginator
            this.$tabBtnPanePaginationContainer.html(paginator.render().el);

            // Add sizeable columns
            var sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                collection: this.collection,
                columns: App.Vars.ContactsBackgridColumnCollection,
                grid: backgrid
            });
            $grid.find('thead').before(sizeAbleCol.render().el);

            // Add resize handlers
            var sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                sizeAbleColumns: sizeAbleCol,
                saveColumnWidth: true
            });
            $grid.find('thead').before(sizeHandler.render().el);

            // Make columns reorderable
            var orderHandler = new Backgrid.Extension.OrderableColumns({
                grid: backgrid,
                sizeAbleColumns: sizeAbleCol
            });
            $grid.find('thead').before(orderHandler.render().el);
            backgrid.collection.on('backgrid:edited', function (e) {
                self.update(e);
            });
            return this;
        },
        update: function (e) {

            App.Models.contactModel.save(_.extend({ContactID: e.attributes.ContactID}, e.changed),
                {
                    success: function (model, response, options) {
                        growl(response.msg, 'success')
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'success')
                    }
                });
        }
    });
})(window.App);
