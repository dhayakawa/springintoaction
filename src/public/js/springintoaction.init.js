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
        projectBudgetModel: null,
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
    Views: {},
    Templates: {},
    Router: {},
    Vars: {
        bAllowBackgridInlineEditing: true,
        bAllowCSVFileImports: false,
        bAllowManagedGridColumns: false,
        bBackgridColumnManagerSaveState: false,
        bBackgridColumnManagerLoadStateOnInit: false,
        // Turn on the console logging
        bAllowConsoleOutput: true,
        bAllowConsoleOutputHiLite: false,
        bAllowConsoleVarGroupsOutput: false,
        rowBgColorSelected: '#e3f6b1',
        workerRoleID: 4,
        appInitialData: {},
        selectOptions:{},
        devMode: true,
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
// (function (Model) {
//     'use strict';
//     // Additional extension layer for Models
//     Model.fullExtend = function (protoProps, staticProps) {
//         // Call default extend method
//         let extended = Model.extend.call(this, protoProps, staticProps);
//         // Add a usable super method for better inheritance
//         extended.prototype._super = this.prototype;
//         // Apply new or different defaults on top of the original
//         if (protoProps.defaults) {
//             for (let k in this.prototype.defaults) {
//                 if (!extended.prototype.defaults[k]) {
//                     extended.prototype.defaults[k] = this.prototype.defaults[k];
//                 }
//             }
//         }
//         return extended;
//     };
//
// })(Backbone.Model);
/**
 * A way to extend backbone Views with existing Views
 */
/*(function (View) {
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

})(Backbone.View);/**/

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
    App.Views.BaseView = Backbone.View.extend({
        bModelExpected: false,
        childViews:[],
        extendableOptions: ['viewName','managedGridView','parentView','ajaxWaitingTargetClassSelector'],
        extendableProperties: {
            "events": "defaults",
            "className": function (propertyName, prototypeValue) {
                this[propertyName] += " " + prototypeValue;
            },
            "viewName": null,
            "childViews":[]
        },

        extendProperties: function (properties) {
            var propertyName, prototypeValue, extendMethod,
                prototype = this.constructor.prototype;
            var cnt = 0;
            while (prototype) {
                for (propertyName in properties) {
                    if (propertyName === 'mainApp') {
                        console.log({cnt: cnt, prototype: prototype, propertyName: propertyName, 'properties.hasOwnProperty(propertyName)': properties.hasOwnProperty(propertyName),'prototype.hasOwnProperty(propertyName)': prototype.hasOwnProperty(propertyName), this: this})
                    }
                    if (properties.hasOwnProperty(propertyName) && prototype.hasOwnProperty(propertyName)) {
                        prototypeValue = _.result(prototype, propertyName);
                        extendMethod = properties[propertyName];

                        if (!this.hasOwnProperty(propertyName)) {
                            this[propertyName] = prototypeValue;

                        } else if (_.isFunction(extendMethod)) {
                            extendMethod.call(this, propertyName, prototypeValue);
                        } else if (extendMethod === "defaults") {
                            _.defaults(this[propertyName], prototypeValue);
                        }
                    }

                }
                // console.log({cnt: cnt,prototype: prototype, properties: properties,this:this})
                prototype = prototype.constructor.__super__;
                cnt++;
            }
        },

        constructor: function () {
            if (this.extendableProperties) {
                // First, extend the extendableProperties by collecting all the extendable properties
                // defined by classes in the prototype chain.
                this.extendProperties({"extendableProperties": "defaults"});

                // Now, extend all the properties defined in the final extendableProperties object
                this.extendProperties(this.extendableProperties);
            }

            //this.options = arguments[0];
            if (this.extendableOptions) {
                let opts = arguments[0];
                var props = _.pick(opts, this.extendableOptions);
                _.extend(this, props);
            }

            Backbone.View.apply(this, arguments);
            //console.log('constructor', {extendableProperties: this.extendableProperties, arguments: arguments,this:this})
        }
    });

    App.Views.Backend = App.Views.BaseView.extend({
        events: {
            'click [data-role="switcher"]': 'toggleYesNoSwitch',
            'change [data-role="switcher"] > input[type="checkbox"]': 'toggleYesNoSwitch',
        },
        _initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'close', 'getViewDataStore', 'setViewDataStoreValue', 'removeViewDataStore', 'removeChildViews', 'getViewClassName', 'toggleYesNoSwitch');
            } catch (e) {
                console.error(options, e)
            }
            self.__init(options);
        },
        __init: function(options){
            let self = this;
            self.options = options;
            self._validateRequiredOptions(self.options);
            self.setModelRoute();
        },
        _validateRequiredOptions: function(options) {
            let self = this;
            if (_.isUndefined(options.viewName) && _.isUndefined(self.__proto__.viewName)) {
                console.error("options.viewName is a required option", {self: self, options: options});
                throw "options.viewName is a required option";
            }
        },
        close: function () {
            let self = this;
            self._close();
        },
        _close: function () {
            let self = this;
            self.$el.hide();
            // handle other unbinding needs, here
            if (!_.isUndefined(self.childViews)) {
                _.each(self.childViews, function (childView) {
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
            self.remove();

        },
        removeChildViews: function () {
            let self = this;
            //console.log('App.Views.SiteProjectTabs removeChildViews ');
            _.each(self.childViews, function (view) {
                view.remove();
            });
            //_log(self.getViewClassName() + '.removeChildViews.event', 'trigger removed-child-views');
            self.trigger('removed-child-views');
        },
        getViewClassName: function () {
            let self = this;
            return self.constructor.name;
        },
        getModalElement: function () {
            return $('#sia-modal');
        },
        getModalForm: function () {
            return '';
        },
        getViewDataStore: function (data, _viewName) {
            let self = this;
            let viewName = !_.isUndefined(_viewName) ? _viewName : self.viewName;
            let dataStore = localStorage.getItem(viewName);
            //console.log('getViewDataStore', {self: self, viewName: viewName, _viewName: _viewName, dataStore: dataStore, data: data})
            if (dataStore) {
                dataStore = JSON.parse(dataStore);
                if (data === null && !_.isUndefined(_viewName)) {
                    return dataStore;
                } else if (!_.isUndefined(data) && !_.isUndefined(dataStore[data])) {
                    return dataStore[data];
                } else if (!_.isUndefined(data)) {
                    return null;
                }
            } else {
                dataStore = null;
            }
            //console.log('getViewDataStoreValue', {'viewName': viewName, dataStore: dataStore, data: data})
            return dataStore;
        },
        setViewDataStoreValue: function (data, value, _viewName) {
            let self = this;
            let viewName = !_.isUndefined(_viewName) ? _viewName : self.viewName;
            let origDataStore = self.getViewDataStore(null, viewName);
            let dataStore = self.getViewDataStore(null, viewName);
            if (_.isNull(dataStore)) {
                dataStore = {};
            }
            if (_.isString(value)) {
                if (value.match(/^\d+$/)) {
                    value = parseInt(value);
                } else if (value.match(/^\d*\.\d+$/)) {
                    value = parseFloat(value);
                }
            }
            dataStore[data] = value;
            //console.log('setViewDataStoreValue', {self: self, viewName: viewName, origDataStore: origDataStore, data: data, value: value})
            localStorage.setItem(viewName, JSON.stringify(dataStore));
            if (_.isUndefined(viewName)) {
                console.error('setViewDataStoreValue', {self: self, origDataStore: origDataStore, data: data, value: value})
            }
        },
        removeViewDataStore: function (_viewName) {
            let self = this;
            let viewName = !_.isUndefined(_viewName) ? _viewName : self.viewName;
            localStorage.removeItem(viewName);
        },
        findModelRoute: function(model) {
            let self = this;
            let bFoundRoute = true;
            let viewModel = !_.isUndefined(self.model) && !_.isNull(self.model) ? self.model : !_.isUndefined(self.options.model) && !_.isNull(self.options.model)? self.options.model : null;
            model = !_.isUndefined(model) ? model : viewModel;

            if (_.isNull(model) && !_.isUndefined(self.collection) && self.collection.length){
                model = self.collection.at(0);
            } else if (_.isNull(model) && !_.isUndefined(self.options.collection) && self.options.collection.length){
                model = self.options.collection.at(0);
            }
            if (_.isUndefined(model) || _.isNull(model)) {
                let bShowError = true;
                if ((!_.isUndefined(self.viewName) && self.viewName.match(/(management|toolbar)/)) ||
                    (!_.isUndefined(self.options.viewName) && self.options.viewName.match(/(management|toolbar)/))){
                    bShowError = false;
                }
                if (bShowError && self.bModelExpected) {
                    console.error('findModelRoute missing model', {self: self, options: self.options});
                }
                self.modelRoute = '';
            } else {
                //console.log({model: model,url: model.__proto__.url, self: self, options: self.options})
                if (!_.isUndefined(model.__proto__.url)) {
                    self.modelRoute = model.__proto__.url;
                } else {
                    self.modelRoute = '';
                    bFoundRoute = false;
                    if (self.bModelExpected) {
                        console.log('model.__proto__.url was undefined', {model: model, url: model.__proto__, self: self, options: self.options})
                    }
                }
                if (!bFoundRoute && self.bModelExpected) {
                    console.error('findModelRoute', {self: self, options: self.options,viewName: self.viewName, modelRoute: self.modelRoute, model: model, protoUrl: !_.isUndefined(model.__proto__) ? model.__proto__ : 'proto url not set', superIdAttributeOrUrl: !_.isUndefined(model._super) ? model._super : '_super not set'});
                }

            }
            return self.modelRoute;
        },
        getModelRoute: function (model) {
            let self = this;
            if (_.isUndefined(self.modelRoute)) {
                self.modelRoute = self.findModelRoute(model);
            }
            return self.modelRoute;
        },
        setModelRoute: function (modelRoute) {
            let self = this;
            if (!_.isUndefined(modelRoute)) {
                self.modelRoute = modelRoute;
                //console.log('setModelRoute modelRoute passed in', modelRoute, {self: self, options: self.options});
            } else{
                self.modelRoute = self.findModelRoute();
            }
        },
        getModelUrl: function (modelId) {
            let self = this;
            let modelQS = '';
            if (!_.isUndefined(modelId)) {
                if (!_.isString(modelId)) {
                    modelId = modelId.toString();
                }
                modelQS =  '/' + modelId;
            }
            let modelRoute = self.getModelRoute();
            if (modelRoute === '') {
                console.error('getModelUrl getModelRoute was set to ""', {modelRoute: modelRoute,self: self, viewName: self.viewName, modelId: modelId});
                throw self.viewName + ' getModelUrl getModelRoute was set to ""';
            }

            return modelRoute + modelQS;
        },
        findCollectionRoute: function(collection){
            let self = this;
            let viewCollection = !_.isUndefined(self.collection) && !_.isNull(self.collection) ? self.collection : !_.isUndefined(self.options.collection) && !_.isNull(self.options.collection) ? self.options.collection : null;
            collection = !_.isUndefined(collection) ? collection : viewCollection;

            //console.log('findCollectionRoute',{collection: collection, options: self.options, self: self})
            if (!_.isUndefined(collection) || !_.isNull(collection)) {
                if (!_.isUndefined(collection.__proto__.url)) {
                    self.collectionRoute = collection.__proto__.url;
                } else {
                    self.collectionRoute = '';
                    }
            }
            return self.collectionRoute;
        },
        getCollectionRoute: function(collection){
            let self = this;
            if (_.isUndefined(self.collectionRoute)) {
                self.collectionRoute = self.findCollectionRoute(collection);
            }
            return self.collectionRoute;
        },
        getCollectionUrl: function (qs) {
            let self = this;

            qs = _.isUndefined(qs) ? self.getCollectionQueryString() : qs;
            if (!_.isString(qs)){
                qs = qs.toString();
            }
            if (qs !== '' && !qs.match(/^\//)) {
                qs = '/' + qs;
            }
            let collectionRoute = self.getCollectionRoute();
            if (collectionRoute==='') {
                let modelRoute = self.getModelRoute();
                collectionRoute = modelRoute + '/list/all' + qs;
            }

            //console.error('getCollectionUrl', {collectionRoute: collectionRoute, self: self, viewName: self.viewName, qs: qs, options: self.options})
            return collectionRoute + qs;
        },
        getCollectionQueryString: function () {
            return '';
        },
        handleSiteIDChange: function (e) {
            let self = this;

            self.setViewDataStoreValue('current-site-id', e[self.sitesDropdownView.model.idAttribute]);
        },
        handleSiteStatusIDChange: function (e) {
            let self = this;

            self.setViewDataStoreValue('current-site-status-id', e[self.siteYearsDropdownView.model.idAttribute]);
        },
        toggleYesNoSwitch: function (e) {
            // handles click and manually setting the value
            let $checkbox, $label;
            if (e.currentTarget.nodeName === 'INPUT') {
                $checkbox = $(e.currentTarget);
                $label = $checkbox.parent().find('.admin__actions-switch-text');
                if ($checkbox.val() === 0 || $checkbox.val() === '0') {
                    $checkbox.prop('checked', false);
                } else {
                    $checkbox.prop('checked', true);
                }
                //console.log({'$checkbox': $checkbox, '$label': $label, e: e})
            } else if (e.currentTarget.nodeName === 'DIV') {
                let $switch = $(e.currentTarget);

                $checkbox = $switch.find('.admin__actions-switch-checkbox');
                $label = $switch.find('.admin__actions-switch-text');
                // We can't trigger a click on the checkbox input to set the checked property or we'll get an event loop of click/change
                if ($checkbox.prop('checked')) {
                    $checkbox.prop('checked', false);
                    $checkbox.val(0);
                } else {
                    $checkbox.prop('checked', true);
                    $checkbox.val(1);
                }
            }

            if ($checkbox.prop('checked')) {
                $label.text('Yes');
            } else {
                $label.text('No');
            }
        },
    });

    App.Views.Management = App.Views.Backend.extend({
        bModelExpected: false,
        events: {

        },
        _initialize: function (options) {
            let self = this;

            try {
                _.bindAll(self,
                    'render',

                );
            } catch (e) {
                console.error(options, e)
            }
            self.__init(options);

        },
        renderSiteDropdowns: function () {
            let self = this;
            //console.log({'current-site-id': self.getViewDataStore('current-site-id'), 'current-site-status-id': self.getViewDataStore('current-site-status-id')})
            self.sitesDropdownView = new self.sitesDropdownViewClass({
                el: self.$('select#sites'),
                model: new App.Models.Site(),
                collection: new App.Collections.Site(App.Vars.appInitialData.sites),
                parentView: self,
                selectedSiteID: self.getViewDataStore('current-site-id'),
                            });
            self.siteYearsDropdownView = new self.siteYearsDropdownViewClass({
                el: self.$('select#site_years'),
                parentView: this,
                model: new App.Models.SiteYear(),
                collection: new App.Collections.SiteYear(App.Vars.appInitialData.site_years),
                sitesDropdownView: self.sitesDropdownView,
                selectedSiteStatusID: self.getViewDataStore('current-site-status-id'),
                            });
            self.listenTo(self.sitesDropdownView, 'site-id-change', self.handleSiteIDChange);
            self.sitesDropdownView.render();
            self.childViews.push(self.sitesDropdownView);
            self.listenTo(self.siteYearsDropdownView, 'site-status-id-change', self.handleSiteStatusIDChange);
            self.siteYearsDropdownView.render();

            self.childViews.push(self.siteYearsDropdownView);
        }
    });

    App.Views.GridManagerContainerToolbar = App.Views.Backend.extend({
        bModelExpected: false,
        events: {
            'click .btnAdd': 'addGridRow',
            'click .btnEdit': 'editGridRow',
            'click .btnDeleteChecked': 'deleteCheckedRows',
            'click .btnClearStored': 'clearStoredColumnState',
        },
        template: template('gridManagerContainerToolbarTemplate'),
        _initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'addGridRow', 'deleteCheckedRows', 'clearStoredColumnState', 'setStickyColumns');
            } catch (e) {
                console.error(options, e)
            }

            self.__init(options);
            self.bAppend = !_.isUndefined(self.options.bAppend) ? self.options.bAppend : false;

            if (_.isUndefined(self.options.managedGridView)) {
                console.error("options.managedGridView is a required option", self);
                throw "options.managedGridView is a required option";
            }

            self.singleModelName = self.managedGridView.modelNameLabel.replace(/s$/, '');
            self.templateVars = {btnLabel: self.singleModelName};
        },
        getAddBtn: function () {
            let self = this;
            return self.$el.find('.btnAdd');
        },
        getEditBtn: function() {
            let self = this;
            return self.$el.find('.btnEdit');
        },
        getDeleteCheckedBtn: function() {
            let self = this;
            return self.$el.find('.btnDeleteChecked');
        },
        getFileUploadsContainer: function () {
            let self = this;
            return self.$el.find('.file-upload-container');
        },
        getResetColumnsBtn: function () {
            let self = this;
            return self.$el.find('.btnClearStored');
        },
        _render: function () {
            let self = this;

            if (self.bAppend) {
                self.$el.append(self.template(self.templateVars));
            }else{
                self.$el.html(self.template(self.templateVars));
            }
            // initialize all file upload inputs on the page at load time
            self.initializeFileUploadObj(self.$el.find('input[type="file"]'));
            let managedGridViewFunctions = _.functions(self.managedGridView);
            //console.log('hide edit btn?',{viewName:self.viewName, 'self.$el': self.$el,'btn-edit-model': self.$el.find('.btn-edit-model'),indexOf: _.indexOf(managedGridViewFunctions, 'getEditForm'), hide: _.indexOf(managedGridViewFunctions, 'getEditForm') === -1})
            if (_.indexOf(managedGridViewFunctions,'getEditForm') === -1){
                self.getEditBtn().hide();
            }
            if (!App.Vars.bAllowManagedGridColumns) {
                self.getResetColumnsBtn().hide();
            }
            if (!App.Vars.bAllowCSVFileImports) {
                self.getFileUploadsContainer().hide();
            }
            return self;
        },
        render: function () {
            let self = this;
            self._render();

            return this;
        },
        close: function () {
            let self = this;
            try {
                self.$el.find('input[type="file"]').fileupload('destroy');
            } catch (e) {
            }
            self._close();
        },
        initializeFileUploadObj: function (el) {
            let self = this;
            $(el).fileupload({
                url: self.managedGridView.getModelRoute() + '/list/upload',
                dataType: 'json',
                done: function (e, data) {
                    let self = this;
                    $('#file_progress_' + self.id).fadeTo(0, 'slow');
                    $('#file_' + self.id).val('')
                    $('#file_chosen_' + self.id).empty()
                    $.each(data.files, function (index, file) {
                        let sFileName = file.name
                        let sExistingVal = $('#file_' + self.id).val().length > 0 ? $('#file_' + self.id).val() + ',' : '';
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
                    let self = this
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
            var self = this;
            e.preventDefault();
            self.getModalElement().one('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('New ' + self.singleModelName);
                modal.find('.modal-body').html(self.managedGridView.getModalForm());

                modal.find('.save.btn').one('click', function (e) {
                    e.preventDefault();
                    self.managedGridView.create($.unserialize(modal.find('form').serialize()));
                    self.getModalElement().modal('hide');
                });

            });
            self.getModalElement().modal('show');

        },
        deleteCheckedRows: function (e) {
            let self = this;
            e.preventDefault();
            if ($(e.target).hasClass('disabled')) {
                growl('Please check a box to delete a ' + self.singleModelName + '.');
                return;
            }
            bootbox.confirm("Do you really want to delete the checked " + self.managedGridView.modelNameLabel + "?", function (bConfirmed) {
                if (bConfirmed) {
                    let selectedModels = self.managedGridView.backgrid.getSelectedModels();
                    // clear or else the previously selected models remain as undefined
                    try {
                        self.managedGridView.backgrid.clearSelectedModels();
                    } catch (e) {
                    }
                    _log('App.Views.GridManagerContainerToolbar.deleteCheckedRows', {viewName: self.viewName, 'selectedModels': selectedModels});
                    let modelIDs = _.map(selectedModels, function (model) {
                        return model.get(self.managedGridView.model.idAttribute);
                    });

                    self.managedGridView.batchDestroy({deleteModelIDs: modelIDs});
                }
            });
        },
        clearStoredColumnState(e) {
            let self = this;
            e.preventDefault();
            if (!_.isUndefined(self.managedGridView.gridColumnSaveStateKey) && localStorage.getItem(self.managedGridView.gridColumnSaveStateKey)) {
                growl('Resetting ' + self.managedGridView.modelNameLabel + ' columns. Please wait while the page refreshes.', 'success');
                localStorage.removeItem(self.managedGridView.gridColumnSaveStateKey);
                location.reload();
            } else {
                growl('Automatically resetting ' + self.managedGridView.modelNameLabel + ' columns is not possible at the moment, Sorry. If you know how to, you can manually clear your browsers local storage using your browsers Dev Tool inspector or you can clear your browser history cache.', 'error');
            }
        },
        editGridRow: function (e) {
            let self = this;
            e.preventDefault();
            self.getModalElement().off().one('show.bs.modal', function (event) {
                let $modal = $(this);
                $modal.find('.modal-title').html('Edit ' + self.singleModelName);
                $modal.find('.modal-body').html(self.managedGridView.getEditForm());

                $modal.find('.save.btn').off().one('click', function (e) {
                    e.preventDefault();

                    let data = $.unserialize($modal.find('form').serialize());
                    // fix multi valued select values
                    // untested!!!!!!
                    _.each(data,  function (value,idx) {
                        if (_.isArray(value)) {
                            data[idx] = value.join();
                            console.log(idx, data[idx])
                        }
                    });

                    self.managedGridView.saveEditForm(data);
                    self.getModalElement().modal('hide');
                });

            });
            self.getModalElement().modal('show');

        },
        setStickyColumns: function (colIdx) {
            let self = this;
            // Doesn't work yet.
            return;

            self.managedGridView.find('.cloned-backgrid-table-wrapper').remove();
            let left = 0;
            let $backgridTable = self.managedGridView.find('table.backgrid');
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

    App.Views.ManagedGrid = App.Views.Backend.extend({
        bModelExpected: true,
        events: {
            'focusin tbody tr': 'refreshView',
            'mouseenter thead th button': 'showColumnHeaderLabel',
            'mouseenter tbody td': 'showTruncatedCellContentPopup',
            'mouseleave tbody td': 'hideTruncatedCellContentPopup',
            'click tbody td': 'hideTruncatedCellContentPopup',
            'click .overlay-top,.overlay-bottom': 'showRadioBtnEditHelpMsg',
        },
        _initialize: function (options) {
            let self = this;

            try {
                _.bindAll(self,
                    'close',
                    'removeChildViews',
                    'getViewClassName',
                    'batchDestroy',
                    'getModalForm',
                    'getModelRoute',
                    'hideTruncatedCellContentPopup',
                    'positionOverlays',
                    '_refreshView',
                    'renderGrid',
                    'setCurrentRow',
                    'setModelRoute',
                    'showColumnHeaderLabel',
                    'showRadioBtnEditHelpMsg',
                    'showTruncatedCellContentPopup',
                    'toggleDeleteBtn',
                    'refocusGridRecord',
                    'getViewDataStore',
                    'setViewDataStoreValue',
                    'removeViewDataStore',
                    'setGridManagerContainerToolbar',
                    'update'
                );
            } catch (e) {
                console.error(options, e)
            }

            self.__init(options);

            self.rowBgColor = 'lightYellow';
            self.$currentRow = null;
            self.currentModelID = null;
            self.bInitialGridLoadDone = false;
            if (_.isUndefined(self.options.ajaxWaitingTargetClassSelector)) {
                console.error("options.ajaxWaitingTargetClassSelector is a required option", self);
                throw "options.ajaxWaitingTargetClassSelector is a required option";
            }

            if (_.isUndefined(self.options.currentModelIDDataStoreSelector)) {
                console.error("options.currentModelIDDataStoreSelector is a required option", self);
                throw "options.currentModelIDDataStoreSelector is a required option";
            }
            self.currentModelIDDataStoreSelector = self.options.currentModelIDDataStoreSelector;
            if (_.isUndefined(self.options.columnCollectionDefinitions)) {
                console.error("options.columnCollectionDefinitions is a required option", self);
                throw "options.columnCollectionDefinitions is a required option";
            }
            self.columnCollectionDefinitions = self.options.columnCollectionDefinitions;
            if (_.isUndefined(self.options.parentView)) {
                console.error("options.parentView is a required option", self);
                throw "options.parentView is a required option";
            }

            self.$gridManagerContainerToolbar = null;

            if (_.isUndefined(self.options.modelNameLabel)) {
                console.error("options.modelNameLabel is a required option", self);
                throw "options.modelNameLabel is a required option";
            }
            self.modelNameLabel = self.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase();

            if (_.isUndefined(self.options.model)) {
                console.error("options.model is a required option", self);
                throw "options.model is a required option";
            }

            self.gridColumnSaveStateKey = '';
        },
        setGridManagerContainerToolbar: function ($gridManagerContainerToolbar) {
            let self = this;
            self.$gridManagerContainerToolbar = $gridManagerContainerToolbar;
        },
        renderGrid: function (e, saveStateKey) {
            let self = this;
            let colVisibilityControl, sizeAbleCol, sizeHandler, orderHandler, Header, hideCellCnt, initialColumnsVisible, colManager;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            self.$el.empty();
            self.columnCollectionDefinitions = self.options.columnCollectionDefinitions;
            self.columnCollection = self.columnCollectionDefinitions;
            self.gridColumnSaveStateKey = 'backgrid-colmgr-' + saveStateKey;
            if (App.Vars.bAllowManagedGridColumns) {
                hideCellCnt = self.options.hideCellCnt;
                self.columnCollection = new Backgrid.Extension.OrderableColumns.orderableColumnCollection(self.columnCollectionDefinitions);
                self.columnCollection.setPositions().sort();
                initialColumnsVisible = this.columnCollectionDefinitions.length - hideCellCnt;
                colManager = new Backgrid.Extension.ColumnManager(self.columnCollection, {
                    initialColumnsVisible: initialColumnsVisible,
                    trackSize: true,
                    trackOrder: true,
                    trackVisibility: true,
                    saveState: App.Vars.bBackgridColumnManagerSaveState,
                    saveStateKey: self.gridColumnSaveStateKey,
                    loadStateOnInit: App.Vars.bBackgridColumnManagerLoadStateOnInit,
                    stateChecking: "strict"
                });

                colVisibilityControl = new Backgrid.Extension.ColumnManagerVisibilityControl({
                    columnManager: colManager
                });
            }

            Header = Backgrid.Header;
            self.backgrid = new Backgrid.Grid({
                header: Header,
                columns: self.columnCollection,
                collection: self.collection
            });
            self.listenTo(self.backgrid, 'backgrid:rendered', function (e) {
                //console.log('set current row and set current-model-id in storage when backgrid:rendered',self.viewName)
                let currentModelID = self.setCurrentRow(e);
                // console.log('skipped setting current-model-id from backgrid:rendered',{e:e, currentModelID: currentModelID})
                self.setViewDataStoreValue('current-model-id', currentModelID);
            });

            self.$gridContainer = self.$el.html(self.backgrid.render().el);

            //self.$el.append('<div class="overlay-top"></div><div class="overlay-bottom"></div>');
            self.paginator = new Backgrid.Extension.Paginator({
                collection: self.collection
            });

            // Render the paginator
            self.parentView.$('.pagination-controls').html(self.paginator.render().el);

            if (App.Vars.bAllowManagedGridColumns) {
                // Add sizeable columns
                sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
                    collection: self.collection,
                    columns: self.columnCollection,
                    grid: self.backgrid
                });
                self.$gridContainer.find('thead').before(sizeAbleCol.render().el);
                // Add resize handlers
                sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                    sizeAbleColumns: sizeAbleCol,
                    saveColumnWidth: true
                });
                self.$gridContainer.find('thead').before(sizeHandler.render().el);

                // Make columns reorderable
                orderHandler = new Backgrid.Extension.OrderableColumns({
                    grid: self.backgrid,
                    sizeAbleColumns: sizeAbleCol
                });
                self.$gridContainer.find('thead').before(orderHandler.render().el);

                self.parentView.$('.columnmanager-visibilitycontrol-container').html(colVisibilityControl.render().el);
            }

            // When a backgrid cell's model is updated it will trigger a 'backgrid:edited' event which will bubble up to the backgrid's collection
            self.listenTo(self.backgrid.collection, 'backgrid:editing', self.refreshView);

            self.listenTo(self.backgrid.collection, 'reset', self.refreshView);

            self.listenTo(self.backgrid.collection, 'backgrid:edited', self.update);

            self.listenTo(self.backgrid.collection, 'backgrid:selected', self.toggleDeleteBtn);

            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);

            self.childViews.push(self.backgrid);
            self.childViews.push(self.paginator);
            if (App.Vars.bAllowManagedGridColumns) {
                self.childViews.push(colVisibilityControl);
                self.childViews.push(sizeAbleCol);
                self.childViews.push(sizeHandler);
                self.childViews.push(orderHandler);
            }
        },
        _refreshView: function (e) {
            let self = this;
            let currentModelID;

            /**
             * The checkbox does not select the record/row
             */
            if (!_.isUndefined(e.target) && e.target.nodeName === 'INPUT' && e.target.type === 'checkbox') {
                return;
            }
            _log(self.getViewClassName() + '.updateProjectTabView.event', 'event triggered:', e);
            currentModelID = self.setCurrentRow(e);

            self.positionOverlays(self.backgrid);

            //$('#' + this.options.tab).data('current-model-id')
            // console.log('_refreshView current row should be set', {viewName:self.viewName});
            // console.log('_refreshView current model id should be set to currentModelID value in storage', {viewName:self.viewName, currentModelID:currentModelID});
            if (App.Vars.mainAppDoneLoading && currentModelID && self.getViewDataStore('current-model-id') !== currentModelID) {
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                // Refresh tabs on new row select
                self.model.url = self.getModelUrl(currentModelID);
                self.model.fetch({
                    reset: true,
                    success: function (model, response, options) {
                        //console.log('_refreshView', {viewName: self.viewName, 'self.model': self.model, model:model});
                        self.currentModelID = self.model.get(self.model.idAttribute);
                        self.setViewDataStoreValue('current-model-id', self.model.get(self.model.idAttribute));
                        //console.log('_refreshView set current-model-id in storage', self.viewName, currentModelID, self.model)
                        window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                    },
                    error: function (model, response, options) {
                        window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                        growl(response.msg, 'error')
                    }
                });

            } else if (App.Vars.mainAppDoneLoading && !currentModelID) {
                //console.log('_refreshView set current-model-id in storage but did not fetch new model', self.viewName, currentModelID, self.model)
                self.setViewDataStoreValue('current-model-id', currentModelID);
            }
        },
        setCurrentRow: function (e) {
            let self = this;
            let currentModelID = null;
            let $RadioElement = null;
            let $TableRowElement = null;
            //console.log('setCurrentRow',{e:e})
            if (typeof e === 'object' && !_.isUndefined(e.fullCollection)) {

                if (e.fullCollection.models.length) {
                    $RadioElement = self.$gridContainer.find('input[type="radio"][name="' + self.model.idAttribute + '"][value="' + e.fullCollection.models[0].get(self.model.idAttribute) + '"]');
                    $TableRowElement = $RadioElement.parents('tr');
                }

            } else if (typeof e === 'object' && !_.isUndefined(e.id) && !_.isUndefined(e.attributes)) {

                $RadioElement = self.$gridContainer.find('input[type="radio"][name="' + self.model.idAttribute + '"][value="' + e.id + '"]');
                $TableRowElement = $RadioElement.parents('tr');
            } else if (typeof e === 'object' && !_.isUndefined(e.target)) {

                $TableRowElement = $(e.currentTarget);
                $RadioElement = $TableRowElement.find('input[type="radio"][name="' + self.model.idAttribute + '"]');
            } else if (typeof e === 'object' && !_.isUndefined(e.$el) && e.$el.hasClass('backgrid')) {

                if (_.isUndefined(self.$gridContainer)) {
                    if (_.isNumber(self.getViewDataStore('current-model-id'))) {
                        $RadioElement = e.$el.find('input[type="radio"][name="' + self.model.idAttribute + '"][value="' + self.getViewDataStore('current-model-id') + '"]');
                        $TableRowElement = $RadioElement.parents('tr');
                        //console.log('current current-model-id used', {vname: self.viewName, 'current-model-id': self.getViewDataStore('current-model-id')})
                    } else {
                        $TableRowElement = e.$el.find('tbody tr:first-child');
                        $RadioElement = $TableRowElement.find('input[type="radio"][name="' + self.model.idAttribute + '"]');
                        //console.log('current current-model-id not used', {vname: self.viewName,'current-model-id': self.getViewDataStore('current-model-id'), 'undefGridCont': _.isUndefined(self.$gridContainer)})
                    }
                } else {
                    if (_.isNumber(self.getViewDataStore('current-model-id'))) {
                        //console.log('current current-model-id used', {vname: self.viewName, 'current-model-id': self.getViewDataStore('current-model-id')})
                        $RadioElement = self.$gridContainer.find('input[type="radio"][name="' + self.model.idAttribute + '"][value="' + self.getViewDataStore('current-model-id') + '"]');
                        $TableRowElement = $RadioElement.parents('tr');
                    } else {
                        //console.log('current current-model-id not used', {vname: self.viewName, 'current-model-id': self.getViewDataStore('current-model-id')})
                        $TableRowElement = self.$gridContainer.find('tbody tr:first-child');
                        $RadioElement = $TableRowElement.find('input[type="radio"][name="' + self.model.idAttribute + '"]');
                    }
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
            try {
                self.positionOverlays(e);
            } catch (e) {
            }

            return currentModelID;
        },
        refocusGridRecord: function () {
            let self = this;
            let recordIdx = 1;
            if (_.isNumber(self.getViewDataStore('current-model-id'))) {
                self.paginator.collection.fullCollection.each(function (model, idx) {
                    if (model.get(self.model.idAttribute) == self.getViewDataStore('current-model-id')) {
                        recordIdx = idx;
                    }
                });
                recordIdx = recordIdx === 0 ? 1 : recordIdx;
                let page = Math.ceil(recordIdx / self.paginator.collection.state.pageSize);
                if (page > 1) {
                    _.each(self.paginator.handles, function (handle, idx) {
                        if (handle.pageIndex == page && handle.label == page) {
                            //console.log(handle, handle.pageIndex, handle.el)
                            $(handle.el).find('a').trigger('click')
                        }
                    })
                }
                //console.log(recordIdx, this.paginator.collection.state.pageSize, page, this.backgrid, this.paginator, this.backgrid.collection)
                self.$el.find('input[type="radio"][name="' + self.model.idAttribute + '"][value="' + self.getViewDataStore('current-model-id') + '"]').parents('tr').trigger('focusin');
            }
        },
        showRadioBtnEditHelpMsg: function () {
            growl('Select/click the radio button at the beginning of the row to edit the data', 'info');
        },
        positionOverlays: function (e) {
            let self = this;
            let width;
            /*if (!_.isUndefined(self.$gridContainer)) {
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
            }*/
            // get current row
            if (e && !self.$currentRow) {
                let $checkedInput = e.$el.find('[type="radio"][name="' + self.model.idAttribute + '"]:checked');
                if ($checkedInput.length) {
                    self.$currentRow = $checkedInput.parents('tr');
                }
            }

            if (!_.isNull(self.$currentRow) && !_.isUndefined(self.$currentRow[0])) {
                /*let rowHeight = self.$currentRow.outerHeight();
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
                }*/
                self.$currentRow.find('td').css("pointer-events", "auto");
            } else {
                self.backgrid.$el.find('tr td').css("pointer-events", "auto");
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
            //_log(self.getViewClassName() + '.showColumnHeaderLabel.event', e);
        },
        showTruncatedCellContentPopup: function (e) {
            let self = this;

            let $element = $(e.currentTarget);
            let element = e.currentTarget;
            if ($element.hasClass('select2-cell')) {
                return false;
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
        },
        toggleDeleteBtn: function (e) {
            let self = this;
            let selectedModels = self.backgrid.getSelectedModels();
            let toggleState = selectedModels.length === 0 ? 'disable' : 'enable';
            _log(self.viewName + '.toggleDeleteBtn.event', {'selectedModels.length':selectedModels.length, e:e, toggleState: toggleState});
            //console.log({viewName:self.viewName, toggleState: toggleState, gridManagerContainerToolbar: self.$gridManagerContainerToolbar})
            if (toggleState === 'disable') {
                self.$gridManagerContainerToolbar.$('.btnDeleteChecked').addClass('disabled');
            } else {
                self.$gridManagerContainerToolbar.$('.btnDeleteChecked').removeClass('disabled');
            }
        },
        batchDestroy: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);

            _log(self.viewName + ' batchDestroy', attributes);
            $.when(
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: self.getModelRoute() + '/batch/destroy',
                    data: attributes,
                    success: function (response) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.collection.url = self.getCollectionUrl();
                        $.when(
                            self.collection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            _log(self.viewName + '.destroy.event', self.modelNameLabelLowerCase + ' collection fetch promise done');
                        });
                    },
                    fail: function (response) {
                        window.growl(response.msg, 'error');
                    }
                })
            ).then(function () {
                window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            });

        },
        update: function (e) {
            let self = this;
            if (!_.isEmpty(e.changed)) {
                window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
                //console.log('update',{'self.model.idAttribute': self.model.idAttribute,'e.attributes[self.model.idAttribute]': e.attributes[self.model.idAttribute],e:e})
                let currentModelID = e.attributes[self.model.idAttribute];
                self.model.url = self.getModelUrl(currentModelID);
                $.when(
                    self.model.save(_.extend({[self.model.idAttribute]: currentModelID}, e.changed),
                        {
                            success: function (model, response, options) {
                                _log(self.viewName + '.update', self.modelNameLabelLowerCase + ' save', model, response, options);
                                growl(response.msg, response.success ? 'success' : 'error');
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
        create: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', this.ajaxWaitingTargetClassSelector);

            _log(this.viewName + '.create', attributes, self.model);
            let newModel = self.model.clone().clear({silent: true});
            newModel.url = self.getModelUrl();
            $.when(
                newModel.save(attributes,
                    {
                        success: function (model, response, options) {
                            window.growl(response.msg, response.success ? 'success' : 'error');
                            self.collection.url = self.getCollectionUrl();
                            $.when(
                                self.collection.fetch({reset: true})
                            ).then(function () {
                                //initialize your views here
                                _log(self.viewName + '.create.event', self.modelNameLabelLowerCase + ' collection fetch promise done');
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

    App.Views.ManagedGridTabs = App.Views.Backend.extend({
        bModelExpected: false,
        events: {
            'shown.bs.tab a[data-toggle="tab"]': 'toggleTabToolbars',
            'clear-child-views': 'removeChildViews'
        },
        _initialize: function (options) {
            let self = this;
            try {
                _.bindAll(self, 'toggleTabsBox', 'removeChildViews', 'toggleTabToolbars', 'clearCurrentIds','fetchIfNewID');
            } catch (e) {
                console.error(options, e)
            }

            self.__init(options);

            if (_.isUndefined(self.options.ajaxWaitingTargetClassSelector)) {
                console.error("options.ajaxWaitingTargetClassSelector is a required option", self);
                throw "options.ajaxWaitingTargetClassSelector is a required option";
            }


            if (_.isUndefined(self.options.managedGridView)) {
                console.error("options.managedGridView is a required option", self);
                throw "options.managedGridView is a required option";
            }

            self.childTabViews = [];
            self.childTabsGridManagerContainerToolbarViews = [];

            // self.model is App.Models.projectModel
            self.listenTo(self.model, "change", self.fetchIfNewID);
            self.listenTo(self.managedGridView, 'toggle-tabs-box', self.toggleTabsBox);
        },
        fetchIfNewID: function() {

        },
        toggleTabsBox: function () {
            let self = this;
            _log(self.viewName, 'self.managedGridView.collection.length:' + self.managedGridView.collection.length);

            if (self.managedGridView.collection.length === 0) {
                self.$el.find('.nav-tabs').hide();
                self.$el.find('.tabs-content-container').hide();
                self.$el.find('.box-footer').hide();
                App.Views.mainApp.$('h3.box-title small').html('No projects created yet.');
            } else {
                self.$el.find('.nav-tabs').show();
                self.$el.find('.tabs-content-container').show();
                self.$el.find('.box-footer').show();
            }
        },
        toggleTabToolbars: function (e) {
            let self = this;

            let clickedTab = $(e.currentTarget).attr('aria-controls');
            self.managedGridView.setViewDataStoreValue('current-tab', clickedTab);
            //App.Vars.currentTabModels[clickedTab]
            self.parentView.$('.tab-grid-manager-container').hide();
            self.parentView.$('.' + clickedTab + '.tab-grid-manager-container').show();
            //console.log({clickedTab: clickedTab, parentView: self.parentView, tabButtonPane: self.parentView.$('.' + clickedTab + '.tab-grid-manager-container')})
            // Hack to force grid columns to work
            $('body').trigger('resize');
        },
        removeChildViews: function () {
            let self = this;
            //console.log('App.Views.SiteProjectTabs removeChildViews ');
            _.each(this.childViews, function (view) {
                view.remove();
            });
            _log(self.viewName, '.removeChildViews.event', 'trigger removed-child-views');
            this.trigger('removed-child-views');
        },
        clearCurrentIds: function () {
            let self = this;
            let childTabViews = _.values(self.childTabViews);
            _.each(childTabViews, function (tab) {
                _.values(tab)[0].removeViewDataStore();
            });
        },
        updateMainAppBoxTitleContentPreFetchTabCollections: function (newId) {
            let self = this;
            App.Views.mainApp.$('h3.box-title small').html('Updating Tabs. Please wait...');
        },
        updateMainAppBoxTitleContentPostFetchTabCollections: function (newId) {
            let self = this;
            App.Views.mainApp.$('h3.box-title small').html('');
        }
    });
})(window.App);

(function (App) {
    // Abstract Select View meant to be extended

    App.Views.SelectOption = App.Views.Backend.extend({
        tagName: 'option',
        initialize: function (options) {
            let self = this;
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
                label = self.model.get(this.optionLabelModelAttrName);
            }
            this.$el.attr('value', self.model.get(this.optionValueModelAttrName)).html(label);
            return this;
        }
    });

    App.Views.Select = App.Views.Backend.extend({
        tagName: 'select',
        initialize: function (options) {
            let self = this;
            this.childViews = [];
            if (!_.isNull(options) && !_.isUndefined(options)){
                this.bAllowMultiple = !_.isUndefined(options.bAllowMultiple) ? options.bAllowMultiple : false;
                this.buildHTML = !_.isUndefined(options.buildHTML) ? options.buildHTML : false;
                this.setSelectedValue = !this.buildHTML && !_.isUndefined(options.setSelectedValue) ? options.setSelectedValue : null;
                this.optionValueModelAttrName = options.optionValueModelAttrName;
                this.optionLabelModelAttrName = options.optionLabelModelAttrName;
                this.addBlankOption = false;
                if (!_.isUndefined(options.addBlankOption)) {
                    this.addBlankOption = options.addBlankOption;
                }
                if (!_.isUndefined(this.collection)) {
                    self.listenTo(self.collection, "reset", self.addAll);
                }
            }
            this.html = '';
            _.bindAll(this, 'addOne', 'addAll', 'render', 'changeSelected', 'setSelectedId', 'getHtml');
        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (model) {
            let self = this;
            let option = new App.Views.SelectOption({
                model: model,
                setSelectedValue: this.setSelectedValue,
                optionValueModelAttrName: this.optionValueModelAttrName,
                optionLabelModelAttrName: this.optionLabelModelAttrName
            });
            this.childViews.push(option);
            let optionHTML = option.render().el;

            this.$el.append(optionHTML);

        },
        addAll: function () {
            let self = this;
            this.collection.each(this.addOne);
        },
        render: function () {
            let self = this;
            this.addAll();
            if (this.addBlankOption) {
                this.$el.prepend('<option value=""></option>');
            }
            if (this.bAllowMultiple) {
                this.$el.prop('multiple','multiple');
            }
            if (!_.isNull(this.setSelectedValue)) {
                this.$el.val(this.setSelectedValue);
            }
            return this;
        },
        changeSelected: function () {
            let self = this;
            this.setSelectedId(this.$el.val());
        },
        setSelectedId: function (id) {
            let self = this;
            // Do something in child object
        },
        getHtml: function () {
            let self = this;
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
     * App.Views.YourCustomSelect = App.Views.select.extend({
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
