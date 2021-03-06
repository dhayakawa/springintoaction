<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/12/2018
     * Time: 10:26 PM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Illuminate\Database\Eloquent\Model;

    class ProjectRole extends BaseModel {

        /**
         * The table associated with the model.
         *
         * @var string
         */
        protected $table = 'project_roles';
        /**
         * The primary key for the model.
         *
         * @var string
         */
        protected $primaryKey = 'ProjectRoleID';
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
        public function volunteers(){
            return $this->hasMany('Dhayakawa\SpringIntoAction\Models\Volunteer');
        }

        public static function getIdByRole($role){
            $value = null;
            $collection = self::where('Role', '=', $role)->get();
            if ($collection->count()) {
                $aModel = $collection->first()->toArray();
                $value = $aModel['ProjectRoleID'];
            }
            return $value;
        }
    }
