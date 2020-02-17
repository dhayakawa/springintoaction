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
/**
 * The node_modules relative path is only valid during package
 * development and is referencing /laravel/node_modules in the web root.
 * It is not the /laravel/packages/dhayakawa/springintoaction/src/node_modules path.
 *
 * The resources relative path works because I am publishing
 * the /laravel/packages/dhayakawa/springintoaction/src/resources before
 * this script is run
 */
mix.scripts([
    'resources/assets/js/jquery-ui-1.12.1/jquery-ui.js',
    'resources/assets/js/jquery-validation-1.19.0/dist/jquery.validate.js',
    'resources/assets/js/jquery-validation-1.19.0/dist/additional-methods.js',
    'node_modules/lodash/lodash.js',
    'node_modules/underscore/underscore.js',
    'node_modules/underscore.string/dist/underscore.string.js',
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
    'resources/assets/js/jquery-file-upload/js/jquery.iframe-transport.js',
    'resources/assets/js/masonry.pkgd.min.js',
    'resources/assets/js/frontend/registration/confirm.jquery.js',
    'resources/assets/js/frontend/registration/siaModal.jquery.js',
    'resources/assets/js/frontend/registration/carasel.bootstrap.js',
    'resources/assets/js/jquery.sticky.js',
    'resources/assets/js/sia-bs-tooltip.js',
    'resources/assets/js/TweenMax.min.js'
], 'public/js/springintoaction.packages.js');
mix.scripts([
    'resources/assets/js/jquery-ui-1.12.1/jquery-ui.min.js',
    'resources/assets/js/jquery-validation-1.19.0/dist/jquery.validate.min.js',
    'resources/assets/js/jquery-validation-1.19.0/dist/additional-methods.min.js',
    'node_modules/lodash/lodash.min.js',
    'node_modules/underscore/underscore-min.js',
    'node_modules/underscore.string/dist/underscore.string.min.js',
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
    'resources/assets/js/jquery-file-upload/js/jquery.iframe-transport.js',
    'resources/assets/js/masonry.pkgd.min.js',
    'resources/assets/js/frontend/registration/confirm.jquery.js',
    'resources/assets/js/frontend/registration/siaModal.jquery.js',
    'resources/assets/js/frontend/registration/carasel.bootstrap.js',
    'resources/assets/js/jquery.sticky.js',
    'resources/assets/js/sia-bs-tooltip.js',
    'resources/assets/js/TweenMax.min.js'
], 'public/js/springintoaction.packages.min.js');
mix.scripts([
    'resources/assets/js/models/dashboard.js',
    'resources/assets/js/models/site-setting.js',
    'resources/assets/js/models/project-attachment.js',
    'resources/assets/js/models/annual-budget.js',
    'resources/assets/js/models/budget.js',
    'resources/assets/js/models/contact.js',
    'resources/assets/js/models/project-contact.js',
    'resources/assets/js/models/project.js',
    'resources/assets/js/models/project-role.js',
    'resources/assets/js/models/project-volunteer.js',
    'resources/assets/js/models/site.js',
    'resources/assets/js/models/site-status.js',
    'resources/assets/js/models/volunteer.js',
    'resources/assets/js/models/project-volunteer-role.js',
    'resources/assets/js/models/site-role.js',
    'resources/assets/js/models/site-volunteer.js',
    'resources/assets/js/models/report.js',
    'resources/assets/js/models/status-management.js',
    'resources/assets/js/models/option.js',
    "resources/assets/js/models/attributes.js",
    "resources/assets/js/models/project-attributes.js",
    "resources/assets/js/models/workflow.js",
    "resources/assets/js/models/project-scope.js",
    'resources/assets/js/models/init-models.js'
], 'public/js/springintoaction.models.js');
mix.scripts([
    'resources/assets/js/collections/dashboard.js',
    'resources/assets/js/collections/site-setting.js',
    'resources/assets/js/collections/project-attachment.js',
    'resources/assets/js/collections/budget.js',
    'resources/assets/js/collections/project.js',
    'resources/assets/js/collections/site.js',
    'resources/assets/js/collections/contact.js',
    'resources/assets/js/collections/volunteer.js',
    'resources/assets/js/collections/project-volunteer.js',
    'resources/assets/js/collections/site-volunteer.js',
    'resources/assets/js/collections/report.js',
    'resources/assets/js/collections/status-management.js',
    'resources/assets/js/collections/option.js',
    "resources/assets/js/collections/attributes.js",
    "resources/assets/js/collections/project-attributes.js",
    "resources/assets/js/collections/workflow.js",
    'resources/assets/js/collections/init-collections.js'
], 'public/js/springintoaction.collections.js');
mix.scripts([
    'resources/assets/js/views/dashboard.js',
    'resources/assets/js/views/grid-manager-container-toolbar.js',
    'resources/assets/js/views/site-settings-management.js',
    'resources/assets/js/views/site-dropdowns.js',
    'resources/assets/js/views/annual-budget.js',
    'resources/assets/js/views/annual-budgets-management.js',
    'resources/assets/js/views/project-tab-grid-manager-container-toolbar.js',
    'resources/assets/js/views/project-tab.js',
    'resources/assets/js/views/project-attachment-tab.js',
    'resources/assets/js/views/project-lead-tab.js',
    'resources/assets/js/views/project-volunteer-tab.js',
    'resources/assets/js/views/project-budget-tab.js',
    'resources/assets/js/views/project-contact-tab.js',
    'resources/assets/js/views/project-tabs.js',
    'resources/assets/js/views/project-grid-manager-container-toolbar.js',
    'resources/assets/js/views/project.js',
    'resources/assets/js/views/project-management.js',
    'resources/assets/js/views/site.js',
    'resources/assets/js/views/site-volunteers.js',
    'resources/assets/js/views/site-management.js',
    'resources/assets/js/views/backgrid-filters-panel.js',
    'resources/assets/js/views/volunteer-grid-manager-container-toolbar.js',
    'resources/assets/js/views/volunteer.js',
    'resources/assets/js/views/volunteer-management.js',
    'resources/assets/js/views/backgrid-contacts-filters-panel.js',
    'resources/assets/js/views/contact-grid-manager-container-toolbar.js',
    'resources/assets/js/views/contact.js',
    'resources/assets/js/views/contact-management.js',
    'resources/assets/js/views/report-management.js',
    'resources/assets/js/views/status-record.js',
    'resources/assets/js/views/status-record-management.js',
    'resources/assets/js/views/option-grid-manager-container-toolbar.js',
    'resources/assets/js/views/option.js',
    'resources/assets/js/views/option-management.js',
    "resources/assets/js/views/attributes-list-grid-manager-container-toolbar.js",
    "resources/assets/js/views/attributes.js",
    "resources/assets/js/views/attributes-management.js",
    "resources/assets/js/views/project-attributes-list-grid-manager-container-toolbar.js",
    "resources/assets/js/views/project-attributes.js",
    "resources/assets/js/views/project-attributes-management.js",
    "resources/assets/js/views/workflow-list-grid-manager-container-toolbar.js",
    "resources/assets/js/views/workflow.js",
    "resources/assets/js/views/workflow-management.js",
    "resources/assets/js/views/project-scope-grid-manager-container-toolbar.js",
    "resources/assets/js/views/project-scope.js",
    "resources/assets/js/views/project-scope-management.js",
    'resources/assets/js/views/mainApp.js'
], 'public/js/springintoaction.views.js');
mix.scripts([
    'resources/assets/js/init.js',
    'resources/assets/js/views/extended_base_views.js',
    'resources/assets/js/views/select.js'
], 'public/js/springintoaction.init.js');
mix.scripts([
    'resources/assets/js/browser.console.logging.js'
], 'public/js/springintoaction.logging.js');
mix.scripts([
    'resources/assets/js/routes/route.js',
    'resources/assets/js/sia.js'
], 'public/js/springintoaction.main.js');

