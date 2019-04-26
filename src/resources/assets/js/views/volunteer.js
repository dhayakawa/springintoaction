(function (App) {
    App.Views.ProjectLead = App.Views.ProjectTab.fullExtend({
        getModalForm: function () {
            let template = window.template('newProjectLeadTemplate');

            let volunteerSelect = new App.Views.Select({
                el: '',
                attributes: {id: 'selectVolunteerID', name: 'VolunteerID', class: 'form-control'},
                buildHTML: true,
                collection: App.Collections.projectVolunteersCollection,
                optionValueModelAttrName: 'VolunteerID',
                optionLabelModelAttrName: ['LastName', 'FirstName']
            });
            let tplVars = {
                ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute),
                volunteerSelect: volunteerSelect.getHtml(),
                projectRoleOptions: App.Models.volunteerModel.getRoleOptions(true),
                statusOptions: App.Models.volunteerModel.getStatusOptions(true)
            };
            return template(tplVars);
        }
    });
    App.Views.ProjectVolunteer = App.Views.ProjectTab.fullExtend({
        getModalForm: function () {
            let template = window.template('addProjectVolunteerTemplate');
            let form = template({ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute)});
            let $gridContainer = $(form);
            $gridContainer.find('.form-group').append($('<div><div class="backgrid-wrapper"></div><div class="modal-grid-manager-container"><div class="modal-pagination-controls"></div></div></div>'));
            let gridCollection = App.PageableCollections.unassignedProjectVolunteersCollection;

            App.Views.backGridFiltersPanel = new App.Views.BackGridFiltersPanel({
                collection: gridCollection,
                parentEl: $gridContainer
            });

            $gridContainer.prepend(App.Views.backGridFiltersPanel.render().$el);

            // override default definitions to clean up visible columns for just choosing
            let gridColumnDefinitions = _.map(App.Vars.volunteersBackgridColumnDefinitions, function (def) {
                def.editable=false;
                if (def.name.match(/(ID|_at)$/) || def.label.match(/^Grove/)){
                    def.renderable = false;
                }
                return def;
            });
            let backgridColumnCollection = new Backgrid.Extension.OrderableColumns.orderableColumnCollection(gridColumnDefinitions);
            let Header = Backgrid.Extension.GroupedHeader;
            this.modalBackgrid = new Backgrid.Grid({
                //header: Header,
                columns: gridColumnDefinitions,
                collection: gridCollection
            });

            if (App.Vars.bAllowManagedGridColumns) {
                // Hide db record foreign key ids
                let hideCellCnt = 0;//9 + 25;
                let initialColumnsVisible = gridColumnDefinitions.length - hideCellCnt;
                let colManager = new Backgrid.Extension.ColumnManager(backgridColumnCollection, {
                    initialColumnsVisible: initialColumnsVisible,
                    saveState: true,
                    saveStateKey: 'volunteer-chooser',
                    loadStateOnInit: App.Vars.bBackgridColumnManagerLoadStateOnInit
                });
                // Add control
                let colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                    columnManager: colManager
                });
            }
            $gridContainer.find('.backgrid-wrapper').html(this.modalBackgrid.render().el);

            let paginator = new Backgrid.Extension.Paginator({
                collection: gridCollection
            });

            // Render the paginator
            $gridContainer.find('.modal-pagination-controls').html(paginator.render().el);

            //Add sizeable columns
            let sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                collection: gridCollection,
                columns: backgridColumnCollection,
                grid: this.modalBackgrid
            });
            $gridContainer.find('thead').before(sizeAbleCol.render().el);

            if (App.Vars.bAllowManagedGridColumns) {
                //Add resize handlers
                let sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                    sizeAbleColumns: sizeAbleCol,
                    saveColumnWidth: false
                });
                $gridContainer.find('thead').before(sizeHandler.render().el);

                //Make columns reorderable
                let orderHandler = new Backgrid.Extension.OrderableColumns({
                    grid: this.modalBackgrid,
                    sizeAbleColumns: sizeAbleCol
                });
                $gridContainer.find('thead').before(orderHandler.render().el);
            }
            $('#sia-modal .modal-dialog').css('width', '98%');
            return $gridContainer;
        },
        create: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', '.tab-content.backgrid-wrapper');
            let model = App.Models.projectVolunteerModel.clone().clear({silent: true});
            model.url = '/admin/project_volunteer/batch/store';
            _log('App.Views.ProjectVolunteer.create', attributes, model);
            model.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.collection.url = '/admin/project_volunteer/all/' + App.Models.projectModel.get(App.Models.projectModel.idAttribute);
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            _log('App.Views.ProjectVolunteer.create.event', 'project_volunteers collection fetch promise done');
                            window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error');
                        window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
                    }
                });
        }
    });
})(window.App);
