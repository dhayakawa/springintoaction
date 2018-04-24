<?php

namespace Dhayakawa\SpringIntoAction\Controllers;

use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
//use Illuminate\Support\Facades\Config;
use Dhayakawa\SpringIntoAction\Models\AnnualBudget;
use Dompdf\Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
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
use Dhayakawa\SpringIntoAction\Models\ProjectVolunteerRole;
use \Dhayakawa\SpringIntoAction\Models\BudgetSourceOptions;
use \Dhayakawa\SpringIntoAction\Models\BudgetStatusOptions;
use \Dhayakawa\SpringIntoAction\Models\ProjectSkillNeededOptions;
use \Dhayakawa\SpringIntoAction\Models\ProjectStatusOptions;
use \Dhayakawa\SpringIntoAction\Models\SendStatusOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerAgeRangeOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerPrimarySkillOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerSkillLevelOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerStatusOptions;

class SpringIntoActionMainAppController extends BaseController
{
    public function index(Request $request)
    {
        //$this->dbVolunteersSqlfix();
        //$this->setBudgetOptionIDs();
        //$this->setProjectOptionIDs();
        //$this->setVolunteerOptionIDs();
        //\Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__, Config::all()]);
        $year = $request->input('year');
        $Year = $year ?: date('Y');

        try {
            $sites = Site::orderBy('SiteName', 'asc')->get()->toArray();
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
            $projects = Project::join('site_status', 'projects.SiteStatusID', '=', 'site_status.SiteStatusID')->where(
                'site_status.SiteStatusID',
                $siteStatus['SiteStatusID']
            )->orderBy('projects.SequenceNumber', 'asc')->get()->toArray();
            $project = current($projects);
        } catch (\Exception $e) {
            $projects = [];
            $project = [];
            report($e);
        }
        try {
            $all_projects =
                Project::join('site_status', 'projects.SiteStatusID', '=', 'site_status.SiteStatusID')->where(
                    'site_status.Year',
                    $Year
                )->where('projects.Active', 1)->orderBy('projects.SequenceNumber', 'asc')->get()->toArray();
        } catch (\Exception $e) {
            $all_projects = [];

            report($e);
        }
        try {
            $contacts = Site::find($site['SiteID'])->contacts;
            $contacts = $contacts ? $contacts->toArray() : [];
        } catch (\Exception $e) {
            $contacts = [];
            report($e);
        }
        try {
            $all_contacts = Contact::orderBy('LastName', 'asc')->get();
            $all_contacts = $all_contacts ? $all_contacts->toArray() : [];
        } catch (\Exception $e) {
            $all_contacts = [];
            report($e);
        }

        try {
            $model = new ProjectVolunteerRole();
            $project_leads = $model->getProjectLeads($project['ProjectID']);
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
            $project_volunteers = Project::find($project['ProjectID'])->volunteers;
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
            $annual_budgets = $model->getBudgets($Year);
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
            $BudgetSourceOptions = BudgetSourceOptions::select('id AS option_value', 'option_label')->orderBy(
                'DisplaySequence',
                'asc'
            )->get();
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
            $BudgetStatusOptions = BudgetStatusOptions::select('id AS option_value', 'option_label')->orderBy(
                'DisplaySequence',
                'asc'
            )->get();
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
            $ProjectStatusOptions = ProjectStatusOptions::select('id AS option_value', 'option_label')->orderBy(
                'DisplaySequence',
                'asc'
            )->get();
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
            $SendStatusOptions = SendStatusOptions::select('id AS option_value', 'option_label')->orderBy(
                'DisplaySequence',
                'asc'
            )->get();
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
            $VolunteerStatusOptions = VolunteerStatusOptions::select('id AS option_value', 'option_label')->orderBy(
                'DisplaySequence',
                'asc'
            )->get();
            $VolunteerStatusOptions = $VolunteerStatusOptions ? $VolunteerStatusOptions->toArray() : [];
            foreach ($VolunteerStatusOptions as $option) {
                $aVolunteerStatusOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aVolunteerStatusOptions = [];
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
        $random = rand(0, time());
        $select_options = [
            'site_roles' => $site_roles,
            'project_roles' => $project_roles,
            'BudgetSourceOptions' => $aBudgetSourceOptions,
            'BudgetStatusOptions' => $aBudgetStatusOptions,
            'ProjectSkillNeededOptions' => $aProjectSkillNeededOptions,
            'ProjectStatusOptions' => $aProjectStatusOptions,
            'SendStatusOptions' => $aSendStatusOptions,
            'VolunteerAgeRangeOptions' => $aVolunteerAgeRangeOptions,
            'VolunteerPrimarySkillOptions' => $aVolunteerPrimarySkillOptions,
            'VolunteerSkillLevelOptions' => $aVolunteerSkillLevelOptions,
            'VolunteerStatusOptions' => $aVolunteerStatusOptions
        ];
        $appInitialData = compact(
            [
                'random',
                'Year',
                'site',
                'site_years',
                'siteStatus',
                'contacts',
                'project',
                'projects',
                'all_projects',
                'sites',
                'project_leads',
                'project_budgets',
                'project_contacts',
                'project_volunteers',
                'project_attachments',
                'volunteers',
                'all_contacts',
                'annual_budget',
                'annual_budgets',
                'select_options',
                'site_volunteers',
                'site_volunteer'
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
                $fileContents = preg_replace(
                    ["/(\r\n|\n)/", "/\s+/", "/> </"],
                    ["", " ", "><"],
                    addcslashes(\file_get_contents($file), '"')
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
        } catch (\Exception $e) {
            report($e);
        }
    }

    private function setBudgetOptionIDs()
    {
        try {
            $aBudgetSourceOptions = [];
            $BudgetSourceOptions = BudgetSourceOptions::select('id AS option_value', 'option_label')->orderBy(
                'DisplaySequence',
                'asc'
            )->get();
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
            $BudgetStatusOptions = BudgetStatusOptions::select('id AS option_value', 'option_label')->orderBy(
                'DisplaySequence',
                'asc'
            )->get();
            $BudgetStatusOptions = $BudgetStatusOptions ? $BudgetStatusOptions->toArray() : [];
            foreach ($BudgetStatusOptions as $option) {
                $aBudgetStatusOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aBudgetStatusOptions = [];
            report($e);
        }
        $map = [
            'BudgetSource' => ['options' => $aBudgetSourceOptions],
            'Status' => ['options' => $aBudgetStatusOptions],
        ];
        $records = Budget::all();
        foreach ($records as $record) {
            $bExceptionThrown = false;
            foreach ($map as $fieldName => $optionData) {
                try {
                    if (!in_array($record->$fieldName, array_values($optionData['options']))) {
                        $optionID = $optionData['options'][$record->$fieldName];
                        $record->$fieldName = $optionID;
                    }
                } catch (\Exception $e) {
                    echo 'Budget ' . $record->BudgetID . ' ' . $fieldName . ' ' . $e->getMessage() . "<br>";
                    $bExceptionThrown = true;
                }
            }
            if (!$bExceptionThrown) {
                $record->save();
            }
        }
    }

    private function setProjectOptionIDs()
    {
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
            $ProjectStatusOptions = ProjectStatusOptions::select('id AS option_value', 'option_label')->orderBy(
                'DisplaySequence',
                'asc'
            )->get();
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
            $SendStatusOptions = SendStatusOptions::select('id AS option_value', 'option_label')->orderBy(
                'DisplaySequence',
                'asc'
            )->get();
            $SendStatusOptions = $SendStatusOptions ? $SendStatusOptions->toArray() : [];
            foreach ($SendStatusOptions as $option) {
                $aSendStatusOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aSendStatusOptions = [];
            report($e);
        }
        $map = [
            'PrimarySkillNeeded' => [
                'options' => $aProjectSkillNeededOptions
            ],
            'Status' => ['options' => $aProjectStatusOptions],
            'ProjectSend' => ['options' => $aSendStatusOptions],
        ];
        $records = Project::all();
        foreach ($records as $record) {
            $bExceptionThrown = false;
            foreach ($map as $fieldName => $optionData) {
                try {
                    if (!in_array($record->$fieldName, array_values($optionData['options']))) {
                        if ($fieldName == 'PrimarySkillNeeded') {
                            if ($record->$fieldName == 'Finish Carpentr') {
                                $record->$fieldName = 'Finish Carpentry';
                            } elseif ($record->$fieldName == 'Carpentry') {
                                $record->$fieldName = 'General Carpentry';
                            }
                        }
                        $optionID = $optionData['options'][$record->$fieldName];
                        $record->$fieldName = $optionID;
                    }
                } catch (\Exception $e) {
                    echo 'Project ' . $record->ProjectID . ' ' . $fieldName . ' ' . $e->getMessage() . "<br>";
                    $bExceptionThrown = true;
                }
            }
            if (!$bExceptionThrown) {
                $record->save();
            }
        }
    }

    private function setVolunteerOptionIDs()
    {
        try {
            $aSendStatusOptions = [];
            $SendStatusOptions = SendStatusOptions::select('id AS option_value', 'option_label')->orderBy(
                'DisplaySequence',
                'asc'
            )->get();
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
            $VolunteerStatusOptions = VolunteerStatusOptions::select('id AS option_value', 'option_label')->orderBy(
                'DisplaySequence',
                'asc'
            )->get();
            $VolunteerStatusOptions = $VolunteerStatusOptions ? $VolunteerStatusOptions->toArray() : [];
            foreach ($VolunteerStatusOptions as $option) {
                $aVolunteerStatusOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aVolunteerStatusOptions = [];
            report($e);
        }
        // $map = [
        //     'Status' => ['options' => $aVolunteerStatusOptions],
        // ];
        // $records = ProjectVolunteerRole::all();
        // foreach ($records as $record) {
        //     $bExceptionThrown = false;
        //     foreach ($map as $fieldName => $optionData) {
        //         try {
        //             if (!in_array($record->$fieldName, array_values($optionData['options']))) {
        //                 $optionID = $optionData['options'][$record->$fieldName];
        //                 $record->$fieldName = $optionID;
        //             }
        //         } catch (\Exception $e) {
        //             echo 'ProjectVolunteerRole ' . $record->ProjectVolunteerRoleID . ' ' . $fieldName . ' ' .
        //                  $e->getMessage() . "<br>";
        //             $bExceptionThrown = true;
        //         }
        //     }
        //     if (!$bExceptionThrown) {
        //         $record->save();
        //     }
        // }

        $map = [
            'Status' => ['options' => $aVolunteerStatusOptions],
            'AgeRange' => ['options' => $aVolunteerAgeRangeOptions],
            'PrimarySkill' => ['options' => $aVolunteerPrimarySkillOptions],
            'Painting' => ['options' => $aVolunteerSkillLevelOptions],
            'Landscaping' => ['options' => $aVolunteerSkillLevelOptions],
            'Construction' => ['options' => $aVolunteerSkillLevelOptions],
            'Electrical' => ['options' => $aVolunteerSkillLevelOptions],
            'CabinetryFinishWork' => ['options' => $aVolunteerSkillLevelOptions],
            'Plumbing' => ['options' => $aVolunteerSkillLevelOptions],
            'AssignmentInformationSendStatus' => ['options' => $aSendStatusOptions],
        ];
        $records = Volunteer::all();
        foreach ($records as $record) {
            $bExceptionThrown = false;

            //echo "<pre>Before:\n" . print_r($record->toArray(), true). "</pre>";
            foreach ($map as $fieldName => $optionData) {
                $record->$fieldName = $record->$fieldName === null ? '' : $record->$fieldName;
                try {
                    switch ($fieldName) {
                        case 'PrimarySkill':
                            if ($record->$fieldName == 'Carpentry') {
                                $record->$fieldName = 'General Carpentry';
                            } elseif ($record->$fieldName == 'Cabinetry') {
                                $record->$fieldName = 'Cabinetry Finish Work';
                            }
                            break;
                        case 'Plumbing':
                            if ($record->$fieldName == 'Plumbing-Fair') {
                                $record->$fieldName = 'Fair';
                            }
                            break;

                    }
                    if ($fieldName == 'AgeRange') {
                        $mult = preg_split("/,/", $record->$fieldName);
                        $new = [];
                        foreach ($mult as $m) {
                            $bIsConvertedAlready = in_array($m, array_values($optionData['options']));
                            // echo "{$record->VolunteerID} {$fieldName} {$record->$fieldName} converted:" .
                            //      (int) $bIsConvertedAlready .
                            //      " " .
                            //      print_r(array_values($optionData['options']), true) .
                            //      "<br>";
                            if (!$bIsConvertedAlready && isset($optionData['options'][$record->$fieldName])) {
                                $new[] = $optionData['options'][$m];
                            }
                        }
                        if (!empty($new)) {
                            $optionID = join(',', $new);
                            //echo "{$record->$fieldName} = {$optionID}<br>";
                            $record->$fieldName = $optionID;
                        }
                    } else {
                        $bIsConvertedAlready = in_array($record->$fieldName, array_values($optionData['options']));
                        // echo "{$record->VolunteerID} {$fieldName} {$record->$fieldName} converted:" . (int)
                        //     $bIsConvertedAlready . " " .
                        //      print_r(array_values($optionData['options']), true) .
                        //      "<br>";
                        if (!$bIsConvertedAlready &&
                            isset($optionData['options'][$record->$fieldName])
                        ) {
                            $optionID = $optionData['options'][$record->$fieldName];
                            $record->$fieldName = $optionID;
                        }
                    }
                } catch (\Exception $e) {
                    // echo 'Volunteer ' . $record->VolunteerID . ' ' . $fieldName . ' ' . $e->getMessage() . ' ' .
                    //      print_r(array_values($optionData['options']), true)
                    //      . "<hr>";
                    echo "<pre>Exception:\n{$fieldName} {$e->getMessage()}<br>" .
                         print_r($record->toArray(), true) .
                         "</pre>";
                    $bExceptionThrown = true;
                }
            }

            if (!$bExceptionThrown) {
                $record->save();
            }
        }
    }

    private function dbBudgetsSqlFix()
    {
        $aInsert = file('/home/vagrant/code/laravel/public/budgets.txt');

        foreach ($aInsert as $insertLine) {
            $values = preg_replace("/(^\(|\),$)/", '', trim($insertLine));
            $aValues = str_getcsv($values, ',', "'");
            //echo '<pre>' . print_r($aValues, true) . '</pre>';
            $id = $aValues[0];
            $pskill = trim($aValues[7]);
            $status = trim($aValues[8]);
            $ageRange = trim($aValues[20]);
            $paint = trim($aValues[25]);
            $landsc = trim($aValues[26]);
            $constr = trim($aValues[27]);
            $electrical = trim($aValues[28]);
            $cabfinish = trim($aValues[29]);
            $plumb = trim($aValues[30]);

            $model = Budget::find($id);
            $model->PrimarySkill = $pskill == 'NULL' ? null : $pskill;
            $model->Status = $status == 'NULL' ? null : $status;
            $model->AgeRange = $ageRange == 'NULL' ? null : $ageRange;
            $model->Painting = $paint == 'NULL' ? null : $paint;
            $model->Landscaping = $landsc == 'NULL' ? null : $landsc;
            $model->Construction = $constr == 'NULL' ? null : $constr;
            $model->Electrical = $electrical == 'NULL' ? null : $electrical;
            $model->CabinetryFinishWork = $cabfinish == 'NULL' ? null : $cabfinish;
            $model->Plumbing = $plumb == 'NULL' ? null : $plumb;

            echo "<pre>" . print_r($model->toArray(), true) . "</pre>";

            $model->save();
        }
        die;
    }

    private function dbVolunteersSqlFix()
    {
        $aInsert = file('/home/vagrant/code/laravel/public/insert.txt');

        foreach ($aInsert as $insertLine) {
            $values = preg_replace("/(^\(|\),$)/", '', trim($insertLine));
            $aValues = str_getcsv($values, ',', "'");
            //echo '<pre>' . print_r($aValues, true) . '</pre>';
            $id = $aValues[0];
            $pskill = trim($aValues[7]);
            $status = trim($aValues[8]);
            $ageRange = trim($aValues[20]);
            $paint = trim($aValues[25]);
            $landsc = trim($aValues[26]);
            $constr = trim($aValues[27]);
            $electrical = trim($aValues[28]);
            $cabfinish = trim($aValues[29]);
            $plumb = trim($aValues[30]);

            $volunteer = Volunteer::find($id);
            $volunteer->PrimarySkill = $pskill == 'NULL' ? null : $pskill;
            $volunteer->Status = $status == 'NULL' ? null : $status;
            $volunteer->AgeRange = $ageRange == 'NULL' ? null : $ageRange;
            $volunteer->Painting = $paint == 'NULL' ? null : $paint;
            $volunteer->Landscaping = $landsc == 'NULL' ? null : $landsc;
            $volunteer->Construction = $constr == 'NULL' ? null : $constr;
            $volunteer->Electrical = $electrical == 'NULL' ? null : $electrical;
            $volunteer->CabinetryFinishWork = $cabfinish == 'NULL' ? null : $cabfinish;
            $volunteer->Plumbing = $plumb == 'NULL' ? null : $plumb;

            echo "<pre>" . print_r($volunteer->toArray(), true) . "</pre>";

            $volunteer->save();
        }
        die;
    }

    private function dbSqlfix()
    {
        \file_put_contents('/home/vagrant/code/laravel/public/insert_fixed.txt', '', null);
        $aInsert = file('/home/vagrant/code/laravel/public/insert.txt');

        foreach ($aInsert as $insertLine) {
            list($pre, $values) = preg_split("/\) VALUES \(/", trim($insertLine));
            $values = preg_replace("/\);$/", "", $values);
            $aValues = str_getcsv($values, ',', "'");
            $aFixedValues = [];
            foreach ($aValues as $idx => $fieldValue) {
                $fieldValue = trim($fieldValue);
                $i = $idx + 1;
                //echo "{$i}:{$fieldValue}<br>";
                switch ($i) {
                    case 7:
                    case 8:
                    case 9:
                    case 12:
                    case 13:
                    case 14:
                    case 17:
                    case 18:
                    case 19:
                    case 26:
                    case 27:
                    case 28:
                    case 29:
                    case 30:
                    case 31:
                    case 32:
                    case 33:
                    case 34:
                    case 35:
                    case 41:
                    case 43:
                        if ($fieldValue == 'NULL' || empty($fieldValue) || $fieldValue == "''") {
                            $aFixedValues[$idx] = "''";
                        } else {
                            $quotedFieldValue = "'" . trim($fieldValue, "'") . "'";
                            $aFixedValues[$idx] = $quotedFieldValue;
                        }
                        break;
                    case 1:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 10:
                    case 11:
                    case 15:
                    case 16:
                    case 20:
                    case 21:
                    case 22:
                    case 23:
                    case 24:
                    case 25:
                    case 36:
                    case 37:
                    case 38:
                    case 39:
                    case 40:
                    case 42:
                        if ($fieldValue == 'NULL' || $fieldValue == "''") {
                            $aFixedValues[$idx] = "0";
                        } else {
                            $aFixedValues[$idx] = str_replace("'", "", $fieldValue);
                        }
                        break;
                    case 44:
                    case 45:
                        $type = gettype($fieldValue);

                        //echo "case {$i}:{$idx}:{$fieldValue}:type={$type}:". (int)($fieldValue == NULL)."<br>";
                        if ($fieldValue === 'NULL' || $fieldValue === "''") {
                            //echo "setting({$idx}):{$i}:{$fieldValue}<br>";
                            $aFixedValues[$idx] = "'2018-02-13 04:23:38'";
                            //echo "set({$idx}):{$i}:{$fieldValue}:{$aFixedValues[$idx]}<br>";
                        } else {
                            $quotedFieldValue = "'" . trim($fieldValue, "'") . "'";
                            $aFixedValues[$idx] = $quotedFieldValue;
                        }
                        break;
                    default:
                        //echo "default:{$i}:{$fieldValue}<br>";
                        $aFixedValues[$idx] = $fieldValue;
                }
            }
            //echo '<pre>' . print_r($aValues, 1) . print_r($aFixedValues, 1) . '</pre>';
            $fixedSql = join(',', $aFixedValues);
            $newSql = $pre . ') VALUES (' . $fixedSql . ');';
            echo "<pre>$newSql</pre>";

            file_put_contents('/home/vagrant/code/laravel/public/insert_fixed.txt', $newSql . PHP_EOL, \FILE_APPEND);
        }
        die;
    }
}
