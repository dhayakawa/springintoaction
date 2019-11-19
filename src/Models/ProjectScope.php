<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/12/2018
 * Time: 8:31 AM
 */

namespace Dhayakawa\SpringIntoAction\Models;

use Dhayakawa\SpringIntoAction\Helpers\ProjectRegistrationHelper;

use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Dhayakawa\SpringIntoAction\Models\Attribute;
use Dhayakawa\SpringIntoAction\Models\ProjectAttribute;
use Dhayakawa\SpringIntoAction\Models\Workflow;
use Dhayakawa\SpringIntoAction\Models\ProjectAttributesInt;
use Dhayakawa\SpringIntoAction\Models\ProjectAttributesDecimal;
use Dhayakawa\SpringIntoAction\Models\ProjectAttributesText;
use Dhayakawa\SpringIntoAction\Models\ProjectAttributesVarchar;

/**
 * Class ProjectScope
 *
 * @package Dhayakawa\SpringIntoAction\Models
 */
class ProjectScope extends BaseModel
{
    use ProjectRegistrationHelper;

    use SoftDeletes;
    public $aAttributeTables = [
        'project_attributes_decimal' => ProjectAttributesDecimal::class,
        'project_attributes_int' => ProjectAttributesInt::class,
        'project_attributes_text' => ProjectAttributesText::class,
        'project_attributes_varchar' => ProjectAttributesVarchar::class,
    ];
    protected $dates = ['deleted_at'];
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'projects';
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'ProjectID';
    protected $fillable = [
        'SiteStatusID',
        'Active',
        'SequenceNumber',
        'OriginalRequest',
        'ProjectDescription',
        'Comments',

    ];
    private $defaultRecordData = [
        'ProjectID' => null,
        'SiteStatusID' => 0,
        'Active' => 0,
        'SequenceNumber' => 99999,
        'OriginalRequest' => '',
        'ProjectDescription' => '',
        'Comments' => '',
        'BudgetSources' => '',
        'ChildFriendly' => 0,
        'PrimarySkillNeeded' => '',
        'VolunteersNeededEst' => 0,
        'Status' => 6,
        'StatusReason' => '',
        'MaterialsNeeded' => '',
        'EstimatedCost' => null,
        'ActualCost' => 0.00,
        'BudgetAvailableForPC' => 0.00,
        'VolunteersLastYear' => 0,
        'NeedsToBeStartedEarly' => 0,
        'PCSeeBeforeSIA' => 0,
        'SpecialEquipmentNeeded' => '',
        'PermitsOrApprovalsNeeded' => '',
        'PrepWorkRequiredBeforeSIA' => '',
        'SetupDayInstructions' => '',
        'SIADayInstructions' => '',
        'Area' => '',
        'PaintOrBarkEstimate' => '',
        'PaintAlreadyOnHand' => '',
        'PaintOrdered' => '',
        'CostEstimateDone' => 0,
        'MaterialListDone' => 0,
        'BudgetAllocationDone' => 0,
        'VolunteerAllocationDone' => 0,
        'NeedSIATShirtsForPC' => 0,
        'ProjectSend' => 2,
        'FinalCompletionStatus' => 0,
        'FinalCompletionAssessment' => '',
    ];
    /**
     * @var array
     */
    private $aSortedProjectSkillNeededOptionsOrder = [];
    public $requiredPercentage = ".8";
    public $ProjectStatusApprovedOptionID = null;

