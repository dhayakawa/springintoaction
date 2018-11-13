(function (App) {
    App.Views.SiteVolunteerGridManagerContainerToolbar = Backbone.View.extend({
        template: template('siteVolunteersGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(this, 'render', 'initializeFileUploadObj', 'addGridRow', 'deleteCheckedRows', 'clearStoredColumnState', 'toggleDeleteBtn');
            this.listenTo(App.Views.siteVolunteersView, 'toggle-delete-btn', function (e) {
                self.toggleDeleteBtn(e);
            });

        },
        events: {
            'click .btnAdd': 'addGridRow',
            'click .btnDeleteChecked': 'deleteCheckedRows',
            'click .btnClearStored': 'clearStoredColumnState',
        },
        render: function () {
            this.$el.html(this.template());
            console.log('SiteVolunteerGridManagerContainerToolbar',this.el,this.$el)
            // initialize all file upload inputs on the page at load time
            //this.initializeFileUploadObj(this.$el.find('input[type="file"]'));
            return this;
        },
        initializeFileUploadObj: function (el) {

        },
        addGridRow: function (e) {
            var self = this;
            e.preventDefault();
            $('#sia-modal').one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('New Site Volunteer');
                modal.find('.modal-body').html(App.Views.siteVolunteersView.getModalForm());

                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    App.Views.siteVolunteersView.create($.unserialize(modal.find('form').serialize()));
                    $('#sia-modal').modal('hide');
                });

            });
            $('#sia-modal').modal('show');

        },
        deleteCheckedRows: function (e) {
            e.preventDefault();
            if ($(e.target).hasClass('disabled')) {
                growl('Please check a box to delete a site volunteer.');
                return;
            }
            bootbox.confirm("Do you really want to delete the checked site volunteers?", function (bConfirmed) {
                if (bConfirmed) {
                    let selectedModels = App.Views.siteVolunteersView.backgrid.getSelectedModels();
                    // clear or else the previously selected models remain as undefined
                    try {
                        App.Views.siteVolunteersView.backgrid.clearSelectedModels();
                    } catch (e) {
                    }
                    _log('App.Views.SiteVolunteerGridManagerContainerToolbar.deleteCheckedRows', 'selectedModels', selectedModels);
                    let modelIDs = _.map(selectedModels, function (model) {
                        return model.get('SiteVolunteerID');
                    });

                    App.Views.siteVolunteersView.destroy({deleteModelIDs: modelIDs});
                }
            });
        },
        clearStoredColumnState(e) {
            e.preventDefault();
            growl('Resetting site volunteers columns. Please wait while the page refreshes.', 'success');
            localStorage.removeItem('backgrid-colmgr-site-volunteers');
            location.reload();
        },
        toggleDeleteBtn: function (e) {
            let toggle = e.toggle;

            _log('App.Views.SiteVolunteerGridManagerContainerToolbar.toggleDeleteBtn.event', this.$el.find('.btnDeleteChecked'), e.toggle, e);
            if (toggle === 'disable') {
                this.$el.find('.btnDeleteChecked').addClass('disabled');
            } else {
                this.$el.find('.btnDeleteChecked').removeClass('disabled');
            }

        }

    });
    App.Views.SiteVolunteer = Backbone.View.extend({
        initialize: function (options) {
            let self = this;
            this.options = options;
            _.bindAll(this, 'render', 'update', 'updateSiteVolunteerView', 'getModalForm', 'create', 'destroy', 'toggleDeleteBtn', 'showColumnHeaderLabel', 'showTruncatedCellContentPopup', 'hideTruncatedCellContentPopup');
            this.parentView = this.options.parentView;
            self.backgridWrapperClassSelector = '.site-volunteers-backgrid-wrapper';
            this.gridManagerContainerToolbarClassName = 'site-volunteers-grid-manager-container';
            this.gridManagerContainerToolbarSelector = '.' + this.gridManagerContainerToolbarClassName;
            this.$siteVolunteersGridManagerContainer = this.parentView.$('.site-volunteers-grid-manager-container');
            this.ajaxWaitingSelector = this.backgridWrapperClassSelector;
            this.modelNameLabel = this.options.modelNameLabel;
            this.modelNameLabelLowerCase = this.modelNameLabel.toLowerCase();
            this.routeName = 'site_volunteer';
            console.log('SiteVolunteer',this.el,this.$el)
            _log('App.Views.SiteVolunteer.initialize', options);
        },
        events: {
            'focusin tbody tr': 'updateSiteVolunteerView',
            'mouseenter thead th button': 'showColumnHeaderLabel',
            'mouseenter tbody td': 'showTruncatedCellContentPopup',
            'mouseleave tbody td': 'hideTruncatedCellContentPopup'
        },
        render: function (e) {
            let self = this;

            this.hideCellCnt = this.options.hideCellCnt;
            this.$tabBtnPanePaginationContainer = $(this.gridManagerContainerToolbarSelector).find('.pagination-controls');
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
                saveStateKey: 'site-volunteers',
                loadStateOnInit: true,
                stateChecking: "loose"
            });

            // let colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
            //     columnManager: colManager
            // });
            _log('App.Views.SiteVolunteer.render', this.routeName, self.parentView.el, _.isUndefined(e) ? 'no event passed in for this call.' : e, self.parentView.$('.site-volunteers-grid-manager-container').find('.tab-pagination-controls'));

            let $gridContainer = this.$el.html(this.backgrid.render().el);

            this.gridManagerContainerToolbar = new App.Views.SiteVolunteerGridManagerContainerToolbar({
                el: this.parentView.$('.site-volunteers-grid-manager-container')
            });

            this.$siteVolunteersGridManagerContainer.append(this.gridManagerContainerToolbar.render().el);
            this.$siteVolunteersGridManagerContainer.find('.file-upload-container').hide();
            let paginator = new Backgrid.Extension.Paginator({
                collection: this.collection
            });

            // Render the paginator
            this.$siteVolunteersGridManagerContainer.find('.site-volunteers-pagination-controls').html(paginator.render().el);

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

            //this.$tabBtnPane.find('.columnmanager-visibilitycontrol-container').html(colVisibilityControl.render().el);

            // When a backgrid cell's model is updated it will trigger a 'backgrid:edited' event which will bubble up to the backgrid's collection
            this.backgrid.collection.on('backgrid:editing', function (e) {
                _log('App.Views.SiteVolunteer.render', self.routeName, 'backgrid.collection.on backgrid:editing', e);
                self.updateSiteVolunteerView(e);
            });
            this.backgrid.collection.on('backgrid:edited', function (e) {
                self.update(e);
            });
            this.backgrid.collection.on('backgrid:selected', function (e) {
                self.toggleDeleteBtn(e);
            });
            window.ajaxWaiting('remove', self.ajaxWaitingSelector);
            _log('App.Views.SiteVolunteer.render', this.options.tab, 'Set the current model id on the tab so we can reference it in other views. this.model:', this.model);
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
            this.$gridContainer = $gridContainer;
            return this;
        },
        getModalForm: function () {
            let template = window.template('newSiteVolunteerTemplate');

            let volunteerSelect = new App.Views.Select({
                el: '',
                attributes: {id: 'VolunteerID', name: 'VolunteerID', class: 'form-control'},
                buildHTML: true,
                collection: App.Collections.projectVolunteersCollection,
                optionValueModelAttrName: 'VolunteerID',
                optionLabelModelAttrName: ['LastName', 'FirstName']
            });
            let tplVars = {
                SiteStatusID: App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute),
                volunteerSelect: volunteerSelect.getHtml(),
                siteRoleOptions: App.Models.siteVolunteerModel.getRoleOptions(true),
                statusOptions: App.Models.volunteerModel.getStatusOptions(true)
            };
            return template(tplVars);
        },
        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        updateSiteVolunteerView: function (e) {
            let self = this;
            let currentModelID = 0;
            let $RadioElement = null;
            let $TableRowElement = null;
            _log('App.Views.SiteVolunteer.updateSiteVolunteerView.event', 'event triggered:', e);
            if (typeof e === 'object' && !_.isUndefined(e.id) && !_.isUndefined(e.attributes)) {
                $RadioElement = this.$gridContainer.find('input[type="radio"][name="' + this.model.idAttribute + '"][value="' + e.id + '"]');
                $TableRowElement = $RadioElement.parents('tr');
            } else if (typeof e === 'object' && !_.isUndefined(e.target)) {
                $TableRowElement = $(e.currentTarget);
                $RadioElement = $TableRowElement.find('input[type="radio"][name="' + this.model.idAttribute + '"]');
            }
            if ($RadioElement !== null) {
                // click is only a visual indication that the row is selected. nothing should be listening for this click
                $RadioElement.trigger('click');
                currentModelID = $RadioElement.val();

                // Highlight row
                $TableRowElement.siblings().removeAttr('style');
                $TableRowElement.css('background-color', App.Vars.rowBgColorSelected);

            }

            if (App.Vars.mainAppDoneLoading && currentModelID && $('#' + this.options.tab).data('current-model-id') !== currentModelID) {
                // Refresh tabs on new row select
                this.model.url = '/admin/' + self.routeName + '/' + currentModelID;
                this.model.fetch({reset: true});
            }

        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                let attributes = _.extend({[self.model.idAttribute]: currentModelID}, e.changed);
                attributes['Status'] = attributes['SiteVolunteerRoleStatus'];
                attributes['SiteStatusID'] = App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute);
                _log('App.Views.SiteVolunteer.update', self.routeName, e.changed, attributes, this.model);
                this.model.url = '/admin/' + self.routeName + '/' + currentModelID;
                this.model.save(attributes,
                    {
                        success: function (model, response, options) {
                            _log('App.Views.SiteVolunteer.update', self.routeName + ' save', model, response, options);
                            growl(response.msg, response.success ? 'success' : 'error');
                        },
                        error: function (model, response, options) {
                            console.error('App.Views.SiteVolunteer.update', self.routeName + ' save', model, response, options);
                            growl(response.msg, 'error')
                        }
                    });
            } else {
            }
        },
        create: function (attributes) {
            var self = this;
            window.ajaxWaiting('show', self.ajaxWaitingSelector);
            let model = this.model.clone().clear({silent: true});
            _log('App.Views.SiteVolunteer.create', self.routeName, attributes, model, self.ajaxWaitingSelector);
            model.url = '/admin/' + self.routeName;
            attributes['Status'] = attributes['SiteVolunteerRoleStatus'];
            attributes['SiteStatusID'] = App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute);
            model.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.collection.url = '/admin/' + self.routeName + '/all/' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute);
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            _log('App.Views.SiteVolunteer.create.event', self.routeName + ' collection fetch promise done');
                            window.ajaxWaiting('remove', self.ajaxWaitingSelector);
                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error');
                        window.ajaxWaiting('remove', self.ajaxWaitingSelector);
                    }
                });
        },
        toggleDeleteBtn: function (e) {
            var self = this;
            let selectedModels = self.backgrid.getSelectedModels();
            _log('App.Views.SiteVolunteer.toggleDeleteBtn.event', self.routeName, selectedModels.length, e);
            let toggleState = selectedModels.length === 0 ? 'disable' : 'enable';
            App.Views.siteVolunteersView.trigger('toggle-delete-btn', {toggle: toggleState, tab: self.routeName});
        },
        destroy: function (attributes) {
            var self = this;
            window.ajaxWaiting('show', this.ajaxWaitingSelector);

            _log(this.viewName + '.destroy', attributes);
            $.ajax({
                type: "POST",
                dataType: "json",
                url: '/admin/' + self.routeName + '/batch/destroy',
                data: attributes,
                success: function (response) {
                    window.growl(response.msg, response.success ? 'success' : 'error');
                    self.collection.url = '/admin/' + self.routeName + '/list/all';
                    $.when(
                        self.collection.fetch({reset: true})
                    ).then(function () {
                        //initialize your views here
                        _log(self.viewName + '.destroy.event', self.routeName + ' collection fetch promise done');
                        window.ajaxWaiting('remove', self.ajaxWaitingSelector);
                    });
                },
                fail: function (response) {
                    window.growl(response.msg, 'error');
                    window.ajaxWaiting('remove', self.ajaxWaitingSelector);
                }
            })
        },
        showColumnHeaderLabel: function (e) {
            var self = this;
            let $element = $(e.currentTarget).parents('th');
            let element = $element[0];

            let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
            if (bOverflown) {
                $element.attr('title', $element.find('button').text());
            }
            //_log('App.Views.Projects.showColumnHeaderLabel.event', e);
        },
        showTruncatedCellContentPopup: function (e) {
            var self = this;

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
            var self = this;

            let $element = $(e.currentTarget);
            let element = e.currentTarget;

            let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
            if (bOverflown) {
                $element.popover('hide');
            }
            //_log('App.Views.SiteVolunteer.hideTruncatedCellContent.event', e, element, bOverflown);
        }
    });
})(window.App);
