<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
    use Dhayakawa\SpringIntoAction\Models\Contact;
    use Illuminate\Http\Request;

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
            //
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

            $model->fill($request->only($model->getFillable()));
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
    }
