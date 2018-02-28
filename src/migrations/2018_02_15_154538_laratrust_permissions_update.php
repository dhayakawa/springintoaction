<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class LaratrustPermissionsUpdate extends Migration
{

    private $_roles = [
        [
            'name' => 'frontend_user',
            'display_name' => 'springintoaction::role.frontend_user.display_name',
            'description' => 'springintoaction::role.frontend_user.description'
        ]
    ];

    private $_permissions = [
        [
            'name' => 'frontend_access',
            'display_name' => 'springintoaction::permissions.frontend_access.display_name',
            'description' => 'springintoaction::permissions.frontend_access.description'
        ]
    ];
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Insert default frontend roles
        foreach($this->_roles as $role) {
            $role['created_at'] = date('Y-m-d H:i:s');
            $role['updated_at'] = date('Y-m-d H:i:s');
            DB::table('roles')->insert($role);
        }
        // Insert default frontend permissions
        foreach($this->_permissions as $permission) {
            $permission['created_at'] = date('Y-m-d H:i:s');
            $permission['updated_at'] = date('Y-m-d H:i:s');
            DB::table('permissions')->insert($permission);
        }

        DB::table('permission_role')->insert(['permission_id' => 5, 'role_id' => 3]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        foreach($this->_permissions as $permission) {
            DB::table('permissions')->where('name', $permission['name'])->delete();
        }

        foreach($this->_roles as $role) {
            DB::table('roles')->where('name', $role['name'])->delete();
        }
    }
}
