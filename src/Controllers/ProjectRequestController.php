<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 9/11/2018
 * Time: 11:01 PM
 */

namespace Dhayakawa\SpringIntoAction\Controllers;

use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Database\Eloquent\Builder;
use Dhayakawa\SpringIntoAction\Models\AnnualBudget;
use Dompdf\Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
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
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Input;
use Dhayakawa\SpringIntoAction\Models\ProjectAttachment;
use Dhayakawa\SpringIntoAction\Requests\ProjectRequestPost;

class ProjectRequestController extends BaseController
{

    public function __construct () {
        $this->redirectTo = route(config('springintoaction.app.redirectTo', 'springintoaction.index'));
    }

    /**
     *
     *
     * @return \Illuminate\Http\Response
     */
    public function index () {
        return view('springintoaction::frontend.project_request');
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function showProjectRequestForm (Request $request) {
        // if (!config('springintoaction.project.allow')) {
        //     return view('springintoaction::frontend.project_closed');
        // }
        try {
            $sites = Site::orderBy('SiteName', 'asc')->get()->toArray();
            $aSiteOptions[''] = 'Choose Site';
            foreach ($sites as $option) {
                $aSiteOptions[$option['SiteID']] = $option['SiteName'];
            }
            $site = current($sites);
        } catch (\Exception $e) {
            $sites = [];
            $site = [];
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
            $all_contacts = Contact::orderBy('FirstName', 'asc')->get();
            $all_contacts = $all_contacts ? $all_contacts->toArray() : [];
            $aContactOptions['add_me'] = 'Find Your Name';
            foreach ($all_contacts as $option) {
                $label = "{$option['FirstName']} {$option['LastName']}";
                if (!empty($option['Title'])) {
                    $label .= ", {$option['Title']}";
                }
                $aContactOptions[$option['ContactID']] = "{$label}";
                $aContactOptionAttrs[$option['ContactID']] = ['SiteID' => $option['SiteID']];
            }
        } catch (\Exception $e) {
            $all_contacts = [];
            report($e);
        }

        try {
            $aBudgetSourceOptions = [];
            $BudgetSourceOptions = BudgetSourceOptions::select('id AS option_value', 'option_label')->orderBy('DisplaySequence', 'asc')->get();
            $BudgetSourceOptions = $BudgetSourceOptions ? $BudgetSourceOptions->toArray() : [];
            foreach ($BudgetSourceOptions as $option) {
                $aBudgetSourceOptions[] = ['option_value' => $option['option_value'], 'option_label' => $option['option_label']];
            }
            \array_shift($aBudgetSourceOptions);
        } catch (\Exception $e) {
            $aBudgetSourceOptions = [];
            report($e);
        }

        $formData = compact(['aSiteOptions', 'aBudgetSourceOptions', 'aContactOptions', 'aContactOptionAttrs']);


        return view('springintoaction::frontend.project_request', $request, compact('formData'));
    }

    public function store (ProjectRequestPost $request) {

        try {
            $validated = $request->validated();
        } catch (HttpException $e) {
            \Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__, $e->getMessage()]);
        }
        $yearNow = date('Y');
        $month = date('n');

        // need to make sure the year is for the upcoming/next spring
        // or this spring if the month is less than may
        $Year = $month > 5 ? $yearNow + 1 : $yearNow;
        try {
            $siteStatus = current(Site::find($request->input('SiteID'))->status()->where('Year', $Year)->orderBy('Year', 'desc')->get()->toArray());
            $siteStatusID = $siteStatus['SiteStatusID'];
            if ($siteStatus === false) {
                $siteStatusRecordData = ['SiteID' => $request->input('SiteID'), 'Year' => $Year, 'ProjectDescriptionComplete' => 0, 'BudgetEstimationComplete' => 0, 'VolunteerEstimationComplete' => 0, 'VolunteerAssignmentComplete' => 0, 'BudgetActualComplete' => 0, 'EstimationComments' => '', 'created_at' => '', 'updated_at' => ''];
                $oSiteStatus = new SiteStatus();
                $oSiteStatus->fill($siteStatusRecordData);
                $success = $oSiteStatus->save();
                $siteStatusID = $oSiteStatus->getAttribute('SiteStatusID');
            }
        } catch (\Exception $e) {
            $siteStatusID = 0;
            report($e);
        }