    /**
     * @param null|array $defaults
     *
     * @return mixed
     */
    public function site($defaults = null)
    {
        return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Site')->withDefault(
            $this->getDefaultRecordData($defaults)
        );//->withTimestamps();
    }

    public function volunteers()
    {
        return $this->belongsToMany(
            'Dhayakawa\SpringIntoAction\Models\Volunteer',
            'project_volunteers',
            'ProjectID',
            'VolunteerID'
        )->as('project_volunteers');
    }

    public function contacts()
    {
        return $this->belongsToMany(
            'Dhayakawa\SpringIntoAction\Models\Contact',
            'project_contacts',
            'ProjectID',
            'ContactID'
        )->as('project_contacts');
    }

    public function budgets()
    {
        return $this->hasMany('Dhayakawa\SpringIntoAction\Models\Budget', 'ProjectID', 'ProjectID');
    }

    public function attachments()
    {
        $results = $this->hasMany('Dhayakawa\SpringIntoAction\Models\ProjectAttachment', 'ProjectID', 'ProjectID');

        return $results;
    }

    public function projectVolunteersWithRoles()
    {
        return $this->belongsToMany(
            'Dhayakawa\SpringIntoAction\Models\Volunteer',
            'project_volunteer_role',
            'ProjectID',
            'VolunteerID'
        )->as('project_leads');
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
            $this->defaultRecordData['Year'] = $this->getCurrentYear();
        }

        return $this->defaultRecordData;
    }

    public function copy()
    {
        /*
         UPDATE projects p
JOIN site_status ss ON ss.SiteStatusID = p.SiteStatusID AND ss.Year = 2018
SET p.Status = '',Comments='', p.StatusReason = '', BudgetSources = '', VolunteersNeededEst=0;
DELETE pv.* FROM budget pv
WHERE pv.ProjectID IN (
SELECT ProjectID
FROM (
     SELECT p.ProjectID
     FROM projects p
       JOIN site_status ss ON ss.SiteStatusID = p.SiteStatusID AND ss.Year = 2018
   ) TrickAlias
);
         */
    }

    /**
     * @param       $Year
     * @param array $filter
     * @param null  $orderBy
     *
     * @return mixed
     */
    public function getRegistrationProjects($Year, $filter = [], $orderBy = null)
    {
        // handle possible sql injection
        if (!is_numeric($Year) || strlen($Year) !== 4) {
            $Year = $this->getCurrentYear();
        }

        $passedInOrderBy = $orderBy;
        if (empty($orderBy)) {
            $orderBy = [];
            $orderBy[] = ['field' => 'sites.SiteName', 'direction' => 'asc'];
            $orderBy[] = ['field' => 'projects.PrimarySkillNeeded', 'direction' => 'desc'];
        } else {
            $aTmpOrderBy = $orderBy;
            $orderBy = [];
            list($sortField, $direction) = preg_split("/_/", $aTmpOrderBy);
            $orderBy[] = ['field' => $sortField, 'direction' => $direction];
        }

        $sSqlVolunteersAssigned = $this->getVolunteersAssignedSql();
        $sSqlVolunteersNeeded = $this->getVolunteersNeededSql($Year);
        $sSqlPeopleNeeded = $this->getPeopleNeededSql($Year);
        $projects = self::select(
            [
                'projects.ProjectID',
                'sites.SiteName',
                'projects.ProjectDescription',
                'projects.PrimarySkillNeeded',
                'projects.ChildFriendly',
                DB::raw("{$sSqlVolunteersAssigned} as VolunteersAssigned"),
                DB::raw("{$sSqlPeopleNeeded} as PeopleNeeded"),
                DB::raw("{$sSqlVolunteersNeeded} as VolunteersNeededEst"),
            ]
        )->join('site_status', 'projects.SiteStatusID', '=', 'site_status.SiteStatusID')->where(
            'site_status.Year',
            $Year
        )->join('sites', 'site_status.SiteID', '=', 'sites.SiteID')->where(
            DB::raw("{$sSqlPeopleNeeded}"),
            '>',
            0
        )->whereNull('sites.deleted_at')->whereNull('site_status.deleted_at')->where('projects.Active', 1)->where(
            'projects.Status',
            $this->getProjectStatusApprovedOptionID()
        );

        if (!empty($filter) && is_array($filter)) {
            $projects->where(
                function ($query) use ($filter, $sSqlPeopleNeeded) {
                    $iFilterCnt = 0;
                    $bForceFilterRequiredToShowInList = true;
                    foreach ($filter as $filterType => $aFilterValue) {
                        if ($filterType === 'site') {
                            if (is_array($aFilterValue)) {
                                foreach ($aFilterValue as $filterValue) {
                                    if ($bForceFilterRequiredToShowInList || $iFilterCnt === 0) {
                                        $query->where('sites.SiteName', $filterValue);
                                        $iFilterCnt++;
                                    } else {
                                        $query->orWhere('sites.SiteName', $filterValue);
                                        $iFilterCnt++;
                                    }
                                }
                            }
                        } elseif ($filterType === 'skill') {
                            if (is_array($aFilterValue)) {
                                foreach ($aFilterValue as $filterValue) {
                                    if ($bForceFilterRequiredToShowInList || $iFilterCnt === 0) {
                                        $query->where('projects.PrimarySkillNeeded', 'REGEXP', $filterValue);
                                        $iFilterCnt++;
                                    } else {
                                        $query->orWhere('projects.PrimarySkillNeeded', 'REGEXP', $filterValue);
                                        $iFilterCnt++;
                                    }
                                }
                            }
                        } elseif ($filterType === 'childFriendly') {
                            if (is_array($aFilterValue)) {
                                foreach ($aFilterValue as $filterValue) {
                                    $filterValue = $filterValue === 'No' ? '0' : '1';
                                    if ($bForceFilterRequiredToShowInList || $iFilterCnt === 0) {
                                        $query->where('projects.ChildFriendly', $filterValue);
                                        $iFilterCnt++;
                                    } else {
                                        $query->orWhere('projects.ChildFriendly', $filterValue);
                                        $iFilterCnt++;
                                    }
                                }
                            }
                        } elseif ($filterType === 'peopleNeeded') {
                            if (is_array($aFilterValue)) {
                                foreach ($aFilterValue as $filterValue) {
                                    if ($bForceFilterRequiredToShowInList || $iFilterCnt === 0) {
                                        $query->whereRaw("({$sSqlPeopleNeeded}) >= ?", [$filterValue]);
                                        $iFilterCnt++;
                                    } else {
                                        $query->orWhereRaw("({$sSqlPeopleNeeded}) >= ?", [$filterValue]);
                                        $iFilterCnt++;
                                    }
                                }
                            }
                        }
                    }
                }
            );
        }
        foreach ($orderBy as $order) {
            $projects->orderBy(
                $order['field'],
                $order['direction']
            );
        }
        // \Illuminate\Support\Facades\Log::debug(
        //     '',
        //     [
        //         'File:' . __FILE__,
        //         'Method:' . __METHOD__,
        //         'Line:' . __LINE__,
        //         $projects->toSql(),
        //         $filter
        //     ]
        // );
        $all_projects = $projects->get()->toArray();
        if (preg_match("/projects\.PrimarySkillNeeded/", $passedInOrderBy)) {
            $all_projects = $this->sortByProjectSkillNeeded($all_projects, $orderBy[0]['direction']);
        }

        return $all_projects;
    }

    public function getProjectStatusApprovedOptionID()
    {
        if ($this->ProjectStatusApprovedOptionID === null) {
            $projectStatusOptions = new ProjectStatusOptions();
            $this->ProjectStatusApprovedOptionID = $projectStatusOptions->getOptionIDByLabel('Approved');
        }

        return $this->ProjectStatusApprovedOptionID;
    }

    public function getActiveProjectsSql($Year)
    {
        return "(select count(*) from projects p
                   join site_status ss on p.SiteStatusID = ss.SiteStatusID and ss.Year = {$Year} and ss.deleted_at IS NULL where p.Active = 1 and p.Status = {$this->getProjectStatusApprovedOptionID()} and `p`.`deleted_at` is null)";
    }

    public function getVolunteersAssignedSql()
    {
        return "(select count(*) from project_volunteers pv join project_volunteer_role pvr on pvr.ProjectID = pv.ProjectID and pvr.VolunteerID = pv.VolunteerID where pv.ProjectID = projects.ProjectID and pvr.Status = 5 and pvr.ProjectRoleID = 4 and pvr.deleted_at is NULL and pv.deleted_at is null)";
    }

    public function getProjectsAtReqPercSql($Year)
    {
        return "(select count(*)
            from projects p
                   join site_status ss on p.SiteStatusID = ss.SiteStatusID and ss.Year = {$Year} and ss.deleted_at IS NULL
            where p.Active = 1 and p.Status = {$this->getProjectStatusApprovedOptionID()} and `p`.`deleted_at` is null
              and ((" .
               str_replace('projects.', 'p.', $this->getVolunteersAssignedSql()) .
               " + " .
               str_replace('projects.', 'p.', $this->getVolunteersAssignedSql()) .
               ") / p.VolunteersNeededEst) >= {$this->requiredPercentage})";
    }

    public function getVolunteersNeededSql($Year)
    {
        $SiteSetting = new SiteSetting();

        if ($SiteSetting->getSettingValue('require_min_registrations')) {
            return "IF({$this->getProjectsAtReqPercSql($Year)} = {$this->getActiveProjectsSql($Year)}, projects.VolunteersNeededEst, CEILING(projects.VolunteersNeededEst * {$this->requiredPercentage}))";
        } else {
            return "projects.VolunteersNeededEst";
        }
    }

    public function getProjectReservationsSql()
    {
        $reservationLifeTime = config('springintoaction.registration.reservation_lifetime_minutes');

        return "(IFNULL((select sum(`pr`.`reserve`) from project_reservations pr where pr.ProjectID = projects.ProjectID AND TIMESTAMPDIFF(MINUTE, pr.updated_at, NOW()) < {$reservationLifeTime}),0))";
    }

    public function getPeopleNeededSql($Year)
    {
        return "{$this->getVolunteersNeededSql($Year)} - {$this->getVolunteersAssignedSql()} - {$this->getProjectReservationsSql()}";
    }

    /**
     * @param       $Year
     * @param array $filter
     * @param null  $orderBy
     *
     * @return mixed
     */
    public function getReportProjects($Year, $filter = [], $orderBy = null)
    {
        // handle possible sql injection
        if (!is_numeric($Year) || strlen($Year) !== 4) {
            $Year = $this->getCurrentYear();
        }

        $passedInOrderBy = $orderBy;
        if (empty($orderBy)) {
            $orderBy = [];
            $orderBy[] = ['field' => 'sites.SiteName', 'direction' => 'asc'];
            $orderBy[] = ['field' => 'projects.SequenceNumber', 'direction' => 'asc'];
        } else {
            $aTmpOrderBy = $orderBy;
            $orderBy = [];
            list($sortField, $direction) = preg_split("/_/", $aTmpOrderBy);
            $orderBy[] = ['field' => $sortField, 'direction' => $direction];
        }

        $sSqlVolunteersAssigned = $this->getVolunteersAssignedSql();
        $sSqlVolunteersNeeded = $this->getVolunteersNeededSql($Year);
        $sSqlPeopleNeeded = $this->getPeopleNeededSql($Year);

        $projects = self::select(
            [
                'projects.ProjectID',
                'sites.SiteName',
                'projects.Active',
                'projects.SequenceNumber',
                'projects.OriginalRequest',
                'projects.ProjectDescription',
                'projects.Comments',
                DB::raw(
                    '(SELECT GROUP_CONCAT(distinct bso.option_label SEPARATOR \',\') FROM budgets join budget_source_options bso on bso.id = budgets.BudgetSource where budgets.ProjectID = projects.ProjectID and budgets.deleted_at is null) as BudgetSources'
                ),
                'projects.ChildFriendly',
                'projects.PrimarySkillNeeded',
                DB::raw("{$sSqlVolunteersNeeded} as VolunteersNeededEst"),
                DB::raw("{$sSqlVolunteersAssigned} as VolunteersAssigned"),
                DB::raw("{$sSqlPeopleNeeded} as PeopleNeeded"),
                DB::raw(
                    '(select pso.option_label from project_status_options pso where pso.id = projects.Status) as Status'
                ),
                'projects.StatusReason',
                'projects.MaterialsNeeded',
                'projects.EstimatedCost',
                'projects.ActualCost',
                'projects.BudgetAvailableForPC',
                'projects.NeedsToBeStartedEarly',
                'projects.PCSeeBeforeSIA',
                'projects.SpecialEquipmentNeeded',
                'projects.PermitsOrApprovalsNeeded',
                'projects.PrepWorkRequiredBeforeSIA',
                'projects.SetupDayInstructions',
                'projects.SIADayInstructions',
                'projects.Area',
                'projects.PaintOrBarkEstimate',
                'projects.PaintAlreadyOnHand',
                'projects.PaintOrdered',
                'projects.CostEstimateDone',
                'projects.MaterialListDone',
                'projects.BudgetAllocationDone',
                'projects.VolunteerAllocationDone',
                'projects.NeedSIATShirtsForPC',
                DB::raw(
                    "(select sso.option_label from send_status_options sso where sso.id = projects.ProjectSend) as ProjectSend"
                ),
                'projects.FinalCompletionStatus',
                'projects.FinalCompletionAssessment',

            ]
        )->join('site_status', 'projects.SiteStatusID', '=', 'site_status.SiteStatusID')->where(
            'site_status.Year',
            $Year
        )->whereNull('sites.deleted_at')->whereNull('site_status.deleted_at')->join(
            'sites',
            'site_status.SiteID',
            '=',
            'sites.SiteID'
        )->where('projects.ProjectDescription', 'NOT REGEXP', 'Test');

        if (!empty($filter) && is_array($filter)) {
            $projects->where(
                function ($query) use ($filter, $sSqlPeopleNeeded) {
                    $iFilterCnt = 0;
                    $bForceFilterRequiredToShowInList = true;
                    foreach ($filter as $filterType => $aFilterValue) {
                        if ($filterType === 'site') {
                            if (is_array($aFilterValue)) {
                                foreach ($aFilterValue as $filterValue) {
                                    if ($bForceFilterRequiredToShowInList || $iFilterCnt === 0) {
                                        $query->where('sites.SiteName', $filterValue);
                                        $iFilterCnt++;
                                    } else {
                                        $query->orWhere('sites.SiteName', $filterValue);
                                        $iFilterCnt++;
                                    }
                                }
                            }
                        } elseif ($filterType === 'skill') {
                            if (is_array($aFilterValue)) {
                                foreach ($aFilterValue as $filterValue) {
                                    if ($bForceFilterRequiredToShowInList || $iFilterCnt === 0) {
                                        $query->where('projects.PrimarySkillNeeded', 'REGEXP', $filterValue);
                                        $iFilterCnt++;
                                    } else {
                                        $query->orWhere('projects.PrimarySkillNeeded', 'REGEXP', $filterValue);
                                        $iFilterCnt++;
                                    }
                                }
                            }
                        } elseif ($filterType === 'childFriendly') {
                            if (is_array($aFilterValue)) {
                                foreach ($aFilterValue as $filterValue) {
                                    $filterValue = $filterValue === 'No' ? '0' : '1';
                                    if ($bForceFilterRequiredToShowInList || $iFilterCnt === 0) {
                                        $query->where('projects.ChildFriendly', $filterValue);
                                        $iFilterCnt++;
                                    } else {
                                        $query->orWhere('projects.ChildFriendly', $filterValue);
                                        $iFilterCnt++;
                                    }
                                }
                            }
                        } elseif ($filterType === 'peopleNeeded') {
                            if (is_array($aFilterValue)) {
                                foreach ($aFilterValue as $filterValue) {
                                    if ($bForceFilterRequiredToShowInList || $iFilterCnt === 0) {
                                        $query->whereRaw("({$sSqlPeopleNeeded}) >= ?", [$filterValue]);
                                        $iFilterCnt++;
                                    } else {
                                        $query->orWhereRaw("({$sSqlPeopleNeeded}) >= ?", [$filterValue]);
                                        $iFilterCnt++;
                                    }
                                }
                            }
                        }
                    }
                }
            );
        }
        foreach ($orderBy as $order) {
            $projects->orderBy(
                $order['field'],
                $order['direction']
            );
        }
        // \Illuminate\Support\Facades\Log::debug(
        //     '',
        //     [
        //         'File:' . __FILE__,
        //         'Method:' . __METHOD__,
        //         'Line:' . __LINE__,
        //         $projects->toSql(),
        //     ]
        // );

        $all_projects = $projects->get()->toArray();
        if (preg_match("/projects\.PrimarySkillNeeded/", $passedInOrderBy)) {
            $all_projects = $this->sortByProjectSkillNeeded($all_projects, $orderBy[0]['direction']);
        }
        $all_projects = $this->setProjectSkillNeededLabels($all_projects);

        return $all_projects;
    }

    public function setProjectSkillNeededLabels($all_projects)
    {
        $ProjectSkillNeededOptions = ProjectSkillNeededOptions::select('id', 'option_label')->get();
        $ProjectSkillNeededOptions = $ProjectSkillNeededOptions ? $ProjectSkillNeededOptions->toArray() : [];
        $aProjectSkillNeededOptions = [];
        foreach ($ProjectSkillNeededOptions as $option) {
            $aProjectSkillNeededOptions[$option['id']] = $option['option_label'];
        }
        array_walk(
            $all_projects,
            function (&$data) use ($aProjectSkillNeededOptions) {
                $skills = $data['PrimarySkillNeeded'];
                $aSkills = explode(',', $skills);
                $aLabels = [];
                foreach ($aSkills as $skillId) {
                    $aLabels[] = $aProjectSkillNeededOptions[$skillId];
                }
                $data['PrimarySkillNeeded'] = join(',', $aLabels);
            }
        );

        return $all_projects;
    }

    public function sortByProjectSkillNeeded($all_projects, $direction)
    {
        $this->aSortedProjectSkillNeededOptionsOrder = $this->getSortedProjectSkillNeededOptionIds($direction);

        usort($all_projects, [$this, "custom_compare"]);

        return $all_projects;
    }

    private function custom_compare($a, $b)
    {
        $a = array_search(substr($a["PrimarySkillNeeded"], 0, 1), $this->aSortedProjectSkillNeededOptionsOrder);
        $b = array_search(substr($b["PrimarySkillNeeded"], 0, 1), $this->aSortedProjectSkillNeededOptionsOrder);
        if ($a === false && $b === false) { // both items are dont cares
            return 0;                      // a == b
        } else {
            if ($a === false) {           // $a is a dont care item
                return 1;                      // $a > $b
            } else {
                if ($b === false) {           // $b is a dont care item
                    return -1;                     // $a < $b
                } else {
                    return $a - $b;
                }
            }
        }
    }

    public function getSortedProjectSkillNeededOptionIds($direction)
    {
        try {
            $aProjectSkillNeededOptions = [];
            $ProjectSkillNeededOptions = ProjectSkillNeededOptions::select('id')->orderBy(
                'option_label',
                $direction
            )->get();
            $ProjectSkillNeededOptions = $ProjectSkillNeededOptions ? $ProjectSkillNeededOptions->toArray() : [];
            foreach ($ProjectSkillNeededOptions as $option) {
                $aProjectSkillNeededOptions[] = $option['id'];
            }
        } catch (Exception $e) {
            $aProjectSkillNeededOptions = [];
            report($e);
        }

        return $aProjectSkillNeededOptions;
    }

    public function getRegistrationSkillsNeededFilters($Year)
    {
        $all_projects = $this->getRegistrationProjects($Year);
    }

    public static function getBaseProjectModelForQuery()
    {
        $projectModel = new Project();
        $sSqlVolunteersAssigned = $projectModel->getVolunteersAssignedSql();

        return self::select(
            'projects.*',
            DB::raw(
                '(SELECT GROUP_CONCAT(distinct BudgetID SEPARATOR \',\') FROM budgets where budgets.ProjectID = projects.ProjectID and budgets.deleted_at is null) as BudgetSources'
            ),
            DB::raw(
                "{$sSqlVolunteersAssigned} as VolunteersAssigned"
            ),
            DB::raw(
                '(select COUNT(*) from project_attachments where project_attachments.ProjectID = projects.ProjectID) AS `HasAttachments`'
            )
        );
    }

    public static function getSiteProjects($SiteStatusID, $bReturnArr = true)
    {
        try {
            $projects = self::getBaseProjectModelForQuery()->join(
                'site_status',
                'projects.SiteStatusID',
                '=',
                'site_status.SiteStatusID'
            )->where(
                'site_status.SiteStatusID',
                $SiteStatusID
            )->whereNull('site_status.deleted_at')->orderBy('projects.SequenceNumber', 'asc')->get();

            return $bReturnArr ? $projects->toArray() : $projects;
        } catch (Exception $e) {
            return $bReturnArr ? [] : null;
        }
    }

    public function getProjectsByYear($Year, $bReturnArr = true)
    {
        try {
            $projects = self::getBaseProjectModelForQuery()->join(
                'site_status',
                'projects.SiteStatusID',
                '=',
                'site_status.SiteStatusID'
            )->where(
                'site_status.Year',
                $Year
            )->whereNull('site_status.deleted_at')->where('projects.Active', 1)->orderBy(
                'projects.SequenceNumber',
                'asc'
            )->get();

            return $bReturnArr ? $projects->toArray() : $projects;
        } catch (Exception $e) {
            return $bReturnArr ? [] : null;
        }
    }

    public function getStatusManagementRecords()
    {
        $Year = $this->getCurrentYear();
        $sites = SiteStatus::join(
            'sites',
            'sites.SiteID',
            '=',
            'site_status.SiteID'
        )->whereNull('sites.deleted_at')->whereNull('site_status.deleted_at')->where('Year', $Year)->orderBy(
            'sites.SiteName',
            'asc'
        )->get()->toArray();

        foreach ($sites as $key => $data) {
            $sites[$key]['projects'] = self::getBaseProjectModelForQuery()->join(
                'site_status',
                'projects.SiteStatusID',
                '=',
                'site_status.SiteStatusID'
            )->addSelect(
                DB::raw(
                    "(select CONCAT(volunteers.FirstName, ' ', volunteers.LastName)
                            from project_volunteer_role pvr
                                   join project_roles pr on pr.ProjectRoleID = pvr.ProjectRoleID and pr.Role = 'Project Manager' and pr.deleted_at is null
                                   join volunteers on volunteers.VolunteerID = pvr.VolunteerID  and volunteers.deleted_at is null 
                                   where pvr.ProjectID = projects.ProjectID and pvr.deleted_at is null
                           ) as `PM`"
                )
            )->where(
                'site_status.SiteStatusID',
                $data['SiteStatusID']
            )->whereNull('site_status.deleted_at')->orderBy('projects.SequenceNumber', 'asc')->get()->toArray();
        }

        return $sites;
    }

    public function updateProjectScope($ProjectID, $requestData, $projectModel, $projectModelData)
    {
        //echo '$ProjectID:'. $ProjectID. PHP_EOL;
        //print_r($requestData);

        $aModelResult = [];
        $attributes = $this->getAttributesArray('projects');
        foreach ($requestData as $attributeCode => $attributeCodeValue) {
            //echo $attributeCode . ':' . (is_array($attributeCodeValue) ? print_r($attributeCodeValue, true) : $attributeCodeValue).PHP_EOL;
            if(preg_match("/material_needed_and_cost/",$attributeCode)){
                if($attributeCode === 'material_needed_and_cost'){
                    $aRows = [];
                    foreach($requestData['material_needed_and_cost[material]'] as $key => $materialNeeded){
                        if ($materialNeeded !== '') {
                            $aRows[] = [$materialNeeded, $requestData['material_needed_and_cost[cost]'][$key]];
                        }
                    }
                    if(!empty($aRows)){
                        $attributeCodeValue = $aRows;
                    }
                } else {
                    continue;
                }
            }

            if(is_array($attributeCodeValue)) {
                $attributeCodeValue = json_encode($attributeCodeValue, true);
            }
            $a = self::searchArrayValueRecursiveByKeyValue('attribute_code', $attributeCode, $attributes);
            //print_r($a);
            if ($a) {
                $aAttributeRecord = current(current($a));
                $table_field_type = $aAttributeRecord['table_field_type'];
                if (!empty($table_field_type)) {
                    //echo '$table_field_type:' . $table_field_type . PHP_EOL;

                    $table = "project_attributes_{$table_field_type}";
                    $model = $this->aAttributeTables[$table]::where(
                        'attribute_id',
                        '=',
                        $aAttributeRecord['id']
                    )->where('project_id', '=', $ProjectID)->first();
                    if ($table_field_type === 'int' && !is_numeric($attributeCodeValue)) {

                        if (!empty($attributeCodeValue) && !empty($aAttributeRecord['options_source'])) {
                            $optionSource = DB::table($aAttributeRecord['options_source'])->where(
                                'option_label',
                                '=',
                                $attributeCodeValue
                            )->get();
                        } else {
                            if (empty($attributeCodeValue) && $aAttributeRecord['default_value'] !== '') {
                                $attributeCodeValue = $aAttributeRecord['default_value'];
                            }
                        }
                        switch ($attributeCode) {
                            case 'project_send':
                                $attributeCodeValue = 2;
                                break;
                            case 'status':
                                $attributeCodeValue = 6;
                                break;
                        }
                    }
                    if ($table_field_type !== 'int' && $table_field_type !== 'decimal') {
                        $attributeCodeValue = "$attributeCodeValue";
                    }

                    if ($model === null) {
                        try {
                            $aModelResult[$attributeCode.'_insert__'. $table] = DB::table($table)->insert(
                                [
                                    'attribute_id' => $aAttributeRecord['id'],
                                    'project_id' => $ProjectID,
                                    'value' => $attributeCodeValue,
                                    'updated_at' => date("Y-m-d H:i:s"),
                                    'created_at' => date("Y-m-d H:i:s"),

                                ]
                            );
                        } catch (Exception $e) {
                            echo $e->getMessage() . PHP_EOL;
                            echo '$table_field_type:' . $table_field_type . PHP_EOL;
                            echo $attributeCode . ":" . $attributeCodeValue. PHP_EOL;
                        }
                    } else {
                        //$tableId = $model->get('value_id');
                        try {

                            $data = [
                                'attribute_id' => $aAttributeRecord['id'],
                                'project_id' => $ProjectID,
                                'value' => $attributeCodeValue,
                                'updated_at' => date("Y-m-d H:i:s"),
                                'created_at' => date("Y-m-d H:i:s"),

                            ];
                            $model->fill(
                                $data
                                );

                            $aModelResult[$attributeCode . '_update__'. $table] = $model->save();
                            // DB::table($table)->where('id', $tableId)->update(
                            //     [
                            //         'attribute_id' => $aAttributeRecord['id'],
                            //         'project_id' => $ProjectID,
                            //         'value' => $attributeCodeValue,
                            //         'updated_at' => date("Y-m-d H:i:s"),
                            //         'created_at' => date("Y-m-d H:i:s"),
                            //
                            //     ]
                            // );
                        } catch (Exception $e) {
                            echo $e->getMessage() . PHP_EOL;
                            echo '$table_field_type:' . $table_field_type . PHP_EOL;
                            echo $attributeCode . ":" . $attributeCodeValue . PHP_EOL;
                        }
                    }
                }
            } else {
                //echo "Not an attribute\n";
            }
        }
        $projectModel->fill($projectModelData);
        $projectModelSuccess = $projectModel->save();

        return !preg_grep("/0/",$aModelResult) && $projectModelSuccess;
    }
    public function getInitialProjectScopeAttributeData()
    {
        $aProject= [];
        // Get all attributes related to projects
        $aAttributes = $this->getAttributesArray('projects');
        //print_r($aAttributes);
        // Set every attribute into the project with its default value
        foreach ($aAttributes as $aAttribute) {
            $aProject[$aAttribute['attribute_code']] = $aAttribute['default_value'];
        }
        return $aProject;
    }
    public function getProject($ProjectID, $bReturnArr = true)
    {
        $aProject = [];

        try {
            // Get project record
            $projectScope = Project::findOrFail($ProjectID)->toArray();
            // Get all attributes related to projects
            $initialData = $this->getInitialProjectScopeAttributeData();
            $aProject = array_merge(
                $initialData,[
                'ProjectID' => $projectScope['ProjectID'],
                'SiteStatusID' => $projectScope['SiteStatusID'],
                'Active' => $projectScope['Active'],
                'SequenceNumber' => $projectScope['SequenceNumber'],
                'OriginalRequest' => $projectScope['OriginalRequest'],
                'ProjectDescription' => $projectScope['ProjectDescription'],
            ]);


            // Get any attribute values set for this project and populate the result
            foreach ($this->aAttributeTables as $tableCode => $tableModelClass) {
                $aAttributeTableData = $tableModelClass::join(
                    'attributes',
                    'attributes.id',
                    '=',
                    $tableCode . '.attribute_id'
                )->where($tableCode . '.project_id', $ProjectID)->get()->toArray();
                foreach($aAttributeTableData as $aAttributeTableDatum){
                    //echo $aAttributeTableDatum['attribute_code'] . ':' . $aAttributeTableDatum['value'] . PHP_EOL;
                    $aProject[$aAttributeTableDatum['attribute_code']] = $aAttributeTableDatum['value'];
                }


            }
            $aProject['contacts'] = [];
            // Add any project contacts
            if ($c = ProjectScope::find($ProjectID)->contacts) {
                $contacts = $c->toArray();
                foreach($contacts as $contact){
                    if($contact['Active']){
                        $aProject['contacts'][] = $contact['ContactID'];
                    }
                }
                //print_r($contacts);
            }
            $aProject['project_attachments'] = [];
            if ($attachments = ProjectScope::find($ProjectID)->attachments) {
                $attachments = $attachments->toArray();
                foreach ($attachments as $attachment) {
                    if (\preg_match("/^.*\/storage\/app/", $attachment['AttachmentPath'])) {
                        $attachment['AttachmentPath'] = preg_replace(
                            "/^.*\/storage\/app/",
                            "/admin/project_attachment/stream/storage/app",
                            $attachment['AttachmentPath']
                        );
                    }
                    $aProject['project_attachments'][$attachment['ProjectAttachmentID']] = $attachment['AttachmentPath'];
                }

                //print_r($contacts);
                $aProject['project_attachments'] = json_encode($aProject['project_attachments']);
            }
            // print_r($aProject);

        } catch (Exception $e) {
            echo $e->getMessage();
        }

        //$this->convertRowDataToAttributeData();

        return $aProject;
    }

    public function convertRowDataToAttributeData()
    {
        // foreach (array_keys($this->aAttributeTables) as $t) {
        //     DB::table($t)->truncate();
        // }
        $aFieldMap = [
            'ActualCost' => 'actual_cost',
            'Area' => 'dimensions',
            'BudgetAllocationDone' => 'budget_allocation_done',
            'BudgetAvailableForPC' => 'budget_available_for_pc',
            'BudgetSources' => 'budget_sources',
            'ChildFriendly' => 'child_friendly',
            'Comments' => 'comments',
            'CostEstimateDone' => 'cost_estimate_done',
            'EstimatedCost' => 'estimated_total_cost',
            'FinalCompletionAssessment' => 'final_completion_assessment',
            'FinalCompletionStatus' => 'final_completion_status',
            'MaterialListDone' => 'material_list_done',
            'MaterialsNeeded' => 'material_needed_and_cost',
            'NeedSIATShirtsForPC' => 'need_sia_t_shirts_for_pc',
            'NeedsToBeStartedEarly' => 'needs_to_be_started_early',
            'OriginalRequest' => 'original_request',
            'PaintAlreadyOnHand' => 'paint_already_on_hand',
            'PaintOrBarkEstimate' => 'painting_dimensions',
            'PaintOrdered' => 'paint_ordered',
            'PCSeeBeforeSIA' => 'pc_see_before_sia',
            'PermitsOrApprovalsNeeded' => 'permit_required_for',
            'PrepWorkRequiredBeforeSIA' => 'prep_work_required',
            'PrimarySkillNeeded' => 'primary_skill_needed',
            'ProjectDescription' => 'project_description',
            'ProjectSend' => 'project_send',
            'SequenceNumber' => 'sequence_number',
            'SetupDayInstructions' => 'setup_day_instructions',
            'SIADayInstructions' => 'sia_day_instructions',
            'SpecialEquipmentNeeded' => 'special_equipment_needed',
            'Status' => 'status',
            'StatusReason' => 'status_reason',
            'VolunteerAllocationDone' => 'volunteer_allocation_done',
            'VolunteersLastYear' => 'volunteers_last_year',
            'VolunteersNeededEst' => 'volunteers_needed_est',
        ];
        $aAttributes = Attribute::get();
        $attributes = $aAttributes ? $aAttributes->toArray() : [];

        $Year = $this->getCurrentYear();
        $projects = $this->getProjectsByYear($Year, $bReturnArr = true);
        foreach ($projects as $project) {
            //print_r($project);
            $projectId = $project['ProjectID'];
            foreach ($aFieldMap as $field => $attributeCode) {
                //echo $attributeCode.PHP_EOL;
                $a = self::searchArrayValueRecursiveByKeyValue('attribute_code', $attributeCode, $attributes);
                //print_r($a);
                if ($a) {
                    $aAttributeRecord = current(current($a));
                    $table_field_type = $aAttributeRecord['table_field_type'];
                    if (!empty($table_field_type)) {
                        //echo '$table_field_type:' . $table_field_type . PHP_EOL;

                        $table = "project_attributes_{$table_field_type}";
                        $model = $this->aAttributeTables[$table]::where(
                            'attribute_id',
                            '=',
                            $aAttributeRecord['id']
                        )->where('project_id', '=', $projectId)->first();
                        if ($table_field_type === 'int' && !is_integer($project[$field])) {
                            if (!empty($project[$field]) && !empty($aAttributeRecord['options_source'])) {
                                $optionSource = DB::table($aAttributeRecord['options_source'])->where(
                                    'option_label',
                                    '=',
                                    $project[$field]
                                )->get();
                            } else {
                                if (empty($project[$field]) && $aAttributeRecord['default_value'] !== '') {
                                    $project[$field] = $aAttributeRecord['default_value'];
                                }
                            }
                            switch ($field) {
                                case 'ProjectSend':
                                    $project[$field] = 2;
                                    break;
                                case 'Status':
                                    $project[$field] = 6;
                                    break;
                            }
                        }
                        if ($model === null) {
                            if ($table_field_type !== 'int' && $table_field_type !== 'decimal') {
                                $project[$field] = "'$project[$field]'";
                            }
                            try {
                                DB::table($table)->insert(
                                    [
                                        'attribute_id' => $aAttributeRecord['id'],
                                        'project_id' => $projectId,
                                        'value' => $project[$field],
                                        'updated_at' => date("Y-m-d H:i:s"),
                                        'created_at' => date("Y-m-d H:i:s"),

                                    ]
                                );
                            } catch (Exception $e) {
                                echo $e->getMessage() . PHP_EOL;
                                echo '$table_field_type:' . $table_field_type . PHP_EOL;
                                echo $attributeCode . ":" . $field . "=" . $project[$field] . PHP_EOL;
                            }
                        }
                    }
                } else {
                    //echo "Not an attribute\n";
                }
            }
        }
    }
}
