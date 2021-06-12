<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/25/2021
 * Time: 10:02 PM
 */
declare(strict_types=1);

namespace Dhayakawa\SpringIntoAction\Helpers;

use Dhayakawa\SpringIntoAction\Controllers\GroveApi;
use Dhayakawa\SpringIntoAction\Models\GroveIndividual;
use Dhayakawa\SpringIntoAction\Models\ProjectRole;
use Dhayakawa\SpringIntoAction\Models\SiteRole;
use Dhayakawa\SpringIntoAction\Models\Volunteer;
use Dhayakawa\SpringIntoAction\Models\FailedGroveGroupManagementAttempt;
use Dhayakawa\SpringIntoAction\Models\VolunteerStatusOptions;

trait ManageGroveGroupTrait
{
    /**
     * @return \Dhayakawa\SpringIntoAction\Controllers\GroveApi
     */
    public function getGroveApi()
    {
        if ($this->groveApi === null) {
            $this->groveApi = new GroveApi();
        }

        return $this->groveApi;
    }

    /**
     * @return int
     */
    public function getLiaisonGroupId()
    {
        return GroveApi::GROVE_GROUP_ID_LIAISONS;
    }

    /**
     * @return int
     */
    public function getProjectManagersGroupId()
    {
        return GroveApi::GROVE_GROUP_ID_PROJECT_MANAGERS;
    }

    /**
     * @return int
     */
    public function getTeamLeadersGroupId()
    {
        return GroveApi::GROVE_GROUP_ID_TEAM_LEADERS;
    }

    /**
     * @return int
     */
    public function getEstimatorsGroupId()
    {
        return GroveApi::GROVE_GROUP_ID_ESTIMATORS;
    }

    /**
     * @return int
     */
    public function getSiteCoordinatorsGroupId()
    {
        return GroveApi::GROVE_GROUP_ID_SITE_COORDINATORS;
    }

    /**
     * @return int
     */
    public function getVolunteersGroupId()
    {
        return GroveApi::GROVE_GROUP_ID_VOLUNTEERS;
    }

    /**
     * @param bool $bReturnNames
     * @return array
     */
    public function getSiteGroups($bReturnNames = false)
    {
        if ($bReturnNames) {
            $aGroups = GroveApi::ALL_GROVE_SITE_GROUP_NAMES;
        } else {
            $aGroups = [];
            foreach (GroveApi::ALL_GROVE_SITE_GROUP_NAMES as $group) {
                $aGroups[] = $this->getGroupIdByGroupName($group);
            }
        }
        return $aGroups;
    }

    /**
     * @param bool $bReturnNames
     * @return array
     */
    public function getProjectGroups($bReturnNames = false)
    {
        if ($bReturnNames) {
            $aGroups = GroveApi::ALL_GROVE_PROJECT_GROUP_NAMES;
        } else {
            $aGroups = [];
            foreach (GroveApi::ALL_GROVE_PROJECT_GROUP_NAMES as $group) {
                $aGroups[] = $this->getGroupIdByGroupName($group);
            }
        }
        return $aGroups;
    }

    /**
     * @param $groupName
     * @return int|null
     */
    public function getProjectRoleIdByGroupName($groupName)
    {
        switch (strtoupper($groupName)) {
            case GroveApi::GROVE_GROUP_NAME_LIAISONS:
                $projectRoleId = ProjectRole::getIdByRole('Liaison');
                break;
            case GroveApi::GROVE_GROUP_NAME_TEAM_LEADERS:
                $projectRoleId = ProjectRole::getIdByRole('Team Leader');
                break;
            case GroveApi::GROVE_GROUP_NAME_ESTIMATORS:
                $projectRoleId = ProjectRole::getIdByRole('Estimator');
                break;
            case GroveApi::GROVE_GROUP_NAME_VOLUNTEERS:
                $projectRoleId = ProjectRole::getIdByRole('Worker');
                break;
            default:
                $projectRoleId = 0;
        }

        return $projectRoleId;
    }

    /**
     * @param $groupName
     * @return int|null
     */
    public function getSiteRoleIdByGroupName($groupName)
    {
        switch (strtoupper($groupName)) {
            case GroveApi::GROVE_GROUP_NAME_SITE_COORDINATORS:
                $siteRoleId = SiteRole::getIdByRole('Site Coordinator');
                break;
            case GroveApi::GROVE_GROUP_NAME_PROJECT_MANAGERS:
                $siteRoleId = SiteRole::getIdByRole('Project Manager');
                break;
            default:
                $siteRoleId = 0;
        }

        return $siteRoleId;
    }

