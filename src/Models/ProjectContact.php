<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/24/2018
     * Time: 1:13 PM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Illuminate\Database\Eloquent\Model;
    use \Dhayakawa\SpringIntoAction\Models\Contact;

    class ProjectContact extends BaseModel {

        use \Illuminate\Database\Eloquent\SoftDeletes;
        protected $dates = ['deleted_at'];
        /**
         * The table associated with the model.
         *
         * @var string
         */
        protected $table = 'project_contacts';
        /**
         * The primary key for the model.
         *
         * @var string
         */
        protected $primaryKey = 'ProjectContactsID';
        protected $fillable = ['ProjectID',
            'ContactID'];
        private $defaultRecordData = [
            'ProjectID' => 0,
            'ContactID' => 0,
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
        public function contact() {
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Contact');
        }

        public function project() {
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Project');
        }

        public function getProjectContact($ProjectID, $ContactID) {
            return self::join('contacts', 'contacts.ContactID', '=', 'project_contacts.ContactID')
                ->where('project_contacts.ProjectID', '=', $ProjectID)->where('contacts.ContactID', '=', $ContactID)->whereNull('project_contacts.deleted_at')->get()->toArray();
        }

        public function getProjectContacts($ProjectID) {
            return self::join('contacts', 'contacts.ContactID', '=', 'project_contacts.ContactID')
                ->where('project_contacts.ProjectID', '=', $ProjectID)->whereNull('project_contacts.deleted_at')->get()->toArray();
        }

        public function getAllProjectContacts() {
            return self::join('contacts', 'contacts.ContactID', '=', 'project_contacts.ContactID')->whereNull('project_contacts.deleted_at')
                ->groupBy('contacts.ContactID')->get()->toArray();
        }

    }
