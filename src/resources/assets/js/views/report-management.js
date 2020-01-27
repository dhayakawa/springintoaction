(function (App) {
    App.Views.ProjectsDropDownOption = App.Views.Backend.extend({
        tagName: 'option',
        initialize: function (options) {
            _.bindAll(this, 'render');
        },
        render: function () {
            let self = this;
            this.$el.attr('value', self.model.get('ProjectID'))
                .html(self.model.get('SequenceNumber'));
            return this;
        }
    });
    App.Views.ProjectsDropDown = App.Views.Backend.extend({
        initialize: function (options) {
            let self = this;
            this.options = options;
            this.optionsView = [];
            this.parentView = this.options.parentView;
            _.bindAll(this, 'addOne', 'addAll', 'changeSelected');
            self.listenTo(self.collection, "reset", self.addAll);
        },
        events: {
            "change": "changeSelected"
        },
        addOne: function (projectDropDown) {
            let option = new App.Views.ProjectsDropDownOption({model: projectDropDown});
            this.optionsView.push(option);
            this.$el.append(option.render().el);
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
            let $option = this.$el.find(':selected');
            if (!$option.length) {
                $option = this.$el.find(':first-child');
            }
            this.setSelectedId(this.parentView.$('select#site_years option').filter(':selected').text(), this.parentView.$('select#sites').val(), $option.val());
        },
        setSelectedId: function (Year, SiteID, ProjectID) {
            let self = this;
            if (App.Vars.mainAppDoneLoading) {
                _log('App.Views.ProjectsDropDown.setSelectedId.event', 'new project selected', ProjectID);
                self.parentView.setIFrame(Year, SiteID, ProjectID);
            }
        }
    });

    App.Views.ReportsManagement = App.Views.Management.extend({
        sitesDropdownViewClass: App.Views.SitesDropdown,
        siteYearsDropdownViewClass: App.Views.SiteYearsDropdown,
        projectsDropDownViewClass: App.Views.ProjectsDropDown,
        template: template('reportManagementTemplate'),
        initialize: function (options) {
            _.bindAll(this, 'render','handleSiteStatusIDChange');
            let self = this;
            self._initialize(options);
            this.viewClassName = this.options.viewClassName;
            this.viewName = 'App.Views.ReportsManagement';
            this.localStorageKey = self.modelNameLabel;
            this.backgridWrapperClassSelector = '.backgrid-wrapper';
            this.ajaxWaitingSelector = '.' + this.viewClassName + ' ' + this.backgridWrapperClassSelector;
            this.reportType = this.options.reportType;

            _log(this.viewName + '.initialize', options, this);
        },
        events: {},
        render: function () {
            let self = this;
            self.modelNameLabel = this.options.modelNameLabel;
            self.modelNameLabelLowerCase = self.modelNameLabel.toLowerCase().replace(' ', '_');
            this.$el.html(this.template({
                modelNameLabel: self.modelNameLabel,
                modelNameLabelLowerCase: self.modelNameLabelLowerCase
            }));
            self.renderSiteDropdowns();
            // this.sitesDropdownView = new this.sitesDropdownViewClass({
            //     el: this.$('select#sites'),
            //     parentView: this,
            //     collection: App.Collections.sitesDropDownCollection
            // });
            // this.sitesDropdownView.render();
            //
            //
            // this.siteYearsDropdownView = new this.siteYearsDropdownViewClass({
            //     el: this.$('select#site_years'),
            //     parentView: this,
            //     collection: App.Collections.siteYearsDropDownCollection
            // });
            // this.siteYearsDropdownView.render();

            this.projectsDropDownView = new this.projectsDropDownViewClass({
                el: this.$('select#projects'),
                parentView: this,
                collection: App.Collections.projectsDropDownCollection
            });
            this.projectsDropDownView.render();
            //console.log({reportType:this.reportType})

            if (this.reportType !== 'projects') {
                this.$('.project-dropdown').hide();
            } else {
                this.$('.project-dropdown').show();
            }

            if (this.reportType === 'sites') {
                this.$('.site-management-selects').hide();
            }
            if (this.reportType === 'projects_full') {
                self.$('.download-spreadsheet').hide();
                self.$('.download-pdf').hide();
                self.$('.download-csv').hide();
                this.addProjectAttributesFilters();
            }

            this.$('.site-management-selects').hide();
            this.$('.project-dropdown').hide();
            this.handleSiteStatusIDChange();
            window.ajaxWaiting('remove', self.ajaxWaitingSelector);

            return this;
        },
        handleSiteStatusIDChange: function (e) {
            let self = this;
            if (this.reportType !== 'projects') {
                self.setIFrame(this.$('select#site_years option').filter(':selected').text(), this.$('select#sites').val(), this.$('select#projects').val());
            } else {
                self.setIFrame(this.$('select#site_years option').filter(':selected').text(), this.$('select#sites').val());
            }
        },
        addProjectAttributesFilters: function(){
            let self = this;
            let cols = 3;
            let colCnt = 0;
            let attrCnt = 0;
            let currentCol = 1;

            self.attributesOptions = JSON.parse(JSON.stringify(App.Collections.attributesManagementCollection.getTableOptions('projects', false)));
            // add project model fields
            self.attributesOptions.unshift({id:0,attribute_code:'PeopleNeeded',label:'People Needed'});
            self.attributesOptions.unshift({id:0,attribute_code:'HasAttachments',label:'Has Attachments'});
            self.attributesOptions.unshift({id:0,attribute_code:'VolunteersAssigned',label:'Volunteers Assigned'});
            self.attributesOptions.unshift({id:0,attribute_code:'BudgetSources',label:'Budget Sources'});
            self.attributesOptions.unshift({id:0,attribute_code:'Comments',label:'Additional Notes'});
            self.attributesOptions.unshift({id:0,attribute_code:'ProjectDescription',label:'Project Description'});
            self.attributesOptions.unshift({id:0,attribute_code:'OriginalRequest',label:'Original Request'});
            self.attributesOptions.unshift({id:0,attribute_code:'SequenceNumber',label:'Project#'});
            self.attributesOptions.unshift({id:0,attribute_code:'Active',label:'Active'});

            self.projectAttributes = JSON.parse(JSON.stringify(App.Collections.projectAttributesManagementCollection.where({workflow_id: 1})));
            let skillsNeededOptions = App.Models.projectModel.getSkillsNeededOptions(false);
            let generalSkillsOptionId;
            _.each(skillsNeededOptions, function(val,idx){
                if(val[0]==='General'){
                    generalSkillsOptionId = val[1];
                }
            });
            self.generalProjectAttributeIds = _.pluck(_.where(self.projectAttributes, {project_skill_needed_option_id: parseInt(generalSkillsOptionId)}),'attribute_id');
            let primarySkillNeededAttribute = _.findWhere(self.attributesOptions, {attribute_code: "primary_skill_needed"});
            self.generalProjectAttributeIds.push(primarySkillNeededAttribute.id)
            self.generalProjectAttributeIds.sort(function(a, b) {
                return a - b;
            });
            self.$el.find('.report-wrapper').before('<fieldset class="attributes" style="border:1px solid beige;padding:10px"><legend style="border:0;font-size:14px;font-weight:bold">Include in report &nbsp;&nbsp;&nbsp;<a href="#" class="uncheck-all">uncheck all</a> :: <a href="#" class="check-all">check all</a> :: <a href="#"  class="check-only-general">check only attributes shared by all projects that are in the scope workflow</a> :: <a href="#" class="check-only-statuses">check only statuses</a></legend></fieldset>');
            let colsHtml = '';
            let colWidth = 12 / cols;
            for(let x=1;x<=cols;x++){
                colsHtml += '<div class="col-xs-'+colWidth+' attr-col'+x+'"></div>';
            }
            self.$el.find('fieldset.attributes').append('<form name="project_attributes" action="" method="GET"><div class="row">'+colsHtml+'</div></form>');

            let perCol = Math.floor(self.attributesOptions.length / cols);

            //console.log({cols:cols,attributesOptionsCnt:self.attributesOptions.length,perCol:perCol})
            //console.log({attributesOptions:self.attributesOptions,primarySkillNeededAttribute:primarySkillNeededAttribute});
            _.each(self.attributesOptions, function (attribute){
                if(attribute.attribute_code !== 'project_attachments' && attribute.attribute_code !== 'budget_sources'){
                    let checked = 'checked';

                    //console.log({perCol:perCol,attrCnt:attrCnt,mod:attrCnt % perCol,currentCol:currentCol})
                    if(attrCnt < perCol){
                        currentCol = 1;
                    } else if(currentCol !== cols && attrCnt % perCol === 0){
                        currentCol++;
                    }
                    let col = self.$el.find('form[name="project_attributes"] .attr-col' + currentCol);
                    let checkIdentifierClasses = '';
                    if(attribute.id === 0 || _.indexOf(self.generalProjectAttributeIds,attribute.id,true)!==-1){
                        checkIdentifierClasses += ' general-attribute ';
                    }
                    if(attribute.attribute_code.match(/(SequenceNumber|ProjectDescription|done|status|send)/)){
                        checkIdentifierClasses += ' status-attribute ';
                    }
                    col.append('<label class="project-attribute-checkbox-label checkbox-inline '+ checkIdentifierClasses +'" for="project_attribute_'+attribute.attribute_code+'"><input type="checkbox" '+checked+' id="project_attribute_'+attribute.attribute_code+'" name="project_attributes[]" value="'+attribute.attribute_code+'">'+attribute.label+'</label><br>');
                    attrCnt++;
                }

            });
            self.$('.attributes legend .uncheck-all').on('click', function(e){
                e.preventDefault();
                let $checkboxes = self.$el.find('form[name="project_attributes"]').find('input[type="checkbox"]');
                $checkboxes.each(function(idx,el){
                    $(el).prop('checked', false);
                    $(el).removeAttr('checked');
                })
            }).hover(function(e){
                self.$el.find('form[name="project_attributes"]').find('label').addClass('hilite-attribute-label');
            },function(e){
                self.$el.find('form[name="project_attributes"]').find('label').removeClass('hilite-attribute-label');
            });
            self.$('.attributes legend .check-all').on('click', function(e){
                e.preventDefault();
                let $checkboxes = self.$el.find('form[name="project_attributes"]').find('input[type="checkbox"]');
                $checkboxes.each(function(idx,el){
                    $(el).prop('checked', true);
                    $(el).attr('checked','checked');
                })
            }).hover(function(e){
                self.$el.find('form[name="project_attributes"]').find('label').addClass('hilite-attribute-label');
            },function(e){
                self.$el.find('form[name="project_attributes"]').find('label').removeClass('hilite-attribute-label');
            });


            self.$('.attributes legend .check-only-general').on('click', function(e){
                e.preventDefault();
                let $checkboxes = self.$el.find('form[name="project_attributes"]').find('input[type="checkbox"]');
                $checkboxes.each(function(idx,el){
                    $(el).prop('checked', false);
                    $(el).removeAttr('checked');
                });

                $checkboxes = self.$el.find('form[name="project_attributes"]').find('.general-attribute input[type="checkbox"]');
                $checkboxes.each(function(idx,el){
                    $(el).prop('checked', true);
                    $(el).attr('checked','checked');
                })
            }).hover(function(e){
                self.$el.find('form[name="project_attributes"]').find('label.general-attribute').addClass('hilite-attribute-label');
            },function(e){
                self.$el.find('form[name="project_attributes"]').find('label.general-attribute').removeClass('hilite-attribute-label');
            });

            self.$('.attributes legend .check-only-statuses').on('click', function(e){
                e.preventDefault();
                let $checkboxes = self.$el.find('form[name="project_attributes"]').find('input[type="checkbox"]');
                $checkboxes.each(function(idx,el){
                    $(el).prop('checked', false);
                    $(el).removeAttr('checked');
                });

                $checkboxes = self.$el.find('form[name="project_attributes"]').find('.status-attribute input[type="checkbox"]');
                $checkboxes.each(function(idx,el){
                    $(el).prop('checked', true);
                    $(el).attr('checked','checked');
                })
            }).hover(function(e){
                self.$el.find('form[name="project_attributes"]').find('label.status-attribute').addClass('hilite-attribute-label');
            },function(e){
                self.$el.find('form[name="project_attributes"]').find('label.status-attribute').removeClass('hilite-attribute-label');
            });

            // the link will be return in the initial response
            self.$el.on('click','.must-download-spreadsheet', function(e){
                e.preventDefault();
                self.$el.find('form[name="project_attributes"]').attr('action',this.href);
                self.$el.find('form[name="project_attributes"]').trigger('submit');
            })
        },
        setIFrame: function (Year, SiteID, ProjectID) {
            let self = this;
            switch (self.reportType) {
                case 'sites':
                    App.Models.reportModel.url = '/admin/report/'+ self.reportType+'/' + Year + '/' + SiteID + '/' + ProjectID;
                    break;
                case 'projects':
                    App.Models.reportModel.url = '/admin/report/'+ self.reportType+'/' + Year + '/' + SiteID + '/' + ProjectID;
                    break;
                    case 'early_start_projects':
                    App.Models.reportModel.url = '/admin/report/'+ self.reportType+'/' + Year + '/' + SiteID + '/' + ProjectID;
                    break;
                case 'volunteers':
                    App.Models.reportModel.url = '/admin/report/'+ self.reportType+'/' + Year + '/' + SiteID + '/' + ProjectID;
                    break;
                default:
                    App.Models.reportModel.url = '/admin/report/'+ self.reportType+'/' + Year + '/' + SiteID + '/' + ProjectID;
            }
            self.$('.download-pdf').attr('href', App.Models.reportModel.url + '/pdf');
            self.$('.download-csv').attr('href', App.Models.reportModel.url + '/csv');
            self.$('.download-spreadsheet').attr('href', App.Models.reportModel.url + '/spreadsheet');
            // fetch new report
            $.ajax({
                type: "get",
                dataType: "html",
                url: App.Models.reportModel.url,
                success: function (response) {
                    self.$('.report-wrapper').html(response)
                },
                fail: function (response) {
                    console.error(response)
                }
            })

        }
    });


})(window.App);