/************************************************************
 * Registration app
 */
mix.scripts([
    'resources/assets/js/frontend/springintoaction.project-request.js'
], 'public/js/frontend/springintoaction.project-request.js');
mix.scripts([
    'resources/assets/js/frontend/springintoaction.project-registration.js'
], 'public/js/frontend/springintoaction.project-registration.js');

mix.scripts([
    'resources/assets/js/frontend/registration/models/project.js',
    'resources/assets/js/models/project-volunteer.js',
    'resources/assets/js/models/volunteer.js',
    'resources/assets/js/frontend/registration/models/init-models.js'
], 'public/js/frontend/registration/springintoaction.models.js');
mix.scripts([
    'resources/assets/js/frontend/registration/collections/project.js',
    'resources/assets/js/frontend/registration/collections/volunteer.js',
    'resources/assets/js/frontend/registration/collections/init-collections.js'
], 'public/js/frontend/registration/springintoaction.collections.js');
mix.scripts([
    'resources/assets/js/frontend/registration/views/project.js',
    'resources/assets/js/frontend/registration/views/registration.js',

    'resources/assets/js/frontend/registration/views/main-view.js'
], 'public/js/frontend/registration/springintoaction.views.js');
mix.scripts([
    'resources/assets/js/frontend/registration/init.js',
    'resources/assets/js/frontend/registration/views/select.js'
], 'public/js/frontend/registration/springintoaction.init.js');
mix.scripts([
    'resources/assets/js/frontend/registration/routes/route.js',
    'resources/assets/js/frontend/registration/app.js'
], 'public/js/frontend/registration/springintoaction.main.js');
// These copies are for local dev only so we can debug styles. uncomment as needed
// .copy('node_modules/bootstrap/dist/css/bootstrap.min.css.map', 'public/css/bootstrap.min.css.map', false)
// .copy('node_modules/backgrid/lib/backgrid.min.css', 'public/css/backgrid.min.css', false)
// .copy('node_modules/backgrid-paginator/backgrid-paginator.min.css', 'public/css/backgrid-paginator.min.css', false)
// .copy('node_modules/backgrid-columnmanager/lib/Backgrid.ColumnManager.css', 'public/css/Backgrid.ColumnManager.css', false)
// .copy('node_modules/backgrid-grouped-columns/backgrid-grouped-columns.css', 'public/css/backgrid-grouped-columns.css', false)
// .copy('node_modules/backgrid-orderable-columns/backgrid-orderable-columns.css', 'public/css/backgrid-orderable-columns.css', false)
// .copy('node_modules/backgrid-sizeable-columns/backgrid-sizeable-columns.css', 'public/css/backgrid-sizeable-columns.css', false)
// .copy('node_modules/select2/dist/css/select2.min.css', 'public/css/select2.css', false)
// .copy('node_modules/backgrid-select2-cell/backgrid-select2-cell.min.css', 'public/css/backgrid-select2-cell.min.css', false)
// .copy('node_modules/backgrid-text-cell/backgrid-text-cell.min.css', 'public/css/backgrid-text-cell.min.css', false)
// .copy('node_modules/backgrid-select-all/backgrid-select-all.min.css', 'public/css/backgrid-select-all.min.css', false)
// .copy('resources/assets/js/jquery-file-upload/css/jquery.fileupload.css', 'public/css/jquery.fileupload.css', false)
// .copy('node_modules/underscore/underscore-min.map', 'public/js/underscore-min.map', false)
// .copy('node_modules/backbone/backbone-min.map', 'public/js/backbone-min.map', false)
// This is not just dev, this is for production
mix.less('resources/assets/less/onedrive.less', 'public/css/springintoaction.onedrive.css');
mix.less('resources/assets/less/sia_app.less', 'public/css/springintoaction.app.css');
mix.less('resources/assets/less/frontend/registration/registration_app.less', 'public/css/frontend/registration/springintoaction.app.css');
mix.less('resources/assets/less/frontend/fonts.less', 'public/css/springintoaction.fonts.css');
mix.less('resources/assets/less/sia_frontend.less', 'public/css/springintoaction.frontend.css');
mix.styles([
    'resources/assets/js/jquery-ui-1.12.1/jquery-ui.min.css',
    'resources/assets/js/jquery-ui-1.12.1/jquery-ui.theme.min.css',
    'resources/assets/js/jquery-ui-1.12.1/jquery-ui.structure.min.css',
    'node_modules/backgrid/lib/backgrid.min.css',
    'node_modules/backgrid-paginator/backgrid-paginator.min.css',
    'node_modules/backgrid-columnmanager/lib/Backgrid.ColumnManager.css',
    'node_modules/backgrid-grouped-columns/backgrid-grouped-columns.css',
    'node_modules/backgrid-orderable-columns/backgrid-orderable-columns.css',
    'node_modules/backgrid-sizeable-columns/backgrid-sizeable-columns.css',
    'node_modules/select2/dist/css/select2.min.css',
    'node_modules/backgrid-select2-cell/backgrid-select2-cell.min.css',
    'node_modules/backgrid-text-cell/backgrid-text-cell.min.css',
    'node_modules/backgrid-select-all/backgrid-select-all.min.css',
    'resources/assets/js/jquery-file-upload/css/jquery.fileupload.css'
], 'public/css/springintoaction.packages.css');


