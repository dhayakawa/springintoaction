<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/13/2018
 * Time: 10:25 AM
 */

use Dhayakawa\SpringIntoAction\Mail\RegistrationConfirmation;

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
        Route::get('unauthorized', ['as' => 'unauthorized', 'uses' => 'UnauthorizedController@index']);

        // Frontend Login Routes...
        Route::get('login', ['as' => 'login', 'uses' => 'Auth\LoginController@showLoginForm']);
        Route::post('login', ['as' => 'login.post', 'uses' => 'Auth\LoginController@login']);
        Route::post('logout', ['as' => 'logout', 'uses' => 'Auth\LoginController@logout']);

        // Admin Routes
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
        Route::get(
            'project_registration/filter_project_list',
            [
                'as' => 'project.registration.filter_project_list',
                'uses' => 'ProjectRegistrationController@getFilteredProjectList',
            ]
        );
        Route::post(
            'project_registration',
            ['as' => 'project.registration.store', 'uses' => 'ProjectRegistrationController@store']
        );
        Route::post(
            'project_registration/reserve',
            ['as' => 'project.registration.reserve', 'uses' => 'ProjectRegistrationController@reserve']
        );
        Route::post(
            'project_registration/grove_login',
            ['as' => 'project.registration.grove_login', 'uses' => 'ProjectRegistrationController@groveLogin']
        );
        Route::post(
            'project_registration/reset_for_test_case',
            ['as' => 'project.registration.reset_for_test_case', 'uses' => 'ProjectRegistrationController@resetForTestCase']
        );
        Route::get(
            'project_registration/delete_reservation/{ProjectID}',
            [
                'as' => 'project.registration.delete_reservation',
                'uses' => 'ProjectRegistrationController@deleteReservation',
            ]
        );
        Route::get(
            'project_registration/update_reservation/{ProjectID}/{newAmt}',
            [
                'as' => 'project.registration.update_reservation',
                'uses' => 'ProjectRegistrationController@updateReservation',
            ]
        );

        //onedrive routes.
        Route::get('onedrive_callback', ['as' => 'onedrive.callback', 'uses' => 'OneDriveController@callback']);
        // Route::get('/registration_confirmation_mailable', function () {
        //     $aEmailData = ['FullName'=>'Bob Jones'];
        //     $aEmailData['project'] = ['SiteName'=>'Madison Elementary','SequenceNumber'=>'1','ProjectDescription'=>'Work on everything'];
        //     $aEmailData['project']['team'][] = ['Role'=>'Team Leader','FirstName'=>'David','LastName'=>'Hayakawa','Email'=>'d.hayakawa@nelsonjameson.com','MobilePhoneNumber'=>'(715) 305-4840','HomePhoneNumber'=>''];
        //     $aEmailData['Year'] = 2020;
        //     $aEmailData['EventDate'] = 'May 19th, 2020';
        //     return new \Dhayakawa\SpringIntoAction\Mail\RegistrationConfirmation($aEmailData);
        //
        // });

    }
);

