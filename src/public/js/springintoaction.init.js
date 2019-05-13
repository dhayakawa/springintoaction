AppEvents = {};
_.extend(AppEvents, Backbone.Events);

// Global object for spring into action backbone app
window.App = {
    Models: {
        siteSettingModel: null,
        siteModel: null,
        siteStatusModel: null,
        projectModel: null,
        contactModel: null,
        volunteerModel: null,
        projectContactModel: null,
        projectLeadModel: null,
        projectBudgetModel: new Backbone.Model(),
        projectVolunteerModel: null,
        projectVolunteerRoleModel: null,
        annualBudgetModel: null,
        reportModel: null,
        statusManagementModel: null,
        siteVolunteerRoleModel: null
    },
    PageableCollections: {
        backGridFiltersPanelCollection: null,
        contactsManagementCollection: null,
        projectBudgetsCollection: null,
        projectCollection: null,
        projectContactsCollection: null,
        projectLeadsCollection: null,
        projectVolunteersCollection: null,
        unassignedProjectVolunteersCollection: null,
        volunteersManagementCollection: null,
        projectAttachmentsCollection: null,
        siteVolunteersRoleCollection:null
    },
    Collections: {
        siteSettingsCollection: null,
        allProjectsCollection: null,
        annualBudgetsManagementCollection: null,
        contactsManagementCollection: null,
        projectVolunteersCollection: null,
        sitesDropDownCollection: null,
        siteYearsDropDownCollection: null,
        reportsManagementCollection: null,
        projectsDropDownCollection:null,
        statusManagementCollection:null
    },
    Views: {
        dashboardView: {},
        settingsManagementView: {},
        siteManagementView: {},
        siteYearsDropDownView: {},
        projectManagementView: {},
        siteProjectTabsView: {},
        projectsView: {},
        contactsManagementView: {},
        volunteersManagementView: {},
        budgetManagementView: {},
        reportsManagementView: [],
        statusManagementView: {}
    },
    Templates: {},
    Router: {},
    Vars: {
        bAllowManagedGridColumns: false,
        bBackgridColumnManagerSaveState: false,
        bBackgridColumnManagerLoadStateOnInit: false,
        // Turn on the console logging
        bAllowConsoleOutput: 1,
        bAllowConsoleOutputHiLite: 1,
        bAllowConsoleVarGroupsOutput: 1,
        rowBgColorSelected: '#e3f6b1',
        workerRoleID: 4,
        appInitialData: {},
        selectOptions:{},
        devMode: false,
        auth:[]
    },
    CellEditors: {}
};

/**
 * Needed to fix the select so when it triggers a backgrid:edited the model has been flagged as changed
 */
App.CellEditors.Select2CellEditor = Backgrid.Extension.Select2CellEditor.extend({
    events: {
        "change": "close"
    }
});

/**
 * Overriding to catch missing columns errors
 * Updates the position of all handlers
 * @private
 */
Backgrid.Extension.OrderableColumns.prototype.updateIndicatorPosition = function () {
    var self = this;
    self.indicatorPositions = {};

    _.each(self.indicators, function ($indicator, indx) {

        if (typeof $indicator !== 'undefined') {
            var cell = $indicator.data("column-cell");
            var displayOrder = $indicator.data("column-displayOrder");

            var left;
            try {
                if (cell) {
                    left = cell.$el.position().left;
                } else {
                    var prevCell = self.indicators[indx - 1].data("column-cell");

                    left = prevCell.$el.position().left + prevCell.$el.width();
                }
                self.indicatorPositions[displayOrder] = {
                    x: left,
                    $el: $indicator
                };

                // Get handler for current column and update position
                $indicator.css("left", left);
            } catch (e) {
                //console.log(indx, $indicator, cell, displayOrder,e)
            }
        }
    });
    self.setIndicatorHeight();
};
/**
 * Overriding to catch missing columns errors
 * @method applyStateToColumns
 * @private
 */
Backgrid.Extension.ColumnManager.prototype.applyStateToColumns = function () {
    var self = this;

    // Loop state
    var ordered = false;
    try {

        _.each(this.state, function (columnState) {
            // Find column
            var column = self.columns.findWhere({
                name: columnState.name
            });
            if (typeof column !== 'undefined') {
                if (_.has(columnState, "renderable")) {
                    column.set("renderable", columnState.renderable);
                }
                if (_.has(columnState, "width")) {
                    var oldWidth = column.get("width");
                    column.set("width", columnState.width, {silent: true});
                    if (oldWidth !== columnState.width) {
                        column.trigger("resize", column, columnState.width, oldWidth);
                    }
                }

                if (_.has(columnState, "displayOrder")) {
                    if (columnState.displayOrder !== column.get("displayOrder")) {
                        ordered = true;
                    }
                    column.set("displayOrder", columnState.displayOrder, {silent: true});
                }
            }
        });
    } catch (e) {

    }

    if (ordered) {
        self.columns.sort();
        self.columns.trigger("ordered");
    }
};

