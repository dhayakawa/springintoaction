<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use Illuminate\Routing\Controller as BaseController;
    use Dhayakawa\SpringIntoAction\Models\Budget;
    use Illuminate\Http\Request;

    class BudgetController extends BaseController {

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

        /**
         * @param Request $request
         * @param $id
         *
         * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
         */
        public function update(Request $request, $id) {

            $model = Budget::findOrFail($id);

            $model->fill($request->only($model->getFillable()));
            $success = $model->save();

            if($success) {
                $response = ['success' => true, 'msg' => 'Budget Update Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Budget Update Failed.'];
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
    }
