(function (App) {
    App.Views.Dashboard = Backbone.View.extend({
        attributes: {
            class: 'dashboard'
        },
        template: _.template([
            '<div class="row">',
            "<% for (let i=0; i < dashboardPanelViews.length; i++) { %>",
            '   <div class="col-xs-6">',
            "    <%= dashboardPanelViews[i] %>",
            "   </div>",
            " <% if(i!==0 && (i+1)%2===0) { print('</div><div class=\"row\">'); } %>",
            "<% } %>",
            "</div>"
        ].join("\n")),
        initialize: function (options) {
            this.options    = options;
            this.dashboardPanelViews = this.options['dashboardPanelViews'];
            _.bindAll(this, 'render');
        },
        render: function () {
            this.$el.empty().append(this.template({
                dashboardPanelViews: this.dashboardPanelViews
            }));
            return this;
        }
    });
    App.Views.DashboardPanel = Backbone.View.extend({
        template: template('dashboardPanelTemplate'),
        initialize: function (options) {
            this.options    = options;
            _.bindAll(this, 'render');
        },
        events: {},
        render: function () {
            this.$el.append(this.template(this.model.toJSON()));
            return this;
        }
    });
    App.Views.DashboardPanelLinksListItem = Backbone.View.extend({
        tagName: 'li',
        template: _.template("<a href=\"#/<%=route%>\" data-route><%=linkText%> <span class=\"pull-right badge bg-blue\"><%=badgeCount%></span></a>"),
        initialize: function (options) {
            _.bindAll(this, 'render');
        },
        events: {

        },
        render: function () {
            let $link = this.template({
                linkText: this.model.get('linkText'),
                badgeCount: this.model.get('badgeCount'),
                route: this.model.get('route')
            });
            $(this.el).append($link);
            return this;
        }
    });

    App.Views.DashboardPanelLinksList = Backbone.View.extend({
        initialize: function (options) {
            this.itemsView = [];
            _.bindAll(this, 'addOne', 'addAll','render');
            this.collection.bind('reset', this.addAll, this);
        },
        events: {},
        addOne: function (DashboardPanelLinksListItem) {
            let listItem = new App.Views.DashboardPanelLinksListItem({model: DashboardPanelLinksListItem});
            this.itemsView.push(listItem);
            this.$el.find('ul').append(listItem.render().el);
        },
        addAll: function () {
            this.$el.empty();
            this.$el.append($('<ul class="nav nav-stacked"></ul>'));
            this.collection.each(this.addOne);
        },
        render: function () {
            this.addAll();
            return this;
        }
    });

})(window.App);

(function (App) {
    App.Views.SiteSetting = Backbone.View.extend({
        tagName: 'li',
        template: template('siteSettingTemplate'),
        initialize: function (options) {
            let self = this;
            this.options = options;

            _.bindAll(this, 'render');
        },
        events: {
            'click button': 'update',
            'change .form-control': 'enableSave',
            'change [name="value"]': 'enableSave',
        },
        render: function () {
            let self = this;
            let settingLabel = _.map(self.model.get('setting').replace(/_/g, ' ').split(' '), function (word) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }).join(' ');
            let $setting = self.template({
                'SiteSettingID': self.model.get('SiteSettingID'),
                'settingLabel': settingLabel,
                'setting': self.model.get('setting'),
                'input_type': self.model.get('input_type'),
                'value': self.model.get('value'),
                'description': self.model.get('description'),
                'message': self.model.get('message'),
                'sunrise': self.model.get('sunrise'),
                'sunset': self.model.get('sunset')
            });
            $(self.el).append($setting);
            let autoUpdateInput = self.model.get('sunrise') !== '';
            //Date range picker with time picker
            self.$el.find('[name="sunrise_sunset"]').daterangepicker({
                timePicker: true,
                timePicker24Hour: true,
                timePickerIncrement: 30,
                autoUpdateInput: autoUpdateInput,
                startDate: self.model.get('sunrise'),
                endDate: self.model.get('sunset'),
                locale:{
                    format: 'YYYY-MM-DD HH:mm:ss',
                    cancelLabel: 'Clear',
                }
            });

            //2019-01-27 00:00:53
            self.$el.find('[name="sunrise_sunset"]').on('apply.daterangepicker', function (ev, picker) {
                $(this).val(picker.startDate.format('YYYY-MM-DD HH:mm:ss') + ' - ' + picker.endDate.format('YYYY-MM-DD HH:mm:ss'));
                self.$el.find('[name="sunrise"]').val(picker.startDate.format('YYYY-MM-DD HH:mm:ss')).trigger('change');
                self.$el.find('[name="sunset"]').val(picker.endDate.format('YYYY-MM-DD HH:mm:ss')).trigger('change');

            });

            self.$el.find('[name="sunrise_sunset"]').on('cancel.daterangepicker', function (ev, picker) {
                $(this).val('');
                self.$el.find('[name="sunrise"]').val('').trigger('change');
                self.$el.find('[name="sunset"]').val('').trigger('change');
            });
            return this;
        },
        enableSave: function () {
            let self = this;
            self.$el.find('button').removeClass('disabled');
        },
        disableSave: function () {
            let self = this;
            self.$el.find('button').addClass('disabled');
        },
        update: function (e) {
            e.preventDefault();
            let self = this;

            if ($(e.target).hasClass('disabled')) {
                return;
            }
            let formData = $.unserialize(self.$el.find('form').serialize());

            let currentModelID = formData[self.model.idAttribute];

            let attributes = _.extend({[self.model.idAttribute]: currentModelID}, formData);
            if (attributes['SiteSettingID'] === '') {
                attributes['SiteSettingID'] = currentModelID;
            }
            _log('App.Views.SiteSetting.update', self.options.tab, e.changed, attributes, this.model);
            this.model.url = '/admin/site_setting/' + currentModelID;
            window.ajaxWaiting('show', 'form[name="SiteSetting' + currentModelID + '"]');
            this.model.save(attributes,
                {
                    success: function (model, response, options) {
                        _log('App.Views.SiteSetting.update', self.options.tab + ' save', model, response, options);
                        growl(response.msg, response.success ? 'success' : 'error');
                        self.disableSave();
                        window.ajaxWaiting('remove', 'form[name="SiteSetting' + currentModelID + '"]');
                    },
                    error: function (model, response, options) {
                        console.error('App.Views.SiteSetting.update', self.options.tab + ' save', model, response, options);
                        growl(response.msg, 'error');
                        self.disableSave();
                        window.ajaxWaiting('remove', 'form[name="SiteSetting' + currentModelID + '"]');
                    }
                });
        },
    });

    App.Views.SiteSettingsManagement = Backbone.View.extend({
        attributes: {
            class: 'site-settings-management-view route-view box box-primary'
        },
        template: template('siteSettingsManagementTemplate'),
        initialize: function (options) {
            let self = this;
            this.itemsView = [];
            this.options = options;
            this.modelNameLabel = this.options.modelNameLabel;
            this.modelNameLabelLowerCase = this.modelNameLabel.toLowerCase().replace(' ', '_');
            _.bindAll(this, 'addOne', 'addAll', 'render');
            this.collection.bind('reset', this.addAll, this);
        },
        events: {},
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            this.addAll();
            return this;
        },
        addOne: function (SiteSetting) {
            let $settingItem = new App.Views.SiteSetting({model: SiteSetting});
            this.itemsView.push($settingItem);
            this.$el.find('ul').append($settingItem.render().el);
        },
        addAll: function () {
            this.$el.find('.site-settings-management-wrapper').empty();
            this.$el.find('.site-settings-management-wrapper').append($('<ul class="nav nav-stacked"></ul>'));
            this.collection.each(this.addOne);
        }
    });
})(window.App);

(function (App) {
    App.Views.AnnualBudgetView = Backbone.View.extend({
        template: template('annualBudgetTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'render', 'update');
            this.options = options;
            this.model.on('change', this.render, this);
            _log(this.viewName + '.initialize', options, this);
        },
        events: {
            'click .btnUpdate': 'update'
        },
        render: function () {
            let self = this;
            this.$el.html(this.template({
                annualBudgetID: this.model.get('AnnualBudgetID'),
                budgetAmount: this.model.get('BudgetAmount'),
                year: this.model.get('Year')
            }));
            return this;
        },
        update: function (e) {
            var self = this;
            e.preventDefault();
            let attrName = 'BudgetAmount';
            let attrValue = this.$el.find('[name="BudgetAmount"]').val();
            this.model.url = '/admin/annualbudget/' + this.model.get(this.model.idAttribute);
            this.model.save({[attrName]: attrValue},
                {
                    success: function (model, response, options) {
                        growl(response.msg, response.success ? 'success' : 'error');
                        self.trigger('updated');
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'error')
                    }
                });
        }
    });
})(window.App);

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
            let iEstCost = _.isNull(data['Est Cost']) ? 0 : data['Est Cost'];
            let sEstCost = _.isNull(data['Est Cost']) ? '' : parseFloat(data['Est Cost']).toFixed(2);

            self.aSiteTotals[sSiteName]['BudgetSourcesTotal'] += budgetSourcesTotal;
            self.aSiteTotals[sSiteName]['EstCostTotal'] += parseFloat(iEstCost);
            sBudgetSources = sBudgetSources.replace(/, $/,'');

            // Add totals to table before the next site
            if (sSiteName !== self.lastSiteProccessed){
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals"><td>Totals</td><td>&nbsp;</td><td>' + self.aSiteTotals[self.lastSiteProccessed]['EstCostTotal'].toFixed(2) + '</td><td>&nbsp;</td><td>' + self.aSiteTotals[self.lastSiteProccessed]['BudgetSourcesTotal'].toFixed(2) + '</td></tr>');
                // add an empty borderless row
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals-margin"><td colspan="5">&nbsp;</td></tr>');
                self.lastSiteProccessed = sSiteName;
            }

            // Add site budget row
            self.$el.find('.site-budgets-table tbody').append('<tr><td>' + sSiteName + '</td><td>' + key + '</td><td>' + sEstCost + '</td><td>' + sBudgetSources + '</td><td>' + parseFloat(budgetSourcesTotal).toFixed(2) + '</td></tr>');

            // Add totals to table after the last site
            if (this.bIsLast){
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals"><td>Totals</td><td>&nbsp;</td><td>' + self.aSiteTotals[sSiteName]['EstCostTotal'].toFixed(2) + '</td><td>&nbsp;</td><td>' + self.aSiteTotals[sSiteName]['BudgetSourcesTotal'].toFixed(2) + '</td></tr>');
                // add a couple empty borderless rows
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals-margin"><td colspan="5">&nbsp;</td></tr>');
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals-margin"><td colspan="5">&nbsp;</td></tr>');
                let estTotal = 0;
                let sourceTotal = 0;
                _.each(_.keys(self.aSiteTotals), function (site, key) {
                    estTotal += parseFloat(self.aSiteTotals[site]['EstCostTotal']);
                    sourceTotal += parseFloat(self.aSiteTotals[site]['BudgetSourcesTotal']);
                });
                // add all totals
                self.$el.find('.site-budgets-table tbody').append('<tr class="totals"><td colspan="2" class="text-right estimated-cost-total">Estimated Cost Total:</td><td>' + estTotal.toFixed(2) + '</td><td class="text-right budget-sources-total">Budget Sources Total:</td><td>' + sourceTotal.toFixed(2) + '</td></tr>');

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
                // make the color red if over budget
                let sDanger = totalWoodlandsAmt < 0 ? 'text-danger' : '';
                this.$el.find('.box-footer').empty();
                this.$el.find('.box-footer').append('<div class="annual-budget-woodlands-total-wrapper '+ sDanger +'"><strong>Woodlands Budget Remaining:</strong>' + parseFloat(totalWoodlandsAmt).toFixed(2) + '</div>');
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

(function (App) {
    App.Views.GridManagerContainerToolbar = Backbone.View.extend({
        template: template('gridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;

            _.bindAll(this, 'render', 'initializeFileUploadObj', 'addGridRow', 'deleteCheckedRows', 'clearStoredColumnState', 'toggleDeleteBtn');
            this.options = options;
            this.localStorageKey = this.options.localStorageKey;
            this.parentView = this.options.parentView;
            this.modelNameLabel = this.parentView.modelNameLabel;
            this.modelNameLabelLowerCase = this.parentView.modelNameLabelLowerCase;
            this.sAjaxFileUploadURL = this.options.sAjaxFileUploadURL;
            this.listenTo(this.parentView, 'toggle-delete-btn', function (e) {
                self.toggleDeleteBtn(e);
            });
        },
        events: {
            'click .btnAdd': 'addGridRow',
            'click .btnDeleteChecked': 'deleteCheckedRows',
            'click .btnClearStored': 'clearStoredColumnState',
        },
        render: function () {
            this.$el.html(this.template({modelName: this.modelNameLabel}));
            // initialize all file upload inputs on the page at load time
            this.initializeFileUploadObj(this.$el.find('input[type="file"]'));

            return this;
        },
        initializeFileUploadObj: function (el) {
            var selfView = this;
            $(el).fileupload({
                url: self.sAjaxFileUploadURL,
                dataType: 'json',
                done: function (e, data) {
                    selfView.$el.find('.file_progress').fadeTo(0, 'slow');
                    selfView.$el.find('.file').val('');
                    selfView.$el.find('.file_chosen').empty();
                    $.each(data.files, function (index, file) {
                        let sFileName = file.name;
                        let sExistingVal = selfView.$el.find('.file').val().length > 0 ? selfView.$el.find('.file').val() + ',' : '';
                        selfView.$el.find('.file').val(sExistingVal + sFileName);
                        selfView.$el.find('.file_chosen').append(sFileName + '<br>')
                    });
                },
                start: function (e) {
                    selfView.$el.find('.file_progress').fadeTo('fast', 1);
                    selfView.$el.find('.file_progress').find('.meter').removeClass('green');
                },
                progress: function (e, data) {
                    let progress = parseInt(data.loaded / data.total * 100, 10);

                    selfView.$el.find('.file_progress .meter').addClass('green').css(
                        'width',
                        progress + '%'
                    ).find('p').html(progress + '%');
                }
            }).prop('disabled', !$.support.fileInput)
                .parent().addClass($.support.fileInput ? undefined : 'disabled');
        },
        addGridRow: function (e) {
            var self = this;
            e.preventDefault();
            $('#sia-modal').one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('New ' + self.modelNameLabel);
                modal.find('.modal-body').html(self.parentView.getModalForm());

                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    self.parentView.create($.unserialize(modal.find('form').serialize()));
                    $('#sia-modal').modal('hide');
                });

            });
            $('#sia-modal').modal('show');

        },
        deleteCheckedRows: function (e) {
            var self = this;
            e.preventDefault();
            if ($(e.target).hasClass('disabled')) {
                growl('Please check a box to delete a ' + self.modelNameLabel + '.');
                return;
            }
            bootbox.confirm("Do you really want to delete the checked " + self.modelNameLabel + "s?", function (bConfirmed) {
                if (bConfirmed) {
                    let selectedModels = self.parentView.backgrid.getSelectedModels();
                    // clear or else the previously selected models remain as undefined
                    self.parentView.backgrid.clearSelectedModels();
                    _log('App.Views.GridManagerContainerToolbar.deleteCheckedRows', self.modelNameLabel, 'selectedModels', selectedModels);
                    let modelIDs = _.map(selectedModels, function (model) {
                        return model.get(model.idAttribute);
                    });

                    self.parentView.batchDestroy({deleteModelIDs: modelIDs});
                }
            });
        },
        clearStoredColumnState(e) {
            var self = this;
            e.preventDefault();
            growl('Resetting ' + self.modelNameLabel + ' columns. Please wait while the page refreshes.', 'success');
            localStorage.removeItem('backgrid-colmgr-' + self.localStorageKey);
            location.reload();
        },
        toggleDeleteBtn: function (e) {
            let self = this;
            let toggle = e.toggle;

            _log('App.Views.GridManagerContainerToolbar.toggleDeleteBtn.event', this.modelNameLabel, e.toggle, e);
            if (toggle === 'disable') {
                this.$el.find('.btnDeleteChecked').addClass('disabled');
            } else {
                this.$el.find('.btnDeleteChecked').removeClass('disabled');
            }

        },
        setStickyColumns: function (colIdx) {
            let self = this;
            self.parentView.find('.cloned-backgrid-table-wrapper').remove();
            let left = 0;
            let $backgridTable = self.parentView.find('table.backgrid');
            let backgridTableHeight = $backgridTable.height();
            $backgridTable.find('tbody tr:first-child td:nth-child(-n+' +
                colIdx + ')').each(function (idx, el) {
                let w = $(el).css('width');
                left += parseInt(w.replace('px', ''));
            });
            let $tCloneWrapper = $('<div class="cloned-backgrid-table-wrapper"></div>');
            $backgridTable.parent().parent().append($tCloneWrapper);
            $tCloneWrapper.css({
                'width': left + 10,
                'height': backgridTableHeight - 1
            });
            let $tClone = $backgridTable.clone();
            $tClone.addClass('cloned-backgrid-table').css({
                'width': left
            });
            $tClone.find('>div').remove();
            let nextColIdx = colIdx + 1;
            $tClone.find('colgroup col:nth-child(n+' +
                nextColIdx + ')').remove();
            $tClone.find('thead tr th:nth-child(n+' +
                nextColIdx + ')').remove();
            $tClone.find('tbody tr td:nth-child(n+' +
                nextColIdx + ')').remove();

            $tCloneWrapper.append($tClone);
            console.log('$backgridTable', $backgridTable, backgridTableHeight)
            console.log('$tCloneWrapper', $tCloneWrapper)
        }

    });
})(window.App);

(function (App) {
    App.Views.ProjectTab = Backbone.View.extend({
        initialize: function (options) {
            let self = this;
            this.options = options;
            _.bindAll(this, 'render', 'update', 'updateProjectTabView', 'getModalForm', 'create', 'destroy', 'toggleDeleteBtn','showColumnHeaderLabel', 'showTruncatedCellContentPopup', 'hideTruncatedCellContentPopup');
            self.backgridWrapperClassSelector = '.tab-content.backgrid-wrapper';
            _log('App.Views.ProjectTab.initialize', options);
        },
        events: {
            'focusin tbody tr': 'updateProjectTabView',
            'mouseenter thead th button': 'showColumnHeaderLabel',
            'mouseenter tbody td': 'showTruncatedCellContentPopup',
            'mouseleave tbody td': 'hideTruncatedCellContentPopup'
        },
        render: function (e) {
            let self = this;
            this.$el.empty();
            this.hideCellCnt = this.options.hideCellCnt;
            this.$tabBtnPane = $(this.options.parentViewEl).find('.' + this.options.tab + '.tabButtonPane');
            this.$tabBtnPanePaginationContainer = this.$tabBtnPane.find('.tab-pagination-controls');
            this.model = App.Vars.currentTabModels[this.options.tab];
            this.columnCollectionDefinitions = this.options.columnCollectionDefinitions;

            this.columnCollection = new Backgrid.Extension.OrderableColumns.orderableColumnCollection(this.columnCollectionDefinitions);
            this.columnCollection.setPositions().sort();

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

            let Header = Backgrid.Header;
            this.backgrid = new Backgrid.Grid({
                header: Header,
                columns: this.columnCollection,
                collection: this.collection
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
            this.backgrid.collection.on('backgrid:editing', function (e) {
                _log('App.Views.ProjectTab.render', self.options.tab, 'backgrid.collection.on backgrid:editing', e);
                self.updateProjectTabView(e);
            });
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
            $gridContainer.find('td').on('click', function () {
                $gridContainer.find('td.renderable').popover('hide')
            });
            this.$gridContainer = $gridContainer;
            return this;
        },
        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        updateProjectTabView: function (e) {
            let self = this;
            let currentModelID = 0;
            let $RadioElement = null;
            let $TableRowElement = null;
            _log('App.Views.ProjectTab.updateProjectTabView.event', 'event triggered:', e);
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
                this.model.url = '/admin/' + self.options.tab + '/' + currentModelID;
                this.model.fetch({reset: true});
            }

        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                let attributes = _.extend({[self.model.idAttribute]: currentModelID}, e.changed);
                if (attributes['ProjectID'] === '') {
                    attributes['ProjectID'] = App.Vars.currentProjectID;
                }
                _log('App.Views.ProjectTab.update', self.options.tab, e.changed, attributes, this.model);
                this.model.url = '/admin/' + self.options.tab + '/' + currentModelID;
                this.model.save(attributes,
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
            let self = this;
            window.ajaxWaiting('show', self.backgridWrapperClassSelector);

            let model = this.model.clone().clear({silent: true});
            _log('App.Views.ProjectTab.create', self.options.tab, {attributes: attributes,model:model, thisModel: this.model});
            model.url = '/admin/' + self.options.tab;
            model.save(attributes,
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
            let self = this;
            let selectedModels = self.backgrid.getSelectedModels();
            _log('App.Views.ProjectTab.toggleDeleteBtn.event', self.options.tab, 'selectedModels.length:' + selectedModels.length, e);
            let toggleState = selectedModels.length === 0 ? 'disable' : 'enable';
            App.Views.siteProjectTabsView.trigger('toggle-delete-btn', {toggle: toggleState, tab: self.options.tab});
        },
        destroy: function (attributes) {
            let self = this;
            let deleteCnt = attributes.deleteModelIDs.length;
            let confirmMsg = "Do you really want to delete the checked " + self.options.tab + "s?";
            if (deleteCnt === self.collection.fullCollection.length){
                confirmMsg = "You are about to delete every checked " + self.options.tab + ". Do you really want to" +
                    " continue with deleting them all?";
            }

            bootbox.confirm(confirmMsg, function (bConfirmed) {
                if (bConfirmed) {
                    window.ajaxWaiting('show', self.backgridWrapperClassSelector);
                    attributes = _.extend(attributes, {
                        ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute),
                        ProjectRoleID: self.model.get('ProjectRoleID')
                    });
                    _log('App.Views.ProjectTab.destroy', self.options.tab, attributes, 'deleteCnt:'+ deleteCnt,'self.collection.fullCollection.length:'+
                        self.collection.fullCollection.length, self.model);
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

        },
        showColumnHeaderLabel: function (e) {
            let self = this;
            let $element = $(e.currentTarget).parents('th');
            let element = $element[0];

            let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
            if (bOverflown) {
                $element.attr('title', $element.find('button').text());
            }
            //_log('App.Views.Projects.showColumnHeaderLabel.event', e);
        },
        showTruncatedCellContentPopup: function (e) {
            let self = this;

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
            //_log('App.Views.ProjectTab.showTruncatedCellContent.event', e, element, bOverflown);
        },
        hideTruncatedCellContentPopup: function (e) {
            let self = this;

            let $element = $(e.currentTarget);
            let element = e.currentTarget;

            let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
            if (bOverflown) {
                $element.popover('hide');
            }
           //_log('App.Views.ProjectTab.hideTruncatedCellContent.event', e, element, bOverflown);
        }
    });
})(window.App);

(function (App) {
    App.Views.ProjectAttachment = App.Views.ProjectTab.fullExtend({
        getModalForm: function () {
            let template = window.template('newProjectAttachmentTemplate');

            let tplVars = {
                ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute)
            };

            return template(tplVars);
        },
        create: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', self.backgridWrapperClassSelector);
            let newModel = new App.Models.ProjectAttachment();
            newModel.url = '/admin/' + this.options.tab;
            _log('App.Views.ProjectAttachment.create', newModel.url, attributes);
            newModel.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.collection.url = '/admin/project_attachment/all/' + App.Models.projectModel.get(App.Models.projectModel.idAttribute);
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            _log('App.Views.ProjectAttachment.create.event', self.options.tab + ' collection fetch promise done');
                            window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error')
                    }
                });
        }
    });
})(window.App);

