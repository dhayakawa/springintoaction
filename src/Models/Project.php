<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/12/2018
 * Time: 8:31 AM
 */

namespace Dhayakawa\SpringIntoAction\Models;

use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Dhayakawa\SpringIntoAction\Models\ProjectSkillNeededOptions;
use Dhayakawa\SpringIntoAction\Models\ProjectStatusOptions;
use Dhayakawa\SpringIntoAction\Models\ProjectVolunteer;
use Dhayakawa\SpringIntoAction\Models\Budget;
use Dhayakawa\SpringIntoAction\Models\SiteStatus;

class Project extends Model
{
    use \Dhayakawa\SpringIntoAction\Helpers\ProjectRegistrationHelper;

    use \Illuminate\Database\Eloquent\SoftDeletes;
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
        'ChildFriendly',
        'PrimarySkillNeeded',
        'VolunteersNeededEst',
        'Status',
        'StatusReason',
        'MaterialsNeeded',
        'EstimatedCost',
        'ActualCost',
        'BudgetAvailableForPC',
        'VolunteersLastYear',
        'NeedsToBeStartedEarly',
        'PCSeeBeforeSIA',
        'SpecialEquipmentNeeded',
        'PermitsOrApprovalsNeeded',
        'PrepWorkRequiredBeforeSIA',
        'SetupDayInstructions',
        'SIADayInstructions',
        'Area',
        'PaintOrBarkEstimate',
        'PaintAlreadyOnHand',
        'PaintOrdered',
        'CostEstimateDone',
        'MaterialListDone',
        'BudgetAllocationDone',
        'VolunteerAllocationDone',
        'NeedSIATShirtsForPC',
        'ProjectSend',
        'FinalCompletionStatus',
        'FinalCompletionAssessment',
    ];
    private $defaultRecordData = [
        'ProjectID' => null,
        'SiteStatusID' => 0,
        'Active' => 0,
        'SequenceNumber' => 99999,
        'OriginalRequest' => '',
        'ProjectDescription' => '',
        'Comments' => '',
        'ChildFriendly' => 0,
        'PrimarySkillNeeded' => '',
        'VolunteersNeededEst' => 0,
        'Status' => '',
        'StatusReason' => '',
        'MaterialsNeeded' => '',
        'EstimatedCost' => 0.00,
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
        'ProjectSend' => 'Not Ready',
        'FinalCompletionStatus' => 0,
        'FinalCompletionAssessment' => '',
    ];
    /**
     * @var array
     */
    private $aSortedProjectSkillNeededOptionsOrder = [];

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
            $this->defaultRecordData['Year'] = date('Y');
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
        $projectStatusOptions = new ProjectStatusOptions();
        $ProjectStatusApprovedOptionID = $projectStatusOptions->getOptionIDByLabel('Approved');
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

        $requiredPercentage = ".8";
        $reservationLifeTime = config('springintoaction.registration.reservation_lifetime_minutes');
        $sSqlVolunteersAssigned =
            "(select count(*) from project_volunteers pv where pv.ProjectID = projects.ProjectID)";

        $sSqlProjectReservations =
            "(IFNULL((select sum(`pr`.`reserve`) from project_reservations pr where pr.ProjectID = projects.ProjectID AND TIMESTAMPDIFF(MINUTE, pr.updated_at, NOW()) < {$reservationLifeTime}),0))";

        $sSqlProjectsAtReqPerc = "(select count(*)
            from projects p
                   join site_status ss on p.SiteStatusID = ss.SiteStatusID and ss.Year = {$Year}
            where p.Active = 1 and p.Status = {$ProjectStatusApprovedOptionID} and `p`.`deleted_at` is null
              and ((" .
                                str_replace('projects.', 'p.', $sSqlVolunteersAssigned) .
                                " + " .
                                str_replace('projects.', 'p.', $sSqlProjectReservations) .
                                ") / p.VolunteersNeededEst) >= {$requiredPercentage})";

        $sSqlActiveProjects = "(select count(*) from projects p
                   join site_status ss on p.SiteStatusID = ss.SiteStatusID and ss.Year = {$Year} where p.Active = 1 and p.Status = {$ProjectStatusApprovedOptionID} and `p`.`deleted_at` is null)";

        $sSqlVolunteersNeeded =
            "IF({$sSqlProjectsAtReqPerc} = {$sSqlActiveProjects}, projects.VolunteersNeededEst, CEILING(projects.VolunteersNeededEst * {$requiredPercentage}))";

        $sSqlPeopleNeeded = "{$sSqlVolunteersNeeded} - {$sSqlVolunteersAssigned} - {$sSqlProjectReservations}";

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
        )->where('projects.Active', 1)->where('projects.Status', $ProjectStatusApprovedOptionID);

        if (!empty($filter) && is_array($filter)) {
            $iFilterCnt = 0;
            foreach ($filter as $filterType => $aFilterValue) {
                if ($filterType === 'site') {
                    if (is_array($aFilterValue)) {
                        foreach ($aFilterValue as $filterValue) {
                            if ($iFilterCnt === 0) {
                                $projects->where('sites.SiteName', $filterValue);
                                $iFilterCnt++;
                            } else {
                                $projects->orWhere('sites.SiteName', $filterValue);
                                $iFilterCnt++;
                            }
                        }
                    }
                } elseif ($filterType === 'skill') {
                    if (is_array($aFilterValue)) {
                        foreach ($aFilterValue as $filterValue) {
                            if ($iFilterCnt === 0) {
                                $projects->where('projects.PrimarySkillNeeded', 'REGEXP', $filterValue);
                                $iFilterCnt++;
                            } else {
                                $projects->orWhere('projects.PrimarySkillNeeded', 'REGEXP', $filterValue);
                                $iFilterCnt++;
                            }
                        }
                    }
                } elseif ($filterType === 'childFriendly') {
                    if (is_array($aFilterValue)) {
                        foreach ($aFilterValue as $filterValue) {
                            $filterValue = $filterValue === 'No' ? '0' : '1';
                            if ($iFilterCnt === 0) {
                                $projects->where('projects.ChildFriendly', $filterValue);
                                $iFilterCnt++;
                            } else {
                                $projects->orWhere('projects.ChildFriendly', $filterValue);
                                $iFilterCnt++;
                            }
                        }
                    }
                } elseif ($filterType === 'peopleNeeded') {
                    if (is_array($aFilterValue)) {
                        foreach ($aFilterValue as $filterValue) {
                            if ($iFilterCnt === 0) {
                                $projects->where('PeopleNeeded', $filterValue);
                                $iFilterCnt++;
                            } else {
                                $projects->orWhere('PeopleNeeded', $filterValue);
                                $iFilterCnt++;
                            }
                        }
                    }
                }
            }
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
        } catch (\Exception $e) {
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
        return self::select(
            'projects.*',
            DB::raw(
                '(SELECT GROUP_CONCAT(distinct BudgetID SEPARATOR \',\') FROM budgets where budgets.ProjectID = 391) as BudgetSources'
            ),
            DB::raw(
                '(select count(*) from project_volunteers pv where pv.ProjectID = projects.ProjectID ) as VolunteersAssigned'
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
            )->orderBy('projects.SequenceNumber', 'asc')->get();

            return $bReturnArr ? $projects->toArray() : $projects;
        } catch (\Exception $e) {
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
            )->where('projects.Active', 1)->orderBy('projects.SequenceNumber', 'asc')->get();

            return $bReturnArr ? $projects->toArray() : $projects;
        } catch (\Exception $e) {
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
        )->where('Year', $Year)->orderBy('sites.SiteName', 'asc')->get()->toArray();

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
                                   join project_roles pr on pr.ProjectRoleID = pvr.ProjectRoleID and pr.Role = 'Project Manager'
                                   join volunteers on volunteers.VolunteerID = pvr.VolunteerID  where pvr.ProjectID = projects.ProjectID
                           ) as `PM`"
                )
            )->where(
                'site_status.SiteStatusID',
                $data['SiteStatusID']
            )->orderBy('projects.SequenceNumber', 'asc')->get()->toArray();
        }

        return $sites;
    }
}
