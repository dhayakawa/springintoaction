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
        Route::resource('sia', 'SpringIntoActionMainAppController');

        Route::resource('projects', 'ProjectsController');
        Route::post('project/{ProjectID}', ['as' => 'project.update', 'uses' => 'ProjectsController@update']);
        Route::get('projects/{SiteID}/{Year}', ['as' => 'projects.site.year', 'uses' => 'ProjectsController@getSiteProjects']);
        Route::get('project/{ProjectID}', ['as' => 'project', 'uses' => 'ProjectsController@getProject']);
        Route::get('project/budget/{ProjectID}', ['as' => 'project.budget', 'uses' => 'ProjectsController@getBudget']);
        Route::get('project/contact/{ProjectID}', ['as' => 'project.contact', 'uses' => 'ProjectsController@getContact']);
        Route::get('project/lead_volunteers/{ProjectID}', ['as' => 'project.lead_volunteers', 'uses' => 'ProjectsController@getLeadVolunteers']);
        Route::get('project/volunteers/{ProjectID}', ['as' => 'project.volunteers', 'uses' => 'ProjectsController@getVolunteers']);

        Route::resource('site', 'SiteController');
        Route::post('site/{SiteID}', ['as' => 'site.update', 'uses' => 'SiteController@update']);
        Route::get('site/{SiteID}', ['as' =>'site' , 'uses'=>'SiteController@show']);
        Route::get('site/year/{SiteID}', ['as' =>'site.year' , 'uses'=>'SiteController@getStatusYears']);

        Route::resource('sitestatus', 'SiteStatusController');
        Route::get('sitestatus/{SiteStatusID}', ['as' => 'site', 'uses' => 'SiteStatusController@show']);
        Route::post('sitestatus/{SiteStatusID}', ['as' => 'sitestatus.update', 'uses' => 'SiteStatusController@update']);
        Route::resource('contact', 'ContactController');
        Route::get('contact/{ContactID}', ['as' => 'contact', 'uses' => 'ContactController@getContact']);
        Route::post('contact/{ContactID}', ['as' => 'contact.update', 'uses' => 'ContactController@update']);
        Route::resource('budget', 'BudgetController');
        Route::post('budget/{BudgetID}', ['as' => 'budget.update', 'uses' => 'BudgetController@update']);



        Route::resource('volunteer', 'VolunteerController');
        Route::post('volunteer/{VolunteerID}', ['as' => 'volunteer.update', 'uses' => 'VolunteerController@update']);

        Route::resource('lead_volunteer', 'ProjectVolunteerRoleController');
        Route::post('lead_volunteer/{VolunteerID}', ['as' => 'lead_volunteer.update', 'uses' => 'ProjectVolunteerRoleController@update']);
    });
