(function (App) {
    App.Collections.DashboardPanel = Backbone.Collection.extend({
        model: App.Models.DashboardPanel
    });
    App.Collections.DashboardPanelLinksListItem = Backbone.Collection.extend({
        model: App.Models.DashboardPanelLinksListItem
    });
})(window.App);

(function (App) {
    App.Collections.SiteSetting = Backbone.Collection.extend({
        url:'/admin/site_setting/list/all',
        model: App.Models.SiteSetting
    });
})(window.App);

(function (App) {
    App.Collections.ProjectAttachment = Backbone.Collection.extend({
        url: '/admin/project_attachment/list/all',
        model: App.Models.ProjectAttachment
    });

    App.PageableCollections.ProjectAttachment            = Backbone.PageableCollection.extend({
        url: '/admin/project_attachment/list/all',
        model: App.Models.ProjectAttachment,
        state: {
            pageSize: 5000
        },
        mode: "client" // page entirely on the client side
    });
    App.Vars.ProjectAttachmentsBackgridColumnDefinitions = [
        {
            // name is a required parameter, but you don't really want one on a select all column
            name: "",
            label: "",
            // Backgrid.Extension.SelectRowCell lets you select individual rows
            cell: "select-row",
            // Backgrid.Extension.SelectAllHeaderCell lets you select all the row on a page
            headerCell: "select-all",
            resizeable: false,
            orderable: false,
            width: "30"
        },
        {
            name: "ProjectAttachmentID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="ProjectAttachmentID" value="' + rawValue + '" />';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30"
        },
        {
            name: "AttachmentPath",
            label: "Attachment URL",
            cell: "uri",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "*"
        }
    ];
    if (!App.Vars.bAllowBackgridInlineEditing) {
        _.each(App.Vars.ProjectAttachmentsBackgridColumnDefinitions, function (value, key) {
            value.editable = false;
        });
    }
    _log('App.Vars.CollectionsGroup', 'App.Vars.ProjectAttachmentsBackgridColumnDefinitions:', App.Vars.ProjectAttachmentsBackgridColumnDefinitions);
})(window.App);

(function (App) {
    App.Collections.AnnualBudget = Backbone.Collection.extend({
        url: '/admin/annualbudget/list/all',
        model: App.Models.Budget
    });

    App.PageableCollections.ProjectBudget = Backbone.PageableCollection.extend({
        url: '/admin/project_budget/list/all',
        model: App.Models.Budget,
        state: {
            pageSize: 5000
        },
        mode: "client" // page entirely on the client side
    });
    let BudgetStatusCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple: false
        },
        optionValues: [{
            values: App.Models.projectBudgetModel.getStatusOptions(false)
        }]

    });
    App.Vars.BudgetsBackgridColumnDefinitions = [
        {
            // name is a required parameter, but you don't really want one on a select all column
            name: "",
            label: "",
            // Backgrid.Extension.SelectRowCell lets you select individual rows
            cell: "select-row",
            // Backgrid.Extension.SelectAllHeaderCell lets you select all the row on a page
            headerCell: "select-all",
            resizeable: false,
            orderable: false,
            width: "30"
        },
        {
            name: "BudgetID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="BudgetID" value="' + rawValue + '" />';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30"
        },
        {
            name: "BudgetSource",
            label: "BudgetSource",
            cell: App.Vars.budgetSourceCell,
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "175"
        },
        {
            name: "BudgetAmount",
            label: "BudgetAmount",
            cell: "number",
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "60"
        },
        {
            name: "Status",
            label: "Status",
            cell: BudgetStatusCell,
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150"
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "*"
        }
    ];
    let projectOptions = function () {
        let options = [];
        _.each(App.Vars.appInitialData['all_projects'], function (model) {
            options.push([model['ProjectDescription'], model['ProjectID']]);
        });

        return options;
    };
    let ProjectsCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple: false
        },
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : _.map(formattedValue, function (v) {
                    return parseInt(v);
                })
            }
        }),
        _optionValues: projectOptions(),
        updateInterval: 5000,
        fetching: false,
        optionValues: [{
            values: function () {
                let self = this;

                // Updates the option values in the background periodically to maintain freshness
                setInterval(function () {
                    self.fetching = true;

                    $.get("/admin/project/year/all").done(function (data) {
                        self._optionValues = [];
                        _.each(data, function (model) {
                            self._optionValues.push([model['ProjectDescription'], model['ProjectID']]);
                        });

                        self.fetching = false;
                    });
                }, self.updateInterval);

                // poor man's semaphore
                while (self.fetching) {
                }

                return self._optionValues;
            }
        }]
    });

    App.Vars.annualBudgetsBackgridColumnDefinitions = [];
    _.each(App.Vars.BudgetsBackgridColumnDefinitions, function (value, key) {
        if (_.indexOf(['', 'BudgetID'], value.name) !== -1) {
            return;
        }
        value = _.clone(value);
        value.editable = false;
        value.orderable = false;
        if (value.name === 'ProjectID') {
            value.cell = ProjectsCell;
        }
        if (value.name === 'BudgetSource') {
            value.width = 100;
        }
        if (value.name === 'BudgetAmount') {
            value.label = 'Budget';
        }
        App.Vars.annualBudgetsBackgridColumnDefinitions.push(value);
    });
    if (!App.Vars.bAllowBackgridInlineEditing) {
        _.each(App.Vars.BudgetsBackgridColumnDefinitions, function (value, key) {
            value.editable = false;
        });
        _.each(App.Vars.annualBudgetsBackgridColumnDefinitions, function (value, key) {
            value.editable = false;
        });
    }
    _log('App.Vars.CollectionsGroup', 'App.Vars.BudgetsBackgridColumnDefinitions:', App.Vars.BudgetsBackgridColumnDefinitions);
    _log('App.Vars.CollectionsGroup', 'App.Vars.annualBudgetsBackgridColumnDefinitions:', App.Vars.annualBudgetsBackgridColumnDefinitions);
})(window.App);

