<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/12/2018
     * Time: 10:26 PM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Dhayakawa\SpringIntoAction\Helpers\ProjectRegistrationHelper;
    use Illuminate\Database\Eloquent\Model;

    class Budget extends BaseModel {

        use ProjectRegistrationHelper;
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
        private $defaultRecordData = [
            'ProjectID' => 0,
            'BudgetSource' => '',
            'BudgetAmount' => 0.00,
            'Comments' => '',
        ];

        public function project() {
            //return $this->hasMany('Dhayakawa\SpringIntoAction\Models\ProjectVolunteer', 'ProjectID','BudgetID');
        }

        /**
         * @param null|array $defaults
         *
         * @return array
         */
        public function getDefaultRecordData($defaults = null) {
            if(is_array($defaults) && !empty($defaults)) {
                foreach($defaults as $key => $value) {
                    if(isset($this->defaultRecordData[$key])) {
                        $this->defaultRecordData[$key] = trim($value);
                    }
                }
            }
            if(isset($this->defaultRecordData['Year']) && (!is_numeric($this->defaultRecordData['Year']) || !preg_match("/^\d{4,4}$/", $this->defaultRecordData['Year']))) {
                $this->defaultRecordData['Year'] = $this->getCurrentYear();
            }

            return $this->defaultRecordData;
        }
    }