(function (App) {
    App.Views.Budget = App.Views.ProjectTab.fullExtend({
        getModalForm: function () {
            let template = window.template('newBudgetTemplate');

            let tplVars = {
                ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute),
                budgetSourceOptions: App.Models.projectBudgetModel.getSourceOptions(true),
                statusOptions: App.Models.projectBudgetModel.getStatusOptions(true)
            };
            return template(tplVars);
        },
        create: function (attributes) {
            let self = this;
            let newModel = new App.Models.Budget();
            newModel.url = '/admin/' + this.options.tab;
            _log('App.Views.Budget.create', newModel.url, attributes);
            newModel.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.collection.url = '/admin/project/budgets/' + App.Models.projectModel.get(App.Models.projectModel.idAttribute);
                        self.collection.fetch({reset:true});
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error')
                    }
                });
        }
    });
})(window.App);

(function (App) {
    App.Views.Contact = Backbone.View.extend({
        getModalForm: function () {
            let template = window.template('newContactTemplate');

            let tplVars = {
                SiteID: App.Models.siteModel.get(App.Models.siteModel.idAttribute),
                ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute)
            };
            return template(tplVars);
        }
    });
    App.Views.ProjectContact = App.Views.ProjectTab.fullExtend({
        getModalForm: function () {
            let template = window.template('newProjectContactTemplate');

            let siteContacts = App.Collections.contactsManagementCollection.where({SiteID: App.Vars.currentSiteID});
            let siteContactsCollection = new App.Collections.Contact(siteContacts);
            let contactsSelect = new App.Views.Select({
                el: '',
                attributes: {id: 'ContactID', name: 'ContactID', class: 'form-control'},
                buildHTML: true,
                collection: siteContactsCollection,
                optionValueModelAttrName: 'ContactID',
                optionLabelModelAttrName: ['LastName', 'FirstName', 'ContactType']
            });
            let tplVars = {
                SiteID: App.Models.siteModel.get(App.Models.siteModel.idAttribute),
                ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute),
                contactsSelect: contactsSelect.getHtml()
            };
            return template(tplVars);
        }
    });
})(window.App);

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
            this.backgrid = new Backgrid.Grid({
                //header: Header,
                columns: gridColumnDefinitions,
                collection: gridCollection
            });

            // Hide db record foreign key ids
            let hideCellCnt = 0;//9 + 25;
            let initialColumnsVisible = gridColumnDefinitions.length - hideCellCnt;
            let colManager = new Backgrid.Extension.ColumnManager(backgridColumnCollection, {
                initialColumnsVisible: initialColumnsVisible,
                saveState: true,
                saveStateKey: 'volunteer-chooser',
                loadStateOnInit: true
            });
            // Add control
            let colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                columnManager: colManager
            });
            $gridContainer.find('.backgrid-wrapper').html(this.backgrid.render().el);

            let paginator = new Backgrid.Extension.Paginator({
                collection: gridCollection
            });

            // Render the paginator
            $gridContainer.find('.modal-pagination-controls').html(paginator.render().el);

            //Add sizeable columns
            let sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                collection: gridCollection,
                columns: backgridColumnCollection,
                grid: this.backgrid
            });
            $gridContainer.find('thead').before(sizeAbleCol.render().el);

            //Add resize handlers
            let sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                sizeAbleColumns: sizeAbleCol,
                saveColumnWidth: false
            });
            $gridContainer.find('thead').before(sizeHandler.render().el);

            //Make columns reorderable
            let orderHandler = new Backgrid.Extension.OrderableColumns({
                grid: this.backgrid,
                sizeAbleColumns: sizeAbleCol
            });
            $gridContainer.find('thead').before(orderHandler.render().el);
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

(function (App) {
    App.Views.ProjectGridManagerContainerToolbar = Backbone.View.extend({
        template: template('projectsGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(this, 'render', 'initializeFileUploadObj', 'addGridRow', 'deleteCheckedRows', 'clearStoredColumnState', 'toggleDeleteBtn','setStickyColumns');
            this.listenTo(App.Views.siteManagementView, 'toggle-delete-btn', function (e) {
                self.toggleDeleteBtn(e);
            });

        },
        events: {
            'click #btnAddProject': 'addGridRow',
            'click #btnEditProject': 'editGridRow',
            'click #btnDeleteCheckedProjects': 'deleteCheckedRows',
            'click #btnClearStored': 'clearStoredColumnState',
        },
        render: function () {
            this.$el.html(this.template());
            // initialize all file upload inputs on the page at load time
            this.initializeFileUploadObj(this.$el.find('input[type="file"]'));
            if (!App.Vars.Auth.bCanAddProject){
                this.$el.find('#btnAddProject').hide();
            }
            if (!App.Vars.Auth.bCanDeleteProject) {
                this.$el.find('#btnDeleteCheckedProjects').hide();
            }
            return this;
        },
        initializeFileUploadObj: function (el) {
            $(el).fileupload({
                url: '/admin/project/list/upload',
                dataType: 'json',
                done: function (e, data) {
                    let self = this;
                    $('#file_progress_' + self.id).fadeTo(0, 'slow');
                    $('#file_' + self.id).val('')
                    $('#file_chosen_' + self.id).empty()
                    $.each(data.files, function (index, file) {
                        let sFileName    = file.name
                        let sExistingVal = $('#file_' + self.id).val().length > 0 ? $('#file_' + self.id).val() + ',' : ''
                        $('#file_' + self.id).val(sExistingVal + sFileName)
                        $('#file_chosen_' + self.id).append(sFileName + '<br>')
                    });
                },
                start: function (e) {
                    let self = this;
                    $('#file_progress_' + self.id).fadeTo('fast', 1);
                    $('#file_progress_' + self.id).find('.meter').removeClass('green');
                },
                progress: function (e, data) {
                    let self     = this
                    let progress = parseInt(data.loaded / data.total * 100, 10);

                    $('#file_progress_' + self.id + ' .meter').addClass('green').css(
                        'width',
                        progress + '%'
                    ).find('p').html(progress + '%');
                }
            }).prop('disabled', !$.support.fileInput)
                .parent().addClass($.support.fileInput ? undefined : 'disabled');
        },
        addGridRow: function (e) {
            let self = this;
            e.preventDefault();
            $('#sia-modal').off().one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('New Project');
                modal.find('.modal-body').html(App.Views.projectsView.getModalForm());

                modal.find('.save.btn').off().one('click', function (e) {
                    e.preventDefault();
                    App.Views.projectsView.create($.unserialize(modal.find('form').serialize()));
                    $('#sia-modal').modal('hide');
                });

            });
            $('#sia-modal').modal('show');

        },
        editGridRow: function (e) {
            let self = this;
            e.preventDefault();
            $('#sia-modal').off().one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('Edit Project');
                modal.find('.modal-body').html(App.Views.projectsView.getEditForm());

                modal.find('.save.btn').off().one('click', function (e) {
                    e.preventDefault();

                    let data = $.unserialize(modal.find('form').serialize());
                    // fix multi valued select values
                    data.PrimarySkillNeeded = modal.find('form').find('[name="PrimarySkillNeeded"]').val().join();

                    App.Views.projectsView.saveEditForm(data);
                    $('#sia-modal').modal('hide');
                });

            });
            $('#sia-modal').modal('show');

        },
        deleteCheckedRows: function (e) {
            e.preventDefault();
            if ($(e.target).hasClass('disabled')) {
                growl('Please check a box to delete a project.');
                return;
            }
            bootbox.confirm("Do you really want to delete the checked projects?", function (bConfirmed) {
                if (bConfirmed) {
                    let selectedModels = App.Views.projectsView.backgrid.getSelectedModels();
                    // clear or else the previously selected models remain as undefined
                    try {
                        App.Views.projectsView.backgrid.clearSelectedModels();
                    } catch (e) {
                    }
                    _log('App.Views.ProjectGridManagerContainerToolbar.deleteCheckedRows', 'selectedModels', selectedModels);
                    let modelIDs = _.map(selectedModels, function (model) {
                        return model.get(model.idAttribute);
                    });

                    App.Views.projectsView.destroy({deleteModelIDs: modelIDs});
                }
            });
        },
        clearStoredColumnState(e) {
            e.preventDefault();
            growl('Resetting project columns. Please wait while the page refreshes.', 'success');
            localStorage.removeItem('backgrid-colmgr-site-projects');
            location.reload();
        },
        toggleDeleteBtn: function (e) {
            let toggle = e.toggle;

            _log('App.Views.ProjectGridManagerContainerToolbar.toggleDeleteBtn.event', e.toggle, e);
            if (toggle === 'disable') {
                this.$el.find('#btnDeleteCheckedProjects').addClass('disabled');
            } else {
                this.$el.find('#btnDeleteCheckedProjects').removeClass('disabled');
            }

        },
        setStickyColumns: function (colIdx) {
            let self = this;
            self.parentView.find('.cloned-backgrid-table-wrapper').remove();
            let left = 0;
            let $backgridTable = self.parentView.find('table.backgrid');
            let backgridTableHeight = $backgridTable.height();
            $backgridTable.find('tbody tr:first-child td:nth-child(-n+' +
                colIdx + ')').each(function (idx, el) {
                let w = $(el).css('width');
                left += parseInt(w.replace('px', ''));
            });
            let $tCloneWrapper = $('<div class="cloned-backgrid-table-wrapper"></div>');
            $backgridTable.parent().parent().append($tCloneWrapper);
            $tCloneWrapper.css({
                'width': left + 10,
                'height': backgridTableHeight - 1
            });
            let $tClone = $backgridTable.clone();
            $tClone.addClass('cloned-backgrid-table').css({
                'width': left
            });
            $tClone.find('>div').remove();
            let nextColIdx = colIdx + 1;
            $tClone.find('colgroup col:nth-child(n+' +
                nextColIdx + ')').remove();
            $tClone.find('thead tr th:nth-child(n+' +
                nextColIdx + ')').remove();
            $tClone.find('tbody tr td:nth-child(n+' +
                nextColIdx + ')').remove();

            $tCloneWrapper.append($tClone);

        }

    });
    App.Views.Projects                           = Backbone.View.extend({
        initialize: function (options) {
            let self     = this;
            this.options = options;
            _.bindAll(this, 'render', 'update', 'updateProjectDataViews', 'getModalForm', 'create', 'destroy', 'toggleDeleteBtn', 'showColumnHeaderLabel', 'showTruncatedCellContentPopup', 'hideTruncatedCellContentPopup', 'handleSiteStatusIDChange');
            this.rowBgColor                  = 'lightYellow';
            this.columnCollectionDefinitions = this.options.columnCollectionDefinitions;
            this.parentView                  = this.options.parentView;
            this.listenTo(App.Views.siteYearsDropDownView, 'site-status-id-change', function (e) {
                self.handleSiteStatusIDChange(e);
            });
            _log('App.Views.Projects.initialize', options);
        },
        events: {
            'focusin tbody tr': 'updateProjectDataViews',
            'mouseenter thead th button': 'showColumnHeaderLabel',
            'mouseenter tbody td': 'showTruncatedCellContentPopup',
            'click tbody td': 'hideTruncatedCellContentPopup',
            'mouseleave tbody td': 'hideTruncatedCellContentPopup'
        },
        render: function (e) {
            let self = this;

            // I believe we have to re-build this collection every time the view is created or else a js error is thrown when looping through the column elements
            let backgridOrderableColumnCollection = new Backgrid.Extension.OrderableColumns.orderableColumnCollection(this.columnCollectionDefinitions);
            backgridOrderableColumnCollection.setPositions().sort();

            let Header    = Backgrid.Extension.GroupedHeader;
            this.backgrid = new Backgrid.Grid({
                header: Header,
                columns: backgridOrderableColumnCollection,
                collection: this.collection
            });

            // Hide db record foreign key ids
            let hideCellCnt           = 0;//9 + 25;
            let initialColumnsVisible = App.Vars.projectsBackgridColumnDefinitions.length - hideCellCnt;
            this.colManager           = new Backgrid.Extension.ColumnManager(backgridOrderableColumnCollection, {
                initialColumnsVisible: initialColumnsVisible,
                trackSize: true,
                trackOrder: true,
                trackVisibility: true,
                saveState: App.Vars.bBackgridColumnManagerSaveState,
                saveStateKey: 'site-projects',
                //saveStateKey: 'site-projects-' + App.Models.siteModel.get(App.Models.siteModel.idAttribute) + '-' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute) + '-' + _.uniqueId('-'),
                loadStateOnInit: true,
                stateChecking: "loose"
            });

            let colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                columnManager: this.colManager
            });
            // This is the current View
            let $backgridWrapper     = this.$el.html(this.backgrid.render().el);

            this.projectGridManagerContainerToolbar = new App.Views.ProjectGridManagerContainerToolbar({
                el: this.parentView.$('.projects-grid-manager-container')
            });
            this.projectGridManagerContainerToolbar.render();

            let paginator = new Backgrid.Extension.Paginator({
                collection: this.collection
            });
            this.paginator = paginator;
            // Render the paginator
            this.projectGridManagerContainerToolbar.$('.projects-pagination-controls').html(paginator.render().el);
            _log('App.Views.Projects.render', '$backgridWrapper', $backgridWrapper, '$backgridWrapper.find(\'thead\')', $backgridWrapper.find('thead'));
            //Add sizeable columns
            let sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                collection: this.collection,
                columns: backgridOrderableColumnCollection,
                grid: this.backgrid
            });
            $backgridWrapper.find('thead').before(sizeAbleCol.render().el);
            _log('App.Views.Projects.render', 'after sizeAbleCol.render()');

            //Add resize handlers
            let sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                sizeAbleColumns: sizeAbleCol,
                saveColumnWidth: true
            });
            $backgridWrapper.find('thead').before(sizeHandler.render().el);
            _log('App.Views.Projects.render', 'after sizeHandler.render()');

            //Make columns reorderable
            let orderHandler = new Backgrid.Extension.OrderableColumns({
                grid: this.backgrid,
                sizeAbleColumns: sizeAbleCol
            });
            $backgridWrapper.find('thead').before(orderHandler.render().el);
            _log('App.Views.Projects.render', 'after orderHandler.render()');
            //this.options.mainAppEl is passed in through constructor
            this.projectGridManagerContainerToolbar.$('.file-upload-container').before(colVisibilityControl.render().el);

            // Always assumes the first row of the backgrid/collection is the current model
            App.Vars.currentProjectID = this.collection.length ? this.collection.at(0).get('ProjectID') : null;

            // Set the "current project to load the tabbed project data"
            $backgridWrapper.find('input[type="radio"][name="ProjectID"][value="' + App.Vars.currentProjectID + '"]').parents('tr').trigger('focusin');

            // When a backgrid cell's model is updated it will trigger a 'backgrid:edited' event which will bubble up to the backgrid's collection
            this.backgrid.collection.on('backgrid:editing', function (e) {
                _log('App.Views.Projects.render', 'projects backgrid.collection.on backgrid:editing', e);
                self.updateProjectDataViews(e);
            });
            this.backgrid.collection.on('backgrid:edited', function (e) {
                _log('App.Views.Projects.render', 'projects backgrid.collection.on backgrid:edited', e);
                self.update(e);
            });
            this.backgrid.collection.on('backgrid:selected', function (e) {
                self.toggleDeleteBtn(e);
            });
            window.ajaxWaiting('remove', '.projects-backgrid-wrapper');

            this.$gridContainer = $backgridWrapper;

            return this;

        },
        handleSiteStatusIDChange: function (e) {
            let self = this;

            let SiteStatusID = e.SiteStatusID;
            window.ajaxWaiting('show', '.projects-backgrid-wrapper');
            //window.ajaxWaiting('show', '.tab-content.backgrid-wrapper');
            // fetch new product collection
            App.PageableCollections.projectCollection.url = '/admin/project/list/all/' + SiteStatusID;
            App.PageableCollections.projectCollection.fetch({
                reset: true,
                success: function (model, response, options) {
                    //console.log('handleSiteStatusIDChange project collection fetch success', {model: model, response: response, response_0: response[0], options: options})
                    if (!_.isUndefined(response[0])) {
                        App.Vars.currentProjectID = response[0]['ProjectID'];
                        App.Models.projectModel.set(response[0]);
                        self.refocusProjectRecord();
                    } else {
                        window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
                    }
                    window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                    self.trigger('toggle-project-tabs-box');
                },
                error: function (model, response, options) {
                    growl(response.msg, 'error');
                    window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                    window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
                    self.trigger('toggle-project-tabs-box');
                }
            });
        },
        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        updateProjectDataViews: function (e) {
            let self             = this;
            let ProjectID        = 0;
            let $RadioElement    = null;
            let $TableRowElement = null;
            _log('App.Views.Projects.updateProjectDataViews.event', 'event triggered:', e);
            if (typeof e === 'object' && !_.isUndefined(e.id) && !_.isUndefined(e.attributes)) {
                $RadioElement    = this.$gridContainer.find('input[type="radio"][name="ProjectID"][value="' + e.id + '"]');
                $TableRowElement = $RadioElement.parents('tr');
            } else if (typeof e === 'object' && !_.isUndefined(e.target)) {
                $TableRowElement = $(e.currentTarget);
                $RadioElement    = $TableRowElement.find('input[type="radio"][name="ProjectID"]');
            }
            if ($RadioElement !== null) {
                // click is only a visual indication that the row is selected. nothing should be listening for this click
                $RadioElement.trigger('click');
                ProjectID = $RadioElement.val();

                // Highlight row
                $TableRowElement.siblings().removeAttr('style');
                $TableRowElement.css('background-color', App.Vars.rowBgColorSelected);
            }
            if (App.Vars.mainAppDoneLoading && ProjectID && $('.site-projects-tabs').data('project-id') != ProjectID) {
                window.ajaxWaiting('show', '.tab-content.backgrid-wrapper');
                _log('App.Views.Projects.updateProjectDataViews.event', 'event triggered:', e, 'last chosen' +
                    ' ProjectID:' + $('.site-projects-tabs').data('project-id'), 'fetching new chosen project model:' + ProjectID);
                // Refresh tabs on new row select
                App.Models.projectModel.url = '/admin/project/' + ProjectID;
                App.Vars.currentProjectID = ProjectID;
                App.Models.projectModel.fetch({reset: true});
                //this.collection.length ? this.collection.at(0).get('ProjectID') : null;
                //console.log('updateProjectDataViews projectModel fetch', {ProjectID: ProjectID, projectModel: App.Models.projectModel, currentProjectID:App.Vars.currentProjectID})
            }

        },
        refocusProjectRecord: function () {
            let self = this;
            let recordIdx = 1;
            this.paginator.collection.fullCollection.each(function (model, idx) {

                if (model.get(App.Models.projectModel.idAttribute) == App.Vars.currentProjectID) {
                    recordIdx = idx;
                }
            });
            recordIdx = recordIdx === 0 ? 1 : recordIdx;
            let page = Math.ceil(recordIdx / this.paginator.collection.state.pageSize)
            if (page > 1) {
                _.each(this.paginator.handles, function (handle, idx) {
                    if (handle.pageIndex == page && handle.label == page) {
                        //console.log(handle, handle.pageIndex, handle.el)
                        $(handle.el).find('a').trigger('click')
                    }
                })
            }
            //console.log(recordIdx, this.paginator.collection.state.pageSize, page, this.backgrid, this.paginator, this.backgrid.collection)
            self.$el.find('input[type="radio"][name="ProjectID"][value="' + App.Vars.currentProjectID + '"]').parents('tr').trigger('focusin');
        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let bFetchCollection = false;
                if (_.findKey(e.changed, 'SequenceNumber') !== 'undefined') {
                    // Fetch reordered list
                    bFetchCollection = true;
                    window.ajaxWaiting('show', '.projects-backgrid-wrapper');
                }
                //'event triggered:' + e.handleObj.type + ' ' + e.handleObj.selector
                _log('App.Views.Projects.update.event', e, 'updating project model id:' + e.attributes.ProjectID);
                if (e.attributes.ProjectID !== App.Models.projectModel.get(App.Models.projectModel.idAttribute)){
                    growl('I just caught the disappearing project bug scenario and have cancelled the update so it does not disappear.', 'error');
                }
                App.Models.projectModel.url = '/admin/project/' + e.attributes.ProjectID;
                let projectData = _.extend({ProjectID: e.attributes.ProjectID}, e.changed);
                //console.log('projectView update', {currentProjectID: App.Vars.currentProjectID,e_changed: e.changed, e_attributes: e.attributes, projectData: projectData, projectModel: App.Models.projectModel, url: App.Models.projectModel.url});

                App.Models.projectModel.save(projectData,
                    {
                        success: function (model, response, options) {
                            if (bFetchCollection) {
                                response.msg = response.msg + ' The re-sequenced list is being refreshed.'
                            }
                            growl(response.msg, response.success ? 'success' : 'error');
                            if (bFetchCollection) {

                                self.collection.url = '/admin/project/list/all/' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute);
                                $.when(
                                    self.collection.fetch({reset: true})
                                ).then(function () {
                                    //initialize your views here
                                    self.refocusProjectRecord();
                                    _log('App.Views.Project.update.event', 'SequenceNumber updated. project collection fetch promise done');
                                    window.ajaxWaiting('remove', '.projects-backgrid-wrapper');

                                });
                            }
                        },
                        error: function (model, response, options) {
                            growl(response.msg, 'error');
                            window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                        }
                    });
            }
        },
        saveEditForm: function(data) {
            let self = this;
            let bSave = true;
            if (bSave) {
                let bFetchCollection = true;
                window.ajaxWaiting('show', '.projects-backgrid-wrapper');
                App.Models.projectModel.url = '/admin/project/' + App.Models.projectModel.get(App.Models.projectModel.idAttribute);
                let projectData = _.extend({ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute)}, data);
                //console.log('projectView saveEditForm',{data:data, projectData:projectData,projectModel: App.Models.projectModel, url: App.Models.projectModel.url});
                App.Models.projectModel.save(projectData,
                    {
                        success: function (model, response, options) {
                            if (bFetchCollection) {
                                response.msg = response.msg + ' The list is being refreshed.'
                            }
                            growl(response.msg, response.success ? 'success' : 'error');
                            if (bFetchCollection) {

                                self.collection.url = '/admin/project/list/all/' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute);
                                $.when(
                                    self.collection.fetch({reset: true})
                                ).then(function () {
                                    //initialize your views here
                                    self.refocusProjectRecord();
                                    _log('App.Views.Project.update.event', 'project updated. project collection fetch promise done');
                                    window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                                });
                            }
                        },
                        error: function (model, response, options) {
                            growl(response.msg, 'error');
                            window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                        }
                    });
            }
        },
        getModalForm: function () {
            let template      = window.template('newProjectTemplate');
            let contactSelect = new App.Views.Select({
                el: '',
                attributes: {id: 'ContactID', name: 'selectContactID', class: 'form-control'},
                buildHTML: true,
                collection: App.Collections.contactsManagementCollection,
                optionValueModelAttrName: 'ContactID',
                optionLabelModelAttrName: ['LastName', 'FirstName', 'Title']
            });

            let sequenceNumber = App.PageableCollections.projectCollection.fullCollection.models.length > 0 ? _.max(App.PageableCollections.projectCollection.fullCollection.models, function (project) {
                return parseInt(project.get("SequenceNumber"));
            }).get('SequenceNumber') : 1;

            let tplVars = {
                SiteID: App.Models.siteModel.get(App.Models.siteModel.idAttribute),
                SiteStatusID: App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute),
                yesNoIsActiveOptions: App.Models.projectModel.getYesNoOptions(true, 'Yes'),
                yesNoOptions: App.Models.projectModel.getYesNoOptions(true),
                contactSelect: contactSelect.getHtml(),
                primarySkillNeededOptions: App.Models.projectModel.getSkillsNeededOptions(true, ''),
                statusOptions: App.Models.projectModel.getStatusOptions(true, 'Pending'),
                projectSendOptions: App.Models.projectModel.getSendOptions(true),
                SequenceNumber: parseInt(sequenceNumber) + 1,
                OriginalRequest: '',
                ProjectDescription: '',
                Comments: '',
                VolunteersNeededEst: '',
                StatusReason: '',
                MaterialsNeeded: '',
                EstimatedCost: '',
                ActualCost: '',
                BudgetAvailableForPC: '',
                SpecialEquipmentNeeded: '',
                PermitsOrApprovalsNeeded: '',
                PrepWorkRequiredBeforeSIA: '',
                SetupDayInstructions: '',
                SIADayInstructions: '',
                Area: '',
                PaintOrBarkEstimate: '',
                PaintAlreadyOnHand: '',
                PaintOrdered: '',
                FinalCompletionAssessment: '',
                bSetValues: false,
                data: {
                    Active: '',
                    ChildFriendly: '',
                    PrimarySkillNeeded: '',
                    Status: '',
                    NeedsToBeStartedEarly: '',
                    CostEstimateDone: '',
                    MaterialListDone: '',
                    BudgetAllocationDone: '',
                    VolunteerAllocationDone: '',
                    NeedSIATShirtsForPC: '',
                    ProjectSend: '',
                    FinalCompletionStatus: '',
                    PCSeeBeforeSIA: ''
                }
            };
            return template(tplVars);
        },
        getEditForm: function (){
            let template = window.template('newProjectTemplate');
            let contactSelect = new App.Views.Select({
                el: '',
                attributes: {id: 'ContactID', name: 'selectContactID', class: 'form-control'},
                buildHTML: true,
                collection: App.Collections.contactsManagementCollection,
                optionValueModelAttrName: 'ContactID',
                optionLabelModelAttrName: ['LastName', 'FirstName', 'Title']
            });

            let tplVars = {
                SiteID: App.Models.siteModel.get(App.Models.siteModel.idAttribute),
                SiteStatusID: App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute),
                yesNoIsActiveOptions: App.Models.projectModel.getYesNoOptions(true, 'Yes'),
                yesNoOptions: App.Models.projectModel.getYesNoOptions(true),
                contactSelect: contactSelect.getHtml(),
                primarySkillNeededOptions: App.Models.projectModel.getSkillsNeededOptions(true),
                statusOptions: App.Models.projectModel.getStatusOptions(true, 'Pending'),
                projectSendOptions: App.Models.projectModel.getSendOptions(true),
                SequenceNumber: App.Models.projectModel.get("SequenceNumber"),
                OriginalRequest: App.Models.projectModel.get("OriginalRequest"),
                ProjectDescription: App.Models.projectModel.get("ProjectDescription"),
                Comments: App.Models.projectModel.get("Comments"),
                VolunteersNeededEst: App.Models.projectModel.get("VolunteersNeededEst"),
                StatusReason: App.Models.projectModel.get("StatusReason"),
                MaterialsNeeded: App.Models.projectModel.get("MaterialsNeeded"),
                EstimatedCost: App.Models.projectModel.get("EstimatedCost"),
                ActualCost: App.Models.projectModel.get("ActualCost"),
                BudgetAvailableForPC: App.Models.projectModel.get("BudgetAvailableForPC"),
                SpecialEquipmentNeeded: App.Models.projectModel.get("SpecialEquipmentNeeded"),
                PermitsOrApprovalsNeeded: App.Models.projectModel.get("PermitsOrApprovalsNeeded"),
                PrepWorkRequiredBeforeSIA: App.Models.projectModel.get("PrepWorkRequiredBeforeSIA"),
                SetupDayInstructions: App.Models.projectModel.get("SetupDayInstructions"),
                SIADayInstructions: App.Models.projectModel.get("SIADayInstructions"),
                Area: App.Models.projectModel.get("Area"),
                PaintOrBarkEstimate: App.Models.projectModel.get("PaintOrBarkEstimate"),
                PaintAlreadyOnHand: App.Models.projectModel.get("PaintAlreadyOnHand"),
                PaintOrdered: App.Models.projectModel.get("PaintOrdered"),
                FinalCompletionAssessment: App.Models.projectModel.get("FinalCompletionAssessment"),
                bSetValues: true,
                data: {
                    Active: App.Models.projectModel.get("Active"),
                    ChildFriendly: App.Models.projectModel.get("ChildFriendly"),
                    PrimarySkillNeeded: App.Models.projectModel.get("PrimarySkillNeeded"),
                    Status: App.Models.projectModel.get("Status"),
                    NeedsToBeStartedEarly: App.Models.projectModel.get("NeedsToBeStartedEarly"),
                    CostEstimateDone: App.Models.projectModel.get("CostEstimateDone"),
                    MaterialListDone: App.Models.projectModel.get("MaterialListDone"),
                    BudgetAllocationDone: App.Models.projectModel.get("BudgetAllocationDone"),
                    VolunteerAllocationDone: App.Models.projectModel.get("VolunteerAllocationDone"),
                    NeedSIATShirtsForPC: App.Models.projectModel.get("NeedSIATShirtsForPC"),
                    ProjectSend: App.Models.projectModel.get("ProjectSend"),
                    FinalCompletionStatus: App.Models.projectModel.get("FinalCompletionStatus"),
                    PCSeeBeforeSIA: App.Models.projectModel.get("PCSeeBeforeSIA")
                }
            };
            return template(tplVars);
        },
        create: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', '.projects-backgrid-wrapper');
            // Set the sequence to the end if it was left empty
            if (_.isEmpty(attributes['SequenceNumber'])) {
                attributes['SequenceNumber'] = App.PageableCollections.projectCollection.fullCollection.length;
            }
            // Need to add some default values to the attributes array for fields we do not show in the create form
            attributes['Attachments'] = '';
            _log('App.Views.Project.create', attributes, this.model, App.PageableCollections.projectCollection);
            let newModel = new App.Models.Project();
            newModel.url = '/admin/project';
            newModel.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        App.Vars.currentProjectID = !_.isUndefined(response.ProjectID) ? response.ProjectID : null;
                        self.collection.url = '/admin/project/list/all/' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute);
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            self.refocusProjectRecord();
                            _log('App.Views.Project.create.event', 'project collection fetch promise done');
                            window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                            self.trigger('toggle-project-tabs-box');
                            self.$el.find('tbody tr:first-child').trigger('focusin');
                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error');
                        window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                        self.trigger('toggle-project-tabs-box');
                    }
                });
        },
        destroy: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', '.projects-backgrid-wrapper');
            attributes = _.extend(attributes, {
                ProjectID: App.Models.projectModel.get(App.Models.projectModel.idAttribute),
                ProjectRoleID: this.model.get('ProjectRoleID')
            });
            _log('App.Views.Project.destroy', attributes);
            $.ajax({
                type: "POST",
                dataType: "json",
                url: '/admin/project/batch/destroy',
                data: attributes,
                success: function (response) {
                    window.growl(response.msg, response.success ? 'success' : 'error');
                    self.collection.url = '/admin/project/list/all/' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute);
                    $.when(
                        self.collection.fetch({reset: true})
                    ).then(function () {
                        App.Vars.currentProjectID = self.collection.length ? self.collection.at(0).get('ProjectID') : null;
                        self.refocusProjectRecord();
                        //initialize your views here
                        _log('App.Views.Project.destroy.event', 'project collection fetch promise done');
                        window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                        self.trigger('toggle-project-tabs-box');
                    });
                },
                fail: function (response) {
                    window.growl(response.msg, 'error');
                    window.ajaxWaiting('remove', '.projects-backgrid-wrapper');
                    self.trigger('toggle-project-tabs-box');
                }
            })
        },
        toggleDeleteBtn: function (e) {
            let self           = this;
            let selectedModels = self.backgrid.getSelectedModels();
            _log('App.Views.Projects.toggleDeleteBtn.event', selectedModels.length, e);
            let toggleState = selectedModels.length === 0 ? 'disable' : 'enable';
            //App.Views.siteManagementView.trigger('toggle-delete-btn', {toggle: toggleState});
            _log('App.Views.Projects.toggleDeleteBtn.event', 'toggleState:' + toggleState, self.parentView.el);
            if (toggleState === 'disable') {
                self.parentView.$('#btnDeleteCheckedProjects').addClass('disabled');
            } else {
                self.parentView.$('#btnDeleteCheckedProjects').removeClass('disabled');
            }
        },
        showColumnHeaderLabel: function (e) {
            let self     = this;
            let $element = $(e.currentTarget).parents('th');
            let element  = $element[0];

            let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
            if (bOverflown) {
                $element.attr('title', $element.find('button').text());
            }
            //_log('App.Views.Projects.showColumnHeaderLabel.event', e);
        },
        showTruncatedCellContentPopup: function (e) {
            let self = this;

            let $element = $(e.currentTarget);
            let element  = e.currentTarget;
            if ($element.find('> select').length) {
                return;
            }
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
            //_log('App.Views.Projects.showTruncatedCellContent.event', e, '$element.text():' + $element.text());
        },
        hideTruncatedCellContentPopup: function (e) {
            let self = this;

            let $element = $(e.currentTarget);
            $element.popover('hide');
            //_log('App.Views.Projects.showTruncatedCellContent.event', e, '$element.text():' + $element.text());
        }
    });
})(window.App);