(function (App) {
    App.Collections.Project = Backbone.Collection.extend({
        url: '/admin/project/list/all',
        model: App.Models.Project
    });
    App.PageableCollections.Project = Backbone.PageableCollection.extend({
        url: '/admin/project/list/all',
        model: App.Models.Project,
        state: {
            pageSize: 5000
        },
        mode: "client" // page entirely on the client side
    });

    let SkillsNeededCell = Backgrid.StringCell.extend({
        formatter: _.extend({}, Backgrid.StringFormatter.prototype, {

            fromRaw: function (rawValue, model) {
                if (_.isString(rawValue)) {
                    let skillsList = [];
                    let skillIds = [];
                    let aSkills = App.Models.projectModel.getSkillsNeededIdList();
                    rawValue = rawValue.trim();
                    // look for json array
                    if (rawValue.match(/^\[.*\]$/)) {
                        skillIds = JSON.parse(rawValue);
                    } else {
                        // look for old non-json values from before
                        rawValue = rawValue.replace(/"/g, '');
                        if (rawValue.match(/,/)) {
                            skillIds = rawValue.split(',');
                        } else {
                            if (rawValue.trim() !== '') {
                                skillIds.push(rawValue);
                            }
                        }

                    }
                    if (skillIds.length) {
                        _.each(skillIds, function (val, key) {
                            let skill = _.findWhere(aSkills, {id: val});

                            if (!_.isUndefined(skill)) {
                                skillsList.push(skill.label);
                            }
                        });
                    }
                    if (skillsList.length) {
                        rawValue = skillsList.join(',');
                    } else {
                        rawValue = '';
                    }
                }

                return rawValue + '';
            }
        })

    });

    let StatusCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.projectModel.getStatusOptions(false)
        }]

    });

    let WhenWillProjectBeCompletedOptionsCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.projectModel.getWhenWillProjectBeCompletedOptions(false)
        }]

    });

    let PermitRequiredOptionsCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.projectModel.getPermitRequiredOptions(false)
        }]

    });

    let PermitRequiredStatusOptionsCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.projectModel.getPermitRequiredStatusOptions(false)
        }],
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            fromRaw: function (rawValue, model) {
                // force cell to be blank so a status isn't shown if a permit is not required
                if (model.get('permit_required') !== 2) {
                    return "0";
                }
                return rawValue + '';
            }
        })
    });

    let NumberCell = Backgrid.NumberCell.extend({
        bIsApplicable: true,
        enterEditMode: function () {
            var model = this.model;
            var column = this.column;

            var editable = Backgrid.callByNeed(column.editable(), column, model);
            editable = editable && this.bIsApplicable;
            console.log('enterEditMode', {
                id: model.get(model.idAttribute),
                editable: editable,
                bIsApplicable: this.bIsApplicable,
                classes: this.$el.attr('class')
            })
            if (editable) {

                this.currentEditor = new this.editor({
                    column: this.column,
                    model: this.model,
                    formatter: this.formatter
                });

                model.trigger('backgrid:edit', model, column, this, this.currentEditor);

                // Need to redundantly undelegate events for Firefox
                this.undelegateEvents();
                this.$el.empty();
                this.$el.append(this.currentEditor.$el);
                this.currentEditor.render();
                this.$el.addClass('editor');

                model.trigger('backgrid:editing', model, column, this, this.currentEditor);
            }
        },
        render: function () {
            var $el = this.$el;
            $el.empty();
            var model = this.model;
            var columnName = this.column.get('name');
            let skillIds = []
            let primarySkillNeeded = model.get('primary_skill_needed');
            if (primarySkillNeeded.match(/^\[.*\]$/)) {
                skillIds = JSON.parse(primarySkillNeeded);
            } else {
                // look for old non-json values from before
                primarySkillNeeded = primarySkillNeeded.replace(/\"/g, '');
                if (primarySkillNeeded.match(/,/)) {
                    skillIds = primarySkillNeeded.split(',');
                } else {
                    if (primarySkillNeeded.trim() !== '') {
                        skillIds.push(primarySkillNeeded);
                    }
                }

            }
            let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
            let bIsApplicable = _.indexOf(aAttributeCodes, columnName, true) !== -1;
            if (!bIsApplicable) {
                $el.addClass('attribute-not-applicable');
                $el.attr('title', 'Not applicable to this project');
            } else {
                $el.removeClass('attribute-not-applicable');
                $el.removeAttr('title');
            }

            $el.text(this.formatter.fromRaw(model.get(columnName), model));
            $el.addClass(columnName);
            this.updateStateClassesMaybe();
            this.delegateEvents();
            console.log('NumberCell render 1', {
                el: $el,
                model: model,
                id: model.get(model.idAttribute),
                attribute_code: columnName,
                aAttributeCodes: aAttributeCodes,
                bIsApplicable: bIsApplicable,
                classes: this.$el.attr('class'),
                this: this
            });
            return this;
        }
    });

//##DYNAMIC_CELL_TYPES

    let displayOrderCnt = 1;
    // Override until the textarea cell works
    //TextareaCell = 'string';
    // Resizeable columns must have a pixel width defined
//##STARTBACKGRIDCOLUMNDEFINITIONS
App.Vars.projectsBackgridColumnDefinitions = [
        {
            // name is a required parameter, but you don't really want one on a select all column
            name: "",
            label: "",
            // Backgrid.Extension.SelectRowCell lets you select individual rows
            cell: "select-row",
            // Backgrid.Extension.SelectAllHeaderCell lets you select all the row on a page
            headerCell: "select-all",
            resizeable: false,
            orderable: false,
            width: "30",
            displayOrder: displayOrderCnt++
        },
        {
            name: "ProjectID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="ProjectID" value="' + rawValue + '" />';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30",
            displayOrder: displayOrderCnt++
        },
        {
            name: "HasAttachments",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return rawValue ? '<i class="fa fa-paperclip" aria-hidden="true"></i>' : '';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30",
            displayOrder: displayOrderCnt++
        },
        {
            name: "Active",
            label: "Active",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "SequenceNumber",
            label: "Project ID",
            cell: "integer",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "OriginalRequest",
            label: "Original Request",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            displayOrder: displayOrderCnt++
        },
        {
            name: "ProjectDescription",
            label: "Project Description",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "250",
            displayOrder: displayOrderCnt++
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            displayOrder: displayOrderCnt++
        },
        {
            name: "status",
            label: "Status",
            cell: StatusCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "125",
            displayOrder: displayOrderCnt++
        },
        {
            name: "status_reason",
            label: "Status Reason",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "88",
            displayOrder: displayOrderCnt++
        },
        {
            name: "primary_skill_needed",
            label: "Primary Skill Needed",
            cell: SkillsNeededCell.extend(),
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "130",
            displayOrder: displayOrderCnt++
        },
        {
            name: "location",
            label: "Location",
            cell: Backgrid.StringCell.extend({
                    bIsApplicable: true,
                    enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                    render: function () {
                        var $el = this.$el;
                        $el.empty();
                        var model = this.model;
                        var columnName = this.column.get('name');
                        let skillIds = []
                        let primarySkillNeeded = model.get('primary_skill_needed');
                        if (primarySkillNeeded.match(/^\[.*\]$/)) {
                            skillIds = JSON.parse(primarySkillNeeded);
                        } else {
                            // look for old non-json values from before
                            primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                            if(primarySkillNeeded.match(/,/)){
                                skillIds = primarySkillNeeded.split(',');
                            } else {
                                if (primarySkillNeeded.trim() !== '') {
                                    skillIds.push(primarySkillNeeded);
                                }
                            }
    
                        }
                        let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                        let bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                        if(!bIsApplicable){
                            $el.addClass('attribute-not-applicable');
                            $el.attr('title','Not applicable to this project');
                        } else {
                            $el.removeClass('attribute-not-applicable');
                            $el.removeAttr('title');
                        }
                        $el.text(this.formatter.fromRaw(model.get(columnName), model));
                        $el.addClass(columnName);
                        this.updateStateClassesMaybe();
                        this.delegateEvents();
                        console.log('StringCell render 1',{el:$el,model:model,id:model.get(model.idAttribute),attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:bIsApplicable,classes:this.$el.attr('class'),this:this});
                        
                        return this;
                    }
                }),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "58",
            displayOrder: displayOrderCnt++
        },
        {
            name: "dimensions",
            label: "Dimensions",
            cell: Backgrid.StringCell.extend({
                    bIsApplicable: true,
                    enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                    render: function () {
                        var $el = this.$el;
                        $el.empty();
                        var model = this.model;
                        var columnName = this.column.get('name');
                        let skillIds = []
                        let primarySkillNeeded = model.get('primary_skill_needed');
                        if (primarySkillNeeded.match(/^\[.*\]$/)) {
                            skillIds = JSON.parse(primarySkillNeeded);
                        } else {
                            // look for old non-json values from before
                            primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                            if(primarySkillNeeded.match(/,/)){
                                skillIds = primarySkillNeeded.split(',');
                            } else {
                                if (primarySkillNeeded.trim() !== '') {
                                    skillIds.push(primarySkillNeeded);
                                }
                            }
    
                        }
                        let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                        let bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                        if(!bIsApplicable){
                            $el.addClass('attribute-not-applicable');
                            $el.attr('title','Not applicable to this project');
                        } else {
                            $el.removeClass('attribute-not-applicable');
                            $el.removeAttr('title');
                        }
                        $el.text(this.formatter.fromRaw(model.get(columnName), model));
                        $el.addClass(columnName);
                        this.updateStateClassesMaybe();
                        this.delegateEvents();
                        console.log('StringCell render 1',{el:$el,model:model,id:model.get(model.idAttribute),attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:bIsApplicable,classes:this.$el.attr('class'),this:this});
                        
                        return this;
                    }
                }),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "70",
            displayOrder: displayOrderCnt++
        },
        {
            name: "material_needed_and_cost",
            label: "Material Needed and Cost",
            cell: Backgrid.StringCell.extend({
                    bIsApplicable: true,
                    enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                    render: function () {
                        var $el = this.$el;
                        $el.empty();
                        var model = this.model;
                        var columnName = this.column.get('name');
                        let skillIds = []
                        let primarySkillNeeded = model.get('primary_skill_needed');
                        if (primarySkillNeeded.match(/^\[.*\]$/)) {
                            skillIds = JSON.parse(primarySkillNeeded);
                        } else {
                            // look for old non-json values from before
                            primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                            if(primarySkillNeeded.match(/,/)){
                                skillIds = primarySkillNeeded.split(',');
                            } else {
                                if (primarySkillNeeded.trim() !== '') {
                                    skillIds.push(primarySkillNeeded);
                                }
                            }
    
                        }
                        let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                        let bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                        if(!bIsApplicable){
                            $el.addClass('attribute-not-applicable');
                            $el.attr('title','Not applicable to this project');
                        } else {
                            $el.removeClass('attribute-not-applicable');
                            $el.removeAttr('title');
                        }
                        $el.text(this.formatter.fromRaw(model.get(columnName), model));
                        $el.addClass(columnName);
                        this.updateStateClassesMaybe();
                        this.delegateEvents();
                        console.log('StringCell render 1',{el:$el,model:model,id:model.get(model.idAttribute),attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:bIsApplicable,classes:this.$el.attr('class'),this:this});
                        
                        return this;
                    }
                }),
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "154",
            displayOrder: displayOrderCnt++
        },
        {
            name: "estimated_total_cost",
            label: "Estimated Total Cost",
            cell: Backgrid.NumberCell.extend({
                        bIsApplicable: true,
                        enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                    render: function () {
                        var $el = this.$el;
                        $el.empty();
                        var model = this.model;
                        var columnName = this.column.get('name');
                        let skillIds = []
                        let primarySkillNeeded = model.get('primary_skill_needed');
                        if (primarySkillNeeded.match(/^\[.*\]$/)) {
                            skillIds = JSON.parse(primarySkillNeeded);
                        } else {
                            // look for old non-json values from before
                            primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                            if(primarySkillNeeded.match(/,/)){
                                skillIds = primarySkillNeeded.split(',');
                            } else {
                                if (primarySkillNeeded.trim() !== '') {
                                    skillIds.push(primarySkillNeeded);
                                }
                            }
    
                        }
                        let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                        let bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                        if(!bIsApplicable){
                            $el.addClass('attribute-not-applicable');
                            $el.attr('title','Not applicable to this project');
                        } else {
                            $el.removeClass('attribute-not-applicable');
                            $el.removeAttr('title');
                        }
                        
                        $el.text(this.formatter.fromRaw(model.get(columnName), model));
                        $el.addClass(columnName);
                        this.updateStateClassesMaybe();
                        this.delegateEvents();
                        console.log('NumberCell render 1',{el:$el,model:model,id:model.get(model.idAttribute),attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:bIsApplicable,classes:this.$el.attr('class'),this:this});
                        return this;
                    }
                }),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "130",
            displayOrder: displayOrderCnt++
        },
        {
            name: "special_instructions",
            label: "Special Instructions",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "130",
            displayOrder: displayOrderCnt++
        },
        {
            name: "team_leaders_needed_estimate",
            label: "Team Leaders Needed Estimate",
            cell: Backgrid.IntegerCell.extend({
                        bIsApplicable: true,
                        enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                        render: function () {
                            var $el = this.$el;
                            $el.empty();
                            var model = this.model;
                            var columnName = this.column.get('name');
                            let skillIds = []
                            let primarySkillNeeded = model.get('primary_skill_needed');
                            if (primarySkillNeeded.match(/^\[.*\]$/)) {
                                skillIds = JSON.parse(primarySkillNeeded);
                            } else {
                                // look for old non-json values from before
                                primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                                if(primarySkillNeeded.match(/,/)){
                                    skillIds = primarySkillNeeded.split(',');
                                } else {
                                    if (primarySkillNeeded.trim() !== '') {
                                        skillIds.push(primarySkillNeeded);
                                    }
                                }
        
                            }
                            let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                            this.bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                            if(!this.bIsApplicable){
                                $el.addClass('attribute-not-applicable');
                                $el.attr('title','Not applicable to this project');
                            } else {
                                $el.removeClass('attribute-not-applicable');
                                $el.removeAttr('title');
                                
                            }
                            
                            $el.text(this.formatter.fromRaw(model.get(columnName), model));
                            $el.addClass(columnName);
                            this.updateStateClassesMaybe();
                            this.delegateEvents();
                            console.log('IntegerCell render 1',{el:$el,model:model,id:model.get(model.idAttribute), attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class'),this:this});
                            return this;
                        }
                    }),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "178",
            displayOrder: displayOrderCnt++
        },
        {
            name: "volunteers_needed_estimate",
            label: "Volunteers Needed Estimate",
            cell: Backgrid.IntegerCell.extend({
                        bIsApplicable: true,
                        enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                        render: function () {
                            var $el = this.$el;
                            $el.empty();
                            var model = this.model;
                            var columnName = this.column.get('name');
                            let skillIds = []
                            let primarySkillNeeded = model.get('primary_skill_needed');
                            if (primarySkillNeeded.match(/^\[.*\]$/)) {
                                skillIds = JSON.parse(primarySkillNeeded);
                            } else {
                                // look for old non-json values from before
                                primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                                if(primarySkillNeeded.match(/,/)){
                                    skillIds = primarySkillNeeded.split(',');
                                } else {
                                    if (primarySkillNeeded.trim() !== '') {
                                        skillIds.push(primarySkillNeeded);
                                    }
                                }
        
                            }
                            let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                            this.bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                            if(!this.bIsApplicable){
                                $el.addClass('attribute-not-applicable');
                                $el.attr('title','Not applicable to this project');
                            } else {
                                $el.removeClass('attribute-not-applicable');
                                $el.removeAttr('title');
                                
                            }
                            
                            $el.text(this.formatter.fromRaw(model.get(columnName), model));
                            $el.addClass(columnName);
                            this.updateStateClassesMaybe();
                            this.delegateEvents();
                            console.log('IntegerCell render 1',{el:$el,model:model,id:model.get(model.idAttribute), attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class'),this:this});
                            return this;
                        }
                    }),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "166",
            displayOrder: displayOrderCnt++
        },
        {
            name: "estimated_time_to_complete",
            label: "Estimated time to complete the project?",
            cell: Backgrid.StringCell.extend({
                    bIsApplicable: true,
                    enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                    render: function () {
                        var $el = this.$el;
                        $el.empty();
                        var model = this.model;
                        var columnName = this.column.get('name');
                        let skillIds = []
                        let primarySkillNeeded = model.get('primary_skill_needed');
                        if (primarySkillNeeded.match(/^\[.*\]$/)) {
                            skillIds = JSON.parse(primarySkillNeeded);
                        } else {
                            // look for old non-json values from before
                            primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                            if(primarySkillNeeded.match(/,/)){
                                skillIds = primarySkillNeeded.split(',');
                            } else {
                                if (primarySkillNeeded.trim() !== '') {
                                    skillIds.push(primarySkillNeeded);
                                }
                            }
    
                        }
                        let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                        let bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                        if(!bIsApplicable){
                            $el.addClass('attribute-not-applicable');
                            $el.attr('title','Not applicable to this project');
                        } else {
                            $el.removeClass('attribute-not-applicable');
                            $el.removeAttr('title');
                        }
                        $el.text(this.formatter.fromRaw(model.get(columnName), model));
                        $el.addClass(columnName);
                        this.updateStateClassesMaybe();
                        this.delegateEvents();
                        console.log('StringCell render 1',{el:$el,model:model,id:model.get(model.idAttribute),attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:bIsApplicable,classes:this.$el.attr('class'),this:this});
                        
                        return this;
                    }
                }),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "244",
            displayOrder: displayOrderCnt++
        },
        {
            name: "when_will_project_be_completed",
            label: "Will this project be completed before or during Spring into Action?",
            cell: WhenWillProjectBeCompletedOptionsCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "125",
            displayOrder: displayOrderCnt++
        },
        {
            name: "prep_work_required",
            label: "Prep Work Required",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "118",
            displayOrder: displayOrderCnt++
        },
        {
            name: "permit_required",
            label: "Is a permit required for this project? (Please see the SIA Manual regarding permits)",
            cell: PermitRequiredOptionsCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "125",
            displayOrder: displayOrderCnt++
        },
        {
            name: "permit_required_for",
            label: "What is the permit required for?",
            cell: Backgrid.StringCell.extend({
                    bIsApplicable: true,
                    enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                    render: function () {
                        var $el = this.$el;
                        $el.empty();
                        var model = this.model;
                        var columnName = this.column.get('name');
                        let skillIds = []
                        let primarySkillNeeded = model.get('primary_skill_needed');
                        if (primarySkillNeeded.match(/^\[.*\]$/)) {
                            skillIds = JSON.parse(primarySkillNeeded);
                        } else {
                            // look for old non-json values from before
                            primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                            if(primarySkillNeeded.match(/,/)){
                                skillIds = primarySkillNeeded.split(',');
                            } else {
                                if (primarySkillNeeded.trim() !== '') {
                                    skillIds.push(primarySkillNeeded);
                                }
                            }
    
                        }
                        let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                        let bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                        if(!bIsApplicable){
                            $el.addClass('attribute-not-applicable');
                            $el.attr('title','Not applicable to this project');
                        } else {
                            $el.removeClass('attribute-not-applicable');
                            $el.removeAttr('title');
                        }
                        $el.text(this.formatter.fromRaw(model.get(columnName), model));
                        $el.addClass(columnName);
                        this.updateStateClassesMaybe();
                        this.delegateEvents();
                        console.log('StringCell render 1',{el:$el,model:model,id:model.get(model.idAttribute),attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:bIsApplicable,classes:this.$el.attr('class'),this:this});
                        
                        return this;
                    }
                }),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "202",
            displayOrder: displayOrderCnt++
        },
        {
            name: "would_like_team_lead_to_contact",
            label: "Would you like a member of the lead team to contact you regarding this project? ",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "special_equipment_needed",
            label: "Is any special equipment needed for the project? ",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "304",
            displayOrder: displayOrderCnt++
        },
        {
            name: "painting_dimensions",
            label: "Wall Dimensions (Square feet est.) ",
            cell: Backgrid.StringCell.extend({
                    bIsApplicable: true,
                    enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                    render: function () {
                        var $el = this.$el;
                        $el.empty();
                        var model = this.model;
                        var columnName = this.column.get('name');
                        let skillIds = []
                        let primarySkillNeeded = model.get('primary_skill_needed');
                        if (primarySkillNeeded.match(/^\[.*\]$/)) {
                            skillIds = JSON.parse(primarySkillNeeded);
                        } else {
                            // look for old non-json values from before
                            primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                            if(primarySkillNeeded.match(/,/)){
                                skillIds = primarySkillNeeded.split(',');
                            } else {
                                if (primarySkillNeeded.trim() !== '') {
                                    skillIds.push(primarySkillNeeded);
                                }
                            }
    
                        }
                        let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                        let bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                        if(!bIsApplicable){
                            $el.addClass('attribute-not-applicable');
                            $el.attr('title','Not applicable to this project');
                        } else {
                            $el.removeClass('attribute-not-applicable');
                            $el.removeAttr('title');
                        }
                        $el.text(this.formatter.fromRaw(model.get(columnName), model));
                        $el.addClass(columnName);
                        this.updateStateClassesMaybe();
                        this.delegateEvents();
                        console.log('StringCell render 1',{el:$el,model:model,id:model.get(model.idAttribute),attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:bIsApplicable,classes:this.$el.attr('class'),this:this});
                        
                        return this;
                    }
                }),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "220",
            displayOrder: displayOrderCnt++
        },
        {
            name: "estimated_paint_cans_needed",
            label: "Estimated Number of Paint Cans needed",
            cell: Backgrid.StringCell.extend({
                    bIsApplicable: true,
                    enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                    render: function () {
                        var $el = this.$el;
                        $el.empty();
                        var model = this.model;
                        var columnName = this.column.get('name');
                        let skillIds = []
                        let primarySkillNeeded = model.get('primary_skill_needed');
                        if (primarySkillNeeded.match(/^\[.*\]$/)) {
                            skillIds = JSON.parse(primarySkillNeeded);
                        } else {
                            // look for old non-json values from before
                            primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                            if(primarySkillNeeded.match(/,/)){
                                skillIds = primarySkillNeeded.split(',');
                            } else {
                                if (primarySkillNeeded.trim() !== '') {
                                    skillIds.push(primarySkillNeeded);
                                }
                            }
    
                        }
                        let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                        let bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                        if(!bIsApplicable){
                            $el.addClass('attribute-not-applicable');
                            $el.attr('title','Not applicable to this project');
                        } else {
                            $el.removeClass('attribute-not-applicable');
                            $el.removeAttr('title');
                        }
                        $el.text(this.formatter.fromRaw(model.get(columnName), model));
                        $el.addClass(columnName);
                        this.updateStateClassesMaybe();
                        this.delegateEvents();
                        console.log('StringCell render 1',{el:$el,model:model,id:model.get(model.idAttribute),attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:bIsApplicable,classes:this.$el.attr('class'),this:this});
                        
                        return this;
                    }
                }),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "232",
            displayOrder: displayOrderCnt++
        },
        {
            name: "estimated_paint_tape_rolls_needed",
            label: "Estimated rolls of painters tape needed",
            cell: Backgrid.StringCell.extend({
                    bIsApplicable: true,
                    enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                    render: function () {
                        var $el = this.$el;
                        $el.empty();
                        var model = this.model;
                        var columnName = this.column.get('name');
                        let skillIds = []
                        let primarySkillNeeded = model.get('primary_skill_needed');
                        if (primarySkillNeeded.match(/^\[.*\]$/)) {
                            skillIds = JSON.parse(primarySkillNeeded);
                        } else {
                            // look for old non-json values from before
                            primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                            if(primarySkillNeeded.match(/,/)){
                                skillIds = primarySkillNeeded.split(',');
                            } else {
                                if (primarySkillNeeded.trim() !== '') {
                                    skillIds.push(primarySkillNeeded);
                                }
                            }
    
                        }
                        let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                        let bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                        if(!bIsApplicable){
                            $el.addClass('attribute-not-applicable');
                            $el.attr('title','Not applicable to this project');
                        } else {
                            $el.removeClass('attribute-not-applicable');
                            $el.removeAttr('title');
                        }
                        $el.text(this.formatter.fromRaw(model.get(columnName), model));
                        $el.addClass(columnName);
                        this.updateStateClassesMaybe();
                        this.delegateEvents();
                        console.log('StringCell render 1',{el:$el,model:model,id:model.get(model.idAttribute),attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:bIsApplicable,classes:this.$el.attr('class'),this:this});
                        
                        return this;
                    }
                }),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "244",
            displayOrder: displayOrderCnt++
        },
        {
            name: "paint_already_on_hand",
            label: "Paint already on hand",
            cell: Backgrid.StringCell.extend({
                    bIsApplicable: true,
                    enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                    render: function () {
                        var $el = this.$el;
                        $el.empty();
                        var model = this.model;
                        var columnName = this.column.get('name');
                        let skillIds = []
                        let primarySkillNeeded = model.get('primary_skill_needed');
                        if (primarySkillNeeded.match(/^\[.*\]$/)) {
                            skillIds = JSON.parse(primarySkillNeeded);
                        } else {
                            // look for old non-json values from before
                            primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                            if(primarySkillNeeded.match(/,/)){
                                skillIds = primarySkillNeeded.split(',');
                            } else {
                                if (primarySkillNeeded.trim() !== '') {
                                    skillIds.push(primarySkillNeeded);
                                }
                            }
    
                        }
                        let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                        let bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                        if(!bIsApplicable){
                            $el.addClass('attribute-not-applicable');
                            $el.attr('title','Not applicable to this project');
                        } else {
                            $el.removeClass('attribute-not-applicable');
                            $el.removeAttr('title');
                        }
                        $el.text(this.formatter.fromRaw(model.get(columnName), model));
                        $el.addClass(columnName);
                        this.updateStateClassesMaybe();
                        this.delegateEvents();
                        console.log('StringCell render 1',{el:$el,model:model,id:model.get(model.idAttribute),attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:bIsApplicable,classes:this.$el.attr('class'),this:this});
                        
                        return this;
                    }
                }),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "136",
            displayOrder: displayOrderCnt++
        },
        {
            name: "paint_ordered",
            label: "Paint ordered",
            cell: Backgrid.StringCell.extend({
                    bIsApplicable: true,
                    enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                    render: function () {
                        var $el = this.$el;
                        $el.empty();
                        var model = this.model;
                        var columnName = this.column.get('name');
                        let skillIds = []
                        let primarySkillNeeded = model.get('primary_skill_needed');
                        if (primarySkillNeeded.match(/^\[.*\]$/)) {
                            skillIds = JSON.parse(primarySkillNeeded);
                        } else {
                            // look for old non-json values from before
                            primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                            if(primarySkillNeeded.match(/,/)){
                                skillIds = primarySkillNeeded.split(',');
                            } else {
                                if (primarySkillNeeded.trim() !== '') {
                                    skillIds.push(primarySkillNeeded);
                                }
                            }
    
                        }
                        let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                        let bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                        if(!bIsApplicable){
                            $el.addClass('attribute-not-applicable');
                            $el.attr('title','Not applicable to this project');
                        } else {
                            $el.removeClass('attribute-not-applicable');
                            $el.removeAttr('title');
                        }
                        $el.text(this.formatter.fromRaw(model.get(columnName), model));
                        $el.addClass(columnName);
                        this.updateStateClassesMaybe();
                        this.delegateEvents();
                        console.log('StringCell render 1',{el:$el,model:model,id:model.get(model.idAttribute),attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:bIsApplicable,classes:this.$el.attr('class'),this:this});
                        
                        return this;
                    }
                }),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "88",
            displayOrder: displayOrderCnt++
        },
        {
            name: "needs_to_be_started_early",
            label: "Needs To Be Started Early",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "actual_cost",
            label: "Actual Cost",
            cell: Backgrid.NumberCell.extend({
                        bIsApplicable: true,
                        enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                    render: function () {
                        var $el = this.$el;
                        $el.empty();
                        var model = this.model;
                        var columnName = this.column.get('name');
                        let skillIds = []
                        let primarySkillNeeded = model.get('primary_skill_needed');
                        if (primarySkillNeeded.match(/^\[.*\]$/)) {
                            skillIds = JSON.parse(primarySkillNeeded);
                        } else {
                            // look for old non-json values from before
                            primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                            if(primarySkillNeeded.match(/,/)){
                                skillIds = primarySkillNeeded.split(',');
                            } else {
                                if (primarySkillNeeded.trim() !== '') {
                                    skillIds.push(primarySkillNeeded);
                                }
                            }
    
                        }
                        let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                        let bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                        if(!bIsApplicable){
                            $el.addClass('attribute-not-applicable');
                            $el.attr('title','Not applicable to this project');
                        } else {
                            $el.removeClass('attribute-not-applicable');
                            $el.removeAttr('title');
                        }
                        
                        $el.text(this.formatter.fromRaw(model.get(columnName), model));
                        $el.addClass(columnName);
                        this.updateStateClassesMaybe();
                        this.delegateEvents();
                        console.log('NumberCell render 1',{el:$el,model:model,id:model.get(model.idAttribute),attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:bIsApplicable,classes:this.$el.attr('class'),this:this});
                        return this;
                    }
                }),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "76",
            displayOrder: displayOrderCnt++
        },
        {
            name: "child_friendly",
            label: "Child Friendly",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "pc_see_before_sia",
            label: "PC See Before SIA",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "setup_day_instructions",
            label: "Setup Day Instructions",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "142",
            displayOrder: displayOrderCnt++
        },
        {
            name: "sia_day_instructions",
            label: "SIA Day Instructions",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "130",
            displayOrder: displayOrderCnt++
        },
        {
            name: "need_sia_tshirts_for_pc",
            label: "Need SIA TShirts For PC",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "project_send",
            label: "Project Send",
            cell: App.Vars.sendCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "125",
            displayOrder: displayOrderCnt++
        },
        {
            name: "cost_estimate_done",
            label: "Cost Estimate Done",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "material_list_done",
            label: "Material List Done",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "volunteer_allocation_done",
            label: "Volunteer Allocation Done",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "permits_or_approvals_done",
            label: "Permits Or Approvals Done",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "permits_or_approvals_status",
            label: "Permits Or Approvals Status",
            cell: PermitRequiredStatusOptionsCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "125",
            displayOrder: displayOrderCnt++
        },
        {
            name: "budget_allocation_done",
            label: "Budget Allocation Done",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "budget_sources",
            label: "Budget Sources",
            cell: Backgrid.StringCell.extend({
                    bIsApplicable: true,
                    enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                    render: function () {
                        var $el = this.$el;
                        $el.empty();
                        var model = this.model;
                        var columnName = this.column.get('name');
                        let skillIds = []
                        let primarySkillNeeded = model.get('primary_skill_needed');
                        if (primarySkillNeeded.match(/^\[.*\]$/)) {
                            skillIds = JSON.parse(primarySkillNeeded);
                        } else {
                            // look for old non-json values from before
                            primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                            if(primarySkillNeeded.match(/,/)){
                                skillIds = primarySkillNeeded.split(',');
                            } else {
                                if (primarySkillNeeded.trim() !== '') {
                                    skillIds.push(primarySkillNeeded);
                                }
                            }
    
                        }
                        let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                        let bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                        if(!bIsApplicable){
                            $el.addClass('attribute-not-applicable');
                            $el.attr('title','Not applicable to this project');
                        } else {
                            $el.removeClass('attribute-not-applicable');
                            $el.removeAttr('title');
                        }
                        $el.text(this.formatter.fromRaw(model.get(columnName), model));
                        $el.addClass(columnName);
                        this.updateStateClassesMaybe();
                        this.delegateEvents();
                        console.log('StringCell render 1',{el:$el,model:model,id:model.get(model.idAttribute),attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:bIsApplicable,classes:this.$el.attr('class'),this:this});
                        
                        return this;
                    }
                }),
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "94",
            displayOrder: displayOrderCnt++
        },
        {
            name: "final_completion_assessment",
            label: "Final Completion Assessment",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "172",
            displayOrder: displayOrderCnt++
        },
        {
            name: "final_completion_status",
            label: "Final Completion Status",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "project_attachments",
            label: "Project Attachments",
            cell: Backgrid.StringCell.extend({
                    bIsApplicable: true,
                    enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && this.bIsApplicable;
                            console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.$el.empty();
                              this.$el.append(this.currentEditor.$el);
                              this.currentEditor.render();
                              this.$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                    render: function () {
                        var $el = this.$el;
                        $el.empty();
                        var model = this.model;
                        var columnName = this.column.get('name');
                        let skillIds = []
                        let primarySkillNeeded = model.get('primary_skill_needed');
                        if (primarySkillNeeded.match(/^\[.*\]$/)) {
                            skillIds = JSON.parse(primarySkillNeeded);
                        } else {
                            // look for old non-json values from before
                            primarySkillNeeded = primarySkillNeeded.replace(/"/g,'');
                            if(primarySkillNeeded.match(/,/)){
                                skillIds = primarySkillNeeded.split(',');
                            } else {
                                if (primarySkillNeeded.trim() !== '') {
                                    skillIds.push(primarySkillNeeded);
                                }
                            }
    
                        }
                        let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                        let bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                        if(!bIsApplicable){
                            $el.addClass('attribute-not-applicable');
                            $el.attr('title','Not applicable to this project');
                        } else {
                            $el.removeClass('attribute-not-applicable');
                            $el.removeAttr('title');
                        }
                        $el.text(this.formatter.fromRaw(model.get(columnName), model));
                        $el.addClass(columnName);
                        this.updateStateClassesMaybe();
                        this.delegateEvents();
                        console.log('StringCell render 1',{el:$el,model:model,id:model.get(model.idAttribute),attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:bIsApplicable,classes:this.$el.attr('class'),this:this});
                        
                        return this;
                    }
                }),
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "124",
            displayOrder: displayOrderCnt++
        },

];
//##ENDBACKGRIDCOLUMNDEFINITIONS
    if (!App.Vars.bAllowBackgridInlineEditing) {
        _.each(App.Vars.projectsBackgridColumnDefinitions, function (value, key) {
            value.editable = false;
        });
    }
    _log('App.Vars.CollectionsGroup', 'App.Vars.projectsBackgridColumnDefinitions', App.Vars.projectsBackgridColumnDefinitions);
})(window.App);

(function (App) {
    App.Collections.Site = Backbone.Collection.extend({
        url: 'admin/site/list/all',
        model: App.Models.Site
    });
    App.Collections.SiteYear = Backbone.Collection.extend({
        url: 'admin/sitestatus/list/all/site/years',
        model: App.Models.SiteYear
    });
})(window.App);


(function (App) {
    App.Collections.Contact = Backbone.Collection.extend({
        url: '/admin/contact/list/all',
        model: App.Models.Contact
    });
    App.PageableCollections.Contact = Backbone.PageableCollection.extend({
        url: '/admin/contact/list/all',
        model: App.Models.Contact,
        state: {
            pageSize: 5000
        },
        mode: "client" // page entirely on the client side
    });
    App.PageableCollections.ProjectContact = Backbone.PageableCollection.extend({
        url: '/admin/project_contact/list/all',
        model: App.Models.ProjectContact,
        state: {
            pageSize: 5000
        },
        mode: "client" // page entirely on the client side
    });
    let siteOptions = function () {
        let options = [];
        _.each(App.Vars.appInitialData['sites'], function (model) {
            options.push([model['SiteName'], model['SiteID']]);
        });

        return options;
    };

    let SitesCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple: false
        },
        optionValues: [{
            values: siteOptions()
        }],
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : _.map(formattedValue, function (v) {
                    return parseInt(v);
                })
            }
        })

    });
    let contactsBackgridColumnDefinitions = [
        {
            // name is a required parameter, but you don't really want one on a select all column
            name: "",
            label: "",
            // Backgrid.Extension.SelectRowCell lets you select individual rows
            cell: "select-row",
            // Backgrid.Extension.SelectAllHeaderCell lets you select all the row on a page
            headerCell: "select-all",
            resizeable: false,
            orderable: false,
            width: "30"
        },
        {
            name: "ContactID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="ContactID" value="' + rawValue + '" />';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30"
        },
        {
            name: "Active",
            label: "Active",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "50"
        },
        {
            name: "SiteID",
            label: "Site",
            cell: SitesCell,
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "FirstName",
            label: "FirstName",
            cell: "string",
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "LastName",
            label: "LastName",
            cell: "string",
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Title",
            label: "Title",
            cell: "string",
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Email",
            label: "Email",
            cell: "email",
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Phone",
            label: "Phone",
            cell: "string",
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "ContactType",
            label: "ContactType",
            cell: "string",
            editable: App.Vars.Auth.bCanEditSiteContactsGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        }
    ];
    App.Vars.ContactsBackgridColumnDefinitions = [];
    _.each(contactsBackgridColumnDefinitions, function (value, key) {
        value = _.clone(value);
        if (value.name !== 'ContactID') {
            value.editable = App.Vars.Auth.bCanEditProjectTabGridFields;
        }
        App.Vars.ContactsBackgridColumnDefinitions.push(value);
    });

    App.Vars.projectContactsBackgridColumnDefinitions = [];
    _.each(contactsBackgridColumnDefinitions, function (value, key) {
        value = _.clone(value);
        if (value.name === 'ContactID') {
            value.name = 'ProjectContactsID';
            value.formatter = _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="ProjectContactsID" value="' + rawValue + '" />';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            });
        }
        value.editable = false;
        App.Vars.projectContactsBackgridColumnDefinitions.push(value);
    });
    if (!App.Vars.bAllowBackgridInlineEditing) {
        _.each(App.Vars.ContactsBackgridColumnDefinitions, function (value, key) {
            value.editable = false;
        });
    }
    _log('App.Vars.CollectionsGroup', 'App.Vars.ContactsBackgridColumnDefinitions:', App.Vars.ContactsBackgridColumnDefinitions);
    _log('App.Vars.CollectionsGroup', 'App.Vars.projectContactsBackgridColumnDefinitions:', App.Vars.projectContactsBackgridColumnDefinitions);
})(window.App);

