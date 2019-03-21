<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
    use Dhayakawa\SpringIntoAction\Models\AnnualBudget;
    use Dhayakawa\SpringIntoAction\Models\Budget;
    use Dhayakawa\SpringIntoAction\Models\Project;
    use Dhayakawa\SpringIntoAction\Models\Site;
    use Illuminate\Http\Request;

    class AnnualBudgetController extends BaseController {

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
            $model = new AnnualBudget;
            $data = $request->only($model->getFillable());
            array_walk($data, function (&$value, $key) {
                if(is_string($value)) {
                    $value = \urldecode($value);
                }
            });
            $model->fill($data);

            $success = $model->save();

            if($success) {
                $response = ['success' => true, 'msg' => 'Annual Budget Creation Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Annual Budget Creation Failed.'];
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
            $model  = new AnnualBudget;
            $result = $model->getDefaultRecordData();
            try {
                if($model = AnnualBudget::findOrFail($id)) {
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

            $model = AnnualBudget::findOrFail($id);
            $data = $request->only($model->getFillable());
            array_walk($data, function (&$value, $key) {
                if(is_string($value)) {
                    $value = \urldecode($value);
                }
            });
            $model->fill($data);
            $success = $model->save();

            if($success) {
                $response = ['success' => true, 'msg' => 'Annual Budget Update Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Annual Budget Update Failed.'];
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

        public function getBudgets(){
            $model          = new AnnualBudget();
            $annual_budgets = $model->getBudgets(date('Y'));
            return $annual_budgets;
        }

        public function getSiteBudgets()
        {
            $model = new AnnualBudget();
            $annual_site_budgets = $model->getSiteBudgets($this->getCurrentYear());

            return $annual_site_budgets;
        }
    }
