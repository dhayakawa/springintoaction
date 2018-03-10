<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
    use Dhayakawa\SpringIntoAction\Models\Volunteer;
    use Dhayakawa\SpringIntoAction\Models\ProjectVolunteerRole;
    use Illuminate\Http\Request;

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
            //
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

            $model->fill($request->only($model->getFillable()));
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
            //if(is_array($params['ProjectIDs'])) {
            //    foreach($params['ProjectIDs'] as $projectID) {
            //        $success = Project::findOrFail($projectID)->delete();
            //        if(!$success) {
            //            $batchSuccess = false;
            //        }
            //        $model   = ProjectVolunteerRole::where('ProjectID', '=', $projectID);
            //        $success = $model->delete();
            //        if(!$success) {
            //            $batchSuccess = false;
            //        }
            //    }
            //} else {
            //    $success = false;
            //}
            //$success = $batchSuccess;

            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Volunteer Batch Removal Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Volunteer Batch Removal Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Volunteer Batch Removal Failed.'];
            }


            return view('springintoaction::admin.main.response', $request, compact('response'));
        }

        public function getAll(){

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
    }
