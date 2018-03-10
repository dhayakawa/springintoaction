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

mix.setPublicPath("public");

mix.scripts([
    'node_modules/lodash/lodash.js',
    'node_modules/underscore/underscore.js',
    'node_modules/select2/dist/js/select2.full.js',
    'node_modules/select2/dist/js/i18n/en.js',
    'node_modules/backbone/backbone.js',
    'node_modules/backbone.paginator/lib/backbone.paginator.js',
    'node_modules/backbone-relational/backbone-relational.js',
    'node_modules/backgrid/lib/backgrid.js',
    'node_modules/backgrid-paginator/backgrid-paginator.js',
    'node_modules/backgrid-grouped-columns/backgrid-grouped-columns.js',
    'node_modules/backgrid-sizeable-columns/backgrid-sizeable-columns.js',
    'node_modules/backgrid-orderable-columns/backgrid-orderable-columns.js',
    'node_modules/backgrid-columnmanager/lib/Backgrid.ColumnManager.js',
    'node_modules/backgrid-sizeable-columns/backgrid-patch.js',
    'node_modules/backgrid-text-cell/backgrid-text-cell.js',
    'node_modules/backgrid-select2-cell/backgrid-select2-cell.js',
    'node_modules/backgrid-select-all/backgrid-select-all.js',
    'resources/assets/js/BackgridHTMLCell.js',
    'resources/assets/js/jquery-file-upload/js/vendor/jquery.ui.widget.js',
    'resources/assets/js/jquery-file-upload/js/jquery.fileupload.js',
    'resources/assets/js/jquery-file-upload/js/jquery.iframe-transport.js'
], 'public/js/springintoaction.packages.js').scripts([
    'node_modules/lodash/lodash.min.js',
    'node_modules/underscore/underscore-min.js',
    'node_modules/select2/dist/js/select2.full.min.js',
    'node_modules/select2/dist/js/i18n/en.js',
    'node_modules/backbone/backbone-min.js',
    'node_modules/backbone.paginator/lib/backbone.paginator.min.js',
    'node_modules/backbone-relational/backbone-relational.js',
    'node_modules/backgrid/lib/backgrid.min.js',
    'node_modules/backgrid-paginator/backgrid-paginator.min.js',
    'node_modules/backgrid-grouped-columns/backgrid-grouped-columns.js',
    'node_modules/backgrid-sizeable-columns/backgrid-sizeable-columns.js',
    'node_modules/backgrid-orderable-columns/backgrid-orderable-columns.js',
    'node_modules/backgrid-columnmanager/lib/Backgrid.ColumnManager.min.js',
    'node_modules/backgrid-sizeable-columns/backgrid-patch.js',
    'node_modules/backgrid-text-cell/backgrid-text-cell.min.js',
    'node_modules/backgrid-select2-cell/backgrid-select2-cell.min.js',
    'node_modules/backgrid-select-all/backgrid-select-all.min.js',
    'resources/assets/js/BackgridHTMLCell.js',
    'resources/assets/js/jquery-file-upload/js/vendor/jquery.ui.widget.js',
    'resources/assets/js/jquery-file-upload/js/jquery.fileupload.js',
    'resources/assets/js/jquery-file-upload/js/jquery.iframe-transport.js'
], 'public/js/springintoaction.packages.min.js')
    .scripts([
        'resources/assets/js/models/budget.js',
        'resources/assets/js/models/contact.js',
        'resources/assets/js/models/project.js',
        'resources/assets/js/models/project-role.js',
        'resources/assets/js/models/project-volunteer.js',
        'resources/assets/js/models/site.js',
        'resources/assets/js/models/site-status.js',
        'resources/assets/js/models/volunteer.js',
        'resources/assets/js/models/project-volunteer-role.js'
    ], 'public/js/springintoaction.models.js')
    .scripts([
        'resources/assets/js/collections/budget.js',
        'resources/assets/js/collections/contact.js',
        'resources/assets/js/collections/project.js',
        'resources/assets/js/collections/site.js',
        'resources/assets/js/collections/volunteer.js',
        'resources/assets/js/collections/project-volunteer.js'
    ], 'public/js/springintoaction.collections.js')
    .scripts([
        'resources/assets/js/views/project-tab.js',
        'resources/assets/js/views/budget.js',
        'resources/assets/js/views/contact.js',
        'resources/assets/js/views/volunteer.js',
        'resources/assets/js/views/project.js',
        'resources/assets/js/views/site.js',
        'resources/assets/js/views/site-management.js',
        'resources/assets/js/views/site-project-tabs.js',
        'resources/assets/js/views/backgrid-filters-panel.js',
        'resources/assets/js/views/volunteer-management.js',
        'resources/assets/js/views/contact-management.js',
        'resources/assets/js/views/main-view.js'
    ], 'public/js/springintoaction.views.js')
    .scripts([
        'resources/assets/js/init.js',
        'resources/assets/js/browser.console.logging.js',
        'resources/assets/js/views/select.js'
    ], 'public/js/springintoaction.init.js')
    .scripts([
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
    .copy('node_modules/select2/dist/css/select2.min.css', 'public/css/select2.css', false)
    .copy('node_modules/backgrid-select2-cell/backgrid-select2-cell.min.css', 'public/css/backgrid-select2-cell.min.css', false)
    .copy('node_modules/backgrid-text-cell/backgrid-text-cell.min.css', 'public/css/backgrid-text-cell.min.css', false)
    .copy('node_modules/backgrid-select-all/backgrid-select-all.min.css', 'public/css/backgrid-select-all.min.css', false)
    .copy('resources/assets/js/jquery-file-upload/css/jquery.fileupload.css', 'public/css/jquery.fileupload.css', false)
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
    'public/css/select2.css',
    'public/css/backgrid-select2-cell.min.css',
    'public/css/backgrid-text-cell.min.css',
    'public/css/backgrid-select-all.min.css',
    'public/css/backgrid-filter.css'
], 'public/css/packages.css');

mix.copy('public/css/packages.css','packages/dhayakawa/springintoaction/src/public/css/packages.css')
    .copy('public/css/springintoaction.css','packages/dhayakawa/springintoaction/src/public/css/springintoaction.css')
    .copy('public/js/springintoaction.main.js','packages/dhayakawa/springintoaction/src/public/js/springintoaction.main.js')
    .copy('public/js/springintoaction.init.js','packages/dhayakawa/springintoaction/src/public/js/springintoaction.init.js')
    .copy('public/js/springintoaction.views.js','packages/dhayakawa/springintoaction/src/public/js/springintoaction.views.js')
    .copy('public/js/springintoaction.collections.js','packages/dhayakawa/springintoaction/src/public/js/springintoaction.collections.js')
    .copy('public/js/springintoaction.models.js','packages/dhayakawa/springintoaction/src/public/js/springintoaction.models.js')
    .copy('public/js/springintoaction.packages.min.js','packages/dhayakawa/springintoaction/src/public/js/springintoaction.packages.min.js')
    .copy('public/js/springintoaction.packages.js','packages/dhayakawa/springintoaction/src/public/js/springintoaction.packages.js')
;
