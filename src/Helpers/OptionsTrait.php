<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/2/2019
 * Time: 2:50 PM
 */
namespace Dhayakawa\SpringIntoAction\Helpers;

use Dhayakawa\SpringIntoAction\Models\Attribute;
use Dhayakawa\SpringIntoAction\Models\WhenWillProjectBeCompletedOptions;
use Dhayakawa\SpringIntoAction\Models\BudgetSourceOptions;
use Dhayakawa\SpringIntoAction\Models\BudgetStatusOptions;
use Dhayakawa\SpringIntoAction\Models\ProjectSkillNeededOptions;
use Dhayakawa\SpringIntoAction\Models\ProjectStatusOptions;
use Dhayakawa\SpringIntoAction\Models\SendStatusOptions;
use Dhayakawa\SpringIntoAction\Models\VolunteerAgeRangeOptions;
use Dhayakawa\SpringIntoAction\Models\VolunteerPrimarySkillOptions;
use Dhayakawa\SpringIntoAction\Models\VolunteerSkillLevelOptions;
use Dhayakawa\SpringIntoAction\Models\VolunteerStatusOptions;
use Dhayakawa\SpringIntoAction\Models\PermitRequiredStatusOptions;
use Dhayakawa\SpringIntoAction\Models\PermitRequiredOptions;

trait OptionsTrait
{
    public static function getOptionsSourceModel($optionsSourceTable = null)
    {
        $aOptionsModels = [
            'budget_source_options' => BudgetSourceOptions::class,
            'budget_status_options' => BudgetStatusOptions::class,
            'permit_required_options' => PermitRequiredOptions::class,
            'permit_required_status_options'=>PermitRequiredStatusOptions::class,
            'project_skill_needed_options'=>ProjectSkillNeededOptions::class,
            'project_status_options'=>ProjectStatusOptions::class,
            'send_status_options'=>SendStatusOptions::class,
            'volunteer_status_options'=>VolunteerStatusOptions::class,
            'when_will_project_be_completed_options'=>WhenWillProjectBeCompletedOptions::class,
        ];
        if($optionsSourceTable !== null){
            if (isset($aOptionsModels[$optionsSourceTable])) {
                return $aOptionsModels[$optionsSourceTable];
            } else {
                return null;
            }
        }
        return $aOptionsModels;
    }
    public static function getAttributesArray($table=null)
    {
        if ($table) {
            $aAttributes = Attribute::where('table', '=', $table)->orderBy('DisplaySequence', 'asc')->get();
        } else {
            $aAttributes = Attribute::sortBy('DisplaySequence', 'asc')->get();
        }
        $attributes = $aAttributes ? $aAttributes->toArray() : [];
        return $attributes;
    }
    public static function getAttributesByCodeArray($table=null)
    {
        $aAttributeByCode = [];
        $aAttributes = self::getAttributesArray($table);

        foreach($aAttributes as $attribute){
            $aAttributeByCode[$attribute['attribute_code']] = $attribute;
        }
        return $aAttributeByCode;
    }
    public static function getAttributesLabelsArray($table=null)
    {
        $aAttributeLabels = [];
        $aAttributes = self::getAttributesArray($table);

        foreach($aAttributes as $attribute){
            $aAttributeLabels[$attribute['attribute_code']] = $attribute['label'];
        }
        return $aAttributeLabels;
    }
    public static function getOptionLabelsArray()
    {
        $aOptionLabels = [];
        $aOptions = self::select(['option_label', 'id'])->get()->toArray();
        foreach ($aOptions as $aOption) {
            $aOptionLabels[$aOption['option_label']] = $aOption['id'];
        }

        return $aOptionLabels;
    }
}
