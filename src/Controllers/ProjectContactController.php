<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use Illuminate\Support\Facades\DB;
    use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
    use Dhayakawa\SpringIntoAction\Models\Volunteer;
    use Dhayakawa\SpringIntoAction\Models\ProjectContact;
    use Dhayakawa\SpringIntoAction\Models\ProjectContactRole;
    use Illuminate\Http\Request;

    class ProjectContactController extends BaseController {

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
            $model = new ProjectContact;
            $model->fill(['ContactID' => $params['ContactID'], 'ProjectID' => $params['ProjectID']]);
            $success = $model->save();
            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Project Contact Addition Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Project Contact Addition Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Project Contact Addition Failed.'];
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
            $model  = new ProjectContact;
            $result = $model->getDefaultRecordData();
            try {
                if($model = ProjectContact::findOrFail($id)) {
                    $result = $model->toArray();
                }
            } catch(\Exception $e) {
                report($e);
            }
\Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__, $result]);
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
            $model = ProjectContact::findOrFail($id);

            $model->fill($request->only($model->getFillable()));
            $success = $model->save();
            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Project Contact Update Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Project Contact Update Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Project Contact Update Failed.'];
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

        public function batchDestroyProjectContacts(Request $request) {
            $params       = $request->all();
            $batchSuccess = true;
            if(is_array($params['deleteModelIDs'])) {
                foreach($params['deleteModelIDs'] as $modelID) {
                    $model   = ProjectContact::where('ContactID', '=', $modelID)->where('ProjectID', '=', $params['ProjectID']);

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
                $response = ['success' => false, 'msg' => 'Project Contact Batch Removal Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Project Contact Batch Removal Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Project Contact Batch Removal Failed.'];
            }


            return view('springintoaction::admin.main.response', $request, compact('response'));
        }

        public function getProjectContacts($ProjectID) {
            $model = new ProjectContact();

            return $model->getProjectContacts($ProjectID);
        }

        public function getAllProjectContacts() {
            $model = new ProjectContact();

            return $model->getAllProjectContacts();
        }

    }
