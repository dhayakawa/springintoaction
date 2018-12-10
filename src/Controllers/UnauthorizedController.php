<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 12/8/2018
 * Time: 3:54 PM
 */


namespace Dhayakawa\SpringIntoAction\Controllers;

use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;

class UnauthorizedController extends BaseController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('web');
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('springintoaction::frontend.unauthorized');
    }
}
