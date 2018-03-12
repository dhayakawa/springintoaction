<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/12/2018
     * Time: 10:26 PM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Illuminate\Database\Eloquent\Model;

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


    }
