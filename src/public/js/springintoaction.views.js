(function (App) {
    App.Views.Dashboard = App.Views.Backend.extend({
        viewName:'dashboard',
        attributes: {
            class: 'route-view dashboard'
        },
        template: _.template([
            "<% for (let i=0; i < dashboardPanelViews.length; i++) { %>",
            '   <div class="dashboard-grid-item col-xs-6">',
            "    <%= dashboardPanelViews[i] %>",
            "   </div>",
            "<% } %>"
        ].join("\n")),
        initialize: function (options) {
            let self = this;
            self._initialize(options);
            self.dashboardPanelViews = options['dashboardPanelViews'];
        },
        render: function () {
            let self = this;
            self.$el.off();
            self.$el.empty().append(self.template({
                dashboardPanelViews: self.dashboardPanelViews
            }));
            setTimeout(function () {
                self.$el.masonry({
                    columnWidth: self.$('.dashboard-grid-item')[0],
                    itemSelector: '.dashboard-grid-item'
                });
            }, 1000);
            return self;
        },
        close: function () {
            this.remove();
            // handle other unbinding needs, here
            _.each(this.dashboardPanelViews, function (childView) {
                if (childView.close) {
                    try {
                        childView.close();
                    } catch (e) {
                    }
                } else if (childView.remove) {
                    try {
                        childView.remove();
                    } catch (e) {
                    }
                }
            })
        }
    });
    App.Views.DashboardPanel = App.Views.Backend.extend({
        viewName: 'dashboard-panel',
        template: template('dashboardPanelTemplate'),
        initialize: function (options) {
            let self = this;
            self._initialize(options);
        },
        events: {},
        render: function () {
            let self = this;
            self.$el.append(self.template(self.model.toJSON()));
            return self;
        }
    });
    App.Views.DashboardPanelLinksListItem = App.Views.Backend.extend({
        viewName: 'dashboard-panel-links-list-item',
        tagName: 'li',
        template: _.template("<a href=\"#/<%=route%>\" data-route><%=linkText%> <span class=\"pull-right badge bg-blue\"><%=badgeCount%></span></a>"),
        initialize: function (options) {
            let self = this;
            self._initialize(options);
        },
        events: {

        },
        render: function () {
            let self = this;
            let $link = self.template({
                linkText: self.model.get('linkText'),
                badgeCount: self.model.get('badgeCount'),
                route: self.model.get('route')
            });
            self.$el.append($link);
            return self;
        }
    });

    App.Views.DashboardPanelLinksList = App.Views.Backend.extend({
        viewName: 'dashboard-panel-links-list',
        initialize: function (options) {
            let self = this;

            try {
                _.bindAll(this, 'addOne', 'addAll', 'render');
            } catch (e) {
                console.error(options, e)
            }
            self._initialize(options);
            self.itemsView = [];
            self.listenTo(self.collection, "reset", self.addAll);
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
    App.Views.oldGridManagerContainerToolbar = App.Views.Backend.extend({
        template: template('gridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(this, 'render', 'initializeFileUploadObj', 'addGridRow', 'deleteCheckedRows', 'clearStoredColumnState', 'toggleDeleteBtn');
            this.options = options;
            this.localStorageKey = this.options.localStorageKey;
            this.parentView = this.options.parentView;
            self.modelNameLabel = this.parentView.modelNameLabel;
            self.modelNameLabelLowerCase = this.parentView.modelNameLabelLowerCase;
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
        close: function () {
            try {
                this.$el.find('input[type="file"]').fileupload('destroy');
            } catch (e) {
            }
            this.remove();
        },
        render: function () {
            let self = this;
            this.$el.html(this.template({modelName: self.modelNameLabel}));
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

            _log('App.Views.GridManagerContainerToolbar.toggleDeleteBtn.event', self.modelNameLabel, e.toggle, e);
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
            // console.log('$backgridTable', $backgridTable, backgridTableHeight)
            // console.log('$tCloneWrapper', $tCloneWrapper)
        }

    });
})(window.App);

(function (App) {
    App.Views.SiteSetting = App.Views.Backend.extend({
        tagName: 'li',
        template: template('siteSettingTemplate'),
        viewName: 'site-setting-view',
        initialize: function (options) {
            let self = this;
            _.bindAll(this, '_initialize','render');
            this._initialize(options);

        },
        events: {
            'click button': 'update',
            'change .form-control': 'enableSave',
            'change [name="value"]': 'enableSave'
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
            _log('App.Views.SiteSetting.update', self.options.tab, e.changed, attributes, self.model);
            self.model.url = self.getModelUrl(currentModelID);
            window.ajaxWaiting('show', 'form[name="SiteSetting' + currentModelID + '"]');
            self.model.save(attributes,
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

    App.Views.SiteSettingsManagement = App.Views.Backend.extend({
        attributes: {
            class: 'site-settings-management-view route-view box box-primary'
        },
        template: template('siteSettingsManagementTemplate'),
        viewName: 'site-settings-management-view',
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'addOne', 'addAll', 'render');
            } catch (e) {
                console.error(options, e);
            }

            this._initialize(options);
            self.itemsView = [];
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase().replace(' ', '_');

            self.listenTo(self.collection, "reset", self.addAll);
        },
        events: {},
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(self.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            self.addAll();
            return self;
        },
        addOne: function (SiteSetting) {
            let self = this;
            let $settingItem = new App.Views.SiteSetting({
                model: SiteSetting,
                            });
            self.itemsView.push($settingItem);
            self.$el.find('ul').append($settingItem.render().el);
        },
        addAll: function () {
            let self = this;
            self.$el.find('.site-settings-management-wrapper').empty();
            self.$el.find('.site-settings-management-wrapper').append($('<ul class="nav nav-stacked"></ul>'));
            self.collection.each(self.addOne);
        }
    });
})(window.App);

(function (App) {
    // This is the sites drop down
    App.Views.SiteOption = App.Views.Backend.extend({
        viewName: 'sites-dropdown-option',
        tagName: 'option',
        initialize: function (options) {
            let self = this;
            _.bindAll(self, 'render');
            self._initialize(options);
        },
        render: function () {
            let self = this;
            self.$el.attr('value',
                self.model.get(self.model.idAttribute)).html(self.model.get('SiteName'));
            return self;
        }
    });
    App.Views.SitesDropdown = App.Views.Backend.extend({
        viewName: 'sites-dropdown',
        initialize: function (options) {
            let self = this;

            _.bindAll(self, 'addOne', 'addAll', 'render', 'changeSelected', 'setSelectedId');
            self._initialize(options);
            self.listenTo(self.collection, "reset", self.addAll);

            self.parentView = self.options.parentView;

        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (site) {
            let self = this;
            self.$el.append(
                new App.Views.SiteOption({
                    model: site,
                                    }).render().el);
        },
        addAll: function () {
            let self = this;
            _log('App.Views.SitesDropdown.addAll', 'sites dropdown');
            self.$el.empty();
            self.collection.each(self.addOne);
            // Force related views to updatesite-volunteers-grid-manager-toolbar
            //console.log({'this.options.selectedSiteID': this.options.selectedSiteID})
            if (!_.isUndefined(self.options.selectedSiteID) && !_.isNull(self.options.selectedSiteID)) {
                self.$el.val(self.options.selectedSiteID);
                self.options.selectedSiteID = null;
            }

            self.changeSelected();
        },
        render: function () {
            let self = this;
            self.addAll();

            return self;
        },
        changeSelected: function () {
            let self = this;
            self.setSelectedId(self.$el.val());
        },
        setSelectedId: function (SiteID) {
            let self = this;

            // fetch new site model
            self.model.url = self.getModelUrl(SiteID);

            $.when(
                self.model.fetch({reset: true})
            ).then(function () {
                _log('App.Views.SitesDropdown.setSelectedId.event', 'new site selected', SiteID, 'parentView', self.parentView);
                self.trigger('site-id-change', {SiteID: SiteID});
            });
        }
    });
    App.Views.SiteYearsOption = App.Views.Backend.extend({
        viewName: 'site-years-dropdown-option',
        tagName: 'option',
        initialize: function (options) {
            let self = this;
            _.bindAll(self, 'render');
            self._initialize(options);
        },
        render: function () {
            let self = this;
            self.$el.attr('value', self.model.get('Year'))
                .attr('data-siteid', self.model.get('SiteID'))
                .attr('data-sitestatusid', self.model.get('SiteStatusID'))
                .html(self.model.get('Year'));
            return self;
        }
    });
    App.Views.SiteYearsDropdown = App.Views.Backend.extend({
        viewName: 'site-years-dropdown',
        initialize: function (options) {
            let self = this;

            _.bindAll(self, 'render', 'addOne', 'addAll', 'changeSelected', 'setSelectedId');
            self._initialize(options);
            self.optionsView = [];
            self.parentView = self.options.parentView;
            self.sitesDropdownView = self.options.sitesDropdownView;
            self.listenTo(self.sitesDropdownView, "site-id-change", self.updateCollectionBySite);
            self.listenTo(self.collection, "reset", self.addAll);

        },
        events: {
            "change": "changeSelected"
        },
        updateCollectionBySite: function(e) {
            let self = this;
            let SiteID = e[self.sitesDropdownView.model.idAttribute];
            self.collection.url = self.getCollectionUrl(SiteID);
            self.collection.fetch({reset: true});
        },
        addOne: function (site) {
            let self = this;
            let option = new App.Views.SiteYearsOption({
                model: site,
                            });
            this.optionsView.push(option);
            self.$el.append(option.render().el);
        },
        addAll: function () {
            let self = this;
            _.each(self.optionsView, function (option) {
                option.remove();
            });
            self.collection.each(self.addOne);
            //console.log({'this.options.selectedSiteStatusID': self.options.selectedSiteStatusID})
            if (!_.isUndefined(self.options.selectedSiteStatusID) && !_.isNull(self.options.selectedSiteStatusID)) {
                let $option = self.$el.find('[data-sitestatusid="' + self.options.selectedSiteStatusID + '"]');
                //console.log({selectedSiteStatusID: self.options.selectedSiteStatusID, 'el': self.$el, option: $option})
                if ($option.length) {
                    $option[0].selected = true;
                    self.options.selectedSiteStatusID = null;
                }
            }
            self.$el.trigger('change');
        },
        render: function () {
            let self = this;
            self.addAll();
            return self;
        },
        changeSelected: function () {
            let self = this;
            let $option = self.$el.find(':selected');

            self.setSelectedId($option.data('siteid'), $option.data('sitestatusid'), $option.val());
        },
        setSelectedId: function (SiteID, SiteStatusID, Year) {
            let self = this;

            self.model.url = self.getModelUrl(SiteStatusID);

            $.when(
                self.model.fetch({reset: true})
            ).then(function () {
                _log('App.Views.SiteYearsDropdown.setSelectedId.event', 'new year selected', SiteID, SiteStatusID, Year, 'parentView', self.parentView);
                self.trigger('site-status-id-change', {SiteID: SiteID, SiteStatusID: SiteStatusID, Year: Year});
            });
        },

    });
})(window.App);

(function (App) {
    App.Views.AnnualBudgetView = App.Views.Backend.extend({
        template: template('annualBudgetTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(this, 'render', 'update');
            this.options = options;
            self.model.on('change', this.render, this);
            _log(this.viewName + '.initialize', options, this);
        },
        events: {
            'click .btnUpdate': 'update'
        },
        render: function () {
            let self = this;
            this.$el.html(this.template({
                annualBudgetID: self.model.get('AnnualBudgetID'),
                budgetAmount: self.model.get('BudgetAmount'),
                year: self.model.get('Year')
            }));
            return this;
        },
        update: function (e) {
            var self = this;
            e.preventDefault();
            let attrName = 'BudgetAmount';
            let attrValue = this.$el.find('[name="BudgetAmount"]').val();
            self.model.url = self.getModelUrl(self.model.get(self.model.idAttribute));
            self.model.save({[attrName]: attrValue},
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
    App.Views.AnnualBudgetsManagement = App.Views.Backend.extend({
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

(function (App) {
    App.Views.ProjectTabGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        template: template('tabGridManagerContainerToolbarsTemplate'),
        initialize: function (options) {
            let self = this;
            // Required call for inherited class
            self._initialize(options);

            if (_.isUndefined(self.options.bAppend)) {
                console.error("options.bAppend is a required option", self);
                throw "options.bAppend is a required option";
            }
            if (_.isUndefined(self.options.tabId)) {
                console.error("options.tabId is a required option", self);
                throw "options.tabId is a required option";
            }
            self.tabId = self.options.tabId;
            self.parentChildViews = self.options.parentChildViews;
            self.parentView = self.options.parentView;
            self.managedGridView = self.options.managedGridView;
            self.tabs = self.parentView.$('.nav-tabs [role="tab"]');

            self.listenTo(self.parentView, 'cleared-child-views', self.remove);
        },
        close: function () {
            this.remove();
            // handle other unbinding needs, here
            _.each(this.childViews, function (childView) {
                if (childView.close) {
                    try {
                        childView.close();
                    } catch (e) {
                    }
                } else if (childView.remove) {
                    try {
                        childView.remove();
                    } catch (e) {
                    }
                }
            })
        },
        render: function () {
            let self = this;

            self.tabs.each(function (idx, el) {
                let tabName = $(el).attr('aria-controls');
                let tabButtonLabel = $(el).text();
                if (self.tabId === tabName) {
                    //console.log({idx: idx, tabName: tabName, tabButtonLabel: tabButtonLabel,'tabButtonPane': self.$('.tabButtonPane.' + tabName)})
                    // override template vars
                    self.templateVars = {
                        TabName: tabName,
                        btnLabel:
                        tabButtonLabel
                    };
                }
            });

            self._render();
            //console.log('ProjectTabGridManagerContainerToolbar render', {'self': self, '$el': self.$el, 'self.tabs': self.tabs, bCanAddProjectTabModel: App.Vars.Auth.bCanAddProjectTabModel, bCanDeleteProjectTabModel: App.Vars.Auth.bCanDeleteProjectTabModel, 'tabAdd': self.getAddBtn(), 'tabDeleteChecked': self.getDeleteCheckedBtn()})

            if (!App.Vars.Auth.bCanAddProjectTabModel) {
                self.getAddBtn().hide();
            }
            if (!App.Vars.Auth.bCanDeleteProjectTabModel) {
                self.getDeleteCheckedBtn().hide();
            }
            return self;
        },
        getTabView: function (tabName) {
            let self = this;
            return _.find(self.parentChildViews, function (val) {
                return _.has(val, tabName)
            });
        },
        addGridRow: function (e) {
            let self = this;
            let tabName = $(e.target).parents('.tabButtonPane').data('tab-name');
            let tabView = self.getTabView(self.tabId);

            _log('App.Views.ProjectTabGridManagerContainerToolbar.addGridRow', e, self.tabId, tabView);

            self.getModalElement().one('show.bs.modal', function (event) {
                let $fileInput = null;
                let button = $(event.relatedTarget); // Button that triggered the modal
                let recipient = button.data('whatever'); // Extract info from data-* attributes
                // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
                // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
                let modal = $(this);
                modal.find('.modal-title').html(self.parentView.$('h3.box-title').html());
                modal.find('.modal-body').html(tabView[self.tabId].getModalForm());
                if (tabName === 'project_attachment') {
                    let selfView = modal.find('form[name="newProjectAttachment"]');
                    let sAjaxFileUploadURL = '/admin/project_attachment/upload';
                    $fileInput = $(selfView.find('input[type="file"]'));
                    $fileInput.fileupload({
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
                    if (self.tabId === 'project_volunteer') {
                        let formData = $.unserialize(modal.find('form').serialize());
                        let selectedModels = tabView[self.tabId].modalBackgrid.getSelectedModels();
                        tabView[self.tabId].modalBackgrid.clearSelectedModels();
                        let volunteerIDs = _.map(selectedModels, function (model) {
                            return model.get('VolunteerID');
                        });
                        // Can't be VolunteerID or backbone will flag as an update instead of create
                        formData.VolunteerIDs = volunteerIDs;
                        tabView[self.tabId].create(formData);
                    } else {
                        tabView[self.tabId].create($.unserialize(modal.find('form').serialize()));
                    }
                    if (self.tabId === 'project_attachment') {
                        try {
                            $fileInput.fileupload('destroy');
                        } catch (e) {
                        }
                    }
                    self.getModalElement().modal('hide');
                });

            });
            self.getModalElement().modal('show');

        },
        // toggleDeleteBtn: function (e) {
        //     let toggle = e.toggle;
        //     let tab = e.tab;
        //     _log('App.Views.ProjectTabGridManagerContainerToolbar.toggleDeleteBtn.event', e.toggle, e.tab, e);
        //     if (toggle === 'disable') {
        //         this.$el.find('.' + tab + '.tabButtonPane .btnTabDeleteChecked').addClass('disabled');
        //     } else {
        //         this.$el.find('.' + tab + '.tabButtonPane .btnTabDeleteChecked').removeClass('disabled');
        //     }
        //
        // },
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
})(window.App);

(function (App) {
    App.Views.ProjectTab = App.Views.ManagedGrid.extend({
        initialize: function (options) {
            let self = this;

            try {
                _.bindAll(self, 'update', 'refreshView', 'getModalForm', 'create', 'destroy', 'toggleDeleteBtn', 'showColumnHeaderLabel', 'showTruncatedCellContentPopup', 'hideTruncatedCellContentPopup');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            self._initialize(options);
            self.managedGridView = self.options.parentView.managedGridView;
            self.sitesDropdownView = self.options.parentView.sitesDropdownView;
            self.siteYearsDropdownView = self.options.parentView.siteYearsDropdownView;

            _log('App.Views.ProjectTab.initialize', options);
        },
        events: {

        },
        render: function (e) {
            let self = this;
            let currentModelId = self.getViewDataStore('current-model-id');
            if (!_.isNumber(currentModelId)) {
                self.setViewDataStoreValue('current-model-id', self.collection.length ? self.collection.at(0).get(self.model.idAttribute) : null);
            }
            self.renderGrid(e, 'site-project-tab-' + self.options.tab);

            return self;
        },

        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        refreshView: function (e) {
            let self = this;

            //console.trace(e)
            self._refreshView(e);
        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                let attributes = _.extend({[self.model.idAttribute]: currentModelID}, e.changed);
                if (attributes[self.managedGridView.model.idAttribute] === '') {
                    attributes[self.managedGridView.model.idAttribute] = self.managedGridView.getViewDataStore('current-model-id');
                }
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                //console.log('App.Views.ProjectTab.update', self.options.tab, {eChanged: e.changed, saveAttributes: attributes, tModel: self.model});
                self.model.url = self.getModelUrl(currentModelID);
                self.model.save(attributes,
                    {
                        success: function (model, response, options) {
                            _log('App.Views.ProjectTab.update', self.options.tab + ' save', model, response, options);
                            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                            growl(response.msg, response.success ? 'success' : 'error');
                        },
                        error: function (model, response, options) {
                            console.error('App.Views.ProjectTab.update', self.options.tab + ' save', model, response, options);
                            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                            growl(response.msg, 'error')
                        }
                    });
            }
        },
        create: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            attributes = _.extend(attributes, {
                ProjectID: self.managedGridView.model.get(self.managedGridView.model.idAttribute)
            });
            let model = self.model.clone().clear({silent: true});
            //console.log('App.Views.ProjectTab.create', self.options.tab, {attributes: attributes, model: model, thisModel: self.model});
            model.url = self.getModelRoute();
            //console.log('create',{viewName:self.viewName,attributes:attributes})
            $.when(
                model.save(attributes,
                    {
                        success: function (model, response, options) {
                            window.growl(response.msg, response.success ? 'success' : 'error');
                            self.collection.url = self.getCollectionUrl(self.managedGridView.model.get(self.managedGridView.model.idAttribute));
                            $.when(
                                self.collection.fetch({reset: true})
                            ).then(function () {
                                _log('App.Views.ProjectTab.create.event', self.options.tab + ' collection fetch promise done');
                            });
                        },
                        error: function (model, response, options) {
                            window.growl(response.msg, 'error');
                        }
                    })
            ).then(function () {
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });

        },

        destroy: function (attributes) {
            let self = this;
            let deleteCnt = attributes.deleteModelIDs.length;
            let confirmMsg = "Do you really want to delete the checked " + self.options.tab + "s?";
            if (deleteCnt === self.collection.fullCollection.length) {
                confirmMsg = "You are about to delete every checked " + self.options.tab + ". Do you really want to" +
                             " continue with deleting them all?";
            }

            bootbox.confirm(confirmMsg, function (bConfirmed) {
                if (bConfirmed) {
                    window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);

                    attributes = _.extend(attributes, {
                        ProjectID: self.managedGridView.model.get(self.managedGridView.model.idAttribute),
                        ProjectRoleID: self.model.get('ProjectRoleID')
                    });
                    // console.log('App.Views.ProjectTab.destroy', self.options.tab, attributes, 'deleteCnt:' + deleteCnt, 'self.collection.fullCollection.length:' +
                    //                                                                                                    self.collection.fullCollection.length, self.model);
                    $.when(
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            url: self.getModelRoute() + '/batch/destroy',
                            data: attributes,
                            success: function (response) {
                                window.growl(response.msg, response.success ? 'success' : 'error');
                                self.collection.url = self.getCollectionUrl(self.managedGridView.model.get(self.managedGridView.model.idAttribute));
                                $.when(
                                    self.collection.fetch({reset: true})
                                ).then(function () {
                                    _log('App.Views.ProjectTab.destroy.event', self.options.tab + ' collection fetch promise done');
                                });
                            },
                            fail: function (response) {
                                window.growl(response.msg, 'error');
                            }
                        })
                    ).then(function () {
                        window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                    });

                }
            });

        },

    });
})(window.App);

(function (App) {
    App.Views.ProjectAttachment = App.Views.ProjectTab.extend({
        getModalForm: function () {
            let self = this;
            let template = window.template('newProjectAttachmentTemplate');

            let tplVars = {
                ProjectID: self.managedGridView.getViewDataStore('current-model-id')
            };

            return template(tplVars);
        }
    });
})(window.App);

(function (App) {
    App.Views.ProjectLead = App.Views.ProjectTab.extend({
        getModalForm: function () {
            let self = this;
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
                ProjectID: self.managedGridView.getViewDataStore('current-model-id'),
                volunteerSelect: volunteerSelect.getHtml(),
                projectRoleOptions: App.Models.volunteerModel.getRoleOptions(true),
                statusOptions: App.Models.volunteerModel.getStatusOptions(true)
            };
            return template(tplVars);
        }
    });
})(window.App);

(function (App) {
    App.Views.ProjectVolunteer = App.Views.ProjectTab.extend({
        getModalForm: function () {
            let self = this;
            let template = window.template('addProjectVolunteerTemplate');
            let form = template({ProjectID: self.managedGridView.getViewDataStore('current-model-id')});
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
                def.editable = false;
                if (def.name.match(/(ID|_at)$/) || def.label.match(/^Grove/)) {
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
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            let model = self.model.clone().clear({silent: true});
            model.url = self.getModelUrl('batch/store');
            _log('App.Views.ProjectVolunteer.create', attributes, model);
            $.when(
                model.save(attributes,
                    {
                        success: function (model, response, options) {
                            window.growl(response.msg, response.success ? 'success' : 'error');
                            self.collection.url = self.getCollectionUrl(self.managedGridView.model.get(self.managedGridView.model.idAttribute));
                            $.when(
                                self.collection.fetch({reset: true})
                            ).then(function () {
                                _log('App.Views.ProjectVolunteer.create.event', 'project_volunteers collection fetch promise done');
                            });
                        },
                        error: function (model, response, options) {
                            window.growl(response.msg, 'error');
                        }
                    })
            ).then(function () {
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        }
    });
})(window.App);

(function (App) {
    App.Views.Budget = App.Views.ProjectTab.extend({
        getModalForm: function () {
            let self = this;
            let template = window.template('newBudgetTemplate');

            let tplVars = {
                ProjectID: self.managedGridView.getViewDataStore('current-model-id'),
                budgetSourceOptions: App.Models.projectBudgetModel.getSourceOptions(true),
                statusOptions: App.Models.projectBudgetModel.getStatusOptions(true)
            };
            return template(tplVars);
        }
    });
})(window.App);

(function (App) {
    App.Views.ProjectContact = App.Views.ProjectTab.extend({
        getModalForm: function () {
            let self = this;
            let template = window.template('newProjectContactTemplate');

            let siteContacts = App.Collections.contactsManagementCollection.where({SiteID: self.sitesDropdownView.model.get(App.Models.siteModel.idAttribute)});
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
                SiteID: self.sitesDropdownView.model.get(App.Models.siteModel.idAttribute),
                ProjectID: self.managedGridView.getViewDataStore('current-model-id'),
                contactsSelect: contactsSelect.getHtml()
            };
            return template(tplVars);
        }
    });
})(window.App);

(function (App) {
    App.Views.SiteProjectTabs = App.Views.ManagedGridTabs.extend({
        projectContactsViewClass: App.Views.ProjectContact,
        projectVolunteersViewClass: App.Views.ProjectVolunteer,
        projectLeadsViewClass: App.Views.ProjectLead,
        projectBudgetViewClass: App.Views.Budget,
        projectAttachmentsViewClass: App.Views.ProjectAttachment,
        initialize: function (options) {
            let self = this;

            // Required call for inherited class
            self._initialize(options);
            self.sitesDropdownView = self.options.parentView.sitesDropdownView;
            self.siteYearsDropdownView = self.options.parentView.siteYearsDropdownView;
        },


        render: function () {
            let self = this;

            self.projectLeadsView = new self.projectLeadsViewClass({
                el: self.$('.project-leads-backgrid-wrapper'),
                viewName: 'project-leads',
                tab: 'project_lead',
                collection: App.PageableCollections.projectLeadsCollection,
                model: App.Vars.currentTabModels['project_lead'],
                columnCollectionDefinitions: App.Vars.volunteerLeadsBackgridColumnDefinitions,
                hideCellCnt: 0,//8,
                currentModelIDDataStoreSelector: '#project_lead',
                parentView: this,
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                gridManagerContainerToolbarClassName: 'project-tabs-grid-manager-container',
                modelNameLabel: 'Project Leads',
                            });
            self.childTabViews.push({project_lead: self.projectLeadsView});

            self.projectBudgetView = new self.projectBudgetViewClass({
                el: self.$('.project-budgets-backgrid-wrapper'),
                viewName: 'project-budgets',
                tab: 'project_budget',
                collection: App.PageableCollections.projectBudgetsCollection,
                model: App.Vars.currentTabModels['project_budget'],
                columnCollectionDefinitions: App.Vars.BudgetsBackgridColumnDefinitions,
                hideCellCnt: 0,
                currentModelIDDataStoreSelector: '#project_budget',
                parentView: self,
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                gridManagerContainerToolbarClassName: 'project-tabs-grid-manager-container',
                modelNameLabel: 'Project Budget',
                            });
            self.childTabViews.push({project_budget: self.projectBudgetView});

            self.projectContactsView = new self.projectContactsViewClass({
                el: self.$('.project-contacts-backgrid-wrapper'),
                viewName: 'project-contacts',
                tab: 'project_contact',
                collection: App.PageableCollections.projectContactsCollection,
                model: App.Vars.currentTabModels['project_contact'],
                columnCollectionDefinitions: App.Vars.projectContactsBackgridColumnDefinitions,
                hideCellCnt: 0,
                currentModelIDDataStoreSelector: '#project_contact',
                parentView: self,
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                gridManagerContainerToolbarClassName: 'project-tabs-grid-manager-container',
                modelNameLabel: 'Project Contact',
                            });
            self.childTabViews.push({project_contact: self.projectContactsView});

            self.projectVolunteersView = new self.projectVolunteersViewClass({
                el: self.$('.project-volunteers-backgrid-wrapper'),
                viewName: 'project-volunteers',
                tab: 'project_volunteer',
                collection: App.PageableCollections.projectVolunteersCollection,
                model: App.Vars.currentTabModels['project_volunteer'],
                columnCollectionDefinitions: App.Vars.projectVolunteersBackgridColumnDefinitions,
                hideCellCnt: 0,
                currentModelIDDataStoreSelector: '#project_volunteer',
                parentView: self,
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                gridManagerContainerToolbarClassName: 'project-tabs-grid-manager-container',
                modelNameLabel: 'Project Volunteer',
                            });
            self.childTabViews.push({project_volunteer: self.projectVolunteersView});

            self.projectAttachmentsView = new self.projectAttachmentsViewClass({
                el: self.$('.project-attachments-backgrid-wrapper'),
                tab: 'project_attachment',
                viewName: 'project-attachments',
                collection: App.PageableCollections.projectAttachmentsCollection,
                model: App.Vars.currentTabModels['project_attachment'],
                columnCollectionDefinitions: App.Vars.ProjectAttachmentsBackgridColumnDefinitions,
                hideCellCnt: 0,
                currentModelIDDataStoreSelector: '#project_attachment',
                parentView: self,
                ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                gridManagerContainerToolbarClassName: 'project-tabs-grid-manager-container',
                modelNameLabel: 'Project Attachment',
                            });
            self.childTabViews.push({project_attachment: self.projectAttachmentsView});

            _.each(App.Vars.currentTabModels, function (model, key) {
                let managedGridView = null;
                _.each(self.childTabViews, function (value) {
                    if (!_.isUndefined(value[key])) {
                        managedGridView = value[key];
                    }
                });

                /**
                 * Handles the buttons below the tabbed grids
                 */
                let view = new App.Views.ProjectTabGridManagerContainerToolbar({
                    parentView: self,
                    el: self.parentView.$('.' + key + '.tab-grid-manager-container'),
                    bAppend: true,
                    parentChildViews: self.childTabViews,

                    managedGridView: managedGridView,
                    viewName: 'tab-' + key + '-grid-manager-toolbar',
                    tabId: key
                });
                self.childTabsGridManagerContainerToolbarViews.push({[key]: view});
            });

            self.childViews = _.values(self.childTabViews);
            self.childViews.concat(_.values(self.childTabsGridManagerContainerToolbarViews));
            //self.childViews.push(self.projectTabsGridManagerContainerToolbarView);
            //self.projectTabsGridManagerContainerToolbarView.render();
            _.each(self.childTabsGridManagerContainerToolbarViews, function (view) {
                let childTabGridManager = _.values(view)[0];
                childTabGridManager.render();
                childTabGridManager.managedGridView.setGridManagerContainerToolbar(childTabGridManager);
            });
            self.projectLeadsView.render();
            self.projectBudgetView.render();
            self.projectContactsView.render();
            self.projectVolunteersView.render();
            self.projectAttachmentsView.render();
            let titleDescription = self.managedGridView.collection.length === 0 ? 'No projects created yet.' : self.model.get('ProjectDescription');
            App.Views.mainApp.$('h3.box-title small').html(titleDescription);
            _log('App.Views.SiteProjectTabs.render', 'set tabs project title to:' + titleDescription, 'setting data-project-id to ' + self.model.get(self.model.idAttribute) + ' on', self.$el);
            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            self.toggleTabsBox();

            return this;
        },

        /**
         * Rebuild the Project Tabs if the project has changed
         * @returns {App.Views.SiteProjectTabs}
         */
        fetchIfNewID: function (e) {
            var self = this;
            if (self.model.hasChanged(self.model.idAttribute)) {
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                let newId = self.model.get(self.model.idAttribute);
                if (!_.isUndefined(newId)) {
                    _log(self.viewName + '.fetchIfNewID.event', 'model primary key value has changed. Fetching new data for tab collections.', newId);

                    self.projectLeadsView.collection.url = self.projectLeadsView.getCollectionUrl(newId);
                    self.projectBudgetView.collection.url = self.projectBudgetView.getCollectionUrl(newId);
                    self.projectContactsView.collection.url = self.projectContactsView.getCollectionUrl(newId);
                    self.projectVolunteersView.collection.url = self.projectVolunteersView.getCollectionUrl(newId);
                    self.projectAttachmentsView.collection.url = self.projectAttachmentsView.getCollectionUrl(newId);

                    self.updateMainAppBoxTitleContentPreFetchTabCollections();
                    $.when(
                        self.projectLeadsView.collection.fetch({reset: true, silent: false}),
                        self.projectBudgetView.collection.fetch({reset: true, silent: false}),
                        self.projectContactsView.collection.fetch({reset: true, silent: false}),
                        self.projectVolunteersView.collection.fetch({reset: true, silent: false}),
                        self.projectAttachmentsView.collection.fetch({reset: true, silent: false})
                    ).then(function () {
                        _log(self.viewName + '.fetchIfNewID.event', 'tab collections fetch promise done');
                        self.updateMainAppBoxTitleContentPostFetchTabCollections();
                        window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                    });
                }

            } else {
                _log(self.viewName + '.fetchIfNewID.event', 'fetchIfNewID has not changed', self.model.get(self.model.idAttribute));
            }
            return this;
        },
        updateMainAppBoxTitleContentPreFetchTabCollections: function(){
            let self = this;
            App.Views.mainApp.$('h3.box-title small').html('Updating Tabs. Please wait...');
        },
        updateMainAppBoxTitleContentPostFetchTabCollections: function () {
            let self = this;
            let description = self.model.get('ProjectDescription') !== '' ? self.model.get('ProjectDescription') : self.model.get('OriginalRequest');
            App.Views.mainApp.$('h3.box-title small').html(description);

        }
    });
})(window.App);

(function (App) {
    App.Views.ProjectGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        viewName: 'project-grid-manager-container-toolbar-view',
        initialize: function (options) {
            let self = this;
            // Required call for inherited class
            self._initialize(options);
            _log('App.Views.ProjectGridManagerContainerToolbar.initialize', options);
        },
        events: {},
        render: function () {
            let self = this;
            self._render();
            if (!App.Vars.Auth.bCanAddProject) {
                this.$el.find('.btnAdd').hide();
            }
            if (!App.Vars.Auth.bCanDeleteProject) {
                this.$el.find('.btnDeleteChecked').hide();
            }
            return this;
        },
        editGridRow: function (e) {
            let self = this;
            e.preventDefault();
            let load = self.getViewDataStore('current-site-id','project_management')+'_'+ self.getViewDataStore('current-model-id','projects');
            window.location.href = '#/view/project_scope/management/' + load
        },
        addGridRow: function (e) {
            let self = this;
            e.preventDefault();
            let load = self.getViewDataStore('current-site-id', 'project_management') + '_new';
            window.location.href = '#/view/project_scope/management/' + load
        }
    });
})(window.App);

(function (App) {
    App.Views.Projects = App.Views.ManagedGrid.extend({
        viewName: 'projects-view',
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self,
                    'renderGrid',
                    'removeChildViews',
                    'getViewClassName',
                    'setModelRoute',
                    'getModelRoute',
                    'refreshView',
                    'getModalForm',
                    'toggleDeleteBtn',
                    'showColumnHeaderLabel',
                    'showTruncatedCellContentPopup',
                    'hideTruncatedCellContentPopup',
                    'handleSiteStatusIDChange');
            } catch (e) {
                console.error(options, e)
            }

            // Required call for inherited class
            self._initialize(options);
            self.sitesDropdownView = self.options.parentView.sitesDropdownView;
            self.siteYearsDropdownView = self.options.parentView.siteYearsDropdownView;
            //console.log('collection',self.collection.length, self.collection.models.length, self.collection.fullCollection.length)
            if (self.collection.length === 0) {
                self.setViewDataStoreValue('current-model-id', null);
            }
            self.listenTo(self.options.parentView.siteYearsDropdownView, 'site-status-id-change', self._handleSiteStatusIDChange);
            _log('App.Views.Projects.initialize', options);
        },
        render: function (e) {
            let self = this;

            self.renderGrid(e, self.viewName);

            return self;

        },
        getCollectionQueryString: function () {
            let self = this;

            return self.siteYearsDropdownView.model.get(self.siteYearsDropdownView.model.idAttribute);
        },
        _handleSiteStatusIDChange: function (e) {
            let self = this;

            // sets current site and site status ids in localstorage
            self.handleSiteStatusIDChange(e);
            let SiteStatusID = e[self.siteYearsDropdownView.model.idAttribute];
            self.parentView.siteProjectTabsView.clearCurrentIds();
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);

            // fetch new product collection
            self.collection.url = self.getCollectionUrl(SiteStatusID);
            //console.log('_handleSiteStatusIDChange',{'self.collection.url': self.collection.url, SiteStatusID: SiteStatusID})
            $.when(
                self.collection.fetch({
                    reset: true,
                    success: function (model, response, options) {
                        //console.log('_handleSiteStatusIDChange project collection fetch success', {model: model, response: response, response_0: response[0], options: options})
                        if (!_.isUndefined(response[0])) {
                            self.model.set(response[0]);
                            self.refocusGridRecord();
                        } else {
                            self.setViewDataStoreValue('current-model-id', null);
                            // Should trigger the tabs to update
                            self.model.clear();
                        }
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'error');
                    }
                })
            ).then(function () {
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                // This collapses or opens box
                self.trigger('toggle-tabs-box');
            });
        },
        /**
         * ProjectIDParam can also be an event
         * @param e
         */
        refreshView: function (e) {
            let self = this;

            self._refreshView(e);
        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let bFetchCollection = false;
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                if (_.findKey(e.changed, 'SequenceNumber') !== 'undefined') {
                    // Fetch reordered list
                    bFetchCollection = true;
                }
                _log('App.Views.Projects.update.event', e, 'updating project model id:' + e.attributes.ProjectID);
                if (e.attributes.ProjectID !== self.model.get(self.model.idAttribute)) {
                    growl('I just caught the disappearing project bug scenario and have cancelled the update so it does not disappear.', 'error');
                }
                self.model.url = self.getModelUrl(e.attributes[self.model.idAttribute]);
                let data = _.extend({[self.model.idAttribute]: e.attributes[self.model.idAttribute]}, e.changed);
                //console.log('projectView update', {currentProjectID: App.Vars.currentProjectID,e_changed: e.changed, e_attributes: e.attributes, projectData: projectData, projectModel: App.Models.projectModel, url: App.Models.projectModel.url});
                $.when(
                    self.model.save(data,
                        {
                            success: function (model, response, options) {
                                if (bFetchCollection) {
                                    response.msg = response.msg + ' The re-sequenced list is being refreshed.'
                                }
                                growl(response.msg, response.success ? 'success' : 'error');
                                if (bFetchCollection) {
                                    self.collection.url = self.getCollectionUrl();
                                    $.when(
                                        self.collection.fetch({reset: true})
                                    ).then(function () {
                                        //initialize your views here
                                        self.refocusGridRecord();
                                        _log('App.Views.Project.update.event', 'SequenceNumber updated. project collection fetch promise done');
                                    });
                                }
                            },
                            error: function (model, response, options) {
                                console.error(self.viewName + '.update', self.modelNameLabelLowerCase + ' save', model, response, options);
                                growl(response.msg, 'error');
                            }
                        })
                ).then(function () {
                    window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                });
            }
        },
        saveEditForm: function (data) {
            let self = this;
            let bSave = true;
            if (bSave) {
                let bFetchCollection = true;
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                self.model.url = self.getModelUrl(self.model.get(self.model.idAttribute));
                let projectData = _.extend({ProjectID: self.model.get(self.model.idAttribute)}, data);
                //console.log('projectView saveEditForm',{data:data, projectData:projectData,projectModel: App.Models.projectModel, url: App.Models.projectModel.url});
                self.model.save(projectData,
                    {
                        success: function (model, response, options) {
                            if (bFetchCollection) {
                                response.msg = response.msg + ' The list is being refreshed.'
                            }
                            growl(response.msg, response.success ? 'success' : 'error');
                            if (bFetchCollection) {

                                self.collection.url = self.getCollectionUrl();
                                $.when(
                                    self.collection.fetch({reset: true})
                                ).then(function () {
                                    //initialize your views here
                                    self.refocusGridRecord();
                                    _log('App.Views.Project.update.event', 'project updated. project collection fetch promise done');
                                    window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                                });
                            }
                        },
                        error: function (model, response, options) {
                            growl(response.msg, 'error');
                            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                        }
                    });
            }
        },
        getModalForm: function () {
            let self = this;
            let template = window.template('newProjectScopeTemplate');
            let contactSelect = new App.Views.Select({
                el: '',
                attributes: {id: 'ContactID', name: 'selectContactID', class: 'form-control'},
                buildHTML: true,
                collection: App.Collections.contactsManagementCollection,
                optionValueModelAttrName: 'ContactID',
                optionLabelModelAttrName: ['LastName', 'FirstName', 'Title']
            });

            let sequenceNumber = self.collection.fullCollection.models.length > 0 ? _.max(self.collection.fullCollection.models, function (project) {
                return parseInt(project.get("SequenceNumber"));
            }).get('SequenceNumber') : 1;

            let tplVars = {
                projectAttributes: App.Collections.projectAttributesManagementCollection.where({workflow_id: 1}),
                attributesOptions: App.Collections.attributesManagementCollection.getTableOptions('projects', false),
                workflowOptions: App.Collections.workflowManagementCollection.getOptions(false),
                projectTypeOptions: App.Models.projectModel.getSkillsNeededOptions(true, 'General'),
                SiteID: self.sitesDropdownView.model.get(self.sitesDropdownView.model.idAttribute),
                SiteStatusID: self.siteYearsDropdownView.model.get(self.siteYearsDropdownView.model.idAttribute),
                contactSelect: contactSelect.getHtml(),
                options: {
                    yesNoIsActiveOptions: self.model.getYesNoOptions(true, 'Yes'),
                    bool: self.model.getYesNoOptions(true),
                    permit_required_status_options: self.model.getPermitRequiredStatusOptions(true),
                    permit_required_options: self.model.getPermitRequiredOptions(true),
                    project_skill_needed_options: self.model.getSkillsNeededOptions(true),
                    project_status_options: self.model.getStatusOptions(true, 'Pending'),
                    send_status_options: self.model.getSendOptions(true),
                    when_will_project_be_completed_options: self.model.getWhenWillProjectBeCompletedOptions(true)
                },
                SequenceNumber: sequenceNumber + 1,
                OriginalRequest: '',
                ProjectDescription: '',
                Comments: '',
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
        getEditForm: function () {
            let self = this;
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
                SiteID: self.sitesDropdownView.model.get(self.sitesDropdownView.model.idAttribute),
                SiteStatusID: self.siteYearsDropdownView.model.get(self.siteYearsDropdownView.model.idAttribute),
                yesNoIsActiveOptions: self.model.getYesNoOptions(true, 'Yes'),
                yesNoOptions: self.model.getYesNoOptions(true),
                contactSelect: contactSelect.getHtml(),
                primarySkillNeededOptions: self.model.getSkillsNeededOptions(true),
                statusOptions: self.model.getStatusOptions(true, 'Pending'),
                projectSendOptions: self.model.getSendOptions(true),
                SequenceNumber: self.model.get("SequenceNumber"),
                OriginalRequest: self.model.get("OriginalRequest"),
                ProjectDescription: self.model.get("ProjectDescription"),
                Comments: self.model.get("Comments"),
                VolunteersNeededEstimate: self.model.get("VolunteersNeededEstimate"),
                StatusReason: self.model.get("StatusReason"),
                MaterialsNeeded: self.model.get("MaterialsNeeded"),
                EstimatedCost: self.model.get("EstimatedCost"),
                ActualCost: self.model.get("ActualCost"),
                BudgetAvailableForPC: self.model.get("BudgetAvailableForPC"),
                SpecialEquipmentNeeded: self.model.get("SpecialEquipmentNeeded"),
                PermitsOrApprovalsNeeded: self.model.get("PermitsOrApprovalsNeeded"),
                PrepWorkRequiredBeforeSIA: self.model.get("PrepWorkRequiredBeforeSIA"),
                SetupDayInstructions: self.model.get("SetupDayInstructions"),
                SIADayInstructions: self.model.get("SIADayInstructions"),
                Area: self.model.get("Area"),
                PaintOrBarkEstimate: self.model.get("PaintOrBarkEstimate"),
                PaintAlreadyOnHand: self.model.get("PaintAlreadyOnHand"),
                PaintOrdered: self.model.get("PaintOrdered"),
                FinalCompletionAssessment: self.model.get("FinalCompletionAssessment"),
                bSetValues: true,
                data: {
                    Active: self.model.get("Active"),
                    ChildFriendly: self.model.get("ChildFriendly"),
                    PrimarySkillNeeded: self.model.get("PrimarySkillNeeded"),
                    Status: self.model.get("Status"),
                    NeedsToBeStartedEarly: self.model.get("NeedsToBeStartedEarly"),
                    CostEstimateDone: self.model.get("CostEstimateDone"),
                    MaterialListDone: self.model.get("MaterialListDone"),
                    BudgetAllocationDone: self.model.get("BudgetAllocationDone"),
                    VolunteerAllocationDone: self.model.get("VolunteerAllocationDone"),
                    NeedSIATShirtsForPC: self.model.get("NeedSIATShirtsForPC"),
                    ProjectSend: self.model.get("ProjectSend"),
                    FinalCompletionStatus: self.model.get("FinalCompletionStatus"),
                    PCSeeBeforeSIA: self.model.get("PCSeeBeforeSIA")
                }
            };
            return template(tplVars);
        },
        create: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            // Set the sequence to the end if it was left empty
            if (_.isEmpty(attributes['SequenceNumber'])) {
                attributes['SequenceNumber'] = self.collection.fullCollection.length;
            }
            // Need to add some default values to the attributes array for fields we do not show in the create form
            attributes['Attachments'] = '';
            _log('App.Views.Project.create', attributes, self.model, self.collection);
            let newModel = new App.Models.Project();
            newModel.url = self.getModelRoute();
            $.when(
                newModel.save(attributes,
                    {
                        success: function (model, response, options) {
                            window.growl(response.msg, response.success ? 'success' : 'error');
                            //App.Vars.currentProjectID = !_.isUndefined(response.ProjectID) ? response.ProjectID : null;
                            self.setViewDataStoreValue('current-model-id', !_.isUndefined(response[App.Models.Project.idAttribute]) ? response[App.Models.Project.idAttribute] : null);
                            self.collection.url = self.getCollectionUrl(self.getCollectionQueryString());
                            $.when(
                                self.collection.fetch({reset: true})
                            ).then(function () {
                                //initialize your views here
                                self.refocusGridRecord();
                                _log('App.Views.Project.create.event', 'project collection fetch promise done');
                                //self.$el.find('tbody tr:first-child').trigger('focusin');
                            });
                        },
                        error: function (model, response, options) {
                            window.growl(response.msg, 'error');
                        }
                    })
            ).then(function () {
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                self.trigger('toggle-tabs-box');
            });

        }


    });
})(window.App);

(function (App) {
    App.Views.ProjectManagement = App.Views.Management.extend({
        sitesDropdownViewClass: App.Views.SitesDropdown,
        siteYearsDropdownViewClass: App.Views.SiteYearsDropdown,
        siteProjectTabsViewClass: App.Views.SiteProjectTabs,
        projectsViewClass: App.Views.Projects,
        attributes: {
            class: 'route-view box box-primary project-management-view'
        },
        template: template('projectTabbedManagementTemplate'),
        viewName: 'projects-management-view',
        initialize: function (options) {
            let self = this;
            // try {
            //     _.bindAll(self, '');
            // } catch (e) {
            //     console.error(options, e);
            // }
            // Required call for inherited class
            self._initialize(options);

        },
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template());
            self.renderSiteDropdowns();

            self.projectsView = new self.projectsViewClass({
                ajaxWaitingTargetClassSelector: '.projects-view',
                collection: App.PageableCollections.projectCollection,
                columnCollectionDefinitions: App.Vars.projectsBackgridColumnDefinitions,
                currentModelIDDataStoreSelector: '.site-projects-tabs-view',
                el: self.$('.projects-backgrid-wrapper'),
                gridManagerContainerToolbarClassName: 'projects-grid-manager-container',

                model: App.Models.projectModel,
                modelNameLabel: 'Project',
                parentView: self,
                viewName: 'projects'
            });

            self.projectGridManagerContainerToolbar = new App.Views.ProjectGridManagerContainerToolbar({
                el: self.$('.projects-grid-manager-container'),
                parentView: self,

                managedGridView: self.projectsView,
                viewName: 'projects-grid-manager-toolbar'
            });
            self.projectGridManagerContainerToolbar.render();
            self.childViews.push(self.projectGridManagerContainerToolbar);
            this.projectsView.setGridManagerContainerToolbar(self.projectGridManagerContainerToolbar);

            self.projectsView.render();
            self.childViews.push(self.projectsView);

            self.siteProjectTabsView = new self.siteProjectTabsViewClass({
                el: self.$('.site-projects-tabs-view'),
                ajaxWaitingTargetClassSelector: '.tabs-content-container',

                parentView: self,
                managedGridView: self.projectsView,
                model: self.projectsView.model,
                viewName: 'site-projects-tabs-view'
            });
            self.siteProjectTabsView.render();
            self.childViews.push(self.siteProjectTabsView);

            if (!_.isEmpty(self.projectsView.getViewDataStore('current-tab'))) {
                try {
                    self.$el.find('.nav-tabs [href="#' + self.projectsView.getViewDataStore('current-tab') + '"]').tab('show');
                    self.$el.find('.tab-content .tab-pane').removeClass('active');
                    self.$el.find('.tab-content .tab-pane#' + self.projectsView.getViewDataStore('current-tab')).addClass('active');
                    self.$el.find('.tab-grid-manager-container.' + self.projectsView.getViewDataStore('current-tab')).show();
                } catch (e) {
                    //console.log(e, self.managedGridView.getViewDataStore('current-tab'))
                }

                //console.log('just set the tab', self.managedGridView.getViewDataStore('current-tab'), self.$el.find('.nav-tabs [href="#' + self.managedGridView.getViewDataStore('current-tab') + '"]'))
            } else {
                self.$el.find('.nav-tabs #project_lead').tab('show');
                self.$el.find('.tab-grid-manager-container.project_lead').show();
            }
            return self;
        },
        /**
         * ProjectID can also be an event
         * @param ProjectID
         */
        updateProjectDataViews: function (ProjectID) {
            let self = this;

            if (typeof ProjectID === 'string') {
                let currentProjectModel = self.collection.findWhere({ProjectID: parseInt(ProjectID)});
                App.Views.mainApp.$('.site-projects-tabs-view .box-title small').html(currentProjectModel.get('ProjectDescription'))
            }
        }
    });
})(window.App);

(function (App) {

    /**
     * This is the site form
     */
    App.Views.Site = App.Views.Backend.extend({
        viewName: 'sites-view',
        tagName: 'div',
        template: template('siteTemplate'),
        initialize: function (options) {
            let self = this;

            _.bindAll(this, 'update');
            self._initialize(options);
            self.listenTo(self.options.parentView.siteYearsDropdownView, 'site-status-id-change', self.fetchIfNewID);
            this.listenTo(self.model, 'change', self.render);
            this.listenTo(self.model, 'set', self.render);
        },
        events: {
            'change input[type="text"]': 'update'
        },
        update: function (e) {
            let self = this;
            let attrName = $(e.target).attr('name');
            let attrValue = $(e.target).val();
            self.model.url = self.getModelUrl(self.model.get(self.model.idAttribute));
            let growlMsg = '';
            let growlType = '';
            $.when(
                self.model.save({[attrName]: attrValue},
                    {
                        success: function (model, response, options) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                        },
                        error: function (model, response, options) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                        }
                    })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
        fetchIfNewID: function (e) {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            self.model.url = self.getModelUrl(e[self.model.idAttribute]);
            $.when(
                self.model.fetch({reset: true})
            ).then(function () {
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
        render: function () {
            let self = this;
            self.model.set('disabled', !App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager ? 'disabled' : '');
            self.$el.html(self.template(self.model.toJSON()));
            return self;
        },
        getModalForm: function () {
            let self = this;
            let template = window.template('siteTemplate');

            let tplVars = {
                SiteID: '',
                SiteName: '',
                EquipmentLocation: '',
                DebrisLocation: ''
            };
            return template(tplVars);
        },
        create: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            attributes = _.omit(attributes, self.model.idAttribute);
            _log('App.Views.Site.create', attributes, self.model);
            let newModel = new App.Models.Site();
            newModel.url = self.getModelUrl();
            let growlMsg = '';
            let growlType = '';
            $.when(
                newModel.save(attributes,
                    {
                        success: function (model, response, options) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                            self.options.parentView.sitesDropdownView.collection.url = self.options.parentView.sitesDropdownView.getCollectionUrl();
                            $.when(
                                self.sitesDropdownView.collection.fetch({reset: true})
                            ).then(function () {
                                //initialize your views here
                                _log('App.Views.Site.create.event', 'site collection fetch promise done. new_site_id:' + response.new_site_id);
                                self.options.parentView.sitesDropdownView.$el.val(response.new_site_id.toString());
                                self.options.parentView.sitesDropdownView.$el.trigger('change');

                            });
                        },
                        error: function (model, response, options) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                        }
                    })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
        destroy: function () {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            _log('App.Views.Site.destroy', self.model);
            self.model.url = self.getModelUrl(self.model.get(self.model.idAttribute));
            let growlMsg = '';
            let growlType = '';
            $.when(
                self.model.destroy({
                    success: function (model, response, options) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                        self.options.parentView.sitesDropdownView.collection.url = self.options.parentView.sitesDropdownView.getCollectionUrl();
                        $.when(
                            self.options.parentView.sitesDropdownView.collection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            _log('App.Views.Site.destroy.event', 'site collection fetch promise done');
                            self.options.parentView.sitesDropdownView.$el.trigger('change')
                        });
                    },
                    error: function (model, response, options) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                    }
                })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });

        }
    });

    App.Views.SiteStatus = App.Views.Backend.extend({
        viewName: 'site-status-view',
        template: template('siteStatusTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(this, 'update');
            self._initialize(options);
            self.listenTo(self.options.parentView.siteYearsDropdownView, 'site-status-id-change', self.fetchIfNewID);
            self.listenTo(self.model, 'change', self.render);
            self.listenTo(self.model, 'destroy', self.remove);
        },
        events: {
            'click input[type="checkbox"]': 'update',
            'change textarea': 'update',
            'click .delete': 'destroy'
        },
        fetchIfNewID: function (e) {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            self.model.url = self.getModelUrl(e[self.model.idAttribute]);
            $.when(
                self.model.fetch({reset: true})
            ).then(function () {
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
        update: function (e) {
            let self = this;
            let $target = $(e.target);
            let attrType = $target.attr('type');
            let attrName = $target.attr('name');
            let attrValue = $target.val();

            let selected = $target.is(':checked');
            if (attrType === 'checkbox') {
                attrValue = selected ? 1 : 0;
            }
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            //console.log('attrType:' + attrType, 'selected: ', selected, 'attrName:' + attrName, 'value: ', attrValue);
            self.model.url = self.getModelUrl(self.model.get(self.model.idAttribute));
            let growlMsg = '';
            let growlType = '';
            $.when(
                self.model.save({[attrName]: attrValue},
                    {
                        success: function (model, response, options) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                        },
                        error: function (model, response, options) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                        }
                    })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
        destroy: function () {
            let self = this;
            self.model.url = self.getModelUrl(self.model.get(self.model.idAttribute));
            let growlMsg = '';
            let growlType = '';
            $.when(
                self.model.destroy({
                    success: function (model, response, options) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                    },
                    error: function (model, response, options) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                    }
                })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
        remove: function () {
            let self = this;
            self.$el.remove();
        },
        render: function () {
            let self = this;
            let checkedBoxes = {
                'ProjectDescriptionCompleteIsChecked': self.model.get('ProjectDescriptionComplete') === 1 ? 'checked' : '',
                'BudgetEstimationCompleteIsChecked': self.model.get('BudgetEstimationComplete') === 1 ? 'checked' : '',
                'VolunteerEstimationCompleteIsChecked': self.model.get('VolunteerEstimationComplete') === 1 ? 'checked' : '',
                'VolunteerAssignmentCompleteIsChecked': self.model.get('VolunteerAssignmentComplete') === 1 ? 'checked' : '',
                'BudgetActualCompleteIsChecked': self.model.get('BudgetActualComplete') === 1 ? 'checked' : '',
                'EstimationCommentsIsChecked': self.model.get('EstimationComments') === 1 ? 'checked' : ''
            };
            self.model.set('disabled', !App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager ? 'disabled' : '');
            self.$el.html(self.template(_.extend(self.model.toJSON(), checkedBoxes)));
            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            return self;
        }
    });
})(window.App);

(function (App) {
    App.Views.SiteVolunteerGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        viewName: 'site-volunteers-grid-manager-container-toolbar-view',
        initialize: function (options) {
            let self = this;
            self._initialize(options);
            _log('App.Views.SiteVolunteerGridManagerContainerToolbar.initialize', options);
        }
    });

    App.Views.SiteVolunteer = App.Views.ManagedGrid.extend({
        viewName: 'site-volunteers-view',
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'update', 'renderGrid', 'refreshView', 'getModalForm', 'create', 'batchDestroy', 'showColumnHeaderLabel', 'showTruncatedCellContentPopup', 'hideTruncatedCellContentPopup');
            } catch (e) {
                console.error(self.viewName, e)
            }

            self._initialize(options);
            self.listenTo(self.options.parentView.siteYearsDropdownView, 'site-status-id-change', self.fetchIfNewID);
            _log('App.Views.SiteVolunteer.initialize', options);
        },
        events: {},
        getCollectionQueryString: function () {
            let self = this;

            return self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute);
        },
        fetchIfNewID: function (e) {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            self.collection.url = self.getCollectionUrl();
            $.when(
                self.collection.fetch({reset: true})
            ).then(function () {

                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                if (self.collection.length) {
                    App.Vars.currentSiteVolunteerRoleID = self.collection.at(0).get(self.model.idAttribute);
                    self.model.set(self.collection.at(0));
                    self.refocusSiteVolunteerRecord();
                }
            });
        },
        refocusSiteVolunteerRecord: function () {
            let self = this;
            let recordIdx = 1;

            this.paginator.collection.fullCollection.each(function (model, idx) {

                if (model.get(self.model.idAttribute) === App.Vars.currentSiteVolunteerRoleID) {
                    recordIdx = idx;
                }
            });
            recordIdx = recordIdx === 0 ? 1 : recordIdx;
            let page = Math.ceil(recordIdx / this.paginator.collection.state.pageSize)
            if (page > 1) {
                _.each(this.paginator.handles, function (handle, idx) {
                    if (handle.pageIndex === page && handle.label === page) {
                        //console.log(handle, handle.pageIndex, handle.el)
                        $(handle.el).find('a').trigger('click')
                    }
                })
            }
            //console.log(recordIdx, this.paginator.collection.state.pageSize, page, this.backgrid, this.paginator, this.backgrid.collection)
            self.$el.find('input[type="radio"][name="' + self.model.idAttribute + '"][value="' + App.Vars.currentSiteVolunteerRoleID + '"]').parents('tr').trigger('focusin');
        },
        render: function (e) {
            let self = this;

            // Need to set the current model id every time the view is rendered
            self.setViewDataStoreValue('current-model-id', self.collection.length ? self.collection.at(0).get(self.model.idAttribute) : null);
            self.renderGrid(e, self.viewName);

            return this;
        },
        getModalForm: function () {
            let self = this;
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
                SiteStatusID: self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute),
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
        refreshView: function (e) {
            let self = this;

            self._refreshView(e);
        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                let currentModelID = e.attributes[self.model.idAttribute];
                if (!_.isUndefined(e.changed['SiteVolunteerRoleStatus'])) {
                    e.changed['Status'] = e.changed['SiteVolunteerRoleStatus'];
                }
                let attributes = _.extend({[self.model.idAttribute]: currentModelID}, e.changed);
                //console.log('update', {currentModelID: currentModelID, parentSiteStatusID: self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute)})
                attributes['SiteStatusID'] = self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute);
                _log('App.Views.SiteVolunteer.update', self.viewName, e.changed, attributes, self.model);
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                self.model.url = self.getModelUrl(currentModelID);
                let growlMsg = '';
                let growlType = '';
                $.when(
                    self.model.save(attributes,
                        {
                            success: function (model, response, options) {
                                _log('App.Views.SiteVolunteer.update', self.viewName + ' save', model, response, options);
                                growlMsg = response.msg;
                                growlType = response.success ? 'success' : 'error';
                            },
                            error: function (model, response, options) {
                                console.error('App.Views.SiteVolunteer.update', self.viewName + ' save', model, response, options);
                                growlMsg = response.msg;
                                growlType = response.success ? 'success' : 'error';
                            }
                        })
                ).then(function () {
                    growl(growlMsg, growlType);
                    window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                });
            }
        },
        create: function (attributes) {
            var self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);

            let model = self.model.clone().clear({silent: true});
            _log('App.Views.SiteVolunteer.create', self.viewName, attributes, model, self.ajaxWaitingSelector);
            model.url = self.getModelRoute();
            attributes['SiteStatusID'] = self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute);
            let growlMsg = '';
            let growlType = '';
            $.when(
                model.save(attributes,
                    {
                        success: function (model, response, options) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                            self.collection.url = self.getCollectionUrl(self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute));
                            $.when(
                                self.collection.fetch({reset: true})
                            ).then(function () {
                                _log('App.Views.SiteVolunteer.create.event', self.viewName + ' collection fetch promise done');
                            });
                        },
                        error: function (model, response, options) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                        }
                    })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
        batchDestroy: function (attributes) {
            var self = this;
            window.ajaxWaiting('show', this.ajaxWaitingSelector);

            _log(this.viewName + '.destroy', attributes);
            let growlMsg = '';
            let growlType = '';
            $.when(
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: self.getModelRoute() + '/batch/destroy',
                    data: attributes,
                    success: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                        console.log('destroy', {currentModelID: self.model.get(self.model.idAttribute), parentSiteStatusID: self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute)})
                        self.collection.url = self.getCollectionUrl(self.options.parentView.siteYearsDropdownView.model.get(self.options.parentView.siteYearsDropdownView.model.idAttribute));
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            _log(self.viewName + '.destroy.event', self.viewName + ' collection fetch promise done');
                        });
                    },
                    fail: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                    }
                })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
    });
})(window.App);

