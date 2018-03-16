<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
    use Illuminate\Http\Request;
    use Dhayakawa\SpringIntoAction\Models\SiteStatus;

    class SiteStatusController extends BaseController {

        /**
         * Display a listing of the resource.
         *
         * @return \Illuminate\Http\Response
         */
        public function index() {
            //
        }

        /**
         * Show the form for creating a new resource.
         *
         * @return \Illuminate\Http\Response
         */
        public function create() {
            //
        }

        /**
         * Store a newly created resource in storage.
         *
         * @param  \Illuminate\Http\Request $request
         *
         * @return \Illuminate\Http\Response
         */
        public function store(Request $request) {
            //
        }

        /**
         * Display the specified resource.
         *
         * @param  int $id
         *
         * @return \Illuminate\Http\Response
         */
        public function show($id) {
            return SiteStatus::find($id)->toArray();
        }

        /**
         * Show the form for editing the specified resource.
         *
         * @param  int $id
         *
         * @return \Illuminate\Http\Response
         */
        public function edit($id) {
            //
        }

        /**
         * Update the specified resource in storage.
         *
         * @param  \Illuminate\Http\Request $request
         *
         *
         * @return \Illuminate\Http\Response
         */
        public function update(Request $request, $id) {
            $model = SiteStatus::findOrFail($id);

            $data = $request->only($model->getFillable());
            array_walk($data, function (&$value, $key) {
                if(is_string($value)) {
                    $value = \urldecode($value);
                }
            });
            $model->fill($data);
            $success = $model->save();

            if($success) {
                $response = ['success' => true, 'msg' => 'Volunteer Update Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Volunteer Update Failed.'];
            }


            return view('springintoaction::admin.main.response', $request, compact('response'));

        }

        /**
         * Remove the specified resource from storage.
         *
         * @param  int $id
         *
         * @return \Illuminate\Http\Response
         */
        public function destroy($id) {
            //
        }

        /**
         * Data for site years dropdown
         * @param $SiteID
         *
         * @return mixed
         */
        public function getAllSiteYears($SiteID) {
            $site_years = SiteStatus::select('SiteStatusID', 'SiteID', 'Year')->where('SiteID', $SiteID)->orderBy('Year', 'desc')->get()->toArray();

            return $site_years;
        }
    }
