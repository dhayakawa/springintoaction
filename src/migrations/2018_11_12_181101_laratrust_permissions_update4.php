<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class LaratrustPermissionsUpdate4 extends Migration
{
    private $_permissions = [
        [
            'name' => 'add_site',
            'display_name' => 'springintoaction::permissions.add_site.display_name',
            'description' => 'springintoaction::permissions.add_site.description'
        ],
        [
            'name' => 'delete_site',
            'display_name' => 'springintoaction::permissions.delete_site.display_name',
            'description' => 'springintoaction::permissions.delete_site.description'
        ],
        [
            'name' => 'update_site_status',
            'display_name' => 'springintoaction::permissions.update_site_status.display_name',
            'description' => 'springintoaction::permissions.update_site_status.description'
        ],
        [
            'name' => 'edit_site_grid_fields',
            'display_name' => 'springintoaction::permissions.edit_site_grid_fields.display_name',
            'description' => 'springintoaction::permissions.edit_site_grid_fields.description'
        ]
    ];
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $aPermissionIds = [];
        // Insert default frontend permissions
        foreach ($this->_permissions as $permission) {
            $permission['created_at'] = date('Y-m-d H:i:s');
            $permission['updated_at'] = date('Y-m-d H:i:s');
            $permissionId = DB::table('permissions')->insertGetId($permission);
            $aPermissionIds[$permission['name']] = $permissionId;
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        foreach ($this->_permissions as $permission) {
            DB::table('permissions')->where('name', $permission['name'])->delete();
        }
    }
}
