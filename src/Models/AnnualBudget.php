<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/12/2018
     * Time: 10:26 PM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Illuminate\Database\Eloquent\Model;
    use Dhayakawa\SpringIntoAction\Models\Project;
    use Dhayakawa\SpringIntoAction\Models\Site;
    use Dhayakawa\SpringIntoAction\Models\SiteStatus;
    use Dhayakawa\SpringIntoAction\Models\Budget;

    class AnnualBudget extends Model {

        use \Illuminate\Database\Eloquent\SoftDeletes;

        protected $dates = ['deleted_at'];
        /**
         * The table associated with the model.
         *
         * @var string
         */
        protected $table = 'annual_budgets';
        /**
         * The primary key for the model.
         *
         * @var string
         */
        protected $primaryKey = 'AnnualBudgetID';
        protected $fillable = ['BudgetAmount',
            'Year'];
        private $defaultRecordData = [
            'BudgetAmount' => 0,
            'Year' => '',
        ];

        /**
         * @param null|array $defaults
         *
         * @return array
         */
        public function getDefaultRecordData($defaults = null)
        {
            if (is_array($defaults) && !empty($defaults)) {
                foreach ($defaults as $key => $value) {
                    if (isset($this->defaultRecordData[$key])) {
                        $this->defaultRecordData[$key] = trim($value);
                    }
                }
            }
            if (isset($this->defaultRecordData['Year']) &&
                (!is_numeric($this->defaultRecordData['Year']) ||
                 !preg_match("/^\d{4,4}$/", $this->defaultRecordData['Year']))
            ) {
                $this->defaultRecordData['Year'] = date('Y');
            }

            return $this->defaultRecordData;
        }

        public function getBudgets($Year) {

            $model = Budget::join('projects', 'projects.ProjectID', '=', 'budgets.ProjectID')
                ->join('site_status', 'site_status.SiteStatusID', '=', 'projects.SiteStatusID')
                ->join('sites', 'sites.SiteID', '=', 'site_status.SiteID')
                ->where('site_status.Year', '=', $Year)
                ->where('sites.Active', '=', 1)
                ->select(['budgets.*']);

            return $model->get()->toArray();

        }

        public function getAnnualBudget($Year){
            return AnnualBudget::where('Year','=',$Year)->get()->toArray();
        }

        public function getSiteBudgets($Year)
        {

            $aSiteBudgets = [];
            //'Project Report by Year, Site and Project'
            $site = Site::join(
                'site_status',
                'sites.SiteID',
                '=',
                'site_status.SiteID'
            )->where(
                'site_status.Year',
                $Year
            )->whereNull('sites.deleted_at')->whereNull('site_status.deleted_at')->orderBy('SiteName', 'asc');

            $aSites = $site->get()->toArray();
            foreach ($aSites as $site) {
                $aProjects = Project::select(
                    'projects.ProjectID',
                    'projects.SequenceNumber as Proj Num',
                    'projects.EstimatedCost as Est Cost',
                    'projects.BudgetSources as Budget Sources'
                )->join(
                    'site_status',
                    'projects.SiteStatusID',
                    '=',
                    'site_status.SiteStatusID'
                )->join(
                    'project_status_options',
                    'projects.Status',
                    '=',
                    'project_status_options.id'
                )->where('site_status.SiteStatusID', $site['SiteStatusID'])->orderBy(
                    'projects.SequenceNumber',
                    'asc'
                )->whereNull('projects.deleted_at')->get()->toArray();

                foreach ($aProjects as $key => $aaProject) {

                    $aSiteBudgets['Sites'][$site['SiteName']]['Projects'][$aaProject['Proj Num']]['Budget Source'] = [];
                    $aBudgets =
                        Budget::join('budget_source_options', 'budget_source_options.id', '=', 'budgets.BudgetSource')
                              ->where('ProjectID', $aaProject['ProjectID'])->whereNull('budgets.deleted_at')
                              ->get()
                              ->toArray();
                    if (!empty($aBudgets)) {
                        // \Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,
                        //     $aBudgets]);

                        foreach ($aBudgets as $aaBudget) {
                            $aSiteBudgets['Sites'][$site['SiteName']]['Projects'][$aaProject['Proj Num']]['Budget Source'][] = [
                                $aaBudget['option_label'],
                                $aaBudget['BudgetAmount']
                            ];
                        }
                    }

                    $aSiteBudgets['Sites'][$site['SiteName']]['Projects'][$aaProject['Proj Num']]['Est Cost'] = $aaProject['Est Cost'];
                    // if ($site['SiteName'] == 'Ben Franklin Junior High') {
                    //     \Illuminate\Support\Facades\Log::debug(
                    //         '',
                    //         [
                    //             'File:' . __FILE__,
                    //             'Method:' . __METHOD__,
                    //             'Line:' . __LINE__,
                    //             $key,
                    //             ['$aaProject'=>$aaProject,
                    //             '$aSiteBudgets'=>$aSiteBudgets['Sites'][$site['SiteName']]['Projects']]
                    //         ]
                    //     );
                    // }
                }
            }
            // \Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,
            //     $aSiteBudgets]);
            // \Illuminate\Support\Facades\Log::debug(
            //     '',
            //     [
            //         'File:' . __FILE__,
            //         'Method:' . __METHOD__,
            //         'Line:' . __LINE__,
            //         $aSiteBudgets['Sites']['Ben Franklin Junior High'],
            //     ]
            // );
            return $aSiteBudgets;
        }

    }