(function (App) {
    App.Views.SiteManagement = App.Views.Management.extend({
        sitesDropdownViewClass: App.Views.SitesDropdown,
        siteYearsDropdownViewClass: App.Views.SiteYearsDropdown,
        siteViewClass: App.Views.Site,
        siteStatusViewClass: App.Views.SiteStatus,
        siteVolunteersViewClass: App.Views.SiteVolunteer,
        attributes: {
            class: 'route-view box box-primary site-management-view'
        },
        template: template('siteManagementTemplate'),
        viewName: 'site-management-view',
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'addSite', 'deleteSite');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            this._initialize(options);
        },
        events: {
            'click #btnAddSite': 'addSite',
            'click #btnDeleteSite': 'deleteSite'
        },
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(self.template());
            if (!App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager) {
                self.$el.find('#btnAddSite').hide();
            }
            if (!App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager) {
                self.$el.find('#btnDeleteSite').hide();
            }

            self.renderSiteDropdowns();

            self.siteView = new self.siteViewClass({
                el: self.$('.site-view'),
                ajaxWaitingTargetClassSelector: '#site-well',
                model: App.Models.siteModel,
                collection: App.Collections.sitesDropDownCollection,

                parentView: self,
                sitesDropdownView: self.sitesDropdownView,
                viewName: 'site-view'
            });
            self.siteView.render();

            self.siteStatusView = new self.siteStatusViewClass({
                el: self.$('.site-status-view'),
                ajaxWaitingTargetClassSelector: '#site-well',
                model: App.Models.siteStatusModel,

                parentView: self,
                viewName: 'site-status-view'
            });
            self.siteStatusView.render();

            self.siteVolunteersView = new self.siteVolunteersViewClass({
                ajaxWaitingTargetClassSelector: '#site-volunteers-well',
                collection: App.PageableCollections.siteVolunteersRoleCollection,
                columnCollectionDefinitions: App.Vars.siteVolunteersBackgridColumnDefinitions,
                currentModelIDDataStoreSelector: 'body',
                el: self.$('.site-volunteers-backgrid-wrapper'),
                gridManagerContainerToolbarClassName: 'site-volunteers-grid-manager-container',

                model: App.Models.siteVolunteerRoleModel,
                modelNameLabel: 'Site Volunteers',
                parentView: self,
                hideCellCnt: 0
            });
            self.siteVolunteerGridManagerContainerToolbar = new App.Views.SiteVolunteerGridManagerContainerToolbar({
                el: self.$('.site-volunteers-grid-manager-container'),
                parentView: self,

                managedGridView: self.siteVolunteersView,
                viewName: 'site-volunteers-grid-manager-toolbar'
            });
            self.siteVolunteerGridManagerContainerToolbar.render();

            self.siteVolunteersView.render();
            self.siteVolunteersView.setGridManagerContainerToolbar(self.siteVolunteerGridManagerContainerToolbar);

            self.childViews.push(self.sitesDropdownView);
            self.childViews.push(self.siteYearsDropdownView);
            self.childViews.push(self.siteView);
            self.childViews.push(self.siteStatusView);
            self.childViews.push(self.siteVolunteerGridManagerContainerToolbar);
            self.childViews.push(self.siteVolunteersView);

            return self;
        },
        addSite: function () {
            let self = this;
            self.getModalElement().one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('New Site');
                modal.find('.modal-body').html(self.siteView.getModalForm());

                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    self.siteView.create($.unserialize(modal.find('form').serialize()));


                    self.getModalElement().modal('hide');
                });

            });
            self.getModalElement().modal('show');
        },
        deleteSite: function () {
            let self = this;
            bootbox.confirm("Do you really want to delete the "+ App.Models.siteModel.get('SiteName') +" site and all of its projects?", function (bConfirmed) {
                if (bConfirmed) {
                    self.siteView.destroy();
                }
            });
        }
    });
})(window.App);

