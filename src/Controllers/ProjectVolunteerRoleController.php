<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
    use Dhayakawa\SpringIntoAction\Models\Volunteer;
    use Dhayakawa\SpringIntoAction\Models\ProjectVolunteerRole;
    use Illuminate\Http\Request;

    class ProjectVolunteerRoleController extends BaseController {

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
            $model = new ProjectVolunteerRole;
            $model->fill(['VolunteerID' => $params['selectVolunteerID'], 'ProjectID' => $params['ProjectID'], 'ProjectRoleID' => $params['ProjectRoleID'], 'Status' => $params['Status']]);
            $success = $model->save();

            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Project Lead Addition Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Project Lead Addition Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Project Lead Addition Failed.'];
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
            $model  = new ProjectVolunteerRole;
            $result = $model->getDefaultRecordData();
            try {
                $result = $model->getProjectLead($id);
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
            $projectVolunteerRoleModel  = new ProjectVolunteerRole;
            $projectVolunteerRoleModel->fill(['VolunteerID' => $params['VolunteerID'], 'ProjectID' => $params['ProjectID'], 'ProjectRoleID' => $params['ProjectRoleID'], 'Status' => $params['ProjectVolunteerRoleStatus']]);
            $success = $projectVolunteerRoleModel->save();
            if(!$success) {
                $batchSuccess = false;
                $failMsg      .= ' Project Volunteer Role update failed. ';
            }
            $model = Volunteer::findOrFail($id);
            $model->fill($request->only($model->getFillable()));
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

        public function getProjectLeads($ProjectID){
            $model = new ProjectVolunteerRole();
            return $model->getProjectLeads($ProjectID);
        }

        public function getAllProjectLeads() {
            $model = new ProjectVolunteerRole();

            return $model->getAllProjectLeads();
        }
    }
