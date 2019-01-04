<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 11/13/2018
 * Time: 3:46 PM
 */

namespace Dhayakawa\SpringIntoAction\Controllers;

use Exception;

class GroveApi
{
    private $groveAdminUsername = '';
    private $groveAdminUserPassword = '';
    const API_MESSAGE_INVALID_CONNECTION = '001';
    const API_MESSAGE_INVALID_LOGIN_OR_PASSWORD = '002';
    const API_MESSAGE_API_NOT_ACTIVE = '003';
    const API_MESSAGE_FUNCTIONALITY_PROBLEM = '004';
    const API_MESSAGE_QUERY_LIMIT_REACHED = '005';
    const API_MESSAGE_UNKNOWN_PARAMETER = '109';
    const API_MESSAGE_UNKNOWN_SERVICE = '100';
    const API_MESSAGE_INVALID_SERVICE = '110';
    const API_MESSAGE_PERMISSION_NO_ACCESS = '110';
    const API_MESSAGE_PERMISSION_NO_PRIVATE_ACCESS = '111';
    const API_MESSAGE_INVALID_TABLE = '201';
    const API_MESSAGE_REQUIRED_PARAMETER_INVALID = '202';
    const API_MESSAGE_REQUIRED_PARAMETER_INVALID_BOOLEAN = '203';
    const API_MESSAGE_REQUIRED_PARAMETER_INVALID_DECIMAL = '204';
    const API_MESSAGE_REQUIRED_PARAMETER_INVALID_EXCEED_MAX_LENGTH = '205';
    const API_MESSAGE_REQUIRED_PARAMETER_INVALID_MONEY = '206';
    const API_MESSAGE_REQUIRED_PARAMETER_INVALID_NUMBER = '207';
    const API_MESSAGE_REQUIRED_PARAMETER_INVALID_DATETIME = '214';
    const API_MESSAGE_REQUIRED_PARAMETER_CHAR = '215';
    const API_MESSAGE_REQUIRED_PARAMETER_MISSING = '208';
    const API_MESSAGE_REQUIRED_PARAMETER_MISSING_MAX_LENGTH = '209';
    const API_MESSAGE_UNKNOWN_PARAMETER_TYPE = '210';
    const API_MESSAGE_NO_PARAMETERS_PROVIDED = '211';
    const API_MESSAGE_SIGNIFICANT_EVENT_LIMIT_REACHED = '212';
    const API_MESSAGE_REQUIRED_PARAMETER_INVALID_ARRAY = '213';
    const API_RESPONSE_UNHANDLED = '300';
    const API_RESPONSE_UNKNOWN_SERVICE = '';
    const API_RESPONSE_TYPE_UNHANDLED = '301';
    private $apiErrCodeDesc = [
        self::API_MESSAGE_INVALID_CONNECTION => 'The API must be accessed with a secure connection (https).',
        self::API_MESSAGE_INVALID_LOGIN_OR_PASSWORD => 'Invalid username or password.',
        self::API_MESSAGE_API_NOT_ACTIVE => 'API functionality not active for your organization.',
        self::API_MESSAGE_FUNCTIONALITY_PROBLEM => 'API functionality problem encountered.',
        self::API_MESSAGE_QUERY_LIMIT_REACHED => 'Query limit of \'X\' reached, please try again tomorrow.',
        self::API_MESSAGE_UNKNOWN_PARAMETER => '\'X\' is an unknown parameter.',
        self::API_MESSAGE_UNKNOWN_SERVICE => '\'X\' is an unknown service.',
        self::API_MESSAGE_INVALID_SERVICE => 'Invalid service request.',
        self::API_MESSAGE_PERMISSION_NO_ACCESS => 'You do not have permission to use this service. Please contact your system administrator.',
        self::API_MESSAGE_PERMISSION_NO_PRIVATE_ACCESS => 'The \'X\' API service is restricted and requires purchased permission. Please contact your sales representative to purchase access to this and other API services.',
        self::API_MESSAGE_INVALID_TABLE => 'Invalid table name \'X\' specified.',
        self::API_MESSAGE_REQUIRED_PARAMETER_INVALID => 'The parameter \'X\' was invalid.',
        self::API_MESSAGE_REQUIRED_PARAMETER_INVALID_BOOLEAN => 'The parameter \'X\' must be a boolean value [ 1 or 0 ].',
        self::API_MESSAGE_REQUIRED_PARAMETER_INVALID_DECIMAL => 'The parameter \'X\' must be a decimal value.',
        self::API_MESSAGE_REQUIRED_PARAMETER_INVALID_EXCEED_MAX_LENGTH => 'The parameter \'X\' exceeded the maximum length of \'Y\'.',
        self::API_MESSAGE_REQUIRED_PARAMETER_INVALID_MONEY => 'The parameter \'X\' must be in a valid money format.',
        self::API_MESSAGE_REQUIRED_PARAMETER_INVALID_NUMBER => 'The parameter \'X\' must be numeric.',
        self::API_MESSAGE_REQUIRED_PARAMETER_INVALID_DATETIME => 'The parameter \'X\' must be a properly formatted valid date.',
        self::API_MESSAGE_REQUIRED_PARAMETER_CHAR => 'The parameter \'X\' must be only one character.',
        self::API_MESSAGE_REQUIRED_PARAMETER_MISSING => 'The parameter \'X\' is missing.',
        self::API_MESSAGE_REQUIRED_PARAMETER_MISSING_MAX_LENGTH => 'The parameter \'X\' must have a defined maximum length. Please contact technical support.',
        self::API_MESSAGE_UNKNOWN_PARAMETER_TYPE => 'The supplied parameter \'X\' type \'Y\' could not be validated.',
        self::API_MESSAGE_NO_PARAMETERS_PROVIDED => 'No parameters were supplied.',
        self::API_MESSAGE_SIGNIFICANT_EVENT_LIMIT_REACHED => 'The maximum number of significant events exist for this user.',
        self::API_MESSAGE_REQUIRED_PARAMETER_INVALID_ARRAY => 'The parameter \'X\' must be an array.',
        self::API_RESPONSE_UNHANDLED => 'The service \'X\' is not currently supported.',
        self::API_RESPONSE_UNKNOWN_SERVICE => '\'X\' is an unknown API service.',
        self::API_RESPONSE_TYPE_UNHANDLED => 'The response type \'X\' is not currently supported for the service \'Y\'.',
    ];
    private $apiUrl = 'https://woodlandschurch.ccbchurch.com/api.php';
    private $apiDoc = 'http://designccb.s3.amazonaws.com/helpdesk/files/official_docs/api.html';