(function (App) {
    // This is the sites drop down
    App.Views.SiteOption = Backbone.View.extend({
        tagName: 'option',
        initialize: function () {
            _.bindAll(this, 'render');
        },
        render: function () {
            $(this.el).attr('value',
                this.model.get('SiteID')).html(this.model.get('SiteName'));
            return this;
        }
    });

    App.Views.Sites = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this, 'addOne', 'addAll', 'render','changeSelected','setSelectedId');
            this.collection.bind('reset', this.addAll);
        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (site) {
            $(this.el).append(
                new App.Views.SiteOption({model: site}).render().el);
        },
        addAll: function () {
            _log('App.Views.Sites.addAll', 'sites dropdown');
            this.$el.empty();
            this.collection.each(this.addOne);
        },
        render: function () {
            this.addAll();
            // Force related views to update
            this.changeSelected();
            return this;
        },
        changeSelected: function () {
            this.setSelectedId($(this.el).val());
        },
        setSelectedId: function (SiteID) {
            let self = this;
            _log('App.Views.Sites.setSelectedId.event', 'new site selected', SiteID);
            // fetch new site model
            App.Models.siteModel.url = '/admin/site/' + SiteID;
            App.Models.siteModel.fetch();
            App.Collections.siteYearsDropDownCollection.url = '/admin/sitestatus/all/site/years/' + SiteID;
            App.Collections.siteYearsDropDownCollection.fetch({reset: true});

            if (typeof self.parentView !== 'undefined' ) {
                self.trigger('site-id-change', {SiteID: SiteID});
                console.log('trigger site-id-change', self.parentView.$el.hasClass('reports-management-view'))
            }
        }
    });
    App.Views.SiteYearsOption = Backbone.View.extend({
        tagName: 'option',
        initialize: function (options) {
            _.bindAll(this, 'render');
        },
        render: function () {
            $(this.el).attr('value', this.model.get('Year'))
                .attr('data-siteid', this.model.get('SiteID'))
                .attr('data-sitestatusid', this.model.get('SiteStatusID'))
                .html(this.model.get('Year'));
            return this;
        }
    });
    App.Views.SiteYears = Backbone.View.extend({
        initialize: function (options) {
            this.options = options;
            this.optionsView = [];
            this.parentView = this.options.parentView;
            _.bindAll(this, 'addOne', 'addAll', 'changeSelected','setSelectedId','refocusSiteVolunteerRecord');
            this.collection.bind('reset', this.addAll, this);
        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (site) {
            let option = new App.Views.SiteYearsOption({model: site});
            this.optionsView.push(option);
            $(this.el).append(option.render().el);
        },
        addAll: function () {
            _.each(this.optionsView, function (option) {
                option.remove();
            });
            this.collection.each(this.addOne);
            this.$el.trigger('change');
        },
        render: function () {
            this.addAll();
            return this;
        },
        changeSelected: function () {
            let self = this;
            let $option = $(self.el).find(':selected');

            self.setSelectedId($option.data('siteid'), $option.data('sitestatusid'), $option.val());
        },
        setSelectedId: function (SiteID, SiteStatusID, Year) {
            let self = this;
            if (App.Vars.mainAppDoneLoading) {
                _log('App.Views.SiteYears.setSelectedId.event', 'new year selected', SiteID, SiteStatusID, Year);

                if (self.parentView.$el.hasClass('site-management-view')) {
                    window.ajaxWaiting('show', '#site-well');
                    window.ajaxWaiting('show', '#site-status-well');
                    window.ajaxWaiting('show', '#site-volunteers-well');
                }
                // fetch new sitestatus
                App.Models.siteStatusModel.url = '/admin/sitestatus/' + SiteStatusID;
                App.PageableCollections.siteVolunteersRoleCollection.url = '/admin/site_volunteer/all/' + SiteStatusID;
                $.when(
                    App.Models.siteStatusModel.fetch({reset: true}),
                    App.PageableCollections.siteVolunteersRoleCollection.fetch({reset: true})
                ).then(function () {
                    //initialize your views here
                    _log('App.Views.Site.create.event', 'site collection fetch promise done');

                    if (self.parentView.$el.hasClass('site-management-view')) {
                        window.ajaxWaiting('remove', '#site-well');
                        window.ajaxWaiting('remove', '#site-status-well');
                        window.ajaxWaiting('remove', '#site-volunteers-well');
                        if (App.PageableCollections.siteVolunteersRoleCollection.length) {
                            App.Vars.currentSiteVolunteerRoleID = App.PageableCollections.siteVolunteersRoleCollection.at(0).get('SiteVolunteerRoleID');
                            App.Models.siteVolunteerRoleModel.set(App.PageableCollections.siteVolunteersRoleCollection.at(0));
                            self.refocusSiteVolunteerRecord();
                        }
                    }
                    if (!self.parentView.$el.hasClass('site-management-view')) {
                        self.trigger('site-status-id-change', {SiteStatusID: SiteStatusID});
                    }
                });
            }
        },
        refocusSiteVolunteerRecord: function () {
            let self = this;
            let recordIdx = 1;
            App.Views.siteVolunteersView.paginator.collection.fullCollection.each(function (model, idx) {

                if (model.get(App.Models.siteVolunteerRoleModel.idAttribute) === App.Vars.currentSiteVolunteerRoleID) {
                    recordIdx = idx;
                }
            });
            recordIdx = recordIdx === 0 ? 1 : recordIdx;
            let page = Math.ceil(recordIdx / App.Views.siteVolunteersView.paginator.collection.state.pageSize)
            if (page > 1) {
                _.each(this.paginator.handles, function (handle, idx) {
                    if (handle.pageIndex === page && handle.label === page) {
                        //console.log(handle, handle.pageIndex, handle.el)
                        $(handle.el).find('a').trigger('click')
                    }
                })
            }
            //console.log(recordIdx, this.paginator.collection.state.pageSize, page, this.backgrid, this.paginator, this.backgrid.collection)
            self.$el.find('input[type="radio"][name="SiteVolunteerRoleID"][value="' + App.Vars.currentSiteVolunteerRoleID + '"]').parents('tr').trigger('focusin');
        },
    });

    /**
     * This is the site form
     */
    App.Views.Site = Backbone.View.extend({
        tagName: 'div',
        template: template('siteTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'update');
            this.model.on('change', this.render, this);
            this.model.on('set', this.render, this);
        },
        events: {
            'change input[type="text"]': 'update'
        },
        update: function (e) {

            let attrName = $(e.target).attr('name');
            let attrValue = $(e.target).val();
            this.model.url = '/admin/site/' + this.model.get('SiteID');
            this.model.save({[attrName]: attrValue},
                {
                    success: function (model, response, options) {
                        growl(response.msg, response.success ? 'success' : 'error');
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'error')
                    }
                });
        },
        render: function () {
            this.model.set('disabled', !App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager ? 'disabled' : '');
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        getModalForm: function () {
            let template = window.template('siteTemplate');

            let tplVars = {
                SiteID: '',
                SiteName: 'test',
                EquipmentLocation: 'test',
                DebrisLocation: 'test'
            };
            return template(tplVars);
        },
        create: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', '#site-well');
            attributes = _.omit(attributes, 'SiteID');
            _log('App.Views.Site.create', attributes, this.model);
            let newModel = new App.Models.Site();
            newModel.url = '/admin/site';
            newModel.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        App.Collections.sitesDropDownCollection.url = '/admin/site/list/all';
                        $.when(
                            App.Collections.sitesDropDownCollection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            _log('App.Views.Site.create.event', 'site collection fetch promise done');
                            window.ajaxWaiting('remove', '#site-well');
                            App.Views.sitesDropDownView.$el.val(response.new_site_id)
                            App.Views.sitesDropDownView.$el.trigger('change')
                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error');
                        window.ajaxWaiting('remove', '#site-well');
                    }
                });
        },
        destroy: function () {
            let self = this;
            _log('App.Views.Project.destroy', self.model);
            self.model.destroy({
                success: function (model, response, options) {
                    window.growl(response.msg, response.success ? 'success' : 'error');
                    App.Collections.sitesDropDownCollection.url = '/admin/site/list/all';
                    $.when(
                        App.Collections.sitesDropDownCollection.fetch({reset: true})
                    ).then(function () {
                        //initialize your views here
                        _log('App.Views.Site.destroy.event', 'site collection fetch promise done');
                        window.ajaxWaiting('remove', '#site-well');
                        App.Views.sitesDropDownView.$el.trigger('change')
                    });
                },
                error: function (model, response, options) {
                    window.growl(response.msg, 'error');
                    window.ajaxWaiting('remove', '#site-well');
                }
            });
        }
    });

    App.Views.SiteStatus = Backbone.View.extend({
        template: template('siteStatusTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'update');
            this.model.on('change', this.render, this);
            this.model.on('destroy', this.remove, this); // 3.
        },
        events: {
            'click input[type="checkbox"]': 'update',
            'change input[type="text"]': 'update',
            'click .delete': 'destroy'	/// 1. Binding a Destroy for the listing to click event on delete button..
        },
        update: function (e) {
            let $target = $(e.target);
            let attrType = $target.attr('type');
            let attrName = $target.attr('name');
            let attrValue = $target.val();

            let selected = $target.is(':checked');
            if (attrType === 'checkbox') {
                attrValue = selected ? 1 : 0;
            }
            //console.log('attrType:' + attrType, 'selected: ', selected, 'attrName:' + attrName, 'value: ', attrValue);
            this.model.url = '/admin/sitestatus/' + this.model.get('SiteStatusID');
            this.model.save({[attrName]: attrValue},
                {
                    success: function (model, response, options) {
                        growl(response.msg, response.success ? 'success' : 'error');
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'error')
                    }
                });
        },
        destroy: function () {
            this.model.destroy();  // 2. calling backbone js destroy function to destroy that model object
        },
        remove: function () {
            this.$el.remove();  // 4. Calling Jquery remove function to remove that HTML li tag element..
        },
        render: function () {
            let checkedBoxes = {
                'ProjectDescriptionCompleteIsChecked': this.model.get('ProjectDescriptionComplete') === 1 ? 'checked' : '',
                'BudgetEstimationCompleteIsChecked': this.model.get('BudgetEstimationComplete') === 1 ? 'checked' : '',
                'VolunteerEstimationCompleteIsChecked': this.model.get('VolunteerEstimationComplete') === 1 ? 'checked' : '',
                'VolunteerAssignmentCompleteIsChecked': this.model.get('VolunteerAssignmentComplete') === 1 ? 'checked' : '',
                'BudgetActualCompleteIsChecked': this.model.get('BudgetActualComplete') === 1 ? 'checked' : '',
                'EstimationCommentsIsChecked': this.model.get('EstimationComments') === 1 ? 'checked' : ''
            };
            this.model.set('disabled', !App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager ? 'disabled' : '');
            this.$el.html(this.template(_.extend(this.model.toJSON(), checkedBoxes)));
            window.ajaxWaiting('remove', '#site-well');
            return this;
        }
    });
})(window.App);

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
                        return model.get('SiteVolunteerRoleID');
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
            this.routeName = 'site_volunteer_role';

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
            // let colManager = new Backgrid.Extension.ColumnManager(this.columnCollection, {
            //     initialColumnsVisible: initialColumnsVisible,
            //     trackSize: true,
            //     trackOrder: true,
            //     trackVisibility: true,
            //     saveState: App.Vars.bBackgridColumnManagerSaveState,
            //     saveStateKey: 'site-volunteers',
            //     loadStateOnInit: true,
            //     stateChecking: "loose"
            // });

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
            this.paginator = paginator;
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

            if (App.Vars.mainAppDoneLoading && currentModelID && App.Vars.currentSiteVolunteerRoleID !== currentModelID) {
                // Refresh tabs on new row select
                this.model.url = '/admin/' + self.routeName + '/' + currentModelID;
                this.model.fetch({reset: true});
            }

        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                if (!_.isUndefined(e.changed['SiteVolunteerRoleStatus'])) {
                    e.changed['Status'] = e.changed['SiteVolunteerRoleStatus'];
                }
                let attributes = _.extend({[self.model.idAttribute]: currentModelID}, e.changed);

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
                    self.collection.url = '/admin/' + self.routeName + '/all/' + App.Models.siteStatusModel.get(App.Models.siteStatusModel.idAttribute);
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