    /**
     * @param $groupName
     * @return array
     */
    public function getRoleIdentifiersByGroupName($groupName)
    {
        $roleType = 'project';
        $roleId = $this->getProjectRoleIdByGroupName($groupName);
        if (!$roleId) {
            $roleType = 'site';
            $roleId = $this->getSiteRoleIdByGroupName($groupName);
        }
        return [$roleType, $roleId];
    }

    public function getGroupIdByProjectRoleId($ProjectRoleID)
    {

        $projectRole = ProjectRole::where('ProjectRoleID', $ProjectRoleID)->get()->first();

        switch ($projectRole->Role) {
            case 'Worker':
                $groupId = $this->getVolunteersGroupId();
                break;
            case 'Estimator':
                $groupId = $this->getEstimatorsGroupId();
                break;
            case 'Team Leader':
                $groupId = $this->getTeamLeadersGroupId();
                break;
            case 'Liaison':
                $groupId = $this->getLiaisonGroupId();
                break;
            default:
                $groupId = null;
        }

        return $groupId;
    }

    public function getGroupIdBySiteRoleId($SiteRoleID)
    {
        $siteRole = SiteRole::where('SiteRoleID', $SiteRoleID)->get()->first();
        switch ($siteRole->Role) {
            case 'Site Coordinator':
                $groupId = $this->getSiteCoordinatorsGroupId();
                break;
            case 'Project Manager':
                $groupId = $this->getProjectManagersGroupId();
                break;
            default:
                $groupId = 0;
        }

        return $groupId;
    }

    /**
     * @param $groupName
     *
     * @return int
     */
    public function getGroupIdByGroupName($groupName)
    {
        if(is_numeric($groupName)){
            return $groupName;
        }
        // exact match
        if (isset(GroveApi::ALL_GROVE_GROUPS[$groupName])) {
            return GroveApi::ALL_GROVE_GROUPS[$groupName];
        }
        // Providing extra "names" to get the group id
        switch (strtoupper($groupName)) {
            case 'LIAISON':
            case 'LIAISONS':
            case GroveApi::GROVE_GROUP_NAME_LIAISONS:
                $groupId = $this->getLiaisonGroupId();
                break;
            case GroveApi::GROVE_GROUP_NAME_ESTIMATORS:
                $groupId = $this->getEstimatorsGroupId();
                break;
            case GroveApi::GROVE_GROUP_NAME_SITE_COORDINATORS:
                $groupId = $this->getSiteCoordinatorsGroupId();
                break;
            case 'PROJECT_MANAGER':
            case 'PROJECT_MANAGERS':
            case GroveApi::GROVE_GROUP_NAME_TEAM_LEADERS:
                $groupId = $this->getProjectManagersGroupId();
                break;
            case 'TEAM_LEADER':
            case 'TEAM_LEADERS':
            case GroveApi::GROVE_GROUP_NAME_PROJECT_MANAGERS:
                $groupId = $this->getTeamLeadersGroupId();
                break;
            case 'WORKER':
            case 'WORKERS':
            case 'VOLUNTEER':
            case 'VOLUNTEERS':
            case GroveApi::GROVE_GROUP_NAME_VOLUNTEERS:
                $groupId = $this->getVolunteersGroupId();
                break;
            default:
                $groupId = 0;
        }

        return $groupId;
    }

    /**
     * @param $volunteerId
     *
     * @return int
     */
    public function getIndividualId($volunteerId)
    {
        $volunteer = Volunteer::where(
            [
                [
                    'VolunteerID',
                    '=',
                    $volunteerId,
                ],
            ]
        )
            ->get()
            ->first();
        $groveId = $volunteer->IndividualID;
        $groveIndividual = GroveIndividual::where(
            [
                [
                    'email',
                    '=',
                    $volunteer->Email,
                ],
                [
                    'first_name',
                    '=',
                    $volunteer->FirstName,
                ],
                [
                    'last_name',
                    '=',
                    $volunteer->LastName,
                ],
            ]
        )
            ->get()
            ->first();
        $groveIndividualId = null;
        if ($groveIndividual) {
            $groveIndividualId = $groveIndividual->id;
        }
//        echo "\$volunteerId:$volunteerId,\$groveIndividualId:$groveIndividualId, \$groveId:$groveId \n";
        return $groveIndividualId ? $groveIndividualId : $groveId;
    }

