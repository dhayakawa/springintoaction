<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 10/24/2019
 * Time: 10:08 AM
 */
declare(strict_types=1);

namespace Dhayakawa\SpringIntoAction\Helpers;

trait CurrentYearTrait
{
    public static function _getCurrentYear()
    {
        $yearNow = date('Y');
        $month = date('n');

        // need to make sure the year is for the upcoming/next spring
        // or this spring if the month is less than may
        return $month > 5 ? $yearNow + 1 : $yearNow;
    }
    public function getCurrentYear()
    {
        return self::_getCurrentYear();
    }
}
