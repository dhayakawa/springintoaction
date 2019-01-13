<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 10/5/2018
 * Time: 8:37 PM
 */

namespace Dhayakawa\SpringIntoAction\Controllers;

use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
use Illuminate\Support\Facades\Log;
use Dompdf\Dompdf;
use Dompdf\Options;
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

class ReportsController extends BaseController
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    public function getReport(Request $request, $ReportType, $Year, $SiteID = null, $ProjectID = null, $pdf = '')
    {
        $SiteID = !is_numeric($SiteID) ? null : $SiteID;
        $ProjectID = !is_numeric($ProjectID) ? null : $ProjectID;
        $html = '';
        $reportHtml = '';
        $date = date('l, F d, Y');

        switch ($ReportType) {
            case 'projects':
                $reportName = 'Project Report by Year, Site and Project';
                $reportHtml = $this->getYearSiteProjectReport($Year, $SiteID = null, $ProjectID = null);
                break;
            case 'budget':
                $reportName = 'Budget Allocation';
                $reportHtml = $this->getBudgetAllocationReport($Year, $SiteID = null, $ProjectID = null);
                break;
            case 'budget_and_volunteer':
                $reportName = 'Budget, Estimation and Early Work Needed';
                $reportHtml = $this->getBudgetAndVolunteerReport($Year, $SiteID = null, $ProjectID = null);
                break;
            case 'early_start':
                $reportName = 'Projects Needing Early Start';
                $reportHtml = $this->getEarlyStartProjectsReport($Year, $SiteID = null, $ProjectID = null);
                break;
            case 'sites':
                $reportName = 'Site Report by Year';
                $reportHtml = $this->getYearSiteReport($Year);
                break;
            case 'volunteer_assignment_for_packets':
                $reportName = 'Volunteer Assignment Report - Alpha - All Sites and Projects';
                $reportHtml = $this->getVolunteerAssignmentForPacketsReport($Year);
                break;
            default:
                $reportName = 'Unknown Report:' . $ReportType;
        }
        $html .= '<h1 style="text-align:center;">Spring Into Action ' .
                 $Year .
                 "<br>{$reportName}<br><small>" .
                 $date .
                 '</small></h1>';
        $html .= $reportHtml;

        if (!empty($pdf)) {
            return $this->getPDF($html);
        } else {
            return $html;
        }
    }

    public function getBudgetAllocationReport($Year, $SiteID = null, $ProjectID = null)
    {
        $html = '';
        //'Project Report by Year, Site and Project'
        $site = Site::join(
            'site_status',
            'sites.SiteID',
            '=',
            'site_status.SiteID'
        )->where(
            'site_status.Year',
            $Year
        )->orderBy('SiteName', 'asc');
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
            )->get()->toArray();
            $aAmounts = [];
            $estimatedCost = 0;
            $totalAllocated = 0;
            foreach ($aProjects as $key => $aaProject) {
                //\Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,$key,$aaProject]);

                $tmpSource = '';
                $tmpAmt = '';
                $aBudgets =
                    Budget::join('budget_source_options', 'budget_source_options.id', '=', 'budgets.BudgetSource')
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

        return $html;
    }

    public function getBudgetAndVolunteerReport($Year, $SiteID = null, $ProjectID = null)
    {
        $html = '';
        //'Project Report by Year, Site and Project'
        $site = Site::join(
            'site_status',
            'sites.SiteID',
            '=',
            'site_status.SiteID'
        )->where(
            'site_status.Year',
            $Year
        )->orderBy('SiteName', 'asc');
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
            )->get()->toArray();
            $aAmounts = [];
            $estimatedCost = 0;
            $totalAllocated = 0;
            foreach ($aProjects as $key => $aaProject) {
                //\Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,$key,$aaProject]);

                $tmpSource = '';
                $tmpAmt = '';
                $aBudgets =
                    Budget::join('budget_source_options', 'budget_source_options.id', '=', 'budgets.BudgetSource')
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
                )->get()->toArray();
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
                )->get()->toArray();
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
            $response = $this->getResultsHtmlTable($aProjects);
            $html .= "<h3 style=\"page-break-before: always;\">{$site['SiteName']}</h3>";
            $html .= $response;
        }

        return $html;
    }

    public function getYearSiteProjectReport($Year, $SiteID = null, $ProjectID = null)
    {
        $html = '';
        //'Project Report by Year, Site and Project'
        $site = Site::join(
            'site_status',
            'sites.SiteID',
            '=',
            'site_status.SiteID'
        )->where(
            'site_status.Year',
            $Year
        )->orderBy('SiteName', 'asc');
        if ($SiteID) {
            //$site->where('sites.SiteID', $SiteID);
        }
        $aSites = $site->get()->toArray();
        foreach ($aSites as $site) {
            $aProjects = Project::select(
                'projects.SequenceNumber as Proj Num',
                'projects.OriginalRequest',
                'projects.Comments',
                'project_status_options.option_label as Status',
                'projects.StatusReason'
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
            )->get()->toArray();

            $response = $this->getResultsHtmlTable($aProjects);
            $html .= "<h3 style=\"page-break-before: always;\">{$site['SiteName']}</h3>";
            $html .= $response;
        }

        return $html;
    }

    public function getYearSiteReport($Year)
    {
        $aSites = Site::select('SiteName')->join(
            'site_status',
            'sites.SiteID',
            '=',
            'site_status.SiteID'
        )->where(
            'site_status.Year',
            $Year
        )->orderBy('SiteName', 'asc')->get()->toArray();

        return $this->getResultsHtmlTable($aSites);
    }

    public function getEarlyStartProjectsReport($Year, $SiteID = null, $ProjectID = null)
    {
        $html = '';
        //'Project Report by Year, Site and Project'
        $site = Site::join(
            'site_status',
            'sites.SiteID',
            '=',
            'site_status.SiteID'
        )->where(
            'site_status.Year',
            $Year
        )->orderBy('SiteName', 'asc');
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
            )->get()->toArray();

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
                )->get()->toArray();

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
                )->get()->toArray();
                $contact = '';
                if (!empty($aProjectContacts)) {
                    foreach ($aProjectContacts as $aProjectContact) {
                        $contact = "{$aProjectContact['LastName']},{$aProjectContact['FirstName']}";
                    }
                }
                $aProjects[$key]["Project Contact"] = "{$contact}";
                $aSkillsNeeded =
                    ProjectSkillNeededOptions::select('option_label')->whereIn('id', preg_split('/,/', $aaProject['Primary Skill Needed']))
                                             ->get()
                                             ->toArray();
                $aProjects[$key]["Primary Skill Needed"] = join('<br>', array_column($aSkillsNeeded,'option_label'));
            }
            $this->deleteColumn($aProjects, 'ProjectID');

            $response = $this->getResultsHtmlTable($aProjects);
            $html .= "<h3 style=\"page-break-before: always;\">{$site['SiteName']}</h3>";
            $html .= $response;
        }

        return $html;
    }

    public function getVolunteerAssignmentForPacketsReport($Year)
    {
        $html = '';
        $aVolunteers = Volunteer::select(
            DB::raw("concat(volunteers.LastName,', ',volunteers.FirstName) as Name"),
            'volunteers.MobilePhoneNumber as Contact Phone',
            'sites.SiteName as Site Name',
            'projects.SequenceNumber as Proj Num',
            'projects.ProjectDescription as Project Description'
        )->join(
            'project_volunteers',
            'project_volunteers.VolunteerID',
            '=',
            'volunteers.VolunteerID'
        )->join(
            'projects',
            'projects.ProjectID',
            '=',
            'project_volunteers.ProjectID'
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
        )->where('site_status.Year',$Year)->orderBy('volunteers.LastName','asc')->get()->toArray();

        $html = $this->getResultsHtmlTable($aVolunteers);

        return $html;
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

    public function getResultsHtmlTable($aaRows)
    {
        $aTableResults = [];
        $aTableResults[] = "<table class='table table-striped'>";
        $j = 0;

        foreach ($aaRows as $aaRow) {
            $aKeys = array_keys($aaRow);
            if ($j == 0) {
                $aTableResults[] = "<thead><tr>";
                foreach ($aKeys as $sKeyStr):
                    $aTableResults[] = "<th>{$sKeyStr}</th>";
                endforeach;
                $aTableResults[] = "</tr></thead>";
            }
            $aTableResults[] = "<tr>";
            $i=0;
            foreach ($aaRow as $sTableField => $sStr):
                $sStr = empty($sStr) ? '&nbsp;' : $sStr;
                $colName = str_replace(' ', '-', $aKeys[$i]);
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
.table{width:100%;max-width:100%;margin-bottom:20px;border-spacing: 0;border-collapse: collapse;}

.table>tbody>tr>td,.table>tbody>tr>th,.table>tfoot>tr>td,.table>tfoot>tr>th,.table>thead>tr>td,.table>thead>tr>th{padding:8px;line-height:1.42857143;vertical-align:top;border-top:1px solid #ddd}
.table>thead>tr>th{vertical-align:bottom;border-bottom:2px solid #ddd}
.table>caption+thead>tr:first-child>td,.table>caption+thead>tr:first-child>th,.table>colgroup+thead>tr:first-child>td,.table>colgroup+thead>tr:first-child>th,.table>thead:first-child>tr:first-child>td,.table>thead:first-child>tr:first-child>th{border-top:0}
.table>tbody+tbody{border-top:2px solid #ddd}
.table .table{background-color:#fff}
.table-condensed>tbody>tr>td,.table-condensed>tbody>tr>th,.table-condensed>tfoot>tr>td,.table-condensed>tfoot>tr>th,.table-condensed>thead>tr>td,.table-condensed>thead>tr>th{padding:5px}
.table-bordered,.table-bordered>tbody>tr>td,.table-bordered>tbody>tr>th,.table-bordered>tfoot>tr>td,.table-bordered>tfoot>tr>th,.table-bordered>thead>tr>td,.table-bordered>thead>tr>th{border:1px solid #ddd}
.table-bordered>thead>tr>td,.table-bordered>thead>tr>th{border-bottom-width:2px}
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
td.Name,td.Site-Name,td.Contact-Phone{
white-space: nowrap;
}
CSS;
    }

    public function getPDF($html)
    {
        $options = new Options();
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('isHtml5ParserEnabled', true);
        // instantiate and use the dompdf class
        $dompdf = new Dompdf($options);
        $stylesheet = new \Dompdf\Css\Stylesheet($dompdf);
        $style = $stylesheet->create_style();
        $style->set_font_size('x-small');
        $stylesheet->add_style('body', $style);
        $css = $this->getBootstrapTableClasses();
        $stylesheet->load_css($css);
        $dompdf->setCss($stylesheet);
        //$dompdf->setPaper('letter', 'landscape');
        $dompdf->loadHtml($html);

        // Render the HTML as PDF
        $dompdf->render();

        // Output the generated PDF to Browser
        $dompdf->stream();
    }
}
