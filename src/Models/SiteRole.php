<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/12/2018
     * Time: 10:26 PM
     */

    namespace Dhayakawa\SpringIntoAction\Models;

    use Illuminate\Database\Eloquent\Model;

    class SiteRole extends Model {

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


    }