(function (App) {
    App.Views.SiteManagement = Backbone.View.extend({
        sitesViewClass: App.Views.Sites,
        siteYearsViewClass: App.Views.SiteYears,
        siteViewClass: App.Views.Site,
        siteStatusViewClass: App.Views.SiteStatus,
        siteVolunteersViewClass: App.Views.SiteVolunteer,
        attributes: {
            class: 'site-management-view route-view box box-primary'
        },
        template: template('siteManagementTemplate'),
        initialize: function (options) {
            this.options = options;
            this.childViews = [];
            this.mainApp = this.options.mainApp;
            _.bindAll(this, 'render', 'addSite', 'deleteSite');
        },
        events: {
            'click #btnAddSite': 'addSite',
            'click #btnDeleteSite': 'deleteSite'
        },
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template());
            if (!App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager) {
                self.$el.find('#btnAddSite').hide();
            }
            if (!App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager) {
                self.$el.find('#btnDeleteSite').hide();
            }
            App.Views.sitesDropDownView = this.sitesDropDownView = new this.sitesViewClass({
                el: this.$('select#sites'),
                collection: App.Collections.sitesDropDownCollection
            });
            this.sitesDropDownView.render();

            App.Views.siteYearsDropDownView = this.siteYearsDropDownView = new this.siteYearsViewClass({
                el: this.$('select#site_years'),
                parentView: this,
                collection: App.Collections.siteYearsDropDownCollection
            });
            this.siteYearsDropDownView.render();

            App.Views.siteView = this.siteView = new this.siteViewClass({
                el: this.$('.site-view'),
                model: App.Models.siteModel,
                collection: App.Collections.sitesDropDownCollection
            });
            this.siteView.render();

            App.Views.siteStatusView = this.siteStatusView = new this.siteStatusViewClass({
                el: this.$('.site-status-view'),
                model: App.Models.siteStatusModel
            });
            this.siteStatusView.render();

            App.Views.siteVolunteersView = this.siteVolunteersView = new this.siteVolunteersViewClass({
                el: this.$('.site-volunteers-backgrid-wrapper'),
                parentView: this,
                model: App.Models.siteVolunteerRoleModel,
                modelNameLabel: 'SiteVolunteerRole',
                collection: App.PageableCollections.siteVolunteersRoleCollection,
                columnCollectionDefinitions: App.Vars.siteVolunteersBackgridColumnDefinitions,
                hideCellCnt: 0//2
            });
            this.siteVolunteersView.render();

            return this;
        },
        addSite: function () {
            $('#sia-modal').one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('New Site');
                modal.find('.modal-body').html(App.Views.siteView.getModalForm());

                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    App.Views.siteView.create($.unserialize(modal.find('form').serialize()));


                    $('#sia-modal').modal('hide');
                });

            });
            $('#sia-modal').modal('show');
        },
        deleteSite: function () {
            bootbox.confirm("Do you really want to delete the "+ App.Models.siteModel.get('SiteName') +" site and all of its projects?", function (bConfirmed) {
                if (bConfirmed) {
                    App.Views.siteView.destroy();
                }
            });
        }
    });
})(window.App);

(function (App) {
    App.Views.ProjectTabsGridManagerContainerToolbar = Backbone.View.extend({
        template: template('projectTabsGridManagerContainerToolbarsTemplate'),
        initialize: function (options) {
            let self = this;
            this.parentChildViews = options.parentChildViews;
            _.bindAll(this, 'toggleProjectTabToolbars', 'addGridRow', 'deleteCheckedRows', 'clearStoredColumnState', 'toggleDeleteBtn');
            this.options = options;
            this.parentView = this.options.parentView;
            this.tabs = this.parentView.$('.nav-tabs [role="tab"]');
            this.listenTo(App.Views.siteProjectTabsView, 'cleared-child-views', function () {
                self.remove();
            });
            this.listenTo(App.Views.siteProjectTabsView, 'toggle-delete-btn', function (e) {
                self.toggleDeleteBtn(e);
            });
            this.listenTo(App.Views.siteProjectTabsView, 'tab-toggled', this.toggleProjectTabToolbars);

        },
        events: {
            'click .btnTabAdd': 'addGridRow',
            'click .btnTabDeleteChecked': 'deleteCheckedRows',
            'click .btnTabClearStored': 'clearStoredColumnState'
        },
        render: function () {
            let self = this;
            self.$el.empty();
            self.tabs.each(function (idx, el) {
                let tabName = $(el).attr('aria-controls');
                let tabButtonLabel = $(el).text();
                self.$el.append(self.template({TabName: tabName, btnLabel: tabButtonLabel}));

                if (idx === 0) {
                    self.$('.tabButtonPane.' + tabName).show()
                }
            });
            if (!App.Vars.Auth.bCanAddProjectTabModel) {
                this.$el.find('.btnTabAdd').hide();
            }
            if (!App.Vars.Auth.bCanDeleteProjectTabModel) {
                this.$el.find('.btnTabDeleteChecked').hide();
            }
            return self;
        },
        toggleProjectTabToolbars: function (e) {
            let clickedTab = e.data;
            //App.Vars.currentTabModels[clickedTab]
            this.$el.find('.tabButtonPane').hide();
            this.$el.find('.' + clickedTab + '.tabButtonPane').show();
            // Hack to force grid columns to work
            $('body').trigger('resize');
            let tabView = _.find(this.parentChildViews, function (val) {
                return _.has(val, clickedTab)
            });

        },
        addGridRow: function (e) {
            let self = this;
            let tabName = $(e.target).parents('.tabButtonPane').data('tab-name');
            let tabView = _.find(this.parentChildViews, function (val) {
                return _.has(val, tabName)
            });

            _log('App.Views.ProjectTabsGridManagerContainerToolbar.addGridRow', e, tabName, tabView);

            $('#sia-modal').one('show.bs.modal', function (event) {
                let button = $(event.relatedTarget); // Button that triggered the modal
                let recipient = button.data('whatever'); // Extract info from data-* attributes
                // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
                // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
                let modal = $(this);
                modal.find('.modal-title').html(self.parentView.$('h3.box-title').html());
                modal.find('.modal-body').html(tabView[tabName].getModalForm());
                if (tabName === 'project_attachment') {
                    let selfView = modal.find('form[name="newProjectAttachment"]');
                    let sAjaxFileUploadURL = '/admin/project_attachment/upload';
                    $(selfView.find('input[type="file"]')).fileupload({
                        url: sAjaxFileUploadURL,
                        dataType: 'json',
                        done: function (e, data) {
                            selfView.find('.file_progress').fadeTo(0, 'slow');
                            selfView.find('.files').val('');
                            selfView.find('.file_chosen').empty();
                            $.each(data.files, function (index, file) {
                                let sFileName = file.name;
                                let sExistingVal = selfView.find('.files').val().length > 0 ? selfView.find('.files').val() + ',' : '';
                                selfView.find('.files').val(sExistingVal + sFileName);
                                selfView.find('.file_chosen').append(sFileName + '<br>')
                            });
                            modal.find('.save.btn').trigger('click')
                        },
                        start: function (e) {
                            selfView.find('.file_progress').fadeTo('fast', 1);
                            selfView.find('.file_progress').find('.meter').removeClass('green');
                        },
                        progress: function (e, data) {
                            let progress = parseInt(data.loaded / data.total * 100, 10);
                            selfView.find('.file_progress .meter').addClass('green').css(
                                'width',
                                progress + '%'
                            ).find('p').html(progress + '%');
                        }
                    }).prop('disabled', !$.support.fileInput)
                        .parent().addClass($.support.fileInput ? undefined : 'disabled');
                }
                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    if (tabName === 'project_volunteer') {
                        let formData = $.unserialize(modal.find('form').serialize());
                        let selectedModels = tabView[tabName].backgrid.getSelectedModels();
                        let volunteerIDs = _.map(selectedModels, function (model) {
                            return model.get(model.idAttribute);
                        });
                        // Can't be VolunteerID or backbone will flag as an update instead of create
                        formData.VolunteerIDs = volunteerIDs;

                        tabView[tabName].create(formData);
                    } else {
                        tabView[tabName].create($.unserialize(modal.find('form').serialize()));
                    }

                    $('#sia-modal').modal('hide');
                });

            });
            $('#sia-modal').modal('show');

        },
        toggleDeleteBtn: function (e) {
            let toggle = e.toggle;
            let tab = e.tab;
            _log('App.Views.ProjectTabsGridManagerContainerToolbar.toggleDeleteBtn.event', e.toggle, e.tab, e);
            if (toggle === 'disable') {
                this.$el.find('.' + tab + '.tabButtonPane .btnTabDeleteChecked').addClass('disabled');
            } else {
                this.$el.find('.' + tab + '.tabButtonPane .btnTabDeleteChecked').removeClass('disabled');
            }

        },
        deleteCheckedRows: function (e) {
            let tabName = $(e.target).parents('.tabButtonPane').data('tab-name');

            if ($(e.target).hasClass('disabled')) {
                try {
                    let tabTxt = $('[href="#' + tabName + '"]').html()
                } catch (e) {
                    let tabTxt = tabName;
                }
                growl('Please check a box to delete items from the ' + tabTxt + ' tab.');
                return;
            }

            let tabView = _.find(this.parentChildViews, function (val) {
                return _.has(val, tabName)
            });
            let selectedModels = tabView[tabName].backgrid.getSelectedModels();
            // clear or else the previously selected models remain as undefined
            try {
                tabView[tabName].backgrid.clearSelectedModels();
            } catch (e) {
            }
            let modelIDs = _.map(selectedModels, function (model) {
                return model.get(model.idAttribute);
            });

            tabView[tabName].destroy({deleteModelIDs: modelIDs});
        },
        clearStoredColumnState(e) {
            e.preventDefault();
            let tabName = $(e.target).parents('.tabButtonPane').data('tab-name');
            growl('Resetting ' + tabName + ' columns. Please wait while the page refreshes.', 'success');
            localStorage.removeItem('backgrid-colmgr-site-project-tab-' + tabName);
            location.reload();
        }
    });

    App.Views.SiteProjectTabs = Backbone.View.extend({
        projectContactsViewClass: App.Views.ProjectContact,
        projectVolunteersViewClass: App.Views.ProjectVolunteer,
        projectLeadsViewClass: App.Views.ProjectLead,
        projectBudgetViewClass: App.Views.Budget,
        projectAttachmentsViewClass: App.Views.ProjectAttachment,
        initialize: function (options) {
            this.options = options;
            this.mainApp = this.options.mainApp;
            this.parentView = this.options.parentView;
            this.options.mainAppEl = this.mainApp.el;
            this.childViews = [];
            _.bindAll(this, 'render', 'removeChildViews', 'updateProjectTabViewTitle', 'remove', 'notifyProjectTabToolbar', 'fetchIfNewProjectID', 'toggleProductTabsBox');
            // this.model is App.Models.projectModel
            this.listenTo(this.model, "change", this.fetchIfNewProjectID);
            this.listenTo(App.Views.projectsView, 'toggle-project-tabs-box', this.toggleProductTabsBox);
        },
        events: {
            'shown.bs.tab a[data-toggle="tab"]': 'notifyProjectTabToolbar',
            'clear-child-views': 'removeChildViews'
        },
        render: function () {
            let self = this;
            App.Views.projectLeadsView = this.projectLeadsView = new this.projectLeadsViewClass({
                el: this.$('.project-leads-backgrid-wrapper'),
                mainAppEl: this.mainApp.el,
                tab: 'project_lead',
                parentViewEl: this.el,
                collection: App.PageableCollections.projectLeadsCollection,
                columnCollectionDefinitions: App.Vars.volunteerLeadsBackgridColumnDefinitions,
                hideCellCnt: 0//8
            });
            this.childViews.push({project_lead: this.projectLeadsView});

            App.Views.projectBudgetView = this.projectBudgetView = new this.projectBudgetViewClass({
                el: this.$('.project-budget-backgrid-wrapper'),
                mainAppEl: this.mainApp.el,
                tab: 'project_budget',
                parentViewEl: this.el,
                collection: App.PageableCollections.projectBudgetsCollection,
                columnCollectionDefinitions: App.Vars.BudgetsBackgridColumnDefinitions,
                hideCellCnt: 0//1
            });
            this.childViews.push({project_budget: this.projectBudgetView});

            App.Views.projectContactsView = this.projectContactsView = new this.projectContactsViewClass({
                el: this.$('.project-contacts-backgrid-wrapper'),
                tab: 'project_contact',
                mainAppEl: this.mainApp.el,
                parentViewEl: this.el,
                collection: App.PageableCollections.projectContactsCollection,
                columnCollectionDefinitions: App.Vars.projectContactsBackgridColumnDefinitions,
                hideCellCnt: 0//2
            });
            this.childViews.push({project_contact: this.projectContactsView});

            App.Views.projectVolunteersView = this.projectVolunteersView = new this.projectVolunteersViewClass({
                el: this.$('.project-volunteers-backgrid-wrapper'),
                tab: 'project_volunteer',
                parentViewEl: this.el,
                mainAppEl: this.mainApp.el,
                collection: App.PageableCollections.projectVolunteersCollection,
                columnCollectionDefinitions: App.Vars.volunteersBackgridColumnDefinitions,
                hideCellCnt: 0//8
            });
            this.childViews.push({project_volunteer: this.projectVolunteersView});

            App.Views.projectAttachmentsView = this.projectAttachmentsView = new this.projectAttachmentsViewClass({
                el: this.$('.project-attachments-backgrid-wrapper'),
                tab: 'project_attachment',
                parentViewEl: this.el,
                mainAppEl: this.mainApp.el,
                collection: App.PageableCollections.projectAttachmentsCollection,
                columnCollectionDefinitions: App.Vars.ProjectAttachmentsBackgridColumnDefinitions,
                hideCellCnt: 0//8
            });
            this.childViews.push({project_attachment: this.projectAttachmentsView});

            /**
             * Handles the buttons below the tabbed grids
             */
            App.Views.projectTabsGridManagerContainerToolbarView = this.projectTabsGridManagerContainerToolbarView = new App.Views.ProjectTabsGridManagerContainerToolbar({
                parentView: this,
                el: this.parentView.$('.project-tabs-grid-manager-container'),
                parentChildViews: this.childViews
            });

            this.projectTabsGridManagerContainerToolbarView.render();
            this.projectLeadsView.render();
            this.projectBudgetView.render();
            this.projectContactsView.render();
            this.projectVolunteersView.render();
            this.projectAttachmentsView.render();
            let titleDescription = App.Views.projectsView.collection.length === 0 ? 'No projects created yet.' : this.model.get('ProjectDescription');
            self.mainApp.$('h3.box-title small').html(titleDescription);
            _log('App.Views.SiteProjectTabs.render', 'set tabs project title to:' + titleDescription, 'setting data-project-id to ' + this.model.get('ProjectID') + ' on', this.$el);
            this.$el.data('project-id', this.model.get('ProjectID'));
            window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
            self.toggleProductTabsBox();

            return this;
        },
        toggleProductTabsBox: function () {
            let self = this;
            _log('App.Views.SiteProjectTabs.toggleProductTabsBox', 'App.Views.projectsView.collection.length:' + App.Views.projectsView.collection.length);
            if (App.Views.projectsView.collection.length === 0) {
                if (!self.$el.hasClass('collapsed-box')) {
                    self.$el.find('.btn-box-tool').trigger('click');
                }
                self.$el.find('.btn-box-tool').hide();
                self.mainApp.$('h3.box-title small').html('No projects created yet.');
            } else {
                self.$el.find('.btn-box-tool').show();

                if (self.$el.hasClass('collapsed-box')) {
                    self.$el.find('.btn-box-tool').trigger('click');
                    self.$el.removeClass('collapsed-box')
                }
            }
        },
        /**
         * Rebuild the Project Tabs if the project has changed
         * @returns {App.Views.SiteProjectTabs}
         */
        fetchIfNewProjectID: function () {
            var self = this;
            if (this.model.hasChanged('ProjectID')) {
                _log('App.Views.SiteProjectTabs.fetchIfNewProjectID.event', 'ProjectID has changed. Fetching new data for tab collections.', this.model.get('ProjectID'));
                let ProjectID = this.model.get('ProjectID');
                App.PageableCollections.projectLeadsCollection.url = '/admin/project/project_leads/' + ProjectID;
                App.PageableCollections.projectBudgetsCollection.url = '/admin/project/budgets/' + ProjectID;
                App.PageableCollections.projectContactsCollection.url = '/admin/project/contacts/' + ProjectID;
                App.PageableCollections.projectVolunteersCollection.url = '/admin/project/volunteers/' + ProjectID;
                App.PageableCollections.projectAttachmentsCollection.url = '/admin/project/project_attachment/' + ProjectID;

                $.when(
                    App.PageableCollections.projectLeadsCollection.fetch({reset: true}),
                    App.PageableCollections.projectBudgetsCollection.fetch({reset: true}),
                    App.PageableCollections.projectContactsCollection.fetch({reset: true}),
                    App.PageableCollections.projectVolunteersCollection.fetch({reset: true}),
                    App.PageableCollections.projectAttachmentsCollection.fetch({reset: true})
                ).then(function () {
                    //initialize your views here
                    _log('App.Views.SiteProjectTabs.fetchIfNewProjectID.event', 'tab collections fetch promise done');
                    self.mainApp.$('h3.box-title small').html(self.model.get('ProjectDescription'));
                    self.projectLeadsView.render();
                    self.projectBudgetView.render();
                    self.projectContactsView.render();
                    self.projectVolunteersView.render();
                    self.projectAttachmentsView.render();
                    window.ajaxWaiting('remove', '.tab-content.backgrid-wrapper');
                });
                _log('App.Views.SiteProjectTabs.fetchIfNewProjectID.event', 'setting data-project-id to ' + this.model.get('ProjectID') + ' on', this.$el);
                this.$el.data('project-id', this.model.get('ProjectID'));
            } else {
                _log('App.Views.SiteProjectTabs.fetchIfNewProjectID.event', 'fetchIfNewProjectID has not changed', this.model.get('ProjectID'));
            }
            return this;
        },
        /**
         * Not called anywhere anymore...
         * @param ProjectID
         */
        updateProjectTabViewTitle: function (ProjectID) {
            let self = this;
            _log('App.Views.SiteProjectTabs.updateProjectTabViewTitle', 'update project tabs title', ProjectID);
            if (typeof ProjectID === 'string') {
                let currentProjectModel = self.collection.findWhere({ProjectID: parseInt(ProjectID)});
                self.mainApp.$('.site-projects-tabs .box-title small').html(currentProjectModel.get('ProjectDescription'))
            }
        },
        removeChildViews: function () {
            //console.log('App.Views.SiteProjectTabs removeChildViews ');
            _.each(this.childViews, function (view) {
                view.remove();
            });
            _log('App.Views.SiteProjectTabs.removeChildViews.event', 'trigger removed-child-views');
            this.trigger('removed-child-views');
        },
        notifyProjectTabToolbar: function (e) {
            let clickedTab = $(e.currentTarget).attr('aria-controls');
            _log('App.Views.SiteProjectTabs.notifyProjectTabToolbar.event', 'trigger tab-toggled');
            this.trigger('tab-toggled', {data: clickedTab});
        }
    });
})(window.App);

