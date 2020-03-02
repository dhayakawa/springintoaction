<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 3/22/2019
 * Time: 3:17 PM
 */

namespace Dhayakawa\SpringIntoAction\Controllers;

use Dhayakawa\SpringIntoAction\Controllers\FrontendBackboneAppController as BaseController;

class GroveController extends BaseController
{

    public static function runImport($importType)
    {

        $groveApi = new GroveApi();

        switch ($importType) {
            case 'individuals':
                $groveApi->importIndividuals(true, true);
                break;
            case 'family':
                $groveApi->importFamilyMemberType();
                break;
            case 'lifegroup':
                $groveApi->importLifeGroups(true, true);
                break;
            case 'status':
                $response = $groveApi->rate_limit_test();
                echo '<pre>rate_limit_test:' . print_r($response, true) . '</pre>';
                $response = $groveApi->api_status();
                echo '<pre>api_status:' . print_r($response, true) . '</pre>';
                break;
        }
    }
}
