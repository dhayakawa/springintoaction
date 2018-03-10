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
            if(is_array($params['VolunteerIDs'])) {
                foreach($params['VolunteerIDs'] as $volunteerID) {
                    $model   = ProjectVolunteer::where('VolunteerID', '=', $volunteerID)->where('ProjectID', '=', $params['ProjectID']);
                    $success = $model->delete();
                    if(!$success) {
                        $batchSuccess = false;
                    }
                    $model   = ProjectVolunteerRole::where('VolunteerID', '=', $volunteerID)->where('ProjectID', '=', $params['ProjectID'])->where('ProjectRoleID', '=', $params['ProjectRoleID']);
                    $success = $model->delete();
                    if(!$success) {
                        $batchSuccess = false;
                    }
                }
            } else {
                $success = false;
            }
            $success = $batchSuccess;

            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Project Volunteer Batch Removal Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Project Volunteer Batch Removal Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Project Volunteer Batch Removal Failed.'];
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

            $sql = "SELECT volunteers.* FROM volunteers
                      left JOIN
                    (SELECT pv.*
                    FROM project_volunteers pv
                    WHERE pv.ProjectID NOT IN (
                    SELECT pv.ProjectID
                    FROM project_volunteers pv
                    WHERE pv.ProjectID NOT IN (SELECT `projects`.ProjectID
                                               FROM `projects`
                                                 JOIN `site_status`
                                                   ON `site_status`.`SiteStatusID` = `projects`.`SiteStatusID`
                                                 INNER JOIN `sites` ON `sites`.`SiteID` = `site_status`.`SiteID`
                                               WHERE `site_status`.`Year` = ? AND `sites`.`SiteID` = ?))) fakeTable ON fakeTable.VolunteerID = volunteers.VolunteerID
                    WHERE fakeTable.VolunteerID IS null;";
            $result = DB::select($sql,[$Year, $SiteID]);


            return $result;
        }
    }