/**
 * underscore template helper
 * @param id
 * @returns {Function}
 */
window.template = function (id) {
    return window.JST[id];
};

window.ajaxWaiting = function (action, selector) {
    let $el = $(selector);
    if ($el.is(':visible')) {
        if (action === 'show') {
            let t = window.template('ajaxSpinnerTemplate');
            if ($el.css('position') !== 'absolute') {
                $el.css('position', 'relative')
            }
            $el.append(t());
            $el.find('.ajax-spinner-overlay').css({width: $el.outerWidth(), height: $el.outerHeight()}).find('#floatingCirclesG').css('margin-top', ($el.outerHeight() / 2) - (125 / 2))
        } else {
            $el.find('.ajax-spinner-overlay').remove();
        }
    } else {
        try {
            $el.find('.ajax-spinner-overlay').remove();
        } catch (e) {
        }
    }
};

(function ($) {
    // Need this to unserialize the jquery $.serialize(form) string
    $.unserialize = function (serializedString) {
        serializedString = serializedString.replace(/&amp;/g, '&');

        let str = decodeURI(serializedString);
        let pairs = str.split('&');
        let obj = {}, p, idx, val;
        for (let i = 0, n = pairs.length; i < n; i++) {
            p = pairs[i].split('=');
            idx = p[0];

            if (idx.indexOf("[]") == (idx.length - 2)) {
                // Eh um vetor
                let ind = idx.substring(0, idx.length - 2)
                if (obj[ind] === undefined) {
                    obj[ind] = [];
                }
                obj[ind].push(p[1]);
            }
            else {
                obj[idx] = p[1];
            }
        }
        return obj;
    };
    // usage:
    // let oFormData = $.unserialize(oChosenQuoteRequest.form_data_qs)
})(jQuery);
/**
 * A way to extend backbone Models with existing Models
 */
(function (Model) {
    'use strict';
    // Additional extension layer for Models
    Model.fullExtend = function (protoProps, staticProps) {
        // Call default extend method
        let extended = Model.extend.call(this, protoProps, staticProps);
        // Add a usable super method for better inheritance
        extended.prototype._super = this.prototype;
        // Apply new or different defaults on top of the original
        if (protoProps.defaults) {
            for (let k in this.prototype.defaults) {
                if (!extended.prototype.defaults[k]) {
                    extended.prototype.defaults[k] = this.prototype.defaults[k];
                }
            }
        }
        return extended;
    };

})(Backbone.Model);
/**
 * A way to extend backbone Views with existing Views
 */
(function (View) {
    'use strict';
    // Additional extension layer for Views
    View.fullExtend = function (protoProps, staticProps) {
        // Call default extend method
        let extended = View.extend.call(this, protoProps, staticProps);
        // Add a usable super method for better inheritance
        extended.prototype._super = this.prototype;
        // Apply new or different events on top of the original
        if (protoProps.events) {
            for (let k in this.prototype.events) {
                if (!extended.prototype.events[k]) {
                    extended.prototype.events[k] = this.prototype.events[k];
                }
            }
        }
        return extended;
    };

})(Backbone.View);

/**
 * Catching Ajax session logged out scenario
 */
Backbone.ajax = function () {
    let resp = Backbone.$.ajax.apply(Backbone.$, arguments);
    resp.done(function (data, textStatus, jqXHR) {
        if (typeof data.SESSION_STATUS !== 'undefined' && data.SESSION_STATUS === 'NOT_LOGGED_IN') {
            window.location.href = '/login';
        }
        //console.log('done override', data,  textStatus, jqXHR);
    });
    return resp;
};
/*
Example of Model/View extension using fullExtend
let Car = Backbone.Model.extend({
  defaults:{
    engine: 'gasoline',
    hp: 0,
    doors: 4,
    color: 'generic'
  },
  engine: function(){
    return 'Wroomm';
  }
});

// Ferrari will have all attributes from Car Model
// But will also have it's own modifications
let Ferrari = Car.fullExtend({
  defaults: {
    hp: 500,
    color: 'red',
    doors: 2
  },
  // Engine method can use the engine method on Car too
  engine: function(){
    let ret = this._super.engine();
    return ret + '!!!!';
  }
});
 */

// Just defining this function here so it always
// exists in case dhayakawa/springintoaction/src/resources/assets/js/browser.console.logging.js
// goes missing somehow. browser.console.logging.js will override this function.
var _log = function () {console.log('!!_log feature is not working!!',arguments)};
$('#sia-modal').modal({
    backdrop: true,
    show: false,
    keyboard: false
});