    /**
     * @param $group
     * @param $bAgreedStatus
     * @param null $volunteerId
     * @param null $individualId
     * @return $this
     * @throws \ReflectionException
     */
    public function updateGroupIndividual($group, $bAgreedStatus, $volunteerId = null, $individualId = null)
    {
        if (!$individualId && !$volunteerId) {
            throw new \Exception('Volunteer ID or Grove ID is required');
        }
        $group_id = is_numeric($group) ? $group : $this->getGroupIdByGroupName($group);
        $id = $individualId ? $individualId : $this->getIndividualId($volunteerId);
        if(!$id){
            return $this;
        }
        if ($bAgreedStatus) {
            $this->addIndividualToGroup($group_id, null, $id);
        } else {
            $this->removeIndividualFromGroup($group_id, null, $id);
        }

        return $this;
    }

    /**
     * @param $group
     * @param null $volunteerId
     * @param null $individualId
     * @return $this
     * @throws \Exception
     */
    public function addIndividualToGroup($group, $volunteerId = null, $individualId = null)
    {
        if (!$individualId && !$volunteerId) {
            throw new \Exception('Volunteer ID is required');
        }
        $group_id = is_numeric($group) ? $group : $this->getGroupIdByGroupName($group);
        $id = $individualId ? $individualId : $this->getIndividualId($volunteerId);
        $status = 'add';

        $maxAttempts = $this->bSaveFailedGroveGroupManagementAttempts ? 1 : null;
        $aCallParams = [$id, $group_id, $status];
        $response = $this->getGroveApi()->getResponseCallUntil('add_individual_to_group', $aCallParams, $maxAttempts);
        if (isset($response['error'])) {
            $this->saveFailedGroupCall('add_individual_to_group', $aCallParams, $response['error']);
        }
        //echo 'response:'. print_r($response, true);

        return $this;
    }

    /**
     * @param $group
     * @param null $volunteerId
     * @param null $individualId
     * @return $this
     * @throws \Exception
     */
    public function removeIndividualFromGroup($group, $volunteerId = null, $individualId = null)
    {
        if (!$individualId && !$volunteerId) {
            throw new \Exception('Volunteer ID is required');
        }
        $group_id = is_numeric($group) ? $group : $this->getGroupIdByGroupName($group);
        $id = $individualId ? $individualId : $this->getIndividualId($volunteerId);

        $maxAttempts = $this->bSaveFailedGroveGroupManagementAttempts ? 1 : null;
        $aCallParams = [$id, $group_id];
        $response = $this->getGroveApi()->getResponseCallUntil('remove_individual_from_group', $aCallParams, $maxAttempts);
        if (isset($response['error'])) {
            $this->saveFailedGroupCall('remove_individual_from_group', $aCallParams, $response['error']);
        }

        return $this;
    }

    /**
     * @param $groupType [*|site|project]
     * @param null $volunteerId
     * @param null $individualId
     * @return $this
     * @throws \Exception
     */
    public function removeIndividualFromAllGroups($groupType, $volunteerId = null, $individualId = null)
    {
        if (!$individualId && !$volunteerId) {
            throw new \Exception('Volunteer ID is required');
        }

        if ($groupType === '*') {
            $aGroups = array_merge($this->getSiteGroups(true), $this->getProjectGroups(true));
        } else {
            $aGroups = strtolower($groupType) === 'site' ? $this->getSiteGroups(true) : $this->getProjectGroups(true);
        }

        foreach ($aGroups as $group) {
            $this->removeIndividualFromGroup($group, $volunteerId, $individualId);
        }


        return $this;
    }

    /**
     * @param $group
     *
     * @return array|mixed|string|string[]
     */
    public function getGroupParticipants($group)
    {
        $aGroupParticipants = [];
        $id = is_numeric($group) ? $group : $this->getGroupIdByGroupName($group);
        $response = $this->getGroveApi()->getResponseCallUntil('group_participants', $aCallParams = [$id]);

        //echo "<pre>" . print_r($response, true) . "</pre>";
        if (isset($response['groups'])) {
            $aGroupParticipants = $response['groups']['group']['participants']['participant'];
        }
        //['groups']['group']['participants']['@attributes']['total_participants'];
        //echo "<pre>" . print_r($aGroupParticipants, true) . "</pre>";
        return $aGroupParticipants;
    }

