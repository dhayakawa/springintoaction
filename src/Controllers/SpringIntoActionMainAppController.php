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

    public function index (Request $request) {
        //\Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__, Config::all()]);
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
            $sites = Site::orderBy('SiteName', 'asc')->get()->toArray();
            $site = current($sites);
        } catch (\Exception $e) {
            $sites = [];
            $site = [];
            report($e);
        }
        try {
            $siteStatus = current(Site::find($site['SiteID'])->status()->where('Year', $Year)->orderBy('Year', 'desc')->get()->toArray());
        } catch (\Exception $e) {
            $siteStatus = [];
            report($e);
        }

        try {
            $site_years = SiteStatus::select('SiteStatusID', 'SiteID', 'Year')->where('SiteID', $site['SiteID'])->orderBy('Year', 'desc')->get()->toArray();
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
            $projects = Project::join('site_status', 'projects.SiteStatusID', '=', 'site_status.SiteStatusID')->where('site_status.SiteStatusID', $siteStatus['SiteStatusID'])->orderBy('projects.SequenceNumber', 'asc')->get()->toArray();
            $project = current($projects);
            $projects_dropdown = Project::select('projects.ProjectID', 'projects.SequenceNumber')->join('site_status', 'projects.SiteStatusID', '=', 'site_status.SiteStatusID')->where('site_status.SiteStatusID', $siteStatus['SiteStatusID'])->orderBy('projects.SequenceNumber', 'asc')->get()->toArray();

        } catch (\Exception $e) {
            $projects = [];
            $project = [];
            report($e);
        }
        try {
            $all_projects = Project::join('site_status', 'projects.SiteStatusID', '=', 'site_status.SiteStatusID')->where('site_status.Year', $Year)->where('projects.Active', 1)->orderBy('projects.SequenceNumber', 'asc')->get()->toArray();
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
            $projectRoles = ProjectRole::select('ProjectRoleID AS option_value', 'Role AS option_label')->orderBy('DisplaySequence', 'asc')->get();
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
            $BudgetSourceOptions = BudgetSourceOptions::select('id AS option_value', 'option_label')->orderBy('DisplaySequence', 'asc')->get();
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
            $BudgetStatusOptions = BudgetStatusOptions::select('id AS option_value', 'option_label')->orderBy('DisplaySequence', 'asc')->get();
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
            $ProjectSkillNeededOptions = ProjectSkillNeededOptions::select('id AS option_value', 'option_label')->orderBy('DisplaySequence', 'asc')->get();
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
            $ProjectStatusOptions = ProjectStatusOptions::select('id AS option_value', 'option_label')->orderBy('DisplaySequence', 'asc')->get();
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
            $SendStatusOptions = SendStatusOptions::select('id AS option_value', 'option_label')->orderBy('DisplaySequence', 'asc')->get();
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
            $VolunteerAgeRangeOptions = VolunteerAgeRangeOptions::select('id AS option_value', 'option_label')->orderBy('DisplaySequence', 'asc')->get();
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
            $VolunteerPrimarySkillOptions = VolunteerPrimarySkillOptions::select('id AS option_value', 'option_label')->orderBy('DisplaySequence', 'asc')->get();
            $VolunteerPrimarySkillOptions = $VolunteerPrimarySkillOptions ? $VolunteerPrimarySkillOptions->toArray() : [];
            foreach ($VolunteerPrimarySkillOptions as $option) {
                $aVolunteerPrimarySkillOptions[$option['option_label']] = $option['option_value'];
            }
        } catch (\Exception $e) {
            $aVolunteerPrimarySkillOptions = [];
            report($e);
        }
        try {
            $aVolunteerSkillLevelOptions = [];
            $VolunteerSkillLevelOptions = VolunteerSkillLevelOptions::select('id AS option_value', 'option_label')->orderBy('DisplaySequence', 'asc')->get();
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
            $VolunteerStatusOptions = VolunteerStatusOptions::select('id AS option_value', 'option_label')->orderBy('DisplaySequence', 'asc')->get();
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
            $siteRoles = SiteRole::select('SiteRoleID AS option_value', 'Role AS option_label')->orderBy('DisplaySequence', 'asc')->get();
            $siteRoles = $siteRoles ? $siteRoles->toArray() : [];
            foreach ($siteRoles as $role) {
                $site_roles[$role['option_label']] = $role['option_value'];
            }
        } catch (\Exception $e) {
            $site_roles = [];
            report($e);
        }
        $random = rand(0, time());
        $select_options = ['site_roles' => $site_roles, 'project_roles' => $project_roles, 'projects_dropdown' => $projects_dropdown, 'BudgetSourceOptions' => $aBudgetSourceOptions, 'BudgetStatusOptions' => $aBudgetStatusOptions, 'ProjectSkillNeededOptions' => $aProjectSkillNeededOptions, 'ProjectStatusOptions' => $aProjectStatusOptions, 'SendStatusOptions' => $aSendStatusOptions, 'VolunteerAgeRangeOptions' => $aVolunteerAgeRangeOptions, 'VolunteerPrimarySkillOptions' => $aVolunteerPrimarySkillOptions, 'VolunteerSkillLevelOptions' => $aVolunteerSkillLevelOptions, 'VolunteerStatusOptions' => $aVolunteerStatusOptions];
        $appInitialData = compact(['random', 'Year', 'site', 'site_years', 'siteStatus', 'contacts', 'project', 'projects', 'all_projects', 'sites', 'project_leads', 'project_budgets', 'project_contacts', 'project_volunteers', 'project_attachments', 'volunteers', 'all_contacts', 'annual_budget', 'annual_budgets', 'select_options', 'site_volunteers', 'site_volunteer']);
        $this->makeJsFiles(compact('appInitialData'));

        return view('springintoaction::admin.main.app', $request, compact('appInitialData'));
    }

    public function makeJsFiles ($appInitialData) {
        //packages/dhayakawa/springintoaction/src/resources/assets/js/springintoaction.templates.js
        //public/js/springintoaction.templates.js
        $content = "window.JST = {};" . \PHP_EOL;

        try {
            $files = \glob(base_path() . "/resources/views/vendor/springintoaction/admin/backbone/*.backbone.template.php");
            foreach ($files as $file) {
                $templateID = str_replace('.backbone.template.php', '', basename($file));
                $fileContents = preg_replace(["/(\r\n|\n)/", "/\s+/", "/> </"], ["", " ", "><"], addcslashes(\file_get_contents($file), '"'));
                $content .= "window.JST['{$templateID}'] = _.template(
                        \"{$fileContents}\"
                    );" . \PHP_EOL;
            }

            if (\file_exists(base_path() . "/packages/dhayakawa/springintoaction/src/resources/assets/js")) {
                \file_put_contents(base_path() . "/packages/dhayakawa/springintoaction/src/resources/assets/js/springintoaction.templates.js", $content);
            }
            \file_put_contents(base_path() . "/public/js/springintoaction.templates.js", $content);

            $contentView = view('springintoaction::admin.backbone.app-initial-models-vars-data', $appInitialData);
            $content = $contentView->render();
            if (\file_exists(base_path() . "/packages/dhayakawa/springintoaction/src/resources/assets/js")) {
                \file_put_contents(base_path() . "/packages/dhayakawa/springintoaction/src/resources/assets/js/app-initial-models-vars-data.js", $content);
            }
            \file_put_contents(base_path() . "/public/js/app-initial-models-vars-data.js", $content);

            $contentView = view('springintoaction::admin.backbone.app-initial-collections-view-data', $appInitialData);
            $content = $contentView->render();
            if (\file_exists(base_path() . "/packages/dhayakawa/springintoaction/src/resources/assets/js")) {
                \file_put_contents(base_path() . "/packages/dhayakawa/springintoaction/src/resources/assets/js/app-initial-collections-view-data.js", $content);
            }
            \file_put_contents(base_path() . "/public/js/app-initial-collections-view-data.js", $content);
        } catch (\Exception $e) {
            report($e);
        }
    }
}