(function (App) {
    App.Views.ProjectManagement = Backbone.View.extend({
        sitesViewClass: App.Views.Sites,
        siteYearsViewClass: App.Views.SiteYears,
        siteProjectTabsViewClass: App.Views.SiteProjectTabs,
        projectsViewClass: App.Views.Projects,
        attributes: {
            class: 'project-management-view route-view box box-primary'
        },
        template: template('projectManagementTemplate'),
        initialize: function (options) {
            this.options    = options;
            this.childViews = [];
            this.mainApp    = this.options.mainApp;
            _.bindAll(this, 'render', 'updateProjectDataViews', 'updateProjectDataTabButtons');
        },
        events: {

        },
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template());

            App.Views.sitesDropDownView = this.sitesDropDownView = new this.sitesViewClass({
                el: this.$('select#sites'),
                collection: App.Collections.sitesDropDownCollection
            });
            this.sitesDropDownView.render();


            App.Views.siteYearsDropDownView = this.siteYearsDropDownView = new this.siteYearsViewClass({
                el: this.$('select#site_years'),
                parentView: this,
                collection: App.Collections.siteYearsDropDownCollection
            });
            this.siteYearsDropDownView.render();

            App.Views.projectsView = this.projectsView = new this.projectsViewClass({
                el: this.$('.projects-backgrid-wrapper'),
                parentView: this,
                collection: App.PageableCollections.projectCollection,
                columnCollectionDefinitions: App.Vars.projectsBackgridColumnDefinitions,
                model: App.Models.projectModel
            });
            this.projectsView.render();

            App.Views.siteProjectTabsView = this.siteProjectTabsView = new this.siteProjectTabsViewClass({
                el: this.$('.site-projects-tabs'),
                mainApp: self.mainApp,
                parentView: this,
                model: App.Models.projectModel
            });
            this.siteProjectTabsView.render();

            return this;
        },
        /**
         * ProjectID can also be an event
         * @param ProjectID
         */
        updateProjectDataViews: function (ProjectID) {
            let self = this;

            if (typeof ProjectID === 'string') {
                let currentProjectModel = self.collection.findWhere({ProjectID: parseInt(ProjectID)});
                self.mainApp.$('.site-projects-tabs .box-title small').html(currentProjectModel.get('ProjectDescription'))
            }
        },
        updateProjectDataTabButtons: function (e) {
            console.log('updateProjectDataTabButtons triggered')
        }
    });
})(window.App);

(function (App) {

    let BackGridFiltersPanelSelectFilter = Backgrid.Extension.BackGridFiltersPanelSelectFilter = Backbone.View.extend({
        tagName: "select",
        className: "backgrid-filter",
        template: _.template([
            "<% for (let i=0; i < options.length; i++) { %>",
            "  <option value='<%=JSON.stringify(options[i].value)%>' <%=options[i].value === initialValue ? 'selected=\"selected\"' : ''%>><%=options[i].label%></option>",
            "<% } %>"
        ].join("\n")),
        defaults: {
            selectOptions: undefined,
            field: undefined,
            clearValue: null,
            initialValue: undefined
        },
        filterName: '',
        initialize: function (options) {
            BackGridFiltersPanelSelectFilter.__super__.initialize.apply(this, arguments);

            _.defaults(this, options || {}, this.defaults);

            if (_.isEmpty(this.selectOptions) || !_.isArray(this.selectOptions)) throw "Invalid or missing selectOptions.";
            if (_.isEmpty(this.field) || !this.field.length) throw "Invalid or missing field.";
            if (this.initialValue === undefined) this.initialValue = this.clearValue;

        },
        render: function () {
            this.$el.empty().append(this.template({
                options: this.selectOptions,
                initialValue: this.initialValue
            }));

            return this;
        }

    });
    /**
     BackGridFiltersPanelClientSideFilter forks ClientSideFilter
     BackGridFiltersPanelClientSideFilter is a search form widget that searches a collection for
     model matches against a query on the client side. The exact matching
     algorithm can be overriden by subclasses.

     @class Backgrid.Extension.BackGridFiltersPanelClientSideFilter
     */
    let BackGridFiltersPanelClientSideFilter = Backgrid.Extension.BackGridFiltersPanelClientSideFilter = Backbone.View.extend({
        /** @property */
        tagName: "div",

        /** @property */
        className: "backgrid-filter form-search",

        /** @property {function(Object, ?Object=): string} template */
        template: function (data) {
            return '<span class="search">&nbsp;</span><input data-filter-name="' + data.filterName + '" type="search" ' + (data.placeholder ? 'placeholder="' + data.placeholder + '"' : '') + ' name="' + data.name + '" ' + (data.value ? 'value="' + data.value + '"' : '') + '/><a class="clear" data-backgrid-action="clear" href="#" style="display:none">&times;</a>';
        },
        filterName: '',
        /** @property {string} [name='q'] Query key */
        name: "q",

        /** @property {string} [value] The search box value.  */
        value: null,
        /**
         @property {string} [placeholder] The HTML5 placeholder to appear beneath
         the search box.
         */
        placeholder: null,
        /**
         @property {?Array.<string>} [fields] A list of model field names to
         search for matches. If null, all of the fields will be searched.
         */
        fields: null,

        /**
         Debounces the #search and #clear methods and makes a copy of the given
         collection for searching.

         @param {Object} options
         @param {Backbone.Collection} options.collection
         @param {string} [options.placeholder]
         @param {string} [options.fields]
         @param {string} [options.wait=149]
         */
        initialize: function (options) {
            BackGridFiltersPanelClientSideFilter.__super__.initialize.apply(this, arguments);
            this.filterName = options.filterName || this.filterName;
            this.name = options.name || this.name;
            this.value = options.value || this.value;
            this.placeholder = options.placeholder || this.placeholder;
            this.template = options.template || this.template;
            this.fields = options.fields || this.fields;

        },

        /**
         Renders a search form with a text box, optionally with a placeholder and
         a preset value if supplied during initialization.
         */
        render: function () {
            // _log('BackGridFiltersPanelClientSideFilter.render', {
            //     filterName: this.filterName,
            //     name: this.name,
            //     placeholder: this.placeholder,
            //     value: this.value
            // });
            this.$el.empty().append(this.template({
                filterName: this.filterName,
                name: this.name,
                placeholder: this.placeholder,
                value: this.value
            }));

            this.delegateEvents();
            return this;
        }
    });

    App.Views.BackGridFiltersPanel = Backbone.View.extend({
        tagName: 'div',
        /**
         @property [wait=149] The time in milliseconds to wait since the last
         change to the search box's value before searching. This value can be
         adjusted depending on how often the search box is used and how large the
         search index is.
         */
        wait: 149,
        selectClearValue: "null",
        template: template('backgridFiltersPanelTemplate'),
        initialize: function (options) {
            //_log('App.Views.BackGridFiltersPanel.initialize');
            _.bindAll(this,
                'render',
                'clearSearchBox',
                'getFilterName',
                'showClearButtonMaybe',
                'searchBox',
                'clearButton',
                'query',
                'makeRegExp',
                'makeMatcher',
                'search',
                'clear',
                'applyFilters',
                'getSearchSelect',
                'currentSelectValue',
                'onChange');
            this.parentEl = $(options.parentEl);
            this.wait = options.wait || this.wait;
            // fullCollection is so we can get the entire collection for pageable collections instead of just the collection for the first page
            let collection = this.collection = this.collection.fullCollection || this.collection;
            this.origCollection = collection.clone();

            this._debounceMethods(["search", "clear"]);

            this.listenTo(collection, "add", function (model, collection, options) {
                this.origCollection.add(model, options);
            });
            this.listenTo(collection, "remove", function (model, collection, options) {
                this.origCollection.remove(model, options);
            });
            this.listenTo(collection, "sort", function (col) {
                if (!this.query()) this.origCollection.reset(col.models);
            });
            this.listenTo(collection, "reset", function (col, options) {
                options = _.extend({reindex: true}, options || {});
                if (options.reindex && options.from == null && options.to == null) {
                    this.origCollection.reset(col.models);
                }
            });
        },
        events: {
            "keyup input[type=search]": "showClearButtonMaybe",
            "click a[data-backgrid-action=clear]": function (e) {
                e.preventDefault();
                this.clear(e);
            },
            "keydown input[type=search]": "search",
            "submit": function (e) {
                e.preventDefault();
                this.search(e);
            },
            "change select": "onChange"
        },
        _debounceMethods: function (methodNames) {
            if (_.isString(methodNames)) methodNames = [methodNames];

            this.undelegateEvents();

            for (let i = 0, l = methodNames.length; i < l; i++) {
                let methodName = methodNames[i];
                let method = this[methodName];
                this[methodName] = _.debounce(method, this.wait);
            }

            this.delegateEvents();
        },
        render: function () {

            this.filterQueryValue = {};
            let $filtersPanel = $(this.template());
            $filtersPanel.boxWidget({
                animationSpeed: 500,
                collapseTrigger: '[data-widget="collapse"]',
                collapseIcon: 'fa-minus',
                expandIcon: 'fa-plus'
            });
            //_log('App.Views.BackGridFiltersPanel.render', $filtersPanel);
            let inputTypeFilterDefinitions = [
                {name: 'FirstName', fields: ['FirstName'], placeholder: 'First Name'},
                {name: 'LastName', fields: ['LastName'], placeholder: 'Last Name'},
                {name: 'LG', fields: ['LG'], placeholder: 'Life Group'},
                {name: 'Church', fields: ['Church'], placeholder: 'Church'},
            ];
            this.inputTypeFilters = [];
            for (let x in inputTypeFilterDefinitions) {
                this.inputTypeFilters[inputTypeFilterDefinitions[x].name] = new Backgrid.Extension.BackGridFiltersPanelClientSideFilter({
                    filterName: inputTypeFilterDefinitions[x].name,
                    fields: inputTypeFilterDefinitions[x].fields,
                    placeholder: inputTypeFilterDefinitions[x].placeholder,
                    value: this.filterQueryValue[inputTypeFilterDefinitions[x].name],
                    wait: 149
                });

                $filtersPanel.find('.' + inputTypeFilterDefinitions[x].name).append(this.inputTypeFilters[inputTypeFilterDefinitions[x].name].render().el);
            }

            let skillOptions = App.Models.volunteerModel.getSkillLevelOptions();
            let ageRangeOptions = App.Models.volunteerModel.getAgeRangeOptions();
            let primarySkillOptions = App.Models.volunteerModel.getPrimarySkillOptions();
            let statusOptions = App.Models.volunteerModel.getStatusOptions();
            let schoolOptions = App.Models.volunteerModel.getSchoolOptions();
            let yesNoOptions = App.Models.projectModel.getYesNoOptions();
            this.selectTypeFilterDefinitions = [
                {name: 'Status', options: statusOptions},
                {name: 'PrimarySkill', options: primarySkillOptions},
                {name: 'AgeRange', options: ageRangeOptions},
                {name: 'Painting', options: skillOptions},
                {name: 'Landscaping', options: skillOptions},
                {name: 'Construction', options: skillOptions},
                {name: 'Electrical', options: skillOptions},
                {name: 'CabinetryFinishWork', options: skillOptions},
                {name: 'Plumbing', options: skillOptions},
                {name: 'SchoolPreference', options: schoolOptions},
                {name: 'TeamLeaderWilling', options: yesNoOptions}
            ];

            this.selectTypeFilters = [];
            for (let x in this.selectTypeFilterDefinitions) {
                this.selectTypeFilters[this.selectTypeFilterDefinitions[x].name] = new Backgrid.Extension.BackGridFiltersPanelSelectFilter({
                    attributes: {'data-filter-name': this.selectTypeFilterDefinitions[x].name},
                    className: "backgrid-filter form-control",
                    field: this.selectTypeFilterDefinitions[x].name,
                    selectOptions: _.union([{label: "All", value: null}],
                        _.map(this.selectTypeFilterDefinitions[x].options, function (o) {
                            return {label: o[0], value: o[1]};
                        }))
                });
                $filtersPanel.find('.' + this.selectTypeFilterDefinitions[x].name).append(this.selectTypeFilters[this.selectTypeFilterDefinitions[x].name].render().el);
            }

            this.$el.html($filtersPanel);

            this.parentEl.find('.result_count').html(this.origCollection.length);
            return this;
        },
        /**
         Returns the search select.
         */
        getSearchSelect: function (e) {
            return this.$el.find(e.target);
        },
        currentSelectValue: function (e) {
            return JSON.parse(this.getSearchSelect(e).val());
        },
        onChange: function (e) {
            if (this.currentSelectValue(e) !== this.selectClearValue && this.currentSelectValue(e) !== null) {
                this.filterQueryValue[this.getFilterName(e)] = this.currentSelectValue(e);
                this.applyFilters();
            } else {
                this.filterQueryValue = _.omit(this.filterQueryValue, this.getFilterName(e));
                this.clear(e);
            }
        },
        /**
         Event handler. Clear the search box and reset the internal search value.
         */
        clearSearchBox: function (e) {
            this.filterQueryValue = _.omit(this.filterQueryValue, this.getFilterName(e));
            this.searchBox(e).val(null);
            this.showClearButtonMaybe(e);
        },
        getFilterName: function (e) {
            return this.searchBox(e).data('filter-name')
        },
        /**
         Event handler. Show the clear button when the search box has text, hide
         it otherwise.
         */
        showClearButtonMaybe: function (e) {

            let $clearButton = this.clearButton(e);
            let searchTerms = this.filterQueryValue[this.getFilterName(e)];
            _log('App.Views.BackGridFiltersPanel.showClearButtonMaybe', e, searchTerms, $clearButton);
            if (searchTerms) $clearButton.show();
            else $clearButton.hide();
        },

        /**
         Returns the search input box.
         */
        searchBox: function (e) {
            if (e.target.localName === 'a' && $(e.target).hasClass('clear')) {
                return this.$el.find(e.target).siblings("input[type=search]");
            }
            return this.$el.find(e.target);
        },

        /**
         Returns the clear button.
         */
        clearButton: function (e) {
            let $target = this.$el.find(e.target);
            if ($target.hasClass('clear')) {
                return $target;
            }
            return $target.siblings("a[data-backgrid-action=clear]");
        },

        /**
         Returns the current search query.
         */
        query: function (e) {
            this.filterQueryValue[this.getFilterName(e)] = this.searchBox(e).val();
            //_log('App.Views.BackGridFiltersPanel.query', e, 'this.searchBox(e):', this.searchBox(e), 'this.getFilterName(e):' + this.getFilterName(e), 'this.filterQueryValue[this.getFilterName(e)]:' + this.filterQueryValue[this.getFilterName(e)]);
            return this.filterQueryValue[this.getFilterName(e)];
        },

        /**
         Constructs a Javascript regular expression object for #makeMatcher.

         This default implementation takes a query string and returns a Javascript
         RegExp object that matches any of the words contained in the query string
         case-insensitively. Override this method to return a different regular
         expression matcher if this behavior is not desired.

         @param {string} query The search query in the search box.
         @return {RegExp} A RegExp object to match against model #fields.
         */
        makeRegExp: function (query) {
            let queryRegexStr = query.trim().split(/\s+/).join("|");
            //_log('App.Views.BackGridFiltersPanel.makeRegExp', 'query:', query, 'queryRegexStr:', queryRegexStr);

            return new RegExp(queryRegexStr, "i");
        },

        /**
         This default implementation takes a query string and returns a matcher
         function that looks for matches in the model's #fields or all of its
         fields if #fields is null, for any of the words in the query
         case-insensitively using the regular expression object returned from
         #makeRegExp.

         Most of time, you'd want to override the regular expression used for
         matching. If so, please refer to the #makeRegExp documentation,
         otherwise, you can override this method to return a custom matching
         function.

         Subclasses overriding this method must take care to conform to the
         signature of the matcher function. The matcher function is a function
         that takes a model as paramter and returns true if the model matches a
         search, or false otherwise.

         In addition, when the matcher function is called, its context will be
         bound to this ClientSideFilter object so it has access to the filter's
         attributes and methods.

         @param {string} query The search query in the search box.
         @return {function(Backbone.Model):boolean} A matching function.
         */
        makeMatcher: function (filterName, query) {
            let bIsSelect = -1 !== _.indexOf(_.pluck(this.selectTypeFilterDefinitions, 'name'), filterName);
            if (!bIsSelect) {
                let regexp = this.makeRegExp(query);
                //_log('App.Views.BackGridFiltersPanel.makeMatcher', 'input', 'query:', query, 'regexp:', regexp);
                return function (model) {
                    let keys = this.inputTypeFilters[filterName].fields || model.keys();
                    for (let i = 0, l = keys.length; i < l; i++) {
                        if (regexp.test(model.get(keys[i]) + "")) return true;
                    }
                    return false;
                };
            } else {
                //_log('App.Views.BackGridFiltersPanel.makeMatcher', filterName +' select', 'query:', query);
                return function (model) {
                    return model.get(filterName) == query;
                };
            }
        },
        /**
         Takes the query from the search box, constructs a matcher with it and
         loops through collection looking for matches. Reset the given collection
         when all the matches have been found.

         If the collection is a PageableCollection, searching will go back to the
         first page.
         */
        search: function (e) {
            let logCnt = 0;
            //_log('App.Views.BackGridFiltersPanel.search' + logCnt++, 'event:', e);
            // adds query to this.filterQueryValue
            this.query(e);
            this.applyFilters();

            //_log('App.Views.BackGridFiltersPanel.search' + logCnt++, 'done. grid should be filtered now.');
        },

        /**
         Clears the search box and reset the collection to its correct filter state.

         If the collection is a PageableCollection, clearing will go back to the
         first page.
         */
        clear: function (e) {
            let self = this;
            let bIsSelect = -1 !== _.indexOf(_.pluck(this.selectTypeFilterDefinitions, 'name'), this.getFilterName(e));
            if (!bIsSelect) {
                this.clearSearchBox(e);
            }
            this.filterQueryValue = _.omit(this.filterQueryValue, this.getFilterName(e));
            if (_.isEmpty(this.filterQueryValue)) {
                //_log('App.Views.BackGridFiltersPanel.clear', e, 'no filters left');
                let col = this.collection;
                if (col.pageableCollection) col.pageableCollection.getFirstPage({silent: true});
                col.reset(this.origCollection.models, {reindex: false});
                this.parentEl.find('.result_count').html(col.length);
            } else {
                //_log('App.Views.BackGridFiltersPanel.clear', e, 'found filters. need to loop through and rebuild search');
                this.applyFilters();
            }
        },
        applyFilters: function () {
            //_log('App.Views.BackGridFiltersPanel.applyFilters', 'this.filterQueryValue:', this.filterQueryValue);

            if (!_.isEmpty(this.filterQueryValue)) {
                this.shadowCollection = this.origCollection.clone();
                let col = this.collection;
                if (col.pageableCollection) col.pageableCollection.getFirstPage({silent: true});
                for (let x in this.filterQueryValue) {
                    let filterName = x;
                    let query = this.filterQueryValue[x];
                    if (!_.isNull(query)) {
                        let matcher = _.bind(this.makeMatcher(filterName, query), this);
                        this.shadowCollection = this.shadowCollection.filter(matcher)
                    }
                }

                col.reset(this.shadowCollection, {reindex: false});
                this.parentEl.find('.result_count').html(col.length)
            }
        }
    });
})(window.App);

