<?php

namespace Dhayakawa\SpringIntoAction\Controllers;

use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
//use Illuminate\Support\Facades\Config;
use Dhayakawa\SpringIntoAction\Controllers\GroveApi;
use Dhayakawa\SpringIntoAction\Models\AnnualBudget;
use Dhayakawa\SpringIntoAction\Models\Attribute;
use Dompdf\Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;

use Dhayakawa\SpringIntoAction\Models\SiteSetting;
use Dhayakawa\SpringIntoAction\Models\Project;
use Dhayakawa\SpringIntoAction\Models\Site;
use Dhayakawa\SpringIntoAction\Models\SiteStatus;
use Dhayakawa\SpringIntoAction\Models\ProjectContact;
use Dhayakawa\SpringIntoAction\Models\Contact;
use Dhayakawa\SpringIntoAction\Models\Budget;
use Dhayakawa\SpringIntoAction\Models\ProjectRole;
use Dhayakawa\SpringIntoAction\Models\SiteRole;
use Dhayakawa\SpringIntoAction\Models\SiteVolunteerRole;
use Dhayakawa\SpringIntoAction\Models\Volunteer;
use Dhayakawa\SpringIntoAction\Models\ProjectVolunteer;
use Dhayakawa\SpringIntoAction\Models\ProjectVolunteerRole;
use Dhayakawa\SpringIntoAction\Models\WhenWillProjectBeCompletedOptions;
use \Dhayakawa\SpringIntoAction\Models\BudgetSourceOptions;
use \Dhayakawa\SpringIntoAction\Models\BudgetStatusOptions;
use \Dhayakawa\SpringIntoAction\Models\ProjectSkillNeededOptions;
use \Dhayakawa\SpringIntoAction\Models\ProjectStatusOptions;
use \Dhayakawa\SpringIntoAction\Models\SendStatusOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerAgeRangeOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerPrimarySkillOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerSkillLevelOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerStatusOptions;
use Dhayakawa\SpringIntoAction\Models\PermitRequiredStatusOptions;
use Dhayakawa\SpringIntoAction\Models\PermitRequiredOptions;
use Dhayakawa\SpringIntoAction\Models\SiteVolunteer;
use Dhayakawa\SpringIntoAction\Models\ProjectScope;
use Dhayakawa\SpringIntoAction\Models\ProjectAttribute;
use Dhayakawa\SpringIntoAction\Models\Workflow;
use \Laratrust\LaratrustPermission;
use \Laratrust\LaratrustRole;

#PHPStormUSEMARKER
class SpringIntoActionMainAppController extends BaseController
{

