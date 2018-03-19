(function (App) {
    App.Collections.Project = Backbone.Collection.extend({
        model: App.Models.Project
    });
    App.PageableCollections.Project = Backbone.PageableCollection.extend({
        model: App.Models.Project,
        state: {
            pageSize: 10
        },
        mode: "client" // page entirely on the client side
    });
    let SkillsNeededCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple: true
        },
        optionValues: [{
            values: App.Models.projectModel.getSkillsNeededOptions(false)
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
                if (_.isString(rawValue) && rawValue.match(/,/)){
                    rawValue = rawValue.split(',');
                }
                return _.isArray(rawValue) ? rawValue : rawValue != null ? [rawValue] : [];
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
    let myTextareaEditor = Backgrid.CellEditor.extend({

        /** @property */
        tagName: "div",

        /** @property */
        className: "modal fade",

        /** @property {function(Object, ?Object=): string} template */
        template: function (data) {
            return '<div class="modal-dialog"><div class="modal-content"><form><div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button><h3>' + data.column.get("label") + '</h3></div><div class="modal-body"><textarea cols="' + data.cols + '" rows="' + data.rows + '">' + data.content + '</textarea></div><div class="modal-footer"><input class="btn btn-primary" type="submit" value="Save"/></div></form></div></div>';
        },

        /** @property */
        cols: 80,

        /** @property */
        rows: 10,

        /** @property */
        events: {
            "keydown textarea": "clearError",
            "submit": "saveOrCancel",
            "hide.bs.modal": "saveOrCancel",
            "hidden.bs.modal": "close",
            "shown.bs.modal": "focus"
        },

        /**
         @property {Object} modalOptions The options passed to Bootstrap's modal
         plugin.
         */
        modalOptions: {
            backdrop: false
        },

        /**
         Renders a modal form dialog with a textarea, submit button and a close button.
         */
        render: function () {

            $('.wrapper').after();
            this.$el.html($(this.template({
                column: this.column,
                cols: this.cols,
                rows: this.rows,
                content: this.formatter.fromRaw(this.model.get(this.column.get("name")))
            })));

            this.delegateEvents();

            this.$el.modal(this.modalOptions);

            return this;
        },

        /**
         Event handler. Saves the text in the text area to the model when
         submitting. When cancelling, if the text area is dirty, a confirmation
         dialog will pop up. If the user clicks confirm, the text will be saved to
         the model.

         Triggers a Backbone `backgrid:error` event from the model along with the
         model, column and the existing value as the parameters if the value
         cannot be converted.

         @param {Event} e
         */
        saveOrCancel: function (e) {
            if (e && e.type == "submit") {
                e.preventDefault();
                e.stopPropagation();
            }

            let model = this.model;
            let column = this.column;
            let val = this.$el.find("textarea").val();
            let newValue = this.formatter.toRaw(val);

            if (_.isUndefined(newValue)) {
                model.trigger("backgrid:error", model, column, val);

                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
            else if (!e || e.type == "submit" ||
                (e.type == "hide" &&
                    newValue !== (this.model.get(this.column.get("name")) || '').replace(/\r/g, '') &&
                    confirm("Would you like to save your changes?"))) {

                model.set(column.get("name"), newValue);
                this.$el.modal("hide");
            }
            else if (e.type != "hide") this.$el.modal("hide");
        },

        /**
         Clears the error class on the parent cell.
         */
        clearError: _.debounce(function () {
            if (!_.isUndefined(this.formatter.toRaw(this.$el.find("textarea").val()))) {
                this.$el.parent().removeClass("error");
            }
        }, 150),

        /**
         Triggers a `backgrid:edited` event along with the cell editor as the
         parameter after the modal is hidden.

         @param {Event} e
         */
        close: function (e) {
            let model = this.model;
            model.trigger("backgrid:edited", model, this.column,
                new Backgrid.Command(e));
        },

        /**
         Focuses the textarea when the modal is shown.
         */
        focus: function () {
            this.$el.find("textarea").focus();
        }

    });
    let TextareaCell = Backgrid.Extension.TextCell.extend({
        attributes: function () {
            return { 'data-toggle':'popover','data-trigger':'hover'}
        },
        editor: myTextareaEditor,
        /**
         Removes the editor and re-render in display mode.
         */
        exitEditMode: function () {
            this.$el.removeClass("error");
            this.currentEditor.remove();
            this.stopListening(this.currentEditor);
            delete this.currentEditor;
            this.$el.removeClass("editor");
            this.render();
        },
        enterEditMode: function () {
            let model = this.model;
            let column = this.column;

            let editable = Backgrid.callByNeed(column.editable(), column, model);
            if (editable) {

                this.currentEditor = new this.editor({
                    column: this.column,
                    model: this.model,
                    formatter: this.formatter
                });

                model.trigger("backgrid:edit", model, column, this, this.currentEditor);

                // Need to redundantly undelegate events for Firefox
                this.undelegateEvents();
                this.$el.empty();
                // We need to append to the body instead of the cell to get it to center correctly
                //this.$el.append(this.currentEditor.$el);
                $('body').append(this.currentEditor.$el);
                this.currentEditor.render();
                this.$el.addClass("editor");

                model.trigger("backgrid:editing", model, column, this, this.currentEditor);
            }
        }
    });
    // Override until the textarea cell works
    //TextareaCell = 'string';
    // Resizeable columns must have a pixel width defined
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
            displayOrder: 1
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
            displayOrder: 2
        },
        {
            name: "Active",
            label: "Active",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: false,
            width: "50",
            displayOrder: 3
        },
        {
            name: "OriginalRequest",
            label: "Original Request",
            cell: TextareaCell,
            resizeable: true,
            orderable: true,
            width: "250",
            displayOrder: 4
        },
        {
            name: "ProjectDescription",
            label: "Project Description",
            cell: TextareaCell,
            resizeable: true,
            orderable: false,
            width: "250",
            displayOrder: 5
        },
        {
            name: "Comments",
            label: "Comments",
            cell: TextareaCell,
            resizeable: true,
            orderable: true,
            width: "250",
            displayOrder: 6
        },
        {
            name: "Status",
            label: "Status",
            cell: StatusCell,
            resizeable: true,
            orderable: true,
            width: "66",
            displayOrder: 7
        },
        {
            name: "StatusReason",
            label: "Status Reason",
            cell: TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 8
        },
        {
            name: "BudgetSources",
            label: "Budget Sources",
            cell: App.Vars.budgetSourceCell,
            resizeable: true,
            orderable: true,
            width: "125",
            displayOrder: 9
        },
        {
            name: "ChildFriendly",
            label: "Child Friendly",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 10
        },
        {
            name: "PrimarySkillNeeded",
            label: "Primary Skill Needed",
            cell: SkillsNeededCell.extend({multiple: true}),
            resizeable: true,
            orderable: true,
            width: "150",
            displayOrder: 11
        },
        {
            name: "VolunteersNeededEst",
            label: "Volunteers Needed Est",
            cell: "integer",
            resizeable: true,
            orderable: true,
            width: "166",
            displayOrder: 12
        },
        {
            name: "VolunteersAssigned",
            label: "Volunteers Assigned",
            cell: "integer",
            resizeable: true,
            orderable: true,
            width: "145",
            displayOrder: 13
        },
        {
            name: "MaterialsNeeded",
            label: "Materials Needed",
            cell: TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 14
        },
        {
            name: "EstimatedCost",
            label: "Estimated Cost",
            cell: "number",
            resizeable: true,
            orderable: true,
            width: "120",
            displayOrder: 15
        },
        {
            name: "ActualCost",
            label: "Actual Cost",
            cell: "number",
            resizeable: true,
            orderable: true,
            width: "95",
            displayOrder: 16
        },
        {
            name: "BudgetAvailableForPC",
            label: "Budget Available For PC",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "178",
            displayOrder: 17
        },
        {
            name: "VolunteersLastYear",
            label: "Volunteers Last Year",
            cell: "integer",
            resizeable: true,
            orderable: true,
            width: "153",
            displayOrder: 18
        },
        {
            name: "NeedsToBeStartedEarly",
            label: "Needs To Be Started Early",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 19
        },
        {
            name: "PCSeeBeforeSIA",
            label: "PCSeeBeforeSIA",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 20
        },
        {
            name: "SpecialEquipmentNeeded",
            label: "Special Equipment Needed",
            cell: TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 21
        },
        {
            name: "PermitsOrApprovalsNeeded",
            label: "Permits Or Approvals Needed",
            cell: TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 22
        },
        {
            name: "PrepWorkRequiredBeforeSIA",
            label: "Prep Work Required Before SIA",
            cell: TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 23
        },
        {
            name: "SetupDayInstructions",
            label: "Setup Day Instructions",
            cell: TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 24
        },
        {
            name: "SIADayInstructions",
            label: "SIA Day Instructions",
            cell: TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 25
        },
        {
            name: "Attachments",
            label: "Attachments",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "100",
            displayOrder: 26
        },
        {
            name: "Area",
            label: "Area",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 27
        },
        {
            name: "PaintOrBarkEstimate",
            label: "Paint Or Bark Estimate",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 28
        },
        {
            name: "PaintAlreadyOnHand",
            label: "Paint Already On Hand",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 29
        },
        {
            name: "PaintOrdered",
            label: "Paint Ordered",
            cell: "string",
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 30
        },
        {
            name: "CostEstimateDone",
            label: "Cost Estimate Done",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 31
        },
        {
            name: "MaterialListDone",
            label: "Material List Done",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 32
        },
        {
            name: "BudgetAllocationDone",
            label: "Budget Allocation Done",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 33
        },
        {
            name: "VolunteerAllocationDone",
            label: "Volunteer Allocation Done",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 34
        },
        {
            name: "NeedSIATShirtsForPC",
            label: "Need SIA TShirts For PC",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 35
        },
        {
            name: "ProjectSend",
            label: "Project Send",
            cell: App.Vars.sendCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 36
        },
        {
            name: "FinalCompletionStatus",
            label: "Project Completed",
            cell: App.Vars.yesNoCell,
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 37
        },
        {
            name: "FinalCompletionAssessment",
            label: "Final Completion Assessment",
            cell: TextareaCell,
            resizeable: true,
            orderable: true,
            width: "255",
            displayOrder: 38
        },
        {
            name: "SequenceNumber",
            label: "Sequence Number",
            cell: "integer",
            resizeable: true,
            orderable: true,
            width: "50",
            displayOrder: 40
        },
        {
            name: "updated_at",
            label: "updated_at",
            cell: "string",
            editable: false,
            resizeable: true,
            orderable: true,
            width: "50",
            renderable: true,
            displayOrder: 42
        }

    ];


    _log('App.Vars.CollectionsGroup', 'App.Vars.projectsBackgridColumnDefinitions', App.Vars.projectsBackgridColumnDefinitions);
})(window.App);
