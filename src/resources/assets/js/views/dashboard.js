(function (App) {
    App.Views.Dashboard = App.Views.Backend.fullExtend({
        attributes: {
            class: 'route-view dashboard'
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
            this.$el.off();
            this.$el.empty().append(this.template({
                dashboardPanelViews: this.dashboardPanelViews
            }));
            return this;
        },
        close: function () {
            this.remove();
            // handle other unbinding needs, here
            _.each(this.dashboardPanelViews, function (childView) {
                if (childView.close) {
                    try {
                        childView.close();
                    } catch (e) {
                    }
                } else if (childView.remove) {
                    try {
                        childView.remove();
                    } catch (e) {
                    }
                }
            })
        }
    });
    App.Views.DashboardPanel = App.Views.Backend.fullExtend({
        template: template('dashboardPanelTemplate'),
        initialize: function (options) {
            this.options    = options;
            _.bindAll(this, 'render');
        },
        events: {},
        render: function () {
            let self = this;
            this.$el.append(this.template(self.model.toJSON()));
            return this;
        }
    });
    App.Views.DashboardPanelLinksListItem = App.Views.Backend.fullExtend({
        tagName: 'li',
        template: _.template("<a href=\"#/<%=route%>\" data-route><%=linkText%> <span class=\"pull-right badge bg-blue\"><%=badgeCount%></span></a>"),
        initialize: function (options) {
            _.bindAll(this, 'render');
        },
        events: {

        },
        render: function () {
            let self = this;
            let $link = this.template({
                linkText: self.model.get('linkText'),
                badgeCount: self.model.get('badgeCount'),
                route: self.model.get('route')
            });
            this.$el.append($link);
            return this;
        }
    });

    App.Views.DashboardPanelLinksList = App.Views.Backend.fullExtend({
        initialize: function (options) {
            let self = this;
            this.itemsView = [];
            _.bindAll(this, 'addOne', 'addAll','render');
            self.listenTo(self.collection, "reset", self.addAll);
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