    public function index(Request $request)
    {
        if ($_SERVER['REMOTE_ADDR'] === '66.190.13.203') {
            $this->parseBackups();
        }
        $this->testGroup();

        /*echo '<pre>' .
             \Illuminate\Support\Str::replaceArray('?', $projectScope->getBindings(), $projectScope->toSql()) .
             '</pre>';*/
        // password
        //echo bcrypt('jack1455');
        $user = Auth::user();
        $ProjectAttribute = new ProjectAttribute();
        //$ProjectAttribute->reset();
        $aPermissionNames = LaratrustPermission::select('name')->get()->toArray();
        $auth = [];
        foreach ($aPermissionNames as $permission) {
            $key = 'bCan' . str_replace(' ', '', ucwords(str_replace('_', ' ', $permission['name'])));

            $auth[$key] = Auth::guard()->user()->ability(['admin'], [$permission['name']]);
        }

        $aRoleNames = LaratrustRole::select('name')->get()->toArray();
        foreach ($aRoleNames as $role) {
            $key = 'bIs' . str_replace(' ', '', ucwords(str_replace('_', ' ', $role['name'])));

            $auth[$key] = Auth::guard()->user()->hasRole($role['name']);
        }
        if ($auth['bIsAdmin'] || $auth['bIsProjectManager']) {
            $pmSite = new Site();
            if ($auth['bIsProjectManager']) {
                $projectManagerVolunteer = Volunteer::where('email', $user->email)->get();

                if (empty($projectManagerVolunteer->toArray())) {
                    $model = new Volunteer();
                    $contactInfo = [
                        'Email' => $user->email,
                        'FirstName' => $user->first_name,
                        'LastName' => $user->last_name,
                    ];
                    $defaultData = $model->getDefaultRecordData();
                    $contactInfo = array_merge($defaultData, $contactInfo);
                    $contactInfo['Active'] = 1;
                    $contactInfo['Status'] = 5;
                    $contactInfo['FullName'] = "{$contactInfo['FirstName']} {$contactInfo['LastName']}";

                    if (isset($contactInfo['PreferredSiteID']) && $contactInfo['PreferredSiteID'] === '') {
                        $contactInfo['PreferredSiteID'] = 0;
                    }
                    if (isset($contactInfo['ResponseID']) && $contactInfo['ResponseID'] === '') {
                        $contactInfo['ResponseID'] = 0;
                    }
                    if (isset($contactInfo['TeamLeaderWilling']) && $contactInfo['TeamLeaderWilling'] === '') {
                        $contactInfo['TeamLeaderWilling'] = 0;
                    }
                    $contactInfo['IndividualID'] = empty($contactInfo['groveId']) ? 0 : $contactInfo['groveId'];
                    array_walk(
                        $contactInfo,
                        function (&$value, $key) {
                            if (is_string($value)) {
                                $value = \urldecode($value);
                            }
                            if ($key === 'groveId') {
                                $value = (int) $value;
                            }
                        }
                    );

                    $model->fill($contactInfo);
                    $model->save();
                    $projectManagerVolunteer = Volunteer::where('email', $user->email)->get();
                }
                $projectManagerVolunteer = $projectManagerVolunteer->toArray();
                $project_manager_sites =
                    isset($projectManagerVolunteer[0]) ?
                        $pmSite->getVolunteerSites($projectManagerVolunteer[0]['VolunteerID'], 2) : [];
                // print_r($projectManagerVolunteer);
                // print_r($project_manager_sites);
            } else {
                $project_manager_sites =
                    SiteStatus::join('sites', 'sites.SiteID', '=', 'site_status.SiteID')->where(
                        'Year',
                        $this->getCurrentYear()
                    )->get()->toArray();
            }
            $project_manager_projects = [];
            foreach ($project_manager_sites as $project_manager_site) {
                $project_manager_projects[$project_manager_site['SiteStatusID']] =
                    Project::getSiteProjects($project_manager_site['SiteStatusID'], true);
            }
            $project_scopes = reset($project_manager_projects);
            $project_scope = $project_scopes && isset($project_scopes[0]) ? $project_scopes[0] : [];
        }
        //$this->fixProjectData();
        $year = $request->input('year');
        if (!$year) {
            $yearNow = date('Y');
            $month = date('n');

            // need to make sure the year is for the upcoming/next spring
            // or this spring if the month is less than may
            $Year = $month > 5 ? $yearNow + 1 : $yearNow;
        } else {
            $Year = $year;
        }
        try {
            $site_settings = SiteSetting::get()->toArray();
        } catch (\Exception $e) {
            report($e);
            $site_settings = [];
        }
        try {
            $sites = Site::orderBy('SiteName', 'asc')->get()->toArray();
            // Automatically create the site status for a new year
            foreach ($sites as $aSite) {
                try {
                    $tmpSite = Site::findOrFail($aSite['SiteID'])->status()->where('Year', $Year)->get()->toArray();
                    if (empty($tmpSite)) {
                        $siteStatusRecordData = [
                            'SiteID' => $aSite['SiteID'],
                            'Year' => $Year,
                            'ProjectDescriptionComplete' => 0,
                            'BudgetEstimationComplete' => 0,
                            'VolunteerEstimationComplete' => 0,
                            'VolunteerAssignmentComplete' => 0,
                            'BudgetActualComplete' => 0,
                            'EstimationComments' => '',
                            'created_at' => '',
                            'updated_at' => '',
                        ];
                        $oSiteStatus = new SiteStatus();
                        $oSiteStatus->fill($siteStatusRecordData);
                        $oSiteStatus->save();
                    }
                } catch (\Exception $e) {
                    report($e);
                }
            }
            $siteStatusRecordData = null;
            unset($siteStatusRecordData);
            $oSiteStatus = null;
            unset($oSiteStatus);
            $tmpSite = null;
            unset($tmpSite);
            $site = current($sites);
        } catch (\Exception $e) {
            $sites = [];
            $site = [];
            report($e);
        }
        try {
            $siteStatus = current(
                Site::find($site['SiteID'])->status()->where('Year', $Year)->orderBy('Year', 'desc')->get()->toArray()
            );
        } catch (\Exception $e) {
            $siteStatus = [];
            report($e);
        }

        try {
            $site_years =
                SiteStatus::select('SiteStatusID', 'SiteID', 'Year')->where('SiteID', $site['SiteID'])->orderBy(
                    'Year',
                    'desc'
                )->get()->toArray();
        } catch (\Exception $e) {
            $site_years = [];
            report($e);
        }
        try {
            $model = new SiteVolunteerRole();
            $site_volunteers = $model->getSiteVolunteers($siteStatus['SiteStatusID']);
            $site_volunteer = current($site_volunteers);
        } catch (\Exception $e) {
            $site_volunteers = [];
            $site_volunteer = [];
            report($e);
        }
        try {
            $projects = ProjectScope::getSiteProjects($siteStatus['SiteStatusID'], true);

            $project = current($projects);

            $projects_dropdown = Project::select('projects.ProjectID', 'projects.SequenceNumber')->join(
                'site_status',
                'projects.SiteStatusID',
                '=',
                'site_status.SiteStatusID'
            )->where('site_status.SiteStatusID', $siteStatus['SiteStatusID'])->orderBy(
                'projects.SequenceNumber',
                'asc'
            )->whereNull('projects.deleted_at')->whereNull('site_status.deleted_at')->get()->toArray();
        } catch (\Exception $e) {
            $projects = [];
            $project = [];
            report($e);
        }
        $projectModel = new Project();
        $sSqlVolunteersAssigned = $projectModel->getVolunteersAssignedSql();
        try {
            $all_projects = Project::select(
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
            )
                                   ->join('site_status', 'projects.SiteStatusID', '=', 'site_status.SiteStatusID')
                                   ->where(
                                       'site_status.Year',
                                       $Year
                                   )
                                   ->whereNull('projects.deleted_at')
                                   ->whereNull('site_status.deleted_at')
                                   ->where('projects.Active', 1)
                                   ->orderBy('projects.SequenceNumber', 'asc')
                                   ->get()
                                   ->toArray();
            $ps = new ProjectScope();
            $all_projects = $ps->getAllProjects();
        } catch (\Exception $e) {
            $all_projects = [];

            report($e);
        }
        $projectScopeModel = new ProjectScope();
        $status_management_records = $projectScopeModel->getStatusManagementRecords();
        try {
            $contacts = Site::find($site['SiteID'])->contacts;
            $contacts = $contacts ? $contacts->toArray() : [];
        } catch (\Exception $e) {
            $contacts = [];
            report($e);
        }
        try {
            $all_contacts = Contact::orderBy('LastName', 'asc')->distinct()->get();
            $all_contacts = $all_contacts ? $all_contacts->toArray() : [];
        } catch (\Exception $e) {
            $all_contacts = [];
            report($e);
        }

        try {
            $model = new ProjectVolunteerRole();
            $project_leads = $model->getProjectTeam($project['ProjectID']);
        } catch (\Exception $e) {
            $project_leads = [];
            if (!empty($project)) {
                report($e);
            }
        }
        try {
            $projectContact = new ProjectContact();
            $project_contacts = $projectContact->getProjectContacts($project['ProjectID']);
            $project_contacts = $project_contacts ?: [];
        } catch (\Exception $e) {
            $project_contacts = [];
            if (!empty($project)) {
                report($e);
            }
        }
        try {
            $model = new ProjectVolunteer();
            $project_volunteers = $model->getProjectVolunteers($project['ProjectID']);
            $project_volunteers = $project_volunteers ? $project_volunteers : [];
        } catch (\Exception $e) {
            $project_volunteers = [];
            if (!empty($project)) {
                report($e);
            }
        }
        try {
            $project_budgets = Project::find($project['ProjectID'])->budgets;
            $project_budgets = $project_budgets ? $project_budgets->toArray() : [];
        } catch (\Exception $e) {
            $project_budgets = [];
            if (!empty($project)) {
                report($e);
            }
        }
        try {
            $project_attachments = Project::find($project['ProjectID'])->attachments;
            $project_attachments = $project_attachments ? $project_attachments->toArray() : [];
        } catch (\Exception $e) {
            $project_attachments = [];
            if (!empty($project)) {
                report($e);
            }
        }
        try {
            $volunteers = Volunteer::orderBy('LastName', 'asc')->get()->toArray();
        } catch (\Exception $e) {
            $volunteers = [];
            report($e);
        }
        try {
            $model = new AnnualBudget();
            $annual_budgets = $model->getSiteBudgets($Year);
        } catch (\Exception $e) {
            $annual_budgets = [];
            report($e);
        }
        try {
            $model = new AnnualBudget();
            $annual_budget = $model->getAnnualBudget($Year);
        } catch (\Exception $e) {
            $annual_budget = [];
            report($e);
        }
        try {
            $project_roles = [];
            $projectRoles = ProjectRole::select('ProjectRoleID AS option_value', 'Role AS option_label')->orderBy(
                'DisplaySequence',
                'asc'
            )->get();
            $projectRoles = $projectRoles ? $projectRoles->toArray() : [];
            foreach ($projectRoles as $role) {
                $project_roles[$role['option_label']] = $role['option_value'];
            }
        } catch (\Exception $e) {
            $project_roles = [];
            report($e);
        }
        try {
            $aBudgetSourceOptions = [];
            $BudgetSourceOptions =
                BudgetSourceOptions::select('id AS option_value', 'option_label')
                                   ->orderBy('DisplaySequence', 'asc')
                                   ->get();
            $BudgetSourceOptions = $BudgetSourceOptions ? $BudgetSourceOptions->toArray() : [];
            foreach ($BudgetSourceOptions as $option) {
                $aBudgetSourceOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aBudgetSourceOptions = [];
            report($e);
        }
        try {
            $aBudgetStatusOptions = [];
            $BudgetStatusOptions =
                BudgetStatusOptions::select('id AS option_value', 'option_label')
                                   ->orderBy('DisplaySequence', 'asc')
                                   ->get();
            $BudgetStatusOptions = $BudgetStatusOptions ? $BudgetStatusOptions->toArray() : [];
            foreach ($BudgetStatusOptions as $option) {
                $aBudgetStatusOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aBudgetStatusOptions = [];
            report($e);
        }
        try {
            $aProjectSkillNeededOptions = [];
            $ProjectSkillNeededOptions =
                ProjectSkillNeededOptions::select('id AS option_value', 'option_label')->orderBy(
                    'DisplaySequence',
                    'asc'
                )->get();
            $ProjectSkillNeededOptions = $ProjectSkillNeededOptions ? $ProjectSkillNeededOptions->toArray() : [];
            foreach ($ProjectSkillNeededOptions as $option) {
                $aProjectSkillNeededOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aProjectSkillNeededOptions = [];
            report($e);
        }
        try {
            $aProjectStatusOptions = [];
            $ProjectStatusOptions =
                ProjectStatusOptions::select('id AS option_value', 'option_label')
                                    ->orderBy('DisplaySequence', 'asc')
                                    ->get();
            $ProjectStatusOptions = $ProjectStatusOptions ? $ProjectStatusOptions->toArray() : [];
            foreach ($ProjectStatusOptions as $option) {
                $aProjectStatusOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aProjectStatusOptions = [];
            report($e);
        }
        try {
            $aSendStatusOptions = [];
            $SendStatusOptions =
                SendStatusOptions::select('id AS option_value', 'option_label')->orderBy('DisplaySequence', 'asc')->get(
                );
            $SendStatusOptions = $SendStatusOptions ? $SendStatusOptions->toArray() : [];
            foreach ($SendStatusOptions as $option) {
                $aSendStatusOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aSendStatusOptions = [];
            report($e);
        }
        try {
            $aVolunteerAgeRangeOptions = [];
            $VolunteerAgeRangeOptions = VolunteerAgeRangeOptions::select('id AS option_value', 'option_label')->orderBy(
                'DisplaySequence',
                'asc'
            )->get();
            $VolunteerAgeRangeOptions = $VolunteerAgeRangeOptions ? $VolunteerAgeRangeOptions->toArray() : [];
            foreach ($VolunteerAgeRangeOptions as $option) {
                $aVolunteerAgeRangeOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aVolunteerAgeRangeOptions = [];
            report($e);
        }
        try {
            $aVolunteerPrimarySkillOptions = [];
            $VolunteerPrimarySkillOptions =
                VolunteerPrimarySkillOptions::select('id AS option_value', 'option_label')->orderBy(
                    'DisplaySequence',
                    'asc'
                )->get();
            $VolunteerPrimarySkillOptions =
                $VolunteerPrimarySkillOptions ? $VolunteerPrimarySkillOptions->toArray() : [];
            foreach ($VolunteerPrimarySkillOptions as $option) {
                $aVolunteerPrimarySkillOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aVolunteerPrimarySkillOptions = [];
            report($e);
        }
        try {
            $aVolunteerSkillLevelOptions = [];
            $VolunteerSkillLevelOptions =
                VolunteerSkillLevelOptions::select('id AS option_value', 'option_label')->orderBy(
                    'DisplaySequence',
                    'asc'
                )->get();
            $VolunteerSkillLevelOptions = $VolunteerSkillLevelOptions ? $VolunteerSkillLevelOptions->toArray() : [];
            foreach ($VolunteerSkillLevelOptions as $option) {
                $aVolunteerSkillLevelOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aVolunteerSkillLevelOptions = [];
            report($e);
        }
        try {
            $aVolunteerStatusOptions = [];
            $VolunteerStatusOptions =
                VolunteerStatusOptions::select('id AS option_value', 'option_label')
                                      ->orderBy('DisplaySequence', 'asc')
                                      ->get();
            $VolunteerStatusOptions = $VolunteerStatusOptions ? $VolunteerStatusOptions->toArray() : [];
            foreach ($VolunteerStatusOptions as $option) {
                $aVolunteerStatusOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aVolunteerStatusOptions = [];
            report($e);
        }
        try {
            $aPermitRequiredOptions = [];
            $PermitRequiredOptions = PermitRequiredOptions::select('id AS option_value', 'option_label')->orderBy(
                'DisplaySequence',
                'asc'
            )->get();
            $PermitRequiredOptions = $PermitRequiredOptions ? $PermitRequiredOptions->toArray() : [];
            foreach ($PermitRequiredOptions as $option) {
                $aPermitRequiredOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aPermitRequiredOptions = [];
            report($e);
        }
        try {
            $aPermitRequiredStatusOptions = [];
            $PermitRequiredStatusOptions =
                PermitRequiredStatusOptions::select('id AS option_value', 'option_label')->orderBy(
                    'DisplaySequence',
                    'asc'
                )->get();
            $PermitRequiredStatusOptions = $PermitRequiredStatusOptions ? $PermitRequiredStatusOptions->toArray() : [];
            foreach ($PermitRequiredStatusOptions as $option) {
                $aPermitRequiredStatusOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aPermitRequiredStatusOptions = [];
            report($e);
        }
        try {
            $aWhenWillProjectBeCompletedOptions = [];
            $WhenWillProjectBeCompletedOptions =
                WhenWillProjectBeCompletedOptions::select('id AS option_value', 'option_label')->orderBy(
                    'DisplaySequence',
                    'asc'
                )->get();
            $WhenWillProjectBeCompletedOptions =
                $WhenWillProjectBeCompletedOptions ? $WhenWillProjectBeCompletedOptions->toArray() : [];
            foreach ($WhenWillProjectBeCompletedOptions as $option) {
                $aWhenWillProjectBeCompletedOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aWhenWillProjectBeCompletedOptions = [];
            report($e);
        }
        try {
            $site_roles = [];
            $siteRoles = SiteRole::select('SiteRoleID AS option_value', 'Role AS option_label')->orderBy(
                'DisplaySequence',
                'asc'
            )->get();
            $siteRoles = $siteRoles ? $siteRoles->toArray() : [];
            foreach ($siteRoles as $role) {
                $site_roles[$role['option_label']] = $role['option_value'];
            }
        } catch (\Exception $e) {
            $site_roles = [];
            report($e);
        }

        try {
            $aWorkflow = Workflow::get();
            $workflow = $aWorkflow ? $aWorkflow->toArray() : [];
        } catch (\Exception $e) {
            $workflow = [];
            report($e);
        }
        try {
            $aAttributes = Attribute::get();
            $attributes = $aAttributes ? $aAttributes->toArray() : [];
            $sorted = collect($attributes)->sortBy('DisplaySequence');
            $attributes = $sorted->values()->all();
        } catch (\Exception $e) {
            $attributes = [];
            report($e);
        }
        try {
            $aProjectAttributes = ProjectAttribute::get();
            $project_attributes = $aProjectAttributes ? $aProjectAttributes->toArray() : [];
        } catch (\Exception $e) {
            $project_attributes = [];
            report($e);
        }
        #PHPStormVarMARKER
        $bIsLocalEnv = App::environment('local');
        $random = rand(0, time());
        $select_options = [
            'site_roles' => $site_roles,
            'project_roles' => $project_roles,
            'projects_dropdown' => $projects_dropdown,
            'BudgetSourceOptions' => $aBudgetSourceOptions,
            'BudgetStatusOptions' => $aBudgetStatusOptions,
            'ProjectSkillNeededOptions' => $aProjectSkillNeededOptions,
            'ProjectStatusOptions' => $aProjectStatusOptions,
            'SendStatusOptions' => $aSendStatusOptions,
            'VolunteerAgeRangeOptions' => $aVolunteerAgeRangeOptions,
            'VolunteerPrimarySkillOptions' => $aVolunteerPrimarySkillOptions,
            'VolunteerSkillLevelOptions' => $aVolunteerSkillLevelOptions,
            'VolunteerStatusOptions' => $aVolunteerStatusOptions,
            'WhenWillProjectBeCompletedOptions' => $aWhenWillProjectBeCompletedOptions,
            'PermitRequiredOptions' => $aPermitRequiredOptions,
            'PermitRequiredStatusOptions' => $aPermitRequiredStatusOptions,

        ];


        $appInitialData = compact(
            [
                'bIsLocalEnv',
                'random',
                'auth',
                'Year',
                'site_settings',
                'site',
                'site_years',
                'siteStatus',
                'contacts',
                'project',
                'project_scope',
                'projects',
                'all_projects',
                'sites',
                'project_leads',
                'project_budgets',
                'project_contacts',
                'project_volunteers',
                'project_attachments',
                'project_manager_sites',
                'project_manager_projects',
                'volunteers',
                'all_contacts',
                'annual_budget',
                'annual_budgets',
                'select_options',
                'site_volunteers',
                'site_volunteer',
                'status_management_records',
                'workflow',
                'attributes',
                'project_attributes' #PHPStormInitDataMARKER
            ]
        );
        $this->makeJsFiles(compact('appInitialData'));

        return view('springintoaction::admin.main.app', $request, compact('appInitialData'));
    }

    public function makeJsFiles($appInitialData)
    {
        //packages/dhayakawa/springintoaction/src/resources/assets/js/springintoaction.templates.js
        //public/js/springintoaction.templates.js
        $content = "window.JST = {};" . \PHP_EOL;

        try {
            $files =
                \glob(base_path() . "/resources/views/vendor/springintoaction/admin/backbone/*.backbone.template.php");
            foreach ($files as $file) {
                $templateID = str_replace('.backbone.template.php', '', basename($file));
                ob_start();
                include_once $file;
                $fileContents = \ob_get_clean();
                $fileContents = preg_replace(
                    ["/(\r\n|\n)/", "/\s+/", "/> </"],
                    ["", " ", "><"],
                    addcslashes($fileContents, '"')
                );
                $content .= "window.JST['{$templateID}'] = _.template(
                        \"{$fileContents}\"
                    );" . \PHP_EOL;
            }

            if (\file_exists(base_path() . "/packages/dhayakawa/springintoaction/src/resources/assets/js")) {
                \file_put_contents(
                    base_path() .
                    "/packages/dhayakawa/springintoaction/src/resources/assets/js/springintoaction.templates.js",
                    $content
                );
            }
            \file_put_contents(base_path() . "/public/js/springintoaction.templates.js", $content);

            $contentView = view('springintoaction::admin.backbone.app-initial-models-vars-data', $appInitialData);
            $content = $contentView->render();
            if (\file_exists(base_path() . "/packages/dhayakawa/springintoaction/src/resources/assets/js")) {
                \file_put_contents(
                    base_path() .
                    "/packages/dhayakawa/springintoaction/src/resources/assets/js/app-initial-models-vars-data.js",
                    $content
                );
            }
            \file_put_contents(base_path() . "/public/js/app-initial-models-vars-data.js", $content);

            $contentView = view('springintoaction::admin.backbone.app-initial-collections-view-data', $appInitialData);
            $content = $contentView->render();
            if (\file_exists(base_path() . "/packages/dhayakawa/springintoaction/src/resources/assets/js")) {
                \file_put_contents(
                    base_path() .
                    "/packages/dhayakawa/springintoaction/src/resources/assets/js/app-initial-collections-view-data.js",
                    $content
                );
            }
            \file_put_contents(base_path() . "/public/js/app-initial-collections-view-data.js", $content);
            $ps = new ProjectScope();
            ob_start();
            $ps->updateProjectBackboneCollectionScript();
            $output = \ob_get_clean();
            if (!empty($output)) {
                echo "<pre>{$output}</pre>";
            }
        } catch (\Exception $e) {
            report($e);
        }
    }

    private function fixProjectField($aConfig)
    {
        $sFieldNameToFix = $aConfig['sFieldNameToFix'];
        $bIsMultiValueField = $aConfig['bIsMultiValueField'];
        $aFieldNameToFixOptionIds = $aConfig['FieldNameToFixOptionModelClass']::getOptionLabelsArray();

        if (!isset($aFieldNameToFixOptionIds[''])) {
            print_r($aConfig);
            print_r($aFieldNameToFixOptionIds);
            return;
        }
        $defaultFieldNameToFixOptionId = $aFieldNameToFixOptionIds[$aConfig['defaultFieldNameToFixOptionLabelText']];
        $iBlankFieldNameToFixOptionId = isset($aFieldNameToFixOptionIds['']) ? $aFieldNameToFixOptionIds[''] : null;
        $sql =
            "select p.ProjectID,p.{$sFieldNameToFix} from projects p where (p.{$sFieldNameToFix} regexp '[a-zA-Z]' or p.{$sFieldNameToFix} = '') and p.deleted_at is null;";
        $rsFixes = DB::select($sql);

        foreach ($rsFixes as $fix) {
            $currentValue = trim($fix->$sFieldNameToFix);
            $newValue = $defaultFieldNameToFixOptionId;
            if (empty($currentValue)) {
                $newValue = $defaultFieldNameToFixOptionId;
            } else {
                if ($bIsMultiValueField) {
                    $aMultiValue = preg_split('/;/', $currentValue);
                    $newValue = join(
                        ',',
                        array_map(
                            function ($value) use ($aFieldNameToFixOptionIds) {
                                return $aFieldNameToFixOptionIds[trim($value)];
                            },
                            $aMultiValue
                        )
                    );
                } else {
                    $newValue = $aFieldNameToFixOptionIds[$currentValue];
                }
            }

            if ($fix->ProjectID) {
                try {
                    $projectModel = Project::find($fix->ProjectID);
                    if ($projectModel) {
                        $projectModel->setAttribute($sFieldNameToFix, $newValue);
                        $projectModel->save();
                        //echo "updated ProjectID:{$fix->ProjectID} projects.{$sFieldNameToFix}:{$newValue}<br>";
                    } else {
                        //echo "check where condition in query, probably having deleted_at issues. CANNOT update ProjectID:{$fix->ProjectID} projects.{$sFieldNameToFix}:{$newValue}<br>";
                    }
                } catch (\Exception $e) {
                    report($e);
                }
            }
        }

        if ($aConfig['bUpdateBlankFieldNameToFixOptionId'] &&
            $iBlankFieldNameToFixOptionId &&
            $defaultFieldNameToFixOptionId !== $iBlankFieldNameToFixOptionId
        ) {
            // Fix fields that has the blank fields as one of the multi field options
            if (Project::where($sFieldNameToFix, 'REGEXP', (string) "{$iBlankFieldNameToFixOptionId},")->get()->count(
            )
            ) {
                $affected = DB::update(
                    "update projects p set p.{$sFieldNameToFix} = REPLACE(p.{$sFieldNameToFix}, '{$iBlankFieldNameToFixOptionId},', '') where p.{$sFieldNameToFix} REGEXP '{$iBlankFieldNameToFixOptionId}'"
                );
            }
            /**
             * If the blank option exists and is not the default, Do not let it be a valid value in the db and set it to the default
             */
            $affected = DB::update(
                "update projects p set p.{$sFieldNameToFix} = '$defaultFieldNameToFixOptionId' where p.{$sFieldNameToFix} = '$iBlankFieldNameToFixOptionId'"
            );
            //echo "{$affected} {$sFieldNameToFix} set {$defaultFieldNameToFixOptionId} where {$iBlankFieldNameToFixOptionId}<br>";
        }

        if (isset($aConfig['update_table_relationship'])) {
            /**
             * Assuming the data is good, now we need to create any missing records in the foreign table that exist in the projects table
             */

            $tableToUpdate = $aConfig['update_table_relationship']['tableToUpdate'];
            $tableToUpdateForeignKeyField = $aConfig['update_table_relationship']['tableToUpdateForeignKeyField'];
            $aDefaultInsertRecordData =
                isset($aConfig['update_table_relationship']['aDefaultInsertRecordData']) ?
                    $aConfig['update_table_relationship']['aDefaultInsertRecordData'] : [];

            $sql = "select p.ProjectID,p.{$sFieldNameToFix} from projects p where p.deleted_at is null;";
            $rsProjects = DB::select($sql);
            foreach ($rsProjects as $oProject) {
                $aForeignKeyIds =
                    $bIsMultiValueField ? preg_split('/,/', $oProject->$sFieldNameToFix) :
                        [$oProject->$sFieldNameToFix];
                $aWhereOr = [];
                $aJoins = [];
                $aSelectFields = [];
                foreach ($aForeignKeyIds as $foreignKeyId) {
                    $tableAlias = "{$tableToUpdate}{$foreignKeyId}";
                    $aSelectFields[] =
                        "{$tableAlias}.{$tableToUpdateForeignKeyField} as {$tableToUpdateForeignKeyField}{$foreignKeyId}";
                    $aJoins[] =
                        "LEFT join {$tableToUpdate} {$tableAlias} on {$tableAlias}.ProjectID = p.ProjectID and {$tableAlias}.{$tableToUpdateForeignKeyField} = {$foreignKeyId} and {$tableAlias}.deleted_at is null";
                    $aWhereOr[] = "{$tableAlias}.ProjectID is null";
                }
                $sSelectFields = join(',', $aSelectFields);
                $sWhereOr = join(' or ', $aWhereOr);
                $sFieldNameToFixAlias = "Project{$sFieldNameToFix}";
                $sql = "select p.ProjectID,p.{$sFieldNameToFix} as {$sFieldNameToFixAlias},{$sSelectFields}
                        from projects p" . PHP_EOL;
                $sql .= join(PHP_EOL, $aJoins) . PHP_EOL;
                $sql .= "where p.ProjectID = {$oProject->ProjectID} and ({$sWhereOr}) and p.deleted_at is null;";

                $rsMissingRecords = DB::select($sql);

                foreach ($rsMissingRecords as $oProjectFixData) {
                    $aMissingProjectForeignKeyIds = preg_split('/,/', $oProjectFixData->$sFieldNameToFixAlias);

                    foreach ($aMissingProjectForeignKeyIds as $iMissingProjectForeignKeyId) {
                        $colAlias = "{$tableToUpdateForeignKeyField}{$iMissingProjectForeignKeyId}";
                        $aliasColValue = $oProjectFixData->$colAlias;
                        if (empty($aliasColValue)) {
                            $aInsertData = [
                                'ProjectID' => $oProjectFixData->ProjectID,
                                $tableToUpdateForeignKeyField => $iMissingProjectForeignKeyId,
                            ];
                            try {
                                DB::table($tableToUpdate)->insert(
                                    array_merge($aInsertData, $aDefaultInsertRecordData)
                                );
                            } catch (\Exception $e) {
                                report($e);
                            }
                        }
                    }
                }
            }
        }
    }

    private function fixProjectData()
    {
        /**
         * This is for copying.
         * Remove the update_table_relationship if there isn't one to update
         */
        $_aConfig = [
            'sFieldNameToFix' => '',
            'bIsMultiValueField' => false,
            'FieldNameToFixOptionModelClass' => '',
            'defaultFieldNameToFixOptionLabelText' => '',
            'bUpdateBlankFieldNameToFixOptionId' => true,
            'update_table_relationship' => [
                'tableToUpdate' => '',
                'tableToUpdateForeignKeyField' => '',
                'aDefaultInsertRecordData' => [],
            ],
        ];
        try {
            /**
             * The projects.BudgetSources field should be eventually dropped since its value is the results of a subquery
             * of a different table
             */
            //$this->fixBudgetSources();
            $aConfig = [
                'sFieldNameToFix' => 'BudgetSources',
                'bIsMultiValueField' => true,
                'FieldNameToFixOptionModelClass' => BudgetSourceOptions::class,
                'defaultFieldNameToFixOptionLabelText' => 'Unknown',
                'bUpdateBlankFieldNameToFixOptionId' => true,
                'update_table_relationship' => [
                    'tableToUpdate' => 'budgets',
                    'tableToUpdateForeignKeyField' => 'BudgetSource',
                    'aDefaultInsertRecordData' => [
                        'BudgetAmount' => 0.00,
                        'Status' => BudgetStatusOptions::getOptionLabelsArray()['Needs To Be Proposed'],
                        'Comments' => 'Hayakawa- This budget source/allocation was automatically imported as a result of a database update and should be reviewed.',
                    ],
                ],
            ];
            $this->fixProjectField($aConfig);
        } catch (\Exception $e) {
            report($e);
        }
        $aConfig = [
            'sFieldNameToFix' => 'Status',
            'bIsMultiValueField' => false,
            'FieldNameToFixOptionModelClass' => ProjectStatusOptions::class,
            'defaultFieldNameToFixOptionLabelText' => 'Pending',
            'bUpdateBlankFieldNameToFixOptionId' => true,
        ];
        $this->fixProjectField($aConfig);

        $aConfig = [
            'sFieldNameToFix' => 'PrimarySkillNeeded',
            'bIsMultiValueField' => false,
            'FieldNameToFixOptionModelClass' => ProjectSkillNeededOptions::class,
            'defaultFieldNameToFixOptionLabelText' => 'General',
            'bUpdateBlankFieldNameToFixOptionId' => true,
        ];
        $this->fixProjectField($aConfig);

        $aConfig = [
            'sFieldNameToFix' => 'ProjectSend',
            'bIsMultiValueField' => false,
            'FieldNameToFixOptionModelClass' => SendStatusOptions::class,
            'defaultFieldNameToFixOptionLabelText' => 'Not Ready',
            'bUpdateBlankFieldNameToFixOptionId' => true,
        ];
        $this->fixProjectField($aConfig);
    }

    private function parseBackups()
    {
        $backupDir = '/home/woodlands/backup/mysql_backups/';
    }
}
