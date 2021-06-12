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
use Dhayakawa\SpringIntoAction\Models\VolunteerStatusOptions;

class ProjectVolunteerRole extends BaseModel
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
        return $this->getProjectVolunteerByRoleId($ProjectVolunteerRoleID, false);
    }

    public function getSelectFields($bReturnWorker)
    {
        $aSelectFields = [
            'project_volunteers.ProjectVolunteerID',
            'project_volunteer_role.*',
            'project_volunteer_role.Status as ProjectVolunteerRoleStatus',
        ];
        $aLeaderSelectFields = [
            'project_roles.Role',
            'volunteers.VolunteerID',
            'volunteers.Active',
            'volunteers.LastName',
            'volunteers.FirstName',
            'volunteers.Email',
            'volunteers.MobilePhoneNumber',
            'volunteers.HomePhoneNumber',
            'volunteer_status_options.option_label as ProjectVolunteerRoleStatusLabel',
        ];
        $aWorkerSelectFields = [
            'volunteers.*'
        ];
        if ($bReturnWorker) {
            $aSelectFields = array_merge($aSelectFields, $aWorkerSelectFields);
        } else {
            $aSelectFields = array_merge($aSelectFields, $aLeaderSelectFields);
        }

        return $aSelectFields;
    }

    public function getProjectVolunteersByRoleId($ProjectVolunteerRoleID, $bReturnWorker = false, $Year = null)
    {
        $Year = $Year?: $this->getCurrentYear();
        $aSelectFields = $this->getSelectFields($bReturnWorker);
        $aSelectFields = array_merge(['sites.SiteName'], $aSelectFields);
        $collection = ProjectVolunteerRole::select(
            $aSelectFields
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
        )->join(
            'volunteer_status_options',
            'volunteer_status_options.id',
            '=',
            'project_volunteer_role.Status'
        )->where(
            'project_volunteer_role.ProjectVolunteerRoleID',
            '=',
            $ProjectVolunteerRoleID
        )->whereNull('project_volunteers.deleted_at')->whereNull('project_volunteer_role.deleted_at');

        $collection->join(
            'projects',
            function ($join) {
                $join->on(
                    'project_volunteer_role.ProjectID',
                    '=',
                    'projects.ProjectID'
                )->where(
                    'projects.Active', '=', '1'
                );
            }
        )->join(
            'site_status',
            'projects.SiteStatusID',
            '=',
            'site_status.SiteStatusID'
        )->join(
            'sites',
            'sites.SiteID',
            '=',
            'site_status.SiteID'
        )->where(
            'site_status.Year',
            $Year
        )->whereNull('site_status.deleted_at');
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

    public function getProjectTeam($ProjectID = null, $Year = null, $SiteID = null)
    {
        return $this->getProjectVolunteers($ProjectID, false, $Year, $SiteID);
    }

    public function getProjectVolunteers($ProjectID = null, $bReturnWorkers = true, $Year = null, $SiteID = null)
    {
        $sWorkerCondition = $bReturnWorkers ? '=' : '!=';
        $aSelectFields = $this->getSelectFields($bReturnWorkers);
        if ($Year || $SiteID) {
            $aSelectFields = array_merge(['sites.SiteName'], $aSelectFields);
        }
        $collection = ProjectVolunteerRole::select(
            $aSelectFields
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
            function ($join) use ($sWorkerCondition) {
                $join->on(
                    'project_volunteer_role.ProjectRoleID',
                    '=',
                    'project_roles.ProjectRoleID'
                )->whereRaw(
                    'project_roles.role ' . $sWorkerCondition . ' \'Worker\''
                );
            }
        )->join(
            'projects',
            function ($join) {
                $join->on(
                    'project_volunteer_role.ProjectID',
                    '=',
                    'projects.ProjectID'
                )->where(
                    'projects.Active', '=', '1'
                );
            }
        )->join(
            'volunteers',
            'volunteers.VolunteerID',
            '=',
            'project_volunteer_role.VolunteerID'
        )->join(
            'volunteer_status_options',
            'volunteer_status_options.id',
            '=',
            'project_volunteer_role.Status'
        )->whereNull('project_volunteers.deleted_at')->whereNull('project_volunteer_role.deleted_at');
        if ($ProjectID) {
            $collection->where(
                'project_volunteer_role.ProjectID',
                '=',
                $ProjectID
            );
        } elseif ($Year) {
            $collection->join(
                'site_status',
                'projects.SiteStatusID',
                '=',
                'site_status.SiteStatusID'
            )->join(
                'sites',
                'sites.SiteID',
                '=',
                'site_status.SiteID'
            )->where(
                'site_status.Year',
                $Year
            )->whereNull('site_status.deleted_at');
        } elseif ($SiteID) {
            $collection->join(
                'site_status',
                'projects.SiteStatusID',
                '=',
                'site_status.SiteStatusID'
            )->join(
                'sites',
                'sites.SiteID',
                '=',
                'site_status.SiteID'
            )->where(
                'site_status.SiteID',
                $SiteID
            )->whereNull('site_status.deleted_at');
        }
        // $str= '<pre>' . \Illuminate\Support\Str::replaceArray('?', $collection->getBindings(), $collection->toSql()) . '</pre>';
        // \Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,$str]);
        return $collection->get()->toArray();
    }

    public function getAllProjectLeads()
    {
        return $this->getAllProjectVolunteers(false);
    }

    public function getAllProjectVolunteers($bReturnWorkers = true)
    {
        $sWorkerCondition = $bReturnWorkers ? '=' : '!=';

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
            $sWorkerCondition,
            'Worker'
        )->select(
            $aSelectFields = $this->getSelectFields($bReturnWorkers)
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
