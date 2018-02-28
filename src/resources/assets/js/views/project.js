(function (App) {
    App.Views.ProjectGridManagerContainerToolbar = Backbone.View.extend({
        template: template('projectGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            $("#btnLogStored").click(function () {
                console.log(JSON.parse(localStorage.getItem("backgrid-colmgr")));
            });

            $("#btnClearStored").click(function () {
                localStorage.clear();
                //App.Vars.ProjectsBackgridColumnCollection.setPositions().sort();
            });
        },
        events: {},
        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });
    App.Views.Projects = Backbone.View.extend({
        initialize: function (options) {
            this.options = options;
            _.bindAll(this, 'update');
            this.rowBgColor = 'lightYellow';
            this.collection.bind('reset', this.render, this);
        },
        events: {
            'focusin tbody tr': 'updateProjectDataViews'
        },
        render: function () {
            var self = this;

            var Header = Backgrid.Extension.GroupedHeader;
            var backgrid = new Backgrid.Grid({
                header: Header,
                //row: FocusableRow,
                columns: App.Vars.ProjectsBackgridColumnCollection,
                collection: this.collection
            });

            // Hide db record foreign key ids
            var hideCellCnt = 9 + 25;
            var initialColumnsVisible = App.Vars.ProjectsBackgridColumnDefinitions.length - hideCellCnt;
            var colManager = new Backgrid.Extension.ColumnManager(App.Vars.ProjectsBackgridColumnCollection, {
                initialColumnsVisible: initialColumnsVisible,
                saveState: true,
                saveStateKey: 'projects',
                loadStateOnInit: true
            });
            // Add control
            var colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                columnManager: colManager
            });
            var $grid = this.$el.html(backgrid.render().el);

            this.projectGridManagerContainerToolbar = new App.Views.ProjectGridManagerContainerToolbar({
                el: '.projects-grid-manager-container'
            });
            this.projectGridManagerContainerToolbar.render();

            var paginator = new Backgrid.Extension.Paginator({
                collection: this.collection
            });

            // Render the paginator
            this.projectGridManagerContainerToolbar.$el.find('.project-pagination-controls').html(paginator.render().el);

            // Add sizeable columns
            var sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                collection: this.collection,
                columns: App.Vars.ProjectsBackgridColumnCollection,
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
            // this.options.mainAppEl is passed in through constructor
            this.projectGridManagerContainerToolbar.$el.append(colVisibilityControl.render().el);
            // App.Vars.currentProjectID = this.collection.at(0).get('ProjectID');
            // Set the "current project to load the tabbed project data"
            $grid.find('input[type="radio"][name="ProjectID"][value="' + App.Vars.currentProjectID + '"]').parents('tr').trigger('focusin');
            backgrid.collection.on('backgrid:edited', function (e) {
                //console.log('backgrid.collection.on', e)
                self.update(e);
            });
            return this;

        },
        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        updateProjectDataViews: function (e) {
            var self = this;
            var ProjectID = 0;
            // console.log(e)
            if (typeof e === 'object' && !_.isUndefined(e.target)) {
                var $TableRowElement = $(e.currentTarget);
                var $RadioElement = $TableRowElement.find('input[type="radio"][name="ProjectID"]');
                $RadioElement.trigger('click');
                ProjectID = $RadioElement.val();

                // Highlight row
                $TableRowElement.siblings().css('background-color', 'white');
                $TableRowElement.css('background-color', self.rowBgColor);
            }

            if (App.Vars.mainAppDoneLoading && ProjectID) {
                // Refresh tabs on new row select
                App.Models.projectModel.url = 'project/' + ProjectID;
                App.Models.projectModel.fetch({reset: true});
            }

        },
        update: function (e) {

            App.Models.projectModel.save(_.extend({ProjectID: e.attributes.ProjectID},e.changed),
                {
                    success: function (model, response, options) {
                        growl(response.msg, 'success')
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'success')
                    }
                });
        },
        remove: function () {
            // this.projectGridManagerContainerToolbar.remove();
            // this.$el.parents('.site-management-view').find('.backgrid-paginator').remove();
            return Backbone.View.prototype.remove.apply(this, arguments)
        }
    });
})(window.App);
