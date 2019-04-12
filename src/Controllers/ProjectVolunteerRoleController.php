<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
    use Dhayakawa\SpringIntoAction\Models\Volunteer;
    use Dhayakawa\SpringIntoAction\Models\ProjectVolunteerRole;
    use Dhayakawa\SpringIntoAction\Models\ProjectVolunteer;
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

            $projectVolunteer = ProjectVolunteer::where(
                [
                    [
                        'VolunteerID',
                        '=',
                        $request['VolunteerID'],
                    ],
                    [
                        'ProjectID',
                        '=',
                        $request['ProjectID'],
                    ]
                ]
            )->get()->first();
            if (!empty($projectVolunteer)) {
                $success = true;
                $ProjectVolunteerID = $projectVolunteer->ProjectVolunteerID;
            } else {
                $model = new ProjectVolunteer;
                $data = array_map(
                    function ($value) {
                        if (is_array($value)) {
                            return join(',', $value);
                        }

                        return $value;
                    },
                    $request->only($model->getFillable())
                );
                array_walk(
                    $data,
                    function (&$value, $key) {
                        if (is_string($value)) {
                            $value = \urldecode($value);
                        }
                    }
                );
                $model->fill($data);

                $success = $model->save();
                $ProjectVolunteerID = $model->ProjectVolunteerID;
            }

            if ($success) {
                $model = new ProjectVolunteerRole;
                $data = array_map(
                    function ($value) {
                        if (is_array($value)) {
                            return join(',', $value);
                        }

                        return $value;
                    },
                    $request->only($model->getFillable())
                );
                //$data['SiteVolunteerID'] = $ProjectVolunteerID;
                $model->fill($data);
                $success = $model->save();
            }

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
         * @param Request $request
         * @param         $ProjectVolunteerRoleID
         *
         * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
         */
        public function update(Request $request, $ProjectVolunteerRoleID) {
            $model = ProjectVolunteerRole::findOrFail($ProjectVolunteerRoleID);
            $data = array_map(
                function ($value) {
                    if (is_array($value)) {
                        return join(',', $value);
                    }

                    return $value;
                },
                $request->only($model->getFillable())
            );
            $requestData = $request->all();
            if (isset($requestData['ProjectVolunteerRoleStatus'])) {
                $data['Status'] = is_array($requestData['ProjectVolunteerRoleStatus']) ? current(
                    $requestData['ProjectVolunteerRoleStatus']
                ) : $requestData['ProjectVolunteerRoleStatus'];
            }
            // \Illuminate\Support\Facades\Log::debug(
            //     'SiteVolunteerRole $data',
            //     [
            //         'File:' . __FILE__,
            //         'Method:' . __METHOD__,
            //         'Line:' . __LINE__,
            //         $data
            //     ]
            // );
            $model->fill($data);
            $success = $model->save();

            if($success) {
                $response = ['success' => true, 'msg' => 'Project Volunteer Role Update Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Project Volunteer Role  Update Failed.'];
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
