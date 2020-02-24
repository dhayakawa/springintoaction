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
        //$response = $groveApi->api_status();
        switch ($importType) {
            case 'individuals':
                $groveApi->importIndividuals(true, false);
                break;
            case 'family':
                $groveApi->importFamilyMemberType();
                break;
            case 'lifegroup':
                $groveApi->importLifeGroups(true, true);
                echo "done importing lifegroup";
                break;
            case 'status':
                $response = $groveApi->rate_limit_test();
                echo '<pre>rate_limit_test:' . print_r($response, true) . '</pre>';
                $response = $groveApi->api_status();
                echo '<pre>api_status:' . print_r($response, true) . '</pre>';
                break;
        }

        // $response = $groveApi->family_list();
        // echo '<pre>' . print_r($response, true) . '</pre>';

        //$response = $groveApi->group_search(['department_id' => 10]);
        //$response = $groveApi->individual_groups(797);
        //$response = $groveApi->family_list(512);
    }
}
