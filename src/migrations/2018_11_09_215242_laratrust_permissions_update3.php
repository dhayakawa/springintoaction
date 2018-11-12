<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class LaratrustPermissionsUpdate3 extends Migration
{
    private $_roles = [
        [
            'name' => 'school_district_manager',
            'display_name' => 'springintoaction::role.school_district_manager.display_name',
            'description' => 'springintoaction::role.school_district_manager.description'
        ]
    ];
    private $_permissions = [
        [
            'name' => 'import_projects',
            'display_name' => 'springintoaction::permissions.import_projects.display_name',
            'description' => 'springintoaction::permissions.import_projects.description'
        ],
        [
            'name' => 'add_project',
            'display_name' => 'springintoaction::permissions.add_project.display_name',
            'description' => 'springintoaction::permissions.add_project.description'
        ],
        [
            'name' => 'delete_project',
            'display_name' => 'springintoaction::permissions.delete_project.display_name',
            'description' => 'springintoaction::permissions.delete_project.description'
        ],
        [
            'name' => 'batch_update_project_status',
            'display_name' => 'springintoaction::permissions.batch_update_project_status.display_name',
            'description' => 'springintoaction::permissions.batch_update_project_status.description'
        ],
        [
            'name' => 'edit_project_grid_fields',
            'display_name' => 'springintoaction::permissions.edit_project_grid_fields.display_name',
            'description' => 'springintoaction::permissions.edit_project_grid_fields.description'
        ],
        [
            'name' => 'edit_project_tab_grid_fields',
            'display_name' => 'springintoaction::permissions.edit_project_tab_grid_fields.display_name',
            'description' => 'springintoaction::permissions.edit_project_tab_grid_fields.description'
        ],
        [
            'name' => 'add_project_tab_model',
            'display_name' => 'springintoaction::permissions.add_project_tab_model.display_name',
            'description' => 'springintoaction::permissions.add_project_tab_model.description'
        ],
        [
            'name' => 'delete_project_tab_model',
            'display_name' => 'springintoaction::permissions.delete_project_tab_model.display_name',
            'description' => 'springintoaction::permissions.delete_project_tab_model.description'
        ],
        [
            'name' => 'edit_budget_amount',
            'display_name' => 'springintoaction::permissions.edit_budget_amount.display_name',
            'description' => 'springintoaction::permissions.edit_budget_amount.description'
        ],
        [
            'name' => 'edit_site_contacts_grid_fields',
            'display_name' => 'springintoaction::permissions.edit_site_contacts_grid_fields.display_name',
            'description' => 'springintoaction::permissions.edit_site_contacts_grid_fields.description'
        ],
        [
            'name' => 'add_site_contact',
            'display_name' => 'springintoaction::permissions.add_site_contact.display_name',
            'description' => 'springintoaction::permissions.add_site_contact.description'
        ],
        [
            'name' => 'delete_site_contact',
            'display_name' => 'springintoaction::permissions.delete_site_contact.display_name',
            'description' => 'springintoaction::permissions.delete_site_contact.description'
        ],
        [
            'name' => 'import_volunteers',
            'display_name' => 'springintoaction::permissions.import_volunteers.display_name',
            'description' => 'springintoaction::permissions.import_volunteers.description'
        ],
        [
            'name' => 'edit_volunteers_grid_fields',
            'display_name' => 'springintoaction::permissions.edit_volunteers_grid_fields.display_name',
            'description' => 'springintoaction::permissions.edit_volunteers_grid_fields.description'
        ],
        [
            'name' => 'add_volunteer',
            'display_name' => 'springintoaction::permissions.add_volunteer.display_name',
            'description' => 'springintoaction::permissions.add_volunteer.description'
        ],
        [
            'name' => 'delete_volunteer',
            'display_name' => 'springintoaction::permissions.delete_volunteer.display_name',
            'description' => 'springintoaction::permissions.delete_volunteer.description'
        ],
        [
            'name' => 'view_sites_reports',
            'display_name' => 'springintoaction::permissions.view_sites_reports.display_name',
            'description' => 'springintoaction::permissions.view_sites_reports.description'
        ],
        [
            'name' => 'view_projects_reports',
            'display_name' => 'springintoaction::permissions.view_projects_reports.display_name',
            'description' => 'springintoaction::permissions.view_projects_reports.description'
        ],
        [
            'name' => 'view_volunteers_reports',
            'display_name' => 'springintoaction::permissions.view_volunteers_reports.display_name',
            'description' => 'springintoaction::permissions.view_volunteers_reports.description'
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
        DB::table('permission_role')->insert(
            ['permission_id' => $aPermissionIds['batch_update_project_status'], 'role_id' => $roleId]
        );

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

        foreach ($this->_roles as $role) {
            DB::table('roles')->where('name', $role['name'])->delete();
        }
    }
}
