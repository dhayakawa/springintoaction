(function (App) {


    App.Views.Project = Backbone.View.extend({
        tagName: 'tr',
        className: 'project-list-item',
        template: template('projectListItemTemplate'),
        initialize: function (options) {
            let self = this;
            this.options = options;
            _.bindAll(this, 'render','registerForProject');
        },
        events: {
            'click button': 'registerForProject'
        },
        render: function (e) {
            let self = this;

            let tplVars = {
                ProjectID: self.model.get(App.Models.projectModel.idAttribute),
                SiteName: self.model.get('SiteName'),
                ProjectDescription: self.model.get('ProjectDescription'),
                SkillsNeeded: self.model.getSkillsNeededList(),
                ChildFriendly: self.model.get('ChildFriendly') === 0 ? '<i title="Not Child Friendly" data-toggle="tooltip" data-placement="top" class="text-danger fas fa-child"></i>' : '<i title="Child Friendly" data-toggle="tooltip" data-placement="top" class="text-success fas fa-child"></i>',
                VolunteersNeeded: self.model.getVolunteersNeeded()
            };
            $(this.el).html(this.template(tplVars));

            return this;

        },
        registerForProject: function () {
            let self = this;

            self.trigger('register-for-project', {model: this.model});
        }
    });
    App.Views.ProjectList = Backbone.View.extend({
        initialize: function (options) {
            let self = this;
            this.options = options;
            _.bindAll(this, 'addOne', 'addAll', 'render');
            this.collection.bind('reset', this.addAll);
            this.parentView = this.options.parentView;

            _log('App.Views.ProjectList.initialize', options);
        },
        events: {},
        addOne: function (project) {
            let self = this;
            let projectListItem = new App.Views.Project({model: project});
            // Pass the register click to the registration view
            self.listenTo(projectListItem, 'register-for-project', function (e) {
                self.trigger('register-for-project', {model: e.model});
            });

            this.$el.find('tbody').append(projectListItem.render().el);
        },
        addAll: function () {
            _log('App.Views.ProjectList.addAll', 'projects table');
            this.$el.empty();
            let headerCols = '<thead><tr><th><div class="row">\n' +
                '        <div class="col-xs-7 col-lg-8 site-xs-col"><span class="hidden-lg hidden-xl">&nbsp;<br>&nbsp;<br></span>Site</div>\n' +
                '        <div class="hidden-xs hidden-sm hidden-md col-lg-1">Skills Needed</div>\n' +
                '        <div class="hidden-xs hidden-sm hidden-md col-lg-1">Child Friendly</div>\n' +
                '        <div class="hidden-xs hidden-sm hidden-md col-lg-1">People Needed</div>' +
                '        <div class="hidden-lg col-xs-5">Skills Needed<br>Child Friendly<br>People Needed</div>' +
                '</div></th></tr></thead>';

            this.$el.html(headerCols + '<tbody></tbody>');
            this.collection.each(this.addOne);
        },
        render: function () {
            this.addAll();
            this.$el.find('[data-toggle="tooltip"]').tooltip();
            return this;
        },
    });
    App.Views.ProjectFilter = Backbone.View.extend({
        tagName: 'li',
        className: 'project-list-filter-item',
        template: template('projectListFilterItemTemplate'),
        initialize: function (options) {
            let self = this;
            this.options = options;

            _.bindAll(this, 'render');

            _log('App.Views.ProjectFilter.initialize', options);
        },
        render: function (e) {
            let self = this;
            let filterLabel = self.model.get('filterLabel');
            let filterValue = self.model.get('filterLabel');
            let inputType = 'checkbox';
            if (self.model.get('Field').match(/projects\.PrimarySkillNeeded/)){
                filterValue = self.model.get('FieldID');
                inputType = 'checkbox';
            } else if (self.model.get('Field').match(/projects\.PeopleNeeded/)) {
                filterLabel = filterLabel + ' or more';
            }
            let tplVars = {
                inputType: inputType,
                filterIcon: self.model.get('filterIcon'),
                filterActiveClass: self.model.get('FilterIsChecked') !== '' ? 'active' : '',
                bFilterIsChecked: self.model.get('FilterIsChecked'),
                Field: self.model.get('Field'),
                filterName: self.model.get('filterName'),
                filterId: self.model.get('filterId'),
                filterLabel: filterLabel,
                filterValue: filterValue
            };

            $(this.el).html(this.template(tplVars));

            return this;
        }
    });
    App.Views.ProjectFilterGroup = Backbone.View.extend({
        tagName: 'div',
        template: template('projectListFilterGroupTemplate'),
        className: 'project-list-filter-group',
        initialize: function (options) {
            let self = this;
            this.options = options;
            _.bindAll(this, 'addOne', 'addAll', 'render');
            this.collection.bind('reset', this.addAll);

            _log('App.Views.ProjectFilterGroup.initialize', options);
        },
        events: {},
        addOne: function (projectFilter) {
            this.$el.find('.project-list-filters').append(
                new App.Views.ProjectFilter({model: projectFilter}).render().el);
        },
        addAll: function () {
            _log('App.Views.ProjectFilterGroup.addAll', 'project filters list');
            this.$el.find('.project-list-filters').empty();
            this.collection.each(this.addOne);
        },
        render: function () {
            this.$el.append(this.template({filterGroupName:this.options.filterGroupName}));
            this.addAll();
            return this;
        },
    });

})(window.App);
