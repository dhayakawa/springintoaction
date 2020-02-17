(function (App) {
    // Abstract Select View meant to be extended

    App.Views.SelectOption = Backbone.View.extend({
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

    App.Views.Select = Backbone.View.extend({
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
