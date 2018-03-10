<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/12/2018
     * Time: 10:26 PM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Illuminate\Database\Eloquent\Model;

    class Budget extends Model {

        use \Illuminate\Database\Eloquent\SoftDeletes;

        protected $dates = ['deleted_at'];
        /**
         * The table associated with the model.
         *
         * @var string
         */
        protected $table = 'budgets';
        /**
         * The primary key for the model.
         *
         * @var string
         */
        protected $primaryKey = 'BudgetID';
        protected $fillable = ['ProjectID',
            'BudgetSource',
            'BudgetAmount',
            'Status',
            'Comments'];

        public function project() {
            //return $this->hasMany('Dhayakawa\SpringIntoAction\Models\ProjectVolunteer', 'ProjectID','BudgetID');
        }
    }