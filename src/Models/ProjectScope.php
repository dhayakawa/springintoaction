<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/12/2018
 * Time: 8:31 AM
 */

namespace Dhayakawa\SpringIntoAction\Models;

use Dhayakawa\SpringIntoAction\Helpers\AttributesTrait;
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
use Dhayakawa\SpringIntoAction\Models\ProjectVolunteerRole;
use Dhayakawa\SpringIntoAction\Models\Budget;
/**
 * Class ProjectScope
 *
 * @package Dhayakawa\SpringIntoAction\Models
 */
class ProjectScope extends BaseModel
{
    use AttributesTrait, ProjectRegistrationHelper;

    use SoftDeletes;
    /**
     * @var array
     */
    public static $aFieldMap = [
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
        'NeedSIATShirtsForPC' => 'need_sia_tshirts_for_pc',
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
        'VolunteersNeededEst' => 'volunteers_needed_estimate',
        'VolunteersNeededEstimate' => 'volunteers_needed_estimate',
    ];
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
            $orderBy[] = ['field' => 'primary_skill_needed_table.value', 'direction' => 'desc'];
        } else {
            $aTmpOrderBy = $orderBy;

            $orderBy = [];
            [$sortField, $direction] = preg_split("/_/", $aTmpOrderBy);
            switch($sortField){
                case 'projects.PrimarySkillNeeded':
                    $sortField = 'primary_skill_needed_table.value';
                    break;
                case 'projects.ChildFriendly':
                    $sortField = 'child_friendly_table.value';
                    break;
            }
            $orderBy[] = ['field' => $sortField, 'direction' => $direction];
        }

        $sSqlPeopleNeeded = $this->getPeopleNeededSql($Year);
        $projectScope = self::getProjectScopeBaseQueryModelWithAttributes(true, true);
        $projectScope->addSelect(DB::raw("{$sSqlPeopleNeeded} as PeopleNeeded"));
        $projectScope->where(
            'site_status.Year',
            $Year
        )->where(
            DB::raw("{$sSqlPeopleNeeded}"),
            '>',
            0
        )->where(
            'status_table.value',
            $this->getProjectStatusApprovedOptionID()
        );


        if (!empty($filter) && is_array($filter)) {
            $projectScope->where(
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
                                        $query->where('primary_skill_needed_table.value', 'REGEXP', $filterValue);
                                        $iFilterCnt++;
                                    } else {
                                        $query->orWhere('primary_skill_needed_table.value', 'REGEXP', $filterValue);
                                        $iFilterCnt++;
                                    }
                                }
                            }
                        } elseif ($filterType === 'childFriendly') {
                            if (is_array($aFilterValue)) {
                                foreach ($aFilterValue as $filterValue) {
                                    $filterValue = $filterValue === 'No' ? '0' : '1';
                                    if ($bForceFilterRequiredToShowInList || $iFilterCnt === 0) {
                                        $query->where('child_friendly_table.value', $filterValue);
                                        $iFilterCnt++;
                                    } else {
                                        $query->orWhere('child_friendly_table.value', $filterValue);
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
            $projectScope->orderBy(
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
        // $sql = \Illuminate\Support\Str::replaceArray('?', $projectScope->getBindings(), $projectScope->toSql());
        // \Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,$sql]);
        $all_projects = $projectScope->get()->toArray();
        //echo print_r($all_projects,true);

        if (preg_match("/PrimarySkillNeeded/", $passedInOrderBy)) {
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
                   join site_status ss on p.SiteStatusID = ss.SiteStatusID and ss.Year = {$Year} and ss.deleted_at IS NULL where p.Active = 1 and status_table.value = {$this->getProjectStatusApprovedOptionID()} and `p`.`deleted_at` is null)";
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
            where p.Active = 1 and `status_table`.`value` = {$this->getProjectStatusApprovedOptionID()} and `p`.`deleted_at` is null
              and ((" .
               str_replace('projects.', 'p.', $this->getVolunteersAssignedSql()) .
               " + " .
               str_replace('projects.', 'p.', $this->getVolunteersAssignedSql()) .
               ") / `volunteers_needed_estimate_table`.`value`) >= {$this->requiredPercentage})";
    }

    public function getVolunteersNeededSql($Year)
    {
        $SiteSetting = new SiteSetting();

        if ($SiteSetting->getSettingValue('require_min_registrations')) {
            return "IF({$this->getProjectsAtReqPercSql($Year)} = {$this->getActiveProjectsSql($Year)}, `volunteers_needed_estimate_table`.`value`, CEILING(`volunteers_needed_estimate_table`.`value` * {$this->requiredPercentage}))";
        } else {
            return "`volunteers_needed_estimate_table`.`value`";
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
     * @param null  $SiteID
     * @param null  $ProjectID
     * @param array $filter
     * @param null  $orderBy
     *
     * @return mixed
     */
    public function getReportProjects($Year, $SiteID = null, $ProjectID = null, $filter = [], $orderBy = null)
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
            [$sortField, $direction] = preg_split("/_/", $aTmpOrderBy);
            $orderBy[] = ['field' => $sortField, 'direction' => $direction];
        }

        $sSqlPeopleNeeded = $this->getPeopleNeededSql($Year);

        $projectScope = $this->getProjectScopeBaseQueryModelWithAttributes(true, true);
        $projectScope->addSelect(DB::raw("{$sSqlPeopleNeeded} as PeopleNeeded"));
        $projectScope->where(
            'site_status.Year',
            $Year
        );
        if($SiteID !== null){
            $projectScope->where(
                'site_status.SiteID',
                $SiteID
            );
        }
        if($ProjectID !== null){
            $projectScope->where(
                'projects.ProjectID',
                $ProjectID
            );
        }


        foreach ($orderBy as $order) {
            $projectScope->orderBy(
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
        // echo '<pre>' . \Illuminate\Support\Str::replaceArray('?', $projectScope->getBindings(), $projectScope->toSql
        // ()) . '</pre>';
        $all_projects = $projectScope->get()->toArray();

        //echo $projectScope->toSql();

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
        $a = array_search(substr($a["primary_skill_needed"], 2, 1), $this->aSortedProjectSkillNeededOptionsOrder);
        $b = array_search(substr($b["primary_skill_needed"], 2, 1), $this->aSortedProjectSkillNeededOptionsOrder);
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
        $aResult = [];
        // $projectScope = new ProjectScope();
        try {
            $projectsCollection = self::getProjectScopeBaseQueryModelWithAttributes()->where(
                'site_status.SiteStatusID',
                $SiteStatusID
            )->whereNull('site_status.deleted_at')->orderBy('projects.SequenceNumber', 'asc');

            /*echo '<pre>' .
                                 \Illuminate\Support\Str::replaceArray('?',
                                                                       $projects->getBindings(),
                                                                       $projects->toSql()) .
                                 '</pre>';/**/

            $projects = $projectsCollection->get()->map(
                function ($project, $key) {
                    $projectScope = new ProjectScope();

                    return $projectScope->getProject($project->ProjectID, false);
                }
            );
            if ($bReturnArr) {
                $aResult = $projects->toArray();
            }

            return $bReturnArr ? $aResult : $projects;
        } catch (Exception $e) {
            echo $e->getMessage();

            return $bReturnArr ? $aResult : null;
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
        $initialProjectsAttributeData = $this->getInitialProjectScopeAttributeData();
        //echo "<pre>" . print_r($initialProjectsAttributeData, true) . "</pre>";
        foreach ($sites as $key => $data) {
            $aProjects = $this->getProjectScopeBaseQueryModelWithAttributes()->addSelect(
                DB::raw(
                    "(select CONCAT(volunteers.FirstName, ' ', volunteers.LastName)
                            from site_volunteer_role svr
                                   join site_roles sr on sr.SiteRoleID = svr.SiteRoleID and sr.Role = 'Project Manager'
                                   join site_volunteers sv on sv.SiteVolunteerID = svr.SiteVolunteerID
                                   join volunteers on volunteers.VolunteerID = sv.VolunteerID  and volunteers.deleted_at is null 
                                   where svr.SiteStatusID = {$data['SiteStatusID']} limit 1
                           ) as `PM`"
                )
            )->where(
                'site_status.SiteStatusID',
                $data['SiteStatusID']
            )->whereNull('site_status.deleted_at')->orderBy('projects.SequenceNumber', 'asc')->get()->toArray();

            foreach ($aProjects as $projIdx => $aProject) {
                foreach ($aProject as $attribute_code => $attribute_value) {
                    if ($attribute_value === null && isset($initialProjectsAttributeData[$attribute_code])) {
                        // echo "$attribute_code is null and will be set to
                        // {$initialProjectsAttributeData[$attribute_code]}<br>";
                        $aProject[$attribute_code] = $initialProjectsAttributeData[$attribute_code];
                    } elseif ($attribute_value === null) {
                        //echo "$attribute_code is null and is not an attribute<br>";
                        if ($attribute_code === 'BudgetSources') {
                            $aProject[$attribute_code] = '';
                        }
                        switch ($attribute_code) {
                            case 'BudgetSources':
                            case 'PM':
                                $aProject[$attribute_code] = '';
                                break;
                            default:
                                echo "unknown attribute code:$attribute_code<br>\n";
                        }
                    }
                }
                $aProjects[$projIdx] = $aProject;
                // echo "<pre>" . print_r($aProject, true) . "</pre>";
                //
                // echo "<hr>";
            }
            $sites[$key]['projects'] = $aProjects;
        }

        //echo "<pre>" . htmlentities(print_r($sites, true)) . "</pre>";

        return $sites;
    }

    public function updateProjectScopeAttributes($ProjectID, $requestData)
    {
        $aModelResult = [];
        $attributes = $this->getAttributesArray('projects');
        foreach ($requestData as $attributeCode => $attributeCodeValue) {
            //echo $attributeCode . ':' . (is_array($attributeCodeValue) ? print_r($attributeCodeValue, true) : $attributeCodeValue).PHP_EOL;
            if (preg_match("/material_needed_and_cost/", $attributeCode)) {
                if ($attributeCode === 'material_needed_and_cost') {
                    $aRows = [];
                    if (isset($requestData['material_needed_and_cost[material]'])) {
                        foreach ($requestData['material_needed_and_cost[material]'] as $key => $materialNeeded) {
                            if ($materialNeeded !== '') {
                                $aRows[] = [$materialNeeded, $requestData['material_needed_and_cost[cost]'][$key]];
                            }
                        }
                    } elseif (isset($requestData['material_needed_and_cost'])) {
                        $attributeCodeValue = $requestData['material_needed_and_cost'];
                    }
                    if (!empty($aRows)) {
                        $attributeCodeValue = $aRows;
                    }
                } else {
                    continue;
                }
            } elseif ($attributeCode === 'project_attachments') {
                continue;
            } elseif (preg_match("/budget_sources/", $attributeCode)) {
                if ($attributeCode === 'budget_sources') {
                    $aRows = [];
                    if (isset($requestData['budget_sources[source]'])) {
                        foreach ($requestData['budget_sources[source]'] as $key => $budgetSourceId) {
                            if ($budgetSourceId !== '') {
                                $aBudgetData = ['ProjectID'=>$ProjectID,
                                    'BudgetSource'=>$budgetSourceId,
                                    'BudgetAmount'=>$requestData['budget_sources[amount]'][$key],
                                    'Status'=>$requestData['budget_sources[status]'][$key],
                                    'Comments'=>$requestData['budget_sources[comment]'][$key]];

                                $budgetId = $requestData['budget_sources[budgetid]'][$key];
                                if($budgetId === 'new'){
                                    $budgetModel = new Budget();
                                } else {
                                    $budgetModel = Budget::findOrFail($budgetId);
                                }
                                $budgetModel->fill($aBudgetData);
                                $aModelResult["{$attributeCode}_{$budgetId}_{$key}"] = $budgetModel->save();
                            }
                        }
                    } elseif (isset($requestData['material_needed_and_cost'])) {
                        $attributeCodeValue = $requestData['material_needed_and_cost'];
                    }
                    if (!empty($aRows)) {
                        $attributeCodeValue = $aRows;
                    }
                }
                continue;

            } else {
                $a = self::searchArrayValueRecursiveByKeyValue('attribute_code', $attributeCode, $attributes);
                if($a){
                    $aAttributeRecord = current(current($a));
                    if($aAttributeRecord['input'] === 'bool' && is_array($attributeCodeValue)){
                        $attributeCodeValue = current($attributeCodeValue);
                    }
                }
            }

            if (is_array($attributeCodeValue)) {
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
                    if ($table_field_type === 'int' || $table_field_type === 'decimal') {
                        // Do not try to insert values that the user hasn't filled in or is incorrect
                        if(!is_numeric($attributeCodeValue)){
                            continue;
                        }
                    }
                    if ($model === null) {
                        try {
                            $aModelResult[$attributeCode . '_insert__' . $table] = DB::table($table)->insert(
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
                            echo $attributeCode . ":" . $attributeCodeValue . PHP_EOL;
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

                            $aModelResult[$attributeCode . '_update__' . $table] = $model->save();
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

        return $aModelResult;
    }

    /**
     * @param $ProjectID
     * @param $requestData
     * @param $projectModel
     * @param $projectModelData
     *
     * @return bool
     */
    public function updateProjectScope($ProjectID, $requestData, $projectModel, $projectModelData)
    {
        // echo 'updateProjectScope'. PHP_EOL;
        // echo '$ProjectID:'. $ProjectID. PHP_EOL;
        // echo '$projectModel->toArray():' . print_r($projectModel->toArray(), true) . PHP_EOL;
        // echo '$projectModelData:' . print_r($projectModelData, true) . PHP_EOL;
        // echo '$requestData:' . print_r($requestData, true) . PHP_EOL;
        $aModelResult = $this->updateProjectScopeAttributes($ProjectID, $requestData);

        $projectModel->fill($projectModelData);
        $projectModelSuccess = $projectModel->save();

        return !preg_grep("/0/", $aModelResult) && $projectModelSuccess;
    }

    /**
     * @param $requestData
     * @param $projectModel
     * @param $projectModelData
     *
     * @return bool
     */
    public function createProjectScope($requestData, &$projectModel, $projectModelData)
    {
        $projectModel->fill($projectModelData);
        $projectModelSuccess = $projectModel->save();
        $ProjectID = $projectModel->ProjectID;
        //echo '$ProjectID:'. $ProjectID. PHP_EOL;
        //print_r($requestData);
        // echo "\$ProjectID:$ProjectID\n";
        // echo '$projectModel->toArray():' . print_r($projectModel->toArray(), true) . PHP_EOL;
        // echo '$projectModelData:' . print_r($projectModelData, true) . PHP_EOL;
        // echo '$requestData:' . print_r($requestData, true) . PHP_EOL;
        $aModelResult = $this->updateProjectScopeAttributes($ProjectID, $requestData);

        return !preg_grep("/0/", $aModelResult) && $projectModelSuccess;
    }

    public function getInitialProjectScopeAttributeData()
    {
        $aProject = [];
        // Get all attributes related to projects
        $aAttributes = $this->getAttributesArray('projects');
        //print_r($aAttributes);
        // Set every attribute into the project with its default value
        foreach ($aAttributes as $aAttribute) {
            if ($aAttribute['table_field_type'] === 'int') {
                $aAttribute['default_value'] = $aAttribute['default_value'] !== '' ? (int) $aAttribute['default_value'] : $aAttribute['default_value'];
            } else {
                if ($aAttribute['table_field_type'] === 'decimal') {
                    $aAttribute['default_value'] = $aAttribute['default_value'] !== '' ? (float) $aAttribute['default_value'] : $aAttribute['default_value'];
                }
            }
            $aProject[$aAttribute['attribute_code']] = $aAttribute['default_value'];
        }

        return $aProject;
    }

    public function setProjectScopeAttributeDataDefaults($aProject)
    {
        $aDefaults = $this->getInitialProjectScopeAttributeData();

        // print_r($aDefaults);
        array_walk(
            $aProject,
            function (&$val, $key) use ($aDefaults) {
                $snakeCase = \Illuminate\Support\Str::snake($key);
                //echo "key:{$key}, snakeCase:{$snakeCase}, val:{$val}".PHP_EOL;
                if ($val === null && isset($aDefaults[strtolower($key)])) {
                    $val = $aDefaults[strtolower($key)];
                } else {
                    if ($val === null && isset($aDefaults[$snakeCase])) {
                        $val = $aDefaults[$snakeCase];
                    }
                }
            }

        );

        return $aProject;
    }

    public function getProject($ProjectID, $bReturnArr = true)
    {
        $aProject = [];

        try {
            // Get project record or just default record data
            if ($ProjectID === 'new') {
                $projectScope = $this->getDefaultRecordData();
                $bHasAttachments = false;
                $budgetSources = json_encode([]);
            } else {
                $projectScope = ProjectScope::findOrFail($ProjectID)->toArray();
                $aProjectAttachment = ProjectAttachment::where('ProjectID','=',$ProjectID)->get()->toArray();
                $bHasAttachments = count($aProjectAttachment)>0;
                $aBudgets = Budget::where('ProjectID','=',$ProjectID)->get()->toArray();
                $budgetSources = json_encode($aBudgets);
                //(SELECT GROUP_CONCAT(distinct BudgetID SEPARATOR ',') FROM budgets where budgets.ProjectID = projects.ProjectID and budgets.deleted_at is null) as BudgetSources
            }
            // Get all attributes related to projects
            $initialData = $this->getInitialProjectScopeAttributeData();
            $aProject = array_merge(
                [
                    'ProjectID' => $projectScope['ProjectID'],
                    'SiteStatusID' => $projectScope['SiteStatusID'],
                    'HasAttachments' => $bHasAttachments,
                    'Active' => $projectScope['Active'],
                    'SequenceNumber' => $projectScope['SequenceNumber'],
                    'OriginalRequest' => $projectScope['OriginalRequest'],
                    'ProjectDescription' => $projectScope['ProjectDescription'],
                    'Comments' => $projectScope['Comments'],
                ],
                $initialData
            );

            // Get any attribute values set for this project and populate the result
            if ($ProjectID !== 'new') {
                foreach ($this->aAttributeTables as $tableCode => $tableModelClass) {
                    $aAttributeTableData = $tableModelClass::join(
                        'attributes',
                        'attributes.id',
                        '=',
                        $tableCode . '.attribute_id'
                    )->where($tableCode . '.project_id', $ProjectID)->get()->toArray();
                    foreach ($aAttributeTableData as $aAttributeTableDatum) {
                        //echo $aAttributeTableDatum['attribute_code'] . ':' . $aAttributeTableDatum['value'] . PHP_EOL;
                        $aProject[$aAttributeTableDatum['attribute_code']] = $aAttributeTableDatum['value'];
                    }
                }
            }
            $aProject['team'] = [];
            // Add any project contacts
            $projectVolunteerRole = new ProjectVolunteerRole();
            if ($ProjectID !== 'new' && $team = $projectVolunteerRole->getProjectTeam($ProjectID)) {
                foreach ($team as $teamMember) {
                    if ($teamMember['Active']) {
                        $aProject['team'][] = $teamMember;
                    }
                }
            }

            $aProject['contacts'] = [];
            // Add any project contacts
            if ($ProjectID !== 'new' && $c = ProjectScope::find($ProjectID)->contacts) {
                $contacts = $c->toArray();
                foreach ($contacts as $contact) {
                    if ($contact['Active']) {
                        $aProject['contacts'][] = $contact['ContactID'];
                    }
                }
            }
            $aProject['project_attachments'] = [];
            if ($ProjectID !== 'new' && $attachments = ProjectScope::find($ProjectID)->attachments) {
                $attachments = $attachments->toArray();
                foreach ($attachments as $attachment) {
                    if (\preg_match("/^.*\/storage\/app/", $attachment['AttachmentPath'])) {
                        $attachment['AttachmentPath'] = preg_replace(
                            "/^.*\/storage\/app/",
                            "/admin/project_attachment/stream/storage/app",
                            $attachment['AttachmentPath']
                        );
                    }
                    $aProject['project_attachments'][$attachment['ProjectAttachmentID']] =
                        $attachment['AttachmentPath'];
                }
            }
            $aProject['project_attachments'] = json_encode($aProject['project_attachments']);
            // print_r($aProject);
            $aProject['budget_sources'] = $budgetSources;
        } catch (Exception $e) {
            echo $e->getMessage();
        }

        return $aProject;
    }

    public static function getProjectScopeBaseQueryModelWithAttributes($bIncludeSiteName = false,
                                                                       $bSkipOrderBySequence = false)
    {
        $projectScope = new ProjectScope();
        $sSqlVolunteersAssigned = $projectScope->getVolunteersAssignedSql();
        $aSelectColumns = [
            'projects.ProjectID',
            'projects.SiteStatusID',
            'projects.Active',
            'projects.SequenceNumber',
            'projects.OriginalRequest',
            'projects.ProjectDescription',
            'projects.Comments',
            DB::raw(
                '(SELECT GROUP_CONCAT(distinct BudgetID SEPARATOR \',\') FROM budgets where budgets.ProjectID = projects.ProjectID and budgets.deleted_at is null) as BudgetSources'
            ),
            DB::raw(
                "{$sSqlVolunteersAssigned} as VolunteersAssigned"
            ),
            DB::raw(
                '(select COUNT(*) from project_attachments where project_attachments.ProjectID = projects.ProjectID) AS `HasAttachments`'
            ),
        ];
        if ($bIncludeSiteName) {
            array_unshift($aSelectColumns, 'sites.SiteName');
        }


        $aExcludeAttributeCodes =['budget_sources', 'project_attachments'];
        $aSelectColumns = array_merge($aSelectColumns, self::getAttributesSelectColumns('projects',
                                                                                    $aExcludeAttributeCodes));
        /** @var ProjectScope $projectScope */
        $projectScope = self::select(...$aSelectColumns);
        $projectScope->join('site_status', 'projects.SiteStatusID', '=', 'site_status.SiteStatusID');
        if ($bIncludeSiteName) {
            $projectScope->join('sites', 'sites.SiteID', '=', 'site_status.SiteID');
        }
        $projectScope = self::leftJoinAttributes($projectScope,'projects','ProjectID','project_id',
                                                 $aExcludeAttributeCodes);
        $projectScope->whereNull('projects.deleted_at')->whereNull('site_status.deleted_at')->where(
            'projects.Active',
            1
        );
        if (!$bSkipOrderBySequence) {
            $projectScope->orderBy(
                'projects.SequenceNumber',
                'asc'
            );
        }

        /*echo '<pre>' .
                     \Illuminate\Support\Str::replaceArray('?', $projectScope->getBindings(), $projectScope->toSql()) .
                     '</pre>';/**/

        return $projectScope;
    }

    public function getAllProjects()
    {
        $projectScope = $this->getProjectScopeBaseQueryModelWithAttributes();
        $projectScope->where(
            'site_status.Year',
            self::_getCurrentYear()
        );
        //echo '<pre>' . \Illuminate\Support\Str::replaceArray('?', $projectScope->getBindings(), $projectScope->toSql()) . '</pre>';
        $all_projects = $projectScope->get()->toArray();

        // echo '<pre>' . print_r($all_projects, true) . '</pre>';
        return $all_projects;
    }

    public function convertRowDataToAttributeData()
    {
        $bAllow = false;
        if ($bAllow) {
            ini_set("max_execution_time", "0");// foreach (array_keys($this->aAttributeTables) as $t) {
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
            $aYears = [2017, 2018, 2019];//$aYears = [2019,2020];
            foreach ($aYears as $Year) {
                $projects = $this->getProjectsByYear($Year, $bReturnArr = true);
                //print_r($projects);
                foreach ($projects as $project) {
                    //print_r($project);
                    $projectId = $project['ProjectID'];
                    foreach ($aFieldMap as $field => $attributeCode) {
                        //echo $attributeCode.PHP_EOL;
                        $a = self::searchArrayValueRecursiveByKeyValue('attribute_code', $attributeCode, $attributes);

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
                                        $project[$field] = "$project[$field]";
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
    }

    public function updateProjectBackboneCollectionScript()
    {
        $defaultColumnDefinitions = <<<DEFAULT_COLS
        {
            // name is a required parameter, but you don't really want one on a select all column
            name: "",
            label: "",
            // Backgrid.Extension.SelectRowCell lets you select individual rows
            cell: "select-row",
            // Backgrid.Extension.SelectAllHeaderCell lets you select all the row on a page
            headerCell: "select-all",
            resizeable: false,
            orderable: false,
            width: "30",
            displayOrder: displayOrderCnt++
        },
        {
            name: "ProjectID",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return '<input title="' + rawValue + '" type="radio" name="ProjectID" value="' + rawValue + '" />';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30",
            displayOrder: displayOrderCnt++
        },
        {
            name: "HasAttachments",
            label: "   ",
            formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                fromRaw: function (rawValue) {
                    return rawValue ? '<i class="fa fa-paperclip" aria-hidden="true"></i>' : '';
                    //You can use rawValue to custom your html, you can change this value using the name parameter.
                }
            }),
            cell: "html",
            editable: false,
            resizeable: false,
            orderable: false,
            width: "30",
            displayOrder: displayOrderCnt++
        },
        {
            name: "Active",
            label: "Active",
            cell: App.Vars.yesNoCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "SequenceNumber",
            label: "Project ID",
            cell: "integer",
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "50",
            displayOrder: displayOrderCnt++
        },
        {
            name: "OriginalRequest",
            label: "Original Request",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            displayOrder: displayOrderCnt++
        },
        {
            name: "ProjectDescription",
            label: "Project Description",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: false,
            width: "250",
            displayOrder: displayOrderCnt++
        },
        {
            name: "Comments",
            label: "Comments",
            cell: App.Vars.TextareaCell,
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "250",
            displayOrder: displayOrderCnt++
        },
DEFAULT_COLS;
        $colDefinitionTemplate = <<<COL_TEMPLATE
        {
            name: "{{NAME}}",
            label: "{{LABEL}}",
            cell: {{CELL_TYPE}},
            editable: App.Vars.Auth.bCanEditProjectGridFields,
            resizeable: App.Vars.bAllowManagedGridColumns,
            orderable: App.Vars.bAllowManagedGridColumns,
            width: "{{WIDTH}}",
            displayOrder: displayOrderCnt++
        },
COL_TEMPLATE;
        $cellTypeTemplate = <<<CELL_TYPE_TEMPLATE
let {{SELECT_OPTION_SOURCE}}Cell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.projectModel.get{{SELECT_OPTION_SOURCE}}(false)
        }]

    });
CELL_TYPE_TEMPLATE;

        $projectModelOptionsMethodTemplate = <<<OPTIONS_TEMPLATE
get{{SELECT_OPTION_SOURCE}}: function (bReturnHtml, defaultOption) {
            let options = _.pairs(App.Vars.selectOptions['{{SELECT_OPTION_SOURCE}}']);

            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    let selected = !_.isUndefined(defaultOption) && defaultOption === value[0] ? 'selected' : '';
                    return "<option " + selected + " value='" + value[1] + "'>" + value[0] + "</option>";
                }).join('');
            } else {
                return options;
            }
        },
OPTIONS_TEMPLATE;
        $sharedCellTypeCode = "bIsApplicable: true,
                        enterEditMode: function () {
                            var model = this.model;
                            var column = this.column;
                        
                            var editable = Backgrid.callByNeed(column.editable(), column, model);
                            editable = editable && !this.\$el.hasClass('attribute-not-applicable');
                            //console.log('enterEditMode',{id:model.get(model.idAttribute),editable:editable,bIsApplicable:this.bIsApplicable,classes:this.\$el.attr('class')})
                            if (editable) {
                        
                              this.currentEditor = new this.editor({
                                column: this.column,
                                model: this.model,
                                formatter: this.formatter
                              });
                        
                              model.trigger('backgrid:edit', model, column, this, this.currentEditor);
                        
                              // Need to redundantly undelegate events for Firefox
                              this.undelegateEvents();
                              this.\$el.empty();
                              this.\$el.append(this.currentEditor.\$el);
                              this.currentEditor.render();
                              this.\$el.addClass('editor');
                        
                              model.trigger('backgrid:editing', model, column, this, this.currentEditor);
                            }
                        },
                    render: function () {
                        var \$el = this.\$el;
                        \$el.empty();
                        var model = this.model;
                        var columnName = this.column.get('name');
                        let skillIds = []
                        let primarySkillNeeded = model.get('primary_skill_needed');
                        if (primarySkillNeeded.match(/^\[.*\]$/)) {
                            skillIds = JSON.parse(primarySkillNeeded);
                        } else {
                            // look for old non-json values from before
                            primarySkillNeeded = primarySkillNeeded.replace(/\"/g,'');
                            if(primarySkillNeeded.match(/,/)){
                                skillIds = primarySkillNeeded.split(',');
                            } else {
                                if (primarySkillNeeded.trim() !== '') {
                                    skillIds.push(primarySkillNeeded);
                                }
                            }
    
                        }
                        let aAttributeCodes = App.Models.projectAttributesModel.getAttributeCodesByProjectSkillNeededOptionIds(skillIds);
                        let bIsApplicable = _.indexOf(aAttributeCodes,columnName,true) !== -1;
                        if(!bIsApplicable){
                            \$el.addClass('attribute-not-applicable');
                            \$el.attr('title','Not applicable to this project');
                        } else {
                            \$el.removeClass('attribute-not-applicable');
                            \$el.removeAttr('title');
                        }
                        
                        \$el.text(this.formatter.fromRaw(model.get(columnName), model));
                        \$el.addClass(columnName);
                        this.updateStateClassesMaybe();
                        this.delegateEvents();
                        //console.log('Cell render 1',{el:\$el,model:model,id:model.get(model.idAttribute),attribute_code:columnName,aAttributeCodes:aAttributeCodes,bIsApplicable:bIsApplicable,classes:this.\$el.attr('class'),this:this});
                        return this;
                    }";

        $monospacedFontWidth = 6;
        $aDefaultTableInputTypeColumnWidths = [];
        $aDefaultTableInputTypeColumnWidths['bool'] = '50';
        $aDefaultTableInputTypeColumnWidths['text'] = '255';
        $aDefaultTableInputTypeColumnWidths['textarea'] = '255';
        $aDefaultTableInputTypeColumnWidths['table'] = '255';
        $aDefaultTableInputTypeColumnWidths['select'] = '125';
        $aDefaultTableInputTypeColumnWidths['checkbox'] = '50';
        $aDefaultTableInputTypeColumnWidths['number'] = '50';

        $sLessCss = '';
        $aDynamicCellTypes = [];
        $aDynamicCellOptionTypeProjectModelMethods = [];
        $dynamicCols = '';
        $aAttributes = $this->getAttributesArray('projects');
        $lessCellIdx = 9;
        $iAttributeCnt = count($aAttributes);
        foreach ($aAttributes as $idx => $aAttribute) {
            $col = str_replace('{{NAME}}', $aAttribute['attribute_code'], $colDefinitionTemplate);
            $col = str_replace('{{LABEL}}', $aAttribute['label'], $col);
            $cellType = '';
            switch ($aAttribute['input']) {
                case 'textarea':
                    $cellType = 'App.Vars.TextareaCell';
                    break;
                case 'bool':
                    $cellType = 'App.Vars.yesNoCell';
                    break;
                case 'select':
                    if ($aAttribute['attribute_code'] === 'project_send') {
                        $cellType = 'App.Vars.sendCell';
                    } elseif ($aAttribute['attribute_code'] === 'budget_sources') {
                        $cellType = 'App.Vars.budgetSourceCell';
                    } elseif ($aAttribute['attribute_code'] === 'status') {
                        $cellType = 'StatusCell';
                    } else {
                        if (!empty($aAttribute['options_source'])) {
                            $optionSourceName =
                                str_replace(' ', '', ucwords(str_replace('_', ' ', $aAttribute['options_source'])));
                            $aDynamicCellTypes[$aAttribute['attribute_code']] = str_replace(
                                '{{SELECT_OPTION_SOURCE}}',
                                $optionSourceName,
                                $cellTypeTemplate
                            );

                            $cellType = "{$optionSourceName}Cell";
                            $aDynamicCellOptionTypeProjectModelMethods[$aAttribute['attribute_code']] =
                                $optionSourceName;
                        }
                    }
                    break;
                case 'checkbox':
                    if ($aAttribute['attribute_code'] === 'primary_skill_needed') {
                        $cellType = 'SkillsNeededCell.extend()';
                    }
                    break;
                case 'number':
                    if ($aAttribute['table_field_type'] === 'decimal') {
                        $cellType = '"number"';
                        $cellType = "Backgrid.NumberCell.extend({
                        {$sharedCellTypeCode}
                    })";
                    } else {
                        $cellType = '"integer"';
                        $cellType = "Backgrid.IntegerCell.extend({
                        {$sharedCellTypeCode}
                    })";
                    }

                    break;
                default:
                    //$cellType = '"string"';
                    $cellType = "Backgrid.StringCell.extend({
                    {$sharedCellTypeCode}
                })";
            }
            $col = str_replace('{{CELL_TYPE}}', $cellType, $col);
            $labelStrlength = strlen($aAttribute['label']);
            $width =
                isset($aDefaultTableInputTypeColumnWidths[$aAttribute['input']]) ?
                    $aDefaultTableInputTypeColumnWidths[$aAttribute['input']] : $labelStrlength * $monospacedFontWidth;
            if (!in_array($aAttribute['input'], ['select', 'bool']) && $labelStrlength < $width) {
                $padding = 10;
                $width = ($labelStrlength * $monospacedFontWidth) + $padding;
            }
            if ($idx === ($iAttributeCnt - 1)) {
                $lessWidth = 'auto';
            } else {
                $lessWidth = "{$width}px";
            }
            $sLessCss .= "th:nth-child({$lessCellIdx}) {
                    width: {$lessWidth}; // {$aAttribute['label']}
                }\n";
            $lessCellIdx++;
            $col = str_replace('{{WIDTH}}', $width, $col);
            if (in_array(
                $aAttribute['attribute_code'],
                ['primary_skill_needed', 'material_needed_and_cost', 'budget_sources']
            )
            ) {
                $col = str_replace(
                    'editable: App.Vars.Auth.bCanEditProjectGridFields,',
                    'editable: false,',
                    $col
                );
            }
            $dynamicCols .= $col . PHP_EOL;
        }
        //echo $sLessCss;
        $compiledColumnDefinitions = $defaultColumnDefinitions . PHP_EOL . $dynamicCols;
        $appVarsDefinition =
            "App.Vars.projectsBackgridColumnDefinitions = [" . PHP_EOL . $compiledColumnDefinitions . PHP_EOL . "];";

        $projectModelPackageFile =
            base_path() . '/packages/dhayakawa/springintoaction/src/resources/assets/js/models/project.js';
        $projectModelPackageFileContents = file_get_contents($projectModelPackageFile);
        $projectCollectionPackageFile =
            base_path() . '/packages/dhayakawa/springintoaction/src/resources/assets/js/collections/project.js';
        $projectCollectionPackageFileContents = file_get_contents($projectCollectionPackageFile);
        $publicCollectionsFile = base_path() . "/public/js/springintoaction.collections.js";
        $publicModelsFile = base_path() . "/public/js/springintoaction.models.js";
        $updatedProjectCollectionPackageFileContents = $projectCollectionPackageFileContents;
        $projectsBackgridColumnDefinitionsRegex = "/App\.Vars\.projectsBackgridColumnDefinitions = \\[(.*?)\\];/ms";
        preg_match("{$projectsBackgridColumnDefinitionsRegex}", $projectCollectionPackageFileContents, $matches);
        if (count($matches) === 2) {
            //echo $matches[0] . PHP_EOL;
            $origAppVarsDefinition = $matches[0];
            //echo $appVarsDefinition . PHP_EOL;
            $updatedProjectCollectionPackageFileContents = preg_replace(
                "~//##STARTBACKGRIDCOLUMNDEFINITIONS.*//##ENDBACKGRIDCOLUMNDEFINITIONS~ms",
                "//##STARTBACKGRIDCOLUMNDEFINITIONS\n{$appVarsDefinition}\n//##ENDBACKGRIDCOLUMNDEFINITIONS",
                $updatedProjectCollectionPackageFileContents
            );
            $updatedProjectModelPackageFileContents = $projectModelPackageFileContents;
            foreach ($aDynamicCellTypes as $attributeCode => $dynamicCellType) {
                //echo $dynamicCellType . PHP_EOL;
                preg_match("/let \D+Cell = Backgrid\\.Extension\\.Select2Cell\\.extend/", $dynamicCellType, $matches);
                //echo "find cellType line to match in file:".print_r($matches, true).PHP_EOL;
                if (isset($matches[0])) {
                    preg_match("/{$matches[0]}/", $updatedProjectCollectionPackageFileContents, $aCellTypeMatches);
                    //echo "cellType found in file:". print_r($aCellTypeMatches, true) . PHP_EOL;
                    if (empty($aCellTypeMatches)) {
                        $updatedProjectCollectionPackageFileContents = str_replace(
                            '//##DYNAMIC_CELL_TYPES',
                            $dynamicCellType . PHP_EOL . PHP_EOL . '//##DYNAMIC_CELL_TYPES',
                            $updatedProjectCollectionPackageFileContents
                        );
                    }
                }
                if (isset($aDynamicCellOptionTypeProjectModelMethods[$attributeCode])) {
                    $searchStr =
                        "get{$aDynamicCellOptionTypeProjectModelMethods[$attributeCode]}: function \(bReturnHtml, defaultOption\)";
                    preg_match("/{$searchStr}/", $projectModelPackageFileContents, $aProjectModelMethodMatches);
                    //echo "\$aProjectModelMethodMatches found in file:" . print_r($aProjectModelMethodMatches, true) . PHP_EOL;
                    if (empty($aProjectModelMethodMatches)) {
                        $newMethod = str_replace(
                            '{{SELECT_OPTION_SOURCE}}',
                            $aDynamicCellOptionTypeProjectModelMethods[$attributeCode],
                            $projectModelOptionsMethodTemplate
                        );
                        $updatedProjectModelPackageFileContents = str_replace(
                            '});',
                            $newMethod . PHP_EOL . '});',
                            $updatedProjectModelPackageFileContents
                        );
                    }
                }
            }

            if ($updatedProjectCollectionPackageFileContents !== $projectCollectionPackageFileContents) {
                //echo "project collection package was updated:" . $updatedProjectModelPackageFileContents;
                \file_put_contents($projectCollectionPackageFile, $updatedProjectCollectionPackageFileContents);
                $publicCollectionsFileContents = \file_get_contents($publicCollectionsFile);
                $publicCollectionsFileContentsRegex =
                    "/\\(function \\(App\\) {\s+App\\.Collections\\.Project = (.*?)}\\)\\(window\\.App\\);/ms";
                preg_match(
                    "{$publicCollectionsFileContentsRegex}",
                    $publicCollectionsFileContents,
                    $publicCollectionMatches
                );
                //echo '$publicCollectionMatches:'. print_r($publicCollectionMatches, true);
                //echo $publicCollectionsFileContents;
                if (!empty($publicCollectionMatches) && count($publicCollectionMatches) === 2) {
                    $updatedPublicCollectionsFileContents = preg_replace(
                        "{$publicCollectionsFileContentsRegex}",
                        $updatedProjectCollectionPackageFileContents,
                        $publicCollectionsFileContents
                    );
                    \file_put_contents(
                        base_path() . "/public/js/springintoaction.collections.js",
                        $updatedPublicCollectionsFileContents
                    );
                }
                if (!empty($sLessCss)) {
                    $lessFilePath =
                        base_path() . '/packages/dhayakawa/springintoaction/src/resources/assets/less/sia_app.less';
                    $lessFileContents = \file_get_contents($lessFilePath);
                    $lessFileRegex = "~//BEGIN_DYNAMIC_CELLS(.*?)//END_DYNAMIC_CELLS~ms";
                    preg_match($lessFileRegex, $lessFileContents, $aLessMatches);
                    if (count($aLessMatches) === 2) {
                        if ($sLessCss !== $aLessMatches[1]) {
                            $updatedLessFileContents = preg_replace(
                                $lessFileRegex,
                                '//BEGIN_DYNAMIC_CELLS' . PHP_EOL . $sLessCss . PHP_EOL . '//END_DYNAMIC_CELLS',
                                $lessFileContents
                            );
                            \file_put_contents($lessFilePath, $updatedLessFileContents);
                        }
                    }
                }
            }
            if ($updatedProjectModelPackageFileContents !== $projectModelPackageFileContents) {
                //echo "project model was updated:" . $updatedProjectModelPackageFileContents;
                \file_put_contents($projectModelPackageFile, $updatedProjectModelPackageFileContents);
                $publicModelsFileContents = \file_get_contents($publicModelsFile);
                $publicModelsFileContentsRegex =
                    "/\\(function \\(App\\) {\s+App\\.Models\\.Project = (.*?)}\\)\\(window\\.App\\);/ms";
                preg_match(
                    "{$publicModelsFileContentsRegex}",
                    $publicModelsFileContents,
                    $publicModelsMatches
                );
                //echo '$publicCollectionMatches:'. print_r($publicCollectionMatches, true);
                //echo $publicModelsFileContents;
                if (!empty($publicModelsMatches) && count($publicModelsMatches) === 2) {
                    $updatedPublicModelsFileContents = preg_replace(
                        "{$publicModelsFileContentsRegex}",
                        $updatedProjectModelPackageFileContents,
                        $publicModelsFileContents
                    );
                    \file_put_contents(
                        $publicModelsFile,
                        $updatedPublicModelsFileContents
                    );
                }
            }
        }
    }

    private function dropOldFields()
    {
        $sql = <<<SQL
alter table projects drop column BudgetSources;

alter table projects drop column ChildFriendly;

alter table projects drop column PrimarySkillNeeded;

alter table projects drop column VolunteersNeededEst;

alter table projects drop column Status;

alter table projects drop column StatusReason;

alter table projects drop column MaterialsNeeded;

alter table projects drop column EstimatedCost;

alter table projects drop column ActualCost;

alter table projects drop column BudgetAvailableForPC;

alter table projects drop column VolunteersLastYear;

alter table projects drop column NeedsToBeStartedEarly;

alter table projects drop column PCSeeBeforeSIA;

alter table projects drop column SpecialEquipmentNeeded;

alter table projects drop column PermitsOrApprovalsNeeded;

alter table projects drop column PrepWorkRequiredBeforeSIA;

alter table projects drop column SetupDayInstructions;

alter table projects drop column SIADayInstructions;

alter table projects drop column Area;

alter table projects drop column PaintOrBarkEstimate;

alter table projects drop column PaintAlreadyOnHand;

alter table projects drop column PaintOrdered;

alter table projects drop column CostEstimateDone;

alter table projects drop column MaterialListDone;

alter table projects drop column BudgetAllocationDone;

alter table projects drop column VolunteerAllocationDone;

alter table projects drop column NeedSIATShirtsForPC;

alter table projects drop column ProjectSend;

alter table projects drop column FinalCompletionStatus;

alter table projects drop column FinalCompletionAssessment;


SQL;
    }
}
