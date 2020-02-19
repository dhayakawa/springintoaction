<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/12/2020
 * Time: 12:12 PM
 */
declare(strict_types=1);

namespace Dhayakawa\SpringIntoAction\Helpers;

use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Dhayakawa\SpringIntoAction\Models\Attribute;
use Dhayakawa\SpringIntoAction\Models\ProjectAttribute;
use Dhayakawa\SpringIntoAction\Models\Workflow;
use Dhayakawa\SpringIntoAction\Models\ProjectAttributesInt;
use Dhayakawa\SpringIntoAction\Models\ProjectAttributesDecimal;
use Dhayakawa\SpringIntoAction\Models\ProjectAttributesText;
use Dhayakawa\SpringIntoAction\Models\ProjectAttributesVarchar;
use Dhayakawa\SpringIntoAction\Models\ProjectScope;

trait AttributesTrait
{
    /**
     * Returns Associated array: attribute_code => Attribute->toArray()
     *
     * @param null $attributesTableField
     *
     * @return array
     */
    public static function getAttributesByCodeArray($attributesTableField = null)
    {
        $aAttributeByCode = [];
        $aAttributes = self::getAttributesArray($attributesTableField);

        foreach ($aAttributes as $attribute) {
            $aAttributeByCode[$attribute['attribute_code']] = $attribute;
        }

        return $aAttributeByCode;
    }

    public static function getAttributesLabelsArray($attributesTableField = null)
    {
        $aAttributeLabels = [];
        $aAttributes = self::getAttributesArray($attributesTableField);

        foreach ($aAttributes as $attribute) {
            $aAttributeLabels[$attribute['attribute_code']] = $attribute['label'];
        }

        return $aAttributeLabels;
    }

    public static function getAttributeCodesArray($attributesTableField = null)
    {
        $aAttributeCodes = [];
        $aAttributes = self::getAttributesArray($attributesTableField);

        foreach ($aAttributes as $attribute) {
            $aAttributeCodes[] = $attribute['attribute_code'];
        }

        return $aAttributeCodes;
    }

    public static function getAttributesArray($attributesTableField = null)
    {
        if ($attributesTableField) {
            $aAttributes =
                Attribute::where('table', '=', $attributesTableField)->orderBy('DisplaySequence', 'asc')->get();
        } else {
            $aAttributes = Attribute::sortBy('DisplaySequence', 'asc')->get();
        }

        return $aAttributes ? $aAttributes->toArray() : [];
    }

    /**
     * @param $attributeCode
     *
     * @return string
     */
    public static function getAttributeCodePivotTable($attributeCode)
    {
        return "{$attributeCode}_table";
    }

    /**
     * @param $attributesTableField
     * @param $tableFieldType
     *
     * @return string
     */
    public static function getAttributeCodeFieldTypeTable($attributesTableField, $tableFieldType)
    {
        $singularTableName = rtrim($attributesTableField, 's');

        return "{$singularTableName}_attributes_{$tableFieldType}";
    }

    /**
     * Return all columns unless $attributeCode is passed in and then only that column is returned
     *
     * @param       $attributesTableField
     * @param array $aExcludeAttributeCodes
     * @param null  $attributeCode
     *
     * @return array
     */
    public static function getAttributesSelectColumns(
        $attributesTableField,
        $aExcludeAttributeCodes = [],
        $attributeCode = null
    ) {
        $aSelectColumns = [];
        $aAttributeCodes = self::getAttributeCodesArray($attributesTableField);
        if ($attributeCode && !in_array($attributeCode, $aAttributeCodes)) {
            return $aSelectColumns;
        }
        foreach ($aAttributeCodes as $code) {
            if (!empty($aExcludeAttributeCodes) && in_array($code, $aExcludeAttributeCodes)) {
                continue;
            }
            $fieldName = $code;
            $tableAlias = self::getAttributeCodePivotTable($code);
            $selectColumn = "{$tableAlias}.value as $fieldName";
            if ($attributeCode) {
                return [$selectColumn];
            }
            $aSelectColumns[] = $selectColumn;
        }

        return $aSelectColumns;
    }

    /**
     * leftJoin all columns unless $attributeCode is passed in and then only that column is joined
     * @param       $model - example: $projectScope
     * @param       $attributesTableField - example: projects
     * @param       $attributesTableFieldPrimaryKeyFieldName - example: ProjectID
     * @param       $attributesTableFieldTypeForeignKey - example: project_id
     * @param array $aExcludeAttributeCodes
     * @param null  $attributeCode
     *
     * @return $this
     */
    public static function leftJoinAttributes(
        $model,
        $attributesTableField,
        $attributesTableFieldPrimaryKeyFieldName,
        $attributesTableFieldTypeForeignKey,
        $aExcludeAttributeCodes = [],
        $attributeCode = null
    ) {
        $aAttributes = self::getAttributesArray($attributesTableField);
        foreach ($aAttributes as $aAttribute) {
            if (empty($aAttribute['table_field_type']) || (!empty($aExcludeAttributeCodes) && in_array($aAttribute['attribute_code'],
                                                               $aExcludeAttributeCodes))) {
                continue;
            }

            $attributeCodeFieldTypeTable = self::getAttributeCodeFieldTypeTable($attributesTableField, $aAttribute['table_field_type']);
            $attributeCodePivotTableAlias = self::getAttributeCodePivotTable($aAttribute['attribute_code']);
            if ($attributeCode === null || ($attributeCode !== null && $attributeCode === $aAttribute['attribute_code'])) {
                $model = $model->leftJoin(
                    "$attributeCodeFieldTypeTable as $attributeCodePivotTableAlias",
                    function ($join) use (
                        $attributesTableField,
                        $attributesTableFieldPrimaryKeyFieldName,
                        $attributeCodePivotTableAlias,
                        $attributesTableFieldTypeForeignKey,
                        $aAttribute
                    ) {
                        $join->on(
                            "{$attributesTableField}.{$attributesTableFieldPrimaryKeyFieldName}",
                            '=',
                            "{$attributeCodePivotTableAlias}.{$attributesTableFieldTypeForeignKey}"
                        )->where(
                            "{$attributeCodePivotTableAlias}.attribute_id",
                            "=",
                            $aAttribute['id']
                        );
                    }
                );
            }
        }

        return $model;
    }

    public function getAttributeJoinSql($model, $attributesTableField,
                                        $attributesTableFieldPrimaryKeyFieldName,
                                        $attributesTableFieldTypeForeignKey,$attributeCode)
    {
        $joinSql = '';
        $field = '';

        $joinedModel = self::leftJoinAttributes($model,$attributesTableField,$attributesTableFieldPrimaryKeyFieldName,
                                           $attributesTableFieldTypeForeignKey,
                                           null,$attributeCode);
        $sql = \Illuminate\Support\Str::replaceArray('?', $joinedModel->getBindings(), $joinedModel->toSql());
        $joinSql = preg_replace("/^select \* from `.*?` /","",$sql);
        $joinSql = preg_replace("/ where.*$/","",$joinSql);
        \Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,$joinSql]);

        return [$joinSql,$field];
    }
}
