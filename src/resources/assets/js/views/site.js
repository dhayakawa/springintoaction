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
            _.bindAll(this, 'addOne', 'addAll', 'render','changeSelected','setSelectedId');
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
            _log('App.Views.Sites.addAll', 'sites dropdown');
            this.$el.empty();
            this.collection.each(this.addOne);
        },
        render: function () {
            this.addAll();
            // Force related views to update
            this.changeSelected();
            return this;
        },
        changeSelected: function () {
            this.setSelectedId($(this.el).val());
        },
        setSelectedId: function (SiteID) {
            let self = this;
            _log('App.Views.Sites.setSelectedId.event', 'new site selected', SiteID);
            // fetch new site model
            App.Models.siteModel.url = '/admin/site/' + SiteID;
            App.Models.siteModel.fetch();
            App.Collections.siteYearsDropDownCollection.url = '/admin/sitestatus/all/site/years/' + SiteID;
            App.Collections.siteYearsDropDownCollection.fetch({reset: true});

            if (typeof self.parentView !== 'undefined' ) {
                self.trigger('site-id-change', {SiteID: SiteID});
                console.log('trigger site-id-change', self.parentView.$el.hasClass('reports-management-view'))
            }
        }
    });
    App.Views.SiteYearsOption = Backbone.View.extend({
        tagName: 'option',
        initialize: function (options) {
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
        initialize: function (options) {
            this.options = options;
            this.optionsView = [];
            this.parentView = this.options.parentView;
            _.bindAll(this, 'addOne', 'addAll', 'changeSelected','setSelectedId','refocusSiteVolunteerRecord');
            this.collection.bind('reset', this.addAll, this);
        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (site) {
            let option = new App.Views.SiteYearsOption({model: site});
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
            let self = this;
            let $option = $(self.el).find(':selected');

            self.setSelectedId($option.data('siteid'), $option.data('sitestatusid'), $option.val());
        },
        setSelectedId: function (SiteID, SiteStatusID, Year) {
            let self = this;
            if (App.Vars.mainAppDoneLoading) {
                _log('App.Views.SiteYears.setSelectedId.event', 'new year selected', SiteID, SiteStatusID, Year);

                if (self.parentView.$el.hasClass('site-management-view')) {
                    window.ajaxWaiting('show', '#site-well');
                    window.ajaxWaiting('show', '#site-status-well');
                    window.ajaxWaiting('show', '#site-volunteers-well');
                }
                // fetch new sitestatus
                App.Models.siteStatusModel.url = '/admin/sitestatus/' + SiteStatusID;
                App.PageableCollections.siteVolunteersRoleCollection.url = '/admin/site_volunteer/all/' + SiteStatusID;
                $.when(
                    App.Models.siteStatusModel.fetch({reset: true}),
                    App.PageableCollections.siteVolunteersRoleCollection.fetch({reset: true})
                ).then(function () {
                    //initialize your views here
                    _log('App.Views.Site.create.event', 'site collection fetch promise done');

                    if (self.parentView.$el.hasClass('site-management-view')) {
                        window.ajaxWaiting('remove', '#site-well');
                        window.ajaxWaiting('remove', '#site-status-well');
                        window.ajaxWaiting('remove', '#site-volunteers-well');
                        if (App.PageableCollections.siteVolunteersRoleCollection.length) {
                            App.Vars.currentSiteVolunteerRoleID = App.PageableCollections.siteVolunteersRoleCollection.at(0).get('SiteVolunteerRoleID');
                            App.Models.siteVolunteerRoleModel.set(App.PageableCollections.siteVolunteersRoleCollection.at(0));
                            self.refocusSiteVolunteerRecord();
                        }
                    }
                    if (!self.parentView.$el.hasClass('site-management-view')) {
                        self.trigger('site-status-id-change', {SiteStatusID: SiteStatusID});
                    }
                });
            }
        },
        refocusSiteVolunteerRecord: function () {
            let self = this;
            let recordIdx = 1;
            App.Views.siteVolunteersView.paginator.collection.fullCollection.each(function (model, idx) {

                if (model.get(App.Models.siteVolunteerRoleModel.idAttribute) === App.Vars.currentSiteVolunteerRoleID) {
                    recordIdx = idx;
                }
            });
            recordIdx = recordIdx === 0 ? 1 : recordIdx;
            let page = Math.ceil(recordIdx / App.Views.siteVolunteersView.paginator.collection.state.pageSize)
            if (page > 1) {
                _.each(this.paginator.handles, function (handle, idx) {
                    if (handle.pageIndex === page && handle.label === page) {
                        //console.log(handle, handle.pageIndex, handle.el)
                        $(handle.el).find('a').trigger('click')
                    }
                })
            }
            //console.log(recordIdx, this.paginator.collection.state.pageSize, page, this.backgrid, this.paginator, this.backgrid.collection)
            self.$el.find('input[type="radio"][name="SiteVolunteerRoleID"][value="' + App.Vars.currentSiteVolunteerRoleID + '"]').parents('tr').trigger('focusin');
        },
    });

    /**
     * This is the site form
     */
    App.Views.Site = Backbone.View.extend({
        tagName: 'div',
        template: template('siteTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(this, 'update');
            this.listenTo(this.model, 'change', function (e) {
                self.render();
            });
            this.listenTo(this.model, 'set', function (e) {
                self.render();
            });
            // this.model.on('change', this.render, this);
            // this.model.on('set', this.render, this);
        },
        events: {
            'change input[type="text"]': 'update'
        },
        update: function (e) {

            let attrName = $(e.target).attr('name');
            let attrValue = $(e.target).val();
            this.model.url = '/admin/site/' + this.model.get('SiteID');
            this.model.save({[attrName]: attrValue},
                {
                    success: function (model, response, options) {
                        growl(response.msg, response.success ? 'success' : 'error');
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'error')
                    }
                });
        },
        render: function () {
            this.model.set('disabled', !App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager ? 'disabled' : '');
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        getModalForm: function () {
            let template = window.template('siteTemplate');

            let tplVars = {
                SiteID: '',
                SiteName: 'test',
                EquipmentLocation: 'test',
                DebrisLocation: 'test'
            };
            return template(tplVars);
        },
        create: function (attributes) {
            let self = this;
            window.ajaxWaiting('show', '#site-well');
            attributes = _.omit(attributes, 'SiteID');
            _log('App.Views.Site.create', attributes, this.model);
            let newModel = new App.Models.Site();
            newModel.url = '/admin/site';
            newModel.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        App.Collections.sitesDropDownCollection.url = '/admin/site/list/all';
                        $.when(
                            App.Collections.sitesDropDownCollection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            _log('App.Views.Site.create.event', 'site collection fetch promise done');
                            window.ajaxWaiting('remove', '#site-well');
                            App.Views.sitesDropDownView.$el.val(response.new_site_id)
                            App.Views.sitesDropDownView.$el.trigger('change')
                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error');
                        window.ajaxWaiting('remove', '#site-well');
                    }
                });
        },
        destroy: function () {
            let self = this;
            _log('App.Views.Project.destroy', self.model);
            self.model.destroy({
                success: function (model, response, options) {
                    window.growl(response.msg, response.success ? 'success' : 'error');
                    App.Collections.sitesDropDownCollection.url = '/admin/site/list/all';
                    $.when(
                        App.Collections.sitesDropDownCollection.fetch({reset: true})
                    ).then(function () {
                        //initialize your views here
                        _log('App.Views.Site.destroy.event', 'site collection fetch promise done');
                        window.ajaxWaiting('remove', '#site-well');
                        App.Views.sitesDropDownView.$el.trigger('change')
                    });
                },
                error: function (model, response, options) {
                    window.growl(response.msg, 'error');
                    window.ajaxWaiting('remove', '#site-well');
                }
            });
        }
    });

    App.Views.SiteStatus = Backbone.View.extend({
        template: template('siteStatusTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(this, 'update');
            this.listenTo(this.model, 'change', function (e) {
                self.render();
            });
            this.listenTo(this.model, 'destroy', function (e) {
                self.remove();
            });
            // this.model.on('change', this.render, this);
            // this.model.on('destroy', this.remove, this); // 3.
        },
        events: {
            'click input[type="checkbox"]': 'update',
            'change input[type="text"]': 'update',
            'click .delete': 'destroy'	/// 1. Binding a Destroy for the listing to click event on delete button..
        },
        update: function (e) {
            let $target = $(e.target);
            let attrType = $target.attr('type');
            let attrName = $target.attr('name');
            let attrValue = $target.val();

            let selected = $target.is(':checked');
            if (attrType === 'checkbox') {
                attrValue = selected ? 1 : 0;
            }
            //console.log('attrType:' + attrType, 'selected: ', selected, 'attrName:' + attrName, 'value: ', attrValue);
            this.model.url = '/admin/sitestatus/' + this.model.get('SiteStatusID');
            this.model.save({[attrName]: attrValue},
                {
                    success: function (model, response, options) {
                        growl(response.msg, response.success ? 'success' : 'error');
                    },
                    error: function (model, response, options) {
                        growl(response.msg, 'error')
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
            let checkedBoxes = {
                'ProjectDescriptionCompleteIsChecked': this.model.get('ProjectDescriptionComplete') === 1 ? 'checked' : '',
                'BudgetEstimationCompleteIsChecked': this.model.get('BudgetEstimationComplete') === 1 ? 'checked' : '',
                'VolunteerEstimationCompleteIsChecked': this.model.get('VolunteerEstimationComplete') === 1 ? 'checked' : '',
                'VolunteerAssignmentCompleteIsChecked': this.model.get('VolunteerAssignmentComplete') === 1 ? 'checked' : '',
                'BudgetActualCompleteIsChecked': this.model.get('BudgetActualComplete') === 1 ? 'checked' : '',
                'EstimationCommentsIsChecked': this.model.get('EstimationComments') === 1 ? 'checked' : ''
            };
            this.model.set('disabled', !App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager ? 'disabled' : '');
            this.$el.html(this.template(_.extend(this.model.toJSON(), checkedBoxes)));
            window.ajaxWaiting('remove', '#site-well');
            return this;
        }
    });
})(window.App);
