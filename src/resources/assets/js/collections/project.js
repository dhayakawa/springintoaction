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