(function (App) {

    let BackGridFiltersPanelSelectFilter = Backgrid.Extension.BackGridFiltersPanelSelectFilter = App.Views.Backend.extend({
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
    let BackGridFiltersPanelClientSideFilter = Backgrid.Extension.BackGridFiltersPanelClientSideFilter = App.Views.Backend.extend({
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

    App.Views.BackGridFiltersPanel = App.Views.Backend.extend({
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
            let self = this;
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
            self.parentEl = $(options.parentEl);
            self.wait = options.wait || self.wait;
            // fullCollection is so we can get the entire collection for pageable collections instead of just the collection for the first page
            let collection = self.collection = self.collection.fullCollection || self.collection;
            self.origCollection = collection.clone();

            self._debounceMethods(["search", "clear"]);

            self.listenTo(collection, "add", function (model, collection, options) {
                self.origCollection.add(model, options);
            });
            self.listenTo(collection, "remove", function (model, collection, options) {
                self.origCollection.remove(model, options);
            });
            self.listenTo(collection, "sort", function (col) {
                if (!self.query()) self.origCollection.reset(col.models);
            });
            self.listenTo(collection, "reset", function (col, options) {
                options = _.extend({reindex: true}, options || {});
                if (options.reindex && options.from == null && options.to == null) {
                    self.origCollection.reset(col.models);
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
    App.Views.VolunteerGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        viewName: 'volunteer-grid-manager-container-toolbar-view',
        initialize: function (options) {
            let self = this;
            // Required call for inherited class
            self._initialize(options);
            _log('App.Views.VolunteerGridManagerContainerToolbar.initialize', options);
        },
        events: {},
        render: function () {
            let self = this;
            self._render();

            return self;
        }
    });
})(window.App);

(function (App) {
    App.Views.Volunteer = App.Views.ManagedGrid.extend({
        viewName: 'volunteers-view',
        events: {},
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self,
                    'update');
            } catch (e) {
                console.error(options, e)
            }

            // Required call for inherited class
            self._initialize(options);

            if (self.collection.length === 0) {
                self.setViewDataStoreValue('current-model-id', null);
            }

            _log('App.Views.Volunteer.initialize', options);
        },
        render: function (e) {
            let self = this;

            // Need to set the current model id every time the view is rendered
            self.setViewDataStoreValue('current-model-id', self.collection.length ? self.collection.at(0).get(self.model.idAttribute) : null);
            self.renderGrid(e, self.viewName);

            return self;

        },
        getModalForm: function () {
            let self = this;
            let template = window.template('new' + self.modelNameLabel + 'Template');
            let siteSelect = new App.Views.Select({
                el: '',
                attributes: {id: 'PreferredSiteID', name: 'PreferredSiteID', class: 'form-control'},
                buildHTML: true,
                collection: App.Collections.sitesDropDownCollection,
                optionValueModelAttrName: 'SiteID',
                optionLabelModelAttrName: ['SiteName'],
                addBlankOption: true
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
        }
    });
})(window.App);

(function (App) {
    App.Views.VolunteersManagement = App.Views.Management.extend({
        volunteersViewClass: App.Views.Volunteer,
        template: template('managementTemplate'),
        initialize: function (options) {
            let self = this;
            // try {
            //     _.bindAll(self, '');
            // } catch (e) {
            //     console.error(options, e);
            // }
            // Required call for inherited class
            self._initialize(options);
        },
        events: {

        },
        render: function () {
            let self = this;
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            self.$el.html(self.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));

            self.volunteersView = new self.volunteersViewClass({
                ajaxWaitingTargetClassSelector: '.volunteers-view',
                backgridWrapperClassSelector: '.backgrid-wrapper',
                collection: App.PageableCollections.volunteersManagementCollection,
                columnCollectionDefinitions: App.Vars.volunteersBackgridColumnDefinitions,
                currentModelIDDataStoreSelector: '.volunteers-view',
                el: self.$('.backgrid-wrapper'),
                gridManagerContainerToolbarClassName: 'grid-manager-container',

                model: App.Models.volunteerModel,
                modelNameLabel: 'Volunteer',
                parentView: self,
                viewName: 'volunteers'
            });

            self.volunteersGridManagerContainerToolbar = new App.Views.VolunteerGridManagerContainerToolbar({
                el: self.$('.grid-manager-container'),
                parentView: self,

                managedGridView: self.volunteersView,
                viewName: 'volunteers-grid-manager-toolbar'
            });

            self.volunteersGridManagerContainerToolbar.render();
            self.childViews.push(self.volunteersGridManagerContainerToolbar);
            self.volunteersView.setGridManagerContainerToolbar(self.volunteersGridManagerContainerToolbar);

            self.volunteersView.render();
            self.childViews.push(self.volunteersView);

            self.backGridFiltersPanel = new App.Views.BackGridFiltersPanel({
                collection: self.collection,
                parentEl: self.volunteersView.$gridContainer
            });

            self.volunteersView.$gridContainer.prepend(self.backGridFiltersPanel.render().$el);
            self.childViews.push(self.backGridFiltersPanel);

            return self;
        }
    });
})(window.App);

(function (App) {

    let BackGridContactsFiltersPanelSelectFilter = Backgrid.Extension.BackGridContactsFiltersPanelSelectFilter = App.Views.Backend.extend({
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
    let BackGridContactsFiltersPanelClientSideFilter = Backgrid.Extension.BackGridContactsFiltersPanelClientSideFilter = App.Views.Backend.extend({
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

    App.Views.BackGridContactsFiltersPanel = App.Views.Backend.extend({
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
    App.Views.ContactGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        viewName: 'contact-grid-manager-container-toolbar-view',
        initialize: function (options) {
            let self = this;
            // Required call for inherited class
            self._initialize(options);
            _log('App.Views.ContactGridManagerContainerToolbar.initialize', options);
        },
        events: {},
        render: function () {
            let self = this;
            self._render();

            return self;
        }
    });
})(window.App);

(function (App) {
    App.Views.Contact = App.Views.ManagedGrid.extend({
        viewName: 'contacts-view',
        events: {},
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self,
                    'update');
            } catch (e) {
                console.error(options, e)
            }

            // Required call for inherited class
            self._initialize(options);

            if (self.collection.length === 0) {
                self.setViewDataStoreValue('current-model-id', null);
            }

            _log('App.Views.Contact.initialize', options);
        },
        render: function (e) {
            let self = this;

            // Need to set the current model id every time the view is rendered
            self.setViewDataStoreValue('current-model-id', self.collection.length ? self.collection.at(0).get(self.model.idAttribute) : null);
            self.renderGrid(e, self.viewName);

            return self;

        },
        getModalForm: function () {
            let self = this;
            let template = window.template('new' + self.modelNameLabel + 'Template');
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
        }
    });
})(window.App);

(function (App) {
    App.Views.ContactsManagement = App.Views.Management.extend({
        contactsViewClass: App.Views.Contact,
        template: template('managementTemplate'),
        initialize: function (options) {
            let self = this;
            // try {
            //     _.bindAll(self, '');
            // } catch (e) {
            //     console.error(options, e);
            // }
            // Required call for inherited class
            self._initialize(options);

        },
        events: {

        },
        render: function () {
            let self = this;
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            self.$el.html(self.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));

            self.contactsView = new self.contactsViewClass({
                ajaxWaitingTargetClassSelector: '.contacts-view',
                collection: App.PageableCollections.contactsManagementCollection,
                columnCollectionDefinitions: App.Vars.ContactsBackgridColumnDefinitions,
                currentModelIDDataStoreSelector: '.contacts-view',
                el: self.$('.backgrid-wrapper'),
                gridManagerContainerToolbarClassName: 'grid-manager-container',

                model: App.Models.contactModel,
                modelNameLabel: 'Contact',
                parentView: self,
                viewName: 'contacts'
            });

            self.contactsGridManagerContainerToolbar = new App.Views.ContactGridManagerContainerToolbar({
                el: self.$('.grid-manager-container'),
                parentView: self,

                managedGridView: self.contactsView,
                viewName: 'contacts-grid-manager-toolbar'
            });

            self.contactsGridManagerContainerToolbar.render();
            self.childViews.push(self.contactsGridManagerContainerToolbar);
            self.contactsView.setGridManagerContainerToolbar(self.contactsGridManagerContainerToolbar);

            self.contactsView.render();
            self.childViews.push(self.contactsView);

            self.backGridFiltersPanel = new App.Views.BackGridContactsFiltersPanel({
                collection: self.collection,
                parentEl: self.contactsView.$gridContainer
            });

            self.contactsView.$gridContainer.prepend(self.backGridFiltersPanel.render().$el);
            self.childViews.push(self.backGridFiltersPanel);

            return self;

        }
    });
})(window.App);

(function (App) {
    App.Views.ProjectsDropDownOption = App.Views.Backend.extend({
        tagName: 'option',
        initialize: function (options) {
            _.bindAll(this, 'render');
        },
        render: function () {
            let self = this;
            this.$el.attr('value', self.model.get('ProjectID'))
                .html(self.model.get('SequenceNumber'));
            return this;
        }
    });
    App.Views.ProjectsDropDown = App.Views.Backend.extend({
        initialize: function (options) {
            let self = this;
            this.options = options;
            this.optionsView = [];
            this.parentView = this.options.parentView;
            _.bindAll(this, 'addOne', 'addAll', 'changeSelected');
            self.listenTo(self.collection, "reset", self.addAll);
        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (projectDropDown) {
            let option = new App.Views.ProjectsDropDownOption({model: projectDropDown});
            this.optionsView.push(option);
            this.$el.append(option.render().el);
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
            let $option = this.$el.find(':selected');
            if (!$option.length) {
                $option = this.$el.find(':first-child');
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

    App.Views.ReportsManagement = App.Views.Management.extend({
        sitesDropdownViewClass: App.Views.SitesDropdown,
        siteYearsDropdownViewClass: App.Views.SiteYearsDropdown,
        projectsDropDownViewClass: App.Views.ProjectsDropDown,
        template: template('reportManagementTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'render','handleSiteStatusIDChange');
            let self = this;
            self._initialize(options);
            this.viewClassName = this.options.viewClassName;
            this.viewName = 'App.Views.ReportsManagement';
            this.localStorageKey = self.modelNameLabel;
            this.backgridWrapperClassSelector = '.backgrid-wrapper';
            this.ajaxWaitingSelector = '.' + this.viewClassName + ' ' + this.backgridWrapperClassSelector;
            this.reportType = this.options.reportType;

            _log(this.viewName + '.initialize', options, this);
        },
        events: {},
        render: function () {
            let self = this;
            self.modelNameLabel = this.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase().replace(' ', '_');
            this.$el.html(this.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            self.renderSiteDropdowns();
            // this.sitesDropdownView = new this.sitesDropdownViewClass({
            //     el: this.$('select#sites'),
            //     parentView: this,
            //     collection: App.Collections.sitesDropDownCollection
            // });
            // this.sitesDropdownView.render();
            //
            //
            // this.siteYearsDropdownView = new this.siteYearsDropdownViewClass({
            //     el: this.$('select#site_years'),
            //     parentView: this,
            //     collection: App.Collections.siteYearsDropDownCollection
            // });
            // this.siteYearsDropdownView.render();

            this.projectsDropDownView = new this.projectsDropDownViewClass({
                el: this.$('select#projects'),
                parentView: this,
                collection: App.Collections.projectsDropDownCollection
            });
            this.projectsDropDownView.render();
            //console.log({reportType:this.reportType})

            if (this.reportType !== 'projects') {
                this.$('.project-dropdown').hide();
            } else {
                this.$('.project-dropdown').show();
            }

            if (this.reportType === 'sites') {
                this.$('.site-management-selects').hide();
            }
            if (this.reportType === 'projects_full') {
                self.$('.download-spreadsheet').hide();
                self.$('.download-pdf').hide();
                self.$('.download-csv').hide();
                this.addProjectAttributesFilters();
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
        addProjectAttributesFilters: function(){
            let self = this;
            let cols = 3;
            let colCnt = 0;
            let attrCnt = 0;
            let currentCol = 1;

            self.attributesOptions = JSON.parse(JSON.stringify(App.Collections.attributesManagementCollection.getTableOptions('projects', false)));
            // add project model fields
            self.attributesOptions.unshift({id:0,attribute_code:'PeopleNeeded',label:'People Needed'});
            self.attributesOptions.unshift({id:0,attribute_code:'HasAttachments',label:'Has Attachments'});
            self.attributesOptions.unshift({id:0,attribute_code:'VolunteersAssigned',label:'Volunteers Assigned'});
            self.attributesOptions.unshift({id:0,attribute_code:'BudgetSources',label:'Budget Sources'});
            self.attributesOptions.unshift({id:0,attribute_code:'Comments',label:'Additional Notes'});
            self.attributesOptions.unshift({id:0,attribute_code:'ProjectDescription',label:'Project Description'});
            self.attributesOptions.unshift({id:0,attribute_code:'OriginalRequest',label:'Original Request'});
            self.attributesOptions.unshift({id:0,attribute_code:'SequenceNumber',label:'Project#'});
            self.attributesOptions.unshift({id:0,attribute_code:'Active',label:'Active'});

            self.projectAttributes = JSON.parse(JSON.stringify(App.Collections.projectAttributesManagementCollection.where({workflow_id: 1})));
            let skillsNeededOptions = App.Models.projectModel.getSkillsNeededOptions(false);
            let generalSkillsOptionId;
            _.each(skillsNeededOptions, function(val,idx){
                if(val[0]==='General'){
                    generalSkillsOptionId = val[1];
                }
            });
            self.generalProjectAttributeIds = _.pluck(_.where(self.projectAttributes, {project_skill_needed_option_id: parseInt(generalSkillsOptionId)}),'attribute_id');
            let primarySkillNeededAttribute = _.findWhere(self.attributesOptions, {attribute_code: "primary_skill_needed"});
            self.generalProjectAttributeIds.push(primarySkillNeededAttribute.id)
            self.generalProjectAttributeIds.sort(function(a, b) {
                return a - b;
            });
            self.$el.find('.report-wrapper').before('<fieldset class="attributes" style="border:1px solid beige;padding:10px"><legend style="border:0;font-size:14px;font-weight:bold">Include in report &nbsp;&nbsp;&nbsp;<a href="#" class="uncheck-all">uncheck all</a> :: <a href="#" class="check-all">check all</a> :: <a href="#"  class="check-only-general">check only attributes shared by all projects that are in the scope workflow</a> :: <a href="#" class="check-only-statuses">check only statuses</a></legend></fieldset>');
            let colsHtml = '';
            let colWidth = 12 / cols;
            for(let x=1;x<=cols;x++){
                colsHtml += '<div class="col-xs-'+colWidth+' attr-col'+x+'"></div>';
            }
            self.$el.find('fieldset.attributes').append('<form name="project_attributes" action="" method="GET"><div class="row">'+colsHtml+'</div></form>');

            let perCol = Math.floor(self.attributesOptions.length / cols);

            //console.log({cols:cols,attributesOptionsCnt:self.attributesOptions.length,perCol:perCol})
            //console.log({attributesOptions:self.attributesOptions,primarySkillNeededAttribute:primarySkillNeededAttribute});
            _.each(self.attributesOptions, function (attribute){
                if(attribute.attribute_code !== 'project_attachments' && attribute.attribute_code !== 'budget_sources'){
                    let checked = 'checked';

                    //console.log({perCol:perCol,attrCnt:attrCnt,mod:attrCnt % perCol,currentCol:currentCol})
                    if(attrCnt < perCol){
                        currentCol = 1;
                    } else if(currentCol !== cols && attrCnt % perCol === 0){
                        currentCol++;
                    }
                    let col = self.$el.find('form[name="project_attributes"] .attr-col' + currentCol);
                    let checkIdentifierClasses = '';
                    if(attribute.id === 0 || _.indexOf(self.generalProjectAttributeIds,attribute.id,true)!==-1){
                        checkIdentifierClasses += ' general-attribute ';
                    }
                    if(attribute.attribute_code.match(/(SequenceNumber|ProjectDescription|done|status|send)/)){
                        checkIdentifierClasses += ' status-attribute ';
                    }
                    col.append('<label class="project-attribute-checkbox-label checkbox-inline '+ checkIdentifierClasses +'" for="project_attribute_'+attribute.attribute_code+'"><input type="checkbox" '+checked+' id="project_attribute_'+attribute.attribute_code+'" name="project_attributes[]" value="'+attribute.attribute_code+'">'+attribute.label+'</label><br>');
                    attrCnt++;
                }

            });
            self.$('.attributes legend .uncheck-all').on('click', function(e){
                e.preventDefault();
                let $checkboxes = self.$el.find('form[name="project_attributes"]').find('input[type="checkbox"]');
                $checkboxes.each(function(idx,el){
                    $(el).prop('checked', false);
                    $(el).removeAttr('checked');
                })
            }).hover(function(e){
                self.$el.find('form[name="project_attributes"]').find('label').addClass('hilite-attribute-label');
            },function(e){
                self.$el.find('form[name="project_attributes"]').find('label').removeClass('hilite-attribute-label');
            });
            self.$('.attributes legend .check-all').on('click', function(e){
                e.preventDefault();
                let $checkboxes = self.$el.find('form[name="project_attributes"]').find('input[type="checkbox"]');
                $checkboxes.each(function(idx,el){
                    $(el).prop('checked', true);
                    $(el).attr('checked','checked');
                })
            }).hover(function(e){
                self.$el.find('form[name="project_attributes"]').find('label').addClass('hilite-attribute-label');
            },function(e){
                self.$el.find('form[name="project_attributes"]').find('label').removeClass('hilite-attribute-label');
            });


            self.$('.attributes legend .check-only-general').on('click', function(e){
                e.preventDefault();
                let $checkboxes = self.$el.find('form[name="project_attributes"]').find('input[type="checkbox"]');
                $checkboxes.each(function(idx,el){
                    $(el).prop('checked', false);
                    $(el).removeAttr('checked');
                });

                $checkboxes = self.$el.find('form[name="project_attributes"]').find('.general-attribute input[type="checkbox"]');
                $checkboxes.each(function(idx,el){
                    $(el).prop('checked', true);
                    $(el).attr('checked','checked');
                })
            }).hover(function(e){
                self.$el.find('form[name="project_attributes"]').find('label.general-attribute').addClass('hilite-attribute-label');
            },function(e){
                self.$el.find('form[name="project_attributes"]').find('label.general-attribute').removeClass('hilite-attribute-label');
            });

            self.$('.attributes legend .check-only-statuses').on('click', function(e){
                e.preventDefault();
                let $checkboxes = self.$el.find('form[name="project_attributes"]').find('input[type="checkbox"]');
                $checkboxes.each(function(idx,el){
                    $(el).prop('checked', false);
                    $(el).removeAttr('checked');
                });

                $checkboxes = self.$el.find('form[name="project_attributes"]').find('.status-attribute input[type="checkbox"]');
                $checkboxes.each(function(idx,el){
                    $(el).prop('checked', true);
                    $(el).attr('checked','checked');
                })
            }).hover(function(e){
                self.$el.find('form[name="project_attributes"]').find('label.status-attribute').addClass('hilite-attribute-label');
            },function(e){
                self.$el.find('form[name="project_attributes"]').find('label.status-attribute').removeClass('hilite-attribute-label');
            });

            // the link will be return in the initial response
            self.$el.on('click','.must-download-spreadsheet', function(e){
                e.preventDefault();
                self.$el.find('form[name="project_attributes"]').attr('action',this.href);
                self.$el.find('form[name="project_attributes"]').trigger('submit');
            })
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
    App.Views.StatusRecord = App.Views.Backend.extend({
        tagName: 'div',
        attributes: {
            class: 'row'
        },
        template: template('statusRecordTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(self, 'render', 'setPopOverContent', 'cancelSaveStatusManagementOption', 'saveStatusManagementOption');
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
                        BudgetEstimationComplete: {fieldName: 'cost_estimate_done', incompleteValue: '0'},
                        BudgetActualComplete: {fieldName: 'budget_allocation_done', incompleteValue: '0'},
                        VolunteerEstimationComplete: {fieldName: 'volunteer_allocation_done', incompleteValue: '0'},
                        VolunteerAssignmentComplete: {fieldName: '', incompleteValue: false, condition: "project.volunteers_needed_estimate.toString() !== oStatusEntryFields['VolunteerEstimationComplete'].incompleteValue.toString() && project.volunteers_needed_estimate.toString() !== '0' && project.VolunteersAssigned.toString() === project.volunteers_needed_estimate.toString()"}
                    }
                },
                project: {
                    aFields: ['ProjectDescription', 'status', 'cost_estimate_done', 'budget_allocation_done', 'material_list_done', 'volunteer_allocation_done', 'project_send', 'final_completion_status'],
                    oValidation: {
                        default: ['1'],
                        status: [],
                        project_send: [] // doesn't need validation
                    },
                    oFieldCntsMap: {
                        ProjectDescription: {fieldCntsKey: 'iProjectDescriptionCompleteCnt'},
                        cost_estimate_done: {fieldCntsKey: 'iBudgetEstimationCompleteCnt'},
                        budget_allocation_done: {fieldCntsKey: 'iBudgetActualCompleteCnt'},
                        volunteer_allocation_done: {fieldCntsKey: 'iVolunteerEstimationCompleteCnt'}
                    },
                    oStatusEntryFieldsMap: {
                        ReadyForRegistration: {fieldName: '', incompleteValue: false, condition: "project.cost_estimate_done.toString() === 1 && project.budget_allocation_done.toString() === 1 && project.material_list_done.toString() === 1 && project.volunteer_allocation_done.toString() === 1"},
                        ProjectDescription: {fieldName: 'ProjectDescription', incompleteValue: ''},
                        cost_estimate_done: {fieldName: 'estimated_total_cost', incompleteValue: ''},
                        budget_allocation_done: {fieldName: 'BudgetSources', incompleteValue: ''},
                        material_list_done: {fieldName: 'material_needed_and_cost', incompleteValue: ''},
                        volunteer_allocation_done: {fieldName: 'volunteers_needed_estimate', incompleteValue: '0'},
                        VolunteerAssignmentComplete: {fieldName: '', completeValue: true, condition: "project.volunteers_needed_estimate.toString() !== oStatusEntryFields['volunteer_allocation_done'].incompleteValue.toString() && project.volunteers_needed_estimate.toString() !== '0' && project.VolunteersAssigned.toString() === project.volunteers_needed_estimate.toString()"}
                    }
                }
            };

        },
        events: {
            'click button': 'update',
            'change .form-control': 'enableSave',
            'change [name="value"]': 'enableSave',
            'inserted.bs.popover [data-popover="true"]': 'setPopOverContent',
            'click .popover-status-management-form .cancel': 'cancelSaveStatusManagementOption',
            'click .popover-status-management-form .save': 'saveStatusManagementOption',
            'click .edit-project': 'editProject'
        },
        render: function () {
            let self = this;
            //console.log(self.model.attributes)
            let $statusManagementRecord = self.template({model: self.setTemplateVars(self.model.attributes)});
            $(self.el).append($statusManagementRecord);
            // /view/project_scope/management/16_635
            return this;
        },
        editProject: function (e) {
            let self = this;
            let $icon = $(e.currentTarget);
            let load = $icon.data('site-id')+'_'+ $icon.data('id');
            window.location.href = '#/view/project_scope/management/' + load
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
            //console.log('setProjectStatusStates',{project:project,oFieldCnts:oFieldCnts,oStatusEntryFields:oStatusEntryFields});
            _.each(self.oStatusManagementRecordModels.project.aFields, function (sFieldName, key) {
                let bFlaggedAsComplete = null;
                let sStateKey = self.buildStateKey(sFieldName);
                let sStatusEntryField = typeof oStatusEntryFields[sFieldName] !== 'undefined' ? oStatusEntryFields[sFieldName].fieldName : null;
                //let sIncompleteStatusEntryValue = typeof oStatusEntryFields[sFieldName] !== 'undefined' ? oStatusEntryFields[sFieldName].incompleteValue : '';
                let sIncompleteStatusEntryValue = typeof oStatusEntryFields[sFieldName] !== 'undefined' && !_.isUndefined(oStatusEntryFields[sFieldName].incompleteValue) ? oStatusEntryFields[sFieldName].incompleteValue : '';
                let sToolTipKey = self.buildToolTipContentKey(sFieldName);

                // If the db value is null set it to its expected incomplete value
                if (!_.isNull(sStatusEntryField) && _.isNull(project[sStatusEntryField])) {
                    project[sStatusEntryField] = sIncompleteStatusEntryValue;
                }
                if(_.isUndefined(project[sFieldName])){
                    console.log('setProjectStatusStates missing fieldName error',{undefinedFieldName:sFieldName});
                }
                switch (sFieldName) {
                    case 'status':
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
                    case 'project_send':
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
                    case 'budget_allocation_done':
                        if (project.BudgetSources !== '') {
                            //console.group('budget_allocation_done ' + project.ProjectID);
                            //console.log({project:project,oFieldCnts:oFieldCnts,oStatusEntryFields:oStatusEntryFields});
                            let $oSiteStatusManagementModel = App.Collections.statusManagementCollection.find({SiteStatusID: parseInt(project.SiteStatusID)});
                            //console.log({oSiteStatusManagementModel:$oSiteStatusManagementModel,SiteName:$oSiteStatusManagementModel.get('SiteName')});
                            let aAnnualBudgetsManagementSites = App.Collections.annualBudgetsManagementCollection.find('Sites').get('Sites');
                            //console.log({aAnnualBudgetsManagementSites:aAnnualBudgetsManagementSites})
                            let aSiteProjects = aAnnualBudgetsManagementSites[$oSiteStatusManagementModel.get('SiteName')].Projects;
                            //console.log({psn:project.SequenceNumber, aSiteProjects:aSiteProjects});
                            let aBudgets = !_.isUndefined(aSiteProjects[project.SequenceNumber]) && !_.isUndefined(aSiteProjects[project.SequenceNumber]['Budget Source']) ? aSiteProjects[project.SequenceNumber]['Budget Source'] : [];

                            //console.log({aBudgets:aBudgets});
                            if (aBudgets.length) {
                                let budgetTotal = 0.00;
                                let budgetToolTip = "<table class='last-row-remove-bottom-border tooltip-table table table-condensed'>";
                                budgetToolTip += '<thead><tr><th style=\'width:75%;\'>Source</th><th>Amt</th></tr></thead><tbody>';
                                _.each(aBudgets, function (budget, idx) {
                                    let budgetSrcLabel = budget[0];
                                    let budgetAmt = budget[1];
                                    budgetTotal += parseFloat(budgetAmt);
                                    budgetToolTip += '<tr><td class=\'hide-overflow\'>' + budgetSrcLabel + '</td><td>' + budgetAmt + '</td></tr>';
                                });
                                budgetToolTip += '</tbody><tfoot style=\'border-top:thin solid rgba(255, 255, 255, 0.5);\'>';
                                budgetToolTip += '<tr><td  style=\'text-align:right\'><strong>Total</strong></td><td>' + budgetTotal.toString() + '</td></tr>';
                                budgetToolTip += '</tfoot></table>';

                                project[sToolTipKey] = self.cleanForToolTip(budgetToolTip);
                            }
                            //console.groupEnd();
                        }

                        break;
                    case 'material_list_done':

                        if(project.material_needed_and_cost !== ''){
                            //console.group('material_list_done ' + project.ProjectID);
                            //console.log({project:project,oFieldCnts:oFieldCnts,oStatusEntryFields:oStatusEntryFields});
                            try {
                                //console.log('project.material_list_done', project.material_needed_and_cost);
                                let aTableRows = JSON.parse(project.material_needed_and_cost);
                                if (aTableRows.length) {
                                    //console.log({aTableRows:aTableRows})
                                    let materialsCostTotal = 0;
                                    let materialsToolTip = "<table class='last-row-remove-bottom-border tooltip-table table table-condensed'>";
                                    materialsToolTip += '<thead><tr><th style=\'width:75%;\'>Materials</th><th>Cost</th></tr></thead><tbody>';
                                    _.each(aTableRows,function(aRow,idx){
                                        //console.log({aRow:aRow})
                                        let material = aRow[0].replace(/"/,'&quot;');
                                        let cost = aRow[1].trim();
                                        if (cost === '') {
                                            cost = '&nbsp;'
                                        } else{
                                            materialsCostTotal += parseFloat(cost);
                                        }
                                        materialsToolTip += '<tr><td class=\'hide-overflow\'>' + material + '</td><td>' + cost + '</td></tr>';
                                    });

                                    materialsToolTip += '</tbody><tfoot style=\'border-top:thin solid rgba(255, 255, 255, 0.5);\'>';
                                    materialsToolTip += '<tr><td style=\'text-align:right\'><strong>Total Cost:</strong></td><td>' + materialsCostTotal.toString() + '</td></tr>';
                                    materialsToolTip += '</tfoot></table>';
                                    project[sToolTipKey] = self.cleanForToolTip(materialsToolTip);
                                } else {
                                    // set to blank so it matches its incompleteValue
                                    project.material_needed_and_cost = '';
                                }
                            } catch (e) {
                                // set to blank so it matches its incompleteValue
                                project.material_needed_and_cost = '';
                            }
                            //console.groupEnd();
                        }

                        break;
                }

                if(_.isUndefined(project[sStateKey])){
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
                                project[sToolTipKey] = self.cleanForToolTip(self.makeTitleFromFieldName(sStatusEntryField) + ' is empty.');
                            }
                        }
                    }
                }
                if (_.isUndefined(project[sToolTipKey])) {
                    if (sStatusEntryField !== null) {
                        project[sToolTipKey] = self.cleanForToolTip(project[sStatusEntryField]);
                    } else {
                        project[sToolTipKey] = self.cleanForToolTip(self.getYesNoOptionLabel(project[sFieldName]));
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
        getStatusManagementProjectModel: function(ProjectID) {
            // The project model in the allProjectsCollection does not have attribute default values set but we can use it to find the SiteStatusID
            let $oProjectModel = App.Collections.allProjectsCollection.get(parseInt(ProjectID));
            let $oSiteStatusManagementModel = App.Collections.statusManagementCollection.find({SiteStatusID: parseInt($oProjectModel.get('SiteStatusID'))});
            let projectModelData = _.find($oSiteStatusManagementModel.get('projects'),{ProjectID:parseInt(ProjectID)});
            return new App.Models.Project(projectModelData);
        },
        makeTitleFromFieldName: function(str) {
            if(str.match(/_/)){
                str = str.split(/_/).join(" ").replace(/^(.)|\s+(.)/g, function ($1) {
                    return $1.toUpperCase()
                });
            } else {
                str = str.split(/(?=[A-Z])/).join(" ")
            }

            return str;
        },
        setPopOverContent: function (e) {
            let self = this;
            let aOptions = [];
            let $icon = $(e.currentTarget);
            let $oModel = null;
            if ($icon.data('model-type') === 'project') {
                switch ($icon.data('field')) {
                    case 'cost_estimate_done':
                    case 'budget_allocation_done':
                    case 'material_list_done':
                    case 'volunteer_allocation_done':
                    case 'VolunteerEstimationComplete':
                    case 'VolunteerAssignmentComplete':
                    case 'ProjectDescriptionComplete':
                    case 'BudgetEstimationComplete':
                        aOptions = App.Models.projectModel.getYesNoOptions();
                        break;
                    case 'status':
                        aOptions = App.Models.projectModel.getStatusOptions();
                        break;
                    case 'project_send':
                        aOptions = App.Models.projectModel.getSendOptions();
                        break;
                }
                $oModel = self.getStatusManagementProjectModel($icon.data('id'));
            } else if ($icon.data('model-type') === 'sitestatus') {
                aOptions = App.Models.projectModel.getYesNoOptions();
                $oModel = App.Collections.statusManagementCollection.find({SiteStatusID: parseInt($icon.data('id'))});
            }
            //console.log('setPopOverContent',{oModel:$oModel,field:$icon.data('field'),modelFieldIsUndefined:_.isUndefined($oModel.get($icon.data('field'))),modelFieldIsNull:_.isNull($oModel.get($icon.data('field')))});
            // Remove the empty option if it exists
            if (typeof aOptions[0][''] !== 'undefined') {
                aOptions.shift();
            }
            let $popover = $icon.siblings('.popover');
            let popOverTitle = self.makeTitleFromFieldName($icon.data('field'));


            $popover.find('.popover-title').html('<strong>' + popOverTitle + '</strong>');
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
})(window.App);

(function (App) {
    App.Views.StatusRecordManagement = App.Views.Management.extend({
        attributes: {
            class: 'route-view box box-primary status-record-management-view'
        },
        template: template('statusRecordManagementTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(self, '_initialize', 'render', 'addOne', 'addAll', 'refreshCollection');
            this._initialize(options);
            self.listenTo(self, 'refresh-collection', self.refreshCollection);
            self.listenTo(self.collection, 'reset', self.addAll);
        },
        events: {},
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(self.template());
            self.addAll();

            return self;
        },
        refreshCollection: function () {
            let self = this;

            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            self.collection.url = self.getCollectionUrl();
            let growlMsg = '';
            let growlType = '';
            $.when(
                self.collection.fetch({
                    reset: true,
                    success: function (model, response, options) {
                        growlMsg = 'The statuses have been successfully refreshed';
                        growlType = 'success';
                    },
                    error: function (model, response, options) {

                        growlMsg = 'Sorry there was an error refreshing the statuses';
                        growlType = 'error';
                    }
                })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
        addOne: function (StatusRecord) {
            let self = this;
            if (StatusRecord.attributes.projects.length) {
                let $settingItem = new App.Views.StatusRecord({model: StatusRecord});
                self.$el.find('.status-record-management-wrapper').append($settingItem.render().el);
            }
        },
        addAll: function () {
            let self = this;
            self.$el.find('.status-record-management-wrapper').empty();

            self.collection.each(this.addOne);
            self.$el.find('[data-toggle="tooltip"]').siatooltip({html: true, sanitize: true});
            self.$el.find('[data-popover="true"]').popover({html: true, title: ''});
        }
    });
})(window.App);

(function (App) {
    App.Views.OptionGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        viewName: 'option-grid-manager-container-toolbar-view',
        template: template('optionGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'saveOptionList', 'addOption', 'toggleSaveBtn');
            } catch (e) {
                console.error(options, e);
            }
            // Required call for inherited class
            self._initialize(options);
            self._newOptionTemplate = '<tr id="<%= optionId %>">' +
                                      '    <td class="display-sequence">' +
                                      '        <span class="ui-icon ui-icon-arrowthick-2-n-s"></span>' +
                                      '        <input name="option[<%= id %>][DisplaySequence]"  data-id="<%= id %>" value="<%= DisplaySequence %>" readonly>' +
                                      '    </td>' +
                                      '    <td class="option-label">' +
                                      '        <input name="option[<%= id %>][<%= labelAttribute %>]" data-id="<%= id %>" value="">' +
                                      '        <span data-option-id="<%= optionId %>" class="ui-icon ui-icon-trash"></span>' +
                                      '    </td>' +
                                      '</tr>';
            self.listenTo(self.options.managedGridView, 'option-list-changed', self.toggleSaveBtn);
            _log('App.Views.OptionGridManagerContainerToolbar.initialize', options);
        },
        events: {
            'click .btnSave': 'saveOptionList',
            'click .btnAdd': 'addOption',
        },
        render: function () {
            let self = this;
            self._render();

            return self;
        },
        saveOptionList: function (e) {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            let data = {
                deletedOptionIds: self.options.managedGridView.deletedOptionIds,
                optionList: $('form[name="option"]').serialize()
            };

            let growlMsg = '';
            let growlType = '';
            $.when(
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: 'admin/option/list/' + self.options.managedGridView.options.optionType,
                    data: data,
                    success: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                        self.options.managedGridView.collection.url = self.managedGridView.getCollectionUrl(self.options.managedGridView.options.optionType);
                        $.when(
                            self.options.managedGridView.collection.fetch({reset: true})
                        ).then(function () {
                            //_log('App.Views.ProjectTab.destroy.event', self.options.tab + ' collection fetch promise done');
                        });
                    },
                    fail: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                    }
                })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
        addOption: function (e) {
            let self = this;
            let newOptionTemplate = _.template(self._newOptionTemplate);
            let id = _.uniqueId('new');
            let optionId = 'option_' + id;
            let aSorted = self.options.managedGridView.$sortableElement.sortable("toArray");
            let lastOptionId = _.last(aSorted);
            let lastDisplaySequence = self.options.managedGridView.$sortableElement.find('[name="option[' + lastOptionId.replace(/option_/, '') + '][DisplaySequence]"]').val();

            let DisplaySequence = parseInt(lastDisplaySequence) + 1;
            self.options.managedGridView.$sortableElement.append(newOptionTemplate({
                id: id,
                optionId: optionId,
                DisplaySequence: DisplaySequence,
                labelAttribute: self.options.managedGridView.labelAttribute
            }));
            self.options.managedGridView.$sortableElement.sortable("refresh");


        },
        toggleSaveBtn: function (e) {
            let self = this;

            let toggleState = 'enable';//selectedModels.length === 0 ? 'disable' : 'enable';
            _log(self.viewName + '.toggleSaveBtn.event', {e: e, toggleState: toggleState});
            //console.log({viewName: self.viewName, toggleState: toggleState})
            if (toggleState === 'disable') {
                self.$('.btnSave').addClass('disabled');
            } else {
                self.$('.btnSave').removeClass('disabled');
            }
        },
    });
})(window.App);

(function (App) {
    App.Views.Option = App.Views.Backend.extend({
        template: template('optionTemplate'),
        viewName: 'option-view',
        events: {
            'click .ui-icon-trash': 'delete'
        },
        initialize: function (options) {
            let self = this;

            try {
                _.bindAll(self, 'render', 'delete');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            self._initialize(options);
            self.listenTo(self.collection, 'reset', self.render);
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            self.$sortableElement = null;
            self.deletedOptionIds = [];
            self.optionIdAttribute = self.options.optionIdAttribute;
            self.labelAttribute = self.options.labelAttribute;
        },
        render: function (e) {
            let self = this;
            self.$el.html(self.template({
                idAttribute: self.optionIdAttribute,
                labelAttribute: self.labelAttribute,
                options: self.collection.models
            }));

            self.$sortableElement = self.$el.find('.table.options tbody');
            self.$sortableElement.sortable({
                axis: 'y',
                revert: true,
                delay: 150,
                update: function (event, ui) {
                    self.$sortableElement.sortable("refreshPositions");
                    let iSequence = 1;
                    self.$sortableElement.find('tr').each(function (idx, tr) {
                        let id = tr.id.replace(/option_/, '');
                        if (id !== '') {
                            //console.log({tr: tr,'tr.id': tr.id, 'data-id': id, idx: idx, iSequence: iSequence, label: $(tr).find('[name="option_label"]').val()});
                            self.$sortableElement.find('[name="option[' + id + '][DisplaySequence]"]').val(iSequence++);
                        }
                    });
                    self.trigger('option-list-changed');
                },
            });
            return self;
        },
        setGridManagerContainerToolbar: function ($gridManagerContainerToolbar) {
            let self = this;
            self.$gridManagerContainerToolbar = $gridManagerContainerToolbar;
        },
        delete: function (e) {
            let self = this;
            let $parentRow = $(e.currentTarget).parents('tr');
            let id = $parentRow.attr('id').replace(/option_/, '');
            let optionLabel = self.$sortableElement.find('[name="option[' + id + ']['+ self.labelAttribute+ ']"]').val();
            bootbox.confirm("Do you really want to delete this option: " + optionLabel + "?", function (bConfirmed) {
                if (bConfirmed) {

                    self.deletedOptionIds.push(id);
                    $parentRow.remove();
                    self.trigger('option-list-changed');
                }
            });
        }
    });
})(window.App);

(function (App) {
    App.Views.OptionManagement = App.Views.Management.extend({
        attributes: {
            class: 'route-view box box-primary option-management-view'
        },
        template: template('managementTemplate'),
        initialize: function (options) {
            let self = this;
            // try {
            //     _.bindAll(self, 'addSite', 'deleteSite');
            // } catch (e) {
            //     console.error(options, e)
            // }
            // Required call for inherited class
            this._initialize(options);

            self.optionIdAttribute = self.options.optionIdAttribute;
            self.labelAttribute = self.options.labelAttribute;

        },
        events: {

        },
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.modelNameLabel = self.options.modelNameLabel.replace(/_/g,' ').replace(/s$/,'');
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase().replace(/ /g,'-');
            self.$el.html(self.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            self.collection.url = self.getCollectionUrl(self.options.optionType);
            $.when(
                self.collection.fetch({reset:true})
            ).then(function () {
                let $option = new App.Views.Option({
                                        collection: self.collection,
                    optionType: self.options.optionType,
                    model: self.model,
                    modelNameLabel: self.modelNameLabel,
                    optionIdAttribute: self.optionIdAttribute,
                    labelAttribute: self.labelAttribute,
                    ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector
                });

                self.optionGridManagerContainerToolbar = new App.Views.OptionGridManagerContainerToolbar({
                    el: self.$('.grid-manager-container'),
                    parentView: self,

                    managedGridView: $option,
                    ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                    viewName: 'option-grid-manager-toolbar'
                });
                self.optionGridManagerContainerToolbar.render();
                self.childViews.push(self.optionGridManagerContainerToolbar);
                $option.setGridManagerContainerToolbar(self.optionGridManagerContainerToolbar);

                self.$('.backgrid-wrapper').html($option.render().el);
                self.childViews.push($option);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });

            return self;
        },

    });
})(window.App);

(function (App) {
    App.Views.AttributesGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        viewName: 'attributes-grid-manager-container-toolbar-view',
        template: template('listGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'saveList', 'addListItem', 'toggleSaveBtn');
            } catch (e) {
                console.error(options, e);
            }
            // Required call for inherited class
            self._initialize(options);
            self._newListItemTemplate = '<tr id="<%= listItemId %>">' +
                                        '<td class="display-sequence">' +
                                        '    <span class="ui-icon ui-icon-arrowthick-2-n-s"></span>' +
                                        '    <input class="list-item-input" name="list_item[<%= id %>][DisplaySequence]" data-id="<%= id %>" value="<%= DisplaySequence %>" readonly>' +
                                        '</td>' +
                                        '<td class="list-item-label required">' +
                                        '    <input required pattern="([a-z_]+)" class="list-item-input" name="list_item[<%= id %>][attribute_code]" data-id="<%= id %>" value="">' +
                                        '</td>' +
                                        '<td class="list-item-label required">' +
                                        '    <input required class="list-item-input" name="list_item[<%= id %>][<%= label %>]" data-id="<%= id %>" value="">' +
                                        '</td>' +
                                        '<td class="list-item-label">' +
                                        '    <input class="list-item-input" name="list_item[<%= id %>][default_value]" data-id="<%= id %>" value="">' +
                                        '</td>' +
                                        '<td class="list-item-label required">' +
                                        '    <input required class="list-item-input" name="list_item[<%= id %>][input]" data-id="<%= id %>" value="">' +
                                        '</td>' +
                                        '<td class="list-item-label required">' +
                                        '    <input required class="list-item-input" name="list_item[<%= id %>][table]" data-id="<%= id %>" value="">' +
                                        '</td>' +
                                        '<td class="list-item-label required">' +
                                        '    <input required pattern="[0,1]" class="list-item-input" name="list_item[<%= id %>][is_core]" data-id="<%= id %>" value="">' +
                                        '</td>' +
                                        '<td class="option-label">' +
                                        '    <span data-list-item-id="<%= listItemId %>" class="ui-icon ui-icon-trash"></span>' +
                                        '</td>' +
                                      '</tr>';
            self.listenTo(self.options.managedGridView, 'list-changed', self.toggleSaveBtn);
            _log('App.Views.AttributesGridManagerContainerToolbar.initialize', options);
        },
        events: {
            'click .btnSave': 'saveList',
            'click .btnAdd': 'addListItem',
        },
        render: function () {
            let self = this;
            self._render();

            return self;
        },
        /**
         * This is a little hack to use the browsers native form validation
         * @returns {boolean}
         */
        validateForm: function(){
            let self = this;
            let bIsValid = self.$form[0].checkValidity();

            if (!bIsValid) {
                self.$form.find('.list-item-input').on('invalid', function (e) {
                    self.options.managedGridView.flagAsInvalid(e);
                    $(this).off(e);
                });
                self.$form[0].reportValidity();
            }
            return bIsValid;
        },
        saveList: function (e) {
            let self = this;
            self.$form = self.options.managedGridView.$('form[name="list-items"]');
            if (!self.validateForm()){
                growl('Please fix form errors.', 'error');
                return;
            }
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            let data = {
                deletedListItemIds: self.options.managedGridView.deletedListItemIds,
                listItems: self.$form.serialize()
            };

            let growlMsg = '';
            let growlType = '';
            $.when(
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: 'admin/attributes/list/' + self.options.managedGridView.options.listItemType,
                    data: data,
                    success: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                        self.options.managedGridView.collection.url = self.managedGridView.getCollectionUrl(self.options.managedGridView.options.listItemType);
                        $.when(
                            self.options.managedGridView.collection.fetch({reset: true})
                        ).then(function () {

                        });
                    },
                    fail: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                    }
                })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
        addListItem: function (e) {
            let self = this;
            let newListItemTemplate = _.template(self._newListItemTemplate);
            let id = _.uniqueId('new');
            let listItemId = 'list_item_' + id;
            let aSorted = self.options.managedGridView.$sortableElement.sortable("toArray");
            let lastListItemId = _.last(aSorted);
            let lastDisplaySequence = self.options.managedGridView.$sortableElement.find('[name="list_item[' + lastListItemId.replace(/list_item_/, '') + '][DisplaySequence]"]').val();

            let DisplaySequence = parseInt(lastDisplaySequence) + 1;
            self.options.managedGridView.$sortableElement.append(newListItemTemplate({
                id: id,
                listItemId: listItemId,
                DisplaySequence: DisplaySequence,
                labelAttribute: self.options.managedGridView.labelAttribute
            }));
            self.options.managedGridView.$sortableElement.sortable("refresh");


        },
        toggleSaveBtn: function (e) {
            let self = this;

            let toggleState = 'enable';
            _log(self.viewName + '.toggleSaveBtn.event', {e: e, toggleState: toggleState});

            if (toggleState === 'disable') {
                self.$('.btnSave').addClass('disabled');
            } else {
                self.$('.btnSave').removeClass('disabled');
            }
        },
    });
})(window.App);

(function (App) {
    App.Views.Attributes = App.Views.Backend.extend({
        template: template('attributesListItemTemplate'),
        viewName: 'attributes-list-item-view',
        events: {
            'click .ui-icon-trash': 'delete',
            'change .list-item-input': 'listChanged',
            'invalid .list-item-input': 'flagAsInvalid',
        },
        initialize: function (options) {
            let self = this;

            try {
                _.bindAll(self, 'render', 'delete', 'listChanged', 'flagAsInvalid');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            self._initialize(options);
            self.listenTo(self.collection, 'reset', self.render);
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            self.$sortableElement = null;
            self.deletedListItemIds = [];
            self.modelIdAttribute = self.options.modelIdAttribute;
            self.labelAttribute = self.options.labelAttribute;
        },
        render: function (e) {
            let self = this;

            self.$el.html(self.template({
                idAttribute: self.modelIdAttribute,
                labelAttribute: self.labelAttribute,
                listItems: self.collection.models,
                highestSequenceNumber: self.getHighestSequenceNumber(),
                view: self
            }));

            self.$sortableElement = self.$el.find('.table.list-items tbody');
            self.$sortableElement.sortable({
                axis: 'y',
                revert: true,
                delay: 150,
                update: function (event, ui) {
                    self.$sortableElement.sortable("refreshPositions");
                    let iSequence = 1;
                    self.$sortableElement.find('tr').each(function (idx, tr) {
                        let id = tr.id.replace(/list_item_/, '');
                        if (id !== '') {
                            //console.log({tr: tr,'tr.id': tr.id, 'data-id': id, idx: idx, iSequence: iSequence, label: $(tr).find('[name="option_label"]').val()});
                            self.$sortableElement.find('[name="list_item[' + id + '][DisplaySequence]"]').val(iSequence++);
                        }
                    });
                    self.trigger('list-changed');
                },
            });

            return self;
        },
        getHighestSequenceNumber: function() {
            let self = this;
            let highest = 0;
            _.each(self.collection.models, function (val,idx) {
                if (val > highest){
                    highest = val;
                }
            });
            return highest;
        },
        setGridManagerContainerToolbar: function ($gridManagerContainerToolbar) {
            let self = this;
            self.$gridManagerContainerToolbar = $gridManagerContainerToolbar;
        },
        delete: function (e) {
            let self = this;
            let $parentRow = $(e.currentTarget).parents('tr');
            let id = $parentRow.attr('id').replace(/list_item_/, '');
            let listItemLabel = self.$sortableElement.find('[name="list_item[' + id + ']['+ self.labelAttribute+ ']"]').val();
            bootbox.confirm("Do you really want to delete this item: " + listItemLabel + "?", function (bConfirmed) {
                if (bConfirmed) {
                    self.deletedListItemIds.push(id);
                    $parentRow.remove();
                    self.trigger('list-changed');
                }
            });
        },
        listChanged: function (e) {
            let self = this;
            // FYI- If e is undefined it has probably been called from the underscore/backbone template
            self.trigger('list-changed');
        },
        flagAsInvalid: function (e) {
            let self = this;
            console.log('flagAsInvalid',{e:e, currentTarget:e.currentTarget})
            $(e.currentTarget).css('border-color','red');
        }
    });
})(window.App);

(function (App) {
    App.Views.AttributesManagement = App.Views.Management.extend({
        className: 'route-view box box-primary attributes-management-view',
        template: template('managementTemplate'),
        gridManagerContainerToolbarClass: App.Views.AttributesGridManagerContainerToolbar,
        initialize: function (options) {
            let self = this;
            // try {
            //     _.bindAll(self, '');
            // } catch (e) {
            //     console.error(options, e)
            // }
            // Required call for inherited class
            this._initialize(options);

            self.modelIdAttribute = self.options.modelIdAttribute;
            self.labelAttribute = self.options.labelAttribute;

        },
        events: {},
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.modelNameLabel = self.options.modelNameLabel.replace(/_/g, ' ').replace(/s$/, '');
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase().replace(/ /g, '-');
            self.$el.html(self.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            self.collection.url = self.getCollectionUrl(self.options.listItemType);
            $.when(
                self.collection.fetch({reset: true})
            ).then(function () {
                let $listItem = new App.Views.Attributes({
                    collection: self.collection,
                    listItemType: self.options.listItemType,
                    model: self.model,
                    modelNameLabel: self.modelNameLabel,
                    modelIdAttribute: self.modelIdAttribute,
                    labelAttribute: self.labelAttribute,
                    ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector
                });

                self.gridManagerContainerToolbar = new self.gridManagerContainerToolbarClass({
                    el: self.$('.grid-manager-container'),
                    parentView: self,
                    managedGridView: $listItem,
                    ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                });
                self.gridManagerContainerToolbar.render();
                self.childViews.push(self.gridManagerContainerToolbar);
                $listItem.setGridManagerContainerToolbar(self.gridManagerContainerToolbar);

                self.$('.backgrid-wrapper').html($listItem.render().el);
                self.childViews.push($listItem);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });

            return self;
        },

    });
})(window.App);

(function (App) {
    App.Views.ProjectAttributesGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        viewName: 'project-attributes-grid-manager-container-toolbar-view',
        template: template('listGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'saveList', 'addListItem', 'toggleSaveBtn');
            } catch (e) {
                console.error(options, e);
            }
            // Required call for inherited class
            self._initialize(options);
            self._newListItemTemplate = '<tr id="<%= listItemId %>">' +
                                        '<td class="list-item-label required">' +
                                        '    <select class="list-item-input" name="list_item[<%= id %>][attribute_id]" data-id="<%= id %>"><%= attributesOptions %></select>' +
                                        '</td>' +
                                        '<td class="list-item-label required">' +
                                        '    <select class="list-item-input" name="list_item[<%= id %>][workflow_id]" data-id="<%= id %>"><%= workflowOptions %></select>' +
                                        '</td>' +
                                        '<td class="list-item-label required">' +
                                        '    <select class="list-item-input" name="list_item[<%= id %>][workflow_requirement]" data-id="<%= id %>"><%= workflowRequirements %></select>' +
                                        '</td>' +
                                        '<td class="list-item-label required">' +
                                        '    <select class="list-item-input" name="list_item[<%= id %>][workflow_requirement_depends_on]" data-id="<%= id %>"><%= workflowRequirementsDependsOn %></select>' +
                                        '</td>' +
                                        '<td class="list-item-label required">' +
                                        '    <select class="list-item-input" name="list_item[<%= id %>][workflow_requirement_depends_on_condition]" data-id="<%= id %>"><%= workflowRequirementsDependsOnCondition %></select>' +
                                        '</td>' +
                                        '<td class="list-item-label">' +
                                        '    <select class="list-item-input" name="list_item[<%= id %>][project_skill_needed_option_id]" data-id="<%= id %>"><%= projectSkillNeededOptions %></select>' +
                                        '</td>' +
                                        '<td class="list-item-label">' +
                                        '    <span data-list-item-id="<%= listItemId %>" class="ui-icon ui-icon-trash"></span>' +
                                        '</td>' +
                                        '<td></td>' +
                                        '</table>';
            self.listenTo(self.options.managedGridView, 'list-changed', self.toggleSaveBtn);
            self.$form = self.options.managedGridView.$('form[name="list-items"]');

            _log('App.Views.ProjectAttributesGridManagerContainerToolbar.initialize', options);
        },
        events: {
            'click .btnSave': 'saveList',
            'click .btnAdd': 'addListItem'
        },
        render: function () {
            let self = this;
            self._render();

            return self;
        },
        /**
         * This is a little hack to use the browsers native form validation
         * @returns {boolean}
         */
        validateForm: function(){
            let self = this;
            let bIsValid = self.$form[0].checkValidity();

            if (!bIsValid) {
                self.$form.find('.list-item-input').on('invalid', function (e) {
                    self.options.managedGridView.flagAsInvalid(e);
                    $(this).off(e);
                });
                self.$form[0].reportValidity();
            }
            return bIsValid;
        },
        saveList: function (e) {
            let self = this;
            self.$form = self.options.managedGridView.$('form[name="list-items"]');
            if (!self.validateForm()){
                growl('Please fix form errors.', 'error');
                return;
            }
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            let data = {
                deletedListItemIds: self.options.managedGridView.deletedListItemIds,
                listItems: self.$form.serialize()
            };

            let growlMsg = '';
            let growlType = '';
            $.when(
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: 'admin/project_attributes/list/' + self.options.managedGridView.options.listItemType,
                    data: data,
                    success: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                        self.options.managedGridView.collection.url = self.managedGridView.getCollectionUrl(self.options.managedGridView.options.listItemType);
                        $.when(
                            self.options.managedGridView.collection.fetch({reset: true})
                        ).then(function () {

                        });
                    },
                    fail: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                    }
                })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
        addListItem: function (e) {
            let self = this;
            let newListItemTemplate = _.template(self._newListItemTemplate);
            let id = _.uniqueId('new');
            let listItemId = 'list_item_' + id;
            // do not allow the ability to set the skills needed attribute
            let aCurrentAttributeIds = [42];
            $('.list-items tr:not(.filtered) select[name$="[attribute_id]"]').each(function (idx,el) {
                aCurrentAttributeIds.push(parseInt($(el).val()));
            });

            self.options.managedGridView.$sortableElement.append(newListItemTemplate({
                id: id,
                listItemId: listItemId,
                labelAttribute: self.options.managedGridView.labelAttribute,
                attributesOptions: App.Collections.attributesManagementCollection.getTableOptions('projects', true),
                workflowOptions: App.Collections.workflowManagementCollection.getOptions(true),
                projectSkillNeededOptions: App.Models.projectModel.getSkillsNeededOptions(true, self.options.managedGridView.parentView.$('#ProjectTypesFilter').text())
            }));

            let $attributeId = self.options.managedGridView.$('[name="list_item[' + id + '][attribute_id]"]');
            $attributeId.find('option').each(function (idx, el) {
                //console.log({optionval: parseInt($(el).attr('value')),index: _.indexOf(aCurrentAttributeIds, parseInt($(el).attr('value')))});
                if (_.indexOf(aCurrentAttributeIds, parseInt($(el).attr('value')))!==-1){
                    $(el).remove()
                }
            });
            let $projectSkillNeededOptionId = self.options.managedGridView.$('[name="list_item[' + id + '][project_skill_needed_option_id]"]');
            $projectSkillNeededOptionId.val(self.options.managedGridView.parentView.$('#ProjectTypesFilter').val());
            $attributeId.trigger('change');
        },
        toggleSaveBtn: function (e) {
            let self = this;

            let toggleState = 'enable';
            _log(self.viewName + '.toggleSaveBtn.event', {e: e, toggleState: toggleState});

            if (toggleState === 'disable') {
                self.$('.btnSave').addClass('disabled');
            } else {
                self.$('.btnSave').removeClass('disabled');
            }
        },
    });
})(window.App);

(function (App) {
    App.Views.ProjectAttributes = App.Views.Backend.extend({
        template: template('projectAttributesListItemTemplate'),
        viewName: 'project-attributes-list-item-view',
        events: {
            'click .ui-icon-trash': 'delete',
            'change .list-item-input': 'listChanged',
            'change .list-item-input[name$="[workflow_requirement]"]': 'setWorkflowRequirementDependsOn',
            'change .list-item-input[name$="[workflow_requirement_depends_on]"]': 'setWorkflowRequirementDependsOnCond',
        },
        initialize: function (options) {
            let self = this;

            try {
                _.bindAll(self, 'render', 'delete', 'listChanged');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            self._initialize(options);
            self.listenTo(self.collection, 'reset', self.render);
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            self.$sortableElement = null;
            self.deletedListItemIds = [];
            self.modelIdAttribute = self.options.modelIdAttribute;
            self.labelAttribute = self.options.labelAttribute;
            self.projectAttributes = App.Collections.attributesManagementCollection.getTableOptions('projects', false);
            self.workflowRequirementsDependsOn = '<option data-is-core=\'0\' value=\'\'>N/A</option>' + App.Collections.attributesManagementCollection.getTableOptions('projects', true);
            self.workflowRequirementsDependsOnCondition = '';

        },
        render: function (e) {
            let self = this;

            self.$el.html(self.template({
                idAttribute: self.modelIdAttribute,
                labelAttribute: self.labelAttribute,
                listItems: self.collection.models,
                attributesOptions: App.Collections.attributesManagementCollection.getTableOptions('projects', true),
                workflowOptions: App.Collections.workflowManagementCollection.getOptions(true),
                projectSkillNeededOptions: App.Models.projectModel.getSkillsNeededOptions(true),
                workflowRequirements: App.Models.projectModel.getYesNoOptions(true, 'Yes') + "<option  value='3'>Yes, if depends on condition is met</option>",
                workflowRequirementsDependsOn:self.workflowRequirementsDependsOn,
                workflowRequirementsDependsOnCondition:self.workflowRequirementsDependsOnCondition,
                view: self
            }));

            let listItems= JSON.parse(JSON.stringify(self.collection.models));
            let listItemsCnt = listItems.length;
            for (let i = 0; i < listItemsCnt; i++) {
                let listItem = listItems[i];
                let id = listItem[self.modelIdAttribute];
                let $attributeId = self.$('[name="list_item[' + id + '][attribute_id]"]');
                let $workflowId = self.$('[name="list_item[' + id + '][workflow_id]"]');
                let $workflowRequirement = self.$('[name="list_item[' + id + '][workflow_requirement]"]');
                let $projectSkillNeededOptionId = self.$('[name="list_item[' + id + '][project_skill_needed_option_id]"]');

                $attributeId.val(listItem['attribute_id']);
                let $deleteBtn = $attributeId.parents('tr').find('.ui-icon-trash');
                let bIsCoreAttribute = $attributeId.find('option:selected').data('is-core');

                $workflowId.val(listItem['workflow_id']);


                // if (id===12) {
                //     console.log({
                //         listItem: listItem,
                //         id: id,
                //         $attributeId: $attributeId,
                //         'set attribute_id to': listItem['attribute_id'],
                //         $workflowId: $workflowId,
                //         $projectSkillNeededOptionId: $projectSkillNeededOptionId,
                //         $deleteBtn: $deleteBtn
                //     });
                // }
                $workflowRequirement.val(listItem['workflow_requirement']);
                if(!_.isNull(listItem['workflow_requirement_depends_on']) && listItem['workflow_requirement_depends_on'].toString().match(/^[\d]+$/)){
                    $workflowRequirement.data('depends-on',listItem['workflow_requirement_depends_on']);
                    $workflowRequirement.data('depends-on-cond',listItem['workflow_requirement_depends_on_condition']);
                }
                // show/hide/set depends on fields
                $workflowRequirement.trigger('change');

                $projectSkillNeededOptionId.val(listItem['project_skill_needed_option_id']);


                if (bIsCoreAttribute) {
                    $deleteBtn.hide();
                    $deleteBtn.parent().find('.msg').remove();
                    $deleteBtn.parent().append('<div class="msg">Core attributes are required.</div>');

                    $attributeId.attr('disabled', true);
                    $attributeId.after($('<input type="hidden" name="' + $attributeId.attr('name') + '" data-id="' + $attributeId.data('id') + '"/>').val($attributeId.val()));
                    $projectSkillNeededOptionId.attr('disabled', true);
                    $projectSkillNeededOptionId.hide();
                    $projectSkillNeededOptionId.parent().append('<div class="msg">Will be applied to every project type.</div>');
                    $projectSkillNeededOptionId.after($('<input type="hidden" name="' + $projectSkillNeededOptionId.attr('name') + '" data-id="' + $projectSkillNeededOptionId.data('id') + '"/>').val($projectSkillNeededOptionId.val()));
                } else {
                    // to simplify things, only let non core options be chosen for non-core project attribute selects
                    $attributeId.find('option').each(function (idx, el) {
                        if ($(el).data('is-core')) {
                            $(el).remove()
                        }
                    });
                }
            }
            self.$sortableElement = self.$el.find('.table.list-items tbody');
            self.parentView.filterList();

            return self;
        },
        setWorkflowRequirementDependsOn: function(e){
            let self = this;
            //console.log('setWorkflowRequirementDependsOn',{e:e});
            let $workflowRequirement = $(e.currentTarget);
            let id = $workflowRequirement.data('id');
            let workflowRequirementValue = $workflowRequirement.val();
            let $workflowRequirementDependsOn = self.$('select[name="list_item[' + id + '][workflow_requirement_depends_on]"]');
            let $workflowRequirementDependsOnCondition = self.$('[name="list_item[' + id + '][workflow_requirement_depends_on_condition]"]');
            //console.log('setWorkflowRequirementDependsOn',{id:id,workflowRequirementValue:workflowRequirementValue,e:e});
            //
            if(workflowRequirementValue === '3'){
                if (self.$('input[type="hidden"][name="list_item[' + id + '][workflow_requirement_depends_on]"]').length) {
                    self.$('input[type="hidden"][name="list_item[' + id + '][workflow_requirement_depends_on]"]').remove();
                }
                $workflowRequirementDependsOn.parent().find('.msg').remove();
                $workflowRequirementDependsOn.siblings('input[type="hidden"]').remove();
                $workflowRequirementDependsOn.removeAttr('disabled');
                $workflowRequirementDependsOn.val($workflowRequirement.data('depends-on'));
                $workflowRequirementDependsOn.data('depends-on-cond',$workflowRequirement.data('depends-on-cond'));
                $workflowRequirementDependsOn.show();
                $workflowRequirementDependsOn.trigger('change');
                //console.log('setWorkflowRequirementDependsOn',{depOnVal:$workflowRequirement.data('depends-on'),depOnCond:$workflowRequirement.data('depends-on-cond')});
            } else {
                $workflowRequirementDependsOn.val('');
                $workflowRequirementDependsOn.attr('disabled', true);
                $workflowRequirementDependsOn.hide();
                $workflowRequirementDependsOn.parent().find('.msg').remove();
                $workflowRequirementDependsOn.parent().append('<div class="msg">N/A</div>');
                if (!self.$('input[type="hidden"][name="list_item[' + id + '][workflow_requirement_depends_on]"]').length) {
                    $workflowRequirementDependsOn.after($('<input type="hidden" name="' + $workflowRequirementDependsOn.attr('name') + '" data-id="' + $workflowRequirementDependsOn.data('id') + '"/>').val($workflowRequirementDependsOn.val()));
                }

                let bIsHiddenInput = self.$('input[type="hidden"][name="list_item[' + id + '][workflow_requirement_depends_on_condition]"]').length;
                $workflowRequirementDependsOnCondition.val('');
                if (!bIsHiddenInput) {
                    $workflowRequirementDependsOnCondition.attr('disabled', true);
                    $workflowRequirementDependsOnCondition.hide();
                } else {
                    $workflowRequirementDependsOnCondition.removeAttr('disabled');
                    $workflowRequirementDependsOnCondition.show();
                }
                $workflowRequirementDependsOnCondition.parent().find('.msg').remove();
                $workflowRequirementDependsOnCondition.parent().append('<div class="msg">N/A</div>');
                if (!bIsHiddenInput) {
                    $workflowRequirementDependsOnCondition.after($('<input type="hidden" name="' + $workflowRequirementDependsOnCondition.attr('name') + '" data-id="' + $workflowRequirementDependsOnCondition.data('id') + '"/>').val($workflowRequirementDependsOnCondition.val()));
                    $workflowRequirementDependsOnCondition.remove();
                }

            }
            /**/
        },
        setWorkflowRequirementDependsOnCond: function(e){
            let self = this;
            let attributeOptionsSource = '';
            let attributeInputType = '';
            let $workflowRequirementDependsOn = $(e.currentTarget);

            let id = $workflowRequirementDependsOn.data('id');
            let workflowRequirementDependsOnValue = $workflowRequirementDependsOn.val() !== '' ? parseInt($workflowRequirementDependsOn.val()) : '';
            let workflowRequirementDependsOnCondValue = $workflowRequirementDependsOn.data('depends-on-cond');
            let $workflowRequirementDependsOnCondition = self.$('[name="list_item[' + id + '][workflow_requirement_depends_on_condition]"]');
            let currentTagType = $workflowRequirementDependsOnCondition[0].localName;
            let condition = '';
            $workflowRequirementDependsOnCondition.parent().find('.msg').remove();
            if (_.isNumber(workflowRequirementDependsOnValue)) {
                let attribute = App.Collections.attributesManagementCollection.get(parseInt(workflowRequirementDependsOnValue));
                attributeInputType = attribute.get('input');
                attributeOptionsSource = attribute.get('options_source');
            }
            let bRequiresSelectType = (attributeInputType === 'select' || attributeInputType === 'bool');
            if(bRequiresSelectType && currentTagType === 'input'){
                $workflowRequirementDependsOnCondition.hide();
                $workflowRequirementDependsOnCondition.after($('<select multiple name="' + $workflowRequirementDependsOnCondition.attr('name') + '" data-id="' + $workflowRequirementDependsOnCondition.data('id') + '"></select>'));
                $workflowRequirementDependsOnCondition.remove();
                $workflowRequirementDependsOnCondition = self.$('[name="list_item[' + id + '][workflow_requirement_depends_on_condition]"]');
                $workflowRequirementDependsOnCondition.empty();
            } else if (!bRequiresSelectType && currentTagType === 'select') {
                $workflowRequirementDependsOnCondition.hide();
                $workflowRequirementDependsOnCondition.after($('<input type="text" name="' + $workflowRequirementDependsOnCondition.attr('name') + '" data-id="' + $workflowRequirementDependsOnCondition.data('id') + '"/>'));
                $workflowRequirementDependsOnCondition.remove();
                $workflowRequirementDependsOnCondition = self.$('[name="list_item[' + id + '][workflow_requirement_depends_on_condition]"]');
            }
            if (!bRequiresSelectType) {
                $workflowRequirementDependsOnCondition.attr('type','text');
                $workflowRequirementDependsOnCondition.val(workflowRequirementDependsOnCondValue);
            } else {
                let selectOptions = {
                    bool: App.Models.projectModel.getYesNoOptions(true, workflowRequirementDependsOnCondValue),
                    permit_required_status_options: App.Models.projectModel.getPermitRequiredStatusOptions(true, workflowRequirementDependsOnCondValue),
                    permit_required_options: App.Models.projectModel.getPermitRequiredOptions(true, workflowRequirementDependsOnCondValue),
                    project_skill_needed_options: App.Models.projectModel.getSkillsNeededOptions(true, workflowRequirementDependsOnCondValue),
                    project_status_options: self.addNegativeOptions(App.Models.projectModel.getStatusOptions(false), workflowRequirementDependsOnCondValue),
                    send_status_options: App.Models.projectModel.getSendOptions(true, workflowRequirementDependsOnCondValue),
                    when_will_project_be_completed_options: App.Models.projectModel.getWhenWillProjectBeCompletedOptions(true, workflowRequirementDependsOnCondValue)
                };
                if(attributeInputType === 'bool'){
                    $workflowRequirementDependsOnCondition.append(selectOptions.bool);
                } else if(attributeInputType === 'select'){
                    $workflowRequirementDependsOnCondition.append(selectOptions[attributeOptionsSource]);
                    let bIsMultipleDefaults = workflowRequirementDependsOnCondValue.split(/,/).length > 1;
                    if(bIsMultipleDefaults){
                        _.each(workflowRequirementDependsOnCondValue.split(/,/), function(val,key){
                            $workflowRequirementDependsOnCondition.find('option[value="'+val+'"]').attr('selected','selected');
                        });
                    }

                }
            }
            // $workflowRequirementDependsOnCondition.after($('<input type="hidden" name="' + $workflowRequirementDependsOnCondition.attr('name') + '" data-id="' + $workflowRequirementDependsOnCondition.data('id') + '"/>').val($workflowRequirementDependsOnCondition.val()));
            // $workflowRequirementDependsOnCondition.remove();
            //$workflowRequirementDependsOnCondition.siblings('input[type="hidden"]').remove();
            $workflowRequirementDependsOnCondition.show();
            //console.log('setWorkflowRequirementDependsOnCond',{id:id,workflowRequirementDependsOnValue:workflowRequirementDependsOnValue,attributeInputType:attributeInputType,currentTagType:currentTagType,workflowRequirementDependsOnCondition:$workflowRequirementDependsOnCondition, e:e});
        },
        addNegativeOptions: function(options, defaultOption){
            let neg = [];
            _.each(options, function(val,key){
                neg.push(['Not '+val[0],'not '+val[1]]);
            });
            options = options.concat(neg);
            return _.map(options, function (value, key) {
                let bMatches = false;
                if (!_.isUndefined(defaultOption)&&!_.isNull(defaultOption)) {
                    let bIsMultipleDefaults = defaultOption.split(/,/).length > 1;
                    if (!bIsMultipleDefaults) {
                        if (!_.isNull(defaultOption) && (_.isNumber(defaultOption) || defaultOption.toString().match(/^[\d]+$/))) {
                            bMatches = parseInt(defaultOption) === parseInt(value[1]);
                        } else {
                            bMatches = defaultOption === value[0];
                        }
                    }
                }
                let selected = !_.isUndefined(defaultOption) && bMatches ? 'selected' : '';
                return "<option " + selected + " value='" + value[1] + "'>" + value[0] + "</option>";
            }).join('');
        },
        setGridManagerContainerToolbar: function ($gridManagerContainerToolbar) {
            let self = this;
            self.$gridManagerContainerToolbar = $gridManagerContainerToolbar;
        },
        delete: function (e) {
            let self = this;
            let $parentRow = $(e.currentTarget).parents('tr');
            let id = $parentRow.attr('id').replace(/list_item_/, '');

            bootbox.confirm("Do you really want to delete this item?", function (bConfirmed) {
                if (bConfirmed) {
                    self.deletedListItemIds.push(id);
                    $parentRow.remove();
                    self.trigger('list-changed');
                }
            });
        },
        listChanged: function (e) {
            let self = this;
            if ($(e.currentTarget).attr('name').match(/\[attribute_id\]$/)){
                // do not allow the ability to set the skills needed attribute
                let aCurrentAttributeIds = [42];
                // collect set attribute_ids
                $('.list-items tr:not(.filtered) select[name$="[attribute_id]"]').each(function (idx, el) {
                    if ($(el).attr('name') !== $(e.currentTarget).attr('name')) {
                        aCurrentAttributeIds.push(parseInt($(el).val()));
                    }
                });
                // do not allow duplicate attribute_ids
                if (_.indexOf(aCurrentAttributeIds, parseInt($(e.currentTarget).val())) !== -1) {
                    let $modelFound = self.collection.get($(e.currentTarget).data('id'));
                    // console.log({ctarget: $(e.currentTarget), $modelFound: $modelFound, models: self.collection.models})

                    if (!_.isUndefined($modelFound)) {
                        $(e.currentTarget).val($modelFound.get('attribute_id'));
                    }
                    growl('That attribute already is set. Please choose a different one.','warning');
                    return false;
                }
                let bIsCoreAttribute = $(e.currentTarget).find('option:selected').data('is-core');
                // console.log({currentTarget: e.currentTarget, bIsCoreAttribute: bIsCoreAttribute});
                let $projectSkillNeededOptionId = $(e.currentTarget).parents('tr').find('select[name$="[project_skill_needed_option_id]"]');
                let $deleteBtn = $(e.currentTarget).parents('tr').find('.ui-icon-trash');
                if (bIsCoreAttribute) {
                    // Do not allow core attributes to be deleted
                    $deleteBtn.hide();
                    $deleteBtn.parent().find('.msg').remove();
                    $deleteBtn.parent().append('<div class="msg">Core attributes are required.</div>');

                    $projectSkillNeededOptionId.attr('disabled', true);
                    $projectSkillNeededOptionId.hide();
                    $projectSkillNeededOptionId.parent().find('.msg').remove();
                    $projectSkillNeededOptionId.parent().append('<div class="msg">Core attributes are applied to every project type.</div>');
                    $projectSkillNeededOptionId.after($('<input type="hidden" name="' + $projectSkillNeededOptionId.attr('name') + '" data-id="' + $projectSkillNeededOptionId.data('id') + '"/>').val('*'));
                } else {
                    $deleteBtn.show();
                    $deleteBtn.parent().find('.msg').remove();
                    $projectSkillNeededOptionId.parent().find('.msg').remove();
                    $projectSkillNeededOptionId.removeAttr('disabled');
                    $projectSkillNeededOptionId.show();
                    $projectSkillNeededOptionId.siblings('input[type="hidden"][name="' + $projectSkillNeededOptionId.attr('name') + '"]').remove();
                }
            }
            // FYI- If e is undefined it has probably been called from the underscore/backbone template
            self.trigger('list-changed');
        }
    });
})(window.App);

(function (App) {
    App.Views.ProjectAttributesManagement = App.Views.Management.extend({
        className: 'route-view box box-primary project-attributes-management-view',
        template: template('managementTemplate'),
        gridManagerContainerToolbarClass: App.Views.ProjectAttributesGridManagerContainerToolbar,
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'filterList');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            this._initialize(options);

            self.modelIdAttribute = self.options.modelIdAttribute;
            self.labelAttribute = self.options.labelAttribute;

        },
        events: {'change #ProjectTypesFilter': 'filterList'},
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.modelNameLabel = self.options.modelNameLabel.replace(/_/g, ' ').replace(/s$/, '');
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase().replace(/ /g, '-');
            self.$el.html(self.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            self.collection.url = self.getCollectionUrl(self.options.listItemType);
            $.when(
                self.collection.fetch({reset: true})
            ).then(function () {
                let $listItem = new App.Views.ProjectAttributes({
                    collection: self.collection,
                    listItemType: self.options.listItemType,
                    model: self.model,
                    modelNameLabel: self.modelNameLabel,
                    modelIdAttribute: self.modelIdAttribute,
                    labelAttribute: self.labelAttribute,
                    ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                    parentView: self
                });

                self.gridManagerContainerToolbar = new self.gridManagerContainerToolbarClass({
                    el: self.$('.grid-manager-container'),
                    parentView: self,
                    managedGridView: $listItem,
                    ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                });
                self.gridManagerContainerToolbar.render();
                self.childViews.push(self.gridManagerContainerToolbar);
                $listItem.setGridManagerContainerToolbar(self.gridManagerContainerToolbar);

                self.$('.backgrid-wrapper').html($listItem.render().el);
                self.childViews.push($listItem);
                let $filter = $('<select id="ProjectTypesFilter" name="ProjectTypesFilter" class="site-management-selects form-control input-sm inline"></select>').html(App.Models.projectModel.getSkillsNeededOptions(true));
                self.$('h3.project-attributes-management.box-title').after($filter);
                self.filterList();
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });

            return self;
        },
        filterList: function (e) {
            let self = this;
            if (self.$('#ProjectTypesFilter').length) {
                let projectTypeId = self.$('#ProjectTypesFilter').val();
                self.$('.list-items > tbody > tr').addClass('filtered');
                self.$('.list-items').find('[name*="project_skill_needed_option_id"] option[value="' + projectTypeId + '"]:selected').parents('tr').removeClass('filtered');
            }
        },
    });
})(window.App);

(function (App) {
    App.Views.WorkflowGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        viewName: 'workflow-grid-manager-container-toolbar-view',
        template: template('listGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'saveList', 'addListItem', 'toggleSaveBtn');
            } catch (e) {
                console.error(options, e);
            }
            // Required call for inherited class
            self._initialize(options);
            self._newListItemTemplate = '<tr id="<%= listItemId %>">' +
                                      '    <td class="display-sequence">' +
                                      '        <span class="ui-icon ui-icon-arrowthick-2-n-s"></span>' +
                                      '        <input name="list_item[<%= id %>][DisplaySequence]"  data-id="<%= id %>" value="<%= DisplaySequence %>" readonly>' +
                                      '    </td>' +
                                      '    <td class="option-label">' +
                                      '        <input name="list_item[<%= id %>][<%= labelAttribute %>]" data-id="<%= id %>" value="">' +
                                      '        <span data-list-item-id="<%= listItemId %>" class="ui-icon ui-icon-trash"></span>' +
                                      '    </td>' +
                                      '</tr>';
            self.listenTo(self.options.managedGridView, 'list-changed', self.toggleSaveBtn);
            self.$form = self.options.managedGridView.$('form[name="list-items"]');
            _log('App.Views.WorkflowGridManagerContainerToolbar.initialize', options);
        },
        events: {
            'click .btnSave': 'saveList',
            'click .btnAdd': 'addListItem',
        },
        render: function () {
            let self = this;
            self._render();

            return self;
        },
        /**
         * This is a little hack to use the browsers native form validation
         * @returns {boolean}
         */
        validateForm: function(){
            let self = this;
            let bIsValid = self.$form[0].checkValidity();

            if (!bIsValid) {
                self.$form.find('.list-item-input').on('invalid', function (e) {
                    self.options.managedGridView.flagAsInvalid(e);
                    $(this).off(e);
                });
                self.$form[0].reportValidity();
            }
            return bIsValid;
        },
        saveList: function (e) {
            let self = this;
            self.$form = self.options.managedGridView.$('form[name="list-items"]');
            if (!self.validateForm()){
                growl('Please fix form errors.', 'error');
                return;
            }
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            let data = {
                deletedListItemIds: self.options.managedGridView.deletedListItemIds,
                listItems: self.$form.serialize()
            };

            let growlMsg = '';
            let growlType = '';
            $.when(
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: 'admin/workflow/list/' + self.options.managedGridView.options.listItemType,
                    data: data,
                    success: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                        self.options.managedGridView.collection.url = self.managedGridView.getCollectionUrl(self.options.managedGridView.options.listItemType);
                        $.when(
                            self.options.managedGridView.collection.fetch({reset: true})
                        ).then(function () {

                        });
                    },
                    fail: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                    }
                })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });
        },
        addListItem: function (e) {
            let self = this;
            let newListItemTemplate = _.template(self._newListItemTemplate);
            let id = _.uniqueId('new');
            let listItemId = 'list_item_' + id;
            let aSorted = self.options.managedGridView.$sortableElement.sortable("toArray");
            let lastListItemId = _.last(aSorted);
            let lastDisplaySequence = self.options.managedGridView.$sortableElement.find('[name="list_item[' + lastListItemId.replace(/list_item_/, '') + '][DisplaySequence]"]').val();

            let DisplaySequence = parseInt(lastDisplaySequence) + 1;
            self.options.managedGridView.$sortableElement.append(newListItemTemplate({
                id: id,
                listItemId: listItemId,
                DisplaySequence: DisplaySequence,
                labelAttribute: self.options.managedGridView.labelAttribute
            }));
            self.options.managedGridView.$sortableElement.sortable("refresh");


        },
        toggleSaveBtn: function (e) {
            let self = this;

            let toggleState = 'enable';
            _log(self.viewName + '.toggleSaveBtn.event', {e: e, toggleState: toggleState});

            if (toggleState === 'disable') {
                self.$('.btnSave').addClass('disabled');
            } else {
                self.$('.btnSave').removeClass('disabled');
            }
        },
    });
})(window.App);

