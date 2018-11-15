<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 11/13/2018
 * Time: 3:46 PM
 */

namespace Dhayakawa\SpringIntoAction\Controllers;

class GroveApi
{
    private $apiUrl = 'https://woodlandschurch.ccbchurch.com/api.php';

    public function getApiUrl($aQueryParams)
    {
        $sQueryString = http_build_query($aQueryParams);
        $apiUrl = "{$this->apiUrl}?{$sQueryString}";
        return $apiUrl;
    }

    public function executeSearch()
    {
        $url = 'curl -u user:pass -d "" "https://yourchurch.ccbchurch.com/api.php?srv=execute_search&id=1"';
    }
}
