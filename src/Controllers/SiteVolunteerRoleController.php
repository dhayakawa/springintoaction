<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
    use Dhayakawa\SpringIntoAction\Models\Volunteer;
    use Dhayakawa\SpringIntoAction\Models\SiteVolunteerRole;
    use Illuminate\Http\Request;

    class SiteVolunteerRoleController extends BaseController {

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
            $params = $request->all();
            $model = new SiteVolunteerRole;
            $model->fill(['VolunteerID' => $params['selectVolunteerID'], 'SiteStatusID' => $params['SiteStatusID'], 'SiteRoleID' => $params['SiteRoleID'], 'Status' => $params['Status']]);
            $success = $model->save();

            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Site Lead Addition Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Site Lead Addition Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Site Lead Addition Failed.'];
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
            $model  = new SiteVolunteerRole;
            $result = $model->getDefaultRecordData();
            try {
                $result = $model->getSiteLead($id);
            } catch(\Exception $e) {
                report($e);
            }

            return $result;
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
         * @param  int $id
         *
         * @return \Illuminate\Http\Response
         */
        public function update(Request $request, $id) {
            $batchSuccess = true;
            $failMsg = '';
            $params = $request->all();
            array_walk(
                $params,
                function (&$value, $key) {
                    if (is_string($value)) {
                        $value = \urldecode($value);
                    } elseif(is_array($value)){
                        $value = join(",", $value);
                    }
                }
            );
            $projectVolunteerRoleModel  = new SiteVolunteerRole;
            $projectVolunteerRoleModel->fill(['VolunteerID' => $params['VolunteerID'], 'SiteStatusID' => $params['SiteStatusID'], 'SiteRoleID' => $params['SiteRoleID'], 'Status' => $params['SiteVolunteerRoleStatus']]);
            $success = $projectVolunteerRoleModel->save();
            if(!$success) {
                $batchSuccess = false;
                $failMsg      .= ' Site Volunteer Role update failed. ';
            }
            $model = Volunteer::findOrFail($id);
            $data = $request->only($model->getFillable());
            array_walk(
                $data,
                function (&$value, $key) {
                    if (is_string($value)) {
                        $value = \urldecode($value);
                    } elseif (is_array($value)) {
                        $value = join(",", $value);
                    }
                }
            );
            $model->fill($data);
            $success = $model->save();
            if(!$success) {
                $batchSuccess = false;
                $failMsg      .= ' Volunteer update failed. ';
            }
            $success = $batchSuccess;
            if($success) {
                $response = ['success' => true, 'msg' => 'Volunteer Update Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Volunteer Update Failed.' . $failMsg];
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

        public function getSiteLeads($SiteStatusID){
            $model = new SiteVolunteerRole();
            return $model->getSiteLeads($SiteStatusID);
        }

        public function getAllSiteLeads() {
            $model = new SiteVolunteerRole();

            return $model->getAllSiteLeads();
        }
    }
