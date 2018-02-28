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
    class ProjectVolunteerRole extends Model {

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
        protected $fillable = ['SiteID',
            'ProjectID',
            'VolunteerID',
            'ProjectRoleID',
            'Comments',
            'Status',
            'Year'];

        public function site(){
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Site','SiteID');
        }
        public function volunteers(){
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Volunteer','VolunteerID');
        }

        public function projects() {
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Project','ProjectID');
        }


    }
