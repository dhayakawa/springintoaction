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

    class ProjectContact extends Model {

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
        protected $primaryKey = 'ProjectContactID';
        protected $fillable = ['ProjectID',
            'ContactID'];

        public function contact() {
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Contact');
        }

        public function project() {
            return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Project');
        }

        public function getProjectContact($ProjectID, $ContactID) {
            return Contact::join('project_contacts', 'contacts.ContactID', '=', 'project_contacts.ContactID')
                ->where('project_contacts.ProjectID', '=', $ProjectID)->where('contacts.ContactID', '=', $ContactID)->whereNull('project_contacts.deleted_at')->get()->toArray();
        }

        public function getProjectContacts($ProjectID) {
            return Contact::join('project_contacts', 'contacts.ContactID', '=', 'project_contacts.ContactID')
                ->where('project_contacts.ProjectID', '=', $ProjectID)->whereNull('project_contacts.deleted_at')->get()->toArray();
        }

        public function getAllProjectContacts() {
            return Contact::join('project_contacts', 'contacts.ContactID', '=', 'project_contacts.ContactID')->whereNull('project_contacts.deleted_at')
                ->get()->toArray();
        }
    }
