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
        protected $fillable = ['Year', 'SiteID', 'Active', 'ContactID', 'SequenceNumber', 'OriginalRequest', 'ProjectDescription', 'Comments', 'EstimatorID', 'ProjectCoordinatorID', 'BudgetSources', 'ChildFriendly', 'PrimarySkillNeeded', 'VolunteersNeededEst', 'VolunteersAssigned', 'Status', 'StatusReason', 'MaterialsNeeded', 'EstimatedCost', 'ActualCost', 'BudgetAvailableForPC', 'VolunteersLastYear', 'NeedsToBeStartedEarly', 'PCSeeBeforeSIA', 'SpecialEquipmentNeeded', 'PermitsOrApprovalsNeeded', 'PrepWorkRequiredBeforeSIA', 'SetupDayInstructions', 'SIADayInstructions', 'Attachments', 'Area', 'PaintOrBarkEstimate', 'PaintAlreadyOnHand', 'PaintOrdered', 'CostEstimateDone', '"MaterialLis Done"', 'BudgetAllocationDone', 'VolunteerAllocationDone', 'NeedSIATShirtsForPC', 'ProjectSend', 'FinalCompletionStatus', 'FinalCompletionAssessment'];


        private $defaultRecordData = [
            'ProjectID' => 0,
            'Year' => '',
            'SiteID' => 0,
            'Active' => 0,
            'ContactID' => 0,
            'SequenceNumber' => 99999,
            'OriginalRequest' => '',
            'ProjectDescription' => '',
            'Comments' => '',
            'EstimatorID' => 0,
            'ProjectCoordinatorID' => 0,
            'BudgetSources' => '',
            'ChildFriendly' => 0,
            'PrimarySkillNeeded' => '',
            'VolunteersNeededEst' => 0,
            'VolunteersAssigned' => 0,
            'Status' => '',
            'StatusReason' => '',
            'MaterialsNeeded' => '',
            'EstimatedCost' => 0,
            'ActualCost' => 0,
            'BudgetAvailableForPC' => 0,
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

        public function contact() {
            return $this->hasOne('Dhayakawa\SpringIntoAction\Models\Contact');
        }

        public function budget() {
            return $this->hasOne('Dhayakawa\SpringIntoAction\Models\Budget', 'ProjectID','ProjectID');
            //return $this->hasOne('Dhayakawa\SpringIntoAction\Models\Budget', 'ProjectID','BudgetID');
        }
        public function projectVolunteersWithRoles() {
            return $this->belongsToMany('Dhayakawa\SpringIntoAction\Models\Volunteer', 'project_volunteer_role', 'ProjectID','VolunteerID')->as('project_leads');
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


    }
