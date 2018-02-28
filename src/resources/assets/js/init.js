window.App = {
    Models: {},
    Collections: {},
    Views: {},
    Router: {},
    Vars: {}
};


/**
 * underscore template helper
 * @param id
 * @returns {Function}
 */
window.template = function (id) {
    return _.template($('#' + id).html());
};

/**
 * A way to extend backbone Models with existing Models
 */
(function (Model) {
    'use strict';
    // Additional extension layer for Models
    Model.fullExtend = function (protoProps, staticProps) {
        // Call default extend method
        var extended = Model.extend.call(this, protoProps, staticProps);
        // Add a usable super method for better inheritance
        extended.prototype._super = this.prototype;
        // Apply new or different defaults on top of the original
        if (protoProps.defaults) {
            for (var k in this.prototype.defaults) {
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
        var extended = View.extend.call(this, protoProps, staticProps);
        // Add a usable super method for better inheritance
        extended.prototype._super = this.prototype;
        // Apply new or different events on top of the original
        if (protoProps.events) {
            for (var k in this.prototype.events) {
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
var Car = Backbone.Model.extend({
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
var Ferrari = Car.fullExtend({
  defaults: {
    hp: 500,
    color: 'red',
    doors: 2
  },
  // Engine method can use the engine method on Car too
  engine: function(){
    var ret = this._super.engine();
    return ret + '!!!!';
  }
});
 */
App.Vars.yesNoCell = Backgrid.Extension.Select2Cell.extend({
    // any options specific to `select2` goes here
    select2Options: {
        // default is false because Backgrid will save the cell's value
        // and exit edit mode on enter
        openOnEnter: false
    },
    optionValues: [{values: [['No', 0], ['Yes', 1]]}],
    // since the value obtained from the underlying `select` element will always be a string,
    // you'll need to provide a `toRaw` formatting method to convert the string back to a
    // type suitable for your model, which is an integer in this case.
    formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
        toRaw: function (formattedValue, model) {
            return formattedValue === null ? [] : _.map(formattedValue, function (v) {
                return parseInt(v);
            })
        }
    })
});

App.Vars.budgetSourceCell = Backgrid.Extension.Select2Cell.extend({
    // any options specific to `select2` goes here
    select2Options: {
        // default is false because Backgrid will save the cell's value
        // and exit edit mode on enter
        openOnEnter: false
    },
    optionValues: [{
        values: [
            ['PTO', 'PTO'],
            ['School', 'School'],
            ['School (OLC funds)', 'School (OLC funds)'],
            ['District', 'District'],
            ['Woodlands', 'Woodlands'],
            ['Grant', 'Grant'],
            ['CF Grant', 'CF Grant'],
            ['Thrivent', 'Thrivent'],
            ['Unknown', 'Unknown']
        ]
    }]

});

App.Vars.sendCell = Backgrid.Extension.Select2Cell.extend({
    // any options specific to `select2` goes here
    select2Options: {
        // default is false because Backgrid will save the cell's value
        // and exit edit mode on enter
        openOnEnter: false
    },
    optionValues: [{
        values: [
            ['Not Ready', 'Not Ready'],
            ['Ready', 'Ready'],
            ['Sent', 'Sent']
        ]
    }]
});