(function (App) {
    App.Views.Backend = Backbone.View.fullExtend({
        close: function () {
            this.remove();
            // handle other unbinding needs, here
            if (!_.isUndefined(this.childViews)) {
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
            }
        },
    });
    App.Views.ManagedGrid = App.Views.Backend.fullExtend({

        refreshView: function (e) {
            let self = this;
            let currentModelID = 0;
            let $RadioElement = null;
            let $TableRowElement = null;
            _log('App.Views.ProjectTab.updateProjectTabView.event', 'event triggered:', e);
            if (typeof e === 'object' && !_.isUndefined(e.id) && !_.isUndefined(e.attributes)) {
                $RadioElement = self.$gridContainer.find('input[type="radio"][name="' + this.model.idAttribute + '"][value="' + e.id + '"]');
                $TableRowElement = $RadioElement.parents('tr');
            } else if (typeof e === 'object' && !_.isUndefined(e.target)) {
                $TableRowElement = $(e.currentTarget);
                $RadioElement = $TableRowElement.find('input[type="radio"][name="' + this.model.idAttribute + '"]');
            } else if (typeof e === 'object' && !_.isUndefined(e.data)) {
                if (self.$gridContainer.find('[type="radio"][name="' + this.model.idAttribute + '"]:checked').length === 0) {
                    $TableRowElement = self.$gridContainer.find('tbody tr:first-child');
                    $RadioElement = $TableRowElement.find('input[type="radio"]');
                } else {
                    $RadioElement = self.$gridContainer.find('[type="radio"][name="' + this.model.idAttribute + '"]:checked');
                    $TableRowElement = $RadioElement.parents('tr');
                }

            }
            self.$currentRow = $TableRowElement;

            if ($RadioElement !== null && $TableRowElement !== null) {
                // click is only a visual indication that the row is selected. nothing should be listening for this click
                $RadioElement.trigger('click');
                currentModelID = $RadioElement.val();

                // Highlight row
                $TableRowElement.siblings().removeAttr('style');
                $TableRowElement.css('background-color', App.Vars.rowBgColorSelected);

            }
            self.positionOverlays(self.backgrid);
            if (App.Vars.mainAppDoneLoading && currentModelID && $('#' + this.options.tab).data('current-model-id') !== currentModelID) {
                window.ajaxWaiting('show', self.backgridWrapperClassSelector);
                // Refresh tabs on new row select
                this.model.url = '/admin/' + self.options.tab + '/' + currentModelID;
                this.model.fetch({
                    reset: true,
                    success: function (model, response, options) {
                        self.currentModelID = self.model.get(self.model.idAttribute);
                        $('#' + self.options.tab).data('current-model-id', self.currentModelID);
                        //console.log('tab model fetch', self.options.tab, currentModelID, self.model)
                        window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                    },
                    error: function (model, response, options) {
                        window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                        growl(response.msg, 'error')
                    }
                });

            }

        },
        getModalForm: function () {
            return '';
        },
        showRadioBtnEditHelpMsg: function () {
            growl('Select/click the radio button at the beginning of the row to edit the data', 'info');
        },
        positionOverlays: function (e) {
            let self = this;
            let width, height;
            if (!_.isUndefined(self.$gridContainer)) {
                width = 0;
                self.$gridContainer.find('thead th:nth-child(n+3)').each(function (idx, el) {
                    width += parseInt($(el).outerWidth());
                });
                self.$el.find('.overlay-top,.overlay-bottom').css('width', width);
            } else {
                let ii = setInterval(function () {
                    let w = e.$el.find('thead th:nth-child(3)').outerWidth();

                    if (w > 0) {
                        width = 0;
                        e.$el.find('thead th:nth-child(n+3)').each(function (idx, el) {
                            width += parseInt($(el).outerWidth());
                        });
                        self.$el.find('.overlay-top,.overlay-bottom').css('width', width)
                        clearInterval(ii);
                    }
                }, 1000);
            }
            // get current row
            if (e && !self.$currentRow) {
                let $checkedInput = e.$el.find('[type="radio"][name$="ID"]:checked')
                if ($checkedInput.length) {
                    self.$currentRow = $checkedInput.parents('tr');
                }
            }

            if (!_.isNull(self.$currentRow) && !_.isUndefined(self.$currentRow[0])) {
                let rowHeight = self.$currentRow.outerHeight();
                let gridHeight = self.$currentRow.parents('.backgrid').outerHeight();
                //console.log('self.$currentRow', _.isUndefined(self.$currentRow[0].rowIndex), self.$currentRow)
                if (self.$el.find('table.backgrid tbody tr').length === 1) {
                    self.$el.find('.overlay-top,.overlay-bottom').hide();
                } else if (!_.isUndefined(self.$currentRow[0].rowIndex) && self.$currentRow[0].rowIndex === 1) {
                    self.$el.find('.overlay-top').hide();
                    self.$el.find('.overlay-bottom').show();
                    self.$el.find('.overlay-bottom').css({'top': (rowHeight * 2), 'height': gridHeight - (rowHeight * 2)})
                } else {
                    self.$el.find('.overlay-top').show();
                    self.$el.find('.overlay-top').css({'top': rowHeight, 'height': rowHeight * (self.$currentRow[0].rowIndex - 1)})
                    self.$el.find('.overlay-bottom').css({'top': (rowHeight * (1 + self.$currentRow[0].rowIndex)), 'height': gridHeight - (rowHeight * self.$currentRow[0].rowIndex) - rowHeight})
                }
            }
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
            //_log('App.Views.SiteVolunteer.showTruncatedCellContent.event', e, element, bOverflown);
        },
        hideTruncatedCellContentPopup: function (e) {
            let self = this;

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
    // Abstract Select View meant to be extended

    App.Views.SelectOption = Backbone.View.extend({
        tagName: 'option',
        initialize: function (options) {
            this.optionValueModelAttrName = options.optionValueModelAttrName;
            this.optionLabelModelAttrName = options.optionLabelModelAttrName;
            _.bindAll(this, 'render');
            this.html = '';
        },
        render: function () {
            let self = this;
            let label = '';
            let labels = [];
            if (_.isArray(this.optionLabelModelAttrName)){
                labels = _.map(this.optionLabelModelAttrName, function (value) {
                    return self.model.get(value);
                });
                for (let i in labels){
                    label += labels[i] + ' ';
                }
            } else {
                label = this.model.get(this.optionLabelModelAttrName);
            }
            $(this.el).attr('value', this.model.get(this.optionValueModelAttrName)).html(label);
            return this;
        }
    });

    App.Views.Select = Backbone.View.extend({
        tagName: 'select',
        initialize: function (options) {
            this.childViews = [];
            if (!_.isNull(options) && !_.isUndefined(options)){
                this.buildHTML = !_.isUndefined(options.buildHTML) ? options.buildHTML : false;
                this.setSelectedValue = !this.buildHTML && !_.isUndefined(options.setSelectedValue) ? options.setSelectedValue : null;
                this.optionValueModelAttrName = options.optionValueModelAttrName;
                this.optionLabelModelAttrName = options.optionLabelModelAttrName;
                if (!_.isUndefined(options.addBlankOption)) {
                    this.addBlankOption = options.addBlankOption;
                }
                if (!_.isUndefined(this.collection)) {
                    this.collection.bind('reset', this.addAll);
                }
            }
            this.html = '';
            _.bindAll(this, 'addOne', 'addAll', 'render', 'changeSelected', 'setSelectedId', 'getHtml');
        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (model) {
            let option = new App.Views.SelectOption({
                model: model,
                setSelectedValue: this.setSelectedValue,
                optionValueModelAttrName: this.optionValueModelAttrName,
                optionLabelModelAttrName: this.optionLabelModelAttrName
            });
            this.childViews.push(option);
            let optionHTML = option.render().el;

            $(this.el).append(optionHTML);

        },
        addAll: function () {
            this.collection.each(this.addOne);
        },
        render: function () {
            this.addAll();
            if (this.addBlankOption) {
                $(this.el).prepend('<option value=""></option>');
            }
            if (!_.isNull(this.setSelectedValue)) {
                $(this.el).val(this.setSelectedValue);
            }
            return this;
        },
        changeSelected: function () {
            this.setSelectedId($(this.el).val());
        },
        setSelectedId: function (id) {
            // Do something in child object
        },
        getHtml: function () {
            // Events are not triggered for this view when getHtml is called
            this.render();
            let $wrap = $('<div></div>').html(this.el);
            return $wrap.html();
        }
    });

    /**
     * Example of how to extend this select view
     * Your select view will have all attributes from App.Views.Select View
     * But will also have it's own modifications
     * App.Views.YourCustomSelect = App.Views.select.fullExtend({
            el: '.yourSelectElementSelector',
            collection: someCollection,
            optionValueModelAttrName: 'VolunteerID',
            optionLabelModelAttrName: 'VolunteerFullName',
            // Engine method can use the engine method on Car too
            setSelectedId: function (id) {
                // Do something in child object

                // Execute parent method too if you want
                //let ret = this._super.setSelectedId(id);

            }
        });
     */


})(window.App);
