<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/12/2018
     * Time: 8:31 AM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Illuminate\Database\Eloquent\Model;

    class Project extends Model {

        use \Illuminate\Database\Eloquent\SoftDeletes;
        protected $dates = ['deleted_at'];
        /**
         * The table associated with the model.
         *
         * @var string
         */
        protected $table = 'projects';
        /**
         * The primary key for the model.
         *
         * @var string
         */
        protected $primaryKey = 'ProjectID';
        protected $fillable = [
            'SiteStatusID',
            'Active',
            'ContactID',
            'SequenceNumber',
            'OriginalRequest',
            'ProjectDescription',
            'Comments',
            'BudgetSources',
            'ChildFriendly',
            'PrimarySkillNeeded',
            'VolunteersNeededEst',
            'VolunteersAssigned',
            'Status',
            'StatusReason',
            'MaterialsNeeded',
            'EstimatedCost',
            'ActualCost',
            'BudgetAvailableForPC',
            'VolunteersLastYear',
            'NeedsToBeStartedEarly',
            'PCSeeBeforeSIA',
            'SpecialEquipmentNeeded',
            'PermitsOrApprovalsNeeded',
            'PrepWorkRequiredBeforeSIA',
            'SetupDayInstructions',
            'SIADayInstructions',
            'Attachments',
            'Area',
            'PaintOrBarkEstimate',
            'PaintAlreadyOnHand',
            'PaintOrdered',
            'CostEstimateDone',
            'MaterialListDone',
            'BudgetAllocationDone',
            'VolunteerAllocationDone',
            'NeedSIATShirtsForPC',
            'ProjectSend',
            'FinalCompletionStatus',
            'FinalCompletionAssessment'
        ];


        private $defaultRecordData = [
            'ProjectID' => 0,
            'SiteStatusID' => 0,
            'Active' => 0,
            'ContactID' => null,
            'SequenceNumber' => 99999,
            'OriginalRequest' => '',
            'ProjectDescription' => '',
            'Comments' => '',
            'BudgetSources' => '',
            'ChildFriendly' => 0,
            'PrimarySkillNeeded' => '',
            'VolunteersNeededEst' => 0,
            'VolunteersAssigned' => 0,
            'Status' => '',
            'StatusReason' => '',
            'MaterialsNeeded' => '',
            'EstimatedCost' => 0.00,
            'ActualCost' => 0.00,
            'BudgetAvailableForPC' => 0.00,
            'VolunteersLastYear' => 0,
            'NeedsToBeStartedEarly' => 0,
            'PCSeeBeforeSIA' => 0,
            'SpecialEquipmentNeeded' => '',
            'PermitsOrApprovalsNeeded' => '',
            'PrepWorkRequiredBeforeSIA' => '',
            'SetupDayInstructions' => '',
            'SIADayInstructions' => '',
            'Attachments' => '',
            'Area' => '',
            'PaintOrBarkEstimate' => '',
            'PaintAlreadyOnHand' => '',
            'PaintOrdered' => '',
            'CostEstimateDone' => 0,
            'MaterialListDone' => 0,
            'BudgetAllocationDone' => 0,
            'VolunteerAllocationDone' => 0,
            'NeedSIATShirtsForPC' => 0,
            'ProjectSend' => 'Not Ready',
            'FinalCompletionStatus' => 0,
            'FinalCompletionAssessment' => '',
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

        public function volunteers() {
            return $this->belongsToMany('Dhayakawa\SpringIntoAction\Models\Volunteer', 'project_volunteers', 'ProjectID', 'VolunteerID')->as('project_volunteers');
        }

        public function contacts() {
            return $this->hasMany('Dhayakawa\SpringIntoAction\Models\Contact');
        }

        public function budgets() {
            return $this->hasMany('Dhayakawa\SpringIntoAction\Models\Budget', 'ProjectID', 'ProjectID');
            //return $this->hasOne('Dhayakawa\SpringIntoAction\Models\Budget', 'ProjectID','BudgetID');
        }

        public function projectVolunteersWithRoles() {
            return $this->belongsToMany('Dhayakawa\SpringIntoAction\Models\Volunteer', 'project_volunteer_role', 'ProjectID', 'VolunteerID')->as('project_leads');
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
                $this->defaultRecordData['Year'] = date('Y');
            }

            return $this->defaultRecordData;
        }

        public function copy() {
            /*
             UPDATE projects p
  JOIN site_status ss ON ss.SiteStatusID = p.SiteStatusID AND ss.Year = 2018
SET p.Status = '',Comments='', p.StatusReason = '', BudgetSources = '', VolunteersNeededEst=0;
DELETE pv.* FROM budget pv
WHERE pv.ProjectID IN (
  SELECT ProjectID
  FROM (
         SELECT p.ProjectID
         FROM projects p
           JOIN site_status ss ON ss.SiteStatusID = p.SiteStatusID AND ss.Year = 2018
       ) TrickAlias
);
             */
        }

    }
