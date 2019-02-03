<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 11/13/2018
 * Time: 3:46 PM
 */

namespace Dhayakawa\SpringIntoAction\Controllers;

use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Dhayakawa\SpringIntoAction\Models\LifeGroups;
use Dhayakawa\SpringIntoAction\Models\GroveIndividual;

class GroveApi
{
    private $groveAdminUsername = 'springintoaction';
    private $groveAdminUserPassword = 'ynkp=9z##%4d!V24';
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
    //curl -u springintoaction:ynkp=9z##%4d!V24 -d "" "https://woodlandschurch.ccbchurch.com/api.php?srv=api_status"
    private $bReturnXML = false;
    // around 60 calls
    private $xRateLimitLimit = null;
    private $xRateLimitRemaining = null;
    private $xRateLimitReset = null;
    private $xRateLimitRetryAfter = null;
    private $iRateLimitSleep = 7;
    private $bTooManyRequests = false;
    
    /**
     * @param       $method
     * @param       $service
     * @param array $aData
     *
     * @return mixed
     * @throws \Exception
     */
    public function getResponse($method, $service, $aData = [])
    {
        ini_set("max_execution_time", 0);
        ini_set("memory_limit", "2512M");
        ini_set('display_errors', 1);
        // This should set the current rate limits
        $this->rate_limit_test();
        if ($this->bTooManyRequests) {
            if (!$this->getIsAfterRetryTime()) {
                return [
                    'error' => 'Too many Grove requests',
                    'description' => '',
                    'output' => '',
                ];
            }
        }
        $uri = "{$this->apiUrl}?srv={$service}";
        
        if ('get' === strtolower($method)) {
            if (!empty($aData)) {
                $uri .= "&" . http_build_query($aData);
            }
            $response = $this->curlGet($uri);
        } else {
            $response = $this->curlPost($uri, $aData);
        }
        Storage::disk('local')->append('grove_uri.log', date('Y-m-d') . " {$method} " . $uri . PHP_EOL);
        if (is_string($response)) {
            if ($this->bReturnXML) {
                return $response;
            }
            $aResponse = \Dhayakawa\SpringIntoAction\Helpers\XML2Array::createArray($response);
            $aResponse = isset($aResponse['ccb_api']['response']) ? $aResponse['ccb_api']['response'] : [];
        } else {
            // If it's not a string it's an error from the curlGet or curlPost call
            $aResponse = $response;
        }
        
        return isset($aResponse['response']) ? $aResponse['response'] : $aResponse;
    }
    
