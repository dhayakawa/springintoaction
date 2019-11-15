<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/12/2018
     * Time: 10:26 PM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Illuminate\Database\Eloquent\Model;

    class SiteRole extends BaseModel {

        /**
         * The table associated with the model.
         *
         * @var string
         */
        protected $table = 'site_roles';
        /**
         * The primary key for the model.
         *
         * @var string
         */
        protected $primaryKey = 'SiteRoleID';
        protected $fillable = ['Role',
            'DisplaySequence'];
        private $defaultRecordData = [
            'Role' => 0,
            'DisplaySequence' => 0,
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

    }
