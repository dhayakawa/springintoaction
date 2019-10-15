(function (App) {
    App.Views.AnnualBudgetsManagement = App.Views.Backend.fullExtend({
        template: template('managementTemplate'),
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(this, 'update', 'refresh', 'addAll', 'addOne');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            this._initialize(options);
            this.listenTo(self.model, 'change', this.render);
            this.listenTo(this.annualBudgetView, 'updated', this.refresh);

            this.rowBgColor = 'lightYellow';
            this.viewClassName = this.options.viewClassName;
            this.columnCollectionDefinitions = this.options.columnCollectionDefinitions;
            self.modelNameLabel = this.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            this.viewName = 'App.Views.AnnualBudgetsManagement';
            this.localStorageKey = self.modelNameLabel;
            this.backgridWrapperClassSelector = '.backgrid-wrapper';
            this.paginationControlsSelector = '.pagination-controls';
            this.gridManagerContainerToolbarClassName = 'grid-manager-container';
            this.gridManagerContainerToolbarSelector = '.' + this.gridManagerContainerToolbarClassName;
            this.ajaxWaitingSelector = '.' + this.viewClassName + ' ' + this.backgridWrapperClassSelector;

            this.lastSiteProccessed = null;
            if (!_.isUndefined(this.collection)) {
                self.listenTo(self.collection, "reset", self.addAll);
            }
            this.aSiteTotals = [];
            this.BudgetSourceOptions = _.omit(App.Vars.selectOptions['BudgetSourceOptions'],'');
            // $(".site-budgets-table thead").sticky({
            //     topSpacing: 0, className: 'site-budgets-table-thead-sticked',
            //     originalPosition: 'relative', allowResetLeft: false
            // });

            _log(this.viewName + '.initialize', options, this);
        },
        events: {
            'click .btnRefreshTotals': 'refresh',
            'click .box-header .btn.btn-box-tool': 'close'
        },
        addOne: function (sSiteName, key, data) {
            let self = this;
            let budgetSourcesAmt = {};
            let budgetSourcesTotal = {};
            //console.log(sSiteName, key, data)
            if (_.isEmpty(this.lastSiteProccessed)) {
                this.lastSiteProccessed = sSiteName;
            }
            /**
             * Init Site Totals data
             */
            if (_.isUndefined(self.aSiteTotals[sSiteName])) {
                self.aSiteTotals[sSiteName] = [];
                self.aSiteTotals[sSiteName]['BudgetSourcesTotal'] = {};
                _.each(self.BudgetSourceOptions, function (val, key) {
                    self.aSiteTotals[sSiteName]['BudgetSourcesTotal'][key] = 0.00;
                });
                self.aSiteTotals[sSiteName]['EstCostTotal'] = 0;
            }

            let budgetSources = {};
            /**
             * Init budget source values into object for easier retrieval
             */
            _.each(data['Budget Source'], function (bs, key) {
                if (!_.isEmpty(bs[0])) {
                    budgetSources[`${bs[0]}`] = parseFloat(bs[1]);
                }
            });

            let tableColumnsCnt = 2 + _.keys(this.BudgetSourceOptions).length;

            /**
             * Init all budget source options amount to zero
             */
            _.each(self.BudgetSourceOptions, function (val, key) {
                budgetSourcesAmt[key] = 0.00;
            });

            /**
             * Set the budget source option value for this project and increment site budget source total
             */
            _.each(self.BudgetSourceOptions, function (val, key) {
                //console.log('set BudgetSourcesTotal All',sSiteName, key, budgetSources[key])
                if (!_.isUndefined(budgetSources[key])) {
                    budgetSourcesAmt[key] = parseFloat(budgetSources[key]).toFixed(2);
                    self.aSiteTotals[sSiteName]['BudgetSourcesTotal'][key] += parseFloat(budgetSources[key]);
                    //console.log('set BudgetSourcesTotal',sSiteName,key, self.aSiteTotals[sSiteName]['BudgetSourcesTotal'][key])
                }
            });


            let iEstCost = _.isNull(data['Est Cost']) ? 0 : data['Est Cost'];
            let sEstCost = _.isNull(data['Est Cost']) ? '' : parseFloat(data['Est Cost']).toFixed(2);

            self.aSiteTotals[sSiteName]['EstCostTotal'] += parseFloat(iEstCost);

            // Add totals to table before the next site
            if (sSiteName !== self.lastSiteProccessed){
                let siteTotalRowCells = '<td data-site="' + self.lastSiteProccessed + '">Totals</td><td>&nbsp;</td><td>' + self.aSiteTotals[self.lastSiteProccessed]['EstCostTotal'].toFixed(2) + '</td>';
                _.each(budgetSourcesAmt, function (val, key) {
                    siteTotalRowCells += '<td data-source="'+ key+'"  title="' + key + '">' + self.aSiteTotals[self.lastSiteProccessed]['BudgetSourcesTotal'][key].toFixed(2) + '</td>';
                });
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals">' + siteTotalRowCells + '</tr>');
                //self.$el.find('.site-budgets-table tbody').append('<tr class="totals"><td>Totals</td><td>&nbsp;</td><td>' + self.aSiteTotals[self.lastSiteProccessed]['EstCostTotal'].toFixed(2) + '</td><td>&nbsp;</td><td>' + self.aSiteTotals[self.lastSiteProccessed]['BudgetSourcesTotal'].toFixed(2) + '</td></tr>');
                // add an empty borderless row
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals-margin"><td colspan="'+ tableColumnsCnt+'">&nbsp;</td></tr>');
                self.lastSiteProccessed = sSiteName;
            }
            let siteBudgetRowCells = '<td>' + sSiteName + '</td><td>' + key + '</td><td>' + sEstCost + '</td>';
            _.each(self.BudgetSourceOptions, function (val, key) {
                let amt = !_.isUndefined(budgetSources[key]) ? parseFloat(budgetSources[key]).toFixed(2) : '&nbsp;';
                siteBudgetRowCells += '<td  title="' + key + '">' + amt + '</td>';
            });
            // Add site budget row
            self.$el.find('.site-budgets-table tbody').append('<tr>' + siteBudgetRowCells + '</tr>');

            // Add totals to table after the last site
            if (this.bIsLast){
                let siteTotalRowCells = '<td>Totals</td><td>&nbsp;</td><td>' + self.aSiteTotals[sSiteName]['EstCostTotal'].toFixed(2) + '</td>';
                _.each(budgetSourcesAmt, function (val, key) {
                    siteTotalRowCells += '<td  title="' + key + '">' + parseFloat(val).toFixed(2) + '</td>';
                });
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals">'+ siteTotalRowCells+'</tr>');
                //self.$el.find('.site-budgets-table tbody').append('<tr class="totals"><td>Totals</td><td>&nbsp;</td><td>' + self.aSiteTotals[sSiteName]['EstCostTotal'].toFixed(2) + '</td><td>&nbsp;</td><td>' + self.aSiteTotals[sSiteName]['BudgetSourcesTotal'].toFixed(2) + '</td></tr>');
                // add a couple empty borderless rows
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals-margin"><td colspan="'+ tableColumnsCnt+'">&nbsp;</td></tr>');
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals-margin"><td colspan="'+ tableColumnsCnt+'">&nbsp;</td></tr>');
                let estTotal = 0;
                let sourceTotals = {};
                let sourceTotal = 0;
                console.log('sites BudgetSourcesTotal',self.aSiteTotals)
                _.each(_.keys(self.aSiteTotals), function (site, key) {
                    estTotal += parseFloat(self.aSiteTotals[site]['EstCostTotal']);

                    _.each(self.BudgetSourceOptions, function (val, key) {
                        //console.log(val, key, self.aSiteTotals[site]['BudgetSourcesTotal'][key])
                        if (_.isUndefined(sourceTotals[key])) {
                            sourceTotals[key] = 0;
                        }
                        sourceTotals[key] += parseFloat(self.aSiteTotals[site]['BudgetSourcesTotal'][key]);
                        sourceTotal += parseFloat(self.aSiteTotals[site]['BudgetSourcesTotal'][key]);
                    });
                });
                // add all totals
                let siteTotalsRowCells = '<td colspan="2" class="text-right estimated-cost-total">Estimated Cost Total:</td><td>' + estTotal.toFixed(2) + '</td>';
                _.each(sourceTotals, function (val, key) {
                    if (!_.isEmpty(key)) {
                        siteTotalsRowCells += '<td data-source="' + key + '" title="' + key + '">' + parseFloat(val).toFixed(2) + '</td>';
                    }
                });
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals">'+ siteTotalsRowCells +'</tr>');
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals-margin"><td colspan="' + tableColumnsCnt + '">&nbsp;</td></tr>');
                let fundsNeeded = parseFloat(estTotal - sourceTotal);
                console.log(fundsNeeded,estTotal,sourceTotal)
                siteTotalsRowCells = '<td colspan="2" class="text-right estimated-cost-total">Funds Needed:</td><td colspan="' + (tableColumnsCnt) + '">' + fundsNeeded.toFixed(2) + '</td>';
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals">' + siteTotalsRowCells + '</tr>');
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
                let sourceTotals = {};

                _.each(_.keys(self.aSiteTotals), function (site, key) {
                    estTotal += parseFloat(self.aSiteTotals[site]['EstCostTotal']);

                    _.each(self.BudgetSourceOptions, function (val, key) {
                        //console.log(val, key, self.aSiteTotals[site]['BudgetSourcesTotal'][key])
                        if (_.isUndefined(sourceTotals[key])) {
                            sourceTotals[key] = 0;
                        }
                        sourceTotals[key] += parseFloat(self.aSiteTotals[site]['BudgetSourcesTotal'][key]);
                    });
                });
                let annualBudgetAmount = self.model.get('BudgetAmount');
                let totalWoodlandsAmt = annualBudgetAmount - sourceTotals['Woodlands'];
                // make the color red if over budget
                let sDanger = totalWoodlandsAmt < 0 ? 'text-danger' : '';
                this.$el.find('.woodlands-remaining-budget').empty();
                this.$el.find('.woodlands-remaining-budget').append('<div class="annual-budget-woodlands-total-wrapper '+ sDanger +'"><strong>Woodlands Budget Remaining:</strong>' + parseFloat(totalWoodlandsAmt).toFixed(2) + '</div>');
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

            this.$el.find(this.backgridWrapperClassSelector).append('<table class="table site-budgets-table"><thead><tr><th width="200">Site</th><th width="20">ProjNum</th><th width="80">Est Cost</th></tr></thead><tbody></tbody></table>');

            let $tHeadRow = this.$el.find('.site-budgets-table thead tr');
            _.each(self.BudgetSourceOptions, function (val, key) {
                $tHeadRow.append('<th width="200" data-source-option="'+key+'">' + key + '</th>');
            });

            this.addAll();

            return this;
        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                self.model.url = self.getModelUrl(currentModelID);
                self.model.save(_.extend({[self.model.idAttribute]: currentModelID}, e.changed),
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