(function (App) {

    let BackGridContactsFiltersPanelSelectFilter = Backgrid.Extension.BackGridContactsFiltersPanelSelectFilter = Backbone.View.extend({
        tagName: "select",
        className: "backgrid-filter",
        template: _.template([
            "<% for (let i=0; i < options.length; i++) { %>",
            "  <option value='<%=options[i].value%>' <%=options[i].value === initialValue ? 'selected=\"selected\"' : ''%>><%=options[i].label%></option>",
            "<% } %>"
        ].join("\n")),
        defaults: {
            selectOptions: undefined,
            field: undefined,
            clearValue: null,
            initialValue: undefined
        },
        filterName: '',
        initialize: function (options) {
            BackGridContactsFiltersPanelSelectFilter.__super__.initialize.apply(this, arguments);

            _.defaults(this, options || {}, this.defaults);

            if (_.isEmpty(this.selectOptions) || !_.isArray(this.selectOptions)) throw "Invalid or missing selectOptions.";
            if (_.isEmpty(this.field) || !this.field.length) throw "Invalid or missing field.";
            if (this.initialValue === undefined) this.initialValue = this.clearValue;

        },
        render: function () {
            this.$el.empty().append(this.template({
                options: this.selectOptions,
                initialValue: this.initialValue
            }));

            return this;
        }

    });
    /**
     BackGridContactsFiltersPanelClientSideFilter forks ClientSideFilter
     BackGridContactsFiltersPanelClientSideFilter is a search form widget that searches a collection for
     model matches against a query on the client side. The exact matching
     algorithm can be overriden by subclasses.

     @class Backgrid.Extension.BackGridContactsFiltersPanelClientSideFilter
     */
    let BackGridContactsFiltersPanelClientSideFilter = Backgrid.Extension.BackGridContactsFiltersPanelClientSideFilter = Backbone.View.extend({
        /** @property */
        tagName: "div",

        /** @property */
        className: "backgrid-filter form-search",

        /** @property {function(Object, ?Object=): string} template */
        template: function (data) {
            return '<span class="search">&nbsp;</span><input data-filter-name="' + data.filterName + '" type="search" ' + (data.placeholder ? 'placeholder="' + data.placeholder + '"' : '') + ' name="' + data.name + '" ' + (data.value ? 'value="' + data.value + '"' : '') + '/><a class="clear" data-backgrid-action="clear" href="#" style="display:none">&times;</a>';
        },
        filterName: '',
        /** @property {string} [name='q'] Query key */
        name: "q",

        /** @property {string} [value] The search box value.  */
        value: null,
        /**
         @property {string} [placeholder] The HTML5 placeholder to appear beneath
         the search box.
         */
        placeholder: null,
        /**
         @property {?Array.<string>} [fields] A list of model field names to
         search for matches. If null, all of the fields will be searched.
         */
        fields: null,

        /**
         Debounces the #search and #clear methods and makes a copy of the given
         collection for searching.

         @param {Object} options
         @param {Backbone.Collection} options.collection
         @param {string} [options.placeholder]
         @param {string} [options.fields]
         @param {string} [options.wait=149]
         */
        initialize: function (options) {
            BackGridContactsFiltersPanelClientSideFilter.__super__.initialize.apply(this, arguments);
            this.filterName = options.filterName || this.filterName;
            this.name = options.name || this.name;
            this.value = options.value || this.value;
            this.placeholder = options.placeholder || this.placeholder;
            this.template = options.template || this.template;
            this.fields = options.fields || this.fields;

        },

        /**
         Renders a search form with a text box, optionally with a placeholder and
         a preset value if supplied during initialization.
         */
        render: function () {
            // _log('BackGridContactsFiltersPanelClientSideFilter.render', {
            //     filterName: this.filterName,
            //     name: this.name,
            //     placeholder: this.placeholder,
            //     value: this.value
            // });
            this.$el.empty().append(this.template({
                filterName: this.filterName,
                name: this.name,
                placeholder: this.placeholder,
                value: this.value
            }));

            this.delegateEvents();
            return this;
        }
    });

    App.Views.BackGridContactsFiltersPanel = Backbone.View.extend({
        tagName: 'div',
        /**
         @property [wait=149] The time in milliseconds to wait since the last
         change to the search box's value before searching. This value can be
         adjusted depending on how often the search box is used and how large the
         search index is.
         */
        wait: 149,
        selectClearValue: "null",
        template: template('backgridContactsFiltersPanelTemplate'),
        initialize: function (options) {
            //_log('App.Views.BackGridFiltersPanel.initialize');
            _.bindAll(this,
                'render',
                'clearSearchBox',
                'getFilterName',
                'showClearButtonMaybe',
                'searchBox',
                'clearButton',
                'query',
                'makeRegExp',
                'makeMatcher',
                'search',
                'clear',
                'applyFilters',
                'getSearchSelect',
                'currentSelectValue',
                'onChange');
            this.parentEl = $(options.parentEl);
            this.wait = options.wait || this.wait;
            // fullCollection is so we can get the entire collection for pageable collections instead of just the collection for the first page
            let collection = this.collection = this.collection.fullCollection || this.collection;
            this.origCollection = collection.clone();

            this._debounceMethods(["search", "clear"]);

            this.listenTo(collection, "add", function (model, collection, options) {
                this.origCollection.add(model, options);
            });
            this.listenTo(collection, "remove", function (model, collection, options) {
                this.origCollection.remove(model, options);
            });
            this.listenTo(collection, "sort", function (col) {
                if (!this.query()) this.origCollection.reset(col.models);
            });
            this.listenTo(collection, "reset", function (col, options) {
                options = _.extend({reindex: true}, options || {});
                if (options.reindex && options.from == null && options.to == null) {
                    this.origCollection.reset(col.models);
                }
            });
        },
        events: {
            "keyup input[type=search]": "showClearButtonMaybe",
            "click a[data-backgrid-action=clear]": function (e) {
                e.preventDefault();
                this.clear(e);
            },
            "keydown input[type=search]": "search",
            "submit": function (e) {
                e.preventDefault();
                this.search(e);
            },
            "change select": "onChange"
        },
        _debounceMethods: function (methodNames) {
            if (_.isString(methodNames)) methodNames = [methodNames];

            this.undelegateEvents();

            for (let i = 0, l = methodNames.length; i < l; i++) {
                let methodName = methodNames[i];
                let method = this[methodName];
                this[methodName] = _.debounce(method, this.wait);
            }

            this.delegateEvents();
        },
        render: function () {

            this.filterQueryValue = {};
            let $filtersPanel = $(this.template());
            $filtersPanel.boxWidget({
                animationSpeed: 500,
                collapseTrigger: '[data-widget="collapse"]',
                collapseIcon: 'fa-minus',
                expandIcon: 'fa-plus'
            });
            //_log('App.Views.BackGridFiltersPanel.render', $filtersPanel);
            let inputTypeFilterDefinitions = [
                {name: 'FirstName', fields: ['FirstName'], placeholder: 'First Name'},
                {name: 'LastName', fields: ['LastName'], placeholder: 'Last Name'},
                {name: 'Email', fields: ['Email'], placeholder: 'Email'},
                {name: 'Title', fields: ['Title'], placeholder: 'Title'},
                {name: 'Phone', fields: ['Phone'], placeholder: 'Phone'},
            ];
            this.inputTypeFilters = [];
            for (let x in inputTypeFilterDefinitions) {
                this.inputTypeFilters[inputTypeFilterDefinitions[x].name] = new Backgrid.Extension.BackGridContactsFiltersPanelClientSideFilter({
                    filterName: inputTypeFilterDefinitions[x].name,
                    fields: inputTypeFilterDefinitions[x].fields,
                    placeholder: inputTypeFilterDefinitions[x].placeholder,
                    value: this.filterQueryValue[inputTypeFilterDefinitions[x].name],
                    wait: 149
                });

                $filtersPanel.find('.' + inputTypeFilterDefinitions[x].name).append(this.inputTypeFilters[inputTypeFilterDefinitions[x].name].render().el);
            }
            let siteOptions = [];
            App.Collections.sitesDropDownCollection.each(function (siteModel) {
                //console.log(siteModel.get('SiteName'))
                siteOptions.push([siteModel.get('SiteName'), siteModel.get('SiteID')])
            });

            this.selectTypeFilterDefinitions = [
                {name: 'SiteID', options: siteOptions}
            ];

            this.selectTypeFilters = [];
            for (let x in this.selectTypeFilterDefinitions) {
                this.selectTypeFilters[this.selectTypeFilterDefinitions[x].name] = new Backgrid.Extension.BackGridContactsFiltersPanelSelectFilter({
                    attributes: {'data-filter-name': this.selectTypeFilterDefinitions[x].name},
                    className: "backgrid-filter form-control",
                    field: this.selectTypeFilterDefinitions[x].name,
                    selectOptions: _.union([{label: "All", value: null}],
                        _.map(this.selectTypeFilterDefinitions[x].options, function (o) {
                            return {label: o[0], value: o[1]};
                        }))
                });
                $filtersPanel.find('.' + this.selectTypeFilterDefinitions[x].name).append(this.selectTypeFilters[this.selectTypeFilterDefinitions[x].name].render().el);
            }

            this.$el.html($filtersPanel);

            this.parentEl.find('.result_count').html(this.origCollection.length);
            return this;
        },
        /**
         Returns the search select.
         */
        getSearchSelect: function (e) {
            return this.$el.find(e.target);
        },
        currentSelectValue: function (e) {
            return _.isEmpty(this.getSearchSelect(e).val())?null:this.getSearchSelect(e).val();
        },
        onChange: function (e) {
            if (this.currentSelectValue(e) !== this.selectClearValue && this.currentSelectValue(e) !== null) {
                this.filterQueryValue[this.getFilterName(e)] = this.currentSelectValue(e);
                this.applyFilters();
            } else {
                this.filterQueryValue = _.omit(this.filterQueryValue, this.getFilterName(e));
                this.clear(e);
            }
        },
        /**
         Event handler. Clear the search box and reset the internal search value.
         */
        clearSearchBox: function (e) {
            this.filterQueryValue = _.omit(this.filterQueryValue, this.getFilterName(e));
            this.searchBox(e).val(null);
            this.showClearButtonMaybe(e);
        },
        getFilterName: function (e) {
            return this.searchBox(e).data('filter-name')
        },
        /**
         Event handler. Show the clear button when the search box has text, hide
         it otherwise.
         */
        showClearButtonMaybe: function (e) {

            let $clearButton = this.clearButton(e);
            let searchTerms = this.filterQueryValue[this.getFilterName(e)];
            _log('App.Views.BackGridFiltersPanel.showClearButtonMaybe', e, searchTerms, $clearButton);
            if (searchTerms) $clearButton.show();
            else $clearButton.hide();
        },

        /**
         Returns the search input box.
         */
        searchBox: function (e) {
            if (e.target.localName === 'a' && $(e.target).hasClass('clear')) {
                return this.$el.find(e.target).siblings("input[type=search]");
            }
            return this.$el.find(e.target);
        },

        /**
         Returns the clear button.
         */
        clearButton: function (e) {
            let $target = this.$el.find(e.target);
            if ($target.hasClass('clear')) {
                return $target;
            }
            return $target.siblings("a[data-backgrid-action=clear]");
        },

        /**
         Returns the current search query.
         */
        query: function (e) {
            this.filterQueryValue[this.getFilterName(e)] = this.searchBox(e).val();
            //_log('App.Views.BackGridFiltersPanel.query', e, 'this.searchBox(e):', this.searchBox(e), 'this.getFilterName(e):' + this.getFilterName(e), 'this.filterQueryValue[this.getFilterName(e)]:' + this.filterQueryValue[this.getFilterName(e)]);
            return this.filterQueryValue[this.getFilterName(e)];
        },

        /**
         Constructs a Javascript regular expression object for #makeMatcher.

         This default implementation takes a query string and returns a Javascript
         RegExp object that matches any of the words contained in the query string
         case-insensitively. Override this method to return a different regular
         expression matcher if this behavior is not desired.

         @param {string} query The search query in the search box.
         @return {RegExp} A RegExp object to match against model #fields.
         */
        makeRegExp: function (query) {
            let queryRegexStr = query.trim().split(/\s+/).join("|");
            //_log('App.Views.BackGridFiltersPanel.makeRegExp', 'query:', query, 'queryRegexStr:', queryRegexStr);

            return new RegExp(queryRegexStr, "i");
        },

        /**
         This default implementation takes a query string and returns a matcher
         function that looks for matches in the model's #fields or all of its
         fields if #fields is null, for any of the words in the query
         case-insensitively using the regular expression object returned from
         #makeRegExp.

         Most of time, you'd want to override the regular expression used for
         matching. If so, please refer to the #makeRegExp documentation,
         otherwise, you can override this method to return a custom matching
         function.

         Subclasses overriding this method must take care to conform to the
         signature of the matcher function. The matcher function is a function
         that takes a model as paramter and returns true if the model matches a
         search, or false otherwise.

         In addition, when the matcher function is called, its context will be
         bound to this ClientSideFilter object so it has access to the filter's
         attributes and methods.

         @param {string} query The search query in the search box.
         @return {function(Backbone.Model):boolean} A matching function.
         */
        makeMatcher: function (filterName, query) {
            let bIsSelect = -1 !== _.indexOf(_.pluck(this.selectTypeFilterDefinitions, 'name'), filterName);
            if (!bIsSelect) {
                let regexp = this.makeRegExp(query);
                //_log('App.Views.BackGridFiltersPanel.makeMatcher', 'input', 'query:', query, 'regexp:', regexp);
                return function (model) {
                    let keys = this.inputTypeFilters[filterName].fields || model.keys();
                    for (let i = 0, l = keys.length; i < l; i++) {
                        if (regexp.test(model.get(keys[i]) + "")) return true;
                    }
                    return false;
                };
            } else {
                //_log('App.Views.BackGridFiltersPanel.makeMatcher', filterName +' select', 'query:', query);
                return function (model) {
                    return model.get(filterName) == query;
                };
            }
        },
        /**
         Takes the query from the search box, constructs a matcher with it and
         loops through collection looking for matches. Reset the given collection
         when all the matches have been found.

         If the collection is a PageableCollection, searching will go back to the
         first page.
         */
        search: function (e) {
            let logCnt = 0;
            //_log('App.Views.BackGridFiltersPanel.search' + logCnt++, 'event:', e);
            // adds query to this.filterQueryValue
            this.query(e);
            this.applyFilters();

            //_log('App.Views.BackGridFiltersPanel.search' + logCnt++, 'done. grid should be filtered now.');
        },

        /**
         Clears the search box and reset the collection to its correct filter state.

         If the collection is a PageableCollection, clearing will go back to the
         first page.
         */
        clear: function (e) {
            let self = this;
            let bIsSelect = -1 !== _.indexOf(_.pluck(this.selectTypeFilterDefinitions, 'name'), this.getFilterName(e));
            if (!bIsSelect) {
                this.clearSearchBox(e);
            }
            this.filterQueryValue = _.omit(this.filterQueryValue, this.getFilterName(e));
            if (_.isEmpty(this.filterQueryValue)) {
                //_log('App.Views.BackGridFiltersPanel.clear', e, 'no filters left');
                let col = this.collection;
                if (col.pageableCollection) col.pageableCollection.getFirstPage({silent: true});
                col.reset(this.origCollection.models, {reindex: false});
                this.parentEl.find('.result_count').html(col.length);
            } else {
                //_log('App.Views.BackGridFiltersPanel.clear', e, 'found filters. need to loop through and rebuild search');
                this.applyFilters();
            }
        },
        applyFilters: function () {
            //_log('App.Views.BackGridFiltersPanel.applyFilters', 'this.filterQueryValue:', this.filterQueryValue);

            if (!_.isEmpty(this.filterQueryValue)) {
                this.shadowCollection = this.origCollection.clone();
                let col = this.collection;
                if (col.pageableCollection) col.pageableCollection.getFirstPage({silent: true});
                for (let x in this.filterQueryValue) {
                    let filterName = x;
                    let query = this.filterQueryValue[x];
                    if (!_.isNull(query)) {
                        let matcher = _.bind(this.makeMatcher(filterName, query), this);
                        this.shadowCollection = this.shadowCollection.filter(matcher)
                    }
                }

                col.reset(this.shadowCollection, {reindex: false});
                this.parentEl.find('.result_count').html(col.length)
            }
        }
    });
})(window.App);

(function (App) {
    App.Views.VolunteersManagement = Backbone.View.extend({
        template: template('managementTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'render', 'update', 'toggleDeleteBtn', 'getModalForm', 'create', 'highLightRow', 'batchDestroy');
            this.options = options;
            this.viewClassName = this.options.viewClassName;
            this.columnCollectionDefinitions = this.options.columnCollectionDefinitions;
            this.modelNameLabel = this.options.modelNameLabel;
            this.modelNameLabelLowerCase = this.modelNameLabel.toLowerCase();
            this.viewName = 'App.Views.VolunteersManagement';
            this.localStorageKey = this.modelNameLabel;
            this.backgridWrapperClassSelector = '.backgrid-wrapper';
            this.paginationControlsSelector = '.pagination-controls';
            this.gridManagerContainerToolbarClassName = 'grid-manager-container';
            this.gridManagerContainerToolbarSelector = '.' + this.gridManagerContainerToolbarClassName;
            this.ajaxWaitingSelector = '.' + this.viewClassName + ' ' + this.backgridWrapperClassSelector;
            _log(this.viewName + '.initialize', options, this);
        },
        events: {
            'focusin tbody tr': 'highLightRow'
        },
        render: function () {
            let self = this;
            this.$el.html(this.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            this.hideCellCnt = this.options.hideCellCnt;
            if (this.collection.length) {
                this.model = this.collection.at(0);
            }

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
            // Add control
            let colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                columnManager: colManager
            });

            let $gridContainer = this.$el.find(this.backgridWrapperClassSelector).html(this.backgrid.render().el);

            this.backGridFiltersPanel = new App.Views.BackGridFiltersPanel({
                collection: this.collection,
                parentEl: $gridContainer
            });

            $gridContainer.prepend(this.backGridFiltersPanel.render().$el);

            this.gridManagerContainerToolbar = new App.Views.GridManagerContainerToolbar({
                className: this.gridManagerContainerToolbarClassName,
                parentView: this,
                localStorageKey: this.localStorageKey,
                sAjaxFileUploadURL: this.modelNameLabelLowerCase + '/list/upload'
            });
            this.$el.find('.box-footer').append(this.gridManagerContainerToolbar.render().el);

            let paginator = new Backgrid.Extension.Paginator({
                collection: this.collection
            });

            // Render the paginator
            this.gridManagerContainerToolbar.$el.find(this.paginationControlsSelector).html(paginator.render().el);

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

            // Make columns reorderable
            let orderHandler = new Backgrid.Extension.OrderableColumns({
                grid: this.backgrid,
                sizeAbleColumns: sizeAbleCol
            });
            $gridContainer.find('thead').before(orderHandler.render().el);

            this.gridManagerContainerToolbar.$el.find('.file-upload-container').before(colVisibilityControl.render().el);

            if (this.collection.length) {
                this.$el.data('current-model-id', this.model.get(this.model.idAttribute));
            }

            // When a backgrid cell's model is updated it will trigger a 'backgrid:edited' event which will bubble up to the backgrid's collection
            this.backgrid.collection.on('backgrid:edited', function (e) {
                _log(self.viewName + '.render', self.modelNameLabelLowerCase + ' backgrid.collection.on backgrid:edited', e);
                self.update(e);
            });
            this.backgrid.collection.on('backgrid:selected', function (e) {
                self.toggleDeleteBtn(e);
            });
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
                        self.collection.url = '/admin/' + self.modelNameLabelLowerCase + '/list/all';
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            _log(self.viewName + '.create.event', self.modelNameLabelLowerCase + ' collection fetch promise done');
                            window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                            App.Collections.projectVolunteersCollection.set(self.collection.fullCollection.models)
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
                attributes: {id: 'PreferredSiteID', name: 'PreferredSiteID', class: 'form-control'},
                buildHTML: true,
                collection: App.Collections.sitesDropDownCollection,
                optionValueModelAttrName: 'SiteID',
                optionLabelModelAttrName: ['SiteName'],
                addBlankOption:true
            });
            let tplVars = {
                testString: '',
                testEmail: '',
                testDBID: 0,
                siteSelect: siteSelect.getHtml(),
                primarySkillOptions: App.Models.volunteerModel.getPrimarySkillOptions(true),
                schoolPreferenceOptions: App.Models.volunteerModel.getSchoolOptions(true),
                statusOptions: App.Models.volunteerModel.getStatusOptions(true),
                ageRangeOptions: App.Models.volunteerModel.getAgeRangeOptions(true),
                skillLevelOptions: App.Models.volunteerModel.getSkillLevelOptions(true),
                yesNoOptions: App.Models.projectModel.getYesNoOptions(true),
                sendStatusOptions: App.Models.volunteerModel.getSendOptions(true),
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
    });
})(window.App);

