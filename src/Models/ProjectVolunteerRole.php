<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/12/2018
 * Time: 10:26 PM
 */

namespace Dhayakawa\SpringIntoAction\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Dhayakawa\SpringIntoAction\Models\Volunteer;

class ProjectVolunteerRole extends Model
{
    use \Illuminate\Database\Eloquent\SoftDeletes;
    protected $dates = ['deleted_at'];
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'project_volunteer_role';
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'ProjectVolunteerRoleID';
    protected $fillable = [
        'ProjectID',
        'VolunteerID',
        'ProjectRoleID',
        'Comments',
        'Status',
    ];
    private $defaultRecordData = [
        'ProjectID' => 0,
        'VolunteerID' => 0,
        'ProjectRoleID' => 0,
        'Comments' => '',
        'Status' => '',
    ];

    public function site()
    {
        return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Site', 'SiteID');
    }

    public function volunteers()
    {
        return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Volunteer', 'VolunteerID');
    }

    public function projects()
    {
        return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Project', 'ProjectID');
    }

    public function getProjectLead($ProjectVolunteerRoleID)
    {
        $collection = ProjectVolunteerRole::select(
            [
                'project_volunteers.ProjectVolunteerID',
                'project_volunteer_role.*',
                'project_volunteer_role.Status as ProjectVolunteerRoleStatus',
                'volunteers.VolunteerID',
                'volunteers.Active',
                'volunteers.LastName',
                'volunteers.FirstName',
                'volunteers.MobilePhoneNumber',
                'volunteers.HomePhoneNumber',
                'volunteers.Email',
            ]
        )->join(
                'project_volunteers',
                function ($join) {
                    $join->on(
                        'project_volunteer_role.VolunteerID',
                        '=',
                        'project_volunteers.VolunteerID'
                    )->whereRaw(
                        'project_volunteers.ProjectID=project_volunteer_role.ProjectID'
                    );
                }
            )->join(
                'project_roles',
                'project_volunteer_role.ProjectRoleID',
                '=',
                'project_roles.ProjectRoleID'
            )->join(
                'volunteers',
                'volunteers.VolunteerID',
                '=',
                'project_volunteer_role.VolunteerID'
            )->where(
                'project_volunteer_role.ProjectVolunteerRoleID',
                '=',
                $ProjectVolunteerRoleID
            )->whereNull('project_volunteers.deleted_at')->whereNull('project_volunteer_role.deleted_at');
        // \Illuminate\Support\Facades\Log::debug(
        //     '',
        //     [
        //         'File:' . __FILE__,
        //         'Method:' . __METHOD__,
        //         'Line:' . __LINE__,
        //         $ProjectVolunteerRoleID,
        //         $collection->toSql(),
        //     ]
        // );

        return current($collection->get()->toArray());
    }

    public function getProjectLeads($ProjectID)
    {
        // $collection = Volunteer::join(
        //     'project_volunteers',
        //     'volunteers.VolunteerID',
        //     '=',
        //     'project_volunteers.VolunteerID'
        // )->join(
        //     'project_volunteer_role',
        //     'volunteers.VolunteerID',
        //     '=',
        //     'project_volunteer_role.VolunteerID'
        // )->join('project_roles', 'project_volunteer_role.ProjectRoleID', '=', 'project_roles.ProjectRoleID')->whereRaw(
        //     'project_volunteer_role.ProjectID = ? and project_roles.role != \'Worker\'',
        //     [$ProjectID]
        // )->select(
        //     [
        //         'project_volunteers.ProjectVolunteerID',
        //         'project_volunteer_role.*',
        //         'project_volunteer_role.Status as ProjectVolunteerRoleStatus',
        //         'volunteers.VolunteerID',
        //         'volunteers.Active',
        //         'volunteers.LastName',
        //         'volunteers.FirstName',
        //         'volunteers.MobilePhoneNumber',
        //         'volunteers.HomePhoneNumber',
        //         'volunteers.Email',
        //     ]
        // )->whereNull('project_volunteers.deleted_at')->whereNull('project_volunteer_role.deleted_at');
        // \Illuminate\Support\Facades\Log::debug(
        //     '',
        //     [
        //         'File:' . __FILE__,
        //         'Method:' . __METHOD__,
        //         'Line:' . __LINE__,
        //         $ProjectID,
        //         $collection->toSql(),
        //     ]
        // );
        $collection = ProjectVolunteerRole::select(
            [
                'project_volunteers.ProjectVolunteerID',
                'project_volunteer_role.*',
                'project_volunteer_role.Status as ProjectVolunteerRoleStatus',
                'volunteers.VolunteerID',
                'volunteers.Active',
                'volunteers.LastName',
                'volunteers.FirstName',
                'volunteers.MobilePhoneNumber',
                'volunteers.HomePhoneNumber',
                'volunteers.Email',
            ]
        )->join(
            'project_volunteers',
            function ($join) {
                $join->on(
                    'project_volunteer_role.VolunteerID',
                    '=',
                    'project_volunteers.VolunteerID'
                )->whereRaw(
                    'project_volunteers.ProjectID=project_volunteer_role.ProjectID'
                );
            }
        )->join(
            'project_roles',
            function ($join) {
                $join->on(
                    'project_volunteer_role.ProjectRoleID',
                    '=',
                    'project_roles.ProjectRoleID'
                )->whereRaw(
                    'project_roles.role != \'Worker\''
                );
            }
        )->join(
            'volunteers',
            'volunteers.VolunteerID',
            '=',
            'project_volunteer_role.VolunteerID'
        )->where(
            'project_volunteer_role.ProjectID',
            '=',
            $ProjectID
        )->whereNull('project_volunteers.deleted_at')->whereNull('project_volunteer_role.deleted_at');

        return $collection->get()->toArray();
    }

    public function getAllProjectLeads()
    {
        return Volunteer::join(
            'project_volunteers',
            'volunteers.VolunteerID',
            '=',
            'project_volunteers.VolunteerID'
        )->join(
            'project_volunteer_role',
            'volunteers.VolunteerID',
            '=',
            'project_volunteer_role.VolunteerID'
        )->join('project_roles', 'project_volunteer_role.ProjectRoleID', '=', 'project_roles.ProjectRoleID')->where(
            'project_roles.role',
            '!=',
            'Worker'
        )->select(
            [
                'project_volunteers.ProjectVolunteerID',
                'project_volunteer_role.*',
                'project_volunteer_role.Status as ProjectVolunteerRoleStatus',
                'volunteers.VolunteerID',
                'volunteers.Active',
                'volunteers.LastName',
                'volunteers.FirstName',
                'volunteers.MobilePhoneNumber',
                'volunteers.HomePhoneNumber',
                'volunteers.Email',
            ]
        )->whereNull('project_volunteer_role.deleted_at')->get()->toArray();
    }

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