(function (App) {
    App.Collections.Volunteer = Backbone.Collection.extend({
        url:'/admin/volunteer/list/all',
        model: App.Models.Volunteer
    });

    App.PageableCollections.Volunteer = Backbone.PageableCollection.extend({
        url: '/admin/volunteer/list/all',
        model: App.Models.Volunteer,
        state: {
            pageSize: 5000
        },
        mode: "client" // page entirely on the client side
    });


    let SkillsCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getSkillLevelOptions(false)
        }]

    });

    let VolunteerPrimarySkillCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getPrimarySkillOptions(false)
        }]

    });

    let SchoolCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getSchoolOptions(false)
        }]

    });
    let AgeRangeCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple: true
        },
        optionValues: [{
            values: App.Models.volunteerModel.getAgeRangeOptions(false)
        }],
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {

            /**
             Normalizes raw scalar or array values to an array.

             @member Backgrid.SelectFormatter
             @param {*} rawValue
             @param {Backbone.Model} model Used for more complicated formatting
             @return {Array.<*>}
             */
            fromRaw: function (rawValue, model) {
                if (_.isString(rawValue) && rawValue.match(/,/)) {
                    rawValue = rawValue.split(',');
                }
                return _.isArray(rawValue) ? rawValue : rawValue != null ? [rawValue] : [];
            }
        })

    });
    App.Vars.volunteersBackgridColumnDefinitions = [
        {
            // name is a required parameter, but you don't really want one on a select all column
            name: "",
            label: "",
            // Backgrid.Extension.SelectRowCell lets you select individual rows
            cell: "select-row",
            // Backgrid.Extension.SelectAllHeaderCell lets you select all the row on a page
            headerCell: "select-all",
            resizeable: false,
            orderable: false,
            width: "30"
        },
        {
            name: "VolunteerID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="VolunteerID" value="' + rawValue + '" />';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30"
        },
        {
            name: "Active",
            label: "Active",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "50",
            filterType: "integer"
        },
        {
            name: "LastName",
            label: "LastName",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        },
        {
            name: "FirstName",
            label: "FirstName",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        },
        {
            name: "Status",
            label: "Status",
            cell: App.Vars.VolunteerStatusCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "MobilePhoneNumber",
            label: "MobilePhoneNumber",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        },
        {
            name: "HomePhoneNumber",
            label: "HomePhoneNumber",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        },
        {
            name: "Email",
            label: "Email",
            cell: "email",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "175",
            filterType: "string"
        },
        {
            name: "PrimarySkill",
            label: "PrimarySkill",
            cell: VolunteerPrimarySkillCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "ContactPhone",
            label: "ContactPhone",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "AgeRange",
            label: "AgeRange",
            cell: AgeRangeCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "LG",
            label: "LG",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Family",
            label: "Family",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "CFE",
            label: "CFE",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "CFP",
            label: "CFP",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Painting",
            label: "Painting",
            cell: SkillsCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Landscaping",
            label: "Landscaping",
            cell: SkillsCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Construction",
            label: "Construction",
            cell: SkillsCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Electrical",
            label: "Electrical",
            cell: SkillsCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "CabinetryFinishWork",
            label: "CabinetryFinishWork",
            cell: SkillsCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Plumbing",
            label: "Plumbing",
            cell: SkillsCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "NotesOnYourSkillAssessment",
            label: "NotesOnYourSkillAssessment",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "PhysicalRestrictions",
            label: "PhysicalRestrictions",
            cell: SkillsCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "SchoolPreference",
            label: "SchoolPreference",
            cell: SchoolCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Equipment",
            label: "Equipment",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "TeamLeaderWilling",
            label: "TeamLeaderWilling",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Church",
            label: "Church",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "AssignmentInformationSendStatus",
            label: "AssignmentInformationSendStatus",
            cell: App.Vars.sendCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "PreferredSiteID",
            label: "PreferredSiteID",
            cell: "string",
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        }
    ];
    let displayOrderCnt = 1;
    _.each(App.Vars.volunteersBackgridColumnDefinitions, function (value, key) {
        value.displayOrder = displayOrderCnt++;
    });

    if (!App.Vars.bAllowBackgridInlineEditing) {
        _.each(App.Vars.volunteersBackgridColumnDefinitions, function (value, key) {
            value.editable = false;
        });
    }

    _log('App.Vars.CollectionsGroup', 'App.Vars.volunteersBackgridColumnDefinitions:', App.Vars.volunteersBackgridColumnDefinitions);

})(window.App);