(function (App) {
    App.Views.ContactsManagement = Backbone.View.extend({
        template: template('managementTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'render', 'update', 'toggleDeleteBtn', 'getModalForm', 'create', 'highLightRow', 'batchDestroy');
            this.options = options;
            this.rowBgColor = 'lightYellow';
            this.viewClassName = this.options.viewClassName;
            this.columnCollectionDefinitions = this.options.columnCollectionDefinitions;
            this.modelNameLabel = this.options.modelNameLabel;
            this.modelNameLabelLowerCase = this.modelNameLabel.toLowerCase();
            this.viewName = 'App.Views.ContactsManagement';
            this.localStorageKey = this.modelNameLabel;
            this.backgridWrapperClassSelector = '.backgrid-wrapper';
            this.paginationControlsSelector = '.pagination-controls';
            this.gridManagerContainerToolbarClassName = 'grid-manager-container';
            this.gridManagerContainerToolbarSelector = '.' + this.gridManagerContainerToolbarClassName;
            this.ajaxWaitingSelector = '.' + this.viewClassName + ' ' + this.backgridWrapperClassSelector;
            _log(this.viewName + '.initialize', options, this);
        },
        events: {
            'focusin tbody tr': 'highLightRow'
        },
        render: function () {
            let self = this;
            this.$el.html(this.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            this.hideCellCnt = this.options.hideCellCnt;
            if (this.collection.length) {
                this.model = this.collection.at(0);
            }

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
            // Add control
            let colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                columnManager: colManager
            });

            let $gridContainer = this.$el.find(this.backgridWrapperClassSelector).html(this.backgrid.render().el);

            this.backGridFiltersPanel = new App.Views.BackGridContactsFiltersPanel({
                collection: this.collection,
                parentEl: $gridContainer
            });

            $gridContainer.prepend(this.backGridFiltersPanel.render().$el);


            this.gridManagerContainerToolbar = new App.Views.GridManagerContainerToolbar({
                className: this.gridManagerContainerToolbarClassName,
                parentView: this,
                localStorageKey: this.localStorageKey,
                sAjaxFileUploadURL: this.modelNameLabelLowerCase + '/list/upload'
            });
            this.$el.find('.box-footer').append(this.gridManagerContainerToolbar.render().el);

            let paginator = new Backgrid.Extension.Paginator({
                collection: this.collection
            });

            // Render the paginator
            this.gridManagerContainerToolbar.$el.find(this.paginationControlsSelector).html(paginator.render().el);

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

            // Make columns reorderable
            let orderHandler = new Backgrid.Extension.OrderableColumns({
                grid: this.backgrid,
                sizeAbleColumns: sizeAbleCol
            });
            $gridContainer.find('thead').before(orderHandler.render().el);

            this.gridManagerContainerToolbar.$el.find('.file-upload-container').before(colVisibilityControl.render().el);

            if (this.collection.length) {
                this.$el.data('current-model-id', this.model.get(this.model.idAttribute));
            }

            // When a backgrid cell's model is updated it will trigger a 'backgrid:edited' event which will bubble up to the backgrid's collection
            this.backgrid.collection.on('backgrid:edited', function (e) {
                _log(self.viewName + '.render', self.modelNameLabelLowerCase + ' backgrid.collection.on backgrid:edited', e);
                self.update(e);
            });
            this.backgrid.collection.on('backgrid:selected', function (e) {
                self.toggleDeleteBtn(e);
            });
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
                        self.collection.url = '/admin/' + self.modelNameLabelLowerCase + '/list/all';
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            _log(self.viewName + '.create.event', self.modelNameLabelLowerCase + ' collection fetch promise done');
                            window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                            App.Collections.contactsManagementCollection.set(self.collection.fullCollection.models);
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
    });
})(window.App);

