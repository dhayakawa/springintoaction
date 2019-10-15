(function (App) {

    let BackGridFiltersPanelSelectFilter = Backgrid.Extension.BackGridFiltersPanelSelectFilter = App.Views.Backend.fullExtend({
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
    let BackGridFiltersPanelClientSideFilter = Backgrid.Extension.BackGridFiltersPanelClientSideFilter = App.Views.Backend.fullExtend({
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

    App.Views.BackGridFiltersPanel = App.Views.Backend.fullExtend({
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
