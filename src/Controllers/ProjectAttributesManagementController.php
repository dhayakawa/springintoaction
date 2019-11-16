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
use Illuminate\Support\Facades\DB;

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


}
