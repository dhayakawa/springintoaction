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
    public function executeSearch(){
        $url = 'curl -u user:pass -d "" "https://yourchurch.ccbchurch.com/api.php?srv=execute_search&id=1"';
    }
}
