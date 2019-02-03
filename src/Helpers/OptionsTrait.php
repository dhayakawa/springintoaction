<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/2/2019
 * Time: 2:50 PM
 */
namespace Dhayakawa\SpringIntoAction\Helpers;

trait OptionsTrait
{
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