    /**
     * Unless $bForceCompleteUpdate is true, only failed group calls will be resolved
     * @param bool $bForceCompleteUpdate
     */
    public function updateGroupsWithCurrentData($bForceCompleteUpdate = false)
    {
        // do not save failed attempts during this call
        $this->bSaveFailedGroveGroupManagementAttempts = false;
        if ($bForceCompleteUpdate) {
            $Year = $this->getCurrentYear();
            $agreedVolunteerStatusId = (int)VolunteerStatusOptions::getIdByStatusOption('Agreed');

            foreach (array_keys(\Dhayakawa\SpringIntoAction\Controllers\GroveApi::ALL_GROVE_GROUPS) as $groupName) {
                echo $groupName . '<br>'.PHP_EOL;
                $aApiResponse = $this->getGroupParticipants($groupName);
                if ($aApiResponse) {
                    $aGroupParticipants = $this->convertGroupParticipantsResponseToSimpleList($aApiResponse, true, false);
                    echo '<pre>$aGroupParticipants:'.print_r($aGroupParticipants, true).'</pre>';
                    [$roleType, $roleId] = $this->getRoleIdentifiersByGroupName($groupName);
                    $aResults = [];
                    echo "$roleType : $roleId<br>";
                    if($roleType === 'project'){
                        $workerRoleId = ProjectRole::getIdByRole('Worker');
                        $bReturnWorker = (int)$workerRoleId ===
                            $ProjectVolunteerRole = new \Dhayakawa\SpringIntoAction\Models\ProjectVolunteerRole();
                        $aResults = $ProjectVolunteerRole->getProjectVolunteersByRoleId($roleId, $bReturnWorker, $Year);
                    } elseif($roleType === 'site'){
                        $SiteVolunteerRole = new \Dhayakawa\SpringIntoAction\Models\SiteVolunteerRole();
                        $aResults = $SiteVolunteerRole->getAllSiteVolunteersByRoleId($roleId, $Year);
                    } else {
                        echo "Skipped {$groupName} Group Update for {$roleType} role because it is an unknown role type.\n";
                        continue;
                    }
                    echo '<pre>aResults:'.print_r($aResults, true).'</pre>';
                    if($aResults){
                        foreach($aResults as $aResult){
                            $individualId = $this->getIndividualId($aResult['VolunteerID']);
                            if($individualId){
                                $bHasAgreed = (int) $agreedVolunteerStatusId === (int) $aResult['Status'];
                                if($bHasAgreed){
                                    // If not in group yet, add them
                                    if(!in_array($individualId,array_column($aGroupParticipants, 'id'))){
                                        echo "add $individualId {$aResult['FirstName']} to $groupName<br>";
                                        $this->addIndividualToGroup($groupName, null, $individualId);
                                    }
                                } else {
                                    // If in group but not agreed, remove them
                                    if(!in_array($individualId,array_column($aGroupParticipants, 'id'))){
                                        echo "remove $individualId {$aResult['FirstName']} from $groupName<br>";
                                        $this->removeIndividualFromGroup($groupName, null, $individualId);
                                    }
                                }
                            }
                        }
                        if($aGroupParticipants){
                            // remove people that have been deleted
                            foreach($aGroupParticipants as $aGroupParticipant){
//                                if(!in_array($aGroupParticipant['id'],array_column($aResults, 'id'))){
//                                    echo "remove {$aGroupParticipant['id']} {$aResult['FirstName']} from $groupName<br>";
//                                    $this->removeIndividualFromGroup($groupName, null, $aGroupParticipant['id']);
//                                }
                            }
                        }
                    } else {
                        // since there isn't anyone in the db anymore, remove all non leader participants
                        if ($aGroupParticipants) {
                            foreach ($aGroupParticipants as $participant) {
                                // echo '<pre>'.print_r($participant, true).'</pre>';
                                if (strtolower($participant['status']) !== 'leader') {
                                    echo "remove {$participant['name']} individualId:{$participant['id']} from {$groupName}\n";
                                    $this->removeIndividualFromGroup($groupName, null, $participant['id']);
                                }
                            }
                        }
                    }

                }
            }
        } else {
            $aFailedGroveGroupManagementAttempts = FailedGroveGroupManagementAttempt::orderBy('created_at', 'asc')->get()->toArray();
            $aDeleteSuccess=[];
            $aAttemptFailed=[];
            if($aFailedGroveGroupManagementAttempts){
                foreach($aFailedGroveGroupManagementAttempts as $aAttempt){
                    $aCallParams = json_decode($aAttempt['call_params'], true);
                    $response = $this->getGroveApi()->getResponseCallUntil($aAttempt['call'], $aCallParams);
                    if(!isset($response['error'])){

                        $deleteSuccess = FailedGroveGroupManagementAttempt::findOrFail($aAttempt['id'])->delete();
                        if($deleteSuccess){
                            $aDeleteSuccess[]=$aAttempt['id'];
                        }
                    } else {
                        $aAttemptFailed[]=$aAttempt;
                    }
                }
            }
        }

        $this->bSaveFailedGroveGroupManagementAttempts = true;
    }

