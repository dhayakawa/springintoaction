<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/27/2018
 * Time: 9:30 AM
 */

namespace Dhayakawa\SpringIntoAction\Controllers;

use Dhayakawa\SpringIntoAction\Helpers\CurrentYearTrait;
use Illuminate\Foundation\Bus\DispatchesJobs;
use App\Http\Controllers\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Dhayakawa\SpringIntoAction\Helpers\ArraySearchTrait;

class BackboneAppController extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests, ArraySearchTrait,CurrentYearTrait;
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    protected function view($view, $request, array $data = [])
    {
        $data['parentLayout'] =
            $request->ajax() ? 'springintoaction::admin.layouts.ajaxcontent' : 'boilerplate::layout.index';

        //die(print_r($data,1));
        return view($view, $request, $data);
    }


}