(function (App) {
    App.PageableCollections.ProjectVolunteer = Backbone.PageableCollection.extend({
        url: '/admin/project_volunteer/list/all',
        model: App.Models.ProjectVolunteer,
        state: {
            pageSize: 5000
        },
        mode: "client" // page entirely on the client side
    });
    App.PageableCollections.ProjectLead = Backbone.PageableCollection.extend({
        url: '/admin/project_lead/list/all',
        model: App.Models.ProjectVolunteerRole,
        state: {
            pageSize: 5000
        },
        mode: "client" // page entirely on the client side
    });
    let SkillsCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getSkillLevelOptions(false)
        }]

    });

    let VolunteerPrimarySkillCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getPrimarySkillOptions(false)
        }]

    });

    let SchoolCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getSchoolOptions(false)
        }]

    });
    let AgeRangeCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple: true
        },
        optionValues: [{
            values: App.Models.volunteerModel.getAgeRangeOptions(false)
        }],
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {

            /**
             Normalizes raw scalar or array values to an array.

             @member Backgrid.SelectFormatter
             @param {*} rawValue
             @param {Backbone.Model} model Used for more complicated formatting
             @return {Array.<*>}
             */
            fromRaw: function (rawValue, model) {
                if (_.isString(rawValue) && rawValue.match(/,/)) {
                    rawValue = rawValue.split(',');
                }
                return _.isArray(rawValue) ? rawValue : rawValue != null ? [rawValue] : [];
            }
        })

    });
    let VolunteerRoleCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getRoleOptions(false)
        }],
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : parseInt(formattedValue);
            }
        })

    });
    let VolunteerRoleStatusCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getStatusOptions(false)
        }],
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : parseInt(formattedValue)
            }
        })
    });
    App.Vars.projectVolunteersBackgridColumnDefinitions = [
        {
            // name is a required parameter, but you don't really want one on a select all column
            name: "",
            label: "",
            // Backgrid.Extension.SelectRowCell lets you select individual rows
            cell: "select-row",
            // Backgrid.Extension.SelectAllHeaderCell lets you select all the row on a page
            headerCell: "select-all",
            resizeable: false,
            orderable: false,
            width: "30"
        },
        {
            name: "ProjectVolunteerRoleID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="ProjectVolunteerRoleID" value="' + rawValue + '" />';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30"
        },
        {
            name: "Active",
            label: "Active",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "50",
            filterType: "integer"
        },
        {
            name: "VolunteerID",
            label: "VolunteerID",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            renderable: false,
            width: "30",
            filterType: "string",
        },
        {
            name: "LastName",
            label: "LastName",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        },
        {
            name: "FirstName",
            label: "FirstName",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        }, {
            name: "ProjectRoleID",
            label: "Project Volunteer Role",
            cell: VolunteerRoleCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "integer"
        },
        {
            name: "ProjectVolunteerRoleStatus",
            label: "Status",
            cell: VolunteerRoleStatusCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "MobilePhoneNumber",
            label: "MobilePhoneNumber",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        },
        {
            name: "HomePhoneNumber",
            label: "HomePhoneNumber",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string"
        },
        {
            name: "Email",
            label: "Email",
            cell: "email",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "175",
            filterType: "string"
        },
        {
            name: "PrimarySkill",
            label: "PrimarySkill",
            cell: VolunteerPrimarySkillCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "ContactPhone",
            label: "ContactPhone",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "AgeRange",
            label: "AgeRange",
            cell: AgeRangeCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "LG",
            label: "LG",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Family",
            label: "Family",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "CFE",
            label: "CFE",
            cell: App.Vars.yesNoCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "CFP",
            label: "CFP",
            cell: App.Vars.yesNoCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Painting",
            label: "Painting",
            cell: SkillsCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Landscaping",
            label: "Landscaping",
            cell: SkillsCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Construction",
            label: "Construction",
            cell: SkillsCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Electrical",
            label: "Electrical",
            cell: SkillsCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "CabinetryFinishWork",
            label: "CabinetryFinishWork",
            cell: SkillsCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Plumbing",
            label: "Plumbing",
            cell: SkillsCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "NotesOnYourSkillAssessment",
            label: "NotesOnYourSkillAssessment",
            cell: App.Vars.TextareaCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "PhysicalRestrictions",
            label: "PhysicalRestrictions",
            cell: SkillsCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "SchoolPreference",
            label: "SchoolPreference",
            cell: SchoolCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "Equipment",
            label: "Equipment",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "TeamLeaderWilling",
            label: "TeamLeaderWilling",
            cell: App.Vars.yesNoCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "Church",
            label: "Church",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string"
        },
        {
            name: "AssignmentInformationSendStatus",
            label: "AssignmentInformationSendStatus",
            cell: App.Vars.sendCell,
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        },
        {
            name: "PreferredSiteID",
            label: "PreferredSiteID",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250"
        }
    ];
    let displayOrderCnt = 1;
    _.each(App.Vars.projectVolunteersBackgridColumnDefinitions, function (value, key) {
        value.displayOrder = displayOrderCnt++;
    });
    let displayOrder = 1;
    App.Vars.volunteerLeadsBackgridColumnDefinitions = [
        {
            // name is a required parameter, but you don't really want one on a select all column
            name: "",
            label: "",
            // Backgrid.Extension.SelectRowCell lets you select individual rows
            cell: "select-row",
            // Backgrid.Extension.SelectAllHeaderCell lets you select all the row on a page
            headerCell: "select-all",
            resizeable: false,
            orderable: false,
            width: "30",
            displayOrder: displayOrder++
        },
        {
            name: "ProjectVolunteerRoleID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="ProjectVolunteerRoleID" value="' + rawValue + '" />';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30",
            displayOrder: displayOrder++
        },
        {
            name: "Active",
            label: "Active",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "50",
            filterType: "integer",
            displayOrder: displayOrder++
        },
        {
            name: "VolunteerID",
            label: "VolunteerID",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            renderable: false,
            width: "30",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "LastName",
            label: "LastName",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "FirstName",
            label: "FirstName",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        }, {
            name: "ProjectRoleID",
            label: "Project Volunteer Role",
            cell: VolunteerRoleCell,
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "integer",
            displayOrder: displayOrder++
        },
        {
            name: "ProjectVolunteerRoleStatus",
            label: "Status",
            cell: VolunteerRoleStatusCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "integer",
            displayOrder: displayOrder++
        },
        {
            name: "MobilePhoneNumber",
            label: "MobilePhoneNumber",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "HomePhoneNumber",
            label: "HomePhoneNumber",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "Email",
            label: "Email",
            cell: "email",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "175",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            displayOrder: displayOrder++
        }
    ];
    if (!App.Vars.bAllowBackgridInlineEditing) {
        _.each(App.Vars.projectVolunteersBackgridColumnDefinitions, function (value, key) {
            value.editable = false;
        });
        _.each(App.Vars.volunteerLeadsBackgridColumnDefinitions, function (value, key) {
            value.editable = false;
        });
    }
    _log('App.Vars.CollectionsGroup', 'App.Vars.projectVolunteerLeadsBackgridColumnDefinitions:', App.Vars.projectVolunteersBackgridColumnDefinitions);
    _log('App.Vars.CollectionsGroup', 'App.Vars.volunteerLeadsBackgridColumnDefinitions:', App.Vars.volunteerLeadsBackgridColumnDefinitions);
})(window.App);

