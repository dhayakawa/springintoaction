<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/13/2018
 * Time: 10:25 AM
 */
$default = [
    'prefix' => config('springintoaction.app.prefix', ''),
    'namespace' => 'Dhayakawa\SpringIntoAction\Controllers',
];
$adminDefault = array_merge(
    $default,
    [
        'prefix' => config('springintoaction.admin.app.prefix', 'admin/'),
    ]
);

Route::group(
    array_merge($default, ['middleware' => ['web', 'ajax.request']]),
    function () {
        Route::get(
            '/',
            [
                'as' => 'springintoaction.index',
                'uses' => 'HomeController@index',
            ]
        );
        Route::get(
            'home',
            [
                'as' => 'home',
                'uses' => 'HomeController@index',
            ]
        );
        Route::get('unauthorized',['as' => 'unauthorized', 'uses' => 'UnauthorizedController@index']);

        // Frontend Login Routes...
        Route::get('login', ['as' => 'login', 'uses' => 'Auth\LoginController@showLoginForm']);
        Route::post('login', ['as' => 'login.post', 'uses' => 'Auth\LoginController@login']);
        Route::post('logout', ['as' => 'logout', 'uses' => 'Auth\LoginController@logout']);

        // Admin Login Routes
        Route::get('admin/login', ['as' => 'admin.login', 'uses' => 'Auth\Admin\LoginController@showLoginForm']);
        Route::post('admin/login', ['as' => 'admin.login.post', 'uses' => 'Auth\Admin\LoginController@login']);
        Route::post('admin/logout', ['as' => 'admin.logout', 'uses' => 'Auth\Admin\LoginController@logout']);
        Route::get(
            'admin/password/request',
            ['as' => 'admin.password.request', 'uses' => 'Auth\Admin\ForgotPasswordController@showLinkRequestForm']
        );
        Route::post(
            'admin/password/email',
            ['as' => 'admin.password.email', 'uses' => 'Auth\Admin\ForgotPasswordController@sendResetLinkEmail']
        );
        Route::get(
            'admin/password/reset/{token}',
            ['as' => 'admin.password.reset', 'uses' => 'Auth\Admin\ResetPasswordController@showResetForm']
        );
        Route::post(
            'admin/password/reset',
            ['as' => 'admin.password.reset.post', 'uses' => 'Auth\Admin\ResetPasswordController@reset']
        );

        // Registration Routes...
        Route::get('register', ['as' => 'register', 'uses' => 'Auth\RegisterController@showRegistrationForm']);
        Route::post('register', ['as' => 'register.post', 'uses' => 'Auth\RegisterController@register']);

        // Password Reset Routes...
        Route::get(
            'password/request',
            ['as' => 'password.request', 'uses' => 'Auth\ForgotPasswordController@showLinkRequestForm']
        );
        Route::post(
            'password/email',
            ['as' => 'password.email', 'uses' => 'Auth\ForgotPasswordController@sendResetLinkEmail']
        );
        Route::get(
            'password/reset/{token}',
            ['as' => 'password.reset', 'uses' => 'Auth\ResetPasswordController@showResetForm']
        );
        Route::post('password/reset', ['as' => 'password.reset.post', 'uses' => 'Auth\ResetPasswordController@reset']);

        // Sign Up Routes. No login required at the moment
        Route::get('signup', ['as' => 'signup', 'uses' => 'SignUpController@showSignUpForm']);
        Route::post('signup', ['as' => 'signup.post', 'uses' => 'SignUpController@signUp']);

        Route::get(
            'project_request',
            ['as' => 'project.request', 'uses' => 'ProjectRequestController@showProjectRequestForm']
        );
        Route::post('project_request', ['as' => 'project.store', 'uses' => 'ProjectRequestController@store']);
        Route::get(
            'project_registration',
            ['as' => 'project.registration', 'uses' => 'ProjectRegistrationController@showProjectRegistrationForm']
        );
        Route::get('project_registration/filter_project_list', ['as' => 'project.registration.filter_project_list', 'uses' => 'ProjectRegistrationController@getFilteredProjectList']);
        Route::post('project_registration', ['as' => 'project.registration.store', 'uses' => 'ProjectRegistrationController@store']);
        Route::post('project_registration/reserve', ['as' => 'project.registration.reserve', 'uses' => 'ProjectRegistrationController@reserve']);
        Route::post('project_registration/grove_login', ['as' => 'project.registration.grove_login', 'uses' => 'ProjectRegistrationController@groveLogin']);
        Route::get('project_registration/delete_reservation/{ProjectID}', ['as' => 'project.registration.delete_reservation', 'uses' => 'ProjectRegistrationController@deleteReservation']);


        //onedrive routes.
        Route::get('onedrive_callback', ['as' => 'onedrive.callback', 'uses' => 'OneDriveController@callback']);
    }
);

