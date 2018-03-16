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
            $model = new Budget;
            $data = $request->only($model->getFillable());
            array_walk($data, function (&$value, $key) {
                if(is_string($value)) {
                    $value = \urldecode($value);
                }
            });
            $model->fill($data);

            $success = $model->save();

            if($success) {
                $response = ['success' => true, 'msg' => 'Budget Creation Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Budget Creation Failed.'];
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
            $model  = new Budget;
            $result = $model->getDefaultRecordData();
            try {
                if($model = Budget::findOrFail($id)) {
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

        /**
         * @param Request $request
         * @param $id
         *
         * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
         */
        public function update(Request $request, $id) {

            $model = Budget::findOrFail($id);
            $data = $request->only($model->getFillable());
            array_walk($data, function (&$value, $key) {
                if(is_string($value)) {
                    $value = \urldecode($value);
                }
            });
            $model->fill($data);
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
