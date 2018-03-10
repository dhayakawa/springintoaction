<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/12/2018
     * Time: 10:26 PM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\Pivot;
    use Dhayakawa\SpringIntoAction\Models\Volunteer;

    class ProjectVolunteerRole extends Model {

        use \Illuminate\Database\Eloquent\SoftDeletes;
        protected $dates = ['deleted_at'];
        /**
         * The table associated with the model.
         *
         * @var string
         */
        protected $table = 'project_volunteer_role';
        /**
         * The primary key for the model.
         *
         * @var string
         */
        protected $primaryKey = 'ProjectVolunteerRoleID';
        protected $fillable = [
            'ProjectID',
            'VolunteerID',
            'ProjectRoleID',
            'Comments',
            'Status'
        ];
        private $defaultRecordData = [
            'ProjectID' => 0,
            'VolunteerID' => 0,
            'ProjectRoleID' => 0,
            'Comments' => '',
            'Status' => ''
        ];

        public function site(){
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Site','SiteID');
        }
        public function volunteers(){
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Volunteer','VolunteerID');
        }

        public function projects() {
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Project','ProjectID');
        }

        public function getProjectLead($ProjectVolunteerRoleID) {
            return Volunteer::join('project_volunteer_role', 'volunteers.VolunteerID', '=', 'project_volunteer_role.VolunteerID')
                ->join('project_roles', 'project_volunteer_role.ProjectRoleID', '=', 'project_roles.ProjectRoleID')
                ->where('project_volunteer_role.ProjectVolunteerRoleID', '=', $ProjectVolunteerRoleID)->get()->toArray();
        }

        public function getProjectLeads($ProjectID) {
            return Volunteer::join('project_volunteer_role', 'volunteers.VolunteerID', '=', 'project_volunteer_role.VolunteerID')
                ->join('project_roles', 'project_volunteer_role.ProjectRoleID', '=', 'project_roles.ProjectRoleID')
                ->whereRaw('project_volunteer_role.ProjectID = ? and project_roles.role != \'Worker\'', [$ProjectID])->get()->toArray();
        }

        public function getAllProjectLeads() {
            return Volunteer::join('project_volunteer_role', 'volunteers.VolunteerID', '=', 'project_volunteer_role.VolunteerID')
                ->join('project_roles', 'project_volunteer_role.ProjectRoleID', '=', 'project_roles.ProjectRoleID')
                ->where('project_roles.role','!=','Worker')->get()->toArray();
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
