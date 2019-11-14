<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 11/13/2019
 * Time: 9:01 AM
 */
declare(strict_types=1);

namespace Dhayakawa\SpringIntoAction\Helpers;

trait ArraySearchTrait
{
    /**
     * @param       $key
     * @param array $arr
     *
     * @return array|mixed
     */
    public static function arrayValueRecursive($key, array $arr)
    {
        return self::searchArrayValueRecursiveByKey($key, $arr);
    }

    /**
     * Finds all instance and returns them.
     * Sets the $keyPath to a representation of the array keys
     *
     * @param       $key
     * @param       $needle
     * @param array $arr
     * @param int   $depth
     * @param null  $keyPath
     *
     * @return array|mixed
     */
    /**
     * Finds all instance and returns them.
     *
     * @param $key
     * @param $aStack
     *
     * @return array
     */
    public static function searchArrayValueRecursiveByKey($key, array $aStack)
    {
        $val = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveArrayIterator($aStack), RecursiveIteratorIterator::SELF_FIRST
        );
        $bShowDebugOutput = false;
        if ($bShowDebugOutput) { // just for debugging
            $newLine = array_key_exists('SHELL', $_SERVER) ? PHP_EOL : '<br>';
            $space = array_key_exists('SHELL', $_SERVER) ? ' ' : '&nbsp;';
            echo "Searching for {$key}{$newLine}";
        }
        foreach ($iterator as $k => $v) {
            // just for debugging
            if ($bShowDebugOutput) {
                $indent = str_repeat($space, 4 * $iterator->getDepth());
            }
            if ($iterator->hasChildren()) {
                // just for debugging
                // Not at end: show key only
                if ($bShowDebugOutput) {
                    echo "{$indent}{$k} :{$newLine}";
                }
                if ($key === $k) {
                    $val[] = $v;
                    //echo '$v:' . print_r($v, true);
                }
                // At end: show key, value and path
            } else {
                for ($p = [], $i = 0, $z = $iterator->getDepth(); $i <= $z; $i++) {
                    $p[] = $iterator->getSubIterator($i)->key();
                }
                $path = "['" . implode("']['", $p) . "']";
                if ($bShowDebugOutput) {
                    $output = "{$indent}$k : $v : path -> $path{$newLine}";
                }

                if ($key === $k) {
                    $val[] = $v;
                }
                if ($bShowDebugOutput) {
                    echo $output;
                }
            }
        }

        return $val;
    }

    /**
     * Finds all instance and returns them.
     *
     * @param $key
     * @param $needle
     * @param $aStack
     *
     * @return array
     */
    public static function searchArrayValueRecursiveByKeyValue($key, $needle, array $aStack)
    {
        $val = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveArrayIterator($aStack), RecursiveIteratorIterator::SELF_FIRST
        );
        // just for debugging
        // $newLine = array_key_exists('SHELL', $_SERVER) ? PHP_EOL : '<br>';
        // $space = array_key_exists('SHELL', $_SERVER) ? ' ' : '&nbsp;';
        // echo "Searching for {$key}\n";
        foreach ($iterator as $k => $v) {
            // just for debugging
            // $indent = str_repeat($space, 4 * $iterator->getDepth());

            if ($iterator->hasChildren()) {
                // just for debugging
                // Not at end: show key only
                // echo "$indent$k :{$newLine}";
                // At end: show key, value and path
            } else {
                for ($p = [], $i = 0, $z = $iterator->getDepth(); $i <= $z; $i++) {
                    $p[] = $iterator->getSubIterator($i)->key();
                }
                $path = "['" . implode("']['", $p) . "']";
                if ($key === $k && $needle === $v) {
                    $val[$path] = [$p[0] => $aStack[$p[0]]];
                    // just for debugging
                    // echo "$indent$k : $v : path -> $path{$newLine}";
                }
            }
        }

        return $val;
    }

    /**
     * @param       $key
     * @param       $needle
     * @param array $arr
     *
     * @return array|mixed
     */
    public static function arrayKeyValueRecursive($key, $needle, array $arr)
    {
        $val = [];
        array_walk_recursive(
            $arr,
            function ($v, $k) use ($key, $needle, &$val) {
                if ($k === $key && $v === $needle) {
                    array_push($val, $v);
                }
            }
        );

        return count($val) >= 1 ? $val : array_pop($val);
    }
}