    /**
     * @param $method
     * @param $service
     * @param $aData
     *
     * @return mixed
     */
    public function getResponse($method, $service, $aData = [])
    {
        $uri = "{$this->apiUrl}?srv={$service}";
        if ('get' === strtolower($method)) {
            if (!empty($aData)) {
                $uri .= "&" . http_build_query($aData);
            }
            $response = $this->curlGet($uri);
        } else {
            $response = $this->curlPost($uri, $aData);
        }

        if (is_string($response)) {
            $xml = simplexml_load_string($response);
            $json = json_encode($xml);
        } else {
            $json = json_encode($response);
        }

        return json_decode($json, true);
    }

    protected function curlGet($uri, $expectedStatusCode = "HTTP/1.1 200 OK")
    {
        $httpCode = '';
        $output = "";
        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $uri);
            curl_setopt($ch, CURLOPT_USERNAME, $this->groveAdminUsername);
            curl_setopt($ch, CURLOPT_USERPWD, $this->groveAdminUserPassword);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $output = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        } catch (\Exception $e) {
        }
        if ($httpCode == "201") {
            return $output;
        } else {
            return ['error' => 'HTTP status code not expected - got ', 'description' => $httpCode];
        }
    }

    protected function curlPost($uri, $inputArray)
    {
        $httpCode = '';
        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $uri);
            curl_setopt($ch, CURLOPT_USERNAME, $this->groveAdminUsername);
            curl_setopt($ch, CURLOPT_USERPWD, $this->groveAdminUserPassword);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            if (!empty($inputArray)) {
                if (is_array($inputArray)) {
                    $inputArray = http_build_query($inputArray);
                }
                curl_setopt($ch, CURLOPT_POSTFIELDS, $inputArray);
            }
            $output = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        } catch (\Exception $e) {
            return ['error' => 'Curl Exception', 'description' => $e->getMessage()];
        }
        if ($httpCode == "201") {
            return $output;
        } else {
            return ['error' => 'HTTP status code not expected - got ', 'description' => $httpCode];
        }
    }

    /**
     * Additionally there is a service api_status which has no parameters and
     * will return: the total number of allowed calls per day (daily_limit);
     * the last date the api was called (last_run_date);
     * and the total number of calls made on that date (counter).
     * This service will not change the last run date or increment the counter.
     */
    public function api_status()
    {
        $srv = 'api_status';

        return $this->getResponse('get', $srv);
    }

    /**
     * Service Name
     * add_individual_to_event
     *
     * Required Parameters
     * name    type    notes
     * id    integer
     * event_id    integer
     * status    string    Must be one of the following: ‘add’; ‘invite’; ‘decline’; ‘maybe’; ‘request’
     * Optional Parameters
     * None
     */
    public function add_individual_to_event()
    {
        // status:  ‘add’; ‘invite’; ‘decline’; ‘maybe’; ‘request’
        // maybe attending?
        $srv = 'add_individual_to_event';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $aData = !empty($aParams) ? array_combine($aParams, \func_get_args()) : null;

        return $this->getResponse('get', $srv, $aData);
    }

    /**
     * Event Profile
     * The Event Profile service allows you to retrieve the profile for an event identified by its ID.
     *
     * Service Name
     * event_profile
     *
     * Required Parameters
     * name    type
     * id    integer
     * Optional Parameters
     * name    type    notes
     * include_guest_list    boolean    defaults to false
     * include_image_link    boolean    defaults to false
     */
    public function event_profile()
    {
        //include_guest_list=1
        $srv = 'srv=event_profile';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $aData = !empty($aParams) ? array_combine($aParams, \func_get_args()) : null;

        return $this->getResponse('get', $srv, $aData);
    }

    /**
     * Group Participants
     * The Group Participants service allows you to pass in a group ID and have the list of members associated with
     * that group returned.
     *
     * Service Name
     * group_participants
     *
     * Required Parameters
     * name    type
     * id    integer
     * Optional Parameters
     * name    type
     * include_inactive    boolean
     * modified_since    datetime
     */
    public function group_participants()
    {
        $srv = 'group_participants';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $aData = !empty($aParams) ? array_combine($aParams, \func_get_args()) : null;

        return $this->getResponse('get', $srv, $aData);
    }

    /**
     * Group Profiles
     * The Group Profiles service allows you to pass in a given date and have all groups created or modified since that
     * date returned to you. If a date is not provided, all groups in the system will be returned. Main_leader element
     * and leader element are always populated, regardless of include_participants value. The participants element is
     * populated when include_participants is true. The image link in the image element will expire, and should be
     * cached. Including it will significantly increase the runtime of the service and may cause a timeout. Please
     * consider using the “per_page” and “page” parameters if you want to get the images from your groups.
     *
     * Service Name
     * group_profiles
     *
     * Optional params
     * modified_since    datetime
     * include_participants    boolean (default true)
     * include_image_link    boolean (default false)
     * page    int    if per_page is set this defaults to 1
     * per_page int    if page is set this defaults to 25
     */
    public function group_profiles()
    {
        $srv = 'group_profiles';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $aData = !empty($aParams) ? array_combine($aParams, \func_get_args()) : null;

        return $this->getResponse('get', $srv, $aData);
    }

    /**
     * Add Significant Event for Individual
     * The Add Significant Event for Individual service creates a significant event record for the specified
     * individual. The list of acceptable event_id values comes from the Significant Event List service.
     *
     * Service Name
     * add_individual_significant_event
     *
     * Required Parameters
     * name    type
     * id    integer
     * event_id    integer
     * date    datetime
     * Optional Parameters
     * None
     */
    public function add_individual_significant_event()
    {
        $srv = 'add_individual_significant_event';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $aData = !empty($aParams) ? array_combine($aParams, \func_get_args()) : null;

        return $this->getResponse('get', $srv, $aData);
    }

    /**
     * Create Individual
     * The Create Individual service will accept form-encoded data representing a new individual and create a new
     * individual (and family, if needed) in the Church Community Builder system. The service returns the new profile
     * of the individual that was created.
     *
     * Service Name
     * create_individual
     *
     * Required Parameters
     * first_name | string | Must be sent via HTTP POST
     * last_name | string | Must be sent via HTTP POST
     *
     * Optional Parameters
     * name    type    notes
     * middle_name    string    Must be sent via HTTP POST
     * legal_first_name    string    Must be sent via HTTP POST
     * sync_id    integer    Must be sent via HTTP POST
     * other_id    string    Must be sent via HTTP POST
     * salutation    string    Must be sent via HTTP POST
     * suffix    string    Must be sent via HTTP POST
     * campus_id    integer    Must be sent via HTTP POST
     * family_id    integer    Must be sent via HTTP POST
     * family_position    string    Must be sent via HTTP POST Must be one of the following: ‘h’; ‘s’; ‘c’; ‘o’,
     * indicating ‘head of household’, ‘spouse’, ‘child’, or ‘other’ marital_status    string    Must be sent via HTTP
     * POST Must be one of the following: ‘s’; ‘m’; ‘w’; ‘d’; ‘p’; ’ ’, indicating ‘single’, ‘married’, ‘widowed’,
     * ‘divorced’, ‘separated’, or ‘not selected’ gender    string    Must be sent via HTTP POST Must be either ‘M’ or
     * ‘F’, indicating either Male or Female birthday    datetime    Must be sent via HTTP POST anniversary    datetime
     *    Must be sent via HTTP POST deceased    datetime    Must be sent via HTTP POST limited_access_user    integer
     *      Must be sent via HTTP POST Must be either 1 or 0, indicating either true or false. If not provided, the
     *      Campus Privacy Defaults setting will be used. membership_date    datetime    Must be sent via HTTP POST
     *      membership_end    datetime    Must be sent via HTTP POST membership_type_id    integer    Must be sent via
     *      HTTP POST giving_number    string    Must be sent via HTTP POST email    string    Must be sent via HTTP
     *      POST Must be a valid email mailing_street_address    string    Must be sent via HTTP POST mailing_city
     *      string    Must be sent via HTTP POST mailing_state    string    Must be sent via HTTP POST Must be two or
     *      three uppercase characters mailing_zip    string    Must be sent via HTTP POST mailing_country    string
     *      Must be sent via HTTP POST Must be two uppercase characters home_street_address    string    Must be sent
     *      via HTTP POST home_city    string    Must be sent via HTTP POST home_state    string    Must be sent via
     *      HTTP POST Must be two or three uppercase characters home_zip    string    Must be sent via HTTP POST
     *      home_country    string    Must be sent via HTTP POST Must be two uppercase characters work_street_address
     *       string    Must be sent via HTTP POST work_city    string    Must be sent via HTTP POST work_state
     *       string    Must be sent via HTTP POST Must be two or three uppercase characters work_zip    string    Must
     *       be sent via HTTP POST work_country    string    Must be sent via HTTP POST Must be two uppercase
     *       characters work_title    string    Must be sent via HTTP POST other_street_address    string    Must be
     *       sent via HTTP POST other_city    string    Must be sent via HTTP POST other_state    string    Must be
     *       sent via HTTP POST Must be two or three uppercase characters other_zip    string    Must be sent via HTTP
     *       POST other_country    string    Must be sent via HTTP POST Must be two uppercase characters contact_phone
     *         string    *DEPRECATED If you pass contact_phone and do not pass mobile_phone, it will populate the
     *         mobile_phone. If you pass both, contact_number will be ignored. Must be sent via HTTP POST home_phone
     *         string    Must be sent via HTTP POST work_phone    string    Must be sent via HTTP POST mobile_phone
     *         string    Must be sent via HTTP POST mobile_carrier    int    Must be sent via HTTP POST If not a valid
     *         id will be set to zero. Use mobile_carrier_list service to get values. allergies    string    Must be
     *         sent via HTTP POST confirmed_no_allergies    boolean    Must be sent via HTTP POST baptized    boolean
     *          Must be sent via HTTP POST udf_text_#    string    # is a number between 1–12 inclusively, Must be sent
     *          via HTTP POST udf_date_#    datetime    # is a number between 1–6 inclusively, Must be sent via HTTP
     *          POST udf_pulldown_#    integer    # is a number between 1–6 inclusively, Must be sent via HTTP POST
     *          creator_id    integer    Must be sent via HTTP POST
     */
    public function create_individual()
    {
        // POST data: first_name=Ken&last_name=Scott&campus_id=0&family_id=0&family_position=c&gender=m&birthday=2%2F12%2F1966&anniversary=May+6%2C+1989&membership_date=2010-01-01&email=ken%40test.net&mailing_street_address=12265+Oracle+Blvd%2C+Suite+105&mailing_city=Colorado+Springs&mailing_state=CO&mailing_zip=80921&mailing_country=US&mobile_phone=719-266-2888
        $srv = 'create_individual';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $aData = !empty($aParams) ? array_combine($aParams, \func_get_args()) : null;

        return $this->getResponse('post', $srv, $aData);
    }

    /**
     * Execute Saved Search
     * The Execute Saved Search service will run the search indicated for the service and return the individual
     * profiles of the individuals that currently satisfy the search.
     *
     * Service Name
     * execute_search
     *
     * Required Parameters
     * name    type
     * id    integer
     * Optional Parameters
     * name    type
     * include_inactive    boolean
     */
    public function execute_search($id,$name=null,$include_interactive=null)
    {
        $srv = 'execute_search';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $aData = !empty($aParams) ? array_combine($aParams, \func_get_args()) : null;

        return $this->getResponse('get', $srv, $aData);
    }

    /**
     * Family Detail
     * The Family Detail service will return information for a given family.
     *
     * Service Name
     * family_detail
     *
     * Required Parameters
     * name    type
     * family_id    integer
     * Optional Parameters
     * none
     */
    public function family_detail($family_id)
    {
        $srv = 'family_detail';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $aData = !empty($aParams) ? array_combine($aParams, \func_get_args()) : null;

        return $this->getResponse('get', $srv, $aData);
    }

    /**
     * Family List
     * Service Name
     * family_list
     *
     * Required Parameters
     * None
     *
     * Optional Parameters
     * name    type
     * family_id    int
     * modified_since    datetime
     */
    public function family_list($family_id = null, $modified_since = null)
    {
        $srv = 'family_list';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $aData = !empty($aParams) ? array_combine($aParams, \func_get_args()) : null;

        return $this->getResponse('get', $srv, $aData);
    }

    /**
     * Individual Profile from Login and Password
     * The Individual Profile from Login and Password service returns an individual profile for the login and password
     * provided.
     *
     * Service Name
     * individual_profile_from_login_password
     *
     * Required Parameters
     * name    type    notes
     * login    string    Must be sent via HTTP POST
     * password    string    Must be sent via HTTP POST
     */
    public function individual_profile_from_login_password($login, $password)
    {
        // POST data: login=myusername&password=mypassword
        $srv = 'individual_profile_from_login_password';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $aData = !empty($aParams) ? array_combine($aParams, \func_get_args()) : null;

        return $this->getResponse('post', $srv, $aData);
    }

    /**
     * Individual Profiles
     * The Individual Profiles service allows you to pass in a given date and have all profiles created or modified
     * since that date returned to you. If a date is not provided, all individual profiles in the system will be
     * returned.
     *
     * Service Name
     * individual_profiles
     *
     * Required Parameters
     * None
     *
     * Optional Parameters
     * name    type
     * modified_since    datetime
     * include_inactive    boolean
     * page    int    if per_page is set this defaults to 1
     * per_page    int    if page is set this defaults to 25
     */
    public function individual_profiles()
    {
        $srv = 'individual_profiles';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $aData = !empty($aParams) ? array_combine($aParams, \func_get_args()) : null;

        return $this->getResponse('get', $srv, $aData);
    }

    /**
     * Individual Search
     * The Individual Search service will allow the user to send search criteria into the service and receive a list of
     * individual profiles which match the criteria.
     *
     * Service Name
     * individual_search
     *
     * Required Parameters
     * None (at least one optional parameter must be provided, but no particular parameter is required)
     *
     * Optional Parameters
     * name    type    notes
     * first_name    string    considers First Name and Legal Name
     * last_name    string
     * phone    string    considers Home, Work, and Mobile phone numbers
     * email    string
     * street_address    string
     * city    string
     * state    string
     * zip    string
     * family_id    integer
     * include_inactive    boolean
     * max_results    integer
     */
    public function individual_search()
    {
        $srv = 'individual_search';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $aData = !empty($aParams) ? array_combine($aParams, \func_get_args()) : null;

        return $this->getResponse('get', $srv, $aData);
    }

    /**
     * Set Individual Credentials
     * The Set Individual Credentials service will set the username and password of a given individual to the provided
     * values.
     *
     * Service Name
     * set_individual_credentials
     *
     * Required Parameters
     * name    type    notes
     * id    integer    Must be sent via HTTP POST
     * username    string    Must be sent via HTTP POST
     * password    string Must be at least six characters and have both letters and numbers    Must be sent via HTTP
     * POST Optional Parameters None
     */
    public function set_individual_credentials()
    {
        // POST Data: id=48&username=newusername&password=newpassword
        $srv = 'set_individual_credentials';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $aData = !empty($aParams) ? array_combine($aParams, \func_get_args()) : null;

        return $this->getResponse('post', $srv, $aData);
    }

    /**
     * Valid Individuals
     * The Valid Individuals service returns a list of all individuals in the Church Community Builder system.
     *
     * Service Name
     * valid_individuals
     *
     * Required Parameters
     * None
     *
     * Optional Parameters
     * None
     */
    public function valid_individuals()
    {
        $srv = 'valid_individuals';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $aData = !empty($aParams) ? array_combine($aParams, \func_get_args()) : null;

        return $this->getResponse('get', $srv, $aData);
    }
}
