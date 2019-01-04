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

    class FrontendBackboneAppController extends BaseController {

        //use DispatchesJobs, ValidatesRequests;

        /**
         * Create a new controller instance.
         *
         * @return void
         */
        public function __construct() {
            $this->middleware('web');
        }

        protected function view($view, $request, array $data = array()) {

            $data['parentLayout'] = $request->ajax() ? 'springintoaction::frontend.ajaxcontent' : 'springintoaction::frontend.layout';
            //die(print_r($data,1));
            return view($view, $request, $data);
        }
    }