    protected function curlGet($uri, $expectedStatusCode = "HTTP/1.1 200 OK")
    {
        $httpCode = '';
        $output = "";
        try {
            $header = [
                'Authorization: Basic ' . base64_encode("{$this->groveAdminUsername}:{$this->groveAdminUserPassword}"),
            ];
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $uri);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
            curl_setopt($ch, CURLOPT_USERPWD, "{$this->groveAdminUsername}:{$this->groveAdminUserPassword}");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $aResponseHeaders = [];
            // this function is called by curl for each header received
            curl_setopt(
                $ch,
                CURLOPT_HEADERFUNCTION,
                function ($curl, $header) use (&$aResponseHeaders) {
                    $len = strlen($header);
                    $header = explode(':', $header, 2);
                    if (count($header) < 2) // ignore invalid headers
                    {
                        return $len;
                    }
                    
                    $name = strtolower(trim($header[0]));
                    if (!array_key_exists($name, $aResponseHeaders)) {
                        $aResponseHeaders[$name] = [trim($header[1])];
                    } else {
                        $aResponseHeaders[$name][] = trim($header[1]);
                    }
                    
                    return $len;
                }
            );
            $output = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $this->setRateLimits($aResponseHeaders, $httpCode);
        } catch (\Exception $e) {
        }
        if ($httpCode == "200") {
            return $output;
        } else {
            return ['error' => 'HTTP status code not expected - got ', 'description' => $httpCode, 'output' => $output];
        }
    }
    
    protected function curlPost($uri, $inputArray)
    {
        $httpCode = '';
        try {
            $header = [
                'Authorization: Basic ' . base64_encode("{$this->groveAdminUsername}:{$this->groveAdminUserPassword}"),
            ];
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $uri);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
            curl_setopt($ch, CURLOPT_USERPWD, "{$this->groveAdminUsername}:{$this->groveAdminUserPassword}");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            $aResponseHeaders = [];
            // this function is called by curl for each header received
            curl_setopt(
                $ch,
                CURLOPT_HEADERFUNCTION,
                function ($curl, $header) use (&$aResponseHeaders) {
                    $len = strlen($header);
                    $header = explode(':', $header, 2);
                    if (count($header) < 2) // ignore invalid headers
                    {
                        return $len;
                    }
                    
                    $name = strtolower(trim($header[0]));
                    if (!array_key_exists($name, $aResponseHeaders)) {
                        $aResponseHeaders[$name] = [trim($header[1])];
                    } else {
                        $aResponseHeaders[$name][] = trim($header[1]);
                    }
                    
                    return $len;
                }
            );
            if (!empty($inputArray)) {
                if (is_array($inputArray)) {
                    $inputArray = http_build_query($inputArray);
                }
                curl_setopt($ch, CURLOPT_POSTFIELDS, $inputArray);
            }
            $output = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $this->setRateLimits($aResponseHeaders, $httpCode);
        } catch (\Exception $e) {
            return ['error' => 'Curl Exception', 'description' => $e->getMessage()];
        }
        if ($httpCode == "200") {
            return $output;
        } else {
            return ['error' => 'HTTP status code not expected - got ', 'description' => $httpCode, 'output' => $output];
        }
    }
    
    /**
     * @param $aResponseHeaders
     * @param $httpCode
     */
    private function setRateLimits($aResponseHeaders, $httpCode)
    {
        $this->xRateLimitLimit =
            isset($aResponseHeaders['x-ratelimit-limit']) ? $aResponseHeaders['x-ratelimit-limit'] : false;
        $this->xRateLimitRemaining =
            isset($aResponseHeaders['x-ratelimit-remaining']) ? $aResponseHeaders['x-ratelimit-remaining'] : false;
        $this->xRateLimitReset =
            isset($aResponseHeaders['x-ratelimit-reset']) ? $aResponseHeaders['x-ratelimit-reset'] : false;
        $this->xRateLimitRetryAfter =
            isset($aResponseHeaders['retry-after']) ? $aResponseHeaders['retry-after'] : false;
        
        if ($this->xRateLimitRetryAfter || (int) $httpCode === 429) {
            $this->bTooManyRequests = true;
        } else {
            $this->bTooManyRequests = false;
        }
        Storage::disk('local')->put(
            'grove_rate_limits.log',
            date('Y-m-d') . " " . $httpCode . PHP_EOL . print_r(
                $aResponseHeaders,
                true
            ) . PHP_EOL
        );
    }
    
    public function getRateLimit()
    {
        if ($this->xRatelimitLimit === null) {
            $this->rate_limit_test();
        }
        
        return $this->xRatelimitLimit;
    }
    
    public function getRateLimitRemaining()
    {
        if ($this->xRatelimitRemaining === null) {
            $this->rate_limit_test();
        }
        
        return $this->xRatelimitRemaining;
    }
    
    public function getRateLimitReset()
    {
        if ($this->xRatelimitReset === null) {
            $this->rate_limit_test();
        }
        
        return $this->xRatelimitReset;
    }
    
    public function getRateLimitRetryAfter​()
    {
        if ($this->xRateLimitRetryAfter​ === null) {
            $this->rate_limit_test();
        }
        
        return $this->xRateLimitRetryAfter​;
    }
    
    public function getRateLimitSleep()
    {
        return $this->iRateLimitSleep;
    }
    
    /**
     * @return bool
     */
    public function getIsAfterRetryTime()
    {
        if ($this->xRateLimitRetryAfter) {
            $datetime2 = date_create(date('Y-m-d H:i:s'));
            $datetime1 = date_create(date('Y-m-d H:i:s', $this->xRateLimitRetryAfter));
            $interval = date_diff($datetime1, $datetime2);
            $age = $interval->format('%R%s');
            
            return (int) $age <= 0;
        }
        
        return true;
    }
    
    public function rate_limit_test()
    {
        $srv = 'rate_limit_test';
        $uri = "{$this->apiUrl}?srv={$srv}";
        $response = $this->curlGet($uri);
        
        return $response;
    }
    
    public function importFamilyMemberType()
    {
        $bUseLogFile = true;
        $bForceRebuild = true;
        $bRebuildLogFiles = false;
        $modifiedSince = '2015-02-09';
        $aApiParams = [
            'modified_since' => $modifiedSince,
        ];
        if (!GroveIndividual::where('family_member_type', '!=', '')->exists()) {
            $aApiParams = null;
        }
        if ($bUseLogFile) {
            $hoursLogIsValid = 12;
            $iExpectedLogs = 38;
            clearstatcache();
            $localPath = Storage::disk('local')->getDriver()->getAdapter()->getPathPrefix();
            $filename = $localPath . 'grove_family_list.log';
            if (\file_exists($filename)) {
                $timestamp = filemtime($filename);
                
                $datetime1 = date_create(date('Y-m-d H:i'));
                $datetime2 = date_create(date('Y-m-d H:i', $timestamp));
                
                $interval = date_diff($datetime1, $datetime2);
                
                $age = $interval->format('%h');
                $bRebuildLogFiles = $age > $hoursLogIsValid;
                $aLogFilePaths = glob($localPath . "grove_family_list.log");
                if (count($aLogFilePaths) < $iExpectedLogs) {
                    $bRebuildLogFiles = true;
                }
                if ($bRebuildLogFiles) {
                    if (!empty($aLogFilePaths)) {
                        foreach ($aLogFilePaths as $aLogFilePath) {
                            unlink($aLogFilePath);
                        }
                    }
                }
            } else {
                $bRebuildLogFiles = true;
            }
            if ($bRebuildLogFiles) {
                $this->bReturnXML = true;
                $logName = 'grove_family_list.log';
                $response = $this->family_list($aApiParams);
                Storage::disk('local')->put($logName, $response);
                try {
                    $aResponse = \Dhayakawa\SpringIntoAction\Helpers\XML2Array::createArray($response);
                } catch (Exception $e) {
                    $aResponse = [];
                }
                $response = isset($aResponse['ccb_api']['response']) ? $aResponse['ccb_api']['response'] : [];
                $this->bReturnXML = false;
            }
        }
        if ($bUseLogFile) {
            $logName = 'grove_family_list.log';
            $exists = Storage::disk('local')->exists($logName);
            if ($exists) {
                $response = Storage::disk('local')->get($logName);
                $aResponse = \Dhayakawa\SpringIntoAction\Helpers\XML2Array::createArray($response);
                $response = isset($aResponse['ccb_api']['response']) ? $aResponse['ccb_api']['response'] : [];
            } else {
                $response = [];
            }
        } else {
            $response = $this->family_list($aApiParams);
        }
        
        $aFamilies = [];
        if (isset($response['families']['family'])) {
            $aFamilies = $response['families']['family'];
        }
        foreach ($aFamilies as $aFamily) {
            $aIndividuals = $aFamily['individuals']['individual'];
            if (isset($aIndividuals['first_name'])) {
                $aIndividuals = [$aIndividuals];
            }
            foreach ($aIndividuals as $aIndividual) {
                $groveIndividual = GroveIndividual::find($aIndividual['@attributes']['id']);
                if ($groveIndividual) {
                    $groveIndividual->family_member_type = $aIndividual['type'];
                    $groveIndividual->save();
                }
            }
        }
    }
    
    public function importIndividuals($bSaveToDb = true, $bShowOutput = false)
    {
        // We must force the $bUseLogFile so we can clean up the xml. otherwise it takes too long
        $bUseLogFile = true;
        $bForceRebuild = true;
        $bRebuildLogFiles = false;
        $modifiedSince = '2015-02-09';
        $iRecordsPerPage = 100;
        $iInfiniteLoopLimitMax = 100;
        
        $iExpectedFiles[100] = 86;
        // rounded down to nearest hundred
        $iExpectedRecordCnt = 8500;
        $groveCount = GroveIndividual::select(DB::raw('count(*) as count'))->first()->toArray()['count'];
        if ($groveCount >= $iExpectedRecordCnt) {
            $groveMaxUpdateAt =
                GroveIndividual::select(DB::raw('max(updated_at) as max_update_at'))->first()->toArray(
                )['max_update_at'];
            list($modifiedSince, $timeJunk) = preg_split("/ /", $groveMaxUpdateAt);
        }
        $localPath = Storage::disk('local')->getDriver()->getAdapter()->getPathPrefix();
        // Let the long running script finish
        set_time_limit(0);
        
        if ($bUseLogFile) {
            $aSavedLogFilePaths = glob($localPath . "saved_grove_individual_profiles_*.log");
            if (!empty($aSavedLogFilePaths)) {
                foreach ($aSavedLogFilePaths as $aLogFilePath) {
                    unlink($aLogFilePath);
                }
            }
            $aRawLogFilePaths = glob($localPath . "raw_grove_individual_profiles_*.log");
            if (!empty($aRawLogFilePaths)) {
                foreach ($aRawLogFilePaths as $aLogFilePath) {
                    unlink($aLogFilePath);
                }
            }
            if ($bForceRebuild) {
                $aLogFilePaths = glob($localPath . "grove_individual_profiles_*.log");
                if ($bForceRebuild || $bRebuildLogFiles) {
                    if (!empty($aLogFilePaths)) {
                        foreach ($aLogFilePaths as $aLogFilePath) {
                            unlink($aLogFilePath);
                        }
                    }
                }
            }
            $hoursLogIsValid = 12;
            
            clearstatcache();
            $filename = $localPath . 'grove_individual_profiles_1.log';
            if (\file_exists($filename)) {
                $timestamp = filemtime($filename);
                
                $datetime1 = date_create(date('Y-m-d H:i'));
                $datetime2 = date_create(date('Y-m-d H:i', $timestamp));
                
                $interval = date_diff($datetime1, $datetime2);
                
                $age = $interval->format('%h');
                
                $bRebuildLogFiles = $age > $hoursLogIsValid;
                $aLogFilePaths = glob($localPath . "grove_individual_profiles_*.log");
                
                if ($bForceRebuild || $bRebuildLogFiles) {
                    if (!empty($aLogFilePaths)) {
                        foreach ($aLogFilePaths as $aLogFilePath) {
                            unlink($aLogFilePath);
                        }
                    }
                }
            } else {
                $bRebuildLogFiles = true;
            }
            
            if ($bForceRebuild || $bRebuildLogFiles) {
                $iPageNum = 1;
                $this->bReturnXML = true;
                do {
                    $logName = 'grove_individual_profiles_' . $iPageNum . '.log';
                    $iTestDataSetupStart = microtime(1);
                    $response = $this->individual_profiles(
                        [
                            'page' => $iPageNum,
                            'per_page' => $iRecordsPerPage,
                            'include_inactive' => false,
                            'modified_since' => $modifiedSince,
                        ]
                    );
                    if (is_array($response)) {
                        if (isset($response['error'])) {
                            die($response['error']);
                        }
                        break;
                    }
                    $iTestDataSetupEnd = microtime(1);
                    $iTestDataSetupTime = $iTestDataSetupEnd - $iTestDataSetupStart;
                    $sFormattedSetupTime = $this->formatSeconds($iTestDataSetupTime);
                    //echo "It took {$sFormattedSetupTime} to complete grove call<br>\n";
                    Storage::disk('local')->put(
                        str_replace('grove_individual_profiles', 'raw_grove_individual_profiles', $logName),
                        $response
                    );
                    $iTestDataSetupStart = microtime(1);
                    $xml = new \SimpleXMLElement($response);
                    $xpathIndividual = "/ccb_api/response/individuals/individual";
                    $result = $xml->xpath($xpathIndividual);
                    if (!$result || count($result) < 1) {
                        // break out of loop to stop
                        $iPageNum = $iInfiniteLoopLimitMax;
                    } else {
                        $aRemoveNodes = [
                            'sync_id',
                            'other_id',
                            'giving_number',
                            'family_image',
                            'family_position',
                            'family_members',
                            'middle_name',
                            'legal_first_name',
                            'full_name',
                            'salutation',
                            'suffix',
                            'image',
                            'allergies',
                            'confirmed_no_allergies',
                            'addresses',
                            'mobile_carrier',
                            'gender',
                            'marital_status',
                            'emergency_contact_name',
                            'anniversary',
                            'baptized',
                            'limited_access_user',
                            'deceased',
                            'membership_type',
                            'membership_date',
                            'membership_end',
                            'receive_email_from_church',
                            'default_new_group_messages',
                            'default_new_group_comments',
                            'default_new_group_digest',
                            'default_new_group_sms',
                            'privacy_settings',
                            'active',
                            'creator',
                            'modifier',
                            'created',
                            'user_defined_text_fields',
                            'user_defined_date_fields',
                            'user_defined_pulldown_fields',
                        ];
                        foreach ($aRemoveNodes as $node) {
                            $nodeXpath = "{$xpathIndividual}/{$node}";
                            $result = $xml->xpath($nodeXpath);
                            if ($result) {
                                foreach ($result as $node) {
                                    unset($node[0]);
                                }
                            } else {
                                echo "Failed nodeXpath: $nodeXpath<br>";
                            }
                        }
                        $response = $xml->asXml();
                        
                        Storage::disk('local')->put($logName, $response);
                        try {
                            $aResponse = \Dhayakawa\SpringIntoAction\Helpers\XML2Array::createArray($response);
                        } catch (Exception $e) {
                            $aResponse = [];
                        }
                        $response = isset($aResponse['ccb_api']['response']) ? $aResponse['ccb_api']['response'] : [];
                        if (!isset($response['individuals'])) {
                            echo '<h1>individuals node is missing in rebuild</h1>';
                            echo '<pre>' . print_r($response, true) . '</pre>';
                            // break out of loop to stop
                            $iPageNum = $iInfiniteLoopLimitMax;
                        }
                    }
                    
                    $iPageNum++;
                    $bInfiniteLoopLimit = ($iPageNum > $iInfiniteLoopLimitMax) || ($iPageNum > $iRecordsPerPage);
                    $bNoMoreRecords =
                        isset($response['individuals']['@attributes']['count']) ?
                            $response['individuals']['@attributes']['count'] < 1 : true;
                    $bContinue = !empty($response) && !$bNoMoreRecords && !$bInfiniteLoopLimit;
                    if ($bContinue) {
                        sleep($this->getRateLimitSleep());
                    }
                } while ($bContinue);
                $this->bReturnXML = false;
            }
        }
        if ($bShowOutput) {
            // Allow us to send content to the browser before the script is done
            ini_set(
                "implicit_flush",
                true
            );
            // remove all existing buffers or else the implicit flush doesn't work for some reason.
            // ** Make sure you don't need these buffers... at the time I wrote this, this method is meant to run on stand alone scripts
            do {
                echo ob_get_contents();
            } while (@ob_end_clean());
            // This is the magic. Output 1019 characters to the browser so it triggers the page to load. 1019 is a value I found
            // in a forum post. There is an actual required amout of data that needs to be sent or the browser will ignore it and wait
            // for more data. I think the different browsers require different amounts of data. 1019 worked for firefox and I didn't do
            // any discovery to see what the least amount of data was required.
            print(str_repeat(" ", 1019) . "\n");
            flush();// Flush all output to browser now.
            echo "<ol>";
            print(str_repeat(" ", 1019) . "\n");
            flush();// Flush all output to browser now.
        }
        $aLogFilePaths = glob($localPath . "grove_individual_profiles_*.log");
        if (count($aLogFilePaths) === 0) {
            return true;
        }
        $iIndividualCnt = 1;
        $iPageNum = 1;
        do {
            if ($bUseLogFile) {
                $logName = 'grove_individual_profiles_' . $iPageNum . '.log';
                $exists = Storage::disk('local')->exists($logName);
                if ($exists) {
                    $response = Storage::disk('local')->get($logName);
                    $aResponse = \Dhayakawa\SpringIntoAction\Helpers\XML2Array::createArray($response);
                    $response = isset($aResponse['ccb_api']['response']) ? $aResponse['ccb_api']['response'] : [];
                } else {
                    $response = [];
                    
                    $iPageNum = $iInfiniteLoopLimitMax;
                }
            } else {
                $response = $this->individual_profiles(
                    [
                        'page' => $iPageNum,
                        'per_page' => $iRecordsPerPage,
                        'include_inactive' => false,
                        'modified_since' => $modifiedSince,
                    ]
                );
            }
            $aIndividuals = [];
            if (isset($response['individuals']['individual'])) {
                $aIndividuals = $response['individuals']['individual'];
            }
            foreach ($aIndividuals as $aIndividual) {
                $data = [
                    'id' => $aIndividual['@attributes']['id'],
                    'family_id' => $aIndividual['family']['@attributes']['id'],
                    'campus' => $aIndividual['campus']['@attributes']['id'],
                    'first_name' => $aIndividual['first_name'],
                    'last_name' => $aIndividual['last_name'],
                    'login' => $aIndividual['login'],
                    'email' => $aIndividual['email'],
                    'mobile_phone' => $this->findPhoneTypeFromProfile($aIndividual, $type = 'mobile', $defaultTo = ''),
                    'home_phone' => $this->findPhoneTypeFromProfile($aIndividual, $type = 'home', $defaultTo = ''),
                    'contact_phone' => $this->findPhoneTypeFromProfile(
                        $aIndividual,
                        $type = 'contact',
                        $defaultTo = ''
                    ),
                    'birthday' => $aIndividual['birthday'],
                    'modified' => $aIndividual['modified'],
                ];
                
                $err =
                    !isset($aIndividual['@attributes']['id']) ? 'missing individual_id on page ' . $iPageNum . PHP_EOL :
                        '';
                $iIndividualCnt++;
                if ($bShowOutput) {
                    echo '<li>' . $iIndividualCnt . '<pre>' . $err . print_r($aIndividual, true) . '</pre>';
                }
                
                if ($bSaveToDb) {
                    $individual_id = $data['id'];
                    $groveIndividual = GroveIndividual::find($data['id']);
                    if ($groveIndividual) {
                        unset($data['id']);
                    } else {
                        $groveIndividual = new GroveIndividual();
                    }
                    
                    $groveIndividual->fill($data);
                    $success = $groveIndividual->save();
                    if ($bShowOutput) {
                        if ($success) {
                            echo "$iIndividualCnt. Saved {$individual_id}<br>";
                        } else {
                            echo "Save failed {$individual_id}<br>";
                        }
                    }
                    if (!$success) {
                        die("Save failed {$individual_id}");
                    }
                }
                if ($bShowOutput) {
                    echo '</li>';
                    print(str_repeat(" ", 1019) . "\n");
                    flush();// Flush all output to browser now.
                }
            }
            if (Storage::disk('local')->exists($logName)) {
                Storage::move(
                    $logName,
                    str_replace('grove_individual_profiles', 'saved_grove_individual_profiles', $logName)
                );
            }
            if (Storage::disk('local')->exists(
                str_replace('grove_individual_profiles', 'raw_grove_individual_profiles', $logName)
            )
            ) {
                Storage::disk('local')->delete(
                    str_replace('grove_individual_profiles', 'raw_grove_individual_profiles', $logName)
                );
            }
            $iPageNum++;
            $bInfiniteLoopLimit = $iPageNum > $iInfiniteLoopLimitMax;
            
            $bNoMoreRecords =
                isset($response['individuals']['@attributes']['count']) ?
                    $response['individuals']['@attributes']['count'] < 1 : true;
        } while (!$bNoMoreRecords && !$bInfiniteLoopLimit);
        
        if ($bShowOutput) {
            echo "</ol>";
            print(str_repeat(" ", 1019) . "\n");
            flush();// Flush all output to browser now.
            ini_restore('implicit_flush');
        }
        
        ini_set('max_execution_time', 160);
    }
    
    public function importLifeGroups($bSaveToDb = true, $bUseLogFile = false, $bShowOutput = false)
    {
        $iInfiniteLoopLimitMax = 100;
        $lifeGroupDepartmentId = 10;
        $aImportGroupDepartments = [$lifeGroupDepartmentId];
        $localPath = Storage::disk('local')->getDriver()->getAdapter()->getPathPrefix();
        // Let the long running script finish
        set_time_limit(0);
        if ($bSaveToDb) {
            DB::table('life_groups')->truncate();
        }
        if ($bUseLogFile) {
            $hoursLogIsValid = 12;
            $iExpectedLogs = 38;
            clearstatcache();
            $filename = $localPath . 'grove_group_profiles_1.log';
            if (\file_exists($filename)) {
                $timestamp = filemtime($filename);
                
                $datetime1 = date_create(date('Y-m-d H:i'));
                $datetime2 = date_create(date('Y-m-d H:i', $timestamp));
                
                $interval = date_diff($datetime1, $datetime2);
                
                $age = $interval->format('%h');
                $bRebuildLogFiles = $age > $hoursLogIsValid;
                $aLogFilePaths = glob($localPath . "grove_group_profiles_*.log");
                if (count($aLogFilePaths) < $iExpectedLogs) {
                    $bRebuildLogFiles = true;
                }
                if ($bRebuildLogFiles) {
                    if (!empty($aLogFilePaths)) {
                        foreach ($aLogFilePaths as $aLogFilePath) {
                            unlink($aLogFilePath);
                        }
                    }
                }
            } else {
                $bRebuildLogFiles = true;
            }
            if ($bRebuildLogFiles) {
                $iPageNum = 1;
                $this->bReturnXML = true;
                do {
                    $logName = 'grove_group_profiles_' . $iPageNum . '.log';
                    $response = $this->group_profiles(['page' => $iPageNum]);
                    
                    Storage::disk('local')->put($logName, $response);
                    try {
                        $aResponse = \Dhayakawa\SpringIntoAction\Helpers\XML2Array::createArray($response);
                    } catch (Exception $e) {
                        $aResponse = [];
                    }
                    $response = isset($aResponse['ccb_api']['response']) ? $aResponse['ccb_api']['response'] : [];
                    
                    $iPageNum++;
                    $bInfiniteLoopLimit = $iPageNum > $iInfiniteLoopLimitMax;
                    $bNoMoreRecords =
                        isset($response['groups']['@attributes']['count']) ?
                            $response['groups']['@attributes']['count'] < 1 : true;
                } while (!empty($response) && !$bNoMoreRecords && !$bInfiniteLoopLimit);
                $this->bReturnXML = false;
            }
        }
        if ($bShowOutput) {
            // Allow us to send content to the browser before the script is done
            ini_set(
                "implicit_flush",
                true
            );
            // remove all existing buffers or else the implicit flush doesn't work for some reason.
            // ** Make sure you don't need these buffers... at the time I wrote this, this method is meant to run on stand alone scripts
            do {
                echo ob_get_contents();
            } while (@ob_end_clean());
            // This is the magic. Output 1019 characters to the browser so it triggers the page to load. 1019 is a value I found
            // in a forum post. There is an actual required amout of data that needs to be sent or the browser will ignore it and wait
            // for more data. I think the different browsers require different amounts of data. 1019 worked for firefox and I didn't do
            // any discovery to see what the least amount of data was required.
            print(str_repeat(" ", 1019) . "\n");
            flush();// Flush all output to browser now.
            echo "<ol>";
            print(str_repeat(" ", 1019) . "\n");
            flush();// Flush all output to browser now.
        }
        
        $iParticipantCnt = 1;
        $iPageNum = 1;
        do {
            if ($bUseLogFile) {
                $logName = 'grove_group_profiles_' . $iPageNum . '.log';
                $exists = Storage::disk('local')->exists($logName);
                if ($exists) {
                    $response = Storage::disk('local')->get($logName);
                    $aResponse = \Dhayakawa\SpringIntoAction\Helpers\XML2Array::createArray($response);
                    $response = isset($aResponse['ccb_api']['response']) ? $aResponse['ccb_api']['response'] : [];
                } else {
                    $response = [];
                }
            } else {
                $response = $this->group_profiles(['page' => $iPageNum]);
            }
            $aGroups = [];
            if (isset($response['groups']['group'])) {
                $aGroups = $response['groups']['group'];
            }
            foreach ($aGroups as $idx => $aGroup) {
                $department_id = $aGroup['department']['@attributes']['id'];
                $bImportAllowed = in_array($department_id, $aImportGroupDepartments);
                if ($bImportAllowed && ($aGroup['inactive'] == false || $aGroup['inactive'] == 'false')) {
                    $aParticipants = [];
                    $group_id = $aGroup['@attributes']['id'];
                    $group_name = $aGroup['name'];
                    if (isset($aGroup['main_leader'])) {
                        $aMainLeader = $aGroup['main_leader'];
                        $aParticipants[] = $aMainLeader;
                    }
                    $aLeaders = isset($aGroup['leaders']['leader']) ? $aGroup['leaders']['leader'] : [];
                    if (!empty($aLeaders)) {
                        if (isset($aLeaders['first_name'])) {
                            $aParticipants[] = $aLeaders;
                        } else {
                            $aParticipants = array_merge($aParticipants, $aLeaders);
                        }
                    }
                    $aGroupParticipants =
                        isset($aGroup['participants']['participant']) ? $aGroup['participants']['participant'] : [];
                    if (!empty($aGroupParticipants)) {
                        if (isset($aGroupParticipants['first_name'])) {
                            $aParticipants[] = $aGroupParticipants;
                        } else {
                            $aParticipants = array_merge($aParticipants, $aGroupParticipants);
                        }
                    }
                    // echo "$group_id :: $group_name <br>";
                    // echo '<pre>' . print_r($aParticipants, true) . '</pre>';
                    
                    foreach ($aParticipants as $aParticipant) {
                        $data = [];
                        $data['group_id'] = $group_id;
                        $data['group_name'] = $group_name;
                        $data['individual_id'] = $aParticipant['@attributes']['id'];
                        $data['first_name'] = $aParticipant['first_name'];
                        $data['last_name'] = $aParticipant['last_name'];
                        $data['email'] = $aParticipant['email'];
                        $err =
                            !isset($aParticipant['@attributes']['id']) ?
                                'missing individual_id on page ' . $iPageNum . PHP_EOL : '';
                        if ($bShowOutput) {
                            echo '<li>' . $iParticipantCnt++ . '<pre>' . $err . print_r($data, true) . '</pre>';
                        }
                        
                        if ($bSaveToDb) {
                            $lifeGroup = new LifeGroups();
                            $lifeGroup->fill($data);
                            $success = $lifeGroup->save();
                            if ($bShowOutput) {
                                if ($success) {
                                    echo "Saved $group_id :: $group_name :: {$data['individual_id']}";
                                } else {
                                    echo "Save failed $group_id :: $group_name {$data['individual_id']}";
                                }
                            }
                        }
                        if ($bShowOutput) {
                            echo '</li>';
                            print(str_repeat(" ", 1019) . "\n");
                            flush();// Flush all output to browser now.
                        }
                    }
                }
            }
            $iPageNum++;
            $bInfiniteLoopLimit = $iPageNum > $iInfiniteLoopLimitMax;
            $bNoMoreRecords = $response['groups']['@attributes']['count'] < 1;
        } while (!$bNoMoreRecords && !$bInfiniteLoopLimit);
        
        if ($bShowOutput) {
            echo "</ol>";
            print(str_repeat(" ", 1019) . "\n");
            flush();// Flush all output to browser now.
            ini_restore('implicit_flush');
        }
        
        ini_set('max_execution_time', 160);
    }
    
    /**
     * @param        $aProfile
     * @param string $type [mobile|home|work|emergency|contact]
     *
     * @return string
     */
    public function findPhoneTypeFromProfile($aProfile, $type = 'mobile', $defaultTo = 'contact')
    {
        $aPhones = isset($aProfile['phones']['phone']) ? $aProfile['phones']['phone'] : [];
        
        for ($x = 0; $x < count($aPhones); $x++) {
            if ($aPhones[$x]['@attributes']['type'] === $type) {
                return $aPhones[$x]['@value'];
            }
        }
        if ($defaultTo !== '') {
            for ($x = 0; $x < count($aPhones); $x++) {
                if ($aPhones[$x]['@attributes']['type'] === $defaultTo) {
                    return $aPhones[$x]['@value'];
                }
            }
        }
        
        return '';
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
        $func_args = \func_get_args();
        if (count($func_args) < count($aParams)) {
            $func_args =
                array_merge($func_args, array_fill(count($aParams), count($aParams) - count($func_args), null));
        }
        
        $aData = !empty($aParams) ? array_combine($aParams, $func_args) : null;
        
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
        $func_args = \func_get_args();
        if (count($func_args) < count($aParams)) {
            $func_args =
                array_merge($func_args, array_fill(count($aParams), count($aParams) - count($func_args), null));
        }
        
        $aData = !empty($aParams) ? array_combine($aParams, $func_args) : null;
        
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
    public function group_participants($id)
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
        $func_args = \func_get_args();
        if (count($func_args) < count($aParams)) {
            $func_args =
                array_merge($func_args, array_fill(count($aParams), count($aParams) - count($func_args), null));
        }
        
        $aData = !empty($aParams) ? array_combine($aParams, $func_args) : null;
        
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
        $func_args = \func_get_args();
        $args = current($func_args);
        
        return $this->getResponse('get', $srv, $args);
    }
    
    public function group_search()
    {
        $srv = 'group_search';
        $func_args = \func_get_args();
        $args = current($func_args);
        
        return $this->getResponse('get', $srv, $args);
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
        $func_args = \func_get_args();
        if (count($func_args) < count($aParams)) {
            $func_args =
                array_merge($func_args, array_fill(count($aParams), count($aParams) - count($func_args), null));
        }
        
        $aData = !empty($aParams) ? array_combine($aParams, $func_args) : null;
        
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
        $func_args = \func_get_args();
        if (count($func_args) < count($aParams)) {
            $func_args =
                array_merge($func_args, array_fill(count($aParams), count($aParams) - count($func_args), null));
        }
        
        $aData = !empty($aParams) ? array_combine($aParams, $func_args) : null;
        
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
     * id    integer
     * Optional Parameters
     * name    type
     * include_inactive    boolean
     */
    public function execute_search($id, $name = null, $include_interactive = null)
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
        $func_args = \func_get_args();
        if (count($func_args) < count($aParams)) {
            $func_args =
                array_merge($func_args, array_fill(count($aParams), count($aParams) - count($func_args), null));
        }
        
        $aData = !empty($aParams) ? array_combine($aParams, $func_args) : null;
        
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
        
        $func_args = \func_get_args();
        if (count($func_args) < count($aParams)) {
            $func_args =
                array_merge($func_args, array_fill(count($aParams), count($aParams) - count($func_args), null));
        }
        
        $aData = !empty($aParams) ? array_combine($aParams, $func_args) : null;
        
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
        $func_args = \func_get_args();
        if (count($func_args) < count($aParams)) {
            $func_args =
                array_merge($func_args, array_fill(count($aParams), count($aParams) - count($func_args), null));
        }
        
        $aData = !empty($aParams) ? array_combine($aParams, $func_args) : null;
        
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
        $func_args = \func_get_args();
        if (count($func_args) < count($aParams)) {
            $func_args =
                array_merge($func_args, array_fill(count($aParams), count($aParams) - count($func_args), null));
        }
        
        $aData = !empty($aParams) ? array_combine($aParams, $func_args) : null;
        
        return $this->getResponse('post', $srv, $aData);
    }
    
    /**
     * @param      $individual_id
     * @param null $include_inactive
     *
     * @return mixed
     * @throws \ReflectionException
     */
    public function individual_profile_from_id($individual_id, $include_inactive = null)
    {
        $srv = 'individual_profile_from_id';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $func_args = \func_get_args();
        if (count($func_args) < count($aParams)) {
            $func_args =
                array_merge($func_args, array_fill(count($aParams), count($aParams) - count($func_args), null));
        }
        
        $aData = !empty($aParams) ? array_combine($aParams, $func_args) : null;
        
        return $this->getResponse('get', $srv, $aData);
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
        $func_args = \func_get_args();
        $args = current($func_args);
        
        return $this->getResponse('get', $srv, $args);
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
        
        $func_args = \func_get_args();
        $args = current($func_args);
        
        return $this->getResponse('get', $srv, $args);
    }
    
    public function individual_groups($individual_id)
    {
        $srv = 'individual_groups';
        $aParams = array_map(
            function ($parameter) {
                return $parameter->name;
            },
            (new \ReflectionMethod(
                $this, preg_replace("/(:|\(|\))*/", "", str_replace(__CLASS__, '', __METHOD__))
            ))->getParameters()
        );
        $func_args = \func_get_args();
        if (count($func_args) < count($aParams)) {
            $func_args =
                array_merge($func_args, array_fill(count($aParams), count($aParams) - count($func_args), null));
        }
        
        $aData = !empty($aParams) ? array_combine($aParams, $func_args) : null;
        
        return $this->getResponse('post', $srv, $aData);
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
        $func_args = \func_get_args();
        if (count($func_args) < count($aParams)) {
            $func_args =
                array_merge($func_args, array_fill(count($aParams), count($aParams) - count($func_args), null));
        }
        
        $aData = !empty($aParams) ? array_combine($aParams, $func_args) : null;
        
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
        $func_args = \func_get_args();
        if (count($func_args) < count($aParams)) {
            $func_args =
                array_merge($func_args, array_fill(count($aParams), count($aParams) - count($func_args), null));
        }
        
        $aData = !empty($aParams) ? array_combine($aParams, $func_args) : null;
        
        return $this->getResponse('get', $srv, $aData);
    }
    
    public function formatSeconds($iTime, $sTimeIncrement = 'seconds')
    {
        if ($sTimeIncrement == 'seconds') {
            switch (true) {
                case $iTime < 60:
                    $sDateFormat = 's \s\e\c\o\n\d\s';
                    break;
                case $iTime >= 60 && $iTime < 3600:
                    $sDateFormat = 'i \m\i\n s \s\e\c\o\n\d\s';
                    break;
                case $iTime > 3600:
                    $sDateFormat = 'H \h\o\u\r\s i \m\i\n s \s\e\c\o\n\d\s';
                    break;
            }
        }
        
        return date($sDateFormat, $iTime);
    }
}