(function (App) {
    App.PageableCollections.SiteVolunteerRoles = Backbone.PageableCollection.extend({
        url: 'admin/site_volunteer/list/all',
        model: App.Models.SiteVolunteerRole,
        state: {
            pageSize: 5000
        },
        mode: "client" // page entirely on the client side
    });

    let SiteVolunteerRoleCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.siteVolunteerRoleModel.getRoleOptions(false)
        }],
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : _.map(formattedValue, function (v) {
                    return parseInt(v);
                })
            }
        })

    });
    let SiteVolunteerRoleStatusCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getStatusOptions(false)
        }],
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : _.map(formattedValue, function (v) {
                    return parseInt(v);
                })
            }
        })
    });
    let displayOrder = 1;
    App.Vars.siteVolunteersBackgridColumnDefinitions = [
        {
            // name is a required parameter, but you don't really want one on a select all column
            name: "",
            label: "",
            // Backgrid.Extension.SelectRowCell lets you select individual rows
            cell: "select-row",
            // Backgrid.Extension.SelectAllHeaderCell lets you select all the row on a page
            headerCell: "select-all",
            resizeable: false,
            orderable: false,
            width: "30",
            displayOrder: displayOrder++
        },
        {
            name: "SiteVolunteerRoleID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="SiteVolunteerRoleID" value="' + rawValue + '" />';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30",
            displayOrder: displayOrder++
        },
        {
            name: "Active",
            label: "Active",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "50",
            filterType: "integer",
            displayOrder: displayOrder++
        },
        {
            name: "VolunteerID",
            label: "VolunteerID",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            renderable: false,
            width: "15",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "SiteVolunteerID",
            label: "SiteVolunteerID",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            renderable: false,
            width: "15",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "LastName",
            label: "LastName",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "FirstName",
            label: "FirstName",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        }, {
            name: "SiteRoleID",
            label: "Site Volunteer Role",
            cell: SiteVolunteerRoleCell,
            editable: App.Vars.Auth.bCanEditProjectTabGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "SiteVolunteerRoleStatus",
            label: "Status",
            cell: SiteVolunteerRoleStatusCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "MobilePhoneNumber",
            label: "MobilePhoneNumber",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "HomePhoneNumber",
            label: "HomePhoneNumber",
            cell: "string",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "150",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "Email",
            label: "Email",
            cell: "email",
            editable: false,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "175",
            filterType: "string",
            displayOrder: displayOrder++
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditVolunteersGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            displayOrder: displayOrder++
        }
    ];

    if (!App.Vars.bAllowBackgridInlineEditing) {
        _.each(App.Vars.siteVolunteersBackgridColumnDefinitions, function (value, key) {
            value.editable = false;
        });
    }
    _log('App.Vars.CollectionsGroup', 'App.Vars.siteVolunteersBackgridColumnDefinitions:', App.Vars.siteVolunteersBackgridColumnDefinitions);

})(window.App);

