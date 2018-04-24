<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/24/2018
     * Time: 1:13 PM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Support\Facades\DB;

    class SiteVolunteer extends Model {

        /**
         * The table associated with the model.
         *
         * @var string
         */
        protected $table = 'site_volunteers';
        /**
         * The primary key for the model.
         *
         * @var string
         */
        protected $primaryKey = 'SiteVolunteerID';
        protected $fillable = ['SiteStatusID',
            'VolunteerID'];

        public function volunteer() {
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Volunteer');
        }

        public function siteStatus() {
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\SiteStatus');
        }

    }
