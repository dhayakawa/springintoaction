# Adding a backbone view to the admin dashboard

## First create a new backbone view and a template for that view
**Use these examples as a reference**  
`packages/dhayakawa/springintoaction/src/resources/assets/js/views/example-dashboard-management.js`  
`packages/dhayakawa/springintoaction/src/resources/views/vendor/springintoaction/admin/backbone/exampleDashboardManagementTemplate.backbone.template.php`  

**Rename and update them according to your new view**  
i.e. `packages/dhayakawa/springintoaction/src/resources/assets/js/views/my-dashboard.js`  
Example of modifications:  
Changed: **`App.Views.ExampleDashboardManagement`** to **`App.Views.MyDashboard`**  
Changed: **`class: 'example-dashboard-management-view route-view box box-primary'`** to **`class: 'my-dashboard-view route-view box box-primary'`**  
```javascript
(function (App) {
    App.Views.MyDashboard = Backbone.View.extend({
        attributes: {
            class: 'my-dashboard-view route-view box box-primary'
        },
        template: template('myDashboardTemplate'),
        initialize: function (options) {
            let self = this;
            this.options = options;

            _.bindAll(this, 'render');
        },
        events: {},
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template());
            return this;
        }
    });
})(window.App);
```

i.e. `packages/dhayakawa/springintoaction/src/resources/views/vendor/springintoaction/admin/backbone/myDashboardTemplate.backbone.template.php` 
Example of modifications:  
Changed: **`<h3 class="box-title example-dashboard-management">Example Dashboard Management</h3>`** to **`<h3 class="box-title my-dashboard">My Dashboard</h3>`**  
Changed: **`<div class="example-dashboard-management-wrapper"></div>`** to **`<div class="my-dashboard-wrapper"><!-- your custom content should most times go here --></div>`**  
```html
<div class="box-header with-border">
    <h3 class="box-title my-dashboard">My Dashboard</h3>
    <div class="pull-right">
        <a href="#" class="btn btn-box-tool"><i class="fa fa-times"></i></a>
    </div>
</div>
<div class="box-body">
    <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <div class="my-dashboard-wrapper"><!-- your custom content should most times go here --></div>
        </div>
    </div>
</div>
<div class="box-footer"></div>

```

## Configure a backbone route for your new view
### Update `packages/dhayakawa/springintoaction/src/resources/assets/js/routes/route.js`  
Copy and paste these example properties into the existing property list and update them with the name of your new view class.  
Please follow the existing naming conventions.  
`
myDashboardViewClass: App.Views.MyDashboard,
myDashboardView: null,
`

**Copy/paste the code below into the BackboneRouter.dashboard method**  
The App.Vars.Auth.bCanProjectManagement is a permission setting. Look at the App.Vars.Auth values for other permissions.  
The panelBgColor property is based on existing css classes. choose from: maroon, purple, fuchsia, orange, lime, olive, teal, navy, green, blue, light-blue,aqua, yellow, red, black, gray, gray-light  
The panelFAIconClass property is a fontawesome icon class from https://fontawesome.com/icons?d=gallery&m=free  
The badgeCount is meant to hold a number representing something, if blank, the pill won't show.  
The route is for browser history, not laravel.  

The dashboard panel views are floated in order of how they are located in the route.js file.
```javascript
if (App.Vars.Auth.bCanProjectManagement) {
    aDashboardPanelViews.push(new App.Views.DashboardPanel({
        model:
            new App.Models.DashboardPanel({
                'panelBgColor': 'aqua',
                'panelFAIconClass': 'fa-grin-tongue-wink',
                'panelName': 'My Dashboard',
                'panelDescription': 'This is an example of a dashboard panel',
                'panelLinksListView': new App.Views.DashboardPanelLinksList({
                    collection: new App.Collections.DashboardPanelLinksListItem([
                        new App.Models.DashboardPanelLinksListItem({
                            'linkText': 'My Info',
                            'badgeCount': '1',
                            'route': 'view/my/dashboard'
                        })
                    ])
                }).render().$el.html()
            })
    }).render().$el.html());
}
```

**Copy/paste the switch case below into the BackboneRouter.loadView method** 
It goes into the `switch (self.routeRequested) {}` switch.  
The case value is based on the route 'route': 'view/my/dashboard/2'  
```javascript
case 'my_dashboard':
    if (self.myDashboardView === null) {
        App.Views.myDashboardView = self.myDashboardView = new self.myDashboardViewClass();
    }

    routeView = self.myDashboardView;
    break;
```

### Update `packages/dhayakawa/springintoaction/src/resources/assets/js/init.js`  
Add your new view to the App.Views object
```javascript
App = {
    Views: {
        myDashboardView:{}
    }
}
```

### Update `packages/dhayakawa/springintoaction/src/resources/views/vendor/springintoaction/admin/backbone/app-initial-collections-view-data.blade.php`  
Initialize your new view  
```javascript
App.Views.myDashboardView = {};
```

### Update `packages/dhayakawa/springintoaction/src/webpack.mix.js`  
You need to add your js filepath to the mix.scripts call that is compiling to the `'public/js/springintoaction.views.js'`
'resources/assets/js/views/my-dashboard.js'   

### Rebuild
run >lav -a
