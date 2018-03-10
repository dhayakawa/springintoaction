/*
  Backgrid select-filter extension
  http://github.com/amiliaapp/backgrid-select-filter

  Copyright (c) 2014 Amilia Inc.
  Written by Martin Drapeau
  Licensed under the MIT @license
 */
(function () {
    var BackGridFiltersPanelSelectFilter = Backgrid.Extension.BackGridFiltersPanelSelectFilter = Backbone.View.extend({
        tagName: "select",
        className: "backgrid-filter",
        template: _.template([
            "<% for (var i=0; i < options.length; i++) { %>",
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
}).call(this);