        $projects = Project::join('site_status', 'projects.SiteStatusID', '=', 'site_status.SiteStatusID')->where('site_status.SiteStatusID', $siteStatusID)->orderBy('projects.SequenceNumber', 'desc')->get()->toArray();
        if (!empty($projects)) {
            $lastProject = current($projects);
            $sequenceNumber = $lastProject['SequenceNumber'] + 1;
        } else {
            $sequenceNumber = 1;
        }
        $project = new Project;
        $defaultProjectRecordData = ['ProjectDescription' => '', 'Comments' => '', 'ChildFriendly' => 0, 'PrimarySkillNeeded' => '', 'VolunteersNeededEst' => 0, 'VolunteersAssigned' => 0, 'Status' => '', 'StatusReason' => '', 'MaterialsNeeded' => '', 'EstimatedCost' => 0.00, 'ActualCost' => 0.00, 'BudgetAvailableForPC' => 0.00, 'VolunteersLastYear' => 0, 'NeedsToBeStartedEarly' => 0, 'PCSeeBeforeSIA' => 0, 'SpecialEquipmentNeeded' => '', 'PermitsOrApprovalsNeeded' => '', 'PrepWorkRequiredBeforeSIA' => '', 'SetupDayInstructions' => '', 'SIADayInstructions' => '', 'Attachments' => '', 'Area' => '', 'PaintOrBarkEstimate' => '', 'PaintAlreadyOnHand' => '', 'PaintOrdered' => '', 'CostEstimateDone' => 0, 'MaterialListDone' => 0, 'BudgetAllocationDone' => 0, 'VolunteerAllocationDone' => 0, 'NeedSIATShirtsForPC' => 0, 'ProjectSend' => 'Not Ready', 'FinalCompletionStatus' => 0, 'FinalCompletionAssessment' => ''];
        $data = array_map(function ($value) {
            if (is_array($value)) {
                return join(',', $value);
            }

            return $value;
        }, array_merge($request->only($project->getFillable()), $defaultProjectRecordData));

        array_walk($data, function (&$value, $key) {
            if (is_string($value)) {
                $value = \urldecode($value);
            }
        });

        $data['SiteStatusID'] = $siteStatusID;
        $data['OriginalRequest'] .= PHP_EOL . $request->input('OriginalRequestRoom') . PHP_EOL . $request->input('OriginalRequestRoomPerson');
        $data['Active'] = 1;
        $data['SequenceNumber'] = $sequenceNumber;
        $project->fill($data);
        $success = $project->save();
        $ProjectID = 0;
        if (!isset($success)) {
            $response = ['success' => false, 'msg' => 'Project Creation Not Implemented Yet.'];
        } elseif ($success) {
            $response = ['success' => true, 'msg' => 'Project Creation Succeeded.'];
            $ProjectID = $project->getAttribute('ProjectID');
        } else {
            $response = ['success' => false, 'msg' => 'Project Creation Failed.'];
        }

        $response = ['success' => true, 'msg' => 'Project Contact Addition Succeeded.'];

        $ContactID = $request->input('ContactID');
        if ($ContactID === 'add_me') {
            $model = new Contact;
            $data = $request->only($model->getFillable());
            array_walk($data, function (&$value, $key) {
                if (is_string($value)) {
                    $value = \urldecode($value);
                }
            });
            $data['ContactType'] = $data['Title'];
            $model->fill($data);
            $success = $model->save();
            if ($success) {
                $ContactID = $model->getAttribute('ContactID');
            }
        }

        $model = new ProjectContact;
        $model->fill(['ContactID' => $ContactID, 'ProjectID' => $ProjectID]);
        $success = $model->save();

        $this->handleProjectAttachments($request, $Year, $ProjectID);

        return view('springintoaction::frontend.project_response', $request, compact('response'));
    }

    public function handleProjectAttachments (Request $request, $Year, $ProjectID) {
        $timeStamp = date("Ymd") . round(microtime(true));

        $aProjectAttachments = $request->file('ProjectAttachments');
        foreach ($aProjectAttachments as $ProjectAttachment) {
            \Illuminate\Support\Facades\Log::debug('$ProjectAttachments', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__, $ProjectAttachment]);

            $newFileName = $timeStamp . '-' . $ProjectAttachment->getClientOriginalName();
            $siaPath = "{$Year}/{$ProjectID}";
            $newFilePath = $siaPath . '/' . $newFileName;
            Storage::disk('local')->put($newFilePath, File::get($ProjectAttachment));
            $ProjectAttachmentModel = new ProjectAttachment;
            $attachmentLocalPath = Storage::disk('local')->getDriver()->getAdapter()->getPathPrefix() . $newFilePath;
            $aData = ['ProjectID' => $ProjectID, 'AttachmentPath' => $attachmentLocalPath];
            $ProjectAttachmentModel->fill($aData);

            $success = $ProjectAttachmentModel->save();
        }

    }
}
