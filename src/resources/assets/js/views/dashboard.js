(function (App) {
    App.Views.Dashboard = App.Views.Backend.extend({
        viewName:'dashboard',
        attributes: {
            class: 'route-view dashboard'
        },
        template: _.template([
            "<% for (let i=0; i < dashboardPanelViews.length; i++) { %>",
            '   <div class="dashboard-grid-item col-xs-6">',
            "    <%= dashboardPanelViews[i] %>",
            "   </div>",
            "<% } %>"
        ].join("\n")),
        initialize: function (options) {
            let self = this;
            self._initialize(options);
            self.dashboardPanelViews = options['dashboardPanelViews'];
        },
        render: function () {
            let self = this;
            self.$el.off();
            self.$el.empty().append(self.template({
                dashboardPanelViews: self.dashboardPanelViews
            }));
            setTimeout(function () {
                self.$el.masonry({
                    columnWidth: self.$('.dashboard-grid-item')[0],
                    itemSelector: '.dashboard-grid-item'
                });
            }, 1000);
            return self;
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
    App.Views.DashboardPanel = App.Views.Backend.extend({
        viewName: 'dashboard-panel',
        template: template('dashboardPanelTemplate'),
        initialize: function (options) {
            let self = this;
            self._initialize(options);
        },
        events: {},
        render: function () {
            let self = this;
            self.$el.append(self.template(self.model.toJSON()));
            return self;
        }
    });
    App.Views.DashboardPanelLinksListItem = App.Views.Backend.extend({
        viewName: 'dashboard-panel-links-list-item',
        tagName: 'li',
        template: _.template("<a href=\"#/<%=route%>\" data-route><%=linkText%> <span class=\"pull-right badge bg-blue\"><%=badgeCount%></span></a>"),
        initialize: function (options) {
            let self = this;
            self._initialize(options);
        },
        events: {

        },
        render: function () {
            let self = this;
            let $link = self.template({
                linkText: self.model.get('linkText'),
                badgeCount: self.model.get('badgeCount'),
                route: self.model.get('route')
            });
            self.$el.append($link);
            return self;
        }
    });

    App.Views.DashboardPanelLinksList = App.Views.Backend.extend({
        viewName: 'dashboard-panel-links-list',
        initialize: function (options) {
            let self = this;

            try {
                _.bindAll(this, 'addOne', 'addAll', 'render');
            } catch (e) {
                console.error(options, e)
            }
            self._initialize(options);
            self.itemsView = [];
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
