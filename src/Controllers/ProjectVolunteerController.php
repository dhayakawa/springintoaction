<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use Illuminate\Support\Facades\DB;
    use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
    use Dhayakawa\SpringIntoAction\Models\Volunteer;
    use Dhayakawa\SpringIntoAction\Models\ProjectVolunteer;
    use Dhayakawa\SpringIntoAction\Models\ProjectVolunteerRole;
    use Illuminate\Http\Request;

    class ProjectVolunteerController extends BaseController {

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
            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Project Volunteer Addition Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Project Volunteer Addition Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Project Volunteer Addition Failed.'];
            }


            return view('springintoaction::admin.main.response', $request, compact('response'));
        }

        public function batchStore(Request $request) {
            $params       = $request->all();
            $batchSuccess = true;
            if(is_array($params['VolunteerIDs'])) {
                foreach($params['VolunteerIDs'] as $volunteerID) {
                    $model = new ProjectVolunteer;
                    $model->fill(['VolunteerID' => $volunteerID, 'ProjectID' => $params['ProjectID']]);
                    $success = $model->save();
                    if(!$success) {
                        $batchSuccess = false;
                    }
                    $model = new ProjectVolunteerRole;
                    $model->fill(['VolunteerID' => $volunteerID, 'ProjectID' => $params['ProjectID'], 'ProjectRoleID' => $params['ProjectRoleID']]);
                    $success = $model->save();
                    if(!$success) {
                        $batchSuccess = false;
                    }
                }
            } else {
                $success = false;
            }
            $success = $batchSuccess;

            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Project Volunteer Batch Addition Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Project Volunteer Batch Addition Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Project Volunteer Batch Addition Failed.'];
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
            //$model = Volunteer::findOrFail($id);
            //
            //$model->fill($request->only($model->getFillable()));
            //$success = $model->save();
            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Project Volunteer Update Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Project Volunteer Update Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Project Volunteer Update Failed.'];
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

        public function batchDestroy(Request $request) {
            $params       = $request->all();
            $batchSuccess = true;
            $failMsg = '';
            if(is_array($params['deleteModelIDs'])) {
                foreach($params['deleteModelIDs'] as $modelID) {
                    $model   = ProjectVolunteerRole::where('VolunteerID', '=', $modelID)->where('ProjectID', '=', $params['ProjectID'])->where('ProjectRoleID', '=', $params['ProjectRoleID']);
                    if($model->get()->count()) {
                        $success = $model->forceDelete();
                    } else {
                        $success = true;
                    }
                    if(!$success) {
                        $batchSuccess = false;
                        $failMsg .= ' Project Volunteer Role failed. ';
                    }

                    // Only remove from project volunteers if there are no other roles available
                    $projectVolunteerRoleModel = ProjectVolunteerRole::where('VolunteerID', '=', $modelID)->where('ProjectID', '=', $params['ProjectID']);
                    $projectVolunteerModel = ProjectVolunteer::where('VolunteerID', '=', $modelID)->where('ProjectID', '=', $params['ProjectID']);

                    if($projectVolunteerRoleModel->get()->count() === 0 && $projectVolunteerModel->get()->count()) {
                        $success = $projectVolunteerModel->forceDelete();
                    } else {
                        $success = true;
                    }

                    if(!$success) {
                        $batchSuccess = false;
                        $failMsg      .= ' Project Volunteer failed. ';
                    }
                }
            } else {
                $success = false;
                $failMsg = ' Oops. Nothing was sent to be deleted. If this keeps happening, tell David Hayakawa.';
            }
            $success = $batchSuccess;

            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Project Volunteer Batch Removal Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Project Volunteer Batch Removal Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Project Volunteer Batch Removal Failed.' . $failMsg];
            }


            return view('springintoaction::admin.main.response', $request, compact('response'));
        }

        public function getProjectLeads($ProjectID) {
            $model = new ProjectVolunteerRole();

            return $model->getProjectLeads($ProjectID);
        }

        public function getAllProjectLeads() {
            $model = new ProjectVolunteerRole();

            return $model->getAllProjectLeads();
        }

        public function getUnassigned($SiteID, $Year) {

            $model = new ProjectVolunteer();

            return $model->getUnassigned($SiteID, $Year);
        }
    }