    public function testGroup()
    {
        $g = new GroveApi();
        $include_participants = 0;
        $modified_since = '2021-03-01';
        $saraGroveId = 798;
        $saraVolunteerId = 626;
        $testIndividualId = $saraGroveId;
        $testVolunteerId = $saraVolunteerId;
        $testGroup = GroveApi::GROVE_GROUP_NAME_LIAISONS;
        //$testGroupId = $this->getGroupIdByGroupName($testGroup);
\Dhayakawa\SpringIntoAction\Controllers\GroveController::runImport('lifegroup');
//       $response= $g->individual_groups(1675);
//        echo "<pre>" . print_r($response, true) . '</pre>';
//        $apiresponse = $this->getGroupParticipants($testGroup);
//        echo "<pre>{$testGroup} Group Participants Before:\n" . print_r($this->convertGroupParticipantsResponseToSimpleList($apiresponse), true) . '</pre>';
//        $apiresponse = $this->getGroupParticipants(GroveApi::GROVE_GROUP_NAME_VOLUNTEERS);
//        echo "<pre>GroveApi::GROVE_GROUP_NAME_VOLUNTEERS Group Participants Before:\n" . print_r($this->convertGroupParticipantsResponseToSimpleList($apiresponse), true) . '</pre>';
//        $apiresponse = $this->getGroupParticipants(GroveApi::GROVE_GROUP_NAME_SITE_COORDINATORS);
//        echo "<pre>GroveApi::GROVE_GROUP_NAME_SITE_COORDINATORS Group Participants Before:\n" . print_r($this->convertGroupParticipantsResponseToSimpleList($apiresponse), true) . '</pre>';

//        $this->addIndividualToGroup($testGroup, $testVolunteerId, $testIndividualId);
//
//        $apiresponse = $this->getGroupParticipants($testGroup);
//        echo "<pre>{$testGroup} Group Participants After add:\n" . print_r($this->convertGroupParticipantsResponseToSimpleList($apiresponse), true) . '</pre>';

        //$this->removeIndividualFromGroup($testGroup, $testVolunteerId, $testIndividualId);
//        $groupType = '*';
//        $this->removeIndividualFromAllGroups($groupType, $testVolunteerId, $testIndividualId);
//        $this->updateGroupsWithCurrentData($bForceCompleteUpdate = true);
//        $apiresponse = $this->getGroupParticipants($testGroup);
//        echo "<pre>{$testGroup} Group Participants After updateGroups:\n" . print_r($this->convertGroupParticipantsResponseToSimpleList($apiresponse), true) . '</pre>';

//        $r=$g->group_profile_from_id(\Dhayakawa\SpringIntoAction\Controllers\GroveApi::GROVE_GROUP_ID_PROJECT_MANAGERS);
//        echo '<pre>'.print_r($r,true).'</pre>';
    }

    private function convertGroupParticipantsResponseToSimpleList($response, $bAsArray = false, $bIncludeLeaders = true)
    {
        $aList = [];
        foreach ($response as $participant) {
            //echo '<pre>'.print_r($participant, true).'</pre>';
            $individualId = $participant['@attributes']['id'];
            $status = $participant['status']['@value'];
            if(!$bIncludeLeaders){
                continue;
            }
            if (!$bAsArray) {
                $aList[] = "{$individualId} {$participant['name']}, {$participant['email']}, {$status}, date joined:{$participant['date_joined']}";
            } else {
                $aList[] = [
                    'id' => $individualId,
                    'status' => $status,
                    'name' => $participant['name'],
                    'email' => $participant['email'],
                    'mobile_phone' => $participant['mobile_phone'],
                    'active' => $participant['active'],
                    'date_joined' => $participant['date_joined']
                ];
            }
        }

        return $aList;
    }

    /**
     * @param $call
     * @param array $aCallParams
     * @param $reason
     */
    public function saveFailedGroupCall($call, $aCallParams = [], $reason)
    {
        if ($this->bSaveFailedGroveGroupManagementAttempts) {
            $model = new FailedGroveGroupManagementAttempt();
            $data = [
              'call' => $call,
              'call_params' => json_encode($aCallParams),
              'reason' => $reason
            ];
            $model->fill($data);

            $success = $model->save();
        }
    }
}
