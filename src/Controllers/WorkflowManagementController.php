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
use Dhayakawa\SpringIntoAction\Models\Workflow;

class WorkflowManagementController extends BaseController
{
    public function getListItemModel($listType)
    {
        $model = null;
        switch ($listType) {
            case 'workflow':
                $model = new Workflow();
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
        $aListItems = $this->getListItemModel($listType);
        if($aListItems->hasColumn('DisplaySequence')){
        $aListItems->orderBy('DisplaySequence', 'asc');
        }
        $aResult = $aListItems->get()->toArray();

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
            $response = ['success' => true, 'msg' => 'Workflow Update Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Workflow Update Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function updateList(Request $request, $listType)
    {
        $requestData = $request->all();

        if (!empty($requestData['deletedListItemIds'])) {
            foreach ($requestData['deletedListItemIds'] as $deletedListItemId) {
                $success = $this->getListItemModel($listType)->findOrFail($deletedListItemId)->delete();
            }
        }
        $aListItemList = [];
        parse_str($requestData['listItems'], $aListItemList);
        // \Illuminate\Support\Facades\Log::debug(
        //     '',
        //     [
        //         'File:' . __FILE__,
        //         'Method:' . __METHOD__,
        //         'Line:' . __LINE__,
        //         $aListItemList
        //     ]
        // );
        foreach ($aListItemList['list_item'] as $listItemId => $listItemData) {
            // \Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,
            //
            //     $listItemId,
            //     $listItemData]);
            $model = $this->getListItemModel($listType);
            if (is_numeric($listItemId)) {
                $model = $model->findOrFail($listItemId);
            }
            $model->fill($listItemData);
            $success = $model->save();
        }

        if (!isset($success)) {
            $response = ['success' => false, 'msg' => 'Workflow Update Not Implemented Yet.'];
        } elseif ($success) {
            $response = ['success' => true, 'msg' => 'Workflow Update Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Workflow Update Failed.'];
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
            $response = ['success' => false, 'msg' => 'Workflow Creation Not Implemented Yet.'];
        } elseif ($success) {
            $response = [
                'success' => true,
                'msg' => 'Workflow Creation Succeeded.'
            ];
        } else {
            $response = ['success' => false, 'msg' => 'Workflow Creation Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function destroy(Request $request, $listType, $listItemId)
    {
        $model = $this->getListItemModel($listType)->findOrFail($listItemId);
        $success = $model->forceDelete();

        if ($success) {
            $response = ['success' => true, 'msg' => 'Workflow Delete Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Workflow Delete Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }
}
