<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
    use Dhayakawa\SpringIntoAction\Models\Volunteer;
    use Dhayakawa\SpringIntoAction\Models\SiteVolunteer;
    use Dhayakawa\SpringIntoAction\Models\SiteVolunteerRole;
    use Illuminate\Http\Request;
    use Dhayakawa\SpringIntoAction\Models\VolunteerStatusOptions;

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
            $siteVolunteer = SiteVolunteer::where(
                [
                    [
                        'VolunteerID',
                        '=',
                        $request['VolunteerID'],
                    ],
                    [
                        'SiteStatusID',
                        '=',
                        $request['SiteStatusID'],
                    ]
                ]
            )->get()->first();
            if (!empty($siteVolunteer)) {
                $success = true;
                $SiteVolunteerID = $siteVolunteer->SiteVolunteerID;
            } else {
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
                $SiteVolunteerID = $model->SiteVolunteerID;
            }
            $SiteRoleID = false;
            $siteVolunteerRoleStatus = false;
            if ($success) {
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
                $SiteRoleID = $model->SiteRoleID;
                $siteVolunteerRoleStatus = $model->Status;
            }

            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Site Volunteer Role Addition Not Implemented Yet.'];
            } elseif($success) {
                if ($SiteRoleID) {
                    $agreedVolunteerStatusId = (int)VolunteerStatusOptions::getIdByStatusOption('Agreed');
                    if ($agreedVolunteerStatusId === (int)$siteVolunteerRoleStatus) {
                        //$this->addIndividualToGroup($this->getGroupIdBySiteRoleId($SiteRoleID), $request['VolunteerID']);
                    }
                }
                $response = ['success' => true, 'msg' => 'Site Volunteer Role Addition Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Site Volunteer Role Addition Failed.'];
            }


            return view('springintoaction::admin.main.response', $request, compact('response'));
        }

        /**
         * @param $SiteVolunteerRoleID
         *
         * @return array
         */
        public function show($SiteVolunteerRoleID) {
            $model  = new SiteVolunteerRole;
            $result = $model->getDefaultRecordData();
            try {
                $result = $model->getSiteVolunteer($SiteVolunteerRoleID);
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
         * @param         $SiteVolunteerRoleID
         *
         * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
         */
        public function update(Request $request, $SiteVolunteerRoleID) {
            $failMsg = '';

            $model = SiteVolunteerRole::findOrFail($SiteVolunteerRoleID);
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
            if(isset($requestData['SiteVolunteerRoleStatus'])){
                $data['Status'] = is_array($requestData['SiteVolunteerRoleStatus']) ? current(
                    $requestData['SiteVolunteerRoleStatus']): $requestData['SiteVolunteerRoleStatus'];
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
            $SiteRoleID = $model->SiteRoleID;
            $siteVolunteerRoleStatus = $model->Status;
            if($success) {
                $agreedVolunteerStatusId = (int)VolunteerStatusOptions::getIdByStatusOption('Agreed');
                $bAgreedStatus = $agreedVolunteerStatusId === (int)$siteVolunteerRoleStatus;
                $siteVolunteerModel = SiteVolunteer::findOrFail($model->SiteVolunteerID);

                //$this->updateGroupIndividual($this->getGroupIdBySiteRoleId($SiteRoleID), $bAgreedStatus, $siteVolunteerModel->VolunteerID);

                $response = ['success' => true, 'msg' => 'Site Volunteer Role Update Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Site Volunteer Role Update Failed.'];
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

        public function batchDestroy(Request $request)
        {

            $params = $request->all();
            $batchSuccess = true;
            $failMsg = '';
            if (is_array($params['deleteModelIDs'])) {
                foreach ($params['deleteModelIDs'] as $modelID) {

                    $siteVolunteerRoleModel = SiteVolunteerRole::find($modelID);
                    $siteRoleId = $siteVolunteerRoleModel->SiteRoleID;
                    $SiteVolunteerID = $siteVolunteerRoleModel->SiteVolunteerID;
                    $SiteStatusID = $siteVolunteerRoleModel->SiteStatusID;
                    $siteVolunteer = SiteVolunteer::where('SiteVolunteerID', '=', $SiteVolunteerID)->get()->first();
                    $volunteerID = $siteVolunteer->VolunteerID;
                    $success = $siteVolunteerRoleModel->delete();

                    if (!$success) {
                        $batchSuccess = false;
                        $failMsg .= ' Site Volunteer Role failed. ';
                    } else {
                        if($volunteerID && $success){
                            $this->removeIndividualFromGroup($this->getGroupIdBySiteRoleId($siteRoleId), $volunteerID);
                        }
                        $siteVolunteerRoleModel = SiteVolunteerRole::where('SiteVolunteerID', '=', $SiteVolunteerID)->where(
                            'SiteStatusID',
                            '=',
                            $SiteStatusID)->get()->first();

                        if(!$siteVolunteerRoleModel){
                            $siteVolunteer = SiteVolunteer::where('SiteVolunteerID', '=', $SiteVolunteerID)->where(
                                'SiteStatusID',
                                '=',
                                $SiteStatusID
                            )->get()->first();
                            $volunteerID = $siteVolunteer->VolunteerID;
                            $success = $siteVolunteer->delete();
                            if ($volunteerID && $success) {
                                $this->removeIndividualFromAllGroups('site', $volunteerID);
                            }
                        }
                    }

                }
            } else {
                $success = false;
                $failMsg = ' Oops. Nothing was sent to be deleted. If this keeps happening, tell David Hayakawa.';
            }
            $success = $batchSuccess;

            if (!isset($success)) {
                $response = ['success' => false, 'msg' => 'Site Volunteer Batch Removal Not Implemented Yet.'];
            } elseif ($success) {
                $response = ['success' => true, 'msg' => 'Site Volunteer Batch Removal Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Site Volunteer Batch Removal Failed.' . $failMsg];
            }

            return view('springintoaction::admin.main.response', $request, compact('response'));
        }

        public function getSiteVolunteers($SiteStatusID)
        {
            $model = new SiteVolunteerRole();

            return $model->getSiteVolunteers($SiteStatusID);
        }

        public function getAllSiteVolunteers()
        {
            $model = new SiteVolunteerRole();

            return $model->getAllSiteVolunteers();
        }

        public function getUnassigned($SiteStatusID, $Year)
        {
            $model = new SiteVolunteer();

            return $model->getUnassigned($SiteStatusID, $Year);
        }
    }
