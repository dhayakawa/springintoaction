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
        private $defaultRecordData = [
            'SiteStatusID' => 0,
            'VolunteerID' => 0,
        ];

        /**
         * @param null|array $defaults
         *
         * @return array
         */
        public function getDefaultRecordData($defaults = null)
        {
            if (is_array($defaults) && !empty($defaults)) {
                foreach ($defaults as $key => $value) {
                    if (isset($this->defaultRecordData[$key])) {
                        $this->defaultRecordData[$key] = trim($value);
                    }
                }
            }
            if (isset($this->defaultRecordData['Year']) &&
                (!is_numeric($this->defaultRecordData['Year']) ||
                 !preg_match("/^\d{4,4}$/", $this->defaultRecordData['Year']))
            ) {
                $this->defaultRecordData['Year'] = date('Y');
            }

            return $this->defaultRecordData;
        }
        public function volunteer() {
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Volunteer');
        }

        public function siteStatus() {
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\SiteStatus');
        }

    }
