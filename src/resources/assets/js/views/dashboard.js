(function (App) {
    App.Views.Dashboard = Backbone.View.extend({
        attributes: {
            class: 'dashboard'
        },
        template: _.template([
            '<div class="row">',
            "<% for (let i=0; i < dashboardPanelViews.length; i++) { %>",
            '   <div class="col-xs-6">',
            "    <%= dashboardPanelViews[i] %>",
            "   </div>",
            " <% if(i!==0 && (i+1)%2===0) { print('</div><div class=\"row\">'); } %>",
            "<% } %>",
            "</div>"
        ].join("\n")),
        initialize: function (options) {
            this.options    = options;
            this.dashboardPanelViews = this.options['dashboardPanelViews'];
            _.bindAll(this, 'render');
        },
        render: function () {
            this.$el.empty().append(this.template({
                dashboardPanelViews: this.dashboardPanelViews
            }));
            return this;
        }
    });
    App.Views.DashboardPanel = Backbone.View.extend({
        template: template('dashboardPanelTemplate'),
        initialize: function (options) {
            this.options    = options;
            _.bindAll(this, 'render');
        },
        events: {},
        render: function () {
            this.$el.append(this.template(this.model.toJSON()));
            return this;
        }
    });
    App.Views.DashboardPanelLinksListItem = Backbone.View.extend({
        tagName: 'li',
        template: _.template("<a href=\"#/<%=route%>\" data-route><%=linkText%> <span class=\"pull-right badge bg-blue\"><%=badgeCount%></span></a>"),
        initialize: function (options) {
            _.bindAll(this, 'render');
        },
        events: {

        },
        render: function () {
            let $link = this.template({
                linkText: this.model.get('linkText'),
                badgeCount: this.model.get('badgeCount'),
                route: this.model.get('route')
            });
            $(this.el).append($link);
            return this;
        }
    });

    App.Views.DashboardPanelLinksList = Backbone.View.extend({
        initialize: function (options) {
            this.itemsView = [];
            _.bindAll(this, 'addOne', 'addAll','render');
            this.collection.bind('reset', this.addAll, this);
        },
        events: {},
        addOne: function (DashboardPanelLinksListItem) {
            let listItem = new App.Views.DashboardPanelLinksListItem({model: DashboardPanelLinksListItem});
            this.itemsView.push(listItem);
            this.$el.find('ul').append(listItem.render().el);
        },
        addAll: function () {
            this.$el.empty();
            this.$el.append($('<ul class="nav nav-stacked"></ul>'));
            this.collection.each(this.addOne);
        },
        render: function () {
            this.addAll();
            return this;
        }
    });

})(window.App);
