<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use Illuminate\Support\Facades\DB;
    use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
    use Dhayakawa\SpringIntoAction\Models\Volunteer;
    use Dhayakawa\SpringIntoAction\Models\SiteVolunteer;
    use Dhayakawa\SpringIntoAction\Models\SiteVolunteerRole;
    use Illuminate\Http\Request;

    class SiteVolunteerController extends BaseController {

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
            $model = new SiteVolunteer;
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
            if($success){
                $SiteVolunteerID = $model->SiteVolunteerID;

                $model = new SiteVolunteerRole;
                $data = array_map(
                    function ($value) {
                        if (is_array($value)) {
                            return join(',', $value);
                        }

                        return $value;
                    },
                    $request->only($model->getFillable())
                );
                $data['SiteVolunteerID'] = $SiteVolunteerID;
                $model->fill($data);
                $success = $model->save();
            }
            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Site Volunteer Addition Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Site Volunteer Addition Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Site Volunteer Addition Failed.'];
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
                $result = $model->getSiteVolunteer($id);
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
            $requestData = $request->all();
            \Illuminate\Support\Facades\Log::debug('requestData', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' .
                                                                                                    __LINE__,
                $requestData]);
            $model = SiteVolunteer::findOrFail($requestData['SiteVolunteerID']);
            $data = array_map(
                function ($value) {
                    if (is_array($value)) {
                        return join(',', $value);
                    }

                    return $value;
                },
                $request->only($model->getFillable())
            );
            \Illuminate\Support\Facades\Log::debug(
                'SiteVolunteer $data',
                [
                    'File:' . __FILE__,
                    'Method:' . __METHOD__,
                    'Line:' . __LINE__,
                    $data
                ]
            );
            $model->fill($data);
            $success1 = $model->save();

            $model = SiteVolunteerRole::findOrFail($requestData['SiteVolunteerRoleID']);
            $data = array_map(
                function ($value) {
                    if (is_array($value)) {
                        return join(',', $value);
                    }

                    return $value;
                },
                $request->only($model->getFillable())
            );
            \Illuminate\Support\Facades\Log::debug(
                'SiteVolunteerRole $data',
                [
                    'File:' . __FILE__,
                    'Method:' . __METHOD__,
                    'Line:' . __LINE__,
                    $data
                ]
            );
            $model->fill($data);
            $success2 = $model->save();
            $success = $success1 && $success2;
            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Site Volunteer Update Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Site Volunteer Update Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Site Volunteer Update Failed.'];
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
                    $model   = SiteVolunteer::where('SiteVolunteerID', '=', $modelID);
                    if($model->get()->count()) {
                        $success = $model->delete();
                    } else {
                        $success = true;
                    }
                    if(!$success) {
                        $batchSuccess = false;
                        $failMsg .= ' Site Volunteer Role failed. ';
                    }

                    $projectVolunteerRoleModel = SiteVolunteerRole::where('SiteVolunteerID', '=', $modelID);
                    $success = $projectVolunteerRoleModel->delete();

                    if(!$success) {
                        $batchSuccess = false;
                        $failMsg      .= ' Site Volunteer failed. ';
                    }
                }
            } else {
                $success = false;
                $failMsg = ' Oops. Nothing was sent to be deleted. If this keeps happening, tell David Hayakawa.';
            }
            $success = $batchSuccess;

            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Site Volunteer Batch Removal Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Site Volunteer Batch Removal Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Site Volunteer Batch Removal Failed.' . $failMsg];
            }


            return view('springintoaction::admin.main.response', $request, compact('response'));
        }

        public function getSiteVolunteers($SiteStatusID) {
            $model = new SiteVolunteerRole();

            return $model->getSiteVolunteers($SiteStatusID);
        }

        public function getAllSiteVolunteers() {
            $model = new SiteVolunteerRole();

            return $model->getAllSiteVolunteers();
        }

        public function getUnassigned($SiteStatusID, $Year) {

            $model = new SiteVolunteer();

            return $model->getUnassigned($SiteStatusID, $Year);
        }
    }
