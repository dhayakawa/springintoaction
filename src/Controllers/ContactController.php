<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use Dhayakawa\SpringIntoAction\Models\Project;
    use Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
    use Dhayakawa\SpringIntoAction\Models\Contact;
    use Dhayakawa\SpringIntoAction\Models\ProjectContact;
    use Illuminate\Http\Request;
    use Dhayakawa\SpringIntoAction\Controllers\ajaxUploader;

    class ContactController extends BaseController {

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
            $model = new Contact;
            $data = $request->only($model->getFillable());
            array_walk($data, function (&$value, $key) {
                if(is_string($value)) {
                    $value = \urldecode($value);
                }
            });
            $model->fill($data);
            $success = $model->save();

            if($success) {
                $response = ['success' => true, 'msg' => 'Contact Creation Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Contact Creation Failed.'];
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
            $model  = new Contact;
            $result = $model->getDefaultRecordData();
            try {
                if($model = Contact::findOrFail($id)) {
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
            $model = Contact::findOrFail($id);

            $data = $request->only($model->getFillable());
            array_walk($data, function (&$value, $key) {
                if(is_string($value)) {
                    $value = \urldecode($value);
                } elseif (is_array($value)) {
                    $value = join(',', $value);
                }
            });
            $model->fill($data);
            $success = $model->save();

            if($success) {
                $response = ['success' => true, 'msg' => 'Contact Update Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Contact Update Failed.'];
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

        public function batchDestroyContacts(Request $request) {
            $params       = $request->all();
            $batchSuccess = true;
            if(is_array($params['deleteModelIDs'])) {
                foreach($params['deleteModelIDs'] as $modelID) {
                    $success = Contact::findOrFail($modelID)->delete();
                    if(!$success) {
                        $batchSuccess = false;
                    }
                    // TODO: figure out relational soft deletes
                    $model   = ProjectContact::where('project_contacts.ContactID', '=', $modelID);
                    $success = $model->count() ? $model->delete() : true;
                    if(!$success) {
                        $batchSuccess = false;
                    }

                }
            } else {
                $success = false;
            }
            $success = $batchSuccess;

            if(!isset($success)) {
                $response = ['success' => false, 'msg' => 'Contact Batch Removal Not Implemented Yet.'];
            } elseif($success) {
                $response = ['success' => true, 'msg' => 'Contact Batch Removal Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Contact Batch Removal Failed.'];
            }


            return view('springintoaction::admin.main.response', $request, compact('response'));
        }

        public function getContact($id) {
            try {
                if($contact = Contact::find($id)->get()) {
                    return current($contact->toArray());
                }
            } catch(\Exception $e) {
                return [];
            }

            return [];
        }

        public function getContacts(){
            $contact = Contact::orderBy('LastName', 'asc')->distinct();
            $all_contacts = $contact->get();
            $all_contacts = $all_contacts ? $all_contacts->toArray() : [];
            return $all_contacts;
        }

        public function uploadList(Request $request) {

            $aaOptions['upload_dir'] = 'uploads/';
            $aaOptions['upload_url'] = 'contact/list/upload/';
            $oAjaxUploadHandler      = new ajaxUploader($aaOptions);
        }
    }
