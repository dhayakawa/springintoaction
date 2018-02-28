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
            _.bindAll(this, 'addOne', 'addAll');
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
            this.collection.each(this.addOne);
        },
        render: function () {
            this.addAll();
            return this;
        },
        changeSelected: function () {
            this.setSelectedId($(this.el).val());
        },
        setSelectedId: function (SiteID) {
            // fetch new site model
            App.Models.siteModel.url = 'site/' + SiteID;
            App.Models.siteModel.fetch();
            App.Collections.siteYearsDropDownCollection.url = 'site/year/' + SiteID;
            App.Collections.siteYearsDropDownCollection.fetch({reset: true});
        }
    });
    App.Views.SiteYearsOption = Backbone.View.extend({
        tagName: 'option',
        initialize: function () {
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
        initialize: function () {
            this.optionsView = [];
            _.bindAll(this, 'addOne', 'addAll', 'changeSelected');
            this.collection.bind('reset', this.addAll, this);
        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (site) {
            var option = new App.Views.SiteYearsOption({model: site});
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
            var $option = $(this.el).find(':selected');

            this.setSelectedId($option.data('siteid'), $option.data('sitestatusid'), $option.val());
        },
        setSelectedId: function (SiteID, SiteStatusID, Year) {
            if (App.Vars.mainAppDoneLoading) {
                // fetch new sitestatus
                App.Models.siteStatusModel.url = 'sitestatus/' + SiteStatusID;
                App.Models.siteStatusModel.fetch({reset: true});

                // fetch new product collection
                App.Collections.projectCollection.url = 'projects/' + SiteID + '/' + Year;
                App.Collections.projectCollection.fetch({
                    reset: true,
                    success: function (model, response, options) {
                        //console.log('project collection fetch success', model, response, options)
                        App.Vars.currentProjectID = response[0]['ProjectID'];
                        App.Models.projectModel.set(response[0])

                    }
                });


            }
        }
    });

    /**
     * This is the site form
     */
    App.Views.Site = Backbone.View.extend({
        tagName: 'div',
        template: template('siteTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'update');
            this.model.on('set', this.render, this);
            this.model.on('destroy', this.remove, this); // 3.
        },
        events: {
            'change input[type="text"]': 'update',
            'click .edit': 'edit',
            'click strong': 'showAlert',
            'click .delete': 'destroy'	/// 1. Binding a Destroy for the listing to click event on delete button..
        },
        showAlert: function () {
            alert('you clicked me');
        },
        edit: function () {
            var newName = prompt("Please enter the new Site Name", this.model.get('SiteName'));
            if (!newName) return;  // don't do anything if cancel is pressed..
            this.model.set('name', newName);
        },
        destroy: function () {
            this.model.destroy();  // 2. calling backbone js destroy function to destroy that model object
        },
        remove: function () {
            this.$el.remove();  // 4. Calling Jquery remove function to remove that HTML li tag element..
        },
        update: function (e) {

            var attrName = $(e.target).attr('name');
            var attrValue = $(e.target).val();
            this.model.url = 'site/' + this.model.get('SiteID');
            this.model.save({[attrName]: attrValue},
                {
                    success: function (model, response, options) {
                        growl(response.msg, 'success')
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'success')
                    }
                });
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
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
            var $target = $(e.target);
            var attrType = $target.attr('type');
            var attrName = $target.attr('name');
            var attrValue = $target.val();

            var selected = $target.is(':checked');
            if (attrType === 'checkbox') {
                attrValue = selected ? 1 : 0;
            }
            //console.log('attrType:' + attrType, 'selected: ', selected, 'attrName:' + attrName, 'value: ', attrValue);
            this.model.url = 'site/' + this.model.get('SiteStatusID');
            this.model.save({[attrName]: attrValue},
                {
                    success: function (model, response, options) {
                        growl(response.msg, 'success')
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'success')
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
            var checkedBoxes = {
                'ProjectDescriptionCompleteIsChecked': this.model.get('ProjectDescriptionComplete') === 1 ? 'checked' : '',
                'BudgetEstimationCompleteIsChecked': this.model.get('BudgetEstimationComplete') === 1 ? 'checked' : '',
                'VolunteerEstimationCompleteIsChecked': this.model.get('VolunteerEstimationComplete') === 1 ? 'checked' : '',
                'VolunteerAssignmentCompleteIsChecked': this.model.get('VolunteerAssignmentComplete') === 1 ? 'checked' : '',
                'BudgetActualCompleteIsChecked': this.model.get('BudgetActualComplete') === 1 ? 'checked' : '',
                'EstimationCommentsIsChecked': this.model.get('EstimationComments') === 1 ? 'checked' : ''
            };
            this.$el.html(this.template(_.extend(this.model.toJSON(), checkedBoxes)));
            return this;
        }
    });
})(window.App);
