(function (App) {


/**
     * Bootstap Backbone models & collections for initial page load
     */
    App.Vars.appInitialData = @json($appInitialData);


    App.Models.siteModel = new App.Models.Site(@json($appInitialData['site']));
    App.Models.siteStatusModel = new App.Models.SiteStatus(@json($appInitialData['siteStatus']));
    App.Models.projectModel = new App.Models.Project(@json($appInitialData['project']));
    /**
     * Models for the contacts and volunteer management
     */
    App.Models.contactModel = new App.Models.Contact(@json(current($appInitialData['contacts'])));
    App.Models.volunteerModel = new App.Models.Volunteer(@json(current($appInitialData['project_volunteers'])));
    /**
     * For the initial site data load, the project tab models are set to the first item in the array
     */
    App.Models.projectContactModel = new App.Models.ProjectContact(@json(current($appInitialData['project_contacts'])));
    App.Models.projectLeadModel = new App.Models.Volunteer(@json(current($appInitialData['project_leads'])));
    App.Models.projectBudgetModel = new App.Models.Budget(@json(current($appInitialData['project_budgets'])));
    App.Models.projectVolunteerModel = new App.Models.ProjectVolunteer();
    App.Models.projectVolunteerRoleModel = new App.Models.ProjectVolunteerRole();
    App.Models.annualBudgetModel = new App.Models.AnnualBudget(@json(current($appInitialData['annual_budget'])));
    /**
     * Global var defining the project tab models
     *
     */
    App.Vars.currentTabModels =
        {
            project_lead: App.Models.projectLeadModel,
            project_budget: App.Models.projectBudgetModel,
            project_contact: App.Models.projectContactModel,
            project_volunteer: App.Models.volunteerModel
        }
    ;

    /**
     * Global grid select2 cell definitions used by more than one grid collection
     */
    App.Vars.yesNoCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [
            {
                values: App.Models.projectModel.getYesNoOptions(false)
            }],
        // since the value obtained from the underlying `select` element will always be a string,
        // you'll need to provide a `toRaw` formatting method to convert the string back to a
        // type suitable for your model, which is an integer in this case.
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : _.map(formattedValue, function (v) {
                    return parseInt(v);
                })
            }
        })
    });

    App.Vars.budgetSourceCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple: true
        },
        optionValues: [{
            values: App.Models.projectBudgetModel.getSourceOptions(false)
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

    App.Vars.sendCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getSendOptions(false)
        }]
    });

    App.Vars.VolunteerStatusCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getStatusOptions(false)
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
    App.Vars.TextareaCell = Backgrid.Extension.TextCell.extend({
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
})(window.App);
