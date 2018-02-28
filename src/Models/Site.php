<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/12/2018
     * Time: 10:26 PM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Illuminate\Database\Eloquent\Model;
    class Site extends Model {

        /**
         * The table associated with the model.
         *
         * @var string
         */
        protected $table = 'sites';
        /**
         * The primary key for the model.
         *
         * @var string
         */
        protected $primaryKey = 'SiteID';
        protected $fillable = ['SiteName',
            'EquipmentLocation',
            'DebrisLocation',
            'Active'];

        private $defaultRecordData = [
            'SiteName' => '',
            'EquipmentLocation' => '',
            'DebrisLocation' => '',
            'Active' => 0
        ];

        public function status() {
            return $this->hasMany('Dhayakawa\SpringIntoAction\Models\SiteStatus', 'SiteID', 'SiteID');
        }

        public function projects() {
            return $this->hasMany('Dhayakawa\SpringIntoAction\Models\Project', 'SiteID', 'SiteID');
        }

        public function contacts() {
            return $this->hasMany('Dhayakawa\SpringIntoAction\Models\Contact' ,'SiteID', 'SiteID');
        }

        public function getCurrentSiteStatus() {
            return self::with('siteStatus')->where('Year', date('Y'))->get();
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
