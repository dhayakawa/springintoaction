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
use Dhayakawa\SpringIntoAction\Models\LifeGroups;
use Dhayakawa\SpringIntoAction\Models\GroveIndividual;

class ProjectRegistrationController extends BaseController
{
    use \Dhayakawa\SpringIntoAction\Helpers\ProjectRegistrationHelper;

    public function store(Request $request)
    {
        $params = $request->all();
        $aContactInfo = $params['contact_info'];
        $ProjectID = $params['ProjectID'];
        $ProjectRoleID = 4;
        $aRegistered = [];
        $aRegistrationFailed = [];
        $aAlreadyRegistered = [];
        $iSuccessCnt = 0;
        \Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,
            $aContactInfo]);
        if (is_array($aContactInfo)) {
            foreach ($aContactInfo as $contactInfo) {
                $volunteer = Volunteer::where(
                    [
                        [
                            'Email',
                            '=',
                            $contactInfo['Email'],
                        ],
                        [
                            'FirstName',
                            '=',
                            $contactInfo['FirstName'],
                        ],
                        [
                            'LastName',
                            '=',
                            $contactInfo['LastName'],
                        ],
                    ]
                )->get()->first();
                if (!empty($volunteer)) {
                    $volunteerID = $volunteer->VolunteerID;
                    $groveId = $volunteer->IndividualID;
                } else {
                    $model = new Volunteer();

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
                    $contactInfo['IndividualID'] = empty($contactInfo['groveId']) ? 0 : $contactInfo['groveId'];
                    array_walk(
                        $contactInfo,
                        function (&$value, $key) {
                            if (is_string($value)) {
                                $value = \urldecode($value);
                            }
                            if($key === 'groveId'){
                                $value = (int) $value;
                            }
                        }
                    );

                    $model->fill($contactInfo);

                    \Illuminate\Support\Facades\Log::debug(
                        '',
                        [
                            'File:' . __FILE__,
                            'Method:' . __METHOD__,
                            'Line:' . __LINE__,
                            $contactInfo,
                            $model->toArray(),
                        ]
                    );
                    $model->save();
                    $volunteerID = $model->VolunteerID;
                    $groveId = $model->IndividualID;
                }
                $contactInfo['groveId'] = $groveId;
                $bProjectVolunteerExists = ProjectVolunteer::where(
                    [
                        ['ProjectID', '=', $ProjectID],
                        ['VolunteerID', '=', $volunteerID],
                    ]
                )->exists();

                if (!$bProjectVolunteerExists) {
                    $model = new ProjectVolunteer;
                    $model->fill(['VolunteerID' => $volunteerID, 'ProjectID' => $ProjectID]);
                    $pvSuccess = $model->save();
                    $pvrSuccess = false;
                    if ($pvSuccess) {
                        $model = new ProjectVolunteerRole;
                        $model->fill(
                            [
                                'VolunteerID' => $volunteerID,
                                'ProjectID' => $ProjectID,
                                'ProjectRoleID' => $ProjectRoleID,
                            ]
                        );
                        $pvrSuccess = $model->save();
                    }

                    if ($pvSuccess && $pvrSuccess) {
                        $iSuccessCnt++;
                        $aRegistered[] = $contactInfo;
                    } else {
                        $aRegistrationFailed[] = $contactInfo;
                    }
                } else {
                    $aAlreadyRegistered[] = $contactInfo;
                }
            }
            if ($iSuccessCnt) {
                if ($iSuccessCnt + count($aAlreadyRegistered) === count($aContactInfo)) {
                    ProjectReservation::where('session_id', $request->session()->getId())->delete();
                    $request->session()->forget('groveId');
                    $request->session()->regenerate();
                } elseif ($iSuccessCnt + count($aAlreadyRegistered) < count($aContactInfo)) {
                    ProjectReservation::where('session_id', $request->session()->getId())->update(
                        ['reserve' => $iSuccessCnt]
                    );
                }
            }

            if(count($aRegistered) === count($aContactInfo) && count($aAlreadyRegistered) === 0 && count($aRegistrationFailed) === 0){
                $success = true;
            } else {
                $success = false;
            }
        }

        if (!isset($success)) {
            $response = ['success' => false, 'msg' => 'Project Registration Not Implemented Yet.'];
        } elseif ($success) {
            $response = [
                'success' => true,
                'msg' => 'Thank you for volunteering! We\'ll be sending a confirmation
                            email and notifications as we get closer to the date.',
                'aRegistered' => $aRegistered,
                'aAlreadyRegistered' => $aAlreadyRegistered,
                'aRegistrationFailed' => $aRegistrationFailed,

            ];
        } else {
            $response = [
                'success' => false,
                'msg' => count($aRegistered) ? 'Project Registration Problems.' : 'Project Registration Failed.',
                'aRegistered' => $aRegistered,
                'aAlreadyRegistered' => $aAlreadyRegistered,
                'aRegistrationFailed' => $aRegistrationFailed,
            ];
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
        $success =
            ProjectReservation::where('session_id', $request->session()->getId())
                              ->where('ProjectID', $ProjectID)
                              ->delete();

        if ($success) {
            $response = ['success' => true, 'msg' => 'Project Reservation Delete Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Project Reservation Delete Failed.'];
        }

        return view('springintoaction::frontend.json_response', $request, compact('response'));
    }

    public function groveLogout(Request $request) {
        $request->session()->forget('groveId');
        $request->session()->regenerate();
        $response = ['success' => true, 'msg' => 'Logged out.'];
        return view('springintoaction::frontend.json_response', $request, compact('response'));
    }
    public function groveLogin(Request $request)
    {
        $groveLoggedInId = null;
        $RegisterProcessType = $request->RegisterProcessType;

        $login = $request->GroveEmail;
        $password = $request->GrovePassword;
        \Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,
            $login,$password,
            $RegisterProcessType]);
        $groveApi = new GroveApi();
        $response = $groveApi->individual_profile_from_login_password($login, $password);
        \Illuminate\Support\Facades\Log::debug(
            '',
            [
                'File:' . __FILE__,
                'Method:' . __METHOD__,
                'Line:' . __LINE__,
                $response,
            ]
        );
        $bGroveLoginSuccessful = $response["individuals"]['@attributes']['count'] === '1';
        $individual = $response["individuals"]["individual"];
        $phone = $groveApi->findPhoneTypeFromProfile($individual);
        $email = $individual['email'];
        $firstName = $individual['first_name'];
        $lastName = $individual['last_name'];
        $familyId = $individual['family']['@attributes']['id'];
        $groveId = $individual["@attributes"]['id'];
        $request->session()->put('groveId', $groveId);

        if ($bGroveLoginSuccessful) {
            $groveLoggedInId = $groveId;
            $contact_info = [];

            $success = true;

            if ($RegisterProcessType === 'family') {
                $aMembers = $this->getFamilyFromDb(
                    $familyId
                );
                foreach ($aMembers as $aMember) {
                    $phone = $aMember['phone'];
                    $email = $aMember['email'];
                    $firstName = $aMember['first_name'];
                    $lastName = $aMember['last_name'];
                    $contact_info[] = [
                        'Church' => 'woodlands',
                        'MobilePhoneNumber' => $phone,
                        'FirstName' => $firstName,
                        'LastName' => $lastName,
                        'Email' => $email,
                        'groveId' => $aMember['id']
                    ];
                }
            } elseif ($RegisterProcessType === 'lifegroup') {
                $aMembers = $this->getLifeGroupFromDb($groveId, $familyId);
                foreach ($aMembers as $aMember) {
                    $phone = $aMember['phone'];
                    $email = $aMember['email'];
                    $firstName = $aMember['first_name'];
                    $lastName = $aMember['last_name'];
                    $contact_info[] = [
                        'Church' => 'woodlands',
                        'MobilePhoneNumber' => $phone,
                        'FirstName' => $firstName,
                        'LastName' => $lastName,
                        'Email' => $email,
                        'groveId' => isset($aMember['individual_id']) ? $aMember['individual_id'] :
                            $aMember['id']
                    ];
                }
            }
            //$contact_info = array_unique($contact_info);
            //$response = $groveApi->api_status();
            \Illuminate\Support\Facades\Log::debug(
                '',
                [
                    'File:' . __FILE__,
                    'Method:' . __METHOD__,
                    'Line:' . __LINE__,
                    [
                        '$phone' => $phone,
                        '$email' => $email,
                        '$firstName' => $firstName,
                        '$lastName' => $lastName,
                        '$groveId' => $groveId,
                        '$RegisterProcessType' => $RegisterProcessType,
                    ],
                ]
            );
        } else {
            $success = false;
        }
\Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,
    $contact_info]);
        // $contact_info = [];
        // for($i=0;$i<10;$i++){
        //     $contact_info[]= [
        //         'Church' => 'woodlands',
        //         'MobilePhoneNumber' => '7153054840',
        //         'FirstName' => 'David' . $i,
        //         'LastName' => 'Hayakawa' . $i,
        //         'Email' => 'david.hayakawa+siaregister' . $i . '@gmail.com'
        //     ]  ;
        // }
        if (!isset($success)) {
            $response =
                [
                    'success' => false,
                    'groveLoggedInId' => $groveLoggedInId,
                    'msg' => 'Grove Login Not Implemented Yet.',
                ];
        } elseif ($success) {
            $response = [
                'success' => true,
                'msg' => 'Grove Login Succeeded.',
                'groveLoggedInId' => $groveLoggedInId,
                'contact_info' => $contact_info,
            ];
        } else {
            $response = ['success' => false, 'groveLoggedInId' => $groveLoggedInId, 'msg' => 'Grove Login Failed.'];
        }

        return view('springintoaction::frontend.json_response', $request, compact('response'));
    }

    public function getLifeGroupFromDb($groveId, $familyId)
    {
        $loggedInLifeGroup = LifeGroups::where('individual_id', '=', $groveId)->get()->first();
        $aLifeGroupMembers = LifeGroups::where('group_id', '=', $loggedInLifeGroup->group_id)->join(
            'grove_individuals',
            'grove_individuals.id',
            '=',
            'life_groups.individual_id'
        )->get()->toArray();
        foreach ($aLifeGroupMembers as $idx => $aMember) {
            $aLifeGroupMembers[$idx]['Church'] = 'woodlands';
            $aLifeGroupMembers[$idx]['phone'] =
                !empty($aMember['mobile_phone']) ? $aMember['mobile_phone'] : $aMember['contact_phone'];
            if ($aMember['family_member_type'] === 'child' && !$this->getMeetsAgeRequirement($aMember['birthday'])) {
                unset($aLifeGroupMembers[$idx]);
            }
        }

        $aFamilyMembers = $this->getFamilyFromDb($familyId);

        return array_merge($aLifeGroupMembers, $aFamilyMembers->toArray());
    }

    public function getFamilyFromDb($family_id)
    {
        $GroveIndividual = new GroveIndividual();
        $aFamilyMembers = $GroveIndividual->getFamilyMembers($family_id);
        foreach ($aFamilyMembers as $idx => $aFamilyMember) {
            $aFamilyMembers[$idx]['Church'] = 'woodlands';
            $aFamilyMembers[$idx]['phone'] =
                !empty($aFamilyMember['mobile_phone']) ? $aFamilyMember['mobile_phone'] :
                    $aFamilyMember['contact_phone'];
            if ($aFamilyMember['family_member_type'] === 'child' &&
                !$this->getMeetsAgeRequirement($aFamilyMember['birthday'])
            ) {
                unset($aFamilyMembers[$idx]);
            }
        }

        return $aFamilyMembers;
    }

    public function getFamilyFromGroveApi($family_id)
    {
        $family_members = [];
        $groveApi = new GroveApi();
        $responseFamily = $groveApi->family_list($family_id);
        $aFamilyMembers =
            isset($responseFamily['families']['family']["individuals"]["individual"]) ?
                $responseFamily['families']['family']["individuals"]["individual"] : [];
        for ($x = 0; $x < count($aFamilyMembers); $x++) {
            $bSet = false;
            $groveUserId = $aFamilyMembers[$x]['@attributes']['id'];
            $firstName = $aFamilyMembers[$x]['first_name'];
            $lastName = $aFamilyMembers[$x]['last_name'];
            $responseFamilyMember = $groveApi->individual_search(
                ['family_id' => $family_id, 'first_name' => $firstName, 'last_name' => $lastName]
            );
            $familyMember =
                isset($responseFamilyMember["individuals"]["individual"]) ?
                    $responseFamilyMember["individuals"]["individual"] : [];
            if (!empty($familyMember)) {
                if (isset($familyMember['birthday'])) {
                    $bSet = $this->getMeetsAgeRequirement($familyMember['birthday']);
                } else {
                    // $bSet = true;
                }
            }
            if ($bSet) {
                $phone = $groveApi->findPhoneTypeFromProfile($familyMember);
                $email = $familyMember['email'];
                $firstName = $familyMember['first_name'];
                $lastName = $familyMember['last_name'];
                $family_members[] = [
                    'Church' => 'woodlands',
                    'phone' => $phone,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $email,
                ];
            }
        }

        return $family_members;
    }

    public function getMeetsAgeRequirement($birthday)
    {
        $datetime1 = date_create(date('Y-m-d'));
        $datetime2 = date_create($birthday);
        $interval = date_diff($datetime1, $datetime2);
        $age = $interval->format('%y');

        return $age >= 16;
    }
}
