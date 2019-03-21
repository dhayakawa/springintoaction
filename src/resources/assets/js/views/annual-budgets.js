(function (App) {
    App.Views.AnnualBudgetsManagement = Backbone.View.extend({
        template: template('managementTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'render', 'update', 'refresh','addAll','addOne');
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

            this.lastSiteProccessed = null;
            if (!_.isUndefined(this.collection)) {
                this.collection.bind('reset', this.addAll);
            }
            this.aSiteTotals = [];
            _log(this.viewName + '.initialize', options, this);
        },
        events: {
            'click .btnRefreshTotals': 'refresh'
        },
        addOne: function (sSiteName, key, data) {
            let self = this;
            let budgetSourcesTotal = 0.00;
            let sBudgetSources = '';
            if (_.isEmpty(this.lastSiteProccessed)) {
                this.lastSiteProccessed = sSiteName;
            }
            _.each(data['Budget Source'], function (bs, key) {
                if (!_.isEmpty(bs[0])) {
                    sBudgetSources += bs[0] + ', ';
                    budgetSourcesTotal += parseFloat(bs[1]);
                }
            });
            if (_.isUndefined(self.aSiteTotals[sSiteName])) {
                self.aSiteTotals[sSiteName]=[];
                self.aSiteTotals[sSiteName]['BudgetSourcesTotal'] = 0;
                self.aSiteTotals[sSiteName]['EstCostTotal'] = 0;
            }
            self.aSiteTotals[sSiteName]['BudgetSourcesTotal'] += budgetSourcesTotal;
            self.aSiteTotals[sSiteName]['EstCostTotal'] += parseFloat(data['Est Cost']);
            sBudgetSources = sBudgetSources.replace(/, $/,'');
            if (sSiteName !== self.lastSiteProccessed){
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals"><td>Totals</td><td>&nbsp;</td><td>' + self.aSiteTotals[self.lastSiteProccessed]['EstCostTotal'] + '</td><td>&nbsp;</td><td>' + self.aSiteTotals[self.lastSiteProccessed]['BudgetSourcesTotal'] + '</td></tr>');
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals-margin"><td colspan="5">&nbsp;</td></tr>');
                self.lastSiteProccessed = sSiteName;
            }
            self.$el.find('.site-budgets-table tbody').append('<tr><td>' + sSiteName + '</td><td>' + key + '</td><td>' + data['Est Cost'] + '</td><td>' + sBudgetSources + '</td><td>' + budgetSourcesTotal.toString() + '</td></tr>');

            if (this.bIsLast){
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals"><td>Totals</td><td>&nbsp;</td><td>' + self.aSiteTotals[sSiteName]['EstCostTotal'] + '</td><td>&nbsp;</td><td>' + self.aSiteTotals[sSiteName]['BudgetSourcesTotal'] + '</td></tr>');
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals-margin"><td colspan="5">&nbsp;</td></tr>');

            }
        },
        addAll: function () {
            let self = this;
            this.lastSiteProccessed = null;
            this.aSiteTotals = [];

            this.aSites = _.isUndefined(self.collection) ? [] : self.collection.models[0].attributes['Sites'];
            this.bIsLast = false;
            if (!_.isEmpty(this.aSites)) {

                self.$el.find('.site-budgets-table tbody').empty();
                let bIsLastSite = false;
                let iSitesCnt = 0;
                let iSitesLength = _.keys(this.aSites).length;
                _.each(this.aSites, function (oSiteData, sSiteName) {
                    bIsLastSite = iSitesCnt === iSitesLength-1;
                    let projectsLength = _.keys(oSiteData['Projects']).length;
                    let projectsCnt = 0;
                    _.each(oSiteData['Projects'], function (data, key) {
                        self.bIsLast = bIsLastSite && projectsCnt === projectsLength - 1;
                        self.addOne(sSiteName, key, data);
                        projectsCnt++;
                    });
                    iSitesCnt++;
                });

                let estTotal = 0;
                let sourceTotal = 0;
                _.each(_.keys(self.aSiteTotals), function (site, key) {
                    estTotal += parseFloat(self.aSiteTotals[site]['EstCostTotal']);
                    sourceTotal += parseFloat(self.aSiteTotals[site]['BudgetSourcesTotal']);
                });
                let annualBudgetAmount = self.model.get('BudgetAmount');
                let totalWoodlandsAmt = annualBudgetAmount - estTotal;
                this.$el.find('.box-footer').empty();
                this.$el.find('.box-footer').append('<div class="annual-budget-woodlands-total-wrapper"><strong>Woodlands Budget Remaining:</strong>' + parseFloat(totalWoodlandsAmt).toFixed(2) + '</div><div class="annual-budget-total-wrapper"><strong>Estimate Total:</strong>(' + parseFloat(estTotal).toFixed(2) + ')</div><div class="annual-budget-total-wrapper"><strong>Budget Sources Total:</strong>' + parseFloat(sourceTotal).toFixed(2) + '</div>');
            }

        },
        render: function () {

            let self = this;
            this.$el.html(this.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));

            this.annualBudgetView = new App.Views.AnnualBudgetView({
                className: 'annual-budget-view-controls',
                model: self.model
            });
            this.$el.find('.box-title').after(this.annualBudgetView.render().el);
            this.$el.find(this.backgridWrapperClassSelector).append('<table class="table site-budgets-table"><thead><tr><th width="200">Site</th><th width="20">ProjNum</th><th width="80">Est Cost</th><th width="200">Budget Sources</th><th>Budget Sources Totals</th></tr></thead><tbody></tbody></table>');

            this.addAll();

            return this;
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
