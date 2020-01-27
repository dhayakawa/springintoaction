<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 10/5/2018
 * Time: 8:37 PM
 */

namespace Dhayakawa\SpringIntoAction\Controllers;

use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
use Dhayakawa\SpringIntoAction\Models\ProjectScope;
use Illuminate\Support\Facades\Log;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
use \Dhayakawa\SpringIntoAction\Models\BudgetSourceOptions;
use \Dhayakawa\SpringIntoAction\Models\BudgetStatusOptions;
use \Dhayakawa\SpringIntoAction\Models\ProjectSkillNeededOptions;
use \Dhayakawa\SpringIntoAction\Models\ProjectStatusOptions;
use \Dhayakawa\SpringIntoAction\Models\SendStatusOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerAgeRangeOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerPrimarySkillOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerSkillLevelOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerStatusOptions;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class ReportsController extends BaseController
{
    /**
     * @var string
     */
    private $downloadType = '';

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    public function getReport(
        Request $request,
        $ReportType,
        $Year,
        $SiteID = null,
        $ProjectID = null,
        $downloadType = ''
    ) {
        $SiteID = !is_numeric($SiteID) ? null : $SiteID;
        $ProjectID = !is_numeric($ProjectID) ? null : $ProjectID;
        $bReturnArray = $downloadType === 'csv' || $downloadType === 'spreadsheet';
        $html = $bReturnArray ? [] : '';
        $reportHtml = $bReturnArray ? [] : '';
        $date = date('l, F d, Y');
        $this->downloadType = $downloadType;

        switch ($ReportType) {
            case 'projects_full':
                $reportName = 'Project Report by Year, Site and Project';
                $reportHtml = $this->getYearSiteProjectFullReport($Year, $SiteID, $ProjectID,
                                                                  $bReturnArray);
                break;
            case 'projects':
                $reportName = 'Project Report by Year, Site and Project';
                $reportHtml = $this->getYearSiteProjectReport($Year, $SiteID, $ProjectID, $bReturnArray);
                break;
            case 'budget':
                $reportName = 'Budget Allocation';
                $reportHtml = $this->getBudgetAllocationReport($Year, $SiteID = null, $ProjectID = null, $bReturnArray);
                break;
            case 'budget_and_volunteer':
                $reportName = 'Budget, Estimation and Early Work Needed';
                $reportHtml =
                    $this->getBudgetAndVolunteerReport($Year, $SiteID = null, $ProjectID = null, $bReturnArray);
                break;
            case 'early_start':
                $reportName = 'Projects Needing Early Start';
                $reportHtml =
                    $this->getEarlyStartProjectsReport($Year, $SiteID = null, $ProjectID = null, $bReturnArray);
                break;
            case 'sites':
                $reportName = 'Site Report by Year';
                $reportHtml = $this->getYearSiteReport($Year, $bReturnArray);
                break;
            case 'volunteer_assignment_for_packets':
                $reportName = 'Volunteer Assignment Report - Alpha - All Sites and Projects';
                $reportHtml = $this->getVolunteerAssignmentForPacketsReport($Year, $bReturnArray);
                break;
            case 'volunteers_needed':
                $reportName = 'Volunteers Needed Report';
                $reportHtml = $this->getVolunteersNeededReport($Year, $bReturnArray);
                break;
            case 'volunteer_assignment_for_mailmerge':
                $reportName = 'Volunteer Assignment Report';
                $reportHtml = $this->getVolunteerAssignmentForMailMergeReport(
                    $Year,
                    $SiteID = null,
                    $ProjectID = null,
                    $bReturnArray
                );
                break;
            case 'registered_volunteer_emails':
                $reportName = 'Registered Volunteer Emails Report';
                $reportHtml = $this->getRegisteredVolunteerEmailsReport(
                    $Year,
                    $SiteID = null,
                    $ProjectID = null,
                    $bReturnArray
                );
                break;
            case 'registered_team_leader_emails':
                $reportName = 'Registered Team Leader Emails Report';
                $reportHtml = $this->getRegisteredTeamLeaderEmailsReport(
                    $Year,
                    $SiteID = null,
                    $ProjectID = null,
                    $bReturnArray
                );
                break;
            case 'registered_project_manager_emails':
                $reportName = 'Registered Project Manager Emails Report';
                $reportHtml = $this->getRegisteredProjectManagerEmailsReport(
                    $Year,
                    $SiteID = null,
                    $ProjectID = null,
                    $bReturnArray
                );
                break;
            default:
                $reportName = 'Unknown Report:' . $ReportType;
                if ($bReturnArray) {
                    $reportHtml = [];
                }
        }
        if (empty($reportHtml)) {
            $reportHtml = "No Results found.";
            if ($bReturnArray) {
                $reportHtml = [$reportHtml];
            }
        }
        if ($bReturnArray) {
            if ($ReportType !== 'projects_full') {
                $html = array_merge(["Spring Into Action $Year", $reportName, $date, " "], $reportHtml);
            } else {
                $html = $reportHtml;
            }
        } else {
            $html .= '<h2 class="report-title" style="text-align:center;">Spring Into Action ' .
                     $Year .
                     "<br>{$reportName}<br><small>" .
                     $date .
                     '</small></h2>';
            $html .= $reportHtml;
        }

        if (!empty($this->downloadType) && $this->downloadType === 'pdf') {
            return $this->getPDF($html, $reportName);
        } elseif (!empty($this->downloadType) && $this->downloadType === 'csv') {
            return $this->getCSV($html, $reportName);
        } elseif (!empty($this->downloadType) && $this->downloadType === 'spreadsheet') {
            if ($ReportType === 'projects_full') {
                return $this->getProjectsFullSpreadsheet($html, $reportName);
            } else {
                return $this->getSpreadsheet($html, $reportName);
            }
        } else {
            return $html;
        }
    }

    public function getVolunteersNeededReport($Year, $bReturnArray)
    {
        $html = $bReturnArray ? [] : '';
        $site = Site::join(
            'site_status',
            'sites.SiteID',
            '=',
            'site_status.SiteID'
        )->where(
            'site_status.Year',
            $Year
        )->whereNull('sites.deleted_at')->orderBy('SiteName', 'asc');
        $aSites = $site->get()->toArray();
        $projectModel = new Project();
        $sSqlVolunteersAssigned = $projectModel->getVolunteersAssignedSql();
        $sSqlPeopleNeeded = $projectModel->getPeopleNeededSql($Year);
        $aRegistered = $this->getRegisteredVolunteerEmailsReport(
            $Year,
            null,
            null,
            true
        );
        $iRegisteredCnt = count($aRegistered);
        foreach ($aSites as $site) {
            $project = Project::select(
                'projects.SequenceNumber as Proj Num',
                'projects.VolunteersNeededEst',
                DB::raw("{$sSqlVolunteersAssigned} as VolunteersAssigned"),
                DB::raw("(projects.VolunteersNeededEst - {$sSqlVolunteersAssigned}) as VolunteersNeededActual"),
                DB::raw("{$sSqlPeopleNeeded} as PeopleNeededBasedOnPercentages")
            )->join(
                'site_status',
                'projects.SiteStatusID',
                '=',
                'site_status.SiteStatusID'
            )->join(
                'project_status_options',
                'projects.Status',
                '=',
                'project_status_options.id'
            )->where('site_status.SiteStatusID', $site['SiteStatusID'])->orderBy(
                'projects.SequenceNumber',
                'asc'
            )->whereNull('projects.deleted_at')->whereNull('site_status.deleted_at');

            $aProjects = $project->get()->toArray();

            if ($bReturnArray) {
                $html[] = $site['SiteName'];
                $html = array_merge($html, $aProjects);
            } else {
                $response = $this->getResultsHtmlTable($aProjects);
                $html .= "<h3 style=\"page-break-before: always;\">{$site['SiteName']}</h3>";
                $html .= $response;
            }
        }
        if ($bReturnArray) {
            $html[] = "Total Registered:$iRegisteredCnt";
        } else {
            $html .= "<table class=\"table\">";
            $html .= "<tr>
                        <td><h2>Total Registered:$iRegisteredCnt</h2></td>
                        ";

            $html .= "</tr></table>";
        }

        return $html;
    }

    public function getBudgetAllocationReport($Year, $SiteID = null, $ProjectID = null, $bReturnArray)
    {
        $html = $bReturnArray ? [] : '';
        //'Project Report by Year, Site and Project'
        $site = Site::join(
            'site_status',
            'sites.SiteID',
            '=',
            'site_status.SiteID'
        )->where(
            'site_status.Year',
            $Year
        )->whereNull('sites.deleted_at')->orderBy('SiteName', 'asc');
        if ($SiteID) {
            //$site->where('sites.SiteID', $SiteID);
        }
        $aSites = $site->get()->toArray();
        foreach ($aSites as $site) {
            $aProjects = Project::select(
                'projects.ProjectID',
                'projects.SequenceNumber as Proj Num',
                'projects.OriginalRequest as Original Request',
                'projects.ProjectDescription as Desc',
                'projects.EstimatedCost as Est Cost',
                'projects.BudgetSources as Budget Sources',
                'projects.BudgetAvailableForPC as Budget Allocate',
                'projects.Area as Area to cover in paint or bark',
                'projects.MaterialsNeeded as Materials Needed',
                'projects.PrepWorkRequiredBeforeSIA as Prep Needed',
                'projects.PaintOrBarkEstimate as Paint or Bark Needed',
                'projects.PaintOrdered as Paint Ordered'
            )->join(
                'site_status',
                'projects.SiteStatusID',
                '=',
                'site_status.SiteStatusID'
            )->join(
                'project_status_options',
                'projects.Status',
                '=',
                'project_status_options.id'
            )->where('site_status.SiteStatusID', $site['SiteStatusID'])->orderBy(
                'projects.SequenceNumber',
                'asc'
            )->whereNull('projects.deleted_at')->whereNull('site_status.deleted_at')->get()->toArray();
            $aAmounts = [];
            $estimatedCost = 0;
            $totalAllocated = 0;
            foreach ($aProjects as $key => $aaProject) {
                //\Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,$key,$aaProject]);

                $tmpSource = '';
                $tmpAmt = '';
                $aBudgets =
                    Budget::join('budget_source_options', 'budget_source_options.id', '=', 'budgets.BudgetSource')
                          ->whereNull('budgets.deleted_at')
                          ->where('ProjectID', $aaProject['ProjectID'])
                          ->get()
                          ->toArray();
                if (!empty($aBudgets)) {
                    // \Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,
                    //     $aBudgets]);

                    foreach ($aBudgets as $aaBudget) {
                        $tmpSource .= "<div style='text-align:right;font-weight:bold'>{$aaBudget['option_label']}:</div>";
                        $tmpAmt .= "<div>\${$aaBudget['BudgetAmount']}</div>";
                        if (!isset($aAmounts[$aaBudget['option_label']])) {
                            $aAmounts[$aaBudget['option_label']] = 0;
                        }
                        $aAmounts[$aaBudget['option_label']] += $aaBudget['BudgetAmount'];
                        $totalAllocated += $aaBudget['BudgetAmount'];
                    }
                }
                $aProjects[$key]["Budget Sources"] = $tmpSource;
                $aProjects[$key]["Budget Allocate"] = $tmpAmt;
                $estimatedCost += $aaProject['Est Cost'];
            }
            $this->deleteColumn($aProjects, 'ProjectID');

            if (empty(array_filter(array_column($aProjects, 'Area to cover in paint or bark')))) {
                $this->deleteColumn($aProjects, 'Area to cover in paint or bark');
            }
            if (empty(array_filter(array_column($aProjects, 'Materials Needed')))) {
                $this->deleteColumn($aProjects, 'Materials Needed');
            }
            if (empty(array_filter(array_column($aProjects, 'Prep Needed')))) {
                $this->deleteColumn($aProjects, 'Prep Needed');
            }
            if (empty(array_filter(array_column($aProjects, 'Paint or Bark Needed')))) {
                $this->deleteColumn($aProjects, 'Paint or Bark Needed');
            }
            if (empty(array_filter(array_column($aProjects, 'Paint Ordered')))) {
                $this->deleteColumn($aProjects, 'Paint Ordered');
            }

            if ($bReturnArray) {
                $html[] = $site['SiteName'];
                $html = array_merge($html, $aProjects);
                $tmp = '';
                foreach (array_keys($aAmounts) as $budgetSrc) {
                    $tmp .= "{$budgetSrc},";
                }

                $html[] = "Totals for Site:, Estimated Cost,Total Allocated," . rtrim($tmp, ',');
                $tmp = '';
                foreach ($aAmounts as $budgetTotal) {
                    $tmp .= "\${$budgetTotal},";
                }
                $html[] = ",\${$estimatedCost},\${$totalAllocated}," . rtrim($tmp, ',');
            } else {
                $response = $this->getResultsHtmlTable($aProjects);
                $html .= "<h3 style=\"page-break-before: always;\">{$site['SiteName']}</h3>";
                $html .= $response;
                $html .= "<table class=\"table\">";
                $html .= "<tr>
                        <td rowspan='2' align='right'><h2>Totals for Site:</h2></td>
                        <td>Estimated Cost</td>
                        <td>Total Allocated</td>";
                foreach (array_keys($aAmounts) as $budgetSrc) {
                    $html .= "<td>{$budgetSrc}</td>";
                }
                $html .= "</tr>";

                $html .= "<tr>
                        
                        <td>\${$estimatedCost}</td>
                        <td>\${$totalAllocated}</td>";
                foreach ($aAmounts as $budgetTotal) {
                    $html .= "<td>\${$budgetTotal}</td>";
                }
                $html .= "</tr>";
                $html .= "</table>";
            }
        }

        return $html;
    }

    public function getBudgetAndVolunteerReport($Year, $SiteID = null, $ProjectID = null, $bReturnArray)
    {
        $html = $bReturnArray ? [] : '';
        //'Project Report by Year, Site and Project'
        $site = Site::join(
            'site_status',
            'sites.SiteID',
            '=',
            'site_status.SiteID'
        )->where(
            'site_status.Year',
            $Year
        )->whereNull('sites.deleted_at')->orderBy('SiteName', 'asc');
        if ($SiteID) {
            //$site->where('sites.SiteID', $SiteID);
        }
        $aSites = $site->get()->toArray();
        foreach ($aSites as $site) {
            $aProjects = Project::select(
                'projects.ProjectID',
                'projects.SequenceNumber as Proj Num',
                'projects.OriginalRequest as Original Request',
                'projects.ProjectDescription as Desc',
                'projects.EstimatedCost as Est Cost',
                'projects.VolunteersNeededEst as Volunteers Needed Est',
                'projects.BudgetSources as Budget Sources',
                'projects.BudgetAvailableForPC as Budget Allocate',
                'projects.Area as Area - Sq. Ft.',
                'projects.PaintOrBarkEstimate as Paint or Bark Needed',
                'projects.PermitsOrApprovalsNeeded as Permits Or Approvals Needed',
                'projects.PrepWorkRequiredBeforeSIA as Prep work before SIA Sunday',
                DB::raw("0 as `Estimator/Project Contact`")
            )->join(
                'site_status',
                'projects.SiteStatusID',
                '=',
                'site_status.SiteStatusID'
            )->join(
                'project_status_options',
                'projects.Status',
                '=',
                'project_status_options.id'
            )->where('site_status.SiteStatusID', $site['SiteStatusID'])->orderBy(
                'projects.SequenceNumber',
                'asc'
            )->whereNull('projects.deleted_at')->whereNull('site_status.deleted_at')->get()->toArray();
            $aAmounts = [];
            $estimatedCost = 0;
            $totalAllocated = 0;
            foreach ($aProjects as $key => $aaProject) {
                //\Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,$key,$aaProject]);

                $tmpSource = '';
                $tmpAmt = '';
                $aBudgets =
                    Budget::join('budget_source_options', 'budget_source_options.id', '=', 'budgets.BudgetSource')
                          ->whereNull('budgets.deleted_at')
                          ->where('ProjectID', $aaProject['ProjectID'])
                          ->get()
                          ->toArray();
                if (!empty($aBudgets)) {
                    // \Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,
                    //     $aBudgets]);

                    foreach ($aBudgets as $aaBudget) {
                        $tmpSource .= "<div style='text-align:right;font-weight:bold'>{$aaBudget['option_label']}:</div>";
                        $tmpAmt .= "<div>\${$aaBudget['BudgetAmount']}</div>";
                        if (!isset($aAmounts[$aaBudget['option_label']])) {
                            $aAmounts[$aaBudget['option_label']] = 0;
                        }
                        $aAmounts[$aaBudget['option_label']] += $aaBudget['BudgetAmount'];
                        $totalAllocated += $aaBudget['BudgetAmount'];
                    }
                }
                $aProjects[$key]["Budget Sources"] = $tmpSource;
                $aProjects[$key]["Budget Allocate"] = $tmpAmt;
                $estimatedCost += $aaProject['Est Cost'];
                $aEstimators = ProjectVolunteerRole::join(
                    'project_roles',
                    'project_roles.ProjectRoleID',
                    '=',
                    'project_volunteer_role.ProjectRoleID'
                )->join(
                    'volunteers',
                    'volunteers.VolunteerID',
                    '=',
                    'project_volunteer_role.VolunteerID'
                )->where(
                    'project_volunteer_role.ProjectID',
                    $aaProject['ProjectID']
                )->where(
                    'project_roles.Role',
                    'Estimator'
                )->whereNull(
                    'project_volunteer_role.deleted_at'
                )->whereNull('volunteers.deleted_at')->get()->toArray();
                $estimator = '';
                if (!empty($aEstimators)) {
                    foreach ($aEstimators as $aEstimator) {
                        $estimator = "{$aEstimator['LastName']},{$aEstimator['FirstName']}";
                    }
                }
                $aProjectContacts = ProjectContact::join(
                    'contacts',
                    'contacts.ContactID',
                    '=',
                    'project_contacts.ContactID'
                )->where(
                    'project_contacts.ProjectID',
                    $aaProject['ProjectID']
                )->whereNull('contacts.deleted_at')->whereNull('project_contacts.deleted_at')->get()->toArray();
                $contact = '';
                if (!empty($aProjectContacts)) {
                    foreach ($aProjectContacts as $aProjectContact) {
                        $contact = "{$aProjectContact['LastName']},{$aProjectContact['FirstName']}";
                    }
                }
                $aProjects[$key]["Estimator/Project Contact"] = "{$estimator}/{$contact}";
            }
            $this->deleteColumn($aProjects, 'ProjectID');

            if (empty(array_filter(array_column($aProjects, 'Area - Sq. Ft.')))) {
                $this->deleteColumn($aProjects, 'Area - Sq. Ft.');
            }
            if (empty(array_filter(array_column($aProjects, 'Permits Or Approvals Needed')))) {
                $this->deleteColumn($aProjects, 'Permits Or Approvals Needed');
            }
            if (empty(array_filter(array_column($aProjects, 'Prep Needed')))) {
                $this->deleteColumn($aProjects, 'Prep Needed');
            }
            if (empty(array_filter(array_column($aProjects, 'Paint or Bark Needed')))) {
                $this->deleteColumn($aProjects, 'Paint or Bark Needed');
            }
            if (empty(array_filter(array_column($aProjects, 'Prep work before SIA Sunday')))) {
                $this->deleteColumn($aProjects, 'Prep work before SIA Sunday');
            }
            if ($bReturnArray) {
                $html[] = $site['SiteName'];
                $html = array_merge($html, $aProjects);
            } else {
                $response = $this->getResultsHtmlTable($aProjects);
                $html .= "<h3 style=\"page-break-before: always;\">{$site['SiteName']}</h3>";
                $html .= $response;
            }
        }

        return $html;
    }

    public function getYearSiteProjectFullReport($Year, $SiteID, $ProjectID, $bReturnArray)
    {
        $aWorksheets = $bReturnArray ? [] : '';

        if ($bReturnArray) {
            $aProjectAttributesToRemove = [];
            $aIncludeProjectAttributes = isset($_GET['project_attributes']) ? $_GET['project_attributes'] : [];

            $projectModel = new ProjectScope();
            $aProjects = $projectModel->getReportProjects($Year, [], null);

            $aAttributes = ProjectScope::getAttributesByCodeArray('projects');
            $aFilterableAttributes = array_keys($aAttributes);
            $aFilterableAttributes[] = 'PeopleNeeded';
            $aFilterableAttributes[] = 'HasAttachments';
            $aFilterableAttributes[] = 'VolunteersAssigned';
            $aFilterableAttributes[] = 'BudgetSources';
            $aFilterableAttributes[] = 'Comments';
            $aFilterableAttributes[] = 'ProjectDescription';
            $aFilterableAttributes[] = 'OriginalRequest';
            $aFilterableAttributes[] = 'SequenceNumber';
            $aFilterableAttributes[] = 'Active';
            if (!empty($aIncludeProjectAttributes)) {
                $aProjectAttributesToRemove = array_diff($aFilterableAttributes, $aIncludeProjectAttributes);
            } else {
                $aProjectAttributesToRemove = $aFilterableAttributes;
            }

            //echo "<pre>" . print_r($aAttributes, true) . "</pre>";
            foreach ($aProjects as $idx => $aProject) {
                foreach ($aProject as $field => $value) {
                    if (isset($aAttributes[$field])) {
                        if (($value === null || $value === '') && in_array(
                                $aAttributes[$field]['input'],
                                [
                                    'select',
                                    'bool',
                                    'number',
                                    'checkbox'
                                ]
                            )
                        ) {
                            $value = $aAttributes[$field]['default_value'];
                        }
                        if ($aAttributes[$field]['input'] === 'bool') {
                            $aProjects[$idx][$field] = $value ? 'Yes' : 'No';
                        } elseif (($aAttributes[$field]['input'] === 'select' ||
                                   $aAttributes[$field]['input'] === 'checkbox') && !empty
                            (
                            $aAttributes[$field]['options_source']
                            )
                        ) {
                            if ($value !== '') {
                                $model = ProjectScope::getOptionsSourceModel($aAttributes[$field]['options_source']);
                                if ($model) {
                                    //echo "$field $value ";
                                    if (preg_match("/^\[.*?\]$/", $value)) {
                                        $value = json_decode($value, true);
                                    } else {
                                        $value = [$value];
                                    }
                                    //echo print_r($value, true);

                                    $aValues = [];
                                    foreach ($value as $val) {
                                        $rs = $model::find($val);
                                        if ($rs) {
                                            $aValues[] = $rs->option_label;
                                        }
                                    }
                                    if (!empty($aValues)) {
                                        $aProjects[$idx][$field] = join('/', $aValues);
                                    }
                                    //echo " " . $aProjects[$idx][$field] . "<br>";
                                }
                            }
                        } elseif ($aAttributes[$field]['input'] === 'table') {
                            if ($field === 'material_needed_and_cost' && !empty($value)) {
                                $aMat = json_decode($value, true);
                                //echo "<pre>" . print_r($aMat, true) . "</pre>";
                                $aMatList = [];
                                foreach ($aMat as $aMatCost) {
                                    $aMatList[] = $aMatCost[0] . ":$" . $aMatCost[1];
                                }
                                $aProjects[$idx][$field] = join(', ', $aMatList);
                            }
                        }
                    } else {
                        switch ($field) {
                            case 'HasAttachments':
                                $aProjects[$idx][$field] = $value ? 'Yes' : 'No';
                                break;
                            case 'BudgetSources':

                                if ($value !== null && $value !== '') {
                                    if (preg_match("/^\[.*?\]$/", $value)) {
                                        $value = json_decode($value, true);
                                    } else {
                                        $value = [$value];
                                    }//echo print_r($value, true);
                                    $aBSourceValues = [];
                                    foreach ($value as $val) {
                                        $rs = Budget::find($val);
                                        if ($rs) {
                                            $aBSourceValues[] = $rs->BudgetSource;
                                        }
                                    }
                                    $aValues = [];
                                    $model = ProjectScope::getOptionsSourceModel('budget_source_options');
                                    foreach ($aBSourceValues as $val) {
                                        $rs = $model::find($val);
                                        if ($rs) {
                                            $aValues[] = $rs->option_label;
                                        }
                                    }
                                    if (!empty($aValues)) {
                                        $aProjects[$idx][$field] = join(', ', $aValues);
                                    }
                                }
                                break;
                        }
                    }
                }
            }
            $this->deleteColumn($aProjects, 'ProjectID');
            $this->deleteColumn($aProjects, 'SiteStatusID');
            foreach ($aProjectAttributesToRemove as $attributesToRemove) {
                $this->deleteColumn($aProjects, $attributesToRemove);
            }

            $aAttributeLabels = ProjectScope::getAttributesLabelsArray('projects');
            $aKeys = array_keys($aProjects[0]);
            $colNames = [];
            foreach ($aKeys as $sKeyStr):
                //echo "$sKeyStr<br>";
                if (isset($aAttributeLabels[$sKeyStr])) {
                    $colNames[] = $aAttributeLabels[$sKeyStr];
                } else {
                    if ($sKeyStr === 'SequenceNumber') {
                        $sKeyStr = 'Project#';
                    }
                    $colName = preg_replace("/( |\/)/", '-', $sKeyStr);
                    $colNames[] = $colName;
                }

            endforeach;
            $date = date('l, F d, Y');
            $aWorksheets['Project Report'] = ['header_year'=>"Spring Into Action $Year",'header_report_name'=> 'Project Report',
                'header_date'=>$date,'column_names'=>$colNames,'table_data'=>$aProjects];

            $aProjectManagers = $this->getRegisteredProjectManagerEmailsReport($Year, $SiteID, $ProjectID, true);
            $aKeys = !empty($aProjectManagers) ? array_keys($aProjectManagers[0]) : [];
            $colNames = [];
            foreach ($aKeys as $sKeyStr):
                //echo "$sKeyStr<br>";
                if (isset($aAttributeLabels[$sKeyStr])) {
                    $colNames[] = $aAttributeLabels[$sKeyStr];
                } else {
                    if ($sKeyStr === 'SequenceNumber') {
                        $sKeyStr = 'Project#';
                    }
                    $colName = preg_replace("/( |\/)/", '-', $sKeyStr);
                    $colNames[] = $colName;
                }

            endforeach;
            $aWorksheets['Project Mgr & Site Coor'] = ['header_year'=>"Spring Into Action $Year",
                'header_report_name'=> 'Project Manager & Site Coordinator',
                'header_date'=>$date,'column_names'=>$colNames,'table_data'=>$aProjectManagers];

            $aTeamLeaders = $this->getRegisteredTeamLeaderEmailsReport($Year, $SiteID, $ProjectID, true);
            $aKeys = !empty($aTeamLeaders) ? array_keys($aTeamLeaders[0]) : [];
            $colNames = [];
            foreach ($aKeys as $sKeyStr):
                //echo "$sKeyStr<br>";
                if (isset($aAttributeLabels[$sKeyStr])) {
                    $colNames[] = $aAttributeLabels[$sKeyStr];
                } else {
                    if ($sKeyStr === 'SequenceNumber') {
                        $sKeyStr = 'Project#';
                    }
                    $colName = preg_replace("/( |\/)/", '-', $sKeyStr);
                    $colNames[] = $colName;
                }

            endforeach;
            $aWorksheets['Team Leaders'] = ['header_year'=>"Spring Into Action $Year",'header_report_name'=> 'Team Leaders',
                'header_date'=>$date,'column_names'=>$colNames,'table_data'=>$aTeamLeaders];

            $aVolunteers = $this->getVolunteerAssignmentForPacketsReport($Year, true);
            $aKeys = !empty($aVolunteers) ? array_keys($aVolunteers[0]) : [];
            $colNames = [];
            foreach ($aKeys as $sKeyStr):
                //echo "$sKeyStr<br>";
                if (isset($aAttributeLabels[$sKeyStr])) {
                    $colNames[] = $aAttributeLabels[$sKeyStr];
                } else {
                    if ($sKeyStr === 'SequenceNumber') {
                        $sKeyStr = 'Project#';
                    }
                    $colName = preg_replace("/( |\/)/", '-', $sKeyStr);
                    $colNames[] = $colName;
                }

            endforeach;
            $aWorksheets['Volunteers'] = ['header_year'=>"Spring Into Action $Year",
                'header_report_name'=> 'Volunteers',
                'header_date'=>$date,'column_names'=>$colNames,'table_data'=>$aVolunteers];

        } else {
            $response =
                "<div style='width:100%;text-align:center;font-size:20px'>This report must be <a href=\"/admin/report/projects_full/{$Year}/{$SiteID}/{$ProjectID}/spreadsheet\" class=\"must-download-spreadsheet\">downloaded</a></div>
                <div style='width:100%;text-align:center;font-size:14px'>Before you click the [downloaded] link, check or uncheck the project attributes above to customize this report</div>
                ";

            $aWorksheets .= $response;
        }

        //echo "<pre>" . print_r($html, true) . "</pre>";die;
        return $aWorksheets;
    }

    public function getYearSiteProjectReport($Year, $SiteID = null, $ProjectID = null, $bReturnArray)
    {
        $html = $bReturnArray ? [] : '';
        //'Project Report by Year, Site and Project'
        // $site = Site::join(
        //     'site_status',
        //     'sites.SiteID',
        //     '=',
        //     'site_status.SiteID'
        // )->where(
        //     'site_status.Year',
        //     $Year
        // )->whereNull('sites.deleted_at')->orderBy('SiteName', 'asc');
        // if ($SiteID) {
        //     //$site->where('sites.SiteID', $SiteID);
        // }
        // $aSites = $site->get()->toArray();
        // foreach ($aSites as $site) {
        //
        //     $aProjects = ProjectScope::getSiteProjects($site['SiteStatusID'], true);
        //     // site, projnum, desc, status, comments, child friendly,primary skill needed,vol needed, volun reg, mat
        //     // needed, budget src, est total cost, final cost, special equipment
        //     // $aProjects = Project::select(
        //     //     'projects.SequenceNumber as Proj Num',
        //     //     'projects.OriginalRequest',
        //     //     'projects.Comments',
        //     //     'project_status_options.option_label as Status',
        //     //     'projects.StatusReason'
        //     // )->join(
        //     //     'site_status',
        //     //     'projects.SiteStatusID',
        //     //     '=',
        //     //     'site_status.SiteStatusID'
        //     // )->join(
        //     //     'project_status_options',
        //     //     'projects.Status',
        //     //     '=',
        //     //     'project_status_options.id'
        //     // )->where('site_status.SiteStatusID', $site['SiteStatusID'])->orderBy(
        //     //     'projects.SequenceNumber',
        //     //     'asc'
        //     // )->whereNull('projects.deleted_at')->whereNull('site_status.deleted_at')->get()->toArray();
        //
        //     if ($bReturnArray) {
        //         $html[] = $site['SiteName'];
        //         $html = array_merge($html, $aProjects);
        //     } else {
        //         $response = $this->getResultsHtmlTable($aProjects);
        //         $html .= "<h3 style=\"page-break-before: always;\">{$site['SiteName']}</h3>";
        //         $html .= $response;
        //     }
        // }
        $projectScope = new ProjectScope();
        $aProjects = $projectScope->getAllProjects();
        if ($bReturnArray) {
            $html = $aProjects;
        } else {
            $response = $this->getResultsHtmlTable($aProjects);
            //$html .= "<h3 style=\"page-break-before: always;\">{$site['SiteName']}</h3>";
            $html .= $response;
        }

        return $html;
    }

    public function getYearSiteReport($Year, $bReturnArray)
    {
        // DB::raw('CONCAT(volunteers.FirstName, \' \', volunteers.LastName) as Project Manager')
        $aSites = Site::select(
            'sites.SiteName'
        )
                      ->selectRaw("CONCAT(volunteers.FirstName, ' ', volunteers.LastName) as `Project Manager`")
                      ->join(
                          'site_status',
                          'sites.SiteID',
                          '=',
                          'site_status.SiteID'
                      )
                      ->leftJoin(
                          'site_volunteers',
                          'site_volunteers.SiteStatusID',
                          '=',
                          'site_status.SiteStatusID'
                      )
                      ->leftJoin(
                          'site_volunteer_role',
                          function ($join) {
                              $join->on(
                                  'site_volunteer_role.SiteVolunteerID',
                                  '=',
                                  'site_volunteers.SiteVolunteerID'
                              )->where(
                                  'site_volunteer_role.SiteRoleID',
                                  '=',
                                  2
                              );
                          }
                      )
                      ->leftJoin(
                          'volunteers',
                          'volunteers.VolunteerID',
                          '=',
                          'site_volunteers.VolunteerID'
                      )
                      ->where(
                          'site_status.Year',
                          $Year
                      )
                      ->whereNull('volunteers.deleted_at')
                      ->whereNull('site_status.deleted_at')
                      ->whereNull('sites.deleted_at')
                      ->orderBy('sites.SiteName', 'asc')
                      ->get()
                      ->toArray();

        return $bReturnArray ? $aSites : $this->getResultsHtmlTable($aSites);
    }

    public function getEarlyStartProjectsReport($Year, $SiteID = null, $ProjectID = null, $bReturnArray)
    {
        $html = $bReturnArray ? [] : '';
        //'Project Report by Year, Site and Project'
        $site = Site::join(
            'site_status',
            'sites.SiteID',
            '=',
            'site_status.SiteID'
        )->where(
            'site_status.Year',
            $Year
        )->whereNull('sites.deleted_at')->orderBy('SiteName', 'asc');
        if ($SiteID) {
            //$site->where('sites.SiteID', $SiteID);
        }
        $aSites = $site->get()->toArray();
        foreach ($aSites as $site) {
            $aProjects = Project::select(
                'projects.ProjectID',
                'projects.SequenceNumber as Proj Num',
                'projects.OriginalRequest as Original Request',
                'projects.ProjectDescription as Desc',
                DB::raw("0 as `Project Coordinator`"),
                DB::raw("0 as `Team Leader`"),
                DB::raw("0 as `Project Contact`"),
                'projects.EstimatedCost as Est Cost',
                'projects.PrimarySkillNeeded as Primary Skill Needed'

            )->join(
                'site_status',
                'projects.SiteStatusID',
                '=',
                'site_status.SiteStatusID'
            )->join(
                'project_status_options',
                'projects.Status',
                '=',
                'project_status_options.id'
            )->where('site_status.SiteStatusID', $site['SiteStatusID'])->orderBy(
                'projects.SequenceNumber',
                'asc'
            )->whereNull('projects.deleted_at')->whereNull('site_status.deleted_at')->get()->toArray();

            foreach ($aProjects as $key => $aaProject) {
                $aVolunteerRoles = ProjectVolunteerRole::join(
                    'project_roles',
                    'project_roles.ProjectRoleID',
                    '=',
                    'project_volunteer_role.ProjectRoleID'
                )->join(
                    'volunteers',
                    'volunteers.VolunteerID',
                    '=',
                    'project_volunteer_role.VolunteerID'
                )->where(
                    'project_volunteer_role.ProjectID',
                    $aaProject['ProjectID']
                )->whereNull('volunteers.deleted_at')->get()->toArray();

                if (!empty($aVolunteerRoles)) {
                    foreach ($aVolunteerRoles as $aVolunteerRole) {
                        if ($aVolunteerRole['ProjectRoleID'] === 68) {
                            $aProjects[$key]["Project Coordinator"] =
                                "{$aVolunteerRole['LastName']},{$aVolunteerRole['FirstName']}";
                        }

                        if ($aVolunteerRole['ProjectRoleID'] === 5) {
                            $aProjects[$key]["Team Leader"] =
                                "{$aVolunteerRole['LastName']},{$aVolunteerRole['FirstName']}";
                        }
                    }
                }
                $aProjectContacts = ProjectContact::join(
                    'contacts',
                    'contacts.ContactID',
                    '=',
                    'project_contacts.ContactID'
                )->where(
                    'project_contacts.ProjectID',
                    $aaProject['ProjectID']
                )->whereNull('contacts.deleted_at')->whereNull('project_contacts.deleted_at')->get()->toArray();
                $contact = '';
                if (!empty($aProjectContacts)) {
                    foreach ($aProjectContacts as $aProjectContact) {
                        $contact = "{$aProjectContact['LastName']},{$aProjectContact['FirstName']}";
                    }
                }
                $aProjects[$key]["Project Contact"] = "{$contact}";
                $aSkillsNeeded = ProjectSkillNeededOptions::select('option_label')->whereIn(
                    'id',
                    preg_split('/,/', $aaProject['Primary Skill Needed'])
                )->get()->toArray();
                $aProjects[$key]["Primary Skill Needed"] = join('<br>', array_column($aSkillsNeeded, 'option_label'));
            }
            $this->deleteColumn($aProjects, 'ProjectID');

            if ($bReturnArray) {
                $html[] = $site['SiteName'];
                $html = array_merge($html, $aProjects);
            } else {
                $response = $this->getResultsHtmlTable($aProjects);
                $html .= "<h3 style=\"page-break-before: always;\">{$site['SiteName']}</h3>";
                $html .= $response;
            }
        }

        return $html;
    }

    public function getVolunteerAssignmentForPacketsReport($Year, $bReturnArray)
    {
        $aVolunteers = Volunteer::select(
            DB::raw("concat(volunteers.LastName,', ',volunteers.FirstName) as Name"),
            'volunteers.MobilePhoneNumber as Contact Phone',
            'sites.SiteName as Site Name',
            'projects.SequenceNumber as Proj Num',
            'projects.ProjectDescription as Project Description'
        )
                                ->join(
                                    'project_volunteers',
                                    'project_volunteers.VolunteerID',
                                    '=',
                                    'volunteers.VolunteerID'
                                )
                                ->join(
                                    'projects',
                                    'projects.ProjectID',
                                    '=',
                                    'project_volunteers.ProjectID'
                                )
                                ->join(
                                    'site_status',
                                    'projects.SiteStatusID',
                                    '=',
                                    'site_status.SiteStatusID'
                                )
                                ->join(
                                    'sites',
                                    'sites.SiteID',
                                    '=',
                                    'site_status.SiteID'
                                )
                                ->whereNull('volunteers.deleted_at')
                                ->whereNull('project_volunteers.deleted_at')
                                ->whereNull(
                                    'projects.deleted_at'
                                )
                                ->whereNull('site_status.deleted_at')
                                ->whereNull('sites.deleted_at')
                                ->where('site_status.Year', $Year)
                                ->orderBy('volunteers.LastName', 'asc')
                                ->get()
                                ->toArray();

        if ($this->downloadType === 'pdf' && count($aVolunteers) > 500) {
            return "This report is too big to download as a PDF. Please choose a different download type.";
        }

        return $bReturnArray ? $aVolunteers : $this->getResultsHtmlTable($aVolunteers);
    }

    public function getRegisteredVolunteerEmailsReport($Year, $SiteID = null, $ProjectID = null, $bReturnArray)
    {
        $aVolunteers = Volunteer::select(
            'volunteers.Email',
            'volunteers.FirstName as First Name',
            'volunteers.LastName as Last Name',
            'sites.SiteName as Site Name',
            'projects.SequenceNumber as Proj Num',
            'projects.ProjectDescription as Project Description',
            'project_volunteers.created_at',
            'volunteers.TeamLeaderWilling'
        )
                                ->join(
                                    'project_volunteers',
                                    'project_volunteers.VolunteerID',
                                    '=',
                                    'volunteers.VolunteerID'
                                )
                                ->join(
                                    'projects',
                                    'projects.ProjectID',
                                    '=',
                                    'project_volunteers.ProjectID'
                                )
                                ->join(
                                    'project_volunteer_role',
                                    function ($join) {
                                        $join->on(
                                            "project_volunteer_role.ProjectID",
                                            "=",
                                            "project_volunteers.ProjectID"
                                        )->whereRaw(
                                            "project_volunteer_role.VolunteerID = project_volunteers.VolunteerID and project_volunteer_role.Status = 5"
                                        );
                                    }
                                )
                                ->join(
                                    'site_status',
                                    'projects.SiteStatusID',
                                    '=',
                                    'site_status.SiteStatusID'
                                )
                                ->join(
                                    'sites',
                                    'sites.SiteID',
                                    '=',
                                    'site_status.SiteID'
                                )
                                ->whereNull('volunteers.deleted_at')
                                ->whereNull('project_volunteers.deleted_at')
                                ->whereNull(
                                    'project_volunteer_role.deleted_at'
                                )
                                ->whereNull('projects.deleted_at')
                                ->whereNull('site_status.deleted_at')
                                ->whereNull('sites.deleted_at')
                                ->where('site_status.Year', $Year)
                                ->orderBy('sites.SiteName', 'asc')
                                ->orderBy('projects.SequenceNumber', 'asc')
                                ->orderBy('project_volunteers.created_at', 'asc')
                                ->get()
                                ->toArray();

        if ($this->downloadType === 'pdf' && count($aVolunteers) > 500) {
            return "This report is too big to download as a PDF. Please choose a different download type.";
        }

        return $bReturnArray ? $aVolunteers : $this->getResultsHtmlTable($aVolunteers);
    }

    public function getRegisteredTeamLeaderEmailsReport($Year, $SiteID = null, $ProjectID = null, $bReturnArray)
    {
        $aVolunteers = Volunteer::select(
            'sites.SiteName as Site Name',
            'projects.SequenceNumber as Proj Num',
            'projects.ProjectDescription as Project Description',
            'volunteers.LastName as Last Name',
            'volunteers.FirstName as First Name',
            'volunteers.Email',
            'volunteers.MobilePhoneNumber',
            'volunteers.HomePhoneNumber',
            'volunteers.TeamLeaderWilling',
            'project_volunteers.created_at'
        )
                                ->join(
                                    'project_volunteers',
                                    'project_volunteers.VolunteerID',
                                    '=',
                                    'volunteers.VolunteerID'
                                )
                                ->join(
                                    'projects',
                                    'projects.ProjectID',
                                    '=',
                                    'project_volunteers.ProjectID'
                                )
                                ->join(
                                    'project_volunteer_role',
                                    function ($join) {
                                        $join->on(
                                            "project_volunteer_role.ProjectID",
                                            "=",
                                            "project_volunteers.ProjectID"
                                        )->whereRaw(
                                            "project_volunteer_role.VolunteerID = project_volunteers.VolunteerID and project_volunteer_role.Status = 5 and project_volunteer_role.ProjectRoleID = 5"
                                        );
                                    }
                                )
                                ->join(
                                    'site_status',
                                    'projects.SiteStatusID',
                                    '=',
                                    'site_status.SiteStatusID'
                                )
                                ->join(
                                    'sites',
                                    'sites.SiteID',
                                    '=',
                                    'site_status.SiteID'
                                )
                                ->whereNull('volunteers.deleted_at')
                                ->whereNull('project_volunteers.deleted_at')
                                ->whereNull(
                                    'project_volunteer_role.deleted_at'
                                )
                                ->whereNull('projects.deleted_at')
                                ->whereNull('site_status.deleted_at')
                                ->whereNull('sites.deleted_at')
                                ->where('site_status.Year', $Year)
                                ->orderBy('sites.SiteName', 'asc')
                                ->orderBy('projects.SequenceNumber', 'asc')
                                ->orderBy('project_volunteers.created_at', 'asc')
                                ->get()
                                ->toArray();

        if ($this->downloadType === 'pdf' && count($aVolunteers) > 500) {
            return "This report is too big to download as a PDF. Please choose a different download type.";
        }

        return $bReturnArray ? $aVolunteers : $this->getResultsHtmlTable($aVolunteers);
    }

    public function getRegisteredProjectManagerEmailsReport($Year, $SiteID = null, $ProjectID = null, $bReturnArray)
    {
        $aSites = Site::select(
            'sites.SiteName as Site Name',
            'volunteers.LastName as Last Name',
            'volunteers.FirstName as First Name',
            'volunteers.Email',
            'volunteers.MobilePhoneNumber',
            'volunteers.HomePhoneNumber'
        )
                      ->join(
                          'site_status',
                          'sites.SiteID',
                          '=',
                          'site_status.SiteID'
                      )
                      ->leftJoin(
                          'site_volunteers',
                          'site_volunteers.SiteStatusID',
                          '=',
                          'site_status.SiteStatusID'
                      )
                      ->leftJoin(
                          'site_volunteer_role',
                          function ($join) {
                              $join->on(
                                  'site_volunteer_role.SiteVolunteerID',
                                  '=',
                                  'site_volunteers.SiteVolunteerID'
                              )->whereIn(
                                  'site_volunteer_role.SiteRoleID',
                                  [1,2]
                              );
                          }
                      )
                      ->leftJoin(
                          'volunteers',
                          'volunteers.VolunteerID',
                          '=',
                          'site_volunteers.VolunteerID'
                      )
                      ->where(
                          'site_status.Year',
                          $Year
                      )
                      ->whereNull('volunteers.deleted_at')
                      ->whereNull('site_status.deleted_at')
                      ->whereNull('sites.deleted_at')
                      ->orderBy('sites.SiteName', 'asc')
                      ->get()
                      ->toArray();

        return $bReturnArray ? $aSites : $this->getResultsHtmlTable($aSites);
    }

    public function getVolunteerAssignmentForMailMergeReport($Year, $SiteID = null, $ProjectID = null, $bReturnArray)
    {
        $html = $bReturnArray ? [] : '';

        $site = Site::join(
            'site_status',
            'sites.SiteID',
            '=',
            'site_status.SiteID'
        )->whereNull('sites.deleted_at')->where(
            'site_status.Year',
            $Year
        )->orderBy('SiteName', 'asc');
        if ($SiteID) {
            //$site->where('sites.SiteID', $SiteID);
        }
        $aSites = $site->get()->toArray();
        foreach ($aSites as $site) {
            $aProjectRows = [];
            $aProjects = Project::select(
                'projects.ProjectID',
                'projects.SequenceNumber as Proj Num',
                'projects.OriginalRequest',
                'projects.ProjectDescription as Project Description'
            )->join(
                'site_status',
                'projects.SiteStatusID',
                '=',
                'site_status.SiteStatusID'
            )->join(
                'project_status_options',
                'projects.Status',
                '=',
                'project_status_options.id'
            )->where('site_status.SiteStatusID', $site['SiteStatusID'])->orderBy(
                'projects.SequenceNumber',
                'asc'
            )->whereNull('projects.deleted_at')->whereNull('site_status.deleted_at')->get()->toArray();

            foreach ($aProjects as $aProject) {
                $ProjectID = $aProject['ProjectID'];
                unset($aProject['ProjectID']);

                $projectTable = $this->getResultsHtmlTable([$aProject], false);
                $Volunteers = ProjectVolunteer::select(
                    'project_roles.Role',
                    DB::raw("concat(volunteers.LastName,', ',volunteers.FirstName) as `Full Name`"),
                    'volunteers.MobilePhoneNumber as Contact Phone',
                    'volunteers.Email',
                    'volunteers.AgeRange as Age Range',
                    'volunteers.Equipment as Additional Information'
                )->join(
                    'volunteers',
                    'project_volunteers.VolunteerID',
                    '=',
                    'volunteers.VolunteerID'
                )->join(
                    'project_volunteer_role',
                    function ($join) use ($ProjectID) {
                        $join->on(
                            'project_volunteer_role.VolunteerID',
                            '=',
                            'volunteers.VolunteerID'
                        )->where('project_volunteer_role.ProjectID', '=', $ProjectID);
                    }
                )->join(
                    'project_roles',
                    'project_roles.ProjectRoleID',
                    '=',
                    'project_volunteer_role.ProjectRoleID'
                )->whereNull('volunteers.deleted_at')->where('project_volunteers.ProjectID', '=', $ProjectID)->orderBy(
                    'volunteers.LastName',
                    'desc'
                );
                $aVolunteers = $Volunteers->get()->toArray();

                foreach ($aVolunteers as $key => $aVolunteer) {
                    $aAgeRanges = VolunteerAgeRangeOptions::select('option_label')->whereIn(
                        'id',
                        preg_split("/,/", $aVolunteer['Age Range'])
                    )->get()->toArray();
                    $aVolunteers[$key]['Age Range'] = join(',', array_column($aAgeRanges, 'option_label'));
                }
                $budgetAmt = 0.00;
                $aBudgets = Budget::where('ProjectID', $ProjectID)->get()->toArray();
                if (!empty($aBudgets)) {
                    foreach ($aBudgets as $aaBudget) {
                        $budgetAmt += $aaBudget['BudgetAmount'];
                    }
                }
                $volunteersTable = $this->getResultsHtmlTable($aVolunteers);
                $aVolunteerHeaders = [
                    [
                        '<h4 class="Assigned-Volunteers">Assigned Volunteers</h4>',
                        '<strong>Assigned Volunteer count w/ Project Coordinator:</strong> ' . count(
                            $aVolunteers
                        ),
                        '<strong>Budget Available:</strong> $' . $budgetAmt,
                    ],
                ];
                $volunteerHeaders =
                    $this->getResultsHtmlTable($aVolunteerHeaders, false, 'no-tbody-border Volunteer-Headers');
                $aProjectRows[] =
                    "<div class=\"Volunteer-Assignment\">" .
                    $projectTable .
                    $volunteerHeaders .
                    $volunteersTable .
                    "</div>";
            }
            if ($bReturnArray) {
                $html[] = $site['SiteName'];
                $html = array_merge($html, $aProjectRows);
            } else {
                $response = join('', $aProjectRows);
                $html .= "<h3 style=\"page-break-before: always;\">{$site['SiteName']}</h3>";
                $html .= $response;
            }
        }

        return $html;
    }

    public function getResultsHtmlTable($aaRows, $bStripeTable = true, $addClasses = '')
    {
        $tableStripeClass = $bStripeTable ? 'table-striped' : '';
        $aTableResults = [];
        $aTableResults[] = "<table class=\"table {$tableStripeClass} {$addClasses}\">";
        $j = 0;
        $aKeys = [];
        foreach ($aaRows as $aaRow) {
            if (is_array($aaRow) && !\is_numeric(\key($aaRow))) {
                $aKeys = array_keys($aaRow);
                if ($j == 0) {
                    $aTableResults[] = "<thead><tr>";
                    foreach ($aKeys as $sKeyStr):
                        $colName = preg_replace("/( |\/)/", '-', $sKeyStr);
                        $aTableResults[] = "<th class=\"{$colName}\">{$sKeyStr}</th>";
                    endforeach;
                    $aTableResults[] = "</tr></thead>";
                }
            }
            $aTableResults[] = "<tr>";
            $i = 0;
            if (is_string($aaRow)) {
                $aaRow = [$aaRow];
            }
            foreach ($aaRow as $sTableField => $sStr):
                $sStr = empty($sStr) ? '&nbsp;' : $sStr;
                $colName = !empty($aKeys) ? preg_replace("/( |\/)/", '-', $aKeys[$i]) : '';
                $aTableResults[] = "<td class=\"{$colName}\">{$sStr}</td>";
                $i++;
            endforeach;
            $aTableResults[] = "</tr>";
            $j++;
        }

        $aTableResults[] = "</table>";

        return implode('', $aTableResults);
    }

    public function deleteColumn(&$array, $key)
    {
        return array_walk(
            $array,
            function (&$v) use ($key) {
                unset($v[$key]);
            }
        );
    }

    public function getBootstrapTableClasses()
    {
        return <<<CSS
body{line-height:.85;}
.report-title{line-height:.85;}      
.report-title small{font-size: 0.67em;color:#777777;}
.table{width:100%;max-width:100%;margin-bottom:20px;border-spacing: 0;border-collapse: collapse;}
.table>tbody>tr>td,.table>tbody>tr>th,.table>tfoot>tr>td,.table>tfoot>tr>th,.table>thead>tr>td,.table>thead>tr>th{padding:2px;line-height:.85;vertical-align:top;border-top:1px solid #ddd}
.table>thead>tr>th{vertical-align:bottom;border-bottom:2px solid #ddd}
.table>caption+thead>tr:first-child>td,.table>caption+thead>tr:first-child>th,.table>colgroup+thead>tr:first-child>td,.table>colgroup+thead>tr:first-child>th,.table>thead:first-child>tr:first-child>td,.table>thead:first-child>tr:first-child>th{border-top:0}
.table>tbody+tbody{border-top:2px solid #ddd}
.table .table{background-color:#fff}
.table-condensed>tbody>tr>td,.table-condensed>tbody>tr>th,.table-condensed>tfoot>tr>td,.table-condensed>tfoot>tr>th,.table-condensed>thead>tr>td,.table-condensed>thead>tr>th{padding:2px}
.table-bordered,.table-bordered>tbody>tr>td,.table-bordered>tbody>tr>th,.table-bordered>tfoot>tr>td,.table-bordered>tfoot>tr>th,.table-bordered>thead>tr>td,.table-bordered>thead>tr>th{border:1px solid #ddd}
.table-bordered>thead>tr>td,.table-bordered>thead>tr>th{border-bottom-width:2px;border-color:#9f9f9f}
.table-striped>tbody>tr:nth-of-type(odd){background-color:#f9f9f9}
.table-hover>tbody>tr:hover,.table>tbody>tr.active>td,.table>tbody>tr.active>th,.table>tbody>tr>td.active,.table>tbody>tr>th.active,.table>tfoot>tr.active>td,.table>tfoot>tr.active>th,.table>tfoot>tr>td.active,.table>tfoot>tr>th.active,.table>thead>tr.active>td,.table>thead>tr.active>th,.table>thead>tr>td.active,.table>thead>tr>th.active{background-color:#f5f5f5}
.table-hover>tbody>tr.active:hover>td,.table-hover>tbody>tr.active:hover>th,.table-hover>tbody>tr:hover>.active,.table-hover>tbody>tr>td.active:hover,.table-hover>tbody>tr>th.active:hover{background-color:#e8e8e8}
.table>tbody>tr.success>td,.table>tbody>tr.success>th,.table>tbody>tr>td.success,.table>tbody>tr>th.success,.table>tfoot>tr.success>td,.table>tfoot>tr.success>th,.table>tfoot>tr>td.success,.table>tfoot>tr>th.success,.table>thead>tr.success>td,.table>thead>tr.success>th,.table>thead>tr>td.success,.table>thead>tr>th.success{background-color:#dff0d8}
.table-hover>tbody>tr.success:hover>td,.table-hover>tbody>tr.success:hover>th,.table-hover>tbody>tr:hover>.success,.table-hover>tbody>tr>td.success:hover,.table-hover>tbody>tr>th.success:hover{background-color:#d0e9c6}
.table>tbody>tr.info>td,.table>tbody>tr.info>th,.table>tbody>tr>td.info,.table>tbody>tr>th.info,.table>tfoot>tr.info>td,.table>tfoot>tr.info>th,.table>tfoot>tr>td.info,.table>tfoot>tr>th.info,.table>thead>tr.info>td,.table>thead>tr.info>th,.table>thead>tr>td.info,.table>thead>tr>th.info{background-color:#d9edf7}
.table-hover>tbody>tr.info:hover>td,.table-hover>tbody>tr.info:hover>th,.table-hover>tbody>tr:hover>.info,.table-hover>tbody>tr>td.info:hover,.table-hover>tbody>tr>th.info:hover{background-color:#c4e3f3}
.table>tbody>tr.warning>td,.table>tbody>tr.warning>th,.table>tbody>tr>td.warning,.table>tbody>tr>th.warning,.table>tfoot>tr.warning>td,.table>tfoot>tr.warning>th,.table>tfoot>tr>td.warning,.table>tfoot>tr>th.warning,.table>thead>tr.warning>td,.table>thead>tr.warning>th,.table>thead>tr>td.warning,.table>thead>tr>th.warning{background-color:#fcf8e3}
.table-hover>tbody>tr.warning:hover>td,.table-hover>tbody>tr.warning:hover>th,.table-hover>tbody>tr:hover>.warning,.table-hover>tbody>tr>td.warning:hover,.table-hover>tbody>tr>th.warning:hover{background-color:#faf2cc}
.table>tbody>tr.danger>td,.table>tbody>tr.danger>th,.table>tbody>tr>td.danger,.table>tbody>tr>th.danger,.table>tfoot>tr.danger>td,.table>tfoot>tr.danger>th,.table>tfoot>tr>td.danger,.table>tfoot>tr>th.danger,.table>thead>tr.danger>td,.table>thead>tr.danger>th,.table>thead>tr>td.danger,.table>thead>tr>th.danger{background-color:#f2dede}
.table-hover>tbody>tr.danger:hover>td,.table-hover>tbody>tr.danger:hover>th,.table-hover>tbody>tr:hover>.danger,.table-hover>tbody>tr>td.danger:hover,.table-hover>tbody>tr>th.danger:hover{background-color:#ebcccc}

.table .table {
            background-color: transparent;
        }
        .table.no-padding > tbody > tr > td {
            padding: 0;
        }
        .table-striped .table-striped > tbody > tr:nth-of-type(odd) {
            background-color: #ebe5cd;
        }
        table.no-tbody-border > tbody > tr > td {
            border: 0;
        }
        
        div.Volunteer-Assignment {
            border-top: 3px solid black;
            padding-bottom:5px;
            margin-bottom:10px;
        }
        div.Volunteer-Assignment:nth-of-type(odd) {
            background-color: #f9f9f9;
        }
        div.Volunteer-Assignment .table-striped > tbody > tr:nth-of-type(odd) {
            background-color: #ebe5cd;
        }
        table.Volunteer-Headers {
            margin-bottom:0;
        }
        h4.Assigned-Volunteers {
            margin: 0;
        }

.Name, .Full-Name {
    max-width: 150px;
    white-space: nowrap;
}
.Contact-Phone {
    max-width: 130px;
    white-space: nowrap;
}
.Site-Name {
    max-width: 200px;
    white-space: nowrap;
}
.Proj-Num {
    max-width:75px;
}
.Est-Cost {
    max-width: 75px;
}
.Volunteers-Needed-Est{
    max-width: 75px;
}
.Budget-Sources {
   max-width: 75px;
}
.Budget-Allocate {
    max-width: 75px;
}
.Estimator-Project-Contact{
    max-width: 125px;
}
.Status {
    max-width:100px;
}
.StatusReason {
    width: auto;
}
.Role {
    max-width: 30px;
    white-space: nowrap;
}
.Additional-Information {
    width:100%;
}
.Email {
    max-width: 255px;
    white-space: nowrap;
}
.Age-Range {
    max-width: 100px;
    white-space: nowrap;
}

CSS;
    }

    public function getPDF($html, $reportName)
    {
        $options = new Options();
        //$options->set('defaultFont', 'DejaVu Sans');
        $options->set('defaultFont', 'Source Sans Pro');
        $options->set('isHtml5ParserEnabled', true);
        // $pathPrefix = Storage::disk('local')->getDriver()->getAdapter()->getPathPrefix() . '/dompdf/';
        // $options->set('tempDir', $pathPrefix);
        // $options->set('debugKeepTemp', true);
        $options->set('isFontSubsettingEnabled', true);

        //$options->set('debugCss', true);
        // $options->set('debugLayout', true);
        // $options->set('debugLayoutLines', true);
        // $options->set('debugLayoutBlocks', true);
        // $options->set('debugLayoutInline', true);
        // $options->set('debugLayoutPaddingBox', true);
        // instantiate and use the dompdf class
        $dompdf = new Dompdf($options);
        //
        $fm = $dompdf->getFontMetrics();
        $fm->registerFont(
            ['family' => 'Source Sans Pro', 'weight' => 'normal', 'style' => ''],
            public_path() . '/fonts/source-sans-pro-release/TTF/SourceSansPro-Regular.ttf'
        );
        $fm->registerFont(
            ['family' => 'Source Sans Pro', 'weight' => 'normal', 'style' => 'italic'],
            public_path() . '/fonts/source-sans-pro-release/TTF/SourceSansPro-It.ttf'
        );
        $fm->registerFont(
            ['family' => 'Source Sans Pro', 'weight' => 'bold', 'style' => ''],
            public_path() . '/fonts/source-sans-pro-release/TTF/SourceSansPro-Semibold.ttf'
        );
        $fm->registerFont(
            ['family' => 'Source Sans Pro', 'weight' => 'bold', 'style' => 'italic'],
            public_path() . '/fonts/source-sans-pro-release/TTF/SourceSansPro-SemiboldIt.ttf'
        );
        $dompdf->setFontMetrics($fm);
        $stylesheet = new \Dompdf\Css\Stylesheet($dompdf);
        $stylesheet->load_css_file(public_path() . '/fonts/source-sans-pro-release/source-sans-pro-dompdf.css');
        $style = $stylesheet->create_style();
        $style->set_font_size('xx-small');
        //$style->set_font_family('Source Sans Pro');
        //$stylesheet->add_style('body', $style);

        $css = $this->getBootstrapTableClasses();

        $stylesheet->load_css($css);

        $dompdf->setCss($stylesheet);
        //$dompdf->setPaper('letter', 'landscape');
        $dompdf->loadHtml($html);

        // Render the HTML as PDF
        $dompdf->render();
        $filename = self::getDownloadFileName($reportName) . ".pdf";
        // Output the generated PDF to Browser
        $dompdf->stream($filename);
    }

    public static function getDownloadFileName($reportName)
    {
        $reportName = trim(strtolower($reportName));
        $reportName = str_replace(' ', '-', $reportName);
        $reportName = preg_replace("/[^a-z\-]/", "", $reportName);
        $reportName = preg_replace("/-+/", "-", $reportName);

        return $reportName;
    }

    /**
     * Creates, logs and returns the result of fputcsv() for debugging purposes
     *
     * @param array  $fields
     * @param string $reportName
     *
     * @return bool|string
     */
    public function getCSV(array $fields, $reportName)
    {
        $f = fopen('php://memory', 'r+');
        foreach ($fields as $line) {
            $line = !is_array($line) ? [$line] : $line;
            if (fputcsv($f, $line) === false) {
                return 'CSV Failed to write';
            }
        }
        rewind($f);
        $csvContent = stream_get_contents($f);
        ob_start();
        if (headers_sent()) {
            die("Unable to stream csv: headers already sent");
        }
        header_remove("Content-Type");
        header("Cache-Control: private");
        header("Content-Type: application/csv");
        header("Content-Length: " . mb_strlen($csvContent, "8bit"));

        $filename = self::getDownloadFileName($reportName) . ".csv";
        $attachment = "attachment";
        header(self::buildContentDispositionHeader($attachment, $filename));

        echo $csvContent;
        flush();
    }

    public function getSpreadsheetColumnLetters()
    {
        $alphabet = [
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
            'G',
            'H',
            'I',
            'J',
            'K',
            'L',
            'M',
            'N',
            'O',
            'P',
            'Q',
            'R',
            'S',
            'T',
            'U',
            'V',
            'W',
            'X',
            'Y',
            'Z'
        ];
        $aColLetters = $alphabet;
        foreach ($aColLetters as $letter) {
            foreach ($alphabet as $alpha) {
                $aColLetters[] = $letter . $alpha;
            }
        }

        return $aColLetters;
    }

    public function getProjectsFullSpreadsheet($aWorksheets, $reportName)
    {
        $aColLetters = $this->getSpreadsheetColumnLetters();
        $Header1FontSize = 18;
        $Header2FontSize = 17;
        $Header3FontSize = 15;
        $iHeaderColCellFontSize = 10;
        $iCellFontSize = 10;
        $thumbDimensions = [50, 50];


        $spreadsheet = new Spreadsheet();


        $workSheetCnt = 0;
        foreach ($aWorksheets as $worksheetTitle => $aData) {
            if ($workSheetCnt !== 0) {
                if (!$spreadsheet->getSheetByName($worksheetTitle)) {
                    $spreadsheet->createSheet()->setTitle($worksheetTitle);
                }
                $sheetIndex = $spreadsheet->getIndex(
                    $spreadsheet->getSheetByName($worksheetTitle)
                );
                $spreadsheet->setActiveSheetIndex($sheetIndex);
            } else {
                $spreadsheet->setActiveSheetIndex(0);
                $spreadsheet->getActiveSheet()->setTitle($worksheetTitle);
            }


            $activeWorkSheet = $spreadsheet->getActiveSheet();

            $aColumnHeaders = $aData['column_names'];
            $aRows = $aData['table_data'];
            if (!empty($aRows)) {
                $aFirstRow = current($aRows);
                $aCells = [];
                $cellIdx = 0;
                foreach ($aFirstRow as $fieldName => $val) {
                    $aCells[$fieldName] = ['cell' => $aColLetters[$cellIdx], 'label' => $aColumnHeaders[$cellIdx]];
                    switch ($fieldName) {
                        case 'Active':
                        case 'SequenceNumber':
                        case 'status':
                            $width = 10;
                            break;
                        default:
                            $width = 30;
                    }
                    $activeWorkSheet->getColumnDimension($aColLetters[$cellIdx])->setWidth($width);
                    $cellIdx++;
                }
            }
            $rowCnt = 1;
            $activeWorkSheet->setCellValue('A' . $rowCnt, $aData['header_year']);
            $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setSize(
                $Header1FontSize
            );
            $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setBold(true);
            $activeWorkSheet->mergeCells("A{$rowCnt}:{$aColLetters[$cellIdx-1]}{$rowCnt}");
            $rowCnt++;
            $activeWorkSheet->setCellValue('A' . $rowCnt, $aData['header_report_name']);
            $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setSize(
                $Header2FontSize
            );
            $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setBold(true);
            $activeWorkSheet->mergeCells("A{$rowCnt}:{$aColLetters[$cellIdx-1]}{$rowCnt}");
            $rowCnt++;
            $activeWorkSheet->setCellValue('A' . $rowCnt, $aData['header_date']);
            $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setSize(
                $Header3FontSize
            );
            $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setBold(true);
            $activeWorkSheet->mergeCells("A{$rowCnt}:{$aColLetters[$cellIdx-1]}{$rowCnt}");
            $rowCnt++;
            // create an empty row
            $activeWorkSheet->setCellValue('A' . $rowCnt, " ");
            $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setSize(
                $iCellFontSize
            );
            $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setBold(true);
            $rowCnt++;
            $columnHeaderRow = $rowCnt;

            if (!empty($aRows)) {
                // Set the first row of column headers
                foreach ($aCells as $fieldName => $aCell) {
                    $activeWorkSheet->setCellValue($aCell['cell'] . $rowCnt, $aCell['label']);
                    $activeWorkSheet->getStyle($aCell['cell'] . $rowCnt)->getFont()->setSize(
                        $iHeaderColCellFontSize
                    );
                    $activeWorkSheet->getStyle($aCell['cell'] . $rowCnt)->getFont()->setBold(true);
                    //$activeWorkSheet->getColumnDimension($aCell['cell'])->setWidth($aCell['width']);
                }
                $rowCnt++;
                foreach ($aRows as $aRow) {
                    foreach ($aRow as $fieldName => $fieldValue) {
                        $activeWorkSheet->setCellValue($aCells[$fieldName]['cell'] . $rowCnt, urldecode($fieldValue));
                        $activeWorkSheet->getStyle($aCells[$fieldName]['cell'] . $rowCnt)->getAlignment()->setWrapText(
                            true
                        );
                        $activeWorkSheet->getStyle($aCells[$fieldName]['cell'] . $rowCnt)->getFont()->setSize(
                            $iCellFontSize
                        );
                    }
                    $rowCnt++;
                }
                $activeWorkSheet->setAutoFilter("A{$columnHeaderRow}:{$aColLetters[$cellIdx-1]}{$columnHeaderRow}");
            }
            $workSheetCnt++;
        }

        $spreadsheet->setActiveSheetIndex(0);

        if (headers_sent()) {
            die("Unable to stream spreadsheet: headers already sent");
        }
        header_remove("Content-Type");
        header("Cache-Control: private");

        $filename = self::getDownloadFileName($reportName) . ".xlsx";

        // Redirect output to a client’s web browser (Xlsx)
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');
        // If you're serving to IE 9, then the following may be needed
        header('Cache-Control: max-age=1');

        // If you're serving to IE over SSL, then the following may be needed
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Date in the past
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT'); // always modified
        header('Cache-Control: cache, must-revalidate'); // HTTP/1.1
        header('Pragma: public'); // HTTP/1.0

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save('php://output');
        exit;
    }

    public function getSpreadsheet($aRows, $reportName)
    {
        $aColLetters = $this->getSpreadsheetColumnLetters();
        $Header1FontSize = 18;
        $Header2FontSize = 17;
        $Header3FontSize = 15;
        $iHeaderColCellFontSize = 10;
        $iCellFontSize = 10;
        $thumbDimensions = [50, 50];

        $aHeader1 = array_shift($aRows);
        $aHeader2 = array_shift($aRows);
        $aHeader3 = array_shift($aRows);
        $aHeader4 = array_shift($aRows);
        $aColumnHeaders = array_shift($aRows);
        $aFirstRow = current($aRows);
        $spreadsheet = new Spreadsheet();
        $spreadsheet->setActiveSheetIndex(0);
        $activeWorkSheet = $spreadsheet->getActiveSheet();

        $aCells = [];
        $cellIdx = 0;
        foreach ($aFirstRow as $fieldName => $val) {
            $aCells[$fieldName] = ['cell' => $aColLetters[$cellIdx], 'label' => $aColumnHeaders[$cellIdx]];
            switch ($fieldName) {
                case 'Active':
                case 'SequenceNumber':
                case 'status':
                    $width = 10;
                    break;
                default:
                    $width = 30;
            }
            $activeWorkSheet->getColumnDimension($aColLetters[$cellIdx])->setWidth($width);
            $cellIdx++;
        }

        $rowCnt = 1;

        $activeWorkSheet->setCellValue('A' . $rowCnt, $aHeader1);
        $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setSize(
            $Header1FontSize
        );
        $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setBold(true);
        $activeWorkSheet->mergeCells("A{$rowCnt}:{$aColLetters[$cellIdx-1]}{$rowCnt}");
        $rowCnt++;
        $activeWorkSheet->setCellValue('A' . $rowCnt, $aHeader2);
        $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setSize(
            $Header2FontSize
        );
        $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setBold(true);
        $activeWorkSheet->mergeCells("A{$rowCnt}:{$aColLetters[$cellIdx-1]}{$rowCnt}");
        $rowCnt++;
        $activeWorkSheet->setCellValue('A' . $rowCnt, $aHeader3);
        $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setSize(
            $Header3FontSize
        );
        $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setBold(true);
        $activeWorkSheet->mergeCells("A{$rowCnt}:{$aColLetters[$cellIdx-1]}{$rowCnt}");
        $rowCnt++;
        $activeWorkSheet->setCellValue('A' . $rowCnt, $aHeader4);
        $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setSize(
            $iCellFontSize
        );
        $activeWorkSheet->getStyle('A' . $rowCnt)->getFont()->setBold(true);
        $rowCnt++;
        $columnHeaderRow = $rowCnt;
        // Set the first row of column headers
        foreach ($aCells as $fieldName => $aCell) {
            $activeWorkSheet->setCellValue($aCell['cell'] . $rowCnt, $aCell['label']);
            $activeWorkSheet->getStyle($aCell['cell'] . $rowCnt)->getFont()->setSize(
                $iHeaderColCellFontSize
            );
            $activeWorkSheet->getStyle($aCell['cell'] . $rowCnt)->getFont()->setBold(true);
            //$activeWorkSheet->getColumnDimension($aCell['cell'])->setWidth($aCell['width']);
        }

        $rowCnt++;
        foreach ($aRows as $aRow) {
            foreach ($aRow as $fieldName => $fieldValue) {
                $activeWorkSheet->setCellValue($aCells[$fieldName]['cell'] . $rowCnt, urldecode($fieldValue));
                $activeWorkSheet->getStyle($aCells[$fieldName]['cell'] . $rowCnt)->getAlignment()->setWrapText(true);
                $activeWorkSheet->getStyle($aCells[$fieldName]['cell'] . $rowCnt)->getFont()->setSize(
                    $iCellFontSize
                );
            }
            $rowCnt++;
        }
        $activeWorkSheet->setAutoFilter("A{$columnHeaderRow}:{$aColLetters[$cellIdx-1]}{$columnHeaderRow}");
        if (headers_sent()) {
            die("Unable to stream spreadsheet: headers already sent");
        }
        header_remove("Content-Type");
        header("Cache-Control: private");

        $filename = self::getDownloadFileName($reportName) . ".xlsx";

        // Redirect output to a client’s web browser (Xlsx)
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');
        // If you're serving to IE 9, then the following may be needed
        header('Cache-Control: max-age=1');

        // If you're serving to IE over SSL, then the following may be needed
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Date in the past
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT'); // always modified
        header('Cache-Control: cache, must-revalidate'); // HTTP/1.1
        header('Pragma: public'); // HTTP/1.0

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save('php://output');
        exit;
    }

    /**
     * Builds a HTTP Content-Disposition header string using `$dispositionType`
     * and `$filename`.
     *
     * If the filename contains any characters not in the ISO-8859-1 character
     * set, a fallback filename will be included for clients not supporting the
     * `filename*` parameter.
     *
     * @param string $dispositionType
     * @param string $filename
     *
     * @return string
     */
    public static function buildContentDispositionHeader($dispositionType, $filename)
    {
        $encoding = mb_detect_encoding($filename);
        $fallbackfilename = mb_convert_encoding($filename, "ISO-8859-1", $encoding);
        $fallbackfilename = str_replace("\"", "", $fallbackfilename);
        $encodedfilename = rawurlencode($filename);

        $contentDisposition = "Content-Disposition: $dispositionType; filename=\"$fallbackfilename\"";
        if ($fallbackfilename !== $filename) {
            $contentDisposition .= "; filename*=UTF-8''$encodedfilename";
        }

        return $contentDisposition;
    }

    public function getSiteProjects($SiteStatusID)
    {
        return $projects = Project::select('projects.ProjectID', 'projects.SequenceNumber')
                                  ->join(
                                      'site_status',
                                      'projects.SiteStatusID',
                                      '=',
                                      'site_status.SiteStatusID'
                                  )
                                  ->where('site_status.SiteStatusID', $SiteStatusID)
                                  ->orderBy('projects.SequenceNumber', 'asc')
                                  ->get()
                                  ->toArray();
    }
}