(function (App) {
    App.Views.Workflow = App.Views.Backend.extend({
        template: template('listItemTemplate'),
        viewName: 'workflow-list-item-view',
        events: {
            'click .ui-icon-trash': 'delete',
            'change .list-item-input': 'listChanged',
        },
        initialize: function (options) {
            let self = this;

            try {
                _.bindAll(self, 'render', 'delete', 'listChanged');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            self._initialize(options);
            self.listenTo(self.collection, 'reset', self.render);
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            self.$sortableElement = null;
            self.deletedListItemIds = [];
            self.modelIdAttribute = self.options.modelIdAttribute;
            self.labelAttribute = self.options.labelAttribute;
        },
        render: function (e) {
            let self = this;
            self.$el.html(self.template({
                idAttribute: self.modelIdAttribute,
                labelAttribute: self.labelAttribute,
                listItems: self.collection.models,
                highestSequenceNumber: self.getHighestSequenceNumber(),
                view: self
            }));

            self.$sortableElement = self.$el.find('.table.list-items tbody');
            self.$sortableElement.sortable({
                axis: 'y',
                revert: true,
                delay: 150,
                update: function (event, ui) {
                    self.$sortableElement.sortable("refreshPositions");
                    let iSequence = 1;
                    self.$sortableElement.find('tr').each(function (idx, tr) {
                        let id = tr.id.replace(/list_item_/, '');
                        if (id !== '') {
                            //console.log({tr: tr,'tr.id': tr.id, 'data-id': id, idx: idx, iSequence: iSequence, label: $(tr).find('[name="'+ self.labelAttribute+ '"]').val()});
                            self.$sortableElement.find('[name="list_item[' + id + '][DisplaySequence]"]').val(iSequence++);
                        }
                    });
                    self.trigger('list-changed');
                },
            });
            return self;
        },
        getHighestSequenceNumber: function() {
            let self = this;
            let highest = 0;
            _.each(self.collection.models, function (val,idx) {
                if (val > highest){
                    highest = val;
                }
            });
            return highest;
        },
        setGridManagerContainerToolbar: function ($gridManagerContainerToolbar) {
            let self = this;
            self.$gridManagerContainerToolbar = $gridManagerContainerToolbar;
        },
        delete: function (e) {
            let self = this;
            let $parentRow = $(e.currentTarget).parents('tr');
            let id = $parentRow.attr('id').replace(/list_item_/, '');
            let listItemLabel = self.$sortableElement.find('[name="list_item[' + id + ']['+ self.labelAttribute+ ']"]').val();
            bootbox.confirm("Do you really want to delete this item: " + listItemLabel + "?", function (bConfirmed) {
                if (bConfirmed) {
                    self.deletedListItemIds.push(id);
                    $parentRow.remove();
                    self.trigger('list-changed');
                }
            });
        },
        listChanged: function (e) {
            let self = this;
            // FYI- If e is undefined it has probably been called from the underscore/backbone template
            self.trigger('list-changed');
        }
    });
})(window.App);

(function (App) {
    App.Views.WorkflowManagement = App.Views.Management.extend({
        className: 'route-view box box-primary workflow-management-view',
        template: template('managementTemplate'),
        gridManagerContainerToolbarClass: App.Views.WorkflowGridManagerContainerToolbar,
        initialize: function (options) {
            let self = this;
            // try {
            //     _.bindAll(self, '');
            // } catch (e) {
            //     console.error(options, e)
            // }
            // Required call for inherited class
            this._initialize(options);

            self.modelIdAttribute = self.options.modelIdAttribute;
            self.labelAttribute = self.options.labelAttribute;

        },
        events: {},
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.modelNameLabel = self.options.modelNameLabel.replace(/_/g, ' ').replace(/s$/, '');
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase().replace(/ /g, '-');
            self.$el.html(self.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            self.collection.url = self.getCollectionUrl(self.options.listItemType);
            $.when(
                self.collection.fetch({reset: true})
            ).then(function () {
                let $listItem = new App.Views.Workflow({
                    collection: self.collection,
                    listItemType: self.options.listItemType,
                    model: self.model,
                    modelNameLabel: self.modelNameLabel,
                    modelIdAttribute: self.modelIdAttribute,
                    labelAttribute: self.labelAttribute,
                    ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector
                });

                self.gridManagerContainerToolbar = new self.gridManagerContainerToolbarClass({
                    el: self.$('.grid-manager-container'),
                    parentView: self,
                    managedGridView: $listItem,
                    ajaxWaitingTargetClassSelector: self.ajaxWaitingTargetClassSelector,
                });
                self.gridManagerContainerToolbar.render();
                self.childViews.push(self.gridManagerContainerToolbar);
                $listItem.setGridManagerContainerToolbar(self.gridManagerContainerToolbar);

                self.$('.backgrid-wrapper').html($listItem.render().el);
                self.childViews.push($listItem);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });

            return self;
        },

    });
})(window.App);

(function (App) {
    App.Views.ProjectScopeGridManagerContainerToolbar = App.Views.GridManagerContainerToolbar.extend({
        viewName: 'project-scope-grid-manager-container-toolbar-view',
        template: template('projectScopeGridManagerContainerToolbarTemplate'),
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'save', 'toggleSaveBtn');
            } catch (e) {
                console.error(options, e);
            }
            // Required call for inherited class
            self._initialize(options);

            self.listenTo(self.options.managedGridView, 'changed', self.toggleSaveBtn);
            self.$form = self.options.managedGridView.$('form[name="projectScope"]');
            _log('App.Views.ProjectScopeGridManagerContainerToolbar.initialize', options);
        },
        events: {
            'click .btnSave': 'save'
        },
        render: function () {
            let self = this;
            self._render();

            return self;
        },
        /**
         * This is a little hack to use the browsers native form validation
         * @returns {boolean}
         */
        validateForm: function(){
            let self = this;
            let bIsValid = self.$form[0].checkValidity();

            if (!bIsValid) {
                self.$form.find('.list-item-input').on('invalid', function (e) {
                    self.options.managedGridView.flagAsInvalid(e);
                    $(this).off(e);
                });
                self.$form[0].reportValidity();
            }
            return bIsValid;
        },
        save: function (e) {
            let self = this;
            let model;
            self.$form = self.options.managedGridView.$('form[name="projectScope"]');

            if (!self.validateForm()){
                growl('Please fix form errors.', 'error');
                return;
            }
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            let data = $.unserialize(self.$form.serialize());

            if (self.options.managedGridView.bIsAddNew){
                model = new App.Models.ProjectScope();
                model.url = self.options.managedGridView.getModelUrl();
                data.SiteStatusID = self.getViewDataStore('current-site-status-id','project_scope_management');
                delete data.ProjectID;
            } else {
                model = self.options.managedGridView.model;
            }

            let growlMsg = '';
            let growlType = '';
            let newId = null;

            $.when(
                model.save(data,
                    {
                        success: function (model, response, options) {
                            _log('App.Views.ProjectScope.update', self.viewName + ' save', model, response, options);
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';

                            if (!_.isUndefined(response[model.idAttribute])){
                                newId = response[model.idAttribute];
                            }
                        },
                        error: function (model, response, options) {
                            console.error('App.Views.ProjectScope.update', self.viewName + ' save', model, response, options);
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                        }
                    })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                if (self.parentView.bReturnToProjectManagementView || self.options.managedGridView.bIsAddNew){
                    self.options.parentView.$el.hide();
                    let SiteStatusID = _.clone(self.getViewDataStore('current-site-status-id','project_scope_management'));
                    if (self.options.managedGridView.bIsAddNew) {
                        if (newId){
                            // set so it's chosen
                            self.setViewDataStoreValue('current-model-id', newId, 'projects');
                            self.setViewDataStoreValue('current-site-status-id', SiteStatusID, 'projects');
                            self.setViewDataStoreValue('current-model-id', newId, 'project_scope_management');
                        }

                        // remove storage data so it is not reloaded accidentally
                        //self.removeViewDataStore('project_scope_management');

                    }
                    window.location.href = '#/view/project/management';
                    //console.log(App.Views.mainApp.router.managementViews)
                    if (!_.isUndefined(App.Views.mainApp.router.managementViews['project_management'])) {
                        App.Views.mainApp.router.managementViews['project_management'].siteYearsDropdownView.trigger('site-status-id-change', {'SiteStatusID': SiteStatusID});
                    }
                } else if(self.parentView.bReturnToProjectStatusManagementView){
                    self.options.parentView.$el.hide();
                    window.location.href = '#/view/project/status';
                    if (!_.isUndefined(App.Views.mainApp.router.managementViews['project_status'])) {
                        App.Views.mainApp.router.managementViews['project_status'].trigger('refresh-collection');
                    }
                }
            });
        },
        toggleSaveBtn: function (e) {
            let self = this;

            let toggleState = 'enable';
            _log(self.viewName + '.toggleSaveBtn.event', {e: e, toggleState: toggleState});

            if (toggleState === 'disable') {
                self.$('.btnSave').addClass('disabled');
            } else {
                self.$('.btnSave').removeClass('disabled');
            }
        },
        disableSaveBtn: function(){
            let self = this;
            self.$('.btnSave').addClass('disabled');
        }
    });
})(window.App);

