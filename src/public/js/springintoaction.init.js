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
        bBackgridColumnManagerSaveState: true,
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
