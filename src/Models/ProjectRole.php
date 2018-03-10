<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/12/2018
     * Time: 10:26 PM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Illuminate\Database\Eloquent\Model;

    class ProjectRole extends Model {

        use \Illuminate\Database\Eloquent\SoftDeletes;
        protected $dates = ['deleted_at'];
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

        public function volunteers(){
            return $this->hasMany('Dhayakawa\SpringIntoAction\Models\Volunteer');
        }

    }
