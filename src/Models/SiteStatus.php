<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/12/2018
     * Time: 10:26 PM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Illuminate\Database\Eloquent\Model;

    class SiteStatus extends Model {

        use \Illuminate\Database\Eloquent\SoftDeletes;
        protected $dates = ['deleted_at'];
        /**
         * The table associated with the model.
         *
         * @var string
         */
        protected $table = 'site_status';
        /**
         * The primary key for the model.
         *
         * @var string
         */
        protected $primaryKey = 'SiteStatusID';
        protected $fillable = ['SiteID',
            'Year',
            'ProjectDescriptionComplete',
            'BudgetEstimationComplete',
            'VolunteerEstimationComplete',
            'VolunteerAssignmentComplete',
            'BudgetActualComplete',
            'EstimationComments'];
        private $defaultRecordData = [
            'SiteID' => 0,
            'Year' => '',
            'ProjectDescriptionComplete' => 0,
            'BudgetEstimationComplete' => 0,
            'VolunteerEstimationComplete' => 0,
            'VolunteerAssignmentComplete' => 0,
            'BudgetActualComplete' => 0,
            'EstimationComments' => '',
            'created_at' => '',
            'updated_at' => ''];

        /**
         * @param null|array $defaults
         *
         * @return mixed
         */
        public function site($defaults = null) {
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Site')->withDefault($this->getDefaultRecordData($defaults));//->withTimestamps();
        }

        /**
         * @param null|array $defaults
         *
         * @return array
         */
        public function getDefaultRecordData($defaults = null){
            if(is_array($defaults) && !empty($defaults)){
                foreach($defaults as $key => $value){
                    if(isset($this->defaultRecordData[$key])){
                        $this->defaultRecordData[$key] = trim($value);
                    }
                }
            }
            if(isset($this->defaultRecordData['Year']) && (!is_numeric($this->defaultRecordData['Year']) || !preg_match("/^\d{4,4}$/", $this->defaultRecordData['Year']))){
                $this->defaultRecordData['Year'] = date('Y');
            }

            return $this->defaultRecordData;
        }
    }
