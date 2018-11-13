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
use Illuminate\Http\Request;
use Dhayakawa\SpringIntoAction\Models\Project;

class ReportsController extends BaseController
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index () {
        //
    }

    public function getYearSiteProjectReportUrl (Request $request, $Year, $SiteID, $ProjectID) {
        $spName = 'sp_DBR_YrSiteProject';
        $reportId = 7;
        $seed = 'WZyLIZPffEWoho9cBzJI5qkfo';
        $hash = '48997fcf2aa01ef895950e77c2f6d3a9c6cd50f2';//sha1($spName . 'm1' . $seed);
        $response = ['ReportName' => 'Project Report by Year, Site and Project', 'ReportUrl' => "https://springintoaction.woodlandschurch.org/mydbr/report.php?r={$reportId}&u1={$Year}&u2={$SiteID}&u3={$ProjectID}&m=1&h={$hash}"];

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function getYearSiteReportUrl(Request $request, $Year, $SiteID)
    {
        $spName = 'sp_DBR_YrSite';
        $reportId = 10;
        $seed = 'WZyLIZPffEWoho9cBzJI5qkfo';
        $hash = 'eac641aa767ec57a5d4d6cf69f16c1cf7e770949';//sha1($spName . 'm1' . $seed);
        $response =
            [
                'ReportName' => 'Project Report by Year, Site',
                'ReportUrl' => "https://springintoaction.woodlandschurch.org/mydbr/report.php?r={$reportId}&u1={$Year}&u2={$SiteID}&m=1&h={$hash}"
            ];

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function getSiteProjects ($SiteStatusID) {
        return $projects = Project::select('projects.ProjectID', 'projects.SequenceNumber')
            ->join('site_status', 'projects.SiteStatusID', '=', 'site_status.SiteStatusID')
            ->where('site_status.SiteStatusID', $SiteStatusID)
            ->orderBy('projects.SequenceNumber', 'asc')->get()->toArray();
    }
}
