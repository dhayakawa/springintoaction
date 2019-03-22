<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use Illuminate\Support\Facades\DB;
    use Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
    use Illuminate\Http\Request;
    use Dhayakawa\SpringIntoAction\Models\Site;
    use Dhayakawa\SpringIntoAction\Models\SiteStatus;

    class SiteController extends BaseController {

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
            $site = new Site;
            $data = $request->only($site->getFillable());
            array_walk($data, function (&$value, $key) {
                if(is_string($value)) {
                    $value = \urldecode($value);
                }
            });
            $site->fill($data);
            $success = $site->save();

            if($success){
                $siteStatus = new SiteStatus;
                $defaults = $siteStatus->getDefaultRecordData();
                $defaults['SiteID'] = $site->SiteID;

                $siteStatus->fill($defaults);
                $success = $siteStatus->save();
            }

            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Site Creation Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Site Creation Succeeded.', 'new_site_id' => $site->SiteID, 'new_site_status_id'=> $siteStatus->SiteStatusID];
            } else {
                $response = ['success' => false, 'msg' => 'Site Creation Failed.'];
            }


            return view('springintoaction::admin.main.response', $request, compact('response'));
        }

        /**
         * Display the specified resource.
         *
         * @param  int $id
         *
         * @return \Illuminate\Http\Response
         */
        public function show($id) {
            return Site::find($id)->toArray();
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
            $model = Site::findOrFail($id);

            $data = $request->only($model->getFillable());
            array_walk($data, function (&$value, $key) {
                if(is_string($value)) {
                    $value = \urldecode($value);
                }
            });
            $model->fill($data);
            $success = $model->save();

            if($success) {
                $response = ['success' => true, 'msg' => 'Site Update Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Site Update Failed.'];
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
        public function destroy(Request $request, $id) {
            $success = Site::findOrFail($id)->forceDelete();

            if($success) {
                $response = ['success' => true, 'msg' => 'Site Delete Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Site Delete Failed.'];
            }


            return view('springintoaction::admin.main.response', $request, compact('response'));
        }

        public function getSites(){
            return Site::orderBy('SiteName', 'asc')
                ->get()->toArray();
        }
    }