(function (App) {
    App.Views.ProjectScope = App.Views.Backend.extend({
        template: template('projectScopeTemplate'),
        viewName: 'project-scope-view',
        events: {
            'change input,textarea,select': 'formChanged',
            'click .admin__actions-switch': 'formChanged',
            'invalid .list-item-input': 'flagAsInvalid',
            'click [name^="primary_skill_needed"]': 'handleProjectTypeChange',
            'change [name="permit_required"]': 'handlePermitRequiredChange',
            'change [name="status"]': 'handleStatusChange',
            'click .add-material-needed-and-cost': 'addMaterialAndCostRow',
            'click .add-budget-source': 'addBudgetSourceRow',
            'click .calculate-total-from-material-cost': 'calculateFromMaterialAndCost',
            'click .add-project-attachment': 'clickFileUpload',
            'click .project-attachment-delete': 'deleteProjectAttachment',
            'click .email-project-report': 'emailProjectReport',
            'click .check-all-leadership': 'checkAllLeadership',
            'click [data-widget="custom-collapse"]': 'toggleCollapse',
            'click .workflow-status-display-progress-box .point': 'workflowScrollTo'
        },
        initialize: function (options) {
            let self = this;
            // delete from project_attributes_int where attribute_id in (16,17,22,23,24,31,32,33,34,38,41) and value = 0;
            try {
                _.bindAll(self,
                    'render',
                    'formChanged',
                    'handleProjectIDChange',
                    'handleProjectTypeChange',
                    'handlePermitRequiredChange',
                    'addMaterialAndCostRow',
                    'addBudgetSourceRow',
                    'calculateFromMaterialAndCost',
                    'saveProjectAttachments',
                    'clickFileUpload',
                    'deleteProjectAttachment',
                    'emailProjectReport',
                    'checkAllLeadership',
                    'workflowScrollTo');
            } catch (e) {
                console.error(options, e)
            }
            // Required call for inherited class
            self._initialize(options);
            // <i class="fas fa-tasks"></i>
            // <i class="fas fa-exclamation-triangle"></i>
            // <i class="far fa-check-circle"></i>
            self.bUpdatingProjectWorkflow = false;
            self.workflowState = {};
            self.currentProjectTypes = null;
            self.workflowStatusLabelWaitingClass = 'label-default';
            self.workflowStatusLabelNotFinishClass = 'label-warning';
            self.workflowStatusLabelLateClass = 'label-danger';
            self.workflowStatusLabelDoneClass = 'label-success';
            self.defaultWorkflowStatusLabelClass = self.workflowStatusLabelWaitingClass;

            self.workflowStatusIconNotFinishClass = 'fa-tasks';
            self.workflowStatusIconLateClass = 'fa-exclamation-triangle';
            self.workflowStatusIconDoneClass = 'fa-check-circle';
            self.defaultWorkflowStatusIconClass = self.workflowStatusIconNotFinishClass;

            self.bIsAddNew = false;
            self.bDoneLoadingForm = false;
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
            self.sitesDropdownView = self.options.parentView.sitesDropdownView;
            self.projectsDropDownView = self.options.parentView.projectsDropDownView;
            self.listenTo(self.projectsDropDownView, "project-id-change", self.handleProjectIDChange);
            self.workflowOptions = JSON.parse(JSON.stringify(App.Collections.workflowManagementCollection.getOptions(false)));
            self.initialWorkflowId = self.workflowOptions[0].id;
            self.initialWorkflowCode = self.workflowOptions[0].workflow_code;
            self.initialWorkflowLabel = self.workflowOptions[0].label;
            self.initialWorkflowStatusLabelClass = self.workflowStatusLabelNotFinishClass;
            self.projectAttributes = JSON.parse(JSON.stringify(App.Collections.projectAttributesManagementCollection));
            self.attributesOptions = JSON.parse(JSON.stringify(App.Collections.attributesManagementCollection.getTableOptions('projects', false)));
            //console.log({attributesOptions: self.attributesOptions})
            self.aCurrentProjectTypeAttributes = [];
            self.projectAttributeWorkflowIds = {};
            // for(let i = 1; i <= self.workflowOptions.length; i++){
            //     self.projectAttributes = self.projectAttributes.concat(JSON.parse(JSON.stringify(App.Collections.projectAttributesManagementCollection.where({workflow_id: i}))));
            // }
            self.workflowRequirementsConfig = {};
            self.setProjectWorkflowConfig();
            self.attributesOptionsCnt = self.attributesOptions.length;

            self.selectOptions = {
                yesNoIsActiveOptions: App.Models.projectModel.getYesNoOptions(true, 'Yes'),
                bool: '',
                permit_required_status_options: App.Models.projectModel.getPermitRequiredStatusOptions(true),
                permit_required_options: App.Models.projectModel.getPermitRequiredOptions(true),
                project_skill_needed_options: App.Models.projectModel.getSkillsNeededOptions(true),
                project_status_options: App.Models.projectModel.getStatusOptions(true, 'Pending'),
                send_status_options: App.Models.projectModel.getSendOptions(true),
                when_will_project_be_completed_options: App.Models.projectModel.getWhenWillProjectBeCompletedOptions(true)
            };
            self.projectScopeContacts = [];
            self.projectScopeTeam = [];

        },
        toggleCollapse: function (e) {
            let self = this;
            e.preventDefault();
            let $btn = $(e.currentTarget);
            let $icon = $btn.find('i');
            $($btn.data('target')).toggle();

            if ($icon.hasClass('fa-plus')) {
                $icon.removeClass('fa-plus').addClass('fa-minus');
            } else {
                $icon.removeClass('fa-minus').addClass('fa-plus');
            }
        },
        workflowScrollTo: function (e) {
            let self = this;
            e.preventDefault();
            let workflowId = $(e.currentTarget).index();
            var position = $('fieldset[data-workflow-id="' + workflowId + '"]').offset().top;

            $("body, html").animate({
                scrollTop: position
            } /* speed */);

        },
        initWorkflowDisplay: function () {
            let self = this;
            var $boxOne = self.$('.workflow-status-display .workflow-status-display-progress-box');
            let $progressBox = $boxOne.find('.wf-progress');
            _.each(self.workflowOptions, function (workflow, idx) {
                if (!$progressBox.find('.point[data-workflow-id="' + workflow.id + '"]').length) {
                    // <i class="fas fa-exclamation-triangle"></i>
                    // exclamation-circle <i class="fas fa-exclamation-circle"></i>
                    // <i class="far fa-check-circle"></i>
                    let pointActive = 'point--active';
                    let pointComplete = 'point--complete';
                    let pointClasses = '';
                    let str = '<div data-workflow-id="' + workflow.id + '" data-workflow-code="' + workflow.workflow_code + '" class="point ' + pointClasses + '">' +
                        '    <div class="bullet"></div>' +
                        '    <label class="wf-label">' + workflow.label + '</label>' +
                        '</div>';

                    $progressBox.append($(str));
                }
            });
        },
        updateWorkflowDisplay: function () {
            let self = this;
            let $display = self.$('.workflow-status-display-progress-box');
            let $points = $display.find('.point');
            //console.log({$display:$display,$points:$points})

            $points.each(function (idx, el) {
                let workflowIdx = idx + 1;
                let $point = $(el);
                let $workflowFieldset = self.$('[data-workflow-id="' + workflowIdx + '"]');
                let $statusLabel = $workflowFieldset.find('legend .workflow-status-label');
                let $statusIcon = $workflowFieldset.find('legend .workflow-status-label i');
                let $btn = $workflowFieldset.find('legend .btn');
                $point.removeClass('point--active point--complete point--late');
                let statusRemoveAllClasses = self.workflowStatusLabelWaitingClass + ' ' + self.workflowStatusLabelLateClass + ' ' + self.workflowStatusLabelNotFinishClass;
                let iconRemoveAllClasses = self.workflowStatusIconNotFinishClass + ' ' + self.workflowStatusIconLateClass + ' ' + self.workflowStatusIconDoneClass;
                let iconRemoveClasses = self.workflowStatusIconNotFinishClass + ' ' + self.workflowStatusIconDoneClass;

                if (self.workflowState[workflowIdx].complete === true) {
                    let btn = '<button type="button" class="pull-right btn btn-box-tool" data-target="#workflow-attributes-group-content-' + workflowIdx + '"' +
                        '                                                data-widget="custom-collapse" title="Show/Hide form elements"><i class="fa fa-plus"></i></button>';
                    $statusLabel.attr('title','All Required Completed.');
                    $point.addClass('point--complete');
                    if (!$btn.length) {
                        $statusLabel.after(btn);
                    }
                    $statusIcon.removeClass(iconRemoveAllClasses);
                    $statusLabel.removeClass(statusRemoveAllClasses);
                    $statusLabel.addClass(self.workflowStatusLabelDoneClass);
                    $statusIcon.addClass(self.workflowStatusIconDoneClass);
                    // only hide if the user isn't working on the form
                    let $saveBtn = self.parentView.gridManagerContainerToolbar.$('.btnSave');
                    if ($saveBtn.hasClass('disabled')) {
                        $workflowFieldset.find('.workflow-attributes-group-content').hide();
                    }
                } else {
                    $statusIcon.removeClass(iconRemoveClasses);
                    if (self.workflowState[workflowIdx].in_progress === true) {
                        $point.addClass('point--active');
                        $statusLabel.attr('title','In Progress.');
                        $statusLabel.removeClass(statusRemoveAllClasses);
                        $statusLabel.addClass(self.workflowStatusLabelNotFinishClass);
                        $statusIcon.addClass(self.workflowStatusIconNotFinishClass);
                        $workflowFieldset.find('input,textarea,select').prop('disabled', false).removeAttr('disabled');
                        $workflowFieldset.find('.workflow-attributes-group-content').show();
                    } else {
                        $point.removeClass('point--active');
                        $statusLabel.attr('title','Waiting for previous steps to be completed.');
                        $statusLabel.removeClass(statusRemoveAllClasses);
                        $statusLabel.addClass(self.workflowStatusLabelWaitingClass);
                        $statusIcon.addClass(self.workflowStatusIconNotFinishClass);
                        $workflowFieldset.find('input,textarea,select').prop('disabled', true).attr('disabled', 'disabled');
                        $workflowFieldset.find('.workflow-attributes-group-content').hide();
                    }
                    if (self.workflowState[workflowIdx].late === true) {
                        $point.addClass('point--late');
                        $statusLabel.attr('title',$statusLabel.attr('title') + ' These tasks are behind schedule! Please finish A.S.A.P.');
                        $statusLabel.removeClass(statusRemoveAllClasses);
                        $statusLabel.addClass(self.workflowStatusLabelLateClass);
                        $statusIcon.removeClass(iconRemoveAllClasses);
                        $statusIcon.addClass(self.workflowStatusIconLateClass);
                    }
                }
                //console.log('point',{idx:idx,el:el,workflowState:self.workflowState[workflowIdx]})
            });

            let getTotalPoints = $points.length,
                getCompleteIndex = $display.find('.point--active').index(),
                barWidth = (getCompleteIndex - 1) / (getTotalPoints - 1) * 100 + '%';


            $display.find('.bar__fill').css('width', barWidth);

        },
        getAttributeFormElementName: function (attributeCode) {
            let self = this;
            let name = '';
            let result = App.Collections.attributesManagementCollection.where({attribute_code: attributeCode});
            let attribute = result[0];
            if (attribute.get('input') === 'table' && attributeCode === 'material_needed_and_cost') {
                name = 'material_needed_and_cost[material][]'
            } else if (attribute.get('input') === 'table' && attributeCode === 'budget_sources') {
                name = 'budget_sources[source][]'
            } else if (attribute.get('input') === 'bool' || attribute.get('input') === 'checkbox') {
                name = attributeCode + '[]';
            } else {
                name = attributeCode;
            }
            _log('App.Views.ProjectScope.getAttributeFormElementName',{attributeCode:attributeCode,name:name})
            return name;
        },
        getAttributeFormElementValue: function ($el) {

            let value = '';
            if ($el.length) {
                let elementType = $el[0].type;
                if($el.attr('name').match(/budget_sources/)) {
                    //console.log('getAttributeFormElementValue budget_sources',{$el:$el})
                    let partials = 0;
                    value = [];
                    $el.each(function(idx,el){
                        //console.log({idx:idx, name:$(el).attr('name'),val:$(el).val()})
                        let budgetSource = $(el).val();
                        let amount = $('#budget_sources_amount_'+idx).val();
                        let status = $('#budget_sources_status_'+idx).val();
                        if(budgetSource !== '' && amount !== ''&& status !== ''){
                            value.push(budgetSource + ' ' + amount + ' ' + status);
                        } else if(budgetSource === '' && amount === ''&& status === ''){
                            // do nothing
                        }else if(budgetSource !== '' || amount !== '' || status !== ''){
                            partials++;
                        }
                    });
                    // It's either all or nothing...
                    if(partials>0){
                        value = [];
                    }
                } else if($el.attr('name').match(/material_needed_and_cost/)) {
                    //console.log('getAttributeFormElementValue material_needed_and_cost',{$el:$el});
                    let partials = 0;
                    value = [];
                    $el.each(function(idx,el){
                        let material = $(el).val();
                        let cost = $('#material_needed_and_cost_cost_'+idx).val();
                        if(material !== '' && cost !== ''){
                            value.push(material + ' ' + cost);
                        } else if(material === '' && cost === ''){
                            // do nothing
                        }else if(material !== '' || cost !== ''){
                            partials++;
                        }
                        //console.log({idx:idx, name:$(el).attr('name'),val:$(el).val()})
                    });
                    // It's either all or nothing...
                    if(partials>0){
                        value = [];
                    }
                }
                else if (elementType === 'checkbox') {
                    let $checkedBoxes = $('[name="' + $el.attr('name') + '"]:checked');
                    if ($checkedBoxes.length) {
                        value = [];
                        $checkedBoxes.each(function (idx, box) {
                            value.push($(box).val());
                        });
                    }
                } else if (elementType === 'radio') {
                    let $checkedRadio = $('[name="' + $el.attr('name') + '"]:checked');
                    if ($checkedRadio.length) {
                        value = $checkedRadio.val();
                    }
                } else if (elementType === 'select') {
                    value = $el.val();
                } else {
                    value = $el.val();
                }
            }
            _log('App.Views.ProjectScope.getAttributeFormElementValue',{$el:$el,value:value});
            return value;
        },
        getAttributeMeetsWorkflowRequirement: function (workflowId, attributeId, bUseForm, dependentOn, dependentOnCond) {
            let self = this;
            let bMeetsRequirement = false;
            let attribute = App.Collections.attributesManagementCollection.get(parseInt(attributeId));
            let attributeCode = attribute.get('attribute_code');
            let attributeValue;
            let bIsDependent = !_.isNull(dependentOn) && !_.isUndefined(dependentOn);
            if (bIsDependent) {
                let bIsRequired = true;
                let dependsOnAttribute = App.Collections.attributesManagementCollection.get(parseInt(dependentOn));
                //console.log({dependentOn:dependentOn,dependsOnAttribute:dependsOnAttribute})

                let dependsOnAttributeInputType = dependsOnAttribute.get('input');
                let bIsSelectType = (dependsOnAttributeInputType === 'select' || dependsOnAttributeInputType === 'bool');
                let dependsOnAttributeCode = dependsOnAttribute.get('attribute_code');
                let dependsOnAttributeValue;

                if (bUseForm) {
                    bIsRequired = self.getAttributeIsWorkflowRequirement(parseInt(attributeId));

                    if (bIsRequired) {
                        attributeValue = self.getAttributeFormElementValue($('[name="' + self.getAttributeFormElementName(attributeCode) + '"]'));
                        bMeetsRequirement = !_.isEmpty(attributeValue.toString());
                        _log('App.Views.ProjectScope.getAttributeMeetsWorkflowRequirement',{workflowId:workflowId,bUseForm:bUseForm,attributeCode:attributeCode,attributeValue:attributeValue,dependentOn:dependentOn,dependsOnAttribute:dependsOnAttribute,dependentOnCond:dependentOnCond,bMeetsRequirement:bMeetsRequirement})
                    } else {
                        bMeetsRequirement = true;
                    }
                } else {
                    attributeValue = self.model.get(attributeCode);
                    dependsOnAttributeValue = self.model.get(dependsOnAttributeCode);
                    if (bIsSelectType) {
                        _.each(dependentOnCond.split(/,/), function (val, key) {
                            if (val.match(/^not/)) {
                                let optionVal = val.replace(/^not /, '');
                                if (dependsOnAttributeValue.toString() === optionVal) {
                                    bIsRequired = false;
                                }
                            } else {
                                if (dependsOnAttributeValue.toString() !== val) {
                                    bIsRequired = false;
                                }

                            }
                        });
                        if (bIsRequired) {
                            bMeetsRequirement = !_.isEmpty(attributeValue.toString());
                        } else {
                            bMeetsRequirement = true;
                        }
                    } else {
                        bIsRequired = dependsOnAttributeValue === dependentOnCond;
                        if (bIsRequired) {
                            bMeetsRequirement = !_.isEmpty(attributeValue.toString());
                        } else {
                            bMeetsRequirement = true;
                        }
                    }

                    //console.log({bMeetsRequirement:bMeetsRequirement,workflowId:workflowId,attribute_code:attributeCode,attributeValue:attributeValue,dependentOnCond:dependentOnCond})
                }
            } else {

                if (bUseForm) {
                    attributeValue = self.getAttributeFormElementValue($('[name="' + self.getAttributeFormElementName(attributeCode) + '"]'));
                } else {

                    attributeValue = self.model.get(attributeCode);

                    //console.log({bMeetsRequirement:bMeetsRequirement,workflowId:workflowId,attribute_code:attributeCode,value:value,isNull:_.isNull(value),isUndef:_.isUndefined(value)})
                }
                bMeetsRequirement = !_.isEmpty(attributeValue.toString());
                _log('App.Views.ProjectScope.getAttributeMeetsWorkflowRequirement',{workflowId:workflowId,bUseForm:bUseForm,attributeCode:attributeCode,attributeValue:attributeValue,bMeetsRequirement:bMeetsRequirement})
            }


            return bMeetsRequirement;
        },
        updateProjectWorkflowState: function (bUseForm = true) {
            let self = this;
            if (self.bUpdatingProjectWorkflow) {
                console.log('skipping update b/c of race cond')
                return;
            }
            self.bUpdatingProjectWorkflow = true;
            let req = self.getApplicableWorkflowRequirements();
            _log('App.Views.ProjectScope.updateProjectWorkflowState',{bUseForm:bUseForm,model:self.model,formData:$.unserialize($('[name="projectScope"]').serialize()),applicableRequirements:req})

            self.workflowState = {};
            let lastCompleted = false;
            let foundInProgress = false;
            _.each(self.workflowOptions, function (wfOption, idx) {
                let bComplete = true;
                let workflowId = wfOption.id;
                let incomplete = [];
                _.each(req.requirements[workflowId], function (reqData, key) {
                    if (!self.getAttributeMeetsWorkflowRequirement(workflowId, reqData.attribute_id, bUseForm)) {
                        bComplete = false;
                        incomplete.push(reqData.attribute_id)
                    }
                });
                _.each(req.dependents[workflowId], function (reqData, key) {
                    if (!self.getAttributeMeetsWorkflowRequirement(workflowId, reqData.attribute_id, bUseForm, reqData.workflow_requirement_depends_on, reqData.workflow_requirement_depends_on_condition)) {
                        bComplete = false;
                        incomplete.push(reqData.attribute_id)
                    }
                });
                if (_.isUndefined(self.workflowState[workflowId])) {
                    self.workflowState[workflowId] = {complete: false, in_progress: false, late: false};
                }
                self.workflowState[workflowId].complete = bComplete;
                self.workflowState[workflowId].incomplete = incomplete;
                if (foundInProgress === false && !bComplete) {
                    self.workflowState[workflowId].in_progress = true;
                    foundInProgress = true;
                }
                lastCompleted = bComplete;
            });
            _log('App.Views.ProjectScope.updateProjectWorkflowState', {workflowState:self.workflowState});
            self.updateWorkflowDisplay();
            self.bUpdatingProjectWorkflow = false;
        },
        getApplicableWorkflowRequirements: function () {
            let self = this;

            let applicableRequirements = {};
            let applicableDependents = {};

            _.each(self.workflowRequirementsConfig.requirements, function (projectTypeRequirements, workflowId) {
                if (_.isUndefined(applicableRequirements[workflowId])) {
                    applicableRequirements[workflowId] = [];
                }
                _.each(self.currentProjectTypes, function (projectTypeId, key) {
                    _.each(projectTypeRequirements[projectTypeId], function (reqData, key) {
                        if (!_.where(applicableRequirements[workflowId], {attribute_id: reqData.attribute_id}).length) {
                            applicableRequirements[workflowId].push(reqData);
                        }
                    })
                });

            });
            _.each(self.workflowRequirementsConfig.dependents, function (projectTypeRequirements, workflowId) {
                if (_.isUndefined(applicableDependents[workflowId])) {
                    applicableDependents[workflowId] = [];
                }
                _.each(self.currentProjectTypes, function (projectTypeId, key) {
                    _.each(projectTypeRequirements[projectTypeId], function (reqData, key) {
                        if (!_.where(applicableDependents[workflowId], {attribute_id: reqData.attribute_id}).length) {
                            applicableDependents[workflowId].push(reqData);
                        }
                    })
                });

            });
            _log('App.Views.ProjectScope.getApplicableWorkflowRequirements', {
                workflowRequirementsConfig: self.workflowRequirementsConfig,
                currentProjectTypes: self.currentProjectTypes,
                requirements: applicableRequirements,
                dependents: applicableDependents
            });
            //console.log({applicableRequirements:applicableRequirements,applicableDependents:applicableDependents})
            return {requirements: applicableRequirements, dependents: applicableDependents};
        },
        setProjectWorkflowConfig: function () {
            let self = this;

            let aSkillIds = App.Models.projectModel.getSkillsNeededIdList();
            let workflowRequirements = {};
            let workflowDependsOn = {};
            _.each(self.workflowOptions, function (wfOption, idx) {
                let workflowId = wfOption.id;
                _.each(aSkillIds, function (aSkill, idx) {
                    let skillId = parseInt(aSkill.id);
                    if (_.isUndefined(workflowRequirements[workflowId])) {
                        workflowRequirements[workflowId] = {};
                    }
                    if (_.isUndefined(workflowRequirements[workflowId][aSkill.id])) {
                        workflowRequirements[workflowId][aSkill.id] = [];
                    }
                    workflowRequirements[workflowId][aSkill.id] = _.where(self.projectAttributes, {
                        workflow_id: workflowId,
                        workflow_requirement: 1,
                        project_skill_needed_option_id: skillId
                    });

                    if (_.isUndefined(workflowDependsOn[workflowId])) {
                        workflowDependsOn[workflowId] = {};
                    }
                    if (_.isUndefined(workflowDependsOn[workflowId][aSkill.id])) {
                        workflowDependsOn[workflowId][aSkill.id] = [];
                    }
                    workflowDependsOn[workflowId][aSkill.id] = _.where(self.projectAttributes, {
                        workflow_id: workflowId,
                        workflow_requirement: 3,
                        project_skill_needed_option_id: skillId
                    });
                })

            });

            self.workflowRequirementsConfig = {requirements: workflowRequirements, dependents: workflowDependsOn};
            //console.log('setProjectWorkflowConfig',{workflowRequirementsConfig:self.workflowRequirementsConfig,workflowRequirements:workflowRequirements,workflowDependsOn:workflowDependsOn})
        },
        formChanged: function () {
            let self = this;
            if (self.bDoneLoadingForm && !self.bUpdatingProjectWorkflow) {
                self.trigger('changed');
                //console.log('formChanged run updateProjectWorkflowState()')
                self.updateProjectWorkflowState();
            }
        },
        handleStatusChange: function (e) {
            let self = this;
            let status = parseInt(self.$('[name="status"]').val());

            if (status === App.Vars.selectOptions['ProjectStatusOptions']['Approved'] || status === App.Vars.selectOptions['ProjectStatusOptions']['Pending']) {
                self.$('[name="status_reason"]').val('').parents('.dynamic').addClass('hide');
            } else {
                self.$('[name="status_reason"]').parents('.dynamic').removeClass('hide');
            }
        },
        handleProjectIDChange: function (e) {
            let self = this;
            self.model.set('ProjectID', e.ProjectID);
            self.bDoneLoadingForm = false;
            if (e.ProjectID === 'new') {
                self.bIsAddNew = true;
            }
            //console.log('handleProjectIDChange',{bIsAddNew:self.bIsAddNew,e:e})
            self.render(e);
        },
        setCurrentProjectTypes: function (bUseCurrentForm = false) {
            let self = this;
            if (bUseCurrentForm) {
                let $checked = self.$('[name^="primary_skill_needed"]:checked');
                if ($checked.length === 0) {
                    alert('There needs to be at least one Project Type. Defaulting to General');
                    self.$('#primary_skill_needed_' + App.Vars.selectOptions['ProjectSkillNeededOptions']['General']).prop('checked', true);

                    $checked = self.$('[name^="primary_skill_needed"]:checked');
                }
                let aIds = [];
                $checked.each(function (idx, el) {
                    aIds.push($(el).val());
                });
                self.currentProjectTypes = aIds;
            } else {
                //console.log('setCurrentProjectTypes',{model:JSON.parse(JSON.stringify(self.model))})
                if(self.model.get('primary_skill_needed') !== ''){
                    self.currentProjectTypes = JSON.parse(self.model.get('primary_skill_needed'));
                    if(!_.isArray(self.currentProjectTypes)){
                        self.currentProjectTypes = [self.currentProjectTypes];
                    } else {
                        self.currentProjectTypes = [App.Vars.selectOptions['ProjectSkillNeededOptions']['General']];
                    }
                }

            }
            _log('App.Views.ProjectScope.setCurrentProjectTypes',{bUseCurrentForm:bUseCurrentForm,currentProjectTypes:self.currentProjectTypes})
        },
        getCurrentProjectTypes: function () {
            let self = this;
            if (_.isNull(self.currentProjectTypes)) {
                self.setCurrentProjectTypes();
            }

            return self.currentProjectTypes;
        },
        render: function (e) {
            let self = this;
            // prevents double load
            //console.log('render info',{bIsAddNew:self.bIsAddNew,currentModId:self.getViewDataStore('current-model-id', 'project_scope_management'),e:e,})
            if (_.isUndefined(e) && self.getViewDataStore('current-model-id', 'project_scope_management')!=='new') {
                //console.log('skipping render')
                return self;
            }
            if (_.isUndefined(self.model.get(self.model.idAttribute)) || self.model.get(self.model.idAttribute) === '') {
                self.$el.html('No Projects Found');
            } else {
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                self.model.url = self.getModelUrl(self.model.get(self.model.idAttribute));
                $.when(
                    self.model.fetch({reset: true})
                ).then(function () {
                    //console.log('project scope model', self.model)
                    //console.log('in render', {e: e,bIsAddNew:self.bIsAddNew,model:self.model});
                    if (self.model.get(self.model.idAttribute) === null && self.model.get("SequenceNumber") === 99999) {
                        let sequenceNumber = self.projectsDropDownView.collection.models.length > 0 ? _.max(self.projectsDropDownView.collection.models, function (project) {
                            return parseInt(project.get("SequenceNumber"));
                        }).get('SequenceNumber') : 1;

                        self.model.set('SequenceNumber', sequenceNumber + 1);
                    }
                    self.projectScopeContacts = self.model.get('contacts');
                    let contactSelect = new App.Views.Select({
                        el: '',
                        attributes: {id: 'ContactID', name: 'selectContactID', class: 'form-control'},
                        buildHTML: true,
                        bAllowMultiple: true,
                        collection: App.Collections.contactsManagementCollection,
                        optionValueModelAttrName: 'ContactID',
                        optionLabelModelAttrName: ['LastName', 'FirstName', 'Title']
                    });
                    self.childViews.push(contactSelect);
                    self.setCurrentProjectTypes(false);

                    let defaultProjectTypeOptions = [];
                    _.each(self.currentProjectTypes, function (val, idx) {
                        defaultProjectTypeOptions.push(self.getSkillsNeededLabel(val));
                    });

                    let tplVars = {
                        projectTypeCheckboxList: App.Models.projectModel.getSkillsNeededCheckboxList(true, defaultProjectTypeOptions.join(',')),
                        SiteID: self.sitesDropdownView.model.get(self.sitesDropdownView.model.idAttribute),
                        teamMembers: self.getTeamMembersList(),
                        contactSelect: contactSelect.getHtml(),
                        project: self.model,
                        initialWorkflowId: self.initialWorkflowId,
                        initialWorkflowCode: self.initialWorkflowCode,
                        initialWorkflowLabel: self.initialWorkflowLabel,
                        defaultWorkflowStatusLabelClass: self.initialWorkflowStatusLabelClass,
                        defaultWorkflowStatusIconClass: self.defaultWorkflowStatusIconClass
                    };
                    self.$el.html(self.template(tplVars));

                    if (self.$('[name="Comments"]').val() === '') {
                        self.$('[name="Comments"]').attr('rows', 3);
                    }

                    _.each(self.workflowOptions, function (workflow, idx) {
                        if (!$('.workflow-attributes-group[data-workflow-id="' + workflow.id + '"]').length) {
                            // <i class="fas fa-exclamation-triangle"></i>
                            // exclamation-circle <i class="fas fa-exclamation-circle"></i>
                            // <i class="far fa-check-circle"></i>
                            let workflowIdx = idx + 1;
                            let $workflowFieldset = $('<fieldset class="workflow-attributes-group" data-workflow-id="' + workflow.id + '" data-workflow-code="' + workflow.workflow_code + '"><legend>Information Needed During <span class="label label-default">' + workflow.label + '</span> Step <span class="workflow-status-label label ' + self.defaultWorkflowStatusLabelClass + '"><i class="fas ' + self.defaultWorkflowStatusIconClass + '"></i></span></legend><div id="workflow-attributes-group-content-' + workflowIdx + '" class="workflow-attributes-group-content"></fieldset>');
                            self.$('[name="projectScope"]').append($workflowFieldset);
                        }
                        _log('App.Views.ProjectScope.render worflow fieldset',{idx:idx, workflow:workflow,fieldset:$('.workflow-attributes-group[data-workflow-id="' + workflow.id + '"]')})
                    });
                    self.initWorkflowDisplay();
                    self.finishRenderingForm();

                    if (self.bIsAddNew) {
                        self.sitesDropdownView.$el.prop('disabled', true);
                        self.projectsDropDownView.$el.prepend('<option>New Project</option>');
                        self.projectsDropDownView.$el.prop('disabled', true);
                    } else {

                    }
                    //console.log('render run updateProjectWorkflowState()')
                    self.updateProjectWorkflowState();
                });
            }

            return self;
        },
        getWorkflowIdByAttributeId: function (attributeId) {
            let self = this;
            if (_.isUndefined(self.projectAttributeWorkflowIds[attributeId])) {
                let aResults = App.Collections.projectAttributesManagementCollection.where({attribute_id: attributeId});
                if (aResults.length) {
                    self.projectAttributeWorkflowIds[attributeId] = aResults[0].get('workflow_id');
                } else {
                    // default to 1 to keep attributes from disappearing
                    self.projectAttributeWorkflowIds[attributeId] = 1;
                }
            }

            return self.projectAttributeWorkflowIds[attributeId];
        },
        checkAllLeadership: function (e) {
            let self = this;
            let $checkbox = $(e.currentTarget);

            if ($checkbox.prop('checked')) {
                self.$('[name="email_team_member[]"]').each(function (idx, el) {
                    let $el = $(el);
                    if (!$el.prop('checked')) {
                        $el.prop('checked', true);
                        $el.attr('checked', 'checked');
                    }
                })
            } else {
                self.$('[name="email_team_member[]"]').each(function (idx, el) {
                    let $el = $(el);
                    if ($el.prop('checked')) {
                        $el.prop('checked', false);
                        $el.removeAttr('checked');
                    }
                })
            }
        },
        emailProjectReport: function (e) {
            let self = this;
            e.preventDefault();

            let emails = [];
            $('[name="email_team_member[]"]').each(function (idx, el) {
                if ($(el).prop('checked')) {
                    emails.push($(el).val());
                }
            });
            //console.log({emails:emails,siteId:self.getViewDataStore('current-site-id','project_scope_management'),sitestatusid:self.getViewDataStore('current-site-status-id','project_scope_management'),modelid:self.getViewDataStore('current-model-id','project_scope_management')});
            if (emails.length) {
                let $btn = $(e.currentTarget);
                $btn.siblings('.spinner').remove();
                $btn.before(App.Vars.spinnerHtml);

                let data = {
                    SiteID: self.getViewDataStore('current-site-id', 'project_scope_management'),
                    SiteStatusID: self.getViewDataStore('current-site-status-id', 'project_scope_management'),
                    ProjectID: self.getViewDataStore('current-model-id', 'project_scope_management'),
                    emails: emails,
                    site_wide: false
                };

                let growlMsg = '';
                let growlType = '';
                $.when(
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: 'admin/project_scope/email_report',
                        data: data,
                        success: function (response) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';

                        },
                        fail: function (response) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                        }
                    })
                ).then(function () {
                    growl(growlMsg, growlType);
                    $btn.siblings('.spinner').remove();
                });
            } else {
                growl('Please check a team member to be emailed.', 'error');
            }
        },
        getTeamMembersList: function () {
            let self = this;
            let html = '';
            self.projectScopeTeam = self.model.get('team');
            html = '<table class="table team">';
            html += '<thead><tr><th style="width:auto">Role</th><th>Name</th><th>Mobile</th><th>Home</th><th>Email</th><th>Status</th></tr></thead>';
            html += '<tbody>';
            for (let x = 0; x < self.projectScopeTeam.length; x++) {
                let mobilePhone = !_.isNull(self.projectScopeTeam[x]['MobilePhoneNumber']) ? self.projectScopeTeam[x]['MobilePhoneNumber'] : '';
                let homePhone = !_.isNull(self.projectScopeTeam[x]['HomePhoneNumber']) ? self.projectScopeTeam[x]['HomePhoneNumber'] : '';
                let email = !_.isNull(self.projectScopeTeam[x]['Email']) ? self.projectScopeTeam[x]['Email'] : '';
                let fname = !_.isNull(self.projectScopeTeam[x]['FirstName']) ? self.projectScopeTeam[x]['FirstName'] : '';
                let lname = !_.isNull(self.projectScopeTeam[x]['LastName']) ? self.projectScopeTeam[x]['LastName'] : '';

                html += '<tr><td><label class="checkbox-inline"><input type="checkbox" name="email_team_member[]" value="' + email + '"/>&nbsp;' + self.projectScopeTeam[x]['Role'] + '</label></td><td>' + fname + ' ' + lname + '</td><td>' + mobilePhone + '</td><td>' + homePhone + '</td><td><a target="_blank" href="mailto:' + email + '">' + email + '</a></td><td>' + self.projectScopeTeam[x]['ProjectVolunteerRoleStatusLabel'] + '</td></tr>';
                if (self.projectScopeTeam[x]['Comments'] !== '') {
                    html += '<tr><td class="comments-row" colspan="6"><strong>Comments:</strong> ' + self.projectScopeTeam[x]['Comments'] + '</td></tr>';
                }
            }
            html += '</tbody>';
            if (self.projectScopeTeam.length) {
                html += '<tfoot><tr><td colspan="2"><label class="checkbox-inline"><input type="checkbox" class="check-all-leadership" name="check-all-leadership"/> Select all</label></td><td colspan="4" align="right"><button class="btn btn-primary email-project-report">Email Project Report to checked leadership team members</button></td></tr></tfoot>';
            }
            html += '</table>';
            return html;
        },
        addMaterialAndCostRow: function (e) {
            let self = this;
            e.preventDefault();
            let $table = self.$('.material-needed-and-cost');
            let x = $table.find('tbody > tr').length;
            let attribute_id = _.findWhere(self.attributesOptions, {attribute_code: 'material_needed_and_cost'}).attribute_id;
            let row = self.getMaterialCostRowHtml('material_needed_and_cost', x, attribute_id, ['', '']);
            $table.find('tbody').append(row);
        },
        addBudgetSourceRow: function (e) {
            let self = this;
            e.preventDefault();
            let $table = self.$('.table.budget-sources');
            let x = $table.find('tbody > tr').length;
            let attribute_id = _.findWhere(self.attributesOptions, {attribute_code: 'budget_sources'}).attribute_id;
            let row = self.getBudgetSourcesRowHtml('budget_sources', x, attribute_id, {
                "BudgetID": 'new',
                "ProjectID": self.model.get(self.model.idAttribute),
                "BudgetSource": "",
                "BudgetAmount": "",
                "Status": "",
                "Comments": ""
            });
            $table.find('tbody').append(row);
        },
        calculateFromMaterialAndCost: function (e) {
            let self = this;
            e.preventDefault();
            let totalCost = 0.00;
            self.$('[name^="material_needed_and_cost[cost]"]').each(function (idx, el) {
                let amt = $(el).val();
                if (amt !== '') {
                    totalCost += parseFloat(amt);
                }
            });
            self.$('#estimated_total_cost').val(totalCost.toFixed(2));
        },
        handlePermitRequiredChange: function (e) {
            let self = this;
            if ($(e.currentTarget).val() === "2") {
                self.$('[name="permit_required_for"]').parent().removeClass('hide');
            } else if ($(e.currentTarget).val() === "3") {
                self.$('[name="permit_required_for"]').parent().addClass('hide');
                self.$('[name="would_like_team_lead_to_contact"]').parent().removeClass('hide');
            } else {
                self.$('[name="permit_required_for"]').parent().addClass('hide');
                self.$('[name="would_like_team_lead_to_contact"]').parent().addClass('hide');
            }
        },
        handleProjectTypeChange: function (e) {
            let self = this;

            let typesBeforeChange = _.clone(self.currentProjectTypes);
            self.setCurrentProjectTypes(true);

            let removed = _.difference(typesBeforeChange, self.currentProjectTypes);
            if (removed.length) {
                _.each(removed, function (project_type_id, idx) {
                    _.each(self.getProjectTypeAttributes(project_type_id), function (pta, idx) {
                        let attribute = _.where(self.attributesOptions, {id: pta.attribute_id});
                        //console.log(self.$('[name="'+ attribute[0].attribute_code+'"]'),project_type_id, pta.attribute_id,attribute)
                        let defaultValue = attribute.input === 'input' || attribute.input === 'textarea' ? self.cleanTextInputValue(attribute[0].default_value) : attribute[0].default_value;
                        self.$('[name="' + attribute[0].attribute_code + '"]').val(defaultValue);
                    });
                })
            }


            self.buildFormElements(self.currentProjectTypes);
            //console.log('handleProjectTypeChange run updateProjectWorkflowState()')
            self.updateProjectWorkflowState();
        },
        finishRenderingForm: function () {
            let self = this;

            self.buildFormElements(self.currentProjectTypes);

            self.$('[name="Active"]').val(self.model.get('Active')).trigger('change');
            if (self.projectScopeContacts.length) {
                self.$('[name="selectContactID"] option').each(function (idx, option) {
                    let val = parseInt($(option).val());
                    if (_.indexOf(self.projectScopeContacts, val) !== -1) {
                        $(option).prop("selected", true);
                    }
                });
            }
            self.parentView.gridManagerContainerToolbar.disableSaveBtn();
            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            self.bDoneLoadingForm = true;
        },
        getProjectTypeAttributes: function (id) {
            let self = this;
            //console.log('getProjectTypeAttributes',{id:id,  projectAttributes: self.projectAttributes});
            return _.where(self.projectAttributes, {project_skill_needed_option_id: parseInt(id)});
        },
        getMaterialNeededAndCostItemCnt: function () {
            let self = this;
            let lineCnt = self.model.get('material_needed_and_cost') !== '' ? JSON.parse(self.model.get('material_needed_and_cost')).length : 0;
            // provide an empty line to be nice
            return lineCnt > 5 ? lineCnt + 1 : 5;
        },
        geProjectAttachmentsItemCnt: function () {
            let self = this;
            let lineCnt = self.model.get('project_attachments') !== '' ? JSON.parse(self.model.get('project_attachments')).length : 0;

            return lineCnt;
        },
        getBudgetSourcesCnt: function () {
            let self = this;
            let lineCnt = self.model.get('budget_sources') !== '' ? JSON.parse(self.model.get('budget_sources')).length : 0;

            return lineCnt;
        },
        getSkillsNeededLabel: function (id) {
            let skillOpts = {};
            _.each(App.Vars.selectOptions['ProjectSkillNeededOptions'], function (val, key) {
                skillOpts[val] = key;
            });
            return skillOpts[id];
        },
        setSpecialInstructionHelpBlockMsg: function () {
            let self = this;
            let msg = '';
            let skillOpts = {};
            _.each(App.Vars.selectOptions['ProjectSkillNeededOptions'], function (val, key) {
                skillOpts[val] = key;
            });
            self.$('[name^="primary_skill_needed"]:checked').each(function (idx, el) {

                let id = $(el).val();
                //console.log({skillOpts: skillOpts, name:skillOpts[id]});
                switch (skillOpts[id]) {
                    case 'Construction':
                        msg += 'considerations for building…<br>';
                        break;
                    case 'General Carpentry':
                        break;
                    case 'Landscaping':
                        msg += 'i.e. where will the mulch be placed?<br>';
                        break;
                    case 'Painting':
                        msg += 'i.e. will items need to be covered or moved?<br>';
                        break;
                }
            });
            self.$('.help-block.special-instructions').html(msg);
        },
        getMaterialCostRowHtml: function (attribute_code, x, attribute_id, aRowValues) {
            let self = this;
            let materialNeed = self.cleanTextInputValue(aRowValues[0]);
            let cost = self.cleanTextInputValue(aRowValues[1]);
            return '<tr><td><input data-attribute-id="' + attribute_id + '" name="' + attribute_code + '[material][]" class="form-control material" id="' + attribute_code + '_material_' + x + '" placeholder="" value="' + materialNeed + '"/></td><td><div class="input-group"><div class="input-group-addon">$</div><input type="number" title="Money format only please. With or without cents." data-attribute-id="' + attribute_id + '" name="' + attribute_code + '[cost][]" class="form-control material-cost" id="' + attribute_code + '_cost_' + x + '" placeholder="0.00" value="' + cost + '" step="0.01"/></div></td></tr>';
        },
        getBudgetSourcesRowHtml: function (attribute_code, x, attribute_id, aRowValues) {
            let self = this;
            let budgetId = self.cleanTextInputValue(aRowValues['BudgetID']);
            let projectId = self.cleanTextInputValue(aRowValues['ProjectID']);
            let budgetSourceId = self.cleanTextInputValue(aRowValues['BudgetSource']);
            let amount = self.cleanTextInputValue(aRowValues['BudgetAmount']);
            let statusId = self.cleanTextInputValue(aRowValues['Status']);
            let comment = self.cleanTextInputValue(aRowValues['Comments']);
            let sourceOptions = '<option value="">Choose</option>' + App.Models.projectBudgetModel.getSourceOptions(true, budgetSourceId);
            let statusOptions = '<option value="">Choose</option>' + App.Models.projectBudgetModel.getStatusOptions(true, statusId);
            let hiddenInput = '<input type="hidden" data-attribute-id="' + attribute_id + '" name="' + attribute_code + '[budgetid][]" id="' + attribute_code + '_budgetid_' + x + '" value="' + budgetId + '"/>';
            return '<tr>' +
                '<td>' + hiddenInput + '<select data-attribute-id="' + attribute_id + '" name="' + attribute_code + '[source][]" class="form-control source" id="' + attribute_code + '_source_' + x + '" >' + sourceOptions + '</select></td>' +
                '<td><div class="input-group"><div class="input-group-addon">$</div><input type="number" title="Money format only please. With or without cents." data-attribute-id="' + attribute_id + '" name="' + attribute_code + '[amount][]" class="form-control budget-source-amount" id="' + attribute_code + '_amount_' + x + '" placeholder="0.00" value="' + amount + '" step="0.01"/></div></td>' +
                '<td><select data-attribute-id="' + attribute_id + '" name="' + attribute_code + '[status][]" class="form-control status" id="' + attribute_code + '_status_' + x + '" >' + statusOptions + '</select></td>' +
                '<td><textarea  data-attribute-id="' + attribute_id + '" name="' + attribute_code + '[comment][]" class="form-control material-cost" id="' + attribute_code + '_comment_' + x + '" >' + comment + '</textarea></td>' +
                '</tr>';
        },
        basename: function (path) {
            let rx1 = /(.*)\/+([^/]*)$/;  // (dir/) (optional_file)
            let rx2 = /()(.*)$/;// ()     (file)
            return (rx1.exec(path) || rx2.exec(path))[2];
        },
        getProjectAttachmentsRowHtml: function (attribute_code, x, attribute_id, aRowValues) {
            let self = this;
            let ProjectAttachmentID = aRowValues[0];
            let url = aRowValues[1];
            let img = '';
            if (url.match(/\.(gif|png|bmp|jpg|jpeg)$/i)) {
                img = '<img class="attachment-thumb" width="100px" src="' + url + '"/> ';
            }
            return '<tr><td>'+img+'<a href="' + url + '" target="_blank">' + self.basename(url) + '</a></td><td><button class="btn btn-secondary project-attachment-delete" data-id="' + ProjectAttachmentID + '" id="' + attribute_code + '_delete_' + x + '" ><span class="ui-icon ui-icon-trash"></span></button></div></td></tr>';
        },
        getInputHtml: function (inputType, attribute_code, attribute_id, value, optionHtml) {
            let self = this;
            let html = '';
            let pattern = '';
            let placeholder = '';
            let helpBlock = '';
            let bCloseInputGroup = false;

            switch (inputType) {
                case 'table':
                    if (attribute_code === 'material_needed_and_cost') {
                        html = '<table class="table material-needed-and-cost">';
                        html += '<thead><tr><th style="width:80%">Material</th><th>Cost</th></tr></thead>';
                        html += '<tbody>';
                        let aRowValues = value !== '' ? JSON.parse(value) : [];
                        for (let x = 0; x <= self.getMaterialNeededAndCostItemCnt(); x++) {
                            let aRowValue = !_.isUndefined(aRowValues[x]) ? aRowValues[x] : ['', ''];
                            html += self.getMaterialCostRowHtml(attribute_code, x, attribute_id, aRowValue);
                        }
                        html += '</tbody>';
                        html += '<tfoot><tr><td colspan="2" align="right"><button class="btn btn-secondary add-material-needed-and-cost">Add another material</input></td></tr></tfoot>';
                        html += '</table>';
                    } else if (attribute_code === 'project_attachments') {
                        html = '<table class="table project-attachments">';
                        html += '<thead><tr><th style="width:80%">Attachment</th><th></th></tr></thead>';
                        html += '<tbody>';
                        let aRowValues = value !== '' ? JSON.parse(value) : [];
                        _.each(aRowValues, function (val, key) {
                            if (val !== 'undefined') {
                                html += self.getProjectAttachmentsRowHtml(attribute_code, key, attribute_id, [key, val]);
                            }
                        });
                        for (let x = 0; x < self.geProjectAttachmentsItemCnt(); x++) {
                            let aRowValue = !_.isUndefined(aRowValues[x]) ? aRowValues[x] : ['', ''];
                            html += self.getProjectAttachmentsRowHtml(attribute_code, x, attribute_id, aRowValue);
                        }
                        html += '</tbody>';
                        html += '<tfoot><tr><td colspan="2" align="right"><button class="btn btn-secondary add-project-attachment">Add attachment</button></td></tr></tfoot>';
                        html += '</table>';
                    } else if (attribute_code === 'budget_sources') {
                        html = '<table class="table budget-sources">';
                        html += '<thead><tr><th style="width:150px">Source<label></label></th><th style="width:140px">Amt<label></label></th><th style="width:130px">Status<label></label></th><th>Comment</th></tr></thead>';
                        html += '<tbody>';
                        let aRowValues = value !== '' ? JSON.parse(value) : [];
                        for (let x = 0; x <= self.getBudgetSourcesCnt(); x++) {
                            let aRowValue = !_.isUndefined(aRowValues[x]) ? aRowValues[x] : {
                                "BudgetID": 'new',
                                "ProjectID": self.model.get(self.model.idAttribute),
                                "BudgetSource": "",
                                "BudgetAmount": "",
                                "Status": "",
                                "Comments": ""
                            };
                            html += self.getBudgetSourcesRowHtml(attribute_code, x, attribute_id, aRowValue);
                        }
                        html += '</tbody>';
                        html += '<tfoot><tr><td colspan="4" align="right"><button class="btn btn-secondary add-budget-source">Add another budget source</input></td></tr></tfoot>';
                        html += '</table>';
                        //html += '<textarea type="text" data-attribute-id="' + attribute_id + '" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="' + placeholder + '" ' + pattern + ' >' + self.cleanTextInputValue(value) + '</textarea>';
                    }
                    break;
                case 'text':
                    html += '<input type="text" data-attribute-id="' + attribute_id + '" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="' + placeholder + '" ' + pattern + ' value="' + self.cleanTextInputValue(value) + '"/>';
                    break;
                case 'textarea':
                    if (attribute_code === 'special_instructions') {
                        placeholder = '';
                        helpBlock = '<p class="help-block special-instructions"></p>';
                    }
                    let rowsVisible = value === '' ? 3 : 5;
                    html = '<textarea style="resize:vertical" rows="' + rowsVisible + '" data-attribute-id="' + attribute_id + '" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="' + placeholder + '">' + self.cleanTextInputValue(value) + '</textarea>' + helpBlock;
                    break;
                case 'select':
                    html = '<select data-attribute-id="' + attribute_id + '" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '">' + optionHtml + '</select>';
                    break;
                case 'bool':
                    html = '<div>';
                    for (let x = 0; x <= 1; x++) {
                        let boolLabel = x === 0 ? 'No' : 'Yes';
                        let checked = value === x ? 'checked' : '';
                        html +=
                            '    <label class="bool-label checkbox-inline" for="' + attribute_code + '_' + x + '">' +
                            '        <input type="radio" ' + checked + ' id="' + attribute_code + '_' + x + '" name="' + attribute_code + '[]" value="' + x + '"> ' + boolLabel +
                            '    </label>';
                    }
                    html += '</div>';
                    break;
                case 'number':
                    bCloseInputGroup = false;
                    let numberStepAttr = '';
                    if (attribute_code === 'estimated_total_cost' || attribute_code === 'actual_cost') {
                        bCloseInputGroup = true;
                        html += '<div class="input-group"><div class="input-group-addon">$</div>';
                        placeholder = '';
                        numberStepAttr = ' step="0.01" ';
                        helpBlock = '<p class="help-block">Money format only please. With or without cents. Valid format examples: 0.50 or .50 or 10 or 10.00 or 10.01</p>';
                    }
                    html += '<input data-attribute-id="' + attribute_id + '" type="number" ' + numberStepAttr + ' name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="' + placeholder + '" value="' + value + '"/>';
                    if (bCloseInputGroup) {
                        if (attribute_code === 'estimated_total_cost') {
                            html += '<div class="input-group-btn"><button class="btn btn-primary calculate-total-from-material-cost">Calculate Total From Material Cost</button></div>';
                        }
                        html += '</div>';
                    }
                    html += helpBlock;
                    break;
                default:
                    html = '<input data-attribute-id="' + attribute_id + '" type="text" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="" value="' + self.cleanTextInputValue(value) + '"/>';
            }
            return html;
        },
        getAttachmentModalForm: function () {
            let self = this;
            let template = window.template('newProjectAttachmentTemplate');

            let tplVars = {
                ProjectID: self.model.get(self.model.idAttribute)
            };

            return template(tplVars);
        },
        clickFileUpload: function (e) {
            let self = this;
            e.preventDefault();
            self.getModalElement().one('show.bs.modal', function (event) {
                let $fileInput = null;

                // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
                // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
                let modal = $(this);
                modal.find('.modal-title').html(self.parentView.$('h3.box-title').html());
                modal.find('.modal-body').html(self.getAttachmentModalForm());
                let selfView = modal.find('form[name="newProjectAttachment"]');

                let sAjaxFileUploadURL = '/admin/project_attachment/upload';
                $fileInput = $(selfView.find('input[type="file"]'));
                $fileInput.fileupload({
                    url: sAjaxFileUploadURL,
                    dataType: 'json',
                    done: function (e, data) {
                        //console.log({e:e, data:data,filesClass: selfView.find('[name="files[]"]')})
                        selfView.find('.progress').fadeTo(0, 'slow');
                        selfView.find('[name="AttachmentPath"]').val('');
                        selfView.find('.files').empty();
                        _.each(data.jqXHR.responseJSON.files, function (file, index) {
                            let sFileName = file.name;
                            //let sExistingVal = selfView.find('[name="AttachmentPath"]').val().length > 0 ? selfView.find('[name="AttachmentPath"]').val() + "\n" : '';
                            //selfView.find('[name="AttachmentPath"]').val(sExistingVal + file.url);
                            selfView.find('.files').append(sFileName + '<br>');
                            //console.log({fileUrl:file.url, sExistingVal: sExistingVal,textarea: selfView.find('[name="AttachmentPath"]')});
                        });
                        modal.find('.save.btn').trigger('click')
                    },
                    start: function (e) {
                        selfView.find('.progress').fadeTo('fast', 1);
                        selfView.find('.progress').find('.meter').removeClass('green');
                    },
                    progress: function (e, data) {
                        let progress = parseInt(data.loaded / data.total * 100, 10);
                        selfView.find('.progress .progress-bar').addClass('green').css(
                            'width',
                            progress + '%'
                        ).find('p').html(progress + '%');
                    }
                }).prop('disabled', !$.support.fileInput)
                    .parent().addClass($.support.fileInput ? undefined : 'disabled');

                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    try {
                        $fileInput.fileupload('destroy');
                    } catch (e) {
                    }
                    let data = $.unserialize(modal.find('form').serialize());
                    self.model.set(self.model.idAttribute, data[self.model.idAttribute]);
                    if (modal.find('[name="AttachmentPath"]').val() !== '') {
                        self.saveProjectAttachments(data,e);
                        self.getModalElement().modal('hide');
                    } else {
                        self.getModalElement().modal('hide');
                        self.render(e);
                    }


                });

            });
            self.getModalElement().modal('show');
        },
        deleteProjectAttachment: function (e) {
            let self = this;
            e.preventDefault();
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            let growlMsg = '';
            let growlType = '';
            let $deleteBtn = $(e.currentTarget);
            let projectAttachment = new App.Models.ProjectAttachment();
            projectAttachment.set(projectAttachment.idAttribute, $deleteBtn.data('id'));
            projectAttachment.url = '/admin/project_attachment/destroy/' + $deleteBtn.data('id');
            $.when(projectAttachment.destroy(
                {
                    success: function (model, response, options) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                        $deleteBtn.parents('tr').remove();
                    },
                    error: function (model, response, options) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                    }
                })).then(function () {

                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                // need to pass an event if we want the form to update
                self.render();
            });
        },
        saveProjectAttachments: function (data,e) {
            let self = this;
            let projectAttachment = new App.Models.ProjectAttachment();
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            let growlMsg = '';
            let growlType = '';
            let attachmentResponse = null;
            //console.log({data:data})
            projectAttachment.url = '/admin/project_attachment';
            $.when(
                projectAttachment.save(data,
                    {
                        success: function (model, response, options) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                            attachmentResponse = response;
                        },
                        error: function (model, response, options) {
                            growlMsg = response.msg;
                            growlType = response.success ? 'success' : 'error';
                            attachmentResponse = response;
                        }
                    })
            ).then(function () {
                growl(growlMsg, growlType);
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                self.model.set(self.model.idAttribute, data[self.model.idAttribute]);
                //console.log({model:self.model,attachmentResponse:attachmentResponse})
                // need to pass an event if we want the form to update
                self.render(e);
            });
        },
        getAttributesForForm: function (projectTypeId) {
            let self = this;
            let aProjectTypeAttributes = [];
            let aProjectTypeId = [];
            if (_.isArray(projectTypeId)) {
                aProjectTypeId = _.map(projectTypeId, function (val, key) {
                    return parseInt(val);
                });
            } else {
                aProjectTypeId.push(projectTypeId);
            }
            _.each(aProjectTypeId, function (project_type_id, idx) {
                _.each(self.getProjectTypeAttributes(project_type_id), function (id, idx) {
                    if (_.indexOf(aProjectTypeAttributes, id) === -1) {
                        aProjectTypeAttributes.push(id);
                    }
                });
            });
            return aProjectTypeAttributes;
        },
        getAttributeIsWorkflowRequirement: function (attributeId) {
            let self = this;
            let bIsRequired = true;

            let aProjectAttributes = _.where(self.aCurrentProjectTypeAttributes, {attribute_id: attributeId});
            _.each(aProjectAttributes, function (projectAttribute, idx) {

                if (projectAttribute.workflow_requirement === 0) {
                    bIsRequired = false;
                } else if (projectAttribute.workflow_requirement === 3) {

                    let dependsOnAttribute = App.Collections.attributesManagementCollection.get(parseInt(projectAttribute.workflow_requirement_depends_on));

                    let $dependsOnAttributeEl = $('[name="' + self.getAttributeFormElementName(dependsOnAttribute.get('attribute_code')) + '"]');
                    let dependsOnAttributeValue = self.getAttributeFormElementValue($dependsOnAttributeEl);
                    let bIsSelectType = (dependsOnAttribute.get('input') === 'select' || dependsOnAttribute.get('input') === 'bool');
                    if (bIsSelectType) {
                        //console.log({cond:projectAttribute.workflow_requirement_depends_on_condition,arr:projectAttribute.workflow_requirement_depends_on_condition.split(/,/)})
                        let aRequiredIfNotMatches = [];
                        let aRequiredIfMatches = [];
                        _.each(projectAttribute.workflow_requirement_depends_on_condition.split(/,/), function (val, key) {

                            if (val.match(/^not/)) {
                                let optionVal = val.replace(/^not /, '');
                                aRequiredIfNotMatches.push(optionVal.toString());

                            } else {
                                aRequiredIfMatches.push(val.toString());

                            }
                        });
                        if (aRequiredIfNotMatches.length) {
                            let bMatches = _.indexOf(aRequiredIfNotMatches, dependsOnAttributeValue.toString()) !== -1;
                            bIsRequired = !bMatches;
                            //console.log({bMatches:bMatches,bIsRequired:bIsRequired,dependsOnAttributeValue:dependsOnAttributeValue.toString(), aRequiredIfNotMatches:aRequiredIfNotMatches})

                        } else {
                            let bMatches = _.indexOf(aRequiredIfMatches, dependsOnAttributeValue.toString()) !== -1;
                            bIsRequired = bMatches;
                            //console.log({bMatches:bMatches,bIsRequired:bIsRequired,dependsOnAttributeValue:dependsOnAttributeValue.toString(), aRequiredIfMatches:aRequiredIfMatches})

                        }
                    } else {
                        if (dependsOnAttributeValue !== projectAttribute.workflow_requirement_depends_on_condition) {
                            bIsRequired = false;
                        }
                    }
                }
            });
            return bIsRequired;
        },
        getIsAttributeDependentOn: function (attributeId) {
            let self = this;
            let bIsDependentOn = false;
            let aProjectAttributes = _.where(self.aCurrentProjectTypeAttributes, {attribute_id: attributeId});
            _.each(aProjectAttributes, function (projectAttribute, idx) {
                if (projectAttribute.workflow_requirement === 3) {
                    bIsDependentOn = true;
                }
            });

            return bIsDependentOn;
        },
        buildFormElements: function (projectTypeId) {
            let self = this;
            self.aCurrentProjectTypeAttributes = self.getAttributesForForm(projectTypeId);

            for (let i = 0; i < self.attributesOptionsCnt; i++) {
                let attribute = self.attributesOptions[i];
                if (attribute.attribute_code === 'primary_skill_needed') {
                    continue;
                }
                let attributeFormGroupClassname = 'form-group-' + attribute.attribute_code.replace('_', '-');
                // only add or show attribute form element that is applicable to the currently chosen project types
                let aProjectAttributes = _.where(self.aCurrentProjectTypeAttributes, {attribute_id: attribute.id});
                //console.log({projectTypeId:projectTypeId,attribute:attribute,aProjectAttributes:aProjectAttributes,model:self.model});
                if (aProjectAttributes.length) {
                    if (self.$('.' + attributeFormGroupClassname).length === 0) {

                        let value = self.model.get(attribute.attribute_code);
                        let optionHtml = attribute.options_source !== '' && !_.isUndefined(self.selectOptions[attribute.options_source]) ? self.selectOptions[attribute.options_source] : '';

                        let requiredClass = self.getAttributeIsWorkflowRequirement(attribute.id) ? 'required' : '';
                        let hideClass = '';

                        if (self.getIsAttributeDependentOn(attribute.id) && requiredClass === '') {
                            hideClass = 'hide';
                        }

                        let row = '<div class="dynamic form-group ' + attributeFormGroupClassname + ' ' + hideClass + ' ' + requiredClass + '">' +
                            '    <label for="' + attribute.attribute_code + '">' + attribute.label + '</label>' +
                            self.getInputHtml(attribute.input, attribute.attribute_code, attribute.id, value, optionHtml) +
                            '</div>';
                        // append row to correct workflow fieldset
                        self.$('fieldset[data-workflow-id="' + self.getWorkflowIdByAttributeId(attribute.id) + '"] .workflow-attributes-group-content').append(row);
                        if (attribute.input === 'select') {
                            self.$('[name="' + attribute.attribute_code + '"]').val(value);
                        } else if (attribute.input === 'bool') {
                            if (value !== '') {
                                self.$('#' + attribute.attribute_code + '_' + value).prop('checked', true);
                            }
                        }
                    } else {
                        self.$('.' + attributeFormGroupClassname).show();
                    }
                } else {
                    if (self.$('.' + attributeFormGroupClassname).length) {
                        self.$('.' + attributeFormGroupClassname).hide();
                    }
                }
            }
            self.setSpecialInstructionHelpBlockMsg();
        },
        setGridManagerContainerToolbar: function ($gridManagerContainerToolbar) {
            let self = this;
            self.$gridManagerContainerToolbar = $gridManagerContainerToolbar;
        },
        flagAsInvalid: function (e) {
            let self = this;
            //console.log('flagAsInvalid', {e: e, currentTarget: e.currentTarget})
            $(e.currentTarget).css('border-color', 'red');
        }
    });
})(window.App);

