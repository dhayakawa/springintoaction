<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
    use Dhayakawa\SpringIntoAction\Models\Volunteer;
    use Dhayakawa\SpringIntoAction\Models\ProjectVolunteerRole;
    use Dhayakawa\SpringIntoAction\Models\Project;
    use Illuminate\Http\Request;
    use Dhayakawa\SpringIntoAction\Controllers\ajaxUploader;

    class VolunteerController extends BaseController {

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
            $model = new Volunteer;
            $data  = array_map(function ($value) {
                if(is_array($value)) {
                    return join(',', $value);
                }

                return $value;
            }, $request->only($model->getFillable()));

            if($data['PreferredSiteID'] === '') {
                $data['PreferredSiteID'] = 0;
            }
            if($data['ResponseID'] === '') {
                $data['ResponseID'] = 0;
            }
            if($data['IndividualID'] === '') {
                $data['IndividualID'] = 0;
            }
            array_walk($data, function (&$value, $key) {
                if(is_string($value)) {
                    $value = \urldecode($value);
                }
            });

            $model->fill($data);
            $success = $model->save();

            if($success) {
                $response = ['success' => true, 'msg' => 'Volunteer Creation Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Volunteer Creation Failed.'];
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
            $model  = new Volunteer;
            $result = $model->getDefaultRecordData();
            try {
                if($model = Volunteer::findOrFail($id)) {
                    $result = $model->toArray();
                }
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

        public function update(Request $request, $id) {
            $model = Volunteer::findOrFail($id);

            $data = array_map(function ($value) {
                if(is_array($value)) {
                    return join(',', $value);
                }

                return $value;
            }, $request->only($model->getFillable()));
            array_walk($data, function (&$value, $key) {
                if(is_string($value)) {
                    $value = \urldecode($value);
                }
                if($key !== 'VolunteerID' && preg_match("/ID$/", $key) && $value === '') {
                    $value = 0;
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

        public function batchDestroy(Request $request) {
            $params       = $request->all();
            $batchSuccess = true;
            if(is_array($params['modelIDs'])) {
                foreach($params['modelIDs'] as $modelID) {
                    $success = Volunteer::findOrFail($modelID)->delete();
                    if(!$success) {
                        $batchSuccess = false;
                    }
                    $model   = ProjectVolunteer::where('VolunteerID', '=', $modelID);
                    $success = $model->forceDelete();
                    if(!$success) {
                        $batchSuccess = false;
                    }
                    $model   = ProjectVolunteerRole::where('VolunteerID', '=', $modelID);
                    $success = $model->forceDelete();
                    if(!$success) {
                        $batchSuccess = false;
                    }
                }
            } else {
                $success = false;
            }
            $success = $batchSuccess;

            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Volunteer Batch Removal Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Volunteer Batch Removal Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Volunteer Batch Removal Failed.'];
            }


            return view('springintoaction::admin.main.response', $request, compact('response'));
        }

        public function getAll() {
            return Volunteer::orderBy('LastName', 'asc')
                ->get()->toArray();
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

        public function uploadList(Request $request) {

            $aaOptions['upload_dir'] = 'uploads/';
            $aaOptions['upload_url'] = 'volunteer/list/upload/';
            $oAjaxUploadHandler      = new ajaxUploader($aaOptions);
        }

        public function getProjectVolunteers($ProjectID) {
            try {
                if($v = Project::find($ProjectID)->volunteers) {
                    return $v->toArray();
                }
            } catch(\Exception $e) {
                return [];
            }

            return [];
        }

        public function getLeadVolunteers($ProjectID) {
            // Gave up on the Eloquent relational model
            return $project_leads = Volunteer::join('project_volunteer_role', 'volunteers.VolunteerID', '=', 'project_volunteer_role.VolunteerID')
                ->join('project_roles', 'project_volunteer_role.ProjectRoleID', '=', 'project_roles.ProjectRoleID')
                ->where('project_volunteer_role.ProjectID', $ProjectID)->get()->toArray();
        }
    }
