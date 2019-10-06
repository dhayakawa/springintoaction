(function (App) {

    /**
     * This is the site form
     */
    App.Views.Site = App.Views.Backend.fullExtend({
        viewName: 'sites-view',
        tagName: 'div',
        template: template('siteTemplate'),
        initialize: function (options) {
            let self = this;

            _.bindAll(this, 'update');
            self._initialize(options);
            self.sitesDropDownView = options.sitesDropDownView;
            this.listenTo(self.model, 'change', self.render);
            this.listenTo(self.model, 'set', self.render);
        },
        events: {
            'change input[type="text"]': 'update'
        },
        update: function (e) {
            let self = this;
            let attrName = $(e.target).attr('name');
            let attrValue = $(e.target).val();
            self.model.url = self.getModelUrl(self.model.get('SiteID'));
            self.model.save({[attrName]: attrValue},
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
            let self = this;
            self.model.set('disabled', !App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager ? 'disabled' : '');
            this.$el.html(this.template(self.model.toJSON()));
            return this;
        },
        getModalForm: function () {
            let self = this;
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
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            attributes = _.omit(attributes, self.model.idAttribute);
            _log('App.Views.Site.create', attributes, self.model);
            let newModel = new App.Models.Site();
            newModel.url = self.getModelUrl();
            newModel.save(attributes,
                {
                    success: function (model, response, options) {
                        window.growl(response.msg, response.success ? 'success' : 'error');
                        self.sitesDropDownView.collection.url = self.sitesDropDownView.getCollectionUrl();
                        $.when(
                            self.sitesDropDownView.collection.fetch({reset: true})
                        ).then(function () {
                            //initialize your views here
                            _log('App.Views.Site.create.event', 'site collection fetch promise done. new_site_id:' + response.new_site_id);
                            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                            self.sitesDropDownView.$el.val(response.new_site_id.toString());
                            self.sitesDropDownView.$el.trigger('change');

                        });
                    },
                    error: function (model, response, options) {
                        window.growl(response.msg, 'error');
                        window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                    }
                });
        },
        destroy: function () {
            let self = this;
            window.ajaxWaiting('show', self.ajaxWaitingTargetClassSelector);
            _log('App.Views.Site.destroy', self.model);
            self.model.destroy({
                success: function (model, response, options) {
                    window.growl(response.msg, response.success ? 'success' : 'error');
                    self.sitesDropDownView.collection.url = self.sitesDropDownView.getCollectionUrl();
                    $.when(
                        self.sitesDropDownView.collection.fetch({reset: true})
                    ).then(function () {
                        //initialize your views here
                        _log('App.Views.Site.destroy.event', 'site collection fetch promise done');
                        window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                        self.sitesDropDownView.$el.trigger('change')
                    });
                },
                error: function (model, response, options) {
                    window.growl(response.msg, 'error');
                    window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
                }
            });
        }
    });

    App.Views.SiteStatus = App.Views.Backend.fullExtend({
        viewName: 'site-status-view',
        template: template('siteStatusTemplate'),
        initialize: function (options) {
            let self = this;
            _.bindAll(this, 'update');
            self._initialize(options);
            self.sitesDropDownView = options.sitesDropDownView;
            self.listenTo(self.model, 'change', self.render);
            self.listenTo(self.model, 'destroy', self.remove);
        },
        events: {
            'click input[type="checkbox"]': 'update',
            'change textarea': 'update',
            'click .delete': 'destroy'
        },
        update: function (e) {
            let self = this;
            let $target = $(e.target);
            let attrType = $target.attr('type');
            let attrName = $target.attr('name');
            let attrValue = $target.val();

            let selected = $target.is(':checked');
            if (attrType === 'checkbox') {
                attrValue = selected ? 1 : 0;
            }
            //console.log('attrType:' + attrType, 'selected: ', selected, 'attrName:' + attrName, 'value: ', attrValue);
            self.model.url = self.getModelUrl(self.model.get(self.model.idAttribute));
            self.model.save({[attrName]: attrValue},
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
            let self = this;
            self.model.destroy();  // 2. calling backbone js destroy function to destroy that model object
        },
        remove: function () {
            let self = this;
            this.$el.remove();  // 4. Calling Jquery remove function to remove that HTML li tag element..
        },
        render: function () {
            let self = this;
            let checkedBoxes = {
                'ProjectDescriptionCompleteIsChecked': self.model.get('ProjectDescriptionComplete') === 1 ? 'checked' : '',
                'BudgetEstimationCompleteIsChecked': self.model.get('BudgetEstimationComplete') === 1 ? 'checked' : '',
                'VolunteerEstimationCompleteIsChecked': self.model.get('VolunteerEstimationComplete') === 1 ? 'checked' : '',
                'VolunteerAssignmentCompleteIsChecked': self.model.get('VolunteerAssignmentComplete') === 1 ? 'checked' : '',
                'BudgetActualCompleteIsChecked': self.model.get('BudgetActualComplete') === 1 ? 'checked' : '',
                'EstimationCommentsIsChecked': self.model.get('EstimationComments') === 1 ? 'checked' : ''
            };
            self.model.set('disabled', !App.Vars.Auth.bIsAdmin && !App.Vars.Auth.bIsProjectManager ? 'disabled' : '');
            this.$el.html(this.template(_.extend(self.model.toJSON(), checkedBoxes)));
            window.ajaxWaiting('remove', self.ajaxWaitingTargetClassSelector);
            return this;
        }
    });
})(window.App);
