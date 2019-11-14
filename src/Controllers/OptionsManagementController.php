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
use Dhayakawa\SpringIntoAction\Models\BudgetSourceOptions;
use Dhayakawa\SpringIntoAction\Models\BudgetStatusOptions;
use Dhayakawa\SpringIntoAction\Models\ProjectSkillNeededOptions;
use Dhayakawa\SpringIntoAction\Models\ProjectStatusOptions;
use Dhayakawa\SpringIntoAction\Models\SendStatusOptions;
use Dhayakawa\SpringIntoAction\Models\VolunteerAgeRangeOptions;
use Dhayakawa\SpringIntoAction\Models\VolunteerPrimarySkillOptions;
use Dhayakawa\SpringIntoAction\Models\VolunteerSkillLevelOptions;
use Dhayakawa\SpringIntoAction\Models\VolunteerStatusOptions;
use Dhayakawa\SpringIntoAction\Models\ProjectRole;
use Dhayakawa\SpringIntoAction\Models\SiteRole;
use Dhayakawa\SpringIntoAction\Models\WhenWillProjectBeCompletedOptions;

class OptionsManagementController extends BaseController
{
    public function getOptionModel($OptionType)
    {
        $model = null;
        switch ($OptionType) {
            case 'budget_source_options':
                $model = new BudgetSourceOptions();
                break;
            case 'budget_status_options':
                $model = new BudgetStatusOptions();
                break;
            case 'project_skill_needed_options':
                $model = new ProjectSkillNeededOptions();
                break;
            case 'project_status_options':
                $model = new ProjectStatusOptions();
                break;
            case 'site_roles':
                $model = new SiteRole();
                break;
            case 'project_roles':
                $model = new ProjectRole();
                break;
            case 'volunteer_status_options':
                $model = new VolunteerStatusOptions();
                break;
            case 'send_status_options':
                $model = new SendStatusOptions();
                break;
            case 'when_will_project_be_completed_options':
                $model = new WhenWillProjectBeCompletedOptions();
                break;
        }

        return $model;
    }

    public function getOption(Request $request, $OptionType, $OptionID)
    {
        $model = $this->getOptionModel($OptionType)->findOrFail($OptionID);

        return $model->toArray();
    }

    public function getOptions(Request $request, $OptionType)
    {
        $aOptions = $this->getOptionModel($OptionType)->orderBy('DisplaySequence', 'asc')->get()->toArray();

        return $aOptions;
    }

    public function update(Request $request, $OptionType, $OptionID)
    {
        $model = $this->getOptionModel($OptionType)->findOrFail($OptionID);
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
            $response = ['success' => true, 'msg' => 'Option Update Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Option Update Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function updateList(Request $request, $OptionType)
    {
        $requestData = $request->all();

        if (!empty($requestData['deletedOptionIds'])) {
            foreach ($requestData['deletedOptionIds'] as $deletedOptionId) {
                $success = $this->getOptionModel($OptionType)->findOrFail($deletedOptionId)->delete();
            }
        }
        $aOptionList = [];
        parse_str($requestData['optionList'], $aOptionList);
        // \Illuminate\Support\Facades\Log::debug(
        //     '',
        //     [
        //         'File:' . __FILE__,
        //         'Method:' . __METHOD__,
        //         'Line:' . __LINE__,
        //         $aOptionList
        //     ]
        // );
        foreach ($aOptionList['option'] as $optionId => $optionData) {
            // \Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,
            //
            //     $optionId,
            //     $optionData]);
            $model = $this->getOptionModel($OptionType);
            if (is_numeric($optionId)) {
                $model = $model->findOrFail($optionId);
            }
            $model->fill($optionData);
            $success = $model->save();
        }

        if (!isset($success)) {
            $response = ['success' => false, 'msg' => 'Option Update Not Implemented Yet.'];
        } elseif ($success) {
            $response = ['success' => true, 'msg' => 'Option Update Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Option Update Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function store(Request $request, $OptionType)
    {
        $model = $this->getOptionModel($OptionType);
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
            $response = ['success' => false, 'msg' => 'Option Creation Not Implemented Yet.'];
        } elseif ($success) {
            $response = [
                'success' => true,
                'msg' => 'Option Creation Succeeded.',
            ];
        } else {
            $response = ['success' => false, 'msg' => 'Option Creation Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function destroy(Request $request, $OptionType, $OptionID)
    {
        $model = $this->getOptionModel($OptionType)->findOrFail($OptionID);
        $success = $model->forceDelete();

        if ($success) {
            $response = ['success' => true, 'msg' => 'Option Delete Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Option Delete Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }
}
