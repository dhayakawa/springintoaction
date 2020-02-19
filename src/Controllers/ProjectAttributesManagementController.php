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
use Dhayakawa\SpringIntoAction\Models\Attribute;
use \Dhayakawa\SpringIntoAction\Models\ProjectSkillNeededOptions;

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
        )->select('project_attributes.*')->orderBy('project_attributes.project_skill_needed_option_id', 'asc')->orderBy(
            'project_attributes.workflow_id',
            'asc'
        )->orderBy('attributes.DisplaySequence', 'asc');
        //echo $aListItems->toSql();
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
            $response = ['success' => true, 'msg' => 'ProjectAttribute Update Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'ProjectAttribute Update Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function updateList(Request $request, $listType)
    {
        $iFailures = 0;
        $requestData = $request->all();
        $attributes =
            Attribute::where('table', '=', 'projects')
                     ->where('is_core', '=', 1)
                     ->orderBy('DisplaySequence', 'asc')
                     ->select('id')
                     ->get()
                     ->toArray();
        //print_r($attributes);
        $aCoreAttributes = [];
        foreach ($attributes as $aId) {
            $aCoreAttributes[] = $aId['id'];
        }
        //print_r($aCoreAttributes);

        if (isset($requestData['deletedListItemIds']) && !empty($requestData['deletedListItemIds'])) {
            //print_r($requestData['deletedListItemIds']);
            foreach ($requestData['deletedListItemIds'] as $deletedListItemId) {
                $success = $this->getListItemModel($listType)->findOrFail($deletedListItemId)->delete();
                if (!$success) {
                    $iFailures++;
                }
            }
        }
        $aListItemList = [];
        parse_str($requestData['listItems'], $aListItemList);
        //print_r($aListItemList['list_item'][10]);
        $aCoreAttributesToUpdate = [];
        $aProjectAttributesToUpdate = [];
        foreach ($aListItemList['list_item'] as $listItemId => $listItemData) {
            if (in_array($listItemData['attribute_id'], $aCoreAttributes)) {
                if (!\array_key_exists($listItemData['attribute_id'], $aCoreAttributesToUpdate)) {
                    $aCoreAttributesToUpdate[$listItemData['attribute_id']] = [
                        'workflow_id' => $listItemData['workflow_id'],
                        'workflow_requirement' => $listItemData['workflow_requirement'],
                        'workflow_requirement_depends_on' => !empty($listItemData['workflow_requirement_depends_on']) ?
                            $listItemData['workflow_requirement_depends_on'] : null,
                        'workflow_requirement_depends_on_condition' => $listItemData['workflow_requirement_depends_on_condition'],
                    ];
                }
            } else {
                //echo 'setupdate for $listItemId:'. $listItemId. ' '. print_r($listItemData, true);
                $aProjectAttributesToUpdate[$listItemId] = [
                    'attribute_id' => $listItemData['attribute_id'],
                    'workflow_id' => $listItemData['workflow_id'],
                    'workflow_requirement' => $listItemData['workflow_requirement'],
                    'workflow_requirement_depends_on' => !empty($listItemData['workflow_requirement_depends_on']) ?
                        $listItemData['workflow_requirement_depends_on'] : null,
                    'workflow_requirement_depends_on_condition' => $listItemData['workflow_requirement_depends_on_condition'],
                    'project_skill_needed_option_id' => $listItemData['project_skill_needed_option_id'],
                ];
            }
        }
        //echo '$aCoreAttributesToUpdate'.print_r($aCoreAttributesToUpdate, true);
        // echo '$aProjectAttributesToUpdate'.print_r($aProjectAttributesToUpdate, true);
        $volunteerPrimarySkillOptions = ProjectSkillNeededOptions::get()->toArray();
        //echo '$volunteerPrimarySkillOptions' . print_r($volunteerPrimarySkillOptions, true);
        $aVolunteerPrimarySkillOptions = [];
        foreach ($volunteerPrimarySkillOptions as $aId) {
            if (!empty($aId['option_label'])) {
                $aVolunteerPrimarySkillOptions[] = $aId['id'];
            }
        }
        //echo '$aVolunteerPrimarySkillOptions' . print_r($aVolunteerPrimarySkillOptions, true);
        $aAttributeModels = [];

        foreach ($aCoreAttributesToUpdate as $attribute_id => $workflow_data) {
            $workflow_id = $workflow_data['workflow_id'];
            $workflow_requirement = $workflow_data['workflow_requirement'];
            $workflow_requirement_depends_on = $workflow_data['workflow_requirement_depends_on'];
            $workflow_requirement_depends_on_condition = $workflow_data['workflow_requirement_depends_on_condition'];
            $aAttributeModels[$attribute_id] =
                $this->getListItemModel($listType)->where('attribute_id', '=', $attribute_id)->get()->toArray();
            //echo '$aAttributeModels' . print_r($aAttributeModels, true);
            foreach ($aVolunteerPrimarySkillOptions as $volunteerPrimarySkillOptionId) {
                // this is to find orphaned attributes
                foreach ($aAttributeModels[$attribute_id] as $key => $aAttributeModel) {
                    if ($aAttributeModel['attribute_id'] == $attribute_id &&
                        $aAttributeModel['workflow_id'] == $workflow_id &&
                        $aAttributeModel['project_skill_needed_option_id'] == $volunteerPrimarySkillOptionId
                    ) {
                        //echo "unset ".print_r($aAttributeModels[$attribute_id][$key], true);
                        unset($aAttributeModels[$attribute_id][$key]);
                    }
                }
                // looking for an existing combo record
                $projectAttributeCollection =
                    $this->getListItemModel($listType)->where('attribute_id', '=', $attribute_id)->where(
                        'workflow_id',
                        '=',
                        $workflow_id
                    )->where(
                        'project_skill_needed_option_id',
                        '=',
                        $volunteerPrimarySkillOptionId
                    )->get();
                $aProjectAttributeCollection = $projectAttributeCollection->toArray();
                // if ($attribute_id === 9) {
                //     echo '$aProjectAttributeCollection' . print_r($aProjectAttributeCollection, true);
                // }
                $aModel = current($aProjectAttributeCollection);
                $bModelExists = !empty($aModel);
                $bMatchesData = false;
                if ($bModelExists) {
                    $bMRqIsNull = $aModel['workflow_requirement'] === null;
                    $bRRqIsNull = $workflow_requirement === null;
                    $bRqMatches =
                        ($bMRqIsNull &&
                         $bRRqIsNull ||
                         empty($aModel['workflow_requirement']) &&
                         empty($workflow_requirement)) ||
                        ((!$bMRqIsNull && !$bRRqIsNull) && ($aModel['workflow_requirement'] == $workflow_requirement));

                    $bMDIsNull = $aModel['workflow_requirement_depends_on'] === null;
                    $bRDIsNull = $workflow_requirement_depends_on === null;
                    $bMDCIsNull = $aModel['workflow_requirement_depends_on_condition'] === null;
                    $bRDCIsNull = $workflow_requirement_depends_on_condition === null;
                    $bDMatches =
                        ($bMDIsNull &&
                         $bRDIsNull ||
                         empty($aModel['workflow_requirement_depends_on']) &&
                         empty($workflow_requirement_depends_on)) ||
                        ((!$bMDIsNull && !$bRDIsNull) &&
                         ($aModel['workflow_requirement_depends_on'] == $workflow_requirement_depends_on));

                    $bDCMatches =
                        ($bMDCIsNull &&
                         $bRDCIsNull ||
                         empty($aModel['workflow_requirement_depends_on_condition']) &&
                         empty($workflow_requirement_depends_on_condition)) ||
                        ((!$bMDCIsNull && !$bRDCIsNull) &&
                         ($aModel['workflow_requirement_depends_on_condition'] ==
                          $workflow_requirement_depends_on_condition));
                    $bMatchesData = $bRqMatches && $bDMatches && $bDCMatches;
                }

                // if ($attribute_id === 9) {
                //     echo "\$workflow_data:" . print_r($workflow_data, true);
                //     echo "\$aModel:" . print_r($aModel, true);
                //     echo "\$bRqMatches:" . (int) $bRqMatches . PHP_EOL;
                //     echo "\$bDMatches:" . (int) $bDMatches . PHP_EOL;
                //     echo "\$bDCMatches:" . (int) $bDCMatches . PHP_EOL;
                //     echo "\$bMatchesData:" . (int) $bMatchesData . PHP_EOL;
                // }

                if ($bModelExists && $bMatchesData) {
                    // we don't need to do anything, the record hasn't been modified.
                    //echo print_r($model,true);
                } else {
                    if (!$bModelExists) {
                        //echo "combo does not exist create a new one?:$attribute_id,$workflow_id,$volunteerPrimarySkillOptionId.\n";
                        $projectAttribute = $this->getListItemModel($listType);
                        $projectAttribute->fill(
                            [
                                'attribute_id' => $attribute_id,
                                'workflow_id' => $workflow_id,
                                'workflow_requirement' => $workflow_requirement,
                                'workflow_requirement_depends_on' => $workflow_requirement_depends_on,
                                'workflow_requirement_depends_on_condition' => $workflow_requirement_depends_on_condition,
                                'project_skill_needed_option_id' => $volunteerPrimarySkillOptionId,
                            ]
                        );
                    }else{
                        //echo "update model {$aModel['id']}?".PHP_EOL;
                        $projectAttribute = $this->getListItemModel($listType)->findOrFail($aModel['id']);
                        $projectAttribute->fill(
                            [
                                'attribute_id' => $attribute_id,
                                'workflow_id' => $workflow_id,
                                'workflow_requirement' => $workflow_requirement,
                                'workflow_requirement_depends_on' => $workflow_requirement_depends_on,
                                'workflow_requirement_depends_on_condition' => $workflow_requirement_depends_on_condition,
                                'project_skill_needed_option_id' => $volunteerPrimarySkillOptionId,
                            ]
                        );

                    }

                    $success = $projectAttribute->save();
                    if (!$success) {
                        //echo "{$projectAttribute->id} failed\n";
                        $iFailures++;
                    }
                }
            }
        }
        $aMissingCoreAttributes = array_diff($aCoreAttributes, array_keys($aCoreAttributesToUpdate));
        if (!empty($aMissingCoreAttributes)) {
            //echo '$aMissingCoreAttributes attributes left to process:' . print_r($aMissingCoreAttributes, true);

            foreach ($aMissingCoreAttributes as $attribute_id) {
                foreach ($aVolunteerPrimarySkillOptions as $volunteerPrimarySkillOptionId) {
                    $workflow_id = 3;
                    $workflow_requirement = 1;
                    $workflow_requirement_depends_on = null;
                    $workflow_requirement_depends_on_condition = null;
                    $projectAttribute = $this->getListItemModel($listType);
                    $projectAttribute->fill(
                        [
                            'attribute_id' => $attribute_id,
                            'workflow_id' => $workflow_id,
                            'workflow_requirement' => $workflow_requirement,
                            'workflow_requirement_depends_on' => $workflow_requirement_depends_on,
                            'workflow_requirement_depends_on_condition' => $workflow_requirement_depends_on_condition,
                            'project_skill_needed_option_id' => $volunteerPrimarySkillOptionId,
                        ]
                    );
                    $success = $projectAttribute->save();
                    if (!$success) {
                        //echo "{$projectAttribute->id} failed\n";
                        $iFailures++;
                    }
                }
            }
        }
        if (!empty($aProjectAttributesToUpdate)) {
            //echo '$aProjectAttributesToUpdate attributes left to process:' . print_r($aProjectAttributesToUpdate, true);
            foreach ($aProjectAttributesToUpdate as $listItemId => $aData) {
                $projectAttribute = $this->getListItemModel($listType)->findOrFail($listItemId);

                if ($projectAttribute) {
                    $projectAttribute->fill(
                        [
                            'attribute_id' => $aData['attribute_id'],
                            'workflow_id' => $aData['workflow_id'],
                            'workflow_requirement' => $aData['workflow_requirement'],
                            'workflow_requirement_depends_on' => $aData['workflow_requirement_depends_on'],
                            'workflow_requirement_depends_on_condition' => $aData['workflow_requirement_depends_on_condition'],
                            'project_skill_needed_option_id' => $aData['project_skill_needed_option_id'],
                        ]
                    );
                    try {
                        $success = $projectAttribute->save();
                        if (!$success) {
                            echo "{$projectAttribute->id} failed\n";
                            $iFailures++;
                        }
                    } catch (\Exception $e) {
                        //echo $e->getMessage();
                        //echo '$listItemId:' . $listItemId . ' ' . print_r($aData, true);
                        $iFailures++;
                    }
                }
            }
        }
        foreach ($aAttributeModels as $listItemId => $aData) {
            if (!empty($aData)) {
                // echo 'Not Implemented. Extra project attribute records that needs to be removed' .
                //      print_r($aData, true);
            }
        }
        $success = $iFailures === 0;
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
                'msg' => 'ProjectAttribute Creation Succeeded.',
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
