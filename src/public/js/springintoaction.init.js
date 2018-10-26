// Global object for spring into action backbone app
window.App = {
    Models: {
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
        reportModel: null
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
        projectAttachmentsCollection: null
    },
    Collections: {
        allProjectsCollection: null,
        annualBudgetsManagementCollection: null,
        contactsManagementCollection: null,
        projectVolunteersCollection: null,
        sitesDropDownCollection: null,
        siteYearsDropDownCollection: null,
        reportsManagementCollection: null,
        projectsDropDownCollection:null
    },
    Views: {
        dashboardView: {},
        siteManagementView: {},
        siteYearsDropDownView: {},
        projectManagementView: {},
        siteProjectTabsView: {},
        projectsView: {},
        contactsManagementView: {},
        volunteersManagementView: {},
        budgetManagementView: {},
        reportsManagementView: {}
    },
    Templates: {},
    Router: {},
    Vars: {
        bBackgridColumnManagerSaveState: false,
        // Turn on the console logging
        bAllowConsoleOutput: 1,
        bAllowConsoleOutputHiLite: 1,
        bAllowConsoleVarGroupsOutput: 1,
        rowBgColorSelected: '#e3f6b1',
        workerRoleID: 4,
        appInitialData: {},
        selectOptions:{},
        devMode: false,

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
 * underscore template helper
 * @param id
 * @returns {Function}
 */
window.template = function (id) {
    return window.JST[id];
};

window.ajaxWaiting = function (action, selector) {
    let $el = $(selector);
    if (action === 'show'){

        let t = window.template('ajaxSpinnerTemplate');
        if ($el.css('position') !== 'absolute'){
            $el.css('position','relative')
        }
        $el.append(t());
        $el.find('.ajax-spinner-overlay').css({width:$el.outerWidth(),height:$el.outerHeight()}).find('#floatingCirclesG').css('margin-top',($el.outerHeight()/2)-(125/2))
    } else {
        $el.find('.ajax-spinner-overlay').remove();
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

/**
 * Browser console logging helper
 * @returns {boolean}
 */
function objExists(objToTest) {
    return !_.isNull(objToTest) && !_.isUndefined(objToTest);
}

/**
 * Debugging vars and functionality
 */
{
    // When App.Vars.bAllowConsoleOutput = 1, the console log output can be overwhelming.
    // To only see the output from specific functions, add the function name to the aLimitLog array
    App.Vars.aLimitLog = [];//[];
    App.Vars.aVarsDebugGroups = ['App.Vars.CollectionsGroup', 'App.Vars.ModelsGroup', 'App.Vars.SettingsGroup'];
    App.Vars.bAllowConsoleTrace = false;
    App.Vars.ajaxCalls = {};
    // Number increment for the console debug calls
    App.Vars.iOrderOfExecution = 0;
    App.Vars.aLogColors = {
        'red': 'color:red;',
        'green': 'color:green;',
        'blue': 'color:blue;',
        'black': 'color:black;',
        'purple': 'color:purple;',
        'orange': 'color:orange;',
        'teal': 'color:teal;'
    };
    // Styles the console.debug for high lighting output
    App.Vars.sLogStyles = 'background-color: yellow; font-weight: bolder; font-family: arial;'
    // override console.debug so I can force some logs to stand out as errors
    if (App.Vars.bAllowConsoleOutput && App.Vars.bAllowConsoleOutputHiLite) {
        (function () {
            let exConsoleDebug = console.debug;
            let exConsoleError = console.error;
            let aHiLiteLog = ['manageChangedAddressEvents'];
            let oHiLiteArg = {'manageChangedAddressEvents': ['pageUpdateStarted', 'pageUpdateModifyModalMsg', 'pageUpdateDone']}
            // The log color will default to red unless it's customize here
            let aHiLiteLogColor = {'pageUpdateDone': 'teal'};
            console.debug = function (msg) {
                App.Vars.iOrderOfExecution++;
                let callTime = window.performance.now().toFixed(2);
                let sOrderOfExecution = App.Vars.iOrderOfExecution + '(' + callTime + ') ';
                // Prepend an order of execution string to each log

                //console.log('console.debug',console.debug)
                let args = _.values(arguments);
                let sFakeMethod = objExists(args[0]) ? args[0] : false;
                //console.log('console.debug', sFakeMethodZero, sFakeMethodOne, typeof args[0], args[0]);
                [].unshift.call(arguments, sOrderOfExecution);
                if (sFakeMethod) {
                    if ((aHiLiteLog.length === 0 || (aHiLiteLog.length && -1 !== $.inArray(sFakeMethod, aHiLiteLog)))) {
                        let sHiLiteColorKey = sFakeMethod;
                        let bRequiresAdditionalArgsForError = typeof oHiLiteArg[sFakeMethod] !== 'undefined';
                        let bFormatLog = !bRequiresAdditionalArgsForError || (bRequiresAdditionalArgsForError && (function (a1, a2) {
                            let a1Length = a1.length;
                            for (let i = 0; i < a1Length; i++) {
                                if (-1 !== $.inArray(a1[i], a2)) {
                                    sHiLiteColorKey = a1[i];
                                    return true;
                                }
                            }
                            return false;
                        })(oHiLiteArg[sFakeMethod], arguments));

                        if (bFormatLog) {
                            // concat first two array elements for formatting so it stands out more
                            let tmpArg = arguments[0];
                            [].shift.call(arguments);
                            arguments[0] = "%c" + tmpArg + arguments[0];
                            let sLogColor = typeof aHiLiteLogColor[sHiLiteColorKey] !== 'undefined' && typeof App.Vars.aLogColors[aHiLiteLogColor[sHiLiteColorKey]] !== 'undefined' ? App.Vars.aLogColors[aHiLiteLogColor[sHiLiteColorKey]] : App.Vars.aLogColors.purple;
                            [].splice.call(arguments, 1, 0, sLogColor + App.Vars.sLogStyles);
                            exConsoleDebug.apply(this, arguments);
                            return;
                        }
                    }
                }
                exConsoleDebug.apply(this, arguments);
            }
        })()
    }
}

/**
 * Browser console logging helper.
 * Required to be called from a function
 * @returns {boolean}
 */
function allowConsoleOutput(calledFrom) {
    //console.log('App.Vars.bAllowConsoleOutput:'+App.Vars.bAllowConsoleOutput,'calledFromGroup:'+ calledFrom, allowConsoleOutput)
    if (App.Vars.bAllowConsoleOutput) {
        let bCheckCalledFrom = objExists(calledFrom) && calledFrom !== '';
        if (!bCheckCalledFrom) {
            return true;
        } else if (bCheckCalledFrom && (App.Vars.aLimitLog.length === 0 || (App.Vars.aLimitLog.length && -1 !== $.inArray(calledFrom, App.Vars.aLimitLog)))) {
            if (!App.Vars.bAllowConsoleVarGroupsOutput && -1 !== $.inArray(calledFrom, App.Vars.aVarsDebugGroups)) {
                return false;
            }
            return true;
        }
    }
    return false;
}

/**
 * Browser console logging helper.
 * @returns {boolean}
 */
window._log = function() {

    if (allowConsoleOutput(arguments[0])) {
        // Sends the first parameter to represent the calledFrom method
        let args = _.values(arguments);
        let calledFrom = args.shift();
        console.debug(calledFrom, args)
    }
};

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
            let optionHTML = new App.Views.SelectOption({
                model: model,
                setSelectedValue: this.setSelectedValue,
                optionValueModelAttrName: this.optionValueModelAttrName,
                optionLabelModelAttrName: this.optionLabelModelAttrName
            }).render().el;
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