(function (App) {
    App.Views.ProjectsDropDownOption = Backbone.View.extend({
        tagName: 'option',
        initialize: function (options) {
            _.bindAll(this, 'render');
        },
        render: function () {
            $(this.el).attr('value', this.model.get('ProjectID'))
                .html(this.model.get('SequenceNumber'));
            return this;
        }
    });
    App.Views.ProjectsDropDown = Backbone.View.extend({
        initialize: function (options) {
            this.options = options;
            this.optionsView = [];
            this.parentView = this.options.parentView;
            _.bindAll(this, 'addOne', 'addAll', 'changeSelected');
            this.collection.bind('reset', this.addAll, this);
        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (projectDropDown) {
            let option = new App.Views.ProjectsDropDownOption({model: projectDropDown});
            this.optionsView.push(option);
            $(this.el).append(option.render().el);
        },
        addAll: function () {
            _.each(this.optionsView, function (option) {
                option.remove();
            });
            this.collection.each(this.addOne);
            this.$el.trigger('change');
        },
        render: function () {
            this.addAll();
            return this;
        },
        changeSelected: function () {
            let $option = $(this.el).find(':selected');
            if (!$option.length) {
                $option = $(this.el).find(':first-child');
            }
            this.setSelectedId(this.parentView.$('select#site_years option').filter(':selected').text(), this.parentView.$('select#sites').val(), $option.val());
        },
        setSelectedId: function (Year, SiteID, ProjectID) {
            let self = this;
            if (App.Vars.mainAppDoneLoading) {
                _log('App.Views.ProjectsDropDown.setSelectedId.event', 'new project selected', ProjectID);
                self.parentView.setIFrame(Year, SiteID, ProjectID);
            }
        }
    });

    App.Views.ReportsManagement = Backbone.View.extend({
        sitesViewClass: App.Views.Sites,
        siteYearsViewClass: App.Views.SiteYears,
        projectsDropDownViewClass: App.Views.ProjectsDropDown,
        template: template('reportManagementTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'render','handleSiteStatusIDChange');
            let self = this;
            this.options = options;
            this.viewClassName = this.options.viewClassName;
            this.modelNameLabel = this.options.modelNameLabel;
            this.modelNameLabelLowerCase = this.modelNameLabel.toLowerCase().replace(' ','_');
            this.viewName = 'App.Views.ReportsManagement';
            this.localStorageKey = this.modelNameLabel;
            this.backgridWrapperClassSelector = '.backgrid-wrapper';
            this.ajaxWaitingSelector = '.' + this.viewClassName + ' ' + this.backgridWrapperClassSelector;
            this.reportType = this.options.reportType;

            _log(this.viewName + '.initialize', options, this);
        },
        events: {},
        render: function () {
            let self = this;
            this.$el.html(this.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            App.Views.sitesDropDownView = this.sitesDropDownView = new this.sitesViewClass({
                el: this.$('select#sites'),
                parentView: this,
                collection: App.Collections.sitesDropDownCollection
            });
            this.sitesDropDownView.render();


            App.Views.siteYearsDropDownView = this.siteYearsDropDownView = new this.siteYearsViewClass({
                el: this.$('select#site_years'),
                parentView: this,
                collection: App.Collections.siteYearsDropDownCollection
            });
            this.siteYearsDropDownView.render();

            App.Views.projectsDropDownView = this.projectsDropDownView = new this.projectsDropDownViewClass({
                el: this.$('select#projects'),
                parentView: this,
                collection: App.Collections.projectsDropDownCollection
            });
            this.projectsDropDownView.render();

            this.listenTo(App.Views.siteYearsDropDownView, 'site-status-id-change', function (e) {
                self.handleSiteStatusIDChange(e);
            });
            this.listenTo(App.Views.sitesDropDownView, 'site-id-change', function (e) {
                self.handleSiteStatusIDChange(e);
            });

            if (this.reportType !== 'projects') {
                this.$('.project-dropdown').hide();
            } else {
                this.$('.project-dropdown').show();
            }

            if (this.reportType === 'sites') {
                this.$('.site-management-selects').hide();
            }
            this.$('.site-management-selects').hide();
            this.$('.project-dropdown').hide();
            this.handleSiteStatusIDChange();
            window.ajaxWaiting('remove', self.ajaxWaitingSelector);

            return this;
        },
        handleSiteStatusIDChange: function (e) {
            let self = this;
            if (this.reportType !== 'projects') {
                self.setIFrame(this.$('select#site_years option').filter(':selected').text(), this.$('select#sites').val(), this.$('select#projects').val());
            } else {
                self.setIFrame(this.$('select#site_years option').filter(':selected').text(), this.$('select#sites').val());
            }
        },
        setIFrame: function (Year, SiteID, ProjectID) {
            let self = this;
            switch (self.reportType) {
                case 'sites':
                    App.Models.reportModel.url = '/admin/report/'+ self.reportType+'/' + Year + '/' + SiteID + '/' + ProjectID;
                    break;
                case 'projects':
                    App.Models.reportModel.url = '/admin/report/'+ self.reportType+'/' + Year + '/' + SiteID + '/' + ProjectID;
                    break;
                    case 'early_start_projects':
                    App.Models.reportModel.url = '/admin/report/'+ self.reportType+'/' + Year + '/' + SiteID + '/' + ProjectID;
                    break;
                case 'volunteers':
                    App.Models.reportModel.url = '/admin/report/'+ self.reportType+'/' + Year + '/' + SiteID + '/' + ProjectID;
                    break;
                default:
                    App.Models.reportModel.url = '/admin/report/'+ self.reportType+'/' + Year + '/' + SiteID + '/' + ProjectID;
            }
            self.$('.download-pdf').attr('href', App.Models.reportModel.url + '/pdf');
            self.$('.download-csv').attr('href', App.Models.reportModel.url + '/csv');
            self.$('.download-spreadsheet').attr('href', App.Models.reportModel.url + '/spreadsheet');
            // fetch new report
            $.ajax({
                type: "get",
                dataType: "html",
                url: App.Models.reportModel.url,
                success: function (response) {
                    self.$('.report-wrapper').html(response)
                },
                fail: function (response) {
                    console.error(response)
                }
            })

        }
    });


})(window.App);

(function (App) {
    App.Views.StatusManagementRecord = Backbone.View.extend({
        tagName: 'div',
        attributes: {
            class: 'row'
        },
        template: template('statusManagementRecordTemplate'),
        initialize: function (options) {
            let self = this;
            self.options = options;
            self.defaultStateIcon = 'fa fa-circle';
            self.doneIcon = self.defaultStateIcon + ' text-success';
            self.pendingIcon = self.defaultStateIcon + ' text-warning';
            self.validateIcon = 'fas fa-dot-circle text-warning';
            self.notDoneIcon = self.defaultStateIcon + ' text-danger';
            /**
             * Init oFieldCnts values.
             * Needs to be in sync with self.oStatusManagementRecordModels.oFieldCnts
             * @type {number}
             */
            let iProjectDescriptionCompleteCnt = 0;
            let iBudgetEstimationCompleteCnt = 0;
            let iBudgetActualCompleteCnt = 0;
            let iVolunteerEstimationCompleteCnt = 0;
            let iVolunteerAssignmentCompleteCnt = 0;
            self.oStatusManagementRecordModels = {
                oFieldCnts: {
                    iBudgetEstimationCompleteCnt: iBudgetEstimationCompleteCnt,
                    iBudgetActualCompleteCnt: iBudgetActualCompleteCnt,
                    iVolunteerEstimationCompleteCnt: iVolunteerEstimationCompleteCnt,
                    iVolunteerAssignmentCompleteCnt: iVolunteerAssignmentCompleteCnt,
                    iProjectDescriptionCompleteCnt: iProjectDescriptionCompleteCnt
                },
                sitestatus: {
                    aFields: ['ProjectDescriptionComplete', 'BudgetEstimationComplete', 'BudgetActualComplete', 'VolunteerEstimationComplete', 'VolunteerAssignmentComplete'],
                    oFieldCntsMap: {
                        ProjectDescriptionComplete: {fieldCntsKey: 'iProjectDescriptionCompleteCnt'},
                        BudgetEstimationComplete: {fieldCntsKey: 'iBudgetEstimationCompleteCnt'},
                        BudgetActualComplete: {fieldCntsKey: 'iBudgetActualCompleteCnt'},
                        VolunteerEstimationComplete: {fieldCntsKey: 'iVolunteerEstimationCompleteCnt'},
                        VolunteerAssignmentComplete: {fieldCntsKey: 'iVolunteerAssignmentCompleteCnt'}
                    },
                    oStatusEntryFieldsMap: {
                        ProjectDescriptionComplete: {fieldName: 'ProjectDescription', incompleteValue: ''},
                        BudgetEstimationComplete: {fieldName: 'CostEstimateDone', incompleteValue: '0'},
                        BudgetActualComplete: {fieldName: 'BudgetAllocationDone', incompleteValue: '0'},
                        VolunteerEstimationComplete: {fieldName: 'VolunteerAllocationDone', incompleteValue: '0'},
                        VolunteerAssignmentComplete: {fieldName: '', incompleteValue: false, condition: "project.VolunteersNeededEst.toString() !== oStatusEntryFields['VolunteerEstimationComplete'].incompleteValue.toString() && project.VolunteersNeededEst.toString() !== '0' && project.VolunteersAssigned.toString() === project.VolunteersNeededEst.toString()"}
                    }
                },
                project: {
                    aFields: ['ProjectDescription', 'Status', 'CostEstimateDone', 'BudgetAllocationDone', 'MaterialListDone', 'VolunteerAllocationDone', 'ProjectSend', 'FinalCompletionStatus'],
                    oValidation: {
                        default: ['1'],
                        Status: [],
                        ProjectSend: [] // doesn't need validation
                    },
                    oFieldCntsMap: {
                        ProjectDescription: {fieldCntsKey: 'iProjectDescriptionCompleteCnt'},
                        CostEstimateDone: {fieldCntsKey: 'iBudgetEstimationCompleteCnt'},
                        BudgetAllocationDone: {fieldCntsKey: 'iBudgetActualCompleteCnt'},
                        VolunteerAllocationDone: {fieldCntsKey: 'iVolunteerEstimationCompleteCnt'}
                    },
                    oStatusEntryFieldsMap: {
                        ReadyForRegistration: {fieldName: '', incompleteValue: false, condition: "project.CostEstimateDone.toString() === 1 && project.BudgetAllocationDone.toString() === 1 && project.MaterialListDone.toString() === 1 && project.VolunteerAllocationDone.toString() === 1"},
                        ProjectDescription: {fieldName: 'ProjectDescription', incompleteValue: ''},
                        CostEstimateDone: {fieldName: 'EstimatedCost', incompleteValue: ''},
                        BudgetAllocationDone: {fieldName: 'BudgetSources', incompleteValue: ''},
                        MaterialListDone: {fieldName: 'MaterialsNeeded', incompleteValue: ''},
                        VolunteerAllocationDone: {fieldName: 'VolunteersNeededEst', incompleteValue: '0'},
                        VolunteerAssignmentComplete: {fieldName: '', completeValue: true, condition: "project.VolunteersNeededEst.toString() !== oStatusEntryFields['VolunteerAllocationDone'].incompleteValue.toString() && project.VolunteersNeededEst.toString() !== '0' && project.VolunteersAssigned.toString() === project.VolunteersNeededEst.toString()"}
                    }
                }
            };
            _.bindAll(self, 'render', 'setPopOverContent', 'cancelSaveStatusManagementOption', 'saveStatusManagementOption');
        },
        events: {
            'click button': 'update',
            'change .form-control': 'enableSave',
            'change [name="value"]': 'enableSave',
            'inserted.bs.popover [data-popover="true"]': 'setPopOverContent',
            'click .popover-status-management-form .cancel': 'cancelSaveStatusManagementOption',
            'click .popover-status-management-form .save': 'saveStatusManagementOption',
        },
        render: function () {
            let self = this;
            //console.log(self.model.attributes)
            let $statusManagementRecord = self.template({model: self.setTemplateVars(self.model.attributes)});
            $(self.el).append($statusManagementRecord);

            return this;
        },
        setTemplateVars: function (modelAttributes) {
            let self = this;
            let projectCnt = modelAttributes.projects.length;
            let oFieldCnts = self.oStatusManagementRecordModels.oFieldCnts;

            for (let i = 0; i < projectCnt; i++) {
                [modelAttributes.projects[i], oFieldCnts] = self.setProjectStatusStates(modelAttributes.projects[i], oFieldCnts);
            }
            /**
             * Setup for Site Statuses
             */

            modelAttributes = self.setSiteStatusStates(modelAttributes, oFieldCnts);

            return modelAttributes;
        },
        calculateSiteStatusCompletedFieldCnt: function (sFieldName, modelAttributes, oStatusEntryFields) {
            let self = this;
            let projectCnt = modelAttributes.projects.length;
            let iFieldCnt = 0;
            //console.log('calculateSiteStatusFieldCnt', sFieldName, oStatusEntryFields[sFieldName], oStatusEntryFields, modelAttributes)
            for (let i = 0; i < projectCnt; i++) {
                let project = modelAttributes.projects[i];
                if (oStatusEntryFields[sFieldName].fieldName !== '') {
                    if (project[oStatusEntryFields[sFieldName].fieldName].toString() !== oStatusEntryFields[sFieldName].incompleteValue.toString()) {
                        iFieldCnt++;
                    }
                } else if (typeof oStatusEntryFields[sFieldName].condition !== 'undefined') {
                    if (eval(oStatusEntryFields[sFieldName].condition) !== oStatusEntryFields[sFieldName].incompleteValue) {
                        iFieldCnt++;
                    }
                }
            }

            return iFieldCnt;
        },
        setSiteStatusStates: function (modelAttributes, oFieldCnts) {
            let self = this;
            let oMappedFieldCnts = self.oStatusManagementRecordModels.sitestatus.oFieldCntsMap;
            let projectCnt = modelAttributes.projects.length;
            _.each(self.oStatusManagementRecordModels.sitestatus.aFields, function (sFieldName, key) {
                let sStateKey = self.buildStateKey(sFieldName);
                let sToolTipKey = self.buildToolTipContentKey(sFieldName);
                let fieldCnt = typeof oFieldCnts !== 'undefined' ? self.getFieldCnt(oMappedFieldCnts[sFieldName].fieldCntsKey, oFieldCnts) : self.calculateSiteStatusCompletedFieldCnt(sFieldName, modelAttributes, self.oStatusManagementRecordModels.sitestatus.oStatusEntryFieldsMap);
                if (fieldCnt.toString() === projectCnt.toString() && modelAttributes[sFieldName].toString() === '0') {
                    modelAttributes[sStateKey] = self.validateIcon;
                } else {
                    modelAttributes[sStateKey] = (modelAttributes[sFieldName].toString() === '1' ? self.doneIcon : self.notDoneIcon);
                }
                /**
                 * Setup for tooltips
                 */
                modelAttributes[sToolTipKey] = self.cleanForToolTip(self.getYesNoOptionLabel(modelAttributes[sFieldName]));
            });

            return modelAttributes;
        },
        buildStateKey: function (val) {
            return s.decapitalize(val) + 'State';
            //return val.charAt(0).toLowerCase() + val.slice(1) + 'State';
        },
        buildToolTipContentKey: function (val) {
            return val + 'ToolTipContent';
        },
        getFieldCnt: function (FieldCntName, oFieldCnts) {
            let self = this;
            return oFieldCnts[FieldCntName];
        },
        incrementFieldCnt: function (FieldCntName, oFieldCnts) {
            let self = this;
            if (typeof oFieldCnts[FieldCntName] !== 'undefined') {
                oFieldCnts[FieldCntName]++;
            }
            return oFieldCnts;
        },
        setProjectStatusStates: function (project, oFieldCnts) {
            let self = this;
            let oMappedFieldCnts = self.oStatusManagementRecordModels.project.oFieldCntsMap;
            let oStatusEntryFields = self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap;

            _.each(self.oStatusManagementRecordModels.project.aFields, function (sFieldName, key) {
                let bFlaggedAsComplete = null;
                let sStateKey = self.buildStateKey(sFieldName);
                let sStatusEntryField = typeof oStatusEntryFields[sFieldName] !== 'undefined' ? oStatusEntryFields[sFieldName].fieldName : null;
                let sIncompleteStatusEntryValue = typeof oStatusEntryFields[sFieldName] !== 'undefined' ? oStatusEntryFields[sFieldName].incompleteValue : '';
                let sToolTipKey = self.buildToolTipContentKey(sFieldName);

                // If the db value is null set it to its expected incomplete value
                if (!_.isNull(sStatusEntryField) && _.isNull(project[sStatusEntryField])) {
                    project[sStatusEntryField] = sIncompleteStatusEntryValue;
                }
                switch (sFieldName) {
                    case 'Status':
                        switch (project[sFieldName].toString()) {
                            case '1':
                                project[sStateKey] = self.notDoneIcon + ' blank';
                                break;
                            case '2':
                                project[sStateKey] = self.doneIcon + ' dn-district';
                                break;
                            case '3':
                                project[sStateKey] = self.doneIcon + ' dn-woodlands';
                                break;
                            case '4':
                                project[sStateKey] = self.doneIcon + ' na-district';
                                break;
                            case '5':
                                project[sStateKey] = self.doneIcon + ' na-woodlands';
                                break;
                            case '6':
                                project[sStateKey] = self.pendingIcon + ' pending';
                                break;
                            case '7':
                                project[sStateKey] = self.doneIcon + ' approved';
                                break;
                            case '8':
                                project[sStateKey] = self.doneIcon + ' cancelled';
                                break;
                            default:
                                project[sStateKey] = self.notDoneIcon;
                        }
                        project[sToolTipKey] = self.cleanForToolTip(self.getProjectStatusOptionLabel(project[sFieldName]));
                        break;
                    case 'ProjectSend':
                        switch (project[sFieldName].toString()) {
                            case '3':
                                project[sStateKey] = self.validateIcon + ' ready-state';
                                break;
                            case '4':
                                project[sStateKey] = self.doneIcon + ' sent-state';
                                break;
                            default:
                                project[sStateKey] = self.notDoneIcon + ' not-ready-state';
                        }
                        project[sToolTipKey] = self.cleanForToolTip(self.getSendStatusOptionLabel(project[sFieldName]));
                        break;
                    case 'ProjectDescription':
                        if (sStatusEntryField !== null && project[sStatusEntryField].toString() === sIncompleteStatusEntryValue.toString()) {
                            project[sStateKey] = 'fa fa-info-circle text-danger';
                            project[sToolTipKey] = self.cleanForToolTip(sStatusEntryField.split(/(?=[A-Z])/).join(" ") + ' is empty.');
                        } else {
                            project[sStateKey] = 'fa fa-info-circle text-success';
                            if (typeof oMappedFieldCnts[sFieldName] !== 'undefined' && oMappedFieldCnts[sFieldName] !== null) {
                                oFieldCnts = self.incrementFieldCnt(oMappedFieldCnts[sFieldName].fieldCntsKey, oFieldCnts);
                            }
                            project[sToolTipKey] = self.cleanForToolTip(project[sStatusEntryField].toString());
                        }

                        break;
                    case 'BudgetAllocationDone':
                        let budgetTotal = 0.00;
                        let budgetToolTip = "<table class='tooltip-table table table-condensed'>";
                        budgetToolTip += '<thead><tr><th>Amt</th><th>Source</th><th>Comment</th></tr></thead><tbody>';
                        let aBudgets = App.Collections.annualBudgetsManagementCollection.where({ProjectID: project.ProjectID});
                        _.each(aBudgets, function (budget, idx) {
                            budgetTotal += parseFloat(budget.get('BudgetAmount'));
                            budgetToolTip += '<tr><td>' + budget.get('BudgetAmount') + '</td><td>' + self.getBudgetSourceOptionLabel(budget.get('BudgetSource')) + '</td><td class=\'hide-overflow\'>' + budget.get('Comments') + '</td></tr>';
                        });
                        budgetToolTip += '<tr><td>' + budgetTotal.toString() + '</td><td colspan=\'2\'><strong>Total</strong></td></tr>';
                        budgetToolTip += '</tbody></table>';

                        project[sToolTipKey] = self.cleanForToolTip(budgetToolTip);
                    default:
                        bFlaggedAsComplete = project[sFieldName].toString() === '1';
                        // Has ability to be validated
                        // console.log({sFieldName: sFieldName, sStatusEntryField: sStatusEntryField, sIncompleteStatusEntryValue: sIncompleteStatusEntryValue, project_sStatusEntryField: project[sStatusEntryField],project: project})

                        if (sStatusEntryField !== null && (project[sStatusEntryField].toString() !== sIncompleteStatusEntryValue.toString() && !bFlaggedAsComplete)) {
                            project[sStateKey] = self.validateIcon;
                        } else {
                            project[sStateKey] = (bFlaggedAsComplete ? self.doneIcon : self.notDoneIcon);
                            if (bFlaggedAsComplete) {
                                if (typeof oMappedFieldCnts[sFieldName] !== 'undefined' && oMappedFieldCnts[sFieldName] !== null) {
                                    oFieldCnts = self.incrementFieldCnt(oMappedFieldCnts[sFieldName].fieldCntsKey, oFieldCnts);
                                }
                            } else {
                                if (sStatusEntryField !== null && sIncompleteStatusEntryValue.toString() === '' && (project[sStatusEntryField].toString() === sIncompleteStatusEntryValue.toString())) {
                                    project[sToolTipKey] = self.cleanForToolTip(sStatusEntryField.split(/(?=[A-Z])/).join(" ") + ' is empty.');
                                }
                            }
                        }
                        if (typeof project[sToolTipKey] === 'undefined') {
                            if (sStatusEntryField !== null) {
                                project[sToolTipKey] = self.cleanForToolTip(project[sStatusEntryField]);
                            } else {
                                project[sToolTipKey] = self.cleanForToolTip(self.getYesNoOptionLabel(project[sFieldName]));
                            }
                        }
                }
            });

            if (typeof oFieldCnts !== 'undefined' && eval(oStatusEntryFields['VolunteerAssignmentComplete'].condition) === oStatusEntryFields['VolunteerAssignmentComplete'].completeValue) {
                oFieldCnts = self.incrementFieldCnt('iVolunteerAssignmentCompleteCnt', oFieldCnts);
            }

            if (typeof oFieldCnts !== 'undefined') {
                return [project, oFieldCnts];
            } else {
                return project;
            }
        },
        getBudgetSourceOptionLabel: function (optionId) {
            let label = '';
            _.each(App.Vars.selectOptions['BudgetSourceOptions'], function (val, key) {
                if (val.toString() === optionId.toString()) {
                    label = key;
                }
            });
            return label;
        },
        getSendStatusOptionLabel: function (optionId) {
            let label = '';
            _.each(App.Vars.selectOptions['SendStatusOptions'], function (val, key) {
                if (val.toString() === optionId.toString()) {
                    label = key;
                }
            });
            return label;
        },
        getProjectStatusOptionLabel: function (optionId) {
            let label = '';
            _.each(App.Vars.selectOptions['ProjectStatusOptions'], function (val, key) {
                if (val.toString() === optionId.toString()) {
                    label = key;
                }
            });
            return label;
        },
        getYesNoOptionLabel: function (optionId) {
            return optionId.toString() === '1' ? 'Yes' : 'No';
        },
        cleanForToolTip: function (str) {
            // converts unicode to html entities
            // replaces double quotes with html entity
            return (str === '' || str === null || typeof str === 'undefined') ? '' : str.toString().replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
                return '&#' + i.charCodeAt(0) + ';';
            }).replace('"', '&quot;');
        },
        setPopOverContent: function (e) {
            let self = this;
            let aOptions = [];
            let $icon = $(e.currentTarget);
            let $oModel = null;
            if ($icon.data('model-type') === 'project') {
                switch ($icon.data('field')) {
                    case 'CostEstimateDone':
                    case 'BudgetAllocationDone':
                    case 'MaterialListDone':
                    case 'VolunteerAllocationDone':
                    case 'VolunteerEstimationComplete':
                    case 'VolunteerAssignmentComplete':
                    case 'ProjectDescriptionComplete':
                    case 'BudgetEstimationComplete':
                        aOptions = App.Models.projectModel.getYesNoOptions();
                        break;
                    case 'Status':
                        aOptions = App.Models.projectModel.getStatusOptions();
                        break;
                    case 'ProjectSend':
                        aOptions = App.Models.projectModel.getSendOptions();
                        break;
                }
                $oModel = App.Collections.allProjectsCollection.get(parseInt($icon.data('id')));
            } else if ($icon.data('model-type') === 'sitestatus') {
                aOptions = App.Models.projectModel.getYesNoOptions();
                $oModel = App.Collections.statusManagementCollection.find({SiteStatusID: parseInt($icon.data('id'))});
            }
            // Remove the empty option if it exists
            if (typeof aOptions[0][''] !== 'undefined') {
                aOptions.shift();
            }
            let $popover = $icon.siblings('.popover');
            $popover.find('.popover-title').html('<strong>' + $icon.data('field').split(/(?=[A-Z])/).join(" ") + '</strong>');
            let sOptions = _.map(aOptions, function (option, key) {
                let checked = $oModel !== null && $oModel.get($icon.data('field')).toString() === option[1].toString() ? 'checked' : '';
                return '<div class="radio"><label><input type="radio" ' + checked + ' name="' + $icon.data('field') + '" value="' + option[1] + '"/>' + option[0] + '</label></div>';
            }).join('');
            let sHiddenInputs = '<input type="hidden" name="model-type" value="' + $icon.data('model-type') + '"/><input type="hidden" name="id" value="' + $icon.data('id') + '"/><input type="hidden" name="field" value="' + $icon.data('field') + '"/>';
            let sForm = '<form class="popover-status-management-form" name="status-management-option-update-' + $icon.data('field') + '-' + $icon.data('id') + '">' + sHiddenInputs + sOptions + '<div class="text-right"><button class="cancel btn btn-default">Cancel</button> <button class="save btn btn-primary">Save</button></div></form>';
            $popover.find('.popover-content').html(sForm);

        },
        validateOptionToSave: function (modelType, modelField, modelId, modelFieldValue) {
            let self = this;
            let validationMsg = '';
            let errMsg = 'This "' + modelField.split(/(?=[A-Z])/).join(" ") + '" status does not look ready. Are you sure you want to save?';
            if (modelType === 'sitestatus') {
                if (modelFieldValue.toString() === '1') {
                    let $statusManagementRecord = App.Collections.statusManagementCollection.find({SiteStatusID: parseInt(modelId)});
                    let completedCnt = self.calculateSiteStatusCompletedFieldCnt(modelField, $statusManagementRecord.attributes, self.oStatusManagementRecordModels.sitestatus.oStatusEntryFieldsMap);
                    if (completedCnt !== $statusManagementRecord.attributes.projects.length) {
                        validationMsg = errMsg;
                    }
                }
            } else {
                let aValidationIds = typeof self.oStatusManagementRecordModels.project.oValidation[modelField] !== 'undefined' ? self.oStatusManagementRecordModels.project.oValidation[modelField] : self.oStatusManagementRecordModels.project.oValidation.default;
                let bRequiresValidation = _.contains(aValidationIds, modelId.toString());
                if (bRequiresValidation) {
                    let project = App.Collections.allProjectsCollection.get(parseInt(modelId));
                    if (typeof self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap[modelField] !== 'undefined' && self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap[modelField].fieldName !== '') {
                        if (project[self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap[modelField].fieldName].toString() === self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap[modelField].toString()) {
                            validationMsg = errMsg;
                        } else {
                            if (typeof self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap[modelField].condition !== 'undefined') {
                                if (eval(self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap[modelField].condition) !== self.oStatusManagementRecordModels.project.oStatusEntryFieldsMap[modelField].incompleteValue) {
                                    validationMsg = errMsg;
                                }
                            }
                        }
                    }
                }
            }

            return validationMsg;
        },
        closeStatusFormPopover: function ($icon) {
            $icon.trigger('click');
        },
        saveStatusManagementOption: function (e) {
            let self = this;
            e.preventDefault();
            let $form = $(e.currentTarget).parents('form');
            let modelType = $form.find('[name="model-type"]').val();
            let modelField = $form.find('[name="field"]').val();
            let modelId = $form.find('[name="id"]').val();
            let modelFieldValue = $form.find('[name="' + modelField + '"]:checked').val();
            let $icon = $form.parents('.popover').siblings('i');
            let bSaveOptionValue = true;
            let validationMsg = self.validateOptionToSave(modelType, modelField, modelId, modelFieldValue);
            if (validationMsg !== '') {
                if (!confirm(validationMsg)) {
                    self.closeStatusFormPopover($icon);
                    bSaveOptionValue = false;
                    return;
                }
            }
            if (bSaveOptionValue) {
                window.ajaxWaiting('show', $form);
                if (modelType === 'project') {
                    let projectModel = App.Collections.allProjectsCollection.get(modelId);
                    projectModel.url = '/admin/project/' + modelId;
                    projectModel.save({[modelField]: modelFieldValue},
                        {
                            success: function (savedModel, response, options) {
                                $.when(
                                    App.Collections.statusManagementCollection.fetch({reset: true})
                                ).then(function (data, textStatus, jqXHR) {
                                    growl(response.msg, response.success ? 'success' : 'error');
                                    self.closeStatusFormPopover($icon);
                                    $icon.removeClass();
                                    $icon.addClass(self.getStatusCSS(savedModel, modelType, modelField));
                                    // These fields do not have the status state in their tooltip
                                    let aSkipTooltipStatusUpdate = ['CostEstimateDone', 'BudgetAllocationDone', 'MaterialListDone', 'VolunteerAllocationDone'];
                                    if (!_.contains(aSkipTooltipStatusUpdate, modelField)) {
                                        let optionLabel = '';
                                        switch (modelField) {
                                            case 'Status':
                                                optionLabel = self.getProjectStatusOptionLabel(modelFieldValue);
                                                break;
                                            case 'ProjectSend':
                                                optionLabel = self.getSendStatusOptionLabel(modelFieldValue);
                                                break;
                                            default:
                                                optionLabel = self.getYesNoOptionLabel(modelFieldValue);
                                                break;
                                        }
                                        // update tooltip with new status
                                        $icon.attr('title', optionLabel);
                                        $icon.removeAttr('data-original-title');
                                        $icon.tooltip('fixTitle');
                                    }
                                });
                            },
                            error: function (model, response, options) {
                                growl(response.msg, 'error');
                            }
                        });
                } else if (modelType === 'sitestatus') {
                    let siteStatusModel = new App.Models.SiteStatus();
                    siteStatusModel.url = '/admin/sitestatus/' + modelId;
                    $.when(
                        siteStatusModel.fetch({reset: true})
                    ).then(function () {
                        siteStatusModel.save({[modelField]: modelFieldValue}, {
                            success: function (savedModel, response, options) {
                                $.when(
                                    App.Collections.statusManagementCollection.fetch({reset: true})
                                ).then(function (data, textStatus, jqXHR) {
                                    growl(response.msg, response.success ? 'success' : 'error');
                                    self.closeStatusFormPopover($icon);
                                    $icon.removeClass();
                                    $icon.addClass(self.getStatusCSS(savedModel, modelType, modelField));
                                    let optionLabel = self.getYesNoOptionLabel(modelFieldValue);
                                    // update tooltip with new status
                                    $icon.attr('title', optionLabel);
                                    $icon.removeAttr('data-original-title');
                                    $icon.tooltip('fixTitle');
                                });
                            },
                            error: function (model, response, options) {
                                growl(response.msg, 'error');
                            }
                        });
                    });
                }
            }
        },
        cancelSaveStatusManagementOption: function (e) {
            let self = this;
            e.preventDefault();
            let $icon = $(e.currentTarget).parents('.popover').siblings('i');
            self.closeStatusFormPopover($icon);
        },
        getStatusCSS: function (savedModel, modelType, modelField) {
            let self = this;
            let savedModelAttributes = null;
            if (modelType === 'project') {
                savedModelAttributes = self.setProjectStatusStates(savedModel.attributes, self.oStatusManagementRecordModels.oFieldCnts)[0];
            } else if (modelType === 'sitestatus') {
                let $statusManagementRecord = App.Collections.statusManagementCollection.find({SiteStatusID: parseInt(savedModel.get('SiteStatusID'))});
                savedModelAttributes = self.setSiteStatusStates($statusManagementRecord.attributes);
            }
            let fieldStateVar = self.buildStateKey(modelField);
            //console.log('getStatusCSS', fieldStateVar, savedModelAttributes, savedModel)
            return typeof savedModelAttributes[fieldStateVar] !== 'undefined' ? savedModelAttributes[fieldStateVar] : '';
        },
    });

    App.Views.StatusManagement = Backbone.View.extend({
        attributes: {
            class: 'status-management-view route-view box box-primary'
        },
        template: template('statusManagementTemplate'),
        initialize: function (options) {
            let self = this;
            self.options = options;

            _.bindAll(self, 'render', 'addOne', 'addAll');
            self.collection.bind('reset', self.addAll, self);
        },
        events: {},
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(self.template());
            self.addAll();

            return self;
        },
        addOne: function (StatusManagement) {
            let self = this;
            if (StatusManagement.attributes.projects.length) {
                let $settingItem = new App.Views.StatusManagementRecord({model: StatusManagement});
                self.$el.find('.status-management-wrapper').append($settingItem.render().el);
            }
        },
        addAll: function () {
            let self = this;
            self.$el.find('.status-management-wrapper').empty();

            self.collection.each(this.addOne);
            self.$el.find('[data-toggle="tooltip"]').tooltip({html: true});
            self.$el.find('[data-popover="true"]').popover({html: true, title: ''});
        }
    });
})(window.App);

(function (App) {
    App.Views.mainApp = Backbone.View.extend({
        el: $(".sia-main-app"),
        initialize: function (options) {
            let self = this;
            _log('App.Views.mainApp.initialize', 'MainApp', 'initialize');
            _.bindAll(self, 'render', 'setRouteView');
            self.routeView              = null;
            self.bOnlyRenderRouteView   = false;
            App.Vars.currentSiteID      = App.Vars.appInitialData.site.SiteID;
            App.Vars.currentProjectID   = App.Vars.appInitialData.project.ProjectID;
            App.Vars.currentSiteVolunteerRoleID   = App.Vars.appInitialData.site_volunteer.SiteVolunteerRoleID;
            App.Vars.mainAppDoneLoading = false;
            self.listenTo(App.Models.projectModel, 'sync', function (e) {
                App.Collections.statusManagementCollection.fetch({reset: true})
            });
            self.listenTo(App.Models.siteStatusModel, 'sync', function (e) {
                App.Collections.statusManagementCollection.fetch({reset: true})
            });
            self.listenTo(App.Models.siteModel, 'sync', function (e) {
                App.Collections.statusManagementCollection.fetch({reset: true})
            });
            self.listenTo(App.Models.projectBudgetModel, 'sync', function (e) {
                App.Collections.annualBudgetsManagementCollection.fetch({reset: true})
            });
            self.checkBrowser();
            self.checkMobileDevice();
        },
        checkBrowser: function(){
            let bIsChrome = navigator.userAgent.indexOf('Chrome') > -1;
            let bIsExplorer = navigator.userAgent.indexOf('MSIE') > -1;
            let bIsFirefox = navigator.userAgent.indexOf('Firefox') > -1;
            let bIsSafari = navigator.userAgent.indexOf("Safari") > -1;
            let bIsOpera = navigator.userAgent.toLowerCase().indexOf("op") > -1;
            if ((bIsChrome) && (bIsSafari)) {
                bIsSafari = false;
            }
            if ((bIsChrome) && (bIsOpera)) {
                bIsChrome = false;
            }

            if (bIsSafari) {
                alert('Sorry, the Safari browser is not supported yet and things will randomly not work if you continue to use it. Please use Chrome or Firefox.');
            }
        },
        checkMobileDevice: function(){
            if((typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)){
                alert('The Spring Into Action admin has not been developed for mobile devices. Use at your own risk.')
            }
        },
        setRouteView: function (view, bOnlyRenderRouteView) {
            this.routeView = view;
            if (typeof bOnlyRenderRouteView !== 'undefined') {
                this.bOnlyRenderRouteView = bOnlyRenderRouteView;
            }
            return this;
        },
        render: function () {
            let self = this;

            if (self.routeView !== null) {
                if (self.bOnlyRenderRouteView) {
                    /**
                     * The routeView had to execute $(this.options.mainApp.el).html(this.template());
                     * in order to render its own child views.
                     * Don't do it again or it will remove everything the routeView created
                     */
                    self.routeView.render();

                } else {
                    this.$el.html(self.routeView.render().el);
                }
            }

            _log('App.Views.mainApp.render', 'render', 'routeView:' + self.routeView.$el.attr('class'), this.$el);
            if (App.Vars.mainAppDoneLoading === false) {
                App.Vars.mainAppDoneLoading = true;
                _log('App.Views.mainApp.render', 'App.Vars.mainAppDoneLoading = true');
            }
            // Hack to force grid columns to work
            $('body').trigger('resize');
            return this;
        }
    });

})(window.App);
