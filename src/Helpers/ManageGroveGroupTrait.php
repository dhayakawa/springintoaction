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
use Dhayakawa\SpringIntoAction\Models\Volunteer;

trait ManageGroveGroupTrait
{
    /**
     * @return \Dhayakawa\SpringIntoAction\Controllers\GroveApi
     */
    public function getGroveApi()
    {
        if($this->groveApi === null){
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
    public function getVolunteersGroupId()
    {
        return GroveApi::GROVE_GROUP_ID_VOLUNTEERS;
    }

    /**
     * @param $groupName
     *
     * @return int
     */
    public function getGroupIdByGroupName($groupName)
    {
        // Providing extra "names" to get the group id
        switch (strtoupper($groupName)) {
            case 'LIAISON':
            case 'LIAISONS':
            case GroveApi::GROVE_GROUP_NAME_LIAISONS:
                $groupId = $this->getLiaisonGroupId();
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
        $groveIndividualId = $groveIndividual->id;

        return $groveIndividualId ? $groveIndividualId : $groveId;
    }

    /**
     * @param $groupName
     * @param $volunteerId
     *
     * @return $this
     * @throws \ReflectionException
     */
    public function addIndividualToGroup($groupName, $volunteerId)
    {
        $group_id = $this->getGroupIdByGroupName($groupName);
        $id =  $this->getIndividualId($volunteerId);
        $status = 'add';
        $groveApi = new GroveApi();

        $response = $this->getGroveApi()->add_individual_to_group($id, $group_id, $status);

        return $this;
    }

    /**
     * @param $groupName
     *
     * @return array|mixed|string|string[]
     */
    public function getGroupParticipants($groupName)
    {
        $id = $this->getGroupIdByGroupName($groupName);

        $response = $this->getGroveApi()->group_participants($id);
        echo "<pre>" . print_r($response, true) . "</pre>";

        return $response;
    }
}
