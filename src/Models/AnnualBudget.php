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
    }
