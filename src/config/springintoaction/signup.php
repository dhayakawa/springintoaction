<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/15/2018
     * Time: 9:10 AM
     */
    return [
        'allow' => true, // Allow to signups to spring into action projects
        'redirectTo' => 'springintoaction.frontend.signup_closed', // where to redirect if signups are not allowed
        'providers' => [
            'volunteers' => [
                'driver' => 'eloquent',
                'model' => Dhayakawa\SpringIntoAction\Models\Volunteer::class,
                'table' => 'volunteers'
            ]
        ]
    ];