(function (App) {
    App.Views.ProjectScopeDropDownOption = App.Views.Backend.extend({
        tagName: 'option',
        initialize: function (options) {
            _.bindAll(this, 'render');
        },
        render: function () {
            let self = this;
            self.$el.attr('value', self.model.get('ProjectID'))
                .html('Project #:' + self.model.get('SequenceNumber'));
            return self;
        }
    });
    App.Views.ProjectScopeDropDown = App.Views.Backend.extend({
        initialize: function (options) {
            let self = this;
            self.options = options;

            self.optionsView = [];
            self.parentView = self.options.parentView;
            _.bindAll(self, 'addOne', 'addAll', 'changeSelected', 'updateCollectionBySite');
            self.projectScopeSitesDropdown = self.options.projectScopeSitesDropdown;
            self.listenTo(self.projectScopeSitesDropdown, "site-id-change", self.updateCollectionBySite);
            self.listenTo(self.collection, "reset", self.addAll);
        },
        events: {
            "change": "changeSelected"
        },
        updateCollectionBySite: function (e) {
            let self = this;
            self.options.selectedProjectID = e.ProjectID;
            self.collection.url = '/admin/project_scope/projects/' + e.SiteStatusID;
            self.collection.fetch({reset: true})
        },
        addOne: function (projectDropDown) {
            let self = this;
            let option = new App.Views.ProjectScopeDropDownOption({model: projectDropDown});
            self.optionsView.push(option);
            self.$el.append(option.render().el);
        },
        addAll: function () {
            let self = this;
            _.each(self.optionsView, function (option) {
                option.remove();
            });

            self.collection.each(self.addOne);

            self.$el.trigger('change');
        },
        render: function () {
            let self = this;
            self.addAll();
            return self;
        },
        changeSelected: function () {
            let self = this;
            let projectId = null;
            if (!_.isUndefined(self.options.selectedProjectID) && !_.isNull(self.options.selectedProjectID)) {
                self.$el.val(self.options.selectedProjectID);
                projectId = self.options.selectedProjectID;
                self.options.selectedProjectID = null;
            } else {
                let $option = self.$el.find(':selected');
                if (!$option.length) {
                    $option = self.$el.find(':first-child');
                }
                projectId = $option.val();
            }

            self.setSelectedId(self.parentView.$('select#sites option').filter(':selected').val(), self.parentView.$('select#sites option').filter(':selected').data('site-status-id'), projectId);
        },
        setSelectedId: function (SiteID, SiteStatusID, ProjectID) {
            let self = this;
            if (App.Vars.mainAppDoneLoading) {
                _log('App.Views.ProjectScopeProjectsDropDown.setSelectedId.event', 'new project selected', {
                    SiteID: SiteID,
                    SiteStatusID: SiteStatusID,
                    ProjectID: ProjectID
                });
                //console.log('trigger project-id-change',{SiteID: SiteID, SiteStatusID: SiteStatusID, ProjectID: ProjectID, currentProjectID:self.getViewDataStore('current-model-id')});
                self.trigger('project-id-change', {SiteID: SiteID, SiteStatusID: SiteStatusID, ProjectID: ProjectID});
            }
        }
    });
    // This is the sites drop down
    App.Views.ProjectScopeSiteOption = App.Views.Backend.extend({
        viewName: 'sites-dropdown-option',
        tagName: 'option',
        initialize: function (options) {
            let self = this;
            _.bindAll(self, 'render');
            self._initialize(options);
        },
        render: function () {
            let self = this;
            self.$el.attr('value',
                self.model.get(self.model.idAttribute)).data('site-status-id', self.model.get('SiteStatusID')).html(self.model.get('SiteName'));
            return self;
        }
    });
    App.Views.ProjectScopeSitesDropdown = App.Views.Backend.extend({
        viewName: 'sites-dropdown',
        initialize: function (options) {
            let self = this;

            _.bindAll(self, 'addOne', 'addAll', 'render', 'changeSelected', 'setSelectedId');
            self._initialize(options);
            self.listenTo(self.collection, "reset", self.addAll);

            self.parentView = self.options.parentView;

        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (site) {
            let self = this;
            self.$el.append(
                new App.Views.ProjectScopeSiteOption({
                    model: site,
                }).render().el);
        },
        addAll: function () {
            let self = this;
            _log('App.Views.ProjectScopeSitesDropdown.addAll', 'sites dropdown');
            self.$el.empty();
            self.collection.each(self.addOne);

            if (!_.isUndefined(self.options.selectedSiteID) && !_.isNull(self.options.selectedSiteID)) {
                self.$el.val(self.options.selectedSiteID);
                self.options.selectedSiteID = null;
            }
            let selectedProjectID = null;
            if (!_.isUndefined(self.options.selectedProjectID) && !_.isNull(self.options.selectedProjectID)) {
                selectedProjectID = self.options.selectedProjectID;
                self.options.selectedProjectID = null;
            }
            self.changeSelected(selectedProjectID);
        },
        render: function () {
            let self = this;
            self.addAll();

            return self;
        },
        changeSelected: function (selectedProjectID) {
            let self = this;
            // selectedProjectID might be an event
            if (!_.isNull(selectedProjectID) && !_.isUndefined(selectedProjectID.originalEvent)) {
                selectedProjectID = null;
            }
            //console.log({SiteID: self.$el.val(),selectedOption: self.$el.find('option:selected'), SiteStatusID: self.$el.find('option:selected').data('site-status-id'), ProjectID: selectedProjectID})
            self.setSelectedId(self.$el.val(), self.$el.find('option:selected').data('site-status-id'), selectedProjectID);
        },
        setSelectedId: function (SiteID, SiteStatusID, selectedProjectID) {
            let self = this;
            self.trigger('site-id-change', {SiteID: SiteID, SiteStatusID: SiteStatusID, ProjectID: selectedProjectID});
            self.trigger('site-status-id-change', {
                SiteID: SiteID,
                SiteStatusID: SiteStatusID,
                ProjectID: selectedProjectID
            });
        }
    });
    App.Views.ProjectScopeManagement = App.Views.Management.extend({
        sitesDropdownViewClass: App.Views.ProjectScopeSitesDropdown,
        projectScopeDropdownViewClass: App.Views.ProjectScopeDropDown,
        projectScopeViewClass: App.Views.ProjectScope,
        gridManagerContainerToolbarClass: App.Views.ProjectScopeGridManagerContainerToolbar,
        attributes: {
            class: 'route-view box box-primary project-scope-management-view'
        },
        template: template('projectScopeManagementTemplate'),
        viewName: 'project-scope-management-view',
        initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'emailProjectReport');
            } catch (e) {
                console.error(options, e);
            }
            // Required call for inherited class
            self._initialize(options);
            self.bReturnToProjectManagementView = false;
            self.bReturnToProjectStatusManagementView = false;
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();
        },
        events: {
            'click .email-sitewide-project-reports': 'emailProjectReport'
        },
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template({
                modelNameLabelLowerCase: self.modelNameLabelLowerCase,
                modelNameLabel: self.modelNameLabel
            }));
            self.renderSiteDropdowns();
            //model: App.Models.projectModel,
            self.projectScopeView = new self.projectScopeViewClass({
                ajaxWaitingTargetClassSelector: '.backgrid-wrapper',
                collection: App.PageableCollections.projectCollection,
                columnCollectionDefinitions: App.Vars.projectsBackgridColumnDefinitions,
                gridManagerContainerToolbarClassName: 'grid-manager-container',
                model: App.Models.projectScopeModel,
                modelNameLabel: 'Project',
                parentView: self,
                viewName: 'project-scope'
            });
            self.gridManagerContainerToolbar = new self.gridManagerContainerToolbarClass({
                el: self.$('.grid-manager-container'),
                parentView: self,
                managedGridView: self.projectScopeView,
                ajaxWaitingTargetClassSelector: '.backgrid-wrapper',
            });
            self.gridManagerContainerToolbar.render();
            self.childViews.push(self.gridManagerContainerToolbar);
            self.projectScopeView.setGridManagerContainerToolbar(self.gridManagerContainerToolbar);

            self.$('.backgrid-wrapper').html(self.projectScopeView.render().el);

            self.childViews.push(self.projectScopeView);

            if (!_.isUndefined(self.options.loadProject) && !_.isNull(self.options.loadProject) && !_.isUndefined(App.Views.mainApp.router.managementViews['project_management'])) {
                let $projectManagementView = App.Views.mainApp.router.managementViews['project_management'].$el;

                if ($projectManagementView.length && $projectManagementView.is(':visible')) {
                    self.bReturnToProjectManagementView = true;
                    $projectManagementView.hide();
                }
            } else if (!_.isUndefined(self.options.loadProject) && !_.isNull(self.options.loadProject) && !_.isUndefined(App.Views.mainApp.router.managementViews['project_status'])) {
                let $projectStatusManagementView = App.Views.mainApp.router.managementViews['project_status'].$el;

                if ($projectStatusManagementView.length && $projectStatusManagementView.is(':visible')) {
                    self.bReturnToProjectStatusManagementView = true;
                    $projectStatusManagementView.hide();
                }
            }

            return self;
        },
        emailProjectReport: function (e) {
            let self = this;
            e.preventDefault();

            //console.log({emails:emails,siteId:self.getViewDataStore('current-site-id','project_scope_management'),sitestatusid:self.getViewDataStore('current-site-status-id','project_scope_management'),modelid:self.getViewDataStore('current-model-id','project_scope_management')});
            let $btn = $(e.currentTarget);
            $btn.siblings('.spinner').remove();
            $btn.after(App.Vars.spinnerHtml);
            let data = {
                SiteID: self.getViewDataStore('current-site-id', 'project_scope_management'),
                SiteStatusID: self.getViewDataStore('current-site-status-id', 'project_scope_management'),
                ProjectID: self.getViewDataStore('current-model-id', 'project_scope_management'),
                site_wide: true
            };

            let growlMsg = '';
            let growlType = '';
            $.when(
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: 'admin/project_scope/email_report',
                    data: data,
                    success: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';

                    },
                    fail: function (response) {
                        growlMsg = response.msg;
                        growlType = response.success ? 'success' : 'error';
                    }
                })
            ).then(function () {
                growl(growlMsg, growlType);
                $btn.siblings('.spinner').remove();
            });
        },
        renderSiteDropdowns: function () {
            let self = this;

            let selectedSiteID = App.Vars.appInitialData.project_manager_sites.length ? App.Vars.appInitialData.project_manager_sites[0].SiteID : null;
            let selectedProjectID = null;

            if (self.options.loadProject) {
                if (self.options.loadProject.match(/_/)) {
                    let parts = self.options.loadProject.split(/_/);
                    selectedSiteID = parts[0];
                    selectedProjectID = parts[1];
                }
            }
            self.sitesDropdownView = new self.sitesDropdownViewClass({
                el: self.$('select#sites'),
                model: new App.Models.Site(),
                collection: new App.Collections.Site(App.Vars.appInitialData.project_manager_sites),
                parentView: self,
                selectedSiteID: selectedSiteID,
                selectedProjectID: selectedProjectID,
            });
            self.projectsDropDownView = new this.projectScopeDropdownViewClass({
                el: this.$('select#projects'),
                parentView: this,
                projectScopeSitesDropdown: self.sitesDropdownView,
                collection: new App.Collections.ProjectsDropDown(App.Vars.appInitialData.project_manager_projects),
            });
            self.projectsDropDownView.render();
            self.listenTo(self.projectsDropDownView, 'project-id-change', self.handleProjectIDChange);
            self.listenTo(self.sitesDropdownView, 'site-id-change', self.handleSiteIDChange);
            self.listenTo(self.sitesDropdownView, 'site-status-id-change', self.handleSiteStatusIDChange);
            self.sitesDropdownView.render();
            self.childViews.push(self.sitesDropdownView);
            self.childViews.push(self.projectsDropDownView);


        },
        handleSiteStatusIDChange: function (e) {
            let self = this;

            self.setViewDataStoreValue('current-site-status-id', e['SiteStatusID']);
        },
        handleProjectIDChange: function (e) {
            let self = this;
            self.gridManagerContainerToolbar.disableSaveBtn();
            self.setViewDataStoreValue('current-model-id', e['ProjectID']);
        },
    });
})(window.App);

