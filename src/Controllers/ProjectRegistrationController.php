<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 12/10/2018
 * Time: 7:03 PM
 */

namespace Dhayakawa\SpringIntoAction\Controllers;

use \Dhayakawa\SpringIntoAction\Controllers\FrontendBackboneAppController as BaseController;
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
use Dhayakawa\SpringIntoAction\Models\ProjectVolunteer;
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
use Dhayakawa\SpringIntoAction\Models\ProjectReservation;
use Dhayakawa\SpringIntoAction\Controllers\GroveApi;

class ProjectRegistrationController extends BaseController
{
    use \Dhayakawa\SpringIntoAction\Helpers\ProjectRegistrationHelper;

    public function store(Request $request)
    {
        $params = $request->all();
        $aContactInfo = $params['contact_info'];
        $ProjectID = $params['ProjectID'];
        $ProjectRoleID = 4;

        if (is_array($aContactInfo)) {
            foreach ($aContactInfo as $contactInfo) {
                $volunteer = Volunteer::where('Email',$contactInfo['Email'])->get()->first();
                if(!empty($volunteer)){
                    $volunteerID = $volunteer->VolunteerID;
                } else {
                    $model = new Volunteer;

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
                    if (isset($contactInfo['IndividualID']) && $contactInfo['IndividualID'] === '') {
                        $contactInfo['IndividualID'] = 0;
                    }
                    array_walk(
                        $contactInfo,
                        function (&$value, $key) {
                            if (is_string($value)) {
                                $value = \urldecode($value);
                            }
                        }
                    );

                    $model->fill($aContactInfo);
                    $model->save();
                    $volunteerID = $model->VolunteerID;
                }
                $model = new ProjectVolunteer;
                $model->fill(['VolunteerID' => $volunteerID, 'ProjectID' => $ProjectID]);
                $success = $model->save();

                $model = new ProjectVolunteerRole;
                $model->fill(
                    [
                        'VolunteerID' => $volunteerID,
                        'ProjectID' => $ProjectID,
                        'ProjectRoleID' => $ProjectRoleID
                    ]
                );
                $success = $model->save();
                if (!$success) {
                    $batchSuccess = false;
                } else {
                    $volunteerCnt = ProjectVolunteer::where('ProjectID',$ProjectID)->get()->count();
                    $projectModel = Project::find($ProjectID);
                    $projectModel->VolunteersAssigned = $volunteerCnt;
                    $projectModel->save();

                    ProjectReservation::where('session_id', $request->session()->getId())->delete();
                    $request->session()->regenerate();
                }
            }
        }

        if (!isset($success)) {
            $response = ['success' => false, 'msg' => 'Project Registration Not Implemented Yet.'];
        } elseif ($success) {
            $response = ['success' => true, 'msg' => 'Thank you for volunteering! We\'ll be sending a confirmation
                            email and notifications as we get closer to the date.'];
        } else {
            $response = ['success' => false, 'msg' => 'Project Registration Failed.'];
        }

        return view('springintoaction::frontend.json_response', $request, compact('response'));
    }

    public function getFilteredProjectList(Request $request)
    {
        $requestData = $request->all();

        $aFilter = isset($requestData['filter']) ? $requestData['filter'] : [];
        $sortBy = isset($requestData['sort_by']) && !empty($requestData['sort_by']) ? $requestData['sort_by'] : null;

        $all_projects = $this->getProjectList($aFilter, $sortBy);

        return $all_projects;
    }

    public function reserve(Request $request)
    {
        try {
            $model = ProjectReservation::where('session_id', $request->session()->getId())->first();
            $model->ProjectID = $request->ProjectID;
            $model->reserve = $request->reserve;
        } catch (\Exception $e) {
            $model = new ProjectReservation;
            $data = $request->only($model->getFillable());
            $data['session_id'] = $request->session()->getId();

            $model->fill($data);
        }

        $success = $model->save();

        if (!isset($success)) {
            $response = ['success' => false, 'msg' => 'Project Reservation Not Implemented Yet.'];
        } elseif ($success) {
            $response = ['success' => true, 'msg' => 'Project Reservation Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Project Reservation Failed.'];
        }

        return view('springintoaction::frontend.json_response', $request, compact('response'));
    }

    public function deleteReservation(Request $request, $ProjectID)
    {
        $success = ProjectReservation::where('session_id', $request->session()->getId())
                                     ->where('ProjectID', $ProjectID)->delete();

        if ($success) {
            $response = ['success' => true, 'msg' => 'Project Reservation Delete Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Project Reservation Delete Failed.'];
        }

        return view('springintoaction::frontend.json_response', $request, compact('response'));
    }

    public function groveLogin(Request $request){
        $login = $request->GroveEmail;
        $password = $request->GrovePassword;
        $RegisterProcessType = $request->RegisterProcessType;
        // $groveApi = new GroveApi();
        // $response = $groveApi->individual_profile_from_login_password($login, $password);
        $success = true;
        $contact_info = [];
        for($i=0;$i<10;$i++){
            $contact_info[]= [
                'Church' => 'woodlands',
                'MobilePhoneNumber' => '7153054840',
                'FirstName' => 'David' . $i,
                'LastName' => 'Hayakawa' . $i,
                'Email' => 'david.hayakawa+siaregister' . $i . '@gmail.com'
            ]  ;
        }
        if (!isset($success)) {
            $response = ['success' => false, 'msg' => 'Grove Login Not Implemented Yet.'];
        } elseif ($success) {
            $response = ['success' => true, 'msg' => 'Grove Login Succeeded.', 'contact_info' => $contact_info];
        } else {
            $response = ['success' => false, 'msg' => 'Grove Login Failed.'];
        }

        return view('springintoaction::frontend.json_response', $request, compact('response'));
    }
}
