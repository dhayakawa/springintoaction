(function (App) {
    App.Views.AnnualBudgetsManagement = Backbone.View.extend({
        template: template('managementTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'render', 'update', 'toggleDeleteBtn', 'getModalForm', 'create', 'highLightRow', 'batchDestroy', 'refresh');
            this.model.on('change', this.render, this);
            this.listenTo(this.annualBudgetView, 'updated', this.refresh);
            this.options = options;
            this.rowBgColor = 'lightYellow';
            this.viewClassName = this.options.viewClassName;
            this.columnCollectionDefinitions = this.options.columnCollectionDefinitions;
            this.modelNameLabel = this.options.modelNameLabel;
            this.modelNameLabelLowerCase = this.modelNameLabel.toLowerCase();
            this.viewName = 'App.Views.AnnualBudgetsManagement';
            this.localStorageKey = this.modelNameLabel;
            this.backgridWrapperClassSelector = '.backgrid-wrapper';
            this.paginationControlsSelector = '.pagination-controls';
            this.gridManagerContainerToolbarClassName = 'grid-manager-container';
            this.gridManagerContainerToolbarSelector = '.' + this.gridManagerContainerToolbarClassName;
            this.ajaxWaitingSelector = '.' + this.viewClassName + ' ' + this.backgridWrapperClassSelector;
            _log(this.viewName + '.initialize', options, this);
        },
        events: {
            'click .btnRefreshTotals': 'refresh'
        },
        render: function () {
            let self = this;
            this.$el.html(this.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            this.hideCellCnt = this.options.hideCellCnt;

            // I believe we have to re-build this collection every time the view is created or else a js error is thrown when looping through the column elements
            let backgridOrderableColumnCollection = new Backgrid.Extension.OrderableColumns.orderableColumnCollection(this.columnCollectionDefinitions);
            backgridOrderableColumnCollection.setPositions().sort();

            let Header = Backgrid.Extension.GroupedHeader;
            this.backgrid = new Backgrid.Grid({
                header: Header,
                columns: backgridOrderableColumnCollection,
                collection: this.collection
            });

            let initialColumnsVisible = this.columnCollectionDefinitions.length - this.hideCellCnt;
            let colManager = new Backgrid.Extension.ColumnManager(backgridOrderableColumnCollection, {
                initialColumnsVisible: initialColumnsVisible,
                saveState: App.Vars.bBackgridColumnManagerSaveState,
                saveStateKey: this.localStorageKey,
                loadStateOnInit: true
            });

            let $gridContainer = this.$el.find(this.backgridWrapperClassSelector).html(this.backgrid.render().el);


            // Add sizeable columns
            let sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                collection: this.collection,
                columns: backgridOrderableColumnCollection,
                grid: this.backgrid
            });
            $gridContainer.find('thead').before(sizeAbleCol.render().el);

            // Add resize handlers
            let sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                sizeAbleColumns: sizeAbleCol,
                saveColumnWidth: true
            });
            $gridContainer.find('thead').before(sizeHandler.render().el);

            this.$el.data('current-model-id', this.model.get(this.model.idAttribute));


            window.ajaxWaiting('remove', self.ajaxWaitingSelector);
            // Show a popup of the text that has been truncated
            $gridContainer.find('td[class^="text"],td[class^="string"],td[class^="number"],td[class^="integer"]').popover({
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
            let annualBudgetAmount = self.model.get('BudgetAmount');
            this.annualBudgetView = new App.Views.AnnualBudgetView({
                className: 'annual-budget-view-contols',
                model: self.model
            });
            this.$el.find('.box-title').after(this.annualBudgetView.render().el);
            let totalAmt = 0.00;
            let totalWoodlandsAmt = 0.00;
            this.collection.each(function (model) {
                let amt = parseFloat(model.get('BudgetAmount'));
                totalAmt += amt;
                if (model.get('BudgetSource') === 'Woodlands'){
                    totalWoodlandsAmt += amt;
                }
            });
            totalWoodlandsAmt = annualBudgetAmount - totalWoodlandsAmt;
            _log('App.Views.AnnualBudgetsManagement.render', annualBudgetAmount, totalWoodlandsAmt);
            this.$el.find('.box-footer').append('<div class="annual-budget-woodlands-total-wrapper"><strong>Woodlands Budget Remaining:</strong>'+parseFloat(totalWoodlandsAmt).toFixed(2)+'</div><div class="annual-budget-total-wrapper"><strong>Total:</strong>'+parseFloat(totalAmt).toFixed(2)+'</div>');

            return this;
        },
        /**
         * ContactIDParam can also be an event
         * @param e
         */
        highLightRow: function (e) {
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
        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                this.model.url = '/admin/' + this.modelNameLabelLowerCase + '/' + currentModelID;
                this.model.save(_.extend({[self.model.idAttribute]: currentModelID}, e.changed),
                    {
                        success: function (model, response, options) {
                            _log(self.viewName + '.update', self.modelNameLabelLowerCase + ' save', model, response, options);
                            growl(response.msg, response.success ? 'success' : 'error');
                            self.refresh(e);
                        },
                        error: function (model, response, options) {
                            console.error(self.viewName + '.update', self.modelNameLabelLowerCase + ' save', model, response, options);
                            growl(response.msg, 'error')
                        }
                    });
            } else {
            }
        },
        create: function (attributes) {
            var self = this;
            window.ajaxWaiting('show', this.ajaxWaitingSelector);
            attributes['Active'] = 1;
            _log(this.viewName + '.create', attributes, this.model);
            let newModel = new App.Models.Contact();
            newModel.url = '/admin/' + this.modelNameLabelLowerCase;
            newModel.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.model.set(model.attributes);
                        self.collection.url = '/admin/' + self.modelNameLabelLowerCase + '/list/all';
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            _log(self.viewName + '.create.event', self.modelNameLabelLowerCase + ' collection fetch promise done');
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
            let self = this;
            let template = window.template('new' + this.modelNameLabel + 'Template');
            let siteSelect = new App.Views.Select({
                el: '',
                attributes: {id: 'SiteID', name: 'SiteID', class: 'form-control'},
                buildHTML: true,
                collection: App.Collections.sitesDropDownCollection,
                optionValueModelAttrName: 'SiteID',
                optionLabelModelAttrName: ['SiteName']
            });
            let tplVars = {
                siteSelect: siteSelect.getHtml()
            };
            return template(tplVars);
        },
        toggleDeleteBtn: function (e) {
            var self = this;
            let selectedModels = self.backgrid.getSelectedModels();
            _log(this.viewName + '.toggleDeleteBtn.event', selectedModels.length, e);
            let toggleState = selectedModels.length === 0 ? 'disable' : 'enable';
            self.trigger('toggle-delete-btn', {toggle: toggleState});
        },
        batchDestroy: function (attributes) {
            var self = this;
            window.ajaxWaiting('show', this.ajaxWaitingSelector);

            _log(this.viewName + '.destroy', attributes);
            $.ajax({
                type: "POST",
                dataType: "json",
                url: '/admin/' + self.modelNameLabelLowerCase + '/batch/destroy',
                data: attributes,
                success: function (response) {
                    window.growl(response.msg, response.success ? 'success' : 'error');
                    self.collection.url = '/admin/' + self.modelNameLabelLowerCase + '/list/all';
                    $.when(
                        self.collection.fetch({reset: true})
                    ).then(function () {
                        //initialize your views here
                        _log(self.viewName + '.destroy.event', self.modelNameLabelLowerCase + ' collection fetch promise done');
                        window.ajaxWaiting('remove', self.ajaxWaitingSelector);
                    });
                },
                fail: function (response) {
                    window.growl(response.msg, 'error');
                    window.ajaxWaiting('remove', self.ajaxWaitingSelector);
                }
            })
        },
        refresh: function (e) {
            var self = this;
            e.preventDefault();
            window.ajaxWaiting('show', this.ajaxWaitingSelector);
            self.collection.url = '/admin/annualbudget/list/all';
            $.when(
                self.collection.fetch({reset: true})
            ).then(function () {
                //initialize your views here
                _log(self.viewName + '.create.event', self.modelNameLabelLowerCase + ' collection fetch promise done');
                window.ajaxWaiting('remove', self.ajaxWaitingSelector);
            });
        }

    });
})(window.App);
