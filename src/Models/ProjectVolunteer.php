<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/24/2018
     * Time: 1:13 PM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Illuminate\Database\Eloquent\Model;

    class ProjectVolunteer extends Model {

        use \Illuminate\Database\Eloquent\SoftDeletes;
        protected $dates = ['deleted_at'];
        /**
         * The table associated with the model.
         *
         * @var string
         */
        protected $table = 'project_volunteers';
        /**
         * The primary key for the model.
         *
         * @var string
         */
        protected $primaryKey = 'ProjectVolunteerID';
        protected $fillable = ['ProjectID',
            'VolunteerID'];

        public function volunteer() {
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Volunteer');
        }

        public function project() {
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Project');
        }

        public function updateLeadVolunteer(){

        }
    }
