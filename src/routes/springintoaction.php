<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/13/2018
     * Time: 10:25 AM
     */
    $default      = ['prefix' => config('springintoaction.app.frontend_prefix', ''),
        'namespace' => 'Dhayakawa\SpringIntoAction\Controllers'
    ];
    $adminDefault = array_merge($default, ['prefix' => config('springintoaction.app.backend_prefix', 'admin'),
    ]);
    //Route::group(array_merge($default, ['middleware' => ['web']]), function () {
    //    Route::patch('/', [
    //        'as' => 'springintoaction.index',
    //        'uses' => 'HomeController@index'
    //    ]);
    //    // Login Routes...
    //    Route::get('login', ['as' => 'login', 'uses' => 'Auth\LoginController@showLoginForm']);
    //    Route::post('login', ['as' => 'login.post', 'uses' => 'Auth\LoginController@login']);
    //    Route::post('logout', ['as' => 'logout', 'uses' => 'Auth\LoginController@logout']);
    //
    //    // Registration Routes...
    //    Route::get('register', ['as' => 'register', 'uses' => 'Auth\RegisterController@showRegistrationForm']);
    //    Route::post('register', ['as' => 'register.post', 'uses' => 'Auth\RegisterController@register']);
    //
    //    // Password Reset Routes...
    //    Route::get('password/request', ['as' => 'password.request', 'uses' => 'Auth\ForgotPasswordController@showLinkRequestForm']);
    //    Route::post('password/email', ['as' => 'password.email', 'uses' => 'Auth\ForgotPasswordController@sendResetLinkEmail']);
    //    Route::get('password/reset/{token}', ['as' => 'password.reset', 'uses' => 'Auth\ResetPasswordController@showResetForm']);
    //    Route::post('password/reset', ['as' => 'password.reset.post', 'uses' => 'Auth\ResetPasswordController@reset']);
    //
    //    // Sign Up Routes. No login required at the moment
    //    Route::get('signup', ['as' => 'signup', 'uses' => 'SignUpController@showSignUpForm']);
    //    Route::post('signup', ['as' => 'signup.post', 'uses' => 'SignUpController@signUp']);
    //});

    Route::group(array_merge($adminDefault, ['middleware' => ['web', 'auth', 'ability:admin,backend_access']]), function () {
        //Route::get('/', ['as' => 'sia.home', 'uses' => 'SpringIntoActionMainAppController@index']);
        Route::resource('sia', 'SpringIntoActionMainAppController');

        //Route::resource('projects', 'ProjectsController');
        Route::put('project/{ProjectID}', ['as' => 'project.update', 'uses' => 'ProjectsController@update']);
        Route::post('project', ['as' => 'project.store', 'uses' => 'ProjectsController@store']);
        Route::get('project/list/{SiteStatusID}', ['as' => 'project.list', 'uses' => 'ProjectsController@getSiteProjects']);
        Route::get('project/{ProjectID}', ['as' => 'project.get', 'uses' => 'ProjectsController@getProject']);
        Route::post('project/list/upload', ['as' => 'project.upload', 'uses' => 'ProjectsController@uploadList']);
        Route::post('project/batch/destroy', ['as' => 'project.batch.destroy', 'uses' => 'ProjectsController@batchDestroy']);

        // These routes get the arrays for the tabs
        Route::get('project/budget/{ProjectID}', ['as' => 'project.budget', 'uses' => 'ProjectsController@getBudget']);
        Route::get('project/contact/{ProjectID}', ['as' => 'project.contact', 'uses' => 'ProjectsController@getContact']);
        Route::get('project/project_leads/{ProjectID}', ['as' => 'project.project_leads', 'uses' => 'ProjectsController@getLeadVolunteers']);
        Route::get('project/volunteers/{ProjectID}', ['as' => 'project.volunteers', 'uses' => 'ProjectsController@getVolunteers']);

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
        Route::get('sitestatus/all/site/years/{SiteID}', ['as' => 'sitestatus.all.site.years', 'uses' => 'SiteStatusController@getAllSiteYears']);

        //Route::resource('contact', 'ContactController');
        Route::get('contact/{ContactID}', ['as' => 'contact', 'uses' => 'ContactController@show']);
        Route::put('contact', ['as' => 'contact.update', 'uses' => 'ContactController@update']);
        Route::post('contact/{ContactID}', ['as' => 'contact.create', 'uses' => 'ContactController@store']);

        //Route::resource('budget', 'BudgetController');
        Route::get('budget/{BudgetID}', ['as' => 'budget', 'uses' => 'BudgetController@show']);
        Route::put('budget/{BudgetID}', ['as' => 'budget.update', 'uses' => 'BudgetController@update']);
        Route::post('budget', ['as' => 'budget.create', 'uses' => 'BudgetController@store']);

        //Route::resource('volunteer', 'VolunteerController');
        Route::get('volunteer/{VolunteerID}', ['as' => 'volunteer', 'uses' => 'VolunteerController@show']);
        Route::get('volunteer/all', ['as' => 'volunteer.all', 'uses' => 'VolunteerController@getAll']);
        Route::put('volunteer/{VolunteerID}', ['as' => 'volunteer.update', 'uses' => 'VolunteerController@update']);
        Route::post('volunteer', ['as' => 'volunteer.create', 'uses' => 'VolunteerController@store']);


        Route::post('volunteer/batch/store', ['as' => 'project_volunteer.batch.store', 'uses' => 'ProjectVolunteerController@batchStore']);
        Route::post('volunteer/batch/destroy', ['as' => 'project_volunteer.batch.destroy', 'uses' => 'ProjectVolunteerController@batchDestroy']);
        Route::get('project_volunteer/unassigned/{SiteID}/{Year}', ['as' => 'project_volunteer.unassigned', 'uses' => 'ProjectVolunteerController@getUnassigned']);

        //Route::resource('lead_volunteer', 'ProjectVolunteerRoleController');
        Route::get('project_lead/all', ['as' => 'project_lead', 'uses' => 'ProjectVolunteerRoleController@getProjectLeads']);
        Route::get('project_lead/{VolunteerID}', ['as' => 'project_lead', 'uses' => 'ProjectVolunteerRoleController@show']);
        Route::put('project_lead/{VolunteerID}', ['as' => 'project_lead.update', 'uses' => 'ProjectVolunteerRoleController@update']);
        Route::post('project_lead', ['as' => 'project_lead.create', 'uses' => 'ProjectVolunteerRoleController@store']);
        //Route::post('project_lead/batch/destroy', ['as' => 'project_lead.batch.destroy', 'uses' => 'ProjectVolunteerController@batchDestroy']);

    });
