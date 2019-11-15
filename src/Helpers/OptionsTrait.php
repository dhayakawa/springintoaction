<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/2/2019
 * Time: 2:50 PM
 */
namespace Dhayakawa\SpringIntoAction\Helpers;

use Dhayakawa\SpringIntoAction\Models\Attribute;

trait OptionsTrait
{
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