(function (App) {
    App.Collections.Report = Backbone.Collection.extend({
        url:'/admin/report',
        model: App.Models.Report
    });
    App.Collections.ProjectsDropDown = Backbone.Collection.extend({
        url:'/admin/project/year/list/all',
        model: App.Models.ProjectDropDown
    });

})(window.App);

(function (App) {
    App.Collections.StatusManagement = Backbone.Collection.extend({
        url: '/admin/sitestatus/list/all/statusmanagementrecords',
        model: App.Models.StatusManagement
    });
})(window.App);

(function (App) {
    App.Collections.Option = Backbone.Collection.extend({
        url: '/admin/option/list/all',
        model: App.Models.Option
    });
    App.Collections.SiteRoleOption = Backbone.Collection.extend({
        url: '/admin/option/list/all',
        model: App.Models.SiteRole
    });
    App.Collections.ProjectRoleOption = Backbone.Collection.extend({
        url: '/admin/option/list/all',
        model: App.Models.ProjectRole
    });
})(window.App);

(function (App) {
    App.Collections.Attributes = Backbone.Collection.extend({
        url: '/admin/attributes/list/all',
        model: App.Models.Attributes,
        getTableOptions: function (table, bReturnHtml, defaultOption) {
            if (bReturnHtml) {
                return _.map(this.models, function (value, key) {
                    if (table === value.get('table')) {
                        let selected = !_.isUndefined(defaultOption) && defaultOption === value.get('id') ? 'selected' : '';
                        return "<option data-is-core='" + value.get('is_core') + "' " + selected + " value='" + value.get('id') + "'>" + value.get('label') + "</option>";
                    } else {
                        return '';
                    }
                }).join('');
            } else {
                return this.models;
            }
        },
    });
})(window.App);