mix.copy('resources/assets/fonts', 'public/fonts');
mix.copy('resources/assets/images', 'public/images');
mix.copy('resources/assets/js/jquery-ui-1.12.1/images', 'public/js/jquery-ui-1.12.1/images');
mix.copy('resources/assets/js/jquery-ui-1.12.1/images', 'packages/dhayakawa/springintoaction/src/public/js/jquery-ui-1.12.1/images');
mix.copy('resources/assets/js/springintoaction.templates.js', 'public/js/springintoaction.templates.js');
mix.copy('resources/assets/js/app-initial-models-vars-data.js', 'public/js/app-initial-models-vars-data.js');
mix.copy('resources/assets/js/app-initial-collections-view-data.js', 'public/js/app-initial-collections-view-data.js');
/**
 * Registration app
 */
mix.copy('resources/assets/js/frontend/registration/springintoaction.templates.js', 'public/js/frontend/registration/springintoaction.templates.js');
mix.copy('resources/assets/js/frontend/registration/app-initial-models-vars-data.js', 'public/js/frontend/registration/app-initial-models-vars-data.js');
mix.copy('resources/assets/js/frontend/registration/app-initial-collections-view-data.js', 'public/js/frontend/registration/app-initial-collections-view-data.js');

mix.version();

// mix.copy('resources/assets/js/test/test.js','public/js/test/test.js');
// mix.copy('node_modules/mocha/mocha.css','public/css/mocha.css');
// mix.copy('node_modules/mocha/mocha.js','public/js/mocha.js');
// mix.copy('node_modules/chai/chai.js','public/js/chai.js');
// mix.copy('node_modules/sinon/pkg/sinon.js','public/js/sinon.js');
// mix.copy('node_modules/sinon-chai/lib/sinon-chai.js','public/js/sinon-chai.js');
