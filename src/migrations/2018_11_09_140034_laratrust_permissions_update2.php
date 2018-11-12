<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class LaratrustPermissionsUpdate2 extends Migration
{

    private $_roles = [
        [
            'name' => 'project_manager',
            'display_name' => 'springintoaction::role.project_manager.display_name',
            'description' => 'springintoaction::role.project_manager.description'
        ]
    ];

    private $_permissions = [
        [
            'name' => 'site_management',
            'display_name' => 'springintoaction::permissions.site_management.display_name',
            'description' => 'springintoaction::permissions.site_management.description'
        ],
        [
            'name' => 'project_management',
            'display_name' => 'springintoaction::permissions.project_management.display_name',
            'description' => 'springintoaction::permissions.project_management.description'
        ],
        [
            'name' => 'budget_management',
            'display_name' => 'springintoaction::permissions.budget_management.display_name',
            'description' => 'springintoaction::permissions.budget_management.description'
        ],
        [
            'name' => 'people_management',
            'display_name' => 'springintoaction::permissions.people_management.display_name',
            'description' => 'springintoaction::permissions.people_management.description'
        ]
    ];
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up () {
        // Insert default frontend roles
        foreach ($this->_roles as $role) {
            $role['created_at'] = date('Y-m-d H:i:s');
            $role['updated_at'] = date('Y-m-d H:i:s');
            $roleId = DB::table('roles')->insertGetId($role);
        }
        $aPermissionIds = [];
        // Insert default frontend permissions
        foreach ($this->_permissions as $permission) {
            $permission['created_at'] = date('Y-m-d H:i:s');
            $permission['updated_at'] = date('Y-m-d H:i:s');
            $permissionId = DB::table('permissions')->insertGetId($permission);
            $aPermissionIds[$permission['name']] = $permissionId;
        }

        DB::table('permission_role')->insert(['permission_id' => 1, 'role_id' => $roleId]);
        DB::table('permission_role')->insert(['permission_id' => 5, 'role_id' => $roleId]);
        DB::table('permission_role')->insert(['permission_id' => $aPermissionIds['site_management'], 'role_id' => $roleId]);
        DB::table('permission_role')->insert(['permission_id' => $aPermissionIds['project_management'], 'role_id' => $roleId]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down () {
        foreach ($this->_permissions as $permission) {
            DB::table('permissions')->where('name', $permission['name'])->delete();
        }

        foreach ($this->_roles as $role) {
            DB::table('roles')->where('name', $role['name'])->delete();
        }
    }
}