Route::group(
    array_merge($adminDefault, ['middleware' => ['web', 'auth', 'ajax.request', 'ability:admin,backend_access']]),
    function () {
        Route::get(
            '/',
            [
                'as' => 'boilerplate.home',
                'uses' => 'SpringIntoActionMainAppController@index',
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

        //Route::resource('site', 'SiteController');
        Route::get('site/list/all', ['as' => 'site.list.all', 'uses' => 'SiteController@getSites']);
        Route::get('site/{SiteID}', ['as' => 'site', 'uses' => 'SiteController@show']);
        Route::delete('site/{SiteID}', ['as' => 'site.destroy', 'uses' => 'SiteController@destroy']);
        Route::put('site/{SiteID}', ['as' => 'site.update', 'uses' => 'SiteController@update']);
        Route::post('site', ['as' => 'site.create', 'uses' => 'SiteController@store']);

        Route::get(
            'grove/{importType}',
            ['as' => 'grove.import', 'uses' => 'GroveController@runImport']
        );
        //Route::resource('projects', 'ProjectsController');
        Route::put('project_scope/{ProjectID}', ['as' => 'project.scope.update', 'uses' => 'ProjectsController@scopeUpdate']);
        Route::get('project_scope/list/all/{SiteStatusID}', ['as' => 'project.scope.list.all', 'uses' => 'ProjectsController@getSiteProjects']);
        Route::get('project_scope/projects/{SiteStatusID}', ['as' => 'project.scope.dropdown', 'uses' => 'ProjectsController@getProjectScopeProjectDropdownOptions']);
        Route::get('project_scope/{ProjectID}', ['as' => 'project.scope.project', 'uses' => 'ProjectsController@getProjectScopeProject']);
        Route::post('project_scope/email_report', ['as' => 'project.scope.email_report', 'uses' => 'ProjectsController@emailReport']);
        Route::post('project_scope', ['as' => 'project.scope.store', 'uses' => 'ProjectsController@storeProjectScope']);

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
        Route::get('project/{ProjectID}', ['as' => 'project.get', 'uses' => 'ProjectsController@getProjectScopeProject']);
        Route::post('project/list/upload', ['as' => 'project.upload', 'uses' => 'ProjectsController@uploadList']);
        Route::post(
            'project/batch/destroy',
            ['as' => 'project.batch.destroy', 'uses' => 'ProjectsController@batchDestroy']
        );

        Route::get(
            'site_setting/list/all',
            ['as' => 'site.setting.list.all', 'uses' => 'SiteSettingsManagement@getSettings']
        );
        Route::put(
            'site_setting/{SiteSettingID}',
            ['as' => 'site.setting.update', 'uses' => 'SiteSettingsManagement@update']
        );

        //Route::resource('sitestatus', 'SiteStatusController');
        Route::get('sitestatus/{SiteStatusID}', ['as' => 'site', 'uses' => 'SiteStatusController@show']);
        Route::put('sitestatus/{SiteStatusID}', ['as' => 'sitestatus.update', 'uses' => 'SiteStatusController@update']);
        Route::post('sitestatus/{SiteStatusID}', ['as' => 'sitestatus.create', 'uses' => 'SiteStatusController@store']);
        // Gets list for site years dropdown
        Route::get(
            'sitestatus/list/all/site/years/{SiteID}',
            ['as' => 'sitestatus.all.site.years', 'uses' => 'SiteStatusController@getAllSiteYears']
        );
        Route::get(
            'sitestatus/list/all/statusmanagementrecords',
            [
                'as' => 'sitestatus.all.statusmanagementrecords',
                'uses' => 'SiteStatusController@getStatusManagementRecords',
            ]
        );

        //Route::resource('volunteer', 'VolunteerController');
        Route::get('volunteer/list/all', ['as' => 'volunteer.list.all', 'uses' => 'VolunteerController@getAll']);
        Route::get('volunteer/{VolunteerID}', ['as' => 'volunteer', 'uses' => 'VolunteerController@show']);
        Route::put('volunteer/{VolunteerID}', ['as' => 'volunteer.update', 'uses' => 'VolunteerController@update']);
        Route::post('volunteer', ['as' => 'volunteer.create', 'uses' => 'VolunteerController@store']);
        Route::post('volunteer/list/upload', ['as' => 'volunteer.upload', 'uses' => 'VolunteerController@uploadList']);
        Route::post(
            'volunteer/batch/destroy',
            ['as' => 'volunteer.batch.destroy', 'uses' => 'VolunteerController@batchDestroy']
        );

        //Route::resource('contact', 'ContactController');
        Route::get('contact/list/all', ['as' => 'contact.list.all', 'uses' => 'ContactController@getContacts']);
        Route::get('contact/{ContactID}', ['as' => 'contact', 'uses' => 'ContactController@show']);
        Route::put('contact/{ContactID}', ['as' => 'contact.update', 'uses' => 'ContactController@update']);
        Route::post('contact', ['as' => 'contact.create', 'uses' => 'ContactController@store']);
        Route::post(
            'contact/batch/destroy',
            ['as' => 'contact.batch.destroy', 'uses' => 'ContactController@batchDestroyContacts']
        );
        Route::post('contact/list/upload', ['as' => 'contact.upload', 'uses' => 'ContactController@uploadList']);

        Route::get(
            'annualbudget/list/all',
            ['as' => 'annualbudget.list.all', 'uses' => 'AnnualBudgetController@getSiteBudgets']
        );
        Route::get('annualbudget/{AnnualBudgetID}', ['as' => 'annualbudget', 'uses' => 'AnnualBudgetController@show']);
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
            ['as' => 'project.contacts', 'uses' => 'ProjectContactController@getProjectContacts']
        );
        Route::get(
            'project/project_leads/{ProjectID}',
            ['as' => 'project.project_leads', 'uses' => 'ProjectsController@getProjectTeam']
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
            'project_lead/list/all',
            ['as' => 'project_lead', 'uses' => 'ProjectVolunteerRoleController@getAllProjectLeads']
        );
        Route::get(
            'project_lead/list/all/{ProjectID}',
            ['as' => 'project_lead', 'uses' => 'ProjectVolunteerRoleController@getProjectTeam']
        );
        Route::get(
            'project_lead/{ProjectVolunteerRoleID}',
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
        Route::get(
            'project_budget/list/all/{ProjectID}',
            ['as' => 'project_budget', 'uses' => 'BudgetController@getProjectBudgets']
        );
        Route::get('project_budget/{BudgetID}', ['as' => 'project_budget', 'uses' => 'BudgetController@show']);
        Route::put('project_budget/{BudgetID}', ['as' => 'project_budget.update', 'uses' => 'BudgetController@update']);
        Route::post('project_budget', ['as' => 'project_budget.create', 'uses' => 'BudgetController@store']);
        Route::post(
            'project_budget/batch/destroy',
            ['as' => 'project_budget.batch.destroy', 'uses' => 'BudgetController@batchDestroy']
        );

        //Route::resource('project_contact', 'ProjectContactController');
        Route::get(
            'project_contact/list/all/{ProjectID}',
            ['as' => 'project_contact', 'uses' => 'ProjectContactController@getProjectContacts']
        );
        Route::get(
            'project_contact/{ProjectContactsID}',
            ['as' => 'project_contact', 'uses' => 'ProjectContactController@show']
        );
        Route::put(
            'project_contact/{ProjectContactsID}',
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

        Route::get(
            'project_volunteer/list/all/{ProjectID}',
            ['as' => 'project_volunteer', 'uses' => 'ProjectVolunteerController@getProjectVolunteers']
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
            'project_volunteer/{ProjectVolunteerRoleID}',
            ['as' => 'project_volunteer.update', 'uses' => 'ProjectVolunteerController@update']
        );
        Route::get(
            'project_volunteer/{ProjectVolunteerRoleID}',
            ['as' => 'project_volunteer', 'uses' => 'ProjectVolunteerController@show']
        );

        Route::get(
            'project_attachment/list/all/{ProjectID}',
            ['as' => 'project_attachment.all', 'uses' => 'ProjectAttachmentController@getProjectAttachments']
        );
        Route::get(
            'project_attachment/{ProjectAttachmentID}',
            ['as' => 'project_attachment.show', 'uses' => 'ProjectAttachmentController@show']
        );
        Route::get(
            'project_attachment/stream/{AttachmentPath}',
            ['as' => 'project_attachment.stream', 'uses' => 'ProjectAttachmentController@streamAttachment']
        )->where('AttachmentPath', '.*$');

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
        Route::delete(
            'project_attachment/destroy/{id}',
            ['as' => 'project_attachment.destroy', 'uses' => 'ProjectAttachmentController@destroy']
        );

        Route::get(
            'site_volunteer/list/all/{SiteStatusID}',
            ['as' => 'site_volunteer', 'uses' => 'SiteVolunteerController@getSiteVolunteers']
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
            'site_volunteer_role/list/all/{SiteStatusID}',
            ['as' => 'site_volunteer_role', 'uses' => 'SiteVolunteerRoleController@getSiteVolunteers']
        );
        Route::post(
            'site_volunteer_role',
            ['as' => 'site_volunteer_role.batch.store', 'uses' => 'SiteVolunteerRoleController@store']
        );
        Route::post(
            'site_volunteer_role/batch/destroy',
            ['as' => 'site_volunteer_role.batch.destroy', 'uses' => 'SiteVolunteerRoleController@batchDestroy']
        );
        Route::get(
            'site_volunteer_role/unassigned/{SiteStatusID}/{Year}',
            ['as' => 'site_volunteer_role.unassigned', 'uses' => 'SiteVolunteerRoleController@getUnassigned']
        );
        Route::put(
            'site_volunteer_role/{SiteVolunteerRoleID}',
            ['as' => 'site_volunteer_role.update', 'uses' => 'SiteVolunteerRoleController@update']
        );
        Route::get(
            'site_volunteer_role/{SiteVolunteerRoleID}',
            ['as' => 'site_volunteer_role', 'uses' => 'SiteVolunteerRoleController@show']
        );

        Route::get('onedrive', ['as' => 'onedrive.index', 'uses' => 'OneDriveController@index']);
        Route::post(
            'report/{ReportType}/{Year}/{SiteID?}/{ProjectID?}/{downloadType?}',
            ['as' => 'report', 'uses' => 'ReportsController@getReport']
        );
        Route::get(
            'report/{ReportType}/{Year}/{SiteID?}/{ProjectID?}/{downloadType?}',
            ['as' => 'report', 'uses' => 'ReportsController@getReport']
        );

        Route::get(
            'option/list/all/{OptionType}',
            ['as' => 'option', 'uses' => 'OptionsManagementController@getOptions']
        );

        Route::post(
            'option/list/{OptionType}',
            ['as' => 'option.list.update', 'uses' => 'OptionsManagementController@updateList']
        );

        Route::get(
            "attributes/list/all/{listType}",
            ["as" => "attributes", "uses" => "AttributesManagementController@getList"]
        );
        Route::post(
            "attributes/list/{listType}",
            ["as" => "attributes.list.update", "uses" => "AttributesManagementController@updateList"]
        );

        Route::get(
            "project_attributes/list/all/{listType}",
            ["as" => "project_attributes", "uses" => "ProjectAttributesManagementController@getList"]
        );
        Route::post(
            "project_attributes/list/{listType}",
            [
                "as" => "project_attributes.list.update",
                "uses" => "ProjectAttributesManagementController@updateList",
            ]
        );
        Route::get(
            "workflow/list/all/{listType}",
            ["as" => "workflow", "uses" => "WorkflowManagementController@getList"]
        );
        Route::post(
            "workflow/list/{listType}",
            ["as" => "workflow.list.update", "uses" => "WorkflowManagementController@updateList"]
        );
        //##End Admin Routes##
    }
);