(function (App) {
    App.Views.MainApp = App.Views.Backend.extend({
        el: $(".sia-main-app"),
        events: {
            'click > .route-view .close-view' : 'hideRouteView'
        },
        initialize: function (options) {
            let self = this;
            _log('App.Views.mainApp.initialize', 'MainApp', 'initialize');
            _.bindAll(self, 'render', 'setRouteView', 'hideRouteView');
            self.options = options;
            self.router = self.options.parentView;
            self.preRenderedView = false;
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
        hideRouteView: function(e) {
            //console.log('hideRouteView',e,$(e.currentTarget).parents('.route-view'))
            $(e.currentTarget).parents('.route-view').hide();
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
        getRouteViewExists: function($el){
            return this.$el.find($el).length;
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
                    if (self.getRouteViewExists(self.routeView.$el)) {
                        window.ajaxWaiting('remove', '.sia-main-app');
                        self.routeView.$el.show()
                    } else {
                        let viewEl = self.routeView.render().el;
                        if (self.preRenderedView){
                            $(viewEl).hide();
                        } else {
                            window.ajaxWaiting('remove', '.sia-main-app');
                        }
                        self.$el.append(viewEl);
                    }
                }
                _log('App.Views.mainApp.render', 'render', 'routeView:' + self.routeView.$el.attr('class'), self.$el);
            }

            if (self.preRenderedView === false && App.Vars.mainAppDoneLoading === false) {
                App.Vars.mainAppDoneLoading = true;
                _log('App.Views.mainApp.render', 'App.Vars.mainAppDoneLoading = true');
                // Hack to force grid columns to work
                $('body').trigger('resize');
            }

            return self;
        }
    });

})(window.App);
