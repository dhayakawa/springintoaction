<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/12/2018
     * Time: 10:26 PM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Illuminate\Database\Eloquent\Model;

    class Volunteer extends Model {

        use \Illuminate\Database\Eloquent\SoftDeletes;
        protected $dates = ['deleted_at'];
        /**
         * The table associated with the model.
         *
         * @var string
         */
        protected $table = 'volunteers';
        /**
         * The primary key for the model.
         *
         * @var string
         */
        protected $primaryKey = 'VolunteerID';
        protected $fillable = [
            'Active',
            'LastName',
            'FirstName',
            'MobilePhoneNumber',
            'HomePhoneNumber',
            'Email',
            'PrimarySkill',
            'Status',
            'Comments',
            'PreferredSiteID',
            'DateSubmitted',
            'DateModified',
            'ResponseID',
            'ConfirmationCode',
            'FullName',
            'IndividualID',
            'EnteredFirstName',
            'EnteredLastName',
            'ContactPhone',
            'AgeRange',
            'LG',
            'Family',
            'CFE',
            'CFP',
            'Painting',
            'Landscaping',
            'Construction',
            'Electrical',
            'CabinetryFinishWork',
            'Plumbing',
            'NotesOnYourSkillAssessment',
            'PhysicalRestrictions',
            'SchoolPreference',
            'Equipment',
            'TeamLeaderWilling',
            'Church',
            'AssignmentInformationSendStatus'];
        private $defaultRecordData = [
            'Active'=>'',
            'LastName'=>'',
            'FirstName'=>'',
            'MobilePhoneNumber'=>'',
            'HomePhoneNumber'=>'',
            'Email'=>'',
            'PrimarySkill'=>'',
            'Status'=>'',
            'Comments'=>'',
            'PreferredSiteID'=>'',
            'DateSubmitted'=>'',
            'DateModified'=>'',
            'ResponseID'=>'',
            'ConfirmationCode'=>'',
            'FullName'=>'',
            'IndividualID'=>'',
            'EnteredFirstName'=>'',
            'EnteredLastName'=>'',
            'ContactPhone'=>'',
            'AgeRange'=>'',
            'LG'=>'',
            'Family'=>'',
            'CFE'=>'',
            'CFP'=>'',
            'Painting'=>'',
            'Landscaping'=>'',
            'Construction'=>'',
            'Electrical'=>'',
            'CabinetryFinishWork'=>'',
            'Plumbing'=>'',
            'NotesOnYourSkillAssessment'=>'',
            'PhysicalRestrictions'=>'',
            'SchoolPreference'=>'',
            'Equipment'=>'',
            'TeamLeaderWilling'=>'',
            'Church'=>'',
            'AssignmentInformationSendStatus' => ''
        ];
        public function project() {
            return $this->hasMany('Dhayakawa\SpringIntoAction\Models\ProjectVolunteer', 'VolunteerID','ProjectID');
        }

        public function role() {
            return $this->belongsToMany('Dhayakawa\SpringIntoAction\Models\ProjectRole', 'project_volunteer_role', 'VolunteerID', 'ProjectRoleID')->as('project_role');
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