Route::group(
    array_merge($adminDefault, ['middleware' => ['web', 'auth', 'ajax.request', 'ability:admin,backend_access']]),
    function () {
        Route::get('/',
                   [
                       'as' => 'boilerplate.home',
                       'uses' => 'SpringIntoActionMainAppController@index'
                   ]
        );
        Route::get(
            'home',
            [
                'as' => 'home',
                'uses' => 'SpringIntoActionMainAppController@index',
            ]
        );

        Route::resource('sia', 'SpringIntoActionMainAppController');

        //Route::resource('projects', 'ProjectsController');
        Route::put('project/{ProjectID}', ['as' => 'project.update', 'uses' => 'ProjectsController@update']);
        Route::post('project', ['as' => 'project.store', 'uses' => 'ProjectsController@store']);
        Route::get(
            'project/year/list/all',
            ['as' => 'project.year.list.all', 'uses' => 'ProjectsController@getAllProjects']
        );
        Route::get(
            'project/list/all/{SiteStatusID}',
            ['as' => 'project.list.all', 'uses' => 'ProjectsController@getSiteProjects']
        );
        Route::get('project/{ProjectID}', ['as' => 'project.get', 'uses' => 'ProjectsController@getProject']);
        Route::post('project/list/upload', ['as' => 'project.upload', 'uses' => 'ProjectsController@uploadList']);
        Route::post(
            'project/batch/destroy',
            ['as' => 'project.batch.destroy', 'uses' => 'ProjectsController@batchDestroy']
        );

        //Route::resource('site', 'SiteController');
        Route::get('site/{SiteID}', ['as' => 'site', 'uses' => 'SiteController@show']);
        Route::delete('site/{SiteID}', ['as' => 'site.destroy', 'uses' => 'SiteController@destroy']);
        Route::get('site/list/all', ['as' => 'site.list.all', 'uses' => 'SiteController@getSites']);
        Route::put('site/{SiteID}', ['as' => 'site.update', 'uses' => 'SiteController@update']);
        Route::post('site', ['as' => 'site.create', 'uses' => 'SiteController@store']);

        //Route::resource('sitestatus', 'SiteStatusController');
        Route::get('sitestatus/{SiteStatusID}', ['as' => 'site', 'uses' => 'SiteStatusController@show']);
        Route::put('sitestatus/{SiteStatusID}', ['as' => 'sitestatus.update', 'uses' => 'SiteStatusController@update']);
        Route::post('sitestatus/{SiteStatusID}', ['as' => 'sitestatus.create', 'uses' => 'SiteStatusController@store']);
        // Gets list for site years dropdown
        Route::get(
            'sitestatus/all/site/years/{SiteID}',
            ['as' => 'sitestatus.all.site.years', 'uses' => 'SiteStatusController@getAllSiteYears']
        );

        //Route::resource('volunteer', 'VolunteerController');
        Route::get('volunteer/{VolunteerID}', ['as' => 'volunteer', 'uses' => 'VolunteerController@show']);
        Route::get('volunteer/list/all', ['as' => 'volunteer.list.all', 'uses' => 'VolunteerController@getAll']);
        Route::put('volunteer/{VolunteerID}', ['as' => 'volunteer.update', 'uses' => 'VolunteerController@update']);
        Route::post('volunteer', ['as' => 'volunteer.create', 'uses' => 'VolunteerController@store']);
        Route::post('volunteer/list/upload', ['as' => 'volunteer.upload', 'uses' => 'VolunteerController@uploadList']);
        Route::post(
            'volunteer/batch/destroy',
            ['as' => 'volunteer.batch.destroy', 'uses' => 'VolunteerController@batchDestroy']
        );

        //Route::resource('contact', 'ContactController');
        Route::get('contact/{ContactID}', ['as' => 'contact', 'uses' => 'ContactController@show']);
        Route::get('contact/list/all', ['as' => 'contact.list.all', 'uses' => 'ContactController@getContacts']);
        Route::put('contact/{ContactID}', ['as' => 'contact.update', 'uses' => 'ContactController@update']);
        Route::post('contact', ['as' => 'contact.create', 'uses' => 'ContactController@store']);
        Route::post(
            'contact/batch/destroy',
            ['as' => 'contact.batch.destroy', 'uses' => 'ContactController@batchDestroyContacts']
        );
        Route::post('contact/list/upload', ['as' => 'contact.upload', 'uses' => 'ContactController@uploadList']);

        Route::get('annualbudget/{AnnualBudgetID}', ['as' => 'annualbudget', 'uses' => 'AnnualBudgetController@show']);
        Route::get(
            'annualbudget/list/all',
            ['as' => 'annualbudget.list.all', 'uses' => 'AnnualBudgetController@getBudgets']
        );
        Route::put(
            'annualbudget/{AnnualBudgetID}',
            ['as' => 'annualbudget.update', 'uses' => 'AnnualBudgetController@update']
        );

        /**
         * Project Tab routes
         */
        // These routes can get the arrays for the tabs
        Route::get(
            'project/budgets/{ProjectID}',
            ['as' => 'project.budgets', 'uses' => 'ProjectsController@getBudgets']
        );
        Route::get(
            'project/contacts/{ProjectID}',
            ['as' => 'project.contacts', 'uses' => 'ProjectsController@getContacts']
        );
        Route::get(
            'project/project_leads/{ProjectID}',
            ['as' => 'project.project_leads', 'uses' => 'ProjectsController@getLeadVolunteers']
        );
        Route::get(
            'project/volunteers/{ProjectID}',
            ['as' => 'project.volunteers', 'uses' => 'ProjectsController@getVolunteers']
        );
        Route::get(
            'project/project_attachment/{ProjectID}',
            ['as' => 'project.project_attachments', 'uses' => 'ProjectsController@getProjectAttachments']
        );

        //Route::resource('lead_volunteer', 'ProjectVolunteerRoleController');
        Route::get(
            'project_lead/all',
            ['as' => 'project_lead', 'uses' => 'ProjectVolunteerRoleController@getAllProjectLeads']
        );
        Route::get(
            'project_lead/all/{ProjectID}',
            ['as' => 'project_lead', 'uses' => 'ProjectVolunteerRoleController@getProjectLeads']
        );
        Route::get(
            'project_lead/{VolunteerID}',
            ['as' => 'project_lead', 'uses' => 'ProjectVolunteerRoleController@show']
        );
        Route::put(
            'project_lead/{VolunteerID}',
            ['as' => 'project_lead.update', 'uses' => 'ProjectVolunteerRoleController@update']
        );
        Route::post('project_lead', ['as' => 'project_lead.create', 'uses' => 'ProjectVolunteerRoleController@store']);
        Route::post(
            'project_lead/batch/destroy',
            ['as' => 'project_lead.batch.destroy', 'uses' => 'ProjectVolunteerController@batchDestroy']
        );

        //Route::resource('budget', 'BudgetController');
        Route::get('project_budget/{BudgetID}', ['as' => 'project_budget', 'uses' => 'BudgetController@show']);
        Route::get(
            'project_budget/all/{ProjectID}',
            ['as' => 'project_budget', 'uses' => 'BudgetController@getProjectBudgets']
        );
        Route::put('project_budget/{BudgetID}', ['as' => 'project_budget.update', 'uses' => 'BudgetController@update']);
        Route::post('project_budget', ['as' => 'project_budget.create', 'uses' => 'BudgetController@store']);
        Route::post(
            'project_budget/batch/destroy',
            ['as' => 'project_budget.batch.destroy', 'uses' => 'BudgetController@batchDestroy']
        );

        //Route::resource('project_contact', 'ProjectContactController');
        Route::get(
            'project_contact/{ProjectContactID}',
            ['as' => 'project_contact', 'uses' => 'ProjectContactController@show']
        );
        Route::get(
            'project_contact/all/{ProjectID}',
            ['as' => 'project_contact', 'uses' => 'ProjectContactController@getProjectContacts']
        );
        Route::put(
            'project_contact/{ProjectContactID}',
            ['as' => 'project_contact.update', 'uses' => 'ProjectContactController@update']
        );
        Route::post('project_contact', ['as' => 'project_contact.create', 'uses' => 'ProjectContactController@store']);
        Route::post(
            'project_contact/batch/destroy',
            [
                'as' => 'project_contact.batch.destroy',
                'uses' => 'ProjectContactController@batchDestroyProjectContacts',
            ]
        );

        Route::post(
            'project_volunteer/batch/store',
            ['as' => 'project_volunteer.batch.store', 'uses' => 'ProjectVolunteerController@batchStore']
        );
        Route::post(
            'project_volunteer/batch/destroy',
            ['as' => 'project_volunteer.batch.destroy', 'uses' => 'ProjectVolunteerController@batchDestroy']
        );
        Route::get(
            'project_volunteer/unassigned/{SiteID}/{Year}',
            ['as' => 'project_volunteer.unassigned', 'uses' => 'ProjectVolunteerController@getUnassigned']
        );
        Route::put(
            'project_volunteer/{VolunteerID}',
            ['as' => 'project_volunteer.update', 'uses' => 'VolunteerController@update']
        );
        Route::get(
            'project_volunteer/{VolunteerID}',
            ['as' => 'project_volunteer', 'uses' => 'VolunteerController@show']
        );
        Route::get(
            'project_volunteer/all/{ProjectID}',
            ['as' => 'project_volunteer', 'uses' => 'VolunteerController@getProjectVolunteers']
        );

        Route::get(
            'project_attachment/{ProjectAttachmentID}',
            ['as' => 'project_attachment.show', 'uses' => 'ProjectAttachmentController@show']
        );
        Route::get(
            'project_attachment/stream/{AttachmentPath}',
            ['as' => 'project_attachment.stream', 'uses' => 'ProjectAttachmentController@streamAttachment']
        )->where('AttachmentPath', '.*$');
        Route::get(
            'project_attachment/all/{ProjectID}',
            ['as' => 'project_attachment.all', 'uses' => 'ProjectAttachmentController@getProjectAttachments']
        );
        Route::put(
            'project_attachment/{ProjectAttachmentID}',
            ['as' => 'project_attachment.update', 'uses' => 'ProjectAttachmentController@update']
        );
        Route::post(
            'project_attachment',
            ['as' => 'project_attachment.create', 'uses' => 'ProjectAttachmentController@store']
        );
        Route::post(
            'project_attachment/upload',
            ['as' => 'project_attachment.upload', 'uses' => 'ProjectAttachmentController@upload']
        );
        Route::post(
            'project_attachment/batch/destroy',
            ['as' => 'project_attachment.batch.destroy', 'uses' => 'ProjectAttachmentController@batchDestroy']
        );

        Route::post(
            'site_volunteer',
            ['as' => 'site_volunteer.batch.store', 'uses' => 'SiteVolunteerController@store']
        );
        Route::post(
            'site_volunteer/batch/destroy',
            ['as' => 'site_volunteer.batch.destroy', 'uses' => 'SiteVolunteerController@batchDestroy']
        );
        Route::get(
            'site_volunteer/unassigned/{SiteStatusID}/{Year}',
            ['as' => 'site_volunteer.unassigned', 'uses' => 'SiteVolunteerController@getUnassigned']
        );
        Route::put(
            'site_volunteer/{VolunteerID}',
            ['as' => 'site_volunteer.update', 'uses' => 'SiteVolunteerController@update']
        );
        Route::get(
            'site_volunteer/{VolunteerID}',
            ['as' => 'site_volunteer', 'uses' => 'SiteVolunteerController@show']
        );
        Route::get(
            'site_volunteer/all/{SiteStatusID}',
            ['as' => 'site_volunteer', 'uses' => 'SiteVolunteerController@getSiteVolunteers']
        );

        Route::get('onedrive', ['as' => 'onedrive.index', 'uses' => 'OneDriveController@index']);

        Route::get(
            'report/projects/{Year}/{SiteID}/{ProjectID}',
            ['as' => 'report.project', 'uses' => 'ReportsController@getYearSiteProjectReportUrl']
        );
        Route::get(
            'report/sites/{Year}/{SiteID}',
            ['as' => 'report.site', 'uses' => 'ReportsController@getYearSiteReportUrl']
        );
    }
);
