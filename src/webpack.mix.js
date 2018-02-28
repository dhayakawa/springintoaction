let mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.setPublicPath("public")

mix.scripts([
    'node_modules/lodash/lodash.min.js',
    'node_modules/underscore/underscore-min.js',
    'node_modules/select2/dist/js/select2.min.js',
    'node_modules/backbone/backbone-min.js',
    'node_modules/backbone.paginator/lib/backbone.paginator.min.js',
    'node_modules/backbone-relational/backbone-relational.js',
    'node_modules/backgrid/lib/backgrid.min.js',
    'node_modules/backgrid-paginator/backgrid-paginator.min.js',
    'node_modules/backgrid-grouped-columns/backgrid-grouped-columns.js',
    'node_modules/backgrid-sizeable-columns/backgrid-sizeable-columns.js',
    'node_modules/backgrid-orderable-columns/backgrid-orderable-columns.js',
    'node_modules/backgrid-columnmanager/lib/Backgrid.ColumnManager.min.js',
    'node_modules/backgrid-sizeable-columns/backgrid-patch.min.js',
    'node_modules/backgrid-text-cell/backgrid-text-cell.min.js',
    'node_modules/backgrid-select2-cell/backgrid-select2-cell.min.js',
    'node_modules/backgrid-select-all/backgrid-select-all.min.js',
    'resources/assets/js/BackgridHTMLCell.js'
], 'public/js/springintoaction.packages.js')
    .scripts([
        'resources/assets/js/models/budget.js',
        'resources/assets/js/models/contact.js',
        'resources/assets/js/models/project.js',
        'resources/assets/js/models/project-roles.js',
        'resources/assets/js/models/site.js',
        'resources/assets/js/models/site-status.js',
        'resources/assets/js/models/volunteer.js',
        'resources/assets/js/models/year-project-volunteer-role.js'
    ], 'public/js/springintoaction.models.js')
    .scripts([
        'resources/assets/js/collections/budget.js',
        'resources/assets/js/collections/contact.js',
        'resources/assets/js/collections/project.js',
        'resources/assets/js/collections/site.js',
        'resources/assets/js/collections/volunteer.js'
    ], 'public/js/springintoaction.collections.js')
    .scripts([
        'resources/assets/js/views/budget.js',
        'resources/assets/js/views/contact.js',
        'resources/assets/js/views/project.js',
        'resources/assets/js/views/site.js',
        'resources/assets/js/views/volunteer.js',
        'resources/assets/js/views/site-management.js',
        'resources/assets/js/views/site-project-tabs.js',
        'resources/assets/js/views/main-view.js'
    ], 'public/js/springintoaction.views.js')
    .scripts([
        'resources/assets/js/init.js'
    ], 'public/js/springintoaction.init.js').scripts([
        'resources/assets/js/routes/route.js',
        'resources/assets/js/sia.js'
    ], 'public/js/springintoaction.main.js')
    .copy('node_modules/bootstrap/dist/css/bootstrap.min.css.map', 'public/css/bootstrap.min.css.map', false)
    .copy('node_modules/backgrid/lib/backgrid.min.css', 'public/css/backgrid.min.css', false)
    .copy('node_modules/backgrid-paginator/backgrid-paginator.min.css', 'public/css/backgrid-paginator.min.css', false)
    .copy('node_modules/backgrid-columnmanager/lib/Backgrid.ColumnManager.css', 'public/css/Backgrid.ColumnManager.css', false)
    .copy('node_modules/backgrid-grouped-columns/backgrid-grouped-columns.css', 'public/css/backgrid-grouped-columns.css', false)
    .copy('node_modules/backgrid-orderable-columns/backgrid-orderable-columns.css', 'public/css/backgrid-orderable-columns.css', false)
    .copy('node_modules/backgrid-sizeable-columns/backgrid-sizeable-columns.css', 'public/css/backgrid-sizeable-columns.css', false)
    .copy('node_modules/select2/dist/css/select2.min.css', 'public/css/select2.min.css', false)
    .copy('node_modules/backgrid-select2-cell/backgrid-select2-cell.min.css', 'public/css/backgrid-select2-cell.min.css', false)
    .copy('node_modules/backgrid-text-cell/backgrid-text-cell.min.css', 'public/css/backgrid-text-cell.min.css', false)
    .copy('node_modules/backgrid-select-all/backgrid-select-all.min.css', 'public/css/backgrid-select-all.min.css', false)
    .copy('node_modules/underscore/underscore-min.map', 'public/js/underscore-min.map', false)
    .copy('node_modules/backbone/backbone-min.map', 'public/js/backbone-min.map', false)
    .less('resources/assets/less/sia_app.less', 'public/css/springintoaction.css');
mix.styles([
    'public/css/backgrid.min.css',
    'public/css/backgrid-paginator.min.css',
    'public/css/Backgrid.ColumnManager.css',
    'public/css/backgrid-grouped-columns.css',
    'public/css/backgrid-orderable-columns.css',
    'public/css/backgrid-sizeable-columns.css',
    'public/css/select2.min.css',
    'public/css/backgrid-select2-cell.min.css',
    'public/css/backgrid-text-cell.min.css'
], 'public/css/packages.css');
