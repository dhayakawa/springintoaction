/**
 HtmlCell renders any html code
 @class Backgrid.HtmlCell
 @extends Backgrid.Cell
 */
let HtmlCell = Backgrid.HtmlCell = Backgrid.Cell.extend({

    /** @property */
    className: "html-cell",

    initialize: function () {
        Backgrid.Cell.prototype.initialize.apply(this, arguments);
    },

    render: function () {
        this.$el.empty();
        let rawValue = this.model.get(this.column.get("name"));
        let formattedValue = this.formatter.fromRaw(rawValue, self.model);
        this.$el.append(formattedValue);
        this.delegateEvents();
        return this;
    }
});