(function (App) {
    App.Collections.ProjectAttributes = Backbone.Collection.extend({
        url: '/admin/project_attributes/list/all',
        model: App.Models.ProjectAttributes
    });
})(window.App);

(function (App) {
    App.Collections.Workflow = Backbone.Collection.extend({
        url: '/admin/workflow/list/all',
        model: App.Models.Workflow,
        getOptions: function (bReturnHtml, defaultOption ) {
            if (bReturnHtml) {
                return _.map(this.models, function (value, key) {
                    let selected = !_.isUndefined(defaultOption) && defaultOption === value.get('id') ? 'selected' : '';
                    return "<option " + selected + " value='" + value.get('id') + "'>" + value.get('label') + "</option>";
                }).join('');
            } else {
                return this.models;
            }
        }
    });
})(window.App);

(function (App) {
    App.Collections.sitesDropDownCollection = new App.Collections.Site();
    App.Collections.siteYearsDropDownCollection = new App.Collections.SiteYear();
    App.PageableCollections.projectCollection = new App.PageableCollections.Project();
    App.Collections.allProjectsCollection = new App.Collections.Project();
    App.Collections.statusManagementCollection = new App.Collections.StatusManagement();
    App.PageableCollections.siteVolunteersRoleCollection = new App.PageableCollections.SiteVolunteerRoles();

    // project tabs
    App.PageableCollections.projectLeadsCollection = new App.PageableCollections.ProjectLead();
    App.PageableCollections.projectBudgetsCollection = new App.PageableCollections.ProjectBudget();
    App.PageableCollections.projectContactsCollection = new App.PageableCollections.ProjectContact();
    App.PageableCollections.projectVolunteersCollection = new App.PageableCollections.ProjectVolunteer();

    // @App.Collections.projectVolunteersCollection- This is for the drop down in the select new project lead form
    App.Collections.projectVolunteersCollection = new App.Collections.Volunteer();
    // @App.Collections.contactsManagementCollection- This is for the drop down in the select new project contact form
    App.Collections.contactsManagementCollection = new App.Collections.Contact();

    // This is for the volunteer management view
    App.PageableCollections.volunteersManagementCollection = new App.PageableCollections.Volunteer();
    App.PageableCollections.contactsManagementCollection = new App.PageableCollections.Contact();
    App.Collections.annualBudgetsManagementCollection = new App.Collections.AnnualBudget();
    // @App.PageableCollections.backGridFiltersPanelCollection - filter for volunteer collection
    App.PageableCollections.backGridFiltersPanelCollection = App.PageableCollections.volunteersManagementCollection;
    // This is for the project volunteers tab
    App.PageableCollections.unassignedProjectVolunteersCollection = new App.PageableCollections.ProjectVolunteer();

    // @App.Collections.reportsManagementCollection- This is for the reports management
    App.Collections.reportsManagementCollection = new App.Collections.Report();
    App.Collections.projectsDropDownCollection = new App.Collections.ProjectsDropDown();

    App.Collections.optionsManagementCollection = new App.Collections.Option();
    App.Collections.optionsManagementSiteRoleCollection = new App.Collections.SiteRoleOption();
    App.Collections.optionsManagementProjectRoleCollection = new App.Collections.ProjectRoleOption();
    App.Collections.attributesManagementCollection = new App.Collections.Attributes();
    App.Collections.projectAttributesManagementCollection = new App.Collections.ProjectAttributes();
    App.Collections.workflowManagementCollection = new App.Collections.Workflow();
})(window.App);
