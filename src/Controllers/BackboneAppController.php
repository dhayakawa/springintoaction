<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/27/2018
 * Time: 9:30 AM
 */

namespace Dhayakawa\SpringIntoAction\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use App\Http\Controllers\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Dhayakawa\SpringIntoAction\Helpers\ArraySearchTrait;

class BackboneAppController extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests, ArraySearchTrait;

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

    public function getCurrentYear()
    {
        $yearNow = date('Y');
        $month = date('n');

        // need to make sure the year is for the upcoming/next spring
        // or this spring if the month is less than may
        return $month > 5 ? $yearNow + 1 : $yearNow;
    }
}
