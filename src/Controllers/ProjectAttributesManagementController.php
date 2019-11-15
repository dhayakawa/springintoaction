<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 10/14/2019
 * Time: 11:40 PM
 */
declare(strict_types=1);

namespace Dhayakawa\SpringIntoAction\Controllers;

use Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
use Illuminate\Http\Request;
use Dhayakawa\SpringIntoAction\Models\ProjectAttribute;

class ProjectAttributesManagementController extends BaseController
{
    public function getListItemModel($listType)
    {
        $model = null;
        switch ($listType) {
            case 'project_attributes':
                $model = new ProjectAttribute();
                break;

        }

        return $model;
    }

    public function getListItem(Request $request, $listType, $listItemId)
    {
        $model = $this->getListItemModel($listType)->findOrFail($listItemId);

        return $model->toArray();
    }

    public function getList(Request $request, $listType)
    {
        $aListItems = ProjectAttribute::join(
            'attributes',
            'attributes.id',
            '=',
            'project_attributes.attribute_id'
        )->select('project_attributes.*')->orderBy('project_attributes.project_skill_needed_option_id', 'asc')->orderBy('project_attributes.workflow_id', 'asc')->orderBy('attributes.DisplaySequence', 'asc');
        //echo $aListItems->toSql();
        $aResult= $aListItems->get()->toArray();

        return $aResult;
    }

    public function update(Request $request, $listType, $listItemId)
    {
        $model = $this->getListItemModel($listType)->findOrFail($listItemId);
        $data = $request->only($model->getFillable());
        array_walk(
            $data,
            function (&$value, $key) use ($data) {
                if (is_string($value)) {
                    $value = \urldecode($value);
                }
            }
        );

        $model->fill($data);
        $success = $model->save();

        if ($success) {
            $response = ['success' => true, 'msg' => 'ProjectAttribute Update Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'ProjectAttribute Update Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function updateList(Request $request, $listType)
    {
        $requestData = $request->all();

        if (isset($requestData['deletedListItemIds']) && !empty($requestData['deletedListItemIds'])) {
            //print_r($requestData['deletedListItemIds']);
            foreach ($requestData['deletedListItemIds'] as $deletedListItemId) {
                $success = $this->getListItemModel($listType)->findOrFail($deletedListItemId)->delete();
            }
        }
        $aListItemList = [];
        parse_str($requestData['listItems'], $aListItemList);

        foreach ($aListItemList['list_item'] as $listItemId => $listItemData) {

            $model = $this->getListItemModel($listType);
            if (is_numeric($listItemId)) {
                $model = $model->findOrFail($listItemId);
            }

            $model->fill($listItemData);
            // echo '$listItemData:'.print_r($listItemData, true);
            // echo '$model:'.print_r($model->toArray(), true);
            $success = $model->save();
        }

        if (!isset($success)) {
            $response = ['success' => false, 'msg' => 'ProjectAttribute Update Not Implemented Yet.'];
        } elseif ($success) {
            $response = ['success' => true, 'msg' => 'ProjectAttribute Update Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'ProjectAttribute Update Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function store(Request $request, $listType)
    {
        $model = $this->getListItemModel($listType);
        $data = $request->only($model->getFillable());
        array_walk(
            $data,
            function (&$value, $key) {
                if (is_string($value)) {
                    $value = \urldecode($value);
                }
            }
        );
        $model->fill($data);
        $success = $model->save();

        if (!isset($success)) {
            $response = ['success' => false, 'msg' => 'ProjectAttribute Creation Not Implemented Yet.'];
        } elseif ($success) {
            $response = [
                'success' => true,
                'msg' => 'ProjectAttribute Creation Succeeded.'
            ];
        } else {
            $response = ['success' => false, 'msg' => 'ProjectAttribute Creation Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function destroy(Request $request, $listType, $listItemId)
    {
        $model = $this->getListItemModel($listType)->findOrFail($listItemId);
        $success = $model->forceDelete();

        if ($success) {
            $response = ['success' => true, 'msg' => 'ProjectAttribute Delete Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'ProjectAttribute Delete Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function manage() {
        define('location', 1);
        define('dimensions', 2);
        define('material_needed_and_cost', 4);
        define('estimated_total_cost', 5);
        define('volunteers_needed_estimate', 6);
        define('estimated_time_to_complete', 7);
        define('when_will_project_be_completed', 8);
        define('prep_work_required', 9);
        define('permit_required', 10);
        define('permit_required_for', 11);
        define('would_like_team_lead_to_contact', 12);
        define('special_equipment_needed', 13);
        define('painting_dimensions', 14);
        define('estimated_paint_cans_needed', 16);
        define('estimated_paint_tape_rolls_needed', 17);
        define('paint_already_on_hand', 20);
        define('paint_ordered', 21);
        define('needs_to_be_started_early', 22);
        define('actual_cost', 23);
        define('child_friendly', 24);
        define('status_reason', 25);
        define('pc_see_before_sia', 26);
        define('setup_day_instructions', 27);
        define('sia_day_instructions', 28);
        define('need_sia_tshirts_for_pc', 29);
        define('project_send', 30);
        define('cost_estimate_done', 31);
        define('material_list_done', 32);
        define('volunteer_allocation_done', 33);
        define('permits_or_approvals_done', 34);
        define('permits_or_approvals_status', 35);
        define('special_instructions', 37);
        define('budget_allocation_done', 38);
        define('budget_sources', 39);
        define('final_completion_assessment', 40);
        define('final_completion_status', 41);
        define('primary_skill_needed', 42);
        define('status', 43);

        define('scope', 1);
        define('implement', 2);
        define('ready', 3);
        define('done', 4);

        $sql = "update project_attributes set workflow_id = scope where attribute_id in (status, status_reason, location, dimensions, material_needed_and_cost,estimated_total_cost,volunteers_needed_estimate,prep_work_required ,permit_required,permit_required_for,would_like_team_lead_to_contact,special_equipment_needed,estimated_time_to_complete,when_will_project_be_completed,special_instructions);";
        $sql = "update project_attributes set workflow_id = implement where attribute_id in (needs_to_be_started_early, actual_cost, child_friendly, pc_see_before_sia, setup_day_instructions, sia_day_instructions,need_sia_tshirts_for_pc);";
    }
}
