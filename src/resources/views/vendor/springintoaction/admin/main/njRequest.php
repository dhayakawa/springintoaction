<?php

    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 3/18/2016
     * Time: 9:46 AM
     */
    require_once('lib/nj/quote/QuoteRequest.interface.php');

    class QuoteRequest implements QuoteRequestInterface {

        protected $bSetTestData = 0;
        public $bLogQuoteRequestDebug = 0;
        public $iNJQuoteRequestID = null;// nj_quote_request field
        public $sCSessionID = null;// nj_quote_request field
        public $sRequestType = __CLASS__;// nj_quote_request field
        public $iDSCustomerID = null;// nj_quote_request field
        public $sFormDataQS = null;// nj_quote_request field
        public $sCModifyTime = null;// nj_quote_request field
        public $bSubmitted = null;// nj_quote_request field

        // assoc array that defines the form fields
        public $aaQuoteRequest = array();
        public $aSectionsWithMultipleConfigurations = array('Details');
        public $sDetailsConfigurationName = '';
        public $aRequiredFields = array();
        public $aRequiredIfServiceLimitation = array();
        public $aaFormLabels = array();
        public $bLoadExisting = false;
        public $bHasMultipleLiveSessions = false;
        public $aLiveSessions = array();
        public $aMultipleSessionsFound = array();
        public $sCurrentSessionID = null;
        public $aErrors = array();
        protected $sFileUploadDirPath = 'secure/attachments/quote_requests';

        /**
         * QuoteRequest constructor.
         *
         * @param null $iNJQuoteRequestID
         * @param null $sQuoteRequestType - The class name of the quote request. example: RackWasherQuoteRequest, WashTunnelQuoteRequest
         * When creating instance for loading the page, we have to pass in the $iDSCustomerID and $sSessionID
         * because the call is from curl which doesn't have the correct session
         * @param null $iDSCustomerID
         * @param null $sSessionID
         * @param bool $bIncludeSubmitted
         * @param bool $bPopulate
         */
        public function __construct($iNJQuoteRequestID = null, $sQuoteRequestType = null, $iDSCustomerID = null, $sSessionID = null, $bIncludeSubmitted = false, $bPopulate = true,
                                    $bSetActiveData = true) {
            global $oNjRequest;
            //file_log_contents('qr', $sQuoteRequestType . ' __construct args=',func_get_args(),FILE_APPEND);
            if($iNJQuoteRequestID) {
                $this->iNJQuoteRequestID = $iNJQuoteRequestID;
            }
            if($sQuoteRequestType) {
                $this->setRequestType($sQuoteRequestType);
            }
            if($iDSCustomerID) {
                // If it's a cString
                if(strlen($iDSCustomerID) == 33) {
                    $oCustomer           = new Customer($iDSCustomerID);
                    $this->iDSCustomerID = $oCustomer->getId();
                } else {
                    $this->iDSCustomerID = $iDSCustomerID;
                }
            } else {
                // curl requests ?...
                if(Session::isLoggedIn()) {
                    //file_log_contents('qr', '$iDSCustomerID was empty and loggedIn was true', $oNjRequest->getCookie(COOKIE_CUSTOMER_ID), FILE_APPEND);
                    $oCustomer           = new Customer($oNjRequest->getCookie(COOKIE_CUSTOMER_ID));
                    $this->iDSCustomerID = $oCustomer->getId();
                }
            }

            if($sSessionID) {
                $this->sCurrentSessionID = $sSessionID;
            } else {
                $this->sCurrentSessionID = $oNjRequest->getCookie(COOKIE_SESSION);
            }

            if($this->iDSCustomerID) {
                $oSession      = Session::getInstance($this->sCurrentSessionID);
                $aLiveSessions = $oSession->getLiveSessionCount($this->iDSCustomerID, true, false);

                if(count($aLiveSessions) > 1) {
                    $this->bHasMultipleLiveSessions = true;
                    $this->aLiveSessions            = $aLiveSessions;

                    if($this->bLogQuoteRequestDebug) {
                        $sFirstLoggedIn = $this->getFirstLiveSessionLoggedIn();
                        if($_SERVER['HTTP_NJ_SKIP_HEADER_FOOTER']) {
                            file_log_contents('quote_request', '$sFirstLoggedIn=' . $sFirstLoggedIn, '$this->aLiveSessions', $this->aLiveSessions, FILE_APPEND);
                        }
                    }
                }
            }
            $this->initializeQuoteRequest($bSetActiveData, $bPopulate, $bIncludeSubmitted);
        }

        /**
         * form fields
         */
        protected function initializeQuoteRequest($bSetActiveData, $bPopulate, $bIncludeSubmitted) {
            global $oNjRequest, $oConfig;

            $this->sFileUploadDirPath = $oConfig->getValue('files') . DIRECTORY_SEPARATOR . $this->sFileUploadDirPath;

            // Only set active data or populate the object if we need to. Some calls do not want this to happen. other calls may not need this overhead
            if($bSetActiveData) {
                $this->setActiveDataIfExists($bIncludeSubmitted);
            }
            $aaFormData = array();
            if($bPopulate) {
                if(!$this->bLoadExisting) {
                    if($this->bLogQuoteRequestDebug) {
                        file_log_contents('quote_request', 'initialize with test data', FILE_APPEND);
                        if($_SERVER['HTTP_NJ_SKIP_HEADER_FOOTER']) {
                            file_log_contents('quote_request', 'initialize with test data', FILE_APPEND);
                        }
                    }
                    if($this->bSetTestData && APP_ENV != 'njadmin') {
                        $aaFormData = $this->getTestData();
                    }

                    if($this->iDSCustomerID) {
                        $this->setCustomerContactData($aaFormData);
                        if($this->bLogQuoteRequestDebug) {
                            file_log_contents('quote_request', 'setCustomerContactData', FILE_APPEND);
                            if($_SERVER['HTTP_NJ_SKIP_HEADER_FOOTER']) {
                                file_log_contents('quote_request', 'setCustomerContactData', FILE_APPEND);
                            }
                        }
                    }

                } elseif($this->bLoadExisting) {
                    if($this->bLogQuoteRequestDebug) {
                        file_log_contents('quote_request', 'initialize with db data', FILE_APPEND);
                        if($_SERVER['HTTP_NJ_SKIP_HEADER_FOOTER']) {
                            file_log_contents('quote_request', 'initialize with db data', FILE_APPEND);
                        }
                    }
                    parse_str(html_entity_decode($this->sFormDataQS), $aaFormData);
                }
                if($this->bLogQuoteRequestDebug) {
                    file_log_contents('quote_request', $aaFormData, FILE_APPEND);
                    if($_SERVER['HTTP_NJ_SKIP_HEADER_FOOTER']) {
                        file_log_contents('quote_request', $aaFormData, FILE_APPEND);
                    }
                }
            }

            $this->aaQuoteRequest['Contact']['Date']         = $aaFormData['Contact']['Date'] ? array('form_element_type' => 'hidden', 'value' => $aaFormData['Contact']['Date']) : array('form_element_type' => 'hidden', 'value' => date("m-d-Y"));
            $this->aaQuoteRequest['Contact']['Completed_By'] = $aaFormData['Contact']['Completed_By'] ? $aaFormData['Contact']['Completed_By'] : '';
            $this->aaQuoteRequest['Contact']['Firm']         = $aaFormData['Contact']['Firm'] ? $aaFormData['Contact']['Firm'] : '';
            $this->aaQuoteRequest['Contact']['Title']        = $aaFormData['Contact']['Title'] ? $aaFormData['Contact']['Title'] : '';
            $this->aaQuoteRequest['Contact']['Contact']      = $aaFormData['Contact']['Contact'] ? $aaFormData['Contact']['Contact'] : '';
            $this->aaQuoteRequest['Contact']['Address']      = $aaFormData['Contact']['Address'] ? $aaFormData['Contact']['Address'] : '';
            $this->aaQuoteRequest['Contact']['State']        = $aaFormData['Contact']['State'] ? $aaFormData['Contact']['State'] : '';
            $this->aaQuoteRequest['Contact']['City']         = $aaFormData['Contact']['City'] ? $aaFormData['Contact']['City'] : '';
            $this->aaQuoteRequest['Contact']['Zip']          = $aaFormData['Contact']['Zip'] ? $aaFormData['Contact']['Zip'] : '';
            $this->aaQuoteRequest['Contact']['Fax']          = $aaFormData['Contact']['Fax'] ? $aaFormData['Contact']['Fax'] : '';
            $this->aaQuoteRequest['Contact']['Phone']        = $aaFormData['Contact']['Phone'] ? $aaFormData['Contact']['Phone'] : '';
            $this->aaQuoteRequest['Contact']['Cell']         = $aaFormData['Contact']['Cell'] ? $aaFormData['Contact']['Cell'] : '';
            $this->aaQuoteRequest['Contact']['Email']        = $aaFormData['Contact']['Email'] ? $aaFormData['Contact']['Email'] : '';

            $this->aaQuoteRequest['Project_Location']['Project_Name']         = $aaFormData['Project_Location']['Project_Name'] ? $aaFormData['Project_Location']['Project_Name'] : '';
            $this->aaQuoteRequest['Project_Location']['Location']             = $aaFormData['Project_Location']['Location'] ? $aaFormData['Project_Location']['Location'] : '';
            $this->aaQuoteRequest['Project_Location']['Project_Contact_Info'] = $aaFormData['Project_Location']['Project_Contact_Info'] ? array('form_element_type' => 'checkbox', 'form_elements' => array('Click If the Project Contact Is Different And Needs To Be Updated'), 'value' => $aaFormData['Project_Location']['Project_Contact_Info']) : array('form_element_type' => 'checkbox', 'form_elements' => array('Click If the Project Contact Is Different And Needs To Be Updated'), 'value' => array());
            $this->aaQuoteRequest['Project_Location']['Firm']                 = $aaFormData['Project_Location']['Firm'] ? $aaFormData['Project_Location']['Firm'] : '';
            $this->aaQuoteRequest['Project_Location']['Title']                = $aaFormData['Project_Location']['Title'] ? $aaFormData['Project_Location']['Title'] : '';
            $this->aaQuoteRequest['Project_Location']['Contact']              = $aaFormData['Project_Location']['Contact'] ? $aaFormData['Project_Location']['Contact'] : '';
            $this->aaQuoteRequest['Project_Location']['Address']              = $aaFormData['Project_Location']['Address'] ? $aaFormData['Project_Location']['Address'] : '';
            $this->aaQuoteRequest['Project_Location']['City']                 = $aaFormData['Project_Location']['City'] ? $aaFormData['Project_Location']['City'] : '';
            $this->aaQuoteRequest['Project_Location']['State']                = $aaFormData['Project_Location']['State'] ? $aaFormData['Project_Location']['State'] : '';
            $this->aaQuoteRequest['Project_Location']['Zip']                  = $aaFormData['Project_Location']['Zip'] ? $aaFormData['Project_Location']['Zip'] : '';
            $this->aaQuoteRequest['Project_Location']['Fax']                  = $aaFormData['Project_Location']['Fax'] ? $aaFormData['Project_Location']['Fax'] : '';
            $this->aaQuoteRequest['Project_Location']['Cell']                 = $aaFormData['Project_Location']['Cell'] ? $aaFormData['Project_Location']['Cell'] : '';
            $this->aaQuoteRequest['Project_Location']['Phone']                = $aaFormData['Project_Location']['Phone'] ? $aaFormData['Project_Location']['Phone'] : '';
            $this->aaQuoteRequest['Project_Location']['Email']                = $aaFormData['Project_Location']['Email'] ? $aaFormData['Project_Location']['Email'] : '';

            $this->setCustomQuoteRequestFields($aaFormData);

            /**
             * DH: For reasons I can't remember at the moment, if a field is not required, just leave it out.
             * I believe defining a field as false, $this->aRequiredFields['Test']['False'] = false, sets it up
             * for scenarios where we need to dynamically require a field when a specific checkbox has been chosen.
             * Such as requiring an "Other" text field to be filled in if the user checks an "Other" checkbox from a list
             * of checkbox choices.
             */
            $this->aRequiredFields['Contact']['Date']         = true;
            $this->aRequiredFields['Contact']['Completed_By'] = true;
            $this->aRequiredFields['Contact']['Contact']      = true;
            $this->aRequiredFields['Contact']['Address']      = true;
            $this->aRequiredFields['Contact']['State']        = true;
            $this->aRequiredFields['Contact']['City']         = true;
            $this->aRequiredFields['Contact']['Zip']          = true;
            $this->aRequiredFields['Contact']['Phone']        = true;

            $this->aRequiredFields['Project_Location']['Project_Name'] = true;
            $this->aRequiredFields['Project_Location']['Location']     = true;
            // Only require if the Project "Click If the Project Contact Is Different And Needs To Be Updated" is checked
            $this->aRequiredFields['Project_Location']['Firm']    = 'Project_Location[Project_Contact_Info]';
            $this->aRequiredFields['Project_Location']['Contact'] = true;
            $this->aRequiredFields['Project_Location']['Address'] = true;
            $this->aRequiredFields['Project_Location']['City']    = true;
            $this->aRequiredFields['Project_Location']['State']   = true;
            $this->aRequiredFields['Project_Location']['Zip']     = true;
            $this->aRequiredFields['Project_Location']['Phone']   = true;

        }

        public function setCustomQuoteRequestFields($aaFormData) {

        }

        public function setCustomerContactData(& $aaFormData) {
            global $oNjRequest;
            $oCustomer                             = new Customer($this->iDSCustomerID);
            $aaFormData['Contact']['Completed_By'] = $oCustomer->getBillWholeName();
            $aaFormData['Contact']['Firm']         = $oCustomer->getBillCompany();
            $aaFormData['Contact']['Title']        = $oCustomer->getTitle();
            $aaFormData['Contact']['Contact']      = $oCustomer->getBillWholeName();
            $aaFormData['Contact']['Address']      = $oCustomer->getBillAddress1();
            $aaFormData['Contact']['State']        = $oCustomer->getBillState();
            $aaFormData['Contact']['City']         = $oCustomer->getBillCity();
            $aaFormData['Contact']['Zip']          = $oCustomer->getBillZip();
            $aaFormData['Contact']['Fax']          = $oCustomer->getFax();
            $aaFormData['Contact']['Phone']        = $oCustomer->getPhone();
            $aaFormData['Contact']['Cell']         = '';
            $aaFormData['Contact']['Email']        = $oCustomer->getEmail();

        }

        public function getFirstLiveSessionLoggedIn() {
            $sFirst      = '';
            $iOldestDate = time() + 1000;
            foreach($this->aLiveSessions as $aLiveSession) {
                if(strtotime($aLiveSession['date']) < $iOldestDate) {
                    $sFirst      = $aLiveSession['token'];
                    $iOldestDate = strtotime($aLiveSession['date']);
                }
            }

            return $sFirst;
        }

        /**
         * @param bool $bIncludeSubmitted
         *
         * @return array|null
         */
        protected function setActiveDataIfExists($bIncludeSubmitted = false) {

            $sWhere                     = '';
            $aParams                    = array();
            $oDBConfig                  = new DBConfig();
            $aaActiveQuoteRequestRecord = array();
            $oSession                   = Session::getInstance($this->sCurrentSessionID);
            $iActiveNJQuoteRequestID    = $oSession->getAttribute('iActiveNJQuoteRequestID');

            // First find out if there is an existing quote_request to autosave
            if($this->iNJQuoteRequestID != null) {
                $sWhere    .= ' id = ? ';
                $aParams[] = $this->iNJQuoteRequestID;
            } else {

                $sWhere    .= ' quote_request_type = ? AND (';
                $aParams[] = $this->sRequestType;

                if($this->iDSCustomerID) {
                    $sWhere    .= ' dsCustomerID = ? OR cSession = ?';
                    $aParams[] = $this->iDSCustomerID;
                    $aParams[] = $this->sCurrentSessionID;
                } else {
                    $sWhere    .= ' cSession = ? ';
                    $aParams[] = $this->sCurrentSessionID;
                }
                $sWhere .= ') ';
            }

            if(!$bIncludeSubmitted) {
                $sWhere .= ' AND submitted = 0 ';
            }

            // while loop below expects the most current to be first
            $sWhere .= ' ORDER BY cModifyTime DESC ';

            $sSql = "select * from nj_quote_request where {$sWhere}";
            BaseDao::prepare2($sSql, $aParams, $oDBConfig->conn);
            if($this->bLogQuoteRequestDebug) {
                file_log_contents('quote_request', $sSql, FILE_APPEND);
                if($_SERVER['HTTP_NJ_SKIP_HEADER_FOOTER']) {
                    file_log_contents('quote_request', 'HTTP_NJ_SKIP_HEADER_FOOTER is set. setActiveDataIfExists $sSql=', $sSql, FILE_APPEND);
                }
            }
            $oDBConfig->query($sSql);
            $iRecordsFound = $iOrigRecordsFound = $oDBConfig->numRows();
            if($iRecordsFound > 0) {
                $nCntr = 0;
                while($aaRow = $oDBConfig->fetchAssoc()) {
                    $aaRow['bIsActiveInAnotherSession'] = $this->checkIsActiveInAnotherSession($aaRow['id']);
                    if($this->bLogQuoteRequestDebug) {
                        file_log_contents('quote_request', "\$nCntr=" . $nCntr . ", \$aaRow['id']=" . $aaRow['id'] . ', $aaRow[\'bIsActiveInAnotherSession\']=' . $aaRow['bIsActiveInAnotherSession'] . ", \$iActiveNJQuoteRequestID=" . $iActiveNJQuoteRequestID, FILE_APPEND);
                    }
                    // If this quote request is already active do not allow it to be loaded by another session
                    $aaRow['bIsActiveNJQuoteRequestID'] = 0;
                    if(!$aaRow['bIsActiveInAnotherSession'] && (($iActiveNJQuoteRequestID && $aaRow['id'] == $iActiveNJQuoteRequestID) || (!$iActiveNJQuoteRequestID && $nCntr === 0))) {
                        // Only set bLoadExisting if we find an inactive quote request record
                        $this->bLoadExisting                = true;
                        $aaActiveQuoteRequestRecord         = $aaRow;
                        $aaRow['bIsActiveNJQuoteRequestID'] = 1;
                        $this->iNJQuoteRequestID            = $aaActiveQuoteRequestRecord['id'];
                        $this->iDSCustomerID                = $aaActiveQuoteRequestRecord['iDSCustomerID'] ? $aaActiveQuoteRequestRecord['iDSCustomerID'] : $this->iDSCustomerID;
                        $this->sFormDataQS                  = $aaActiveQuoteRequestRecord['form_data_qs'];
                        $this->sCSessionID                  = $aaActiveQuoteRequestRecord['cSession'];
                        $this->sCModifyTime                 = $aaActiveQuoteRequestRecord['cModifyTime'];
                        $this->bSubmitted                   = $aaActiveQuoteRequestRecord['submitted'];
                        $this->setActiveQuoteRequest();
                        if($this->bLogQuoteRequestDebug) {
                            file_log_contents('quote_request', "\$nCntr=" . $nCntr . ", \$aaRow['id']=" . $aaRow['id'] . ", record should be now set to the \$iActiveNJQuoteRequestID", FILE_APPEND);
                        }
                    }
                    // Only add to the aMultipleSessionsFound array if there are multiple records that can be loaded
                    if($iRecordsFound > 1) {
                        $aaRow['cModifyTime']           = "Ref #{$aaRow['id']} From: " . date("D F j, Y, g:i a e", strtotime($aaRow['cModifyTime']));
                        $this->aMultipleSessionsFound[] = $aaRow;
                    }
                    $nCntr++;

                }
                // If there is only 1 item then it means the remaining quote requests were active and not added to the array
                if(count($this->aMultipleSessionsFound) === 1) {
                    $this->aMultipleSessionsFound = array();
                }
            }
            if($this->bLogQuoteRequestDebug) {
                file_log_contents('quote_request', '$iRecordsFound=' . $iRecordsFound, FILE_APPEND);
                file_log_contents('quote_request', '$aaActiveQuoteRequestRecord=', FILE_APPEND);
                file_log_contents('quote_request', $aaActiveQuoteRequestRecord, FILE_APPEND);
                file_log_contents('quote_request', '$this->aMultipleSessionsFound=', FILE_APPEND);
                file_log_contents('quote_request', $this->aMultipleSessionsFound, FILE_APPEND);
                if($_SERVER['HTTP_NJ_SKIP_HEADER_FOOTER']) {
                    file_log_contents('quote_request', 'HTTP_NJ_SKIP_HEADER_FOOTER is set. setActiveDataIfExists()', '$iOrigRecordsFound=' . $iOrigRecordsFound, '$iRecordsFound=' . $iRecordsFound, '$aaActiveQuoteRequestRecord=', $aaActiveQuoteRequestRecord, '$this->aMultipleSessionsFound=', $this->aMultipleSessionsFound, FILE_APPEND);
                }
            }

            return $aaActiveQuoteRequestRecord;
        }

        public function autoSaveQuoteRequest($sFormDataQS) {
            global $oNjRequest;

            $sWhere            = '';
            $aParams           = array();
            $oDBConfig         = new DBConfig();
            $bAutoSaveExisting = true;
            $bSuccess          = false;

            // insert new quote request record if there isn't an existing record
            if(!$this->bLoadExisting) {
                $bAutoSaveExisting = false;
            }
            // Now either update or insert data
            $aParams           = array();
            $this->sFormDataQS = $sFormDataQS;
            if($bAutoSaveExisting) {
                $bSuccess = $this->update();
            } else {
                $bSuccess = $this->insert();
            }

            return array($this->iNJQuoteRequestID, $bSuccess);
        }

        /**
         * Stores which quote request is loaded for the users session
         */
        public function setActiveQuoteRequest($iNJQuoteRequestID = null) {
            $iNJQuoteRequestID = !$iNJQuoteRequestID ? $this->iNJQuoteRequestID : $iNJQuoteRequestID;
            $oSession          = Session::getInstance($this->sCurrentSessionID);
            $oSession->setAttribute('iActiveNJQuoteRequestID', (int)$iNJQuoteRequestID);
            //file_log_contents('setActiveQuoteRequest',$iNJQuoteRequestID,$this->sCurrentSessionID, $oSession->getToken(),$_SERVER['HTTP_USER_AGENT'], $_SERVER['HTTP_NJ_SKIP_HEADER_FOOTER'],'addSimpleStackTrace',FILE_APPEND);
        }

        /**
         * Checks to see if this quote request is already loaded in another session
         */
        public function checkIsActiveInAnotherSession($iNJQuoteRequestID) {
            $oSession                 = Session::getInstance($this->sCurrentSessionID);
            $aActiveNJQuoteRequestIDs = $oSession->getAllAttribute('iActiveNJQuoteRequestID', true, false);
            //file_log_contents('quote_request', "checkIsActiveInAnotherSession({$iNJQuoteRequestID})" , $aActiveNJQuoteRequestIDs, FILE_APPEND);
            foreach($aActiveNJQuoteRequestIDs as $aaActiveNJQuoteRequestID) {
                if($aaActiveNJQuoteRequestID['token'] != $this->sCurrentSessionID) {
                    $iActiveNJQuoteRequestID = $aaActiveNJQuoteRequestID['val'];
                    //file_log_contents('quote_request', 'foreach loop:', '$this->sCurrentSessionID=' . $this->sCurrentSessionID, '$iNJQuoteRequestID=' . $iNJQuoteRequestID, '$iActiveNJQuoteRequestID='. $iActiveNJQuoteRequestID. ' for session: ' . $aaActiveNJQuoteRequestID['token'], FILE_APPEND);
                    if($iNJQuoteRequestID == $iActiveNJQuoteRequestID) {
                        //file_log_contents('quote_request', 'foreach loop:', '$iActiveNJQuoteRequestID:'. $iActiveNJQuoteRequestID.' is active in another session.', FILE_APPEND);
                        return true;
                    }
                }
            }

            return false;
        }

        public function update($bSubmitted = 0) {
            $bSuccess  = false;
            $oDBConfig = new DBConfig();
            $aParams   = array();
            // don't allow the dsCustomerID to be removed once it's set
            $sDSCustomerSQL = $this->iDSCustomerID && $this->iDSCustomerID != 'NULL' ? '`dsCustomerID` = ?,' : '';
            $sSql           = "update nj_quote_request set `cSession` = ?,`quote_request_type` = ?, {$sDSCustomerSQL} `form_data_qs` = ?, `cModifyTime` = NOW() ,`submitted` = ? where id = {$this->iNJQuoteRequestID};";
            $aParams[]      = $this->sCurrentSessionID;
            $aParams[]      = $this->sRequestType;
            if(!empty($sDSCustomerSQL)) {
                $aParams[] = $this->iDSCustomerID;
            }

            // Make sure the form data reflects the correct iNJQuoteRequestID
            $this->sFormDataQS = preg_replace("/iNJQuoteRequestID=\D*?&/", "iNJQuoteRequestID={$this->iNJQuoteRequestID}&", $this->sFormDataQS);
            $aParams[]         = $this->sFormDataQS;
            $aParams[]         = $bSubmitted;
            BaseDao::prepare2($sSql, $aParams, $oDBConfig->conn);
            $oDBConfig->query($sSql);
            if(empty($oDBConfig->error())) {
                $bSuccess = true;
            } else {
                $this->aErrors[] = $oDBConfig->error();
            }

            return $bSuccess;
        }

        public function insert() {
            $bSuccess  = false;
            $oDBConfig = new DBConfig();
            $aParams   = array();
            $sSql      = "INSERT INTO nj_quote_request (`id`,`cSession`,`quote_request_type`,`dsCustomerID`,`form_data_qs`,`cModifyTime`,`submitted`) VALUES (NULL,?,?,?,?,NOW(),0);";
            $aParams[] = $this->sCurrentSessionID;
            $aParams[] = $this->sRequestType;
            $aParams[] = $this->iDSCustomerID ? $this->iDSCustomerID : 'NULL';
            $aParams[] = $this->sFormDataQS;
            BaseDao::prepare2($sSql, $aParams, $oDBConfig->conn);
            $oDBConfig->query($sSql);
            if(empty($oDBConfig->error())) {
                $this->iNJQuoteRequestID = $oDBConfig->lastInsertId();
                $this->setActiveQuoteRequest();
                // We need to immediately update form data to reflect the correct iNJQuoteRequestID
                $this->update();
                $bSuccess = true;
            } else {
                $this->aErrors[] = $oDBConfig->error();
            }

            return $bSuccess;
        }

        public function submitCompletedQuoteRequest() {
            global $oNjRequest;
            if($_POST && $_POST['m'] == QUOTE_REQUEST_SAVE_CMD) {
                //file_log_contents('quote_request',$_POST,FILE_APPEND);
                $this->iNJQuoteRequestID = $_POST['iNJQuoteRequestID'];
                $this->sFormDataQS       = base64_decode($_POST['form_data_qs']);
                if($this->update(1)) {
                    $aaFormData = $_POST;
                    unset($aaFormData['m']);
                    unset($aaFormData['iNJQuoteRequestID']);
                    unset($aaFormData['quote_request_type']);
                    unset($aaFormData['form_data_qs']);
                    unset($aaFormData['g-recaptcha-response']);
                    unset($aaFormData['recaptcha_challenge_field']);
                    unset($aaFormData['recaptcha_response_field']);
                    unset($aaFormData['wp_pg_id']);
                    $this->sendEmail($aaFormData);
                    $oSession = Session::getInstance($this->sCurrentSessionID);
                    $oSession->removeAttribute('iActiveNJQuoteRequestID');
                }
            }
        }

        public function sendEmail($aaFormData) {
            global $oConfig;
            $aFiles             = $this->getEmailAttachments();
            $sToEmail           = $oConfig->getValue('salesToEmail');
            $sSenderEmail       = ucwords($oConfig->getValue('merchantDomain')) . " Website <" . $oConfig->getValue('merchantFromEmail') . ">";
            $sEmailBody         = $this->getEmailBody($aaFormData);
            $sQuoteRequestLabel = $this->getRequestTypeLabel();
            $sSubject           = "$sQuoteRequestLabel: " . date("Y-m-d g:i a");
            $sHeaders           = "From: {$sSenderEmail}\r\n";
            $sHeaders           .= "Reply-To: {$sSenderEmail}\r\n";
            $sHeaders           .= "MIME-Version: 1.0\r\n";
            $sHeaders           .= "Content-Type: text/html; charset=ISO-8859-1\r\n";

            // Send to NJ
            $sNJMsg      = "This {$sQuoteRequestLabel} was just submitted on the website:<br><br>";
            $bNJMailSent = $this->sendMultiAttachEmail($sToEmail, $aFiles, $sSenderEmail, $sSubject, $sNJMsg . $sEmailBody);
            if($bNJMailSent !== false) {
                // Send a copy to the customer
                $sSubject     = "Nelson-Jameson $sQuoteRequestLabel: " . date("Y-m-d g:i a");
                $sCustomerMsg = "Thank you for your inquiry. We will get back to you as soon as possible. We have included a copy of your request for your records.<br><br>Nelson-Jameson";
                $mail_sent    = @mail($aaFormData['Contact']['Email'], $sSubject, $sCustomerMsg . $sEmailBody, $sHeaders);
            }

            return $bNJMailSent;
        }

        public function getFileUploadDirPath() {
            return $this->sFileUploadDirPath;
        }

        public function getEmailAttachments() {
            global $oConfig;
            $aReturnFiles = array();
            // First try and get files with start with the iNJQuoteRequestID since they are more accurate and not session dependant
            $sGlobSearch = "{$this->sFileUploadDirPath}/*{$this->iNJQuoteRequestID}@@*";
            $aFiles      = glob($sGlobSearch);
            // If the first search doesn't find anything, look for session based files
            if(empty($aFiles)) {
                $sGlobSearch = "{$this->sFileUploadDirPath}/*@@{$this->sCurrentSessionID}*";
                $aFiles      = glob($sGlobSearch);
            }
            //file_log_contents('quote_request',$sGlobSearch,FILE_APPEND);
            //file_log_contents('quote_request',$aFiles,FILE_APPEND);
            if($aFiles) {
                // Need to check each file and make sure it is one of the files that was in the final submission
                foreach($aFiles as $sFile) {
                    // sets value by reference
                    $this->parseFileUploadName($sFile, $iNJQuoteRequestID, $sSessionID, $sFormFieldNameWithTokens, $sFileName);
                    // Tilde separates the aaQuoteRequest associative array keys
                    // files~ is just a marker to help find file input values
                    $sFormFieldNameWithTokens = preg_replace('/^files/', '', $sFormFieldNameWithTokens);
                    // replace the tokens with associative array syntax
                    $sFormFieldNameKeys = preg_replace('/~/', "']['", $sFormFieldNameWithTokens);
                    $sFormFieldNameKeys = preg_replace('/^\'\]/', "", $sFormFieldNameKeys);
                    $sFormFieldNameKeys = preg_replace('/\[\'$/', "", $sFormFieldNameKeys);
                    // build the array as a string and then eval it
                    $sQuoteRequestFormField = '$this->aaQuoteRequest' . $sFormFieldNameKeys . "['value']";
                    // assign the string we just created to $sSubmittedQuoteRequestFormFieldValue
                    @eval('$sSubmittedQuoteRequestFormFieldValue = ' . $sQuoteRequestFormField . ';');
                    //file_log_contents('quote_request','$sSubmittedQuoteRequestFormFieldValue=' . $sSubmittedQuoteRequestFormFieldValue,FILE_APPEND);
                    // If the file names match attach it to the email
                    if(isset($sSubmittedQuoteRequestFormFieldValue) && $sSubmittedQuoteRequestFormFieldValue == $sFileName) {
                        $aReturnFiles[] = $sFile;
                    }
                }
            }

            return $aReturnFiles;
        }

        public function parseFileUploadName($sFile, & $iNJQuoteRequestID = null, &  $sSessionID = null, &  $sFormFieldNameWithTokens = null, & $sFileName = null) {
            // @@ separates iNJQuoteRequestID,sCurrentSessionID,aaQuoteRequest associative array keys, the original file name
            $aFileBits      = preg_split('/@@/', basename($sFile));
            $iFileBitsCount = count($aFileBits);
            if($iFileBitsCount == 4) {
                $iNJQuoteRequestID        = $aFileBits[0];
                $sSessionID               = $aFileBits[1];
                $sFormFieldNameWithTokens = $aFileBits[2];
                $sFileName                = $aFileBits[3];
            } elseif($iFileBitsCount == 3) {
                $iNJQuoteRequestID        = null;
                $sSessionID               = $aFileBits[0];
                $sFormFieldNameWithTokens = $aFileBits[1];
                $sFileName                = $aFileBits[2];
            }
        }

        /**
         * @param $sFilename - actual file name
         * @param $sFormFieldName -
         *
         * @return string
         */
        public function createFileUploadName($sFilename, $sFormFieldName) {
            return "{$this->iNJQuoteRequestID}@@{$this->sCurrentSessionID}@@{$sFormFieldName}@@{$sFilename}";
        }

        public function getEmailBody($aaFormData) {
            $sTable = "<table style='border-spacing:0;border-collapse:collapse;'>\n";

            foreach($aaFormData as $sKey => $aaSubFormData) {
                $sFieldName = $this->formatLabel($sKey);
                $sTable     .= "\t<tr><td style='line-height: 2.125rem;font-weight:bold;font-size:1.687rem;border-bottom:1px solid black;padding-top:32px;'>{$sFieldName}</td></tr>\n";
                $sTable     .= "\t<tr><td style='background:white;padding:0;border:1px solid black;border-top:0'>";
                $sTable     .= $this->buildEmailHTMLTable($aaSubFormData);
                $sTable     .= "</td></tr>\n";
            }

            $sTable .= '</table>';

            return $sTable;
        }

        /**
         * To send an email with attachments.
         */
        function sendMultiAttachEmail($sTo, $aFiles, $sSenderEmail, $sSubject, $sMessage) {
            // email fields: to, from, subject, and so on
            $sFrom    = $sSenderEmail;
            $sHeaders = "From: $sFrom";

            // boundary
            $sSemiRand     = md5(time());
            $sMimeBoundary = "==Multipart_Boundary_x{$sSemiRand}x";

            // headers for attachment
            $sHeaders .= "\nMIME-Version: 1.0\n" . "Content-Type: multipart/mixed;\n" . " boundary=\"{$sMimeBoundary}\"";

            // multipart boundary
            $sMessage = "--{$sMimeBoundary}\n" . "Content-Type: text/html; charset=\"iso-8859-1\"\n" .
                "Content-Transfer-Encoding: 7bit\n\n" . $sMessage . "\n\n";

            // preparing attachments
            for($i = 0; $i < count($aFiles); $i++) {
                $sFilePath = $aFiles[$i];
                if(is_file($sFilePath)) {
                    $sMessage  .= "--{$sMimeBoundary}\n";
                    $iFileSize = filesize($sFilePath);
                    $fp        = @fopen($sFilePath, "rb");
                    $sData     = @fread($fp, $iFileSize);
                    @fclose($fp);
                    $sData = chunk_split(base64_encode($sData));
                    // sets value by reference
                    $this->parseFileUploadName($sFilePath, $iNJQuoteRequestID, $sSessionID, $sFormFieldNameWithTokens, $sFileName);
                    // create a file name that allows the sales rep to easy identify and reference it with a customers quote & the field it references
                    $sFormFieldNameWithTokens = str_replace('~', '.', $sFormFieldNameWithTokens);
                    $sFormFieldNameWithTokens = preg_replace('/^files/', $this->sRequestType . '.' . $this->aaQuoteRequest['Contact']['Email'], $sFormFieldNameWithTokens);
                    $sName                    = $sFormFieldNameWithTokens . $sFileName;
                    $sFileMessage             = "Content-Type: application/octet-stream; name=\"" . $sName . "\"\n" .
                        "Content-Description: " . $sName . "\n" .
                        "Content-Disposition: attachment;\n" . " filename=\"" . $sName . "\"; size=" . $iFileSize . ";\n" .
                        "Content-Transfer-Encoding: base64\n\n" . $sData . "\n\n";

                    $sMessage .= $sFileMessage;
                }
            }
            $sMessage .= "--{$sMimeBoundary}--";
            // Setting this on gouda causes the emails to fail, not setting causes it to fail on Kodo
            $sReturnPath = APP_ENV == 'njadmin' ? null : "-f" . $sSenderEmail;
            $bSuccess    = mail($sTo, $sSubject, $sMessage, $sHeaders, $sReturnPath);
            if($bSuccess) {
                return true;
            } else {
                file_log_contents('quote_request_error.txt', "Email Failed", $sTo, $sSubject, $sMessage, $sHeaders, $sReturnPath, FILE_APPEND);

                return false;
            }
        }

        /**
         * @return string
         * Just a helper function I used while building the HTML table for the email body
         */
        function getRandomColor() {
            return '#' . str_pad(dechex(mt_rand(0, 0xFFFFFF)), 6, '0', STR_PAD_LEFT);
        }

        /**
         * @param $colour : #full6hex value
         * @param $per : 1-100 positive gets brighter, negative value gets darker
         *
         * @return string
         * Help create a lighter bg color on the fly
         */
        function colorBrightness($colour, $per) {
            $sOriginalHex = $colour;
            $colour       = substr($colour, 1); // Removes first character of hex string (#)
            $rgb          = ''; // Empty variable
            $per          = $per / 100 * 255; // Creates a percentage to work with. Change the middle figure to control colour temperature

            if($per < 0) // Check to see if the percentage is a negative number
            {
                // DARKER
                $per = abs($per); // Turns Neg Number to Pos Number
                for($x = 0; $x < 3; $x++) {
                    $c   = hexdec(substr($colour, (2 * $x), 2)) - $per;
                    $c   = ($c < 0) ? 0 : dechex($c);
                    $rgb .= (strlen($c) < 2) ? '0' . $c : $c;
                }
            } else {
                // LIGHTER
                for($x = 0; $x < 3; $x++) {
                    $c   = hexdec(substr($colour, (2 * $x), 2)) + $per;
                    $c   = ($c > 255) ? 'ff' : dechex($c);
                    $rgb .= (strlen($c) < 2) ? '0' . $c : $c;
                }
            }
            $sNexHex = '#' . $rgb;

            return $sNexHex;
        }

        /**
         * @param $array The $_POST data
         * @param bool $recursive
         * @param int $iLevel
         * @param string $null
         * @param null $sLastBgColor
         *
         * @return bool|string
         *
         * Recursively builds a HTML table of the form data for the email body
         */
        function buildEmailHTMLTable($array, $recursive = true, $iLevel = 0, $null = '&nbsp;', $sLastBgColor = null) {
            // Sanity check
            if(empty($array) || !is_array($array)) {
                return false;
            }

            if(!isset($array[0]) || !is_array($array[0])) {
                $array = array($array);
            }

            // CSS for the table
            $sOddRowBbColor = '#ffffff';
            $sTDPadding     = '0.5625rem 0.625rem';
            // To allow for even more control over the spacing in the table every cell has its data wrapped in a span
            $sTDSpanPadding = '0.5625rem 0.625rem';
            $sTableStyle    = "width:100%;margin:0;border-spacing:0;border-collapse:collapse;";
            $sTDFontStyles  = "color:#222;line-height:1.125rem;font-size:0.875rem;";

            // Start the table
            $sTable = "<table style='{$sTableStyle}'>\n";

            // To calculate odd/even rows
            $iRowCnt = 0;
            foreach($array as $row) {
                // Total Children of outer td cell
                $iTotalRows = count($row);
                foreach($row as $key => $cell) {
                    // Cast objects
                    if(is_object($cell)) {
                        $cell = (array)$cell;
                    }
                    // Non-associative array keys and the Units key create ugly space so lets remove them
                    $bSkipFieldCell = is_numeric($key) || $key == 'Units';
                    $bRecursDeeper  = $recursive === true && is_array($cell) && !empty($cell);
                    // Total Children of inner td cell
                    $iTotalCellRows = $bRecursDeeper ? count($cell) : 0;
                    // Set if even or odd row
                    $bEvenRow = $iRowCnt % 2 == 0;
                    // If we remove the "left" Field Name Cell force the Field Value Cell to be wider
                    $iFieldValueCellWidth = $bSkipFieldCell ? 100 : 90;
                    $sFieldName           = $this->formatLabel($key);

                    // Define the alternating bgcolors for each level
                    if($iLevel === 0) {
                        $sBgColor = '#FFEDBC';//'#e9cf8d';
                    } elseif($iLevel === 1) {
                        $sBgColor = '#DEDEDE';//'#839496;';
                    } elseif($iLevel === 2) {
                        $sBgColor = '#d2f2aa;';
                    } elseif($iLevel === 3) {
                        $sBgColor = '#d2f2aa;';
                    } else {
                        // Just in case the data changes and goes deeper than expected.
                        $sBgColor = $this->getRandomColor();
                    }

                    // There are instances when it looks better if the nested child data has the same bg color as its parent
                    if(!empty($sLastBgColor) && ($bSkipFieldCell || (($iLevel === 1 || $iLevel === 2) && $iTotalCellRows <= 1))) {
                        $sBgColor = $sLastBgColor;
                        // Forcing the padding to zero almost has the same affect as assigning the background color but I don't
                        // trust that every email clients will display the padding the way I expect them to.
                        $sTDPadding = '0';
                    }

                    // Set the bg color of the table row
                    if(!$bEvenRow) {
                        $sLighterBgColor = $this->colorBrightness($sBgColor, 10);
                        $sBgColor        = $iLevel === 0 ? $sOddRowBbColor : $sLighterBgColor;

                    }

                    $sCSSBackgroundColor = "background:{$sBgColor};";

                    // Begin the row
                    $sTable .= "\t<tr style='{$sCSSBackgroundColor}'>";

                    // Field Name Cell
                    $sTable .= $bSkipFieldCell ? "" : "<td style='padding:$sTDPadding;{$sTDFontStyles}font-weight:bold;white-space:nowrap'><span style='display: inline-block;padding:{$sTDSpanPadding}'>{$sFieldName}</span></td>";

                    // Field Value Cell
                    $sTable .= "<td style='padding:{$sTDPadding};{$sTDFontStyles}width:{$iFieldValueCellWidth}%'>";
                    // To help figure out the format of the nested levels of data uncomment the next 2 lines
                    //$sDebugStr = "sLastBgColor:$sLastBgColor,iTotalRows:$iTotalRows,iTotalCellRows:$iTotalCellRows,lev:$iLevel,recurs:" . (int)$bRecursDeeper;
                    //$sTable .= $sDebugStr;

                    if($bRecursDeeper) {
                        // By not passing in a bgcolor we are forcing the nested data to use a new alternating bg color
                        if(($iLevel === 0 || $iLevel === 1) && $iTotalCellRows > 1) {
                            $sBgColor = null;
                        }
                        $sTable .= "\n" . $this->buildEmailHTMLTable($cell, true, $iLevel + 1, true, $sBgColor) . "\n";
                    } else {
                        // Field Value Cell content
                        $sTable .= "<span style='display: inline-block;padding:{$sTDSpanPadding}'>";

                        $sTable .= (strlen($cell) > 0) ?
                            htmlspecialchars((string)$this->formatLabel(stripslashes($cell), true), null, null, false) :
                            $null;
                        $sTable .= "</span>";
                    }

                    // Close the Field Value Cell
                    $sTable .= '</td>';
                    // Close the row
                    $sTable .= "</tr>\n";
                    $iRowCnt++;
                }
            }

            $sTable .= '</table>';

            return $sTable;
        }

        public function getErrors($sGlue = ',') {
            return join($sGlue, $this->aErrors);
        }

        public function getTestData() {

            $aaTestData = array();
            if($this->bSetTestData) {
                $aaTestData['Contact']['Date']         = date("m-d-Y");
                $aaTestData['Contact']['Completed_By'] = 'David Hayakawa';
                $aaTestData['Contact']['Firm']         = 'N-J';
                $aaTestData['Contact']['Title']        = 'Developer';
                $aaTestData['Contact']['Contact']      = 'David';
                $aaTestData['Contact']['Address']      = '2400 E 5th St.';
                $aaTestData['Contact']['State']        = 'WI';
                $aaTestData['Contact']['City']         = 'Marshfield';
                $aaTestData['Contact']['Zip']          = '54449';
                $aaTestData['Contact']['Fax']          = '800-826-8302';
                $aaTestData['Contact']['Phone']        = '800-826-8302';
                $aaTestData['Contact']['Cell']         = '800-826-8302';
                $aaTestData['Contact']['Email']        = 'njunittest+selenium@gmail.com';

                $aaTestData['Project_Location']['Project_Name'] = 'Test';
                $aaTestData['Project_Location']['Location']     = 'Marshfield';
                $aaTestData['Project_Location']['Firm']         = 'N-J';
                $aaTestData['Project_Location']['Title']        = 'Developer';
                $aaTestData['Project_Location']['Contact']      = 'David';
                $aaTestData['Project_Location']['Address']      = '2400 E 5th St.';
                $aaTestData['Project_Location']['State']        = 'WI';
                $aaTestData['Project_Location']['City']         = 'Marshfield';
                $aaTestData['Project_Location']['Zip']          = '54449';
                $aaTestData['Project_Location']['Fax']          = '800-826-8302';
                $aaTestData['Project_Location']['Phone']        = '800-826-8302';
                $aaTestData['Project_Location']['Cell']         = '800-826-8302';
                $aaTestData['Project_Location']['Email']        = 'njunittest+selenium@gmail.com';
            }

            return $aaTestData;
        }

        public function setRequestType($sRequestType) {
            $this->sRequestType = $sRequestType;
        }

        public function getQuoteRequestForm() {
            global $oNjLang, $oConfig, $oSettings, $oIntegration, $aaView;
            $iNJQuoteRequestID      = $this->iNJQuoteRequestID ? $this->iNJQuoteRequestID : '';
            $sHere                  = $_SERVER['PHP_SELF'];
            $aFormSections          = $this->getFormSections();
            $iFormSectionCount      = count($aFormSections);
            $sRequestType           = $this->getRequestTypeLabel();
            $iFormSectionReadyCount = 0;
            ob_start();
            ?>
            <div class="small-12 columns" id="pageContent">
                <script type="text/javascript">var aQRFormSelects = [];</script>
                <!-- Cookies to keep track of section clicks -->
                <script type="text/javascript" src="<?php echo $oConfig->getValue('secureURL'); ?>/design/js/js.cookie.js"></script>
                <!-- The Iframe Transport is required for browsers without support for XHR file uploads -->
                <script type="text/javascript" src="<?php echo $oConfig->getValue('secureURL'); ?>/design/js/jquery-file-upload/js/jquery.iframe-transport.js"></script>
                <!-- The basic File Upload plugin -->
                <script type="text/javascript" src="<?php echo $oConfig->getValue('secureURL'); ?>/design/js/jquery-file-upload/js/jquery.fileupload.js?r=<?php echo rand(); ?>"></script>
                <script id="quote_request_js_include" type="text/javascript">
                    <?php echo $this->getMultipleSessionsJavaScript();?>
                </script>
                <script type="text/javascript" src="<?php echo $oConfig->getValue('secureURL'); ?>/design/js/quote_request.js?r=<?php echo rand(); ?>"></script>
                <span class="section508ContentTarget"><a name="content">&nbsp;</a></span>
                <?php if(!isset($_SERVER['HTTP_NJ_SKIP_HEADER_FOOTER'])) { ?>
                    <h1 class="main_header"><?php echo $aaView['title'] ?></h1>
                <?php } ?>
                <?php if(is_array($aaView['errors']) && 0 < count($aaView['errors'])) { ?>
                    <div class="row">
                        <div class="small-12 columns">
                            <div class="alert-box alert radius">
                                <ol>
                                    <?php foreach($aaView['errors'] as $sError) { ?>
                                        <li class="myerror">* <?php echo $sError; ?></li>
                                    <?php } ?>
                                </ol>
                            </div>
                        </div>
                    </div>
                <?php } ?>
                <div class="row">
                    <div class="small-12 columns">
                        <div id="quoteRequestMessageArea" style="display:none" class="alert-box text-center radius"></div>
                    </div>
                    <div class="small-12 columns">
                        <ul id="quoteRequestProgressButtonGroup" class="stack-for-small button-group radius toggle" data-toggle="buttons-radio">
                            <?php
                                $nCnt = 0;
                                foreach($aFormSections as $sSectionLabel) {
                                    ?>
                                    <li>
                                        <input type="radio" id="r<?php echo ++$nCnt; ?>" name="r-group" data-section="<?php echo $sSectionLabel; ?>" data-toggle="button">
                                        <label class="button" for="r<?php echo $nCnt; ?>"><?php echo $nCnt . ". " . $this->formatLabel($sSectionLabel); ?> <i
                                                    class="fi-check quoteRequestSectionHideIcon"></i></label>
                                    </li>
                                <?php } ?>
                        </ul>
                        <div id="quoteRequestProgressBar" class="progress">
                            <?php
                                $iProgressPercent = round(($iFormSectionReadyCount / $iFormSectionCount) * 100);

                            ?>
                            <span class="meter" style="width:<?php echo $iProgressPercent; ?>%">
                              <p class="percent"><?php echo $iProgressPercent; ?>%</p>
                        </span>
                        </div>
                        <table class="quoteRequestProgressBarHelp">
                            <tr>
                                <td width="50%" valign="top">
                                    <ul>
                                        <li>Click the buttons above to review each step and complete any required fields.</li>
                                        <li>Blue buttons are steps that need review.</li>
                                        <li>Green buttons are steps that are finished.</li>
                                    </ul>
                                </td>
                                <td valign="top">
                                    <ul>
                                        <li>Your form will be periodically saved for this session. If you login, it will be permanently saved.</li>
                                        <li>Please keep track of the Ref # for your next login.</li>
                                    </ul>
                                </td>
                            </tr>
                        </table>

                    </div>
                </div>
                <form data-abide name='quote_request' id='quote_request' enctype="multipart/form-data" action="<?php echo $oConfig->getValue('merchantURL'); ?>/cart.php" method='POST'>
                    <input type="hidden" value="<?php echo QUOTE_REQUEST_AUTOSAVE_CMD; ?>" name="m"/>
                    <input type="hidden" value="<?php echo $iNJQuoteRequestID; ?>" name="iNJQuoteRequestID"/>
                    <input type="hidden" value="<?php echo $this->sRequestType; ?>" name="quote_request_type"/>
                    <input type="hidden" value="" name="wp_pg_id"/>
                    <input type="hidden" name="form_data_qs" value=""/>
                    <?php if($bShowDebugBtn && APP_ENV != 'njadmin') {
                        echo "<button style='position:absolute;top:-170px;right:0;' id='toggleAutoSave'>Shut Off AutoSave</button>";
                    } ?>
                    <h3 class="reference_number"><?php echo $iNJQuoteRequestID ? "Ref #{$iNJQuoteRequestID}" : ""; ?></h3>
                    <?php
                        //echo "<pre>".print_r($aFormSections,1)."</pre>";
                        $nCnt = 0;
                        foreach($aFormSections as $sSectionLabel) {
                            $sLegendNote  = "";
                            $bAllRequired = isset($this->aRequiredFields[$sSectionLabel]) && !is_array($this->aRequiredFields[$sSectionLabel]);
                            if($sSectionLabel == 'Services') {
                                $sLegendNote = "&nbsp;&nbsp;::&nbsp;&nbsp;Please note: <span style=\"color: orange\">*</span> indicate required if services are limited.";
                            }
                            $sCSSClosedClass         = $nCnt > 0 ? 'closedFieldSet' : '';
                            $bMultipleConfigurations = in_array($sSectionLabel, $this->aSectionsWithMultipleConfigurations);
                            ?>
                            <fieldset data-section="<?php echo $sSectionLabel; ?>" class="<?php echo $sCSSClosedClass; ?>">
                                <legend><h2><?php echo $this->formatLabel($sSectionLabel); ?><?php echo "<span style='font-size:52%;text-transform:none'>{$sLegendNote}</span>"; ?></h2></legend>
                                <?php if($bMultipleConfigurations) {
                                    $sConfigType = str_replace(' Details', '', $this->aaFormLabels['Details']);
                                    ?>
                                    <dl class="tabs quoteRequestDetailTabs" data-tab role="tablist" data-sconfigtype="<?php echo $sConfigType; ?>">
                                        <?php
                                            $aConfigurations = array_keys($this->aaQuoteRequest[$sSectionLabel]);
                                            $iConfigCnt      = 1;
                                            foreach($aConfigurations as $sConfiguration) {
                                                $sPanelID    = $sConfiguration;
                                                $sActive     = $iConfigCnt === 1 ? 'defaultActive active' : '';
                                                $sDeleteIcon = $iConfigCnt > 1 ? '<i data-click="" class="fi-x removeDetailsTab"></i>' : '';
                                                ?>
                                                <dd class="tab-title <?php echo $sActive ?>"><a class="tab"
                                                                                                href="#<?php echo $sPanelID; ?>"><?php echo "$sConfigType $iConfigCnt"; ?></a><?php echo $sDeleteIcon; ?>
                                                </dd>
                                                <?php
                                                $iConfigCnt++;
                                            } ?>
                                        <dd class="tabAdd"><a href="#tabAdd<?php echo $sConfigType; ?>"><i class="fi-plus"></i> Add another <?php echo $sConfigType; ?></a></dd>
                                    </dl>
                                    <div class="tabs-content">
                                        <?php
                                            $iConfigCnt = 1;
                                            foreach($aConfigurations as $sConfiguration) {

                                                $sPanelID = $sConfiguration;
                                                $sActive  = $iConfigCnt === 1 ? 'active' : '';
                                                ?>
                                                <section role="tabpanel" aria-hidden="false" class="content <?php echo $sActive ?>" id="<?php echo $sPanelID; ?>">
                                                    <?php
                                                        foreach($this->aaQuoteRequest[$sSectionLabel][$sConfiguration] as $sFormElementName => $formElementData) {
                                                            echo $this->getInputHTML($sSectionLabel, $sFormElementName, $formElementData, $bAllRequired, $sPanelID);
                                                        }
                                                    ?>
                                                </section>
                                                <?php
                                                $iConfigCnt++;
                                            }
                                        ?>
                                    </div>
                                    <?php
                                } else {
                                    if($sSectionLabel == 'Services') {
                                        echo $this->getInputHTML($sSectionLabel, null, $this->aaQuoteRequest[$sSectionLabel], $bAllRequired);
                                    } else {
                                        foreach($this->aaQuoteRequest[$sSectionLabel] as $sFormElementName => $formElementData) {
                                            echo $this->getInputHTML($sSectionLabel, $sFormElementName, $formElementData, $bAllRequired);
                                        }
                                    }
                                }
                                    if($nCnt < count($aFormSections) - 1) {
                                        ?>
                                        <div class="row">
                                            <div class="small-12 medium-offset-3 medium-5 end columns">
                                                <button data-nextsection="<?php echo $aFormSections[$nCnt + 1]; ?>" class="button small secondary quoteRequestNextStepBtn">Next
                                                    Step: <?php echo $this->formatLabel($aFormSections[$nCnt + 1]); ?> <i class="fi-arrow-right"></i></button>
                                            </div>
                                        </div>
                                    <?php } ?>
                            </fieldset>
                            <?php
                            $nCnt++;
                        }
                        if(isset($oSettings) && isset($oIntegration) && $oSettings->getBoolSetting(RECAPTCHA_CONTACT_US)) { ?>
                            <div class="row">
                                <div class="small-12 medium-7 medium-offset-3 end columns">
                                    <?php print $oIntegration->getHtml(); ?>
                                </div>
                            </div>
                        <?php } ?>
                    <div class="row">
                        <div class="small-12 medium-6 medium-offset-3 end columns">
                            <div id="quoteRequestSubmissionErrorAlert" style="display:none;" class="alert-box alert radius">
                                Missing Required Fields. Click the the Red Buttons above to find the problem and fix it.
                            </div>
                            <input class="disabled button success" type="submit" value="  Submit  "/>
                        </div>
                    </div>
            </div>
            </form>
            </div>

            <?php

            $sHTMLForm = ob_get_clean();

            return $sHTMLForm;
        }

        // ['Services']['Heating']['Plant_Steam']['Units']['psi']
        public function formatFormElementName($sElementType, $sSectionLabel, $aNameKeys, & $sFormElementLabel, & $sFormElementName, & $sFormElementID) {

            $sFormElementLabel = $this->formatLabel($sFormElementName);

            //file_log_contents('quote_request','*****'.$sSectionLabel.':'. $sFormElementName,FILE_APPEND);
            if(is_array($sSectionLabel)) {
                $aSectionLabel = $sSectionLabel;

                $sKeySearch = "['" . join("']['", $aSectionLabel) . "']";
                $sName      = $aSectionLabel[0];
                array_shift($aSectionLabel);

                $sName .= '[' . join('][', $aSectionLabel) . ']';
            } else {
                $sKeySearch = "['{$sSectionLabel}']";
                $sName      = $sSectionLabel;
            }

            //file_log_contents('quote_request',$sKeySearch,FILE_APPEND);
            @eval('$aaTree = $this->aaQuoteRequest' . $sKeySearch . ';');
            //file_log_contents('quote_request',$aaTree,FILE_APPEND);
            $aNameKeys        = $aNameKeys ? $aNameKeys : $this->buildKeys($aaTree, $sFormElementName, 0);
            $sName            .= '[' . join('][', $aNameKeys) . ']';
            $sFormElementName = $sName;
            $sFormElementID   = $this->formatElementID($sName);
        }

        public function buildKeys($aaQuoteRequest, $sFormElementName, $iLevel) {

            $aKeys = array();
            foreach($aaQuoteRequest as $key => $value) {

                if(is_array($value)) {
                    if($key == $sFormElementName) {
                        $aKeys[] = $key;

                        //file_log_contents('quote_request','line: ' . __LINE__ . ' found on level:'.$iLevel,FILE_APPEND);
                        return $aKeys;
                    } elseif(!is_numeric($key) && key($value) != 'form_element_type' && key($value) != 'form_elements' && !in_array($sFormElementName, $aKeys)) {
                        $aKeys[] = $key;
                        //file_log_contents('quote_request',$iLevel . ' before call. added key:'. $key . ' aKeys:' . print_r($aKeys, 1),FILE_APPEND);
                        $iPreviousLevel = $iLevel;
                        $aLastKeys      = $this->buildKeys($value, $sFormElementName, $iLevel + 1);
                        //file_log_contents('quote_request',$iLevel . ' after call lastKeys: ' . print_r($aLastKeys, 1),FILE_APPEND);
                        if(empty($aLastKeys) && !in_array($sFormElementName, $aKeys)) {
                            array_pop($aKeys);
                        }
                        $aKeys = array_merge($aKeys, $aLastKeys);
                        //file_log_contents('quote_request',$iLevel . ' after call merged aKeys,$aLastKeys:' . print_r($aKeys, 1),FILE_APPEND);

                    }

                } elseif($key == $sFormElementName) {
                    $aKeys[] = $key;

                    //file_log_contents('quote_request','line: ' .__LINE__ .' found on '. $iLevel,FILE_APPEND);
                    return $aKeys;
                }
            }

            return $aKeys;
        }

        public function getInputHTML($sSectionLabel, $sFormElementName, $formElementData, $bAllRequired, $sConfigTabID = '') {
            //file_log_contents('qr',func_get_args(),FILE_APPEND);
            $sFormElementType = 'input';
            if(is_array($formElementData)) {
                if($sSectionLabel == 'Services') {
                    $sFormElementType = 'Services';
                } elseif(isset($formElementData['form_element_type'])) {
                    $sFormElementType = $formElementData['form_element_type'];
                } else {
                    $sFormElementType = 'list_of_inputs';
                }
            }

            $sValue            = is_string($formElementData) ? $formElementData : str_replace('"', "'", (json_encode($formElementData)));
            $sRequiredAsterisk = '';
            $sAbide            = '';
            if($bAllRequired) {
                $sRequiredAsterisk = '<span style="color: red">*</span>';
                $sAbide            = " required ";
            } else {
                if(isset($this->aRequiredFields[$sSectionLabel][$sFormElementName])) {
                    if($this->aRequiredFields[$sSectionLabel][$sFormElementName] === true) {
                        $sRequiredAsterisk = '<span style="color: red">*</span>';
                        $sAbide            = " required";
                    } else {
                        $sRequiredAsterisk = '<span class="req-by-other-element" style="color: red"></span>';
                        $sAbide            = " data-otherelement=\"{$this->aRequiredFields[$sSectionLabel][$sFormElementName]}\" data-abide-validator=\"requireIfOtherElementIsChosen\"";
                    }
                }
            }
            if(!empty($sAbide) && ($sFormElementType == 'radio' || $sFormElementType == 'checkbox')) {
                $sAbide = $sFormElementType == 'radio' ? " required data-abide-validator=\"requireRadio\" " : " data-abide-validator=\"requireCheckbox\" ";
            }
            if(!empty($sConfigTabID)) {
                $sSectionLabel = is_string($sConfigTabID) ? array($sSectionLabel, $sConfigTabID) : array($sSectionLabel) + $sConfigTabID;
            }

            ob_start();
            switch($sFormElementType) {
                case 'select':
                    $formElementData['value'] = str_replace("-", "", $formElementData['value']);
                    ?>
                    <div class="row">
                        <div class="small-12 medium-3 columns">
                            <label class="right"><?php echo $sRequiredAsterisk;
                                    echo $this->formatLabel($sFormElementName); ?>:</label>
                        </div>
                        <div class="small-12 medium-5 end columns">
                            <?php $this->formatFormElementName('select', $sSectionLabel, null, $sFormElementLabel, $sFormElementName, $sFormElementID); ?>
                            <select name="<?php echo $sFormElementName; ?>" id="<?php echo $sFormElementID; ?>" <?php echo $sAbide; ?>>
                                <?php
                                    //echo print_r($formElementData, 1);
                                    // @$sJSOptions- Need to define the options for this select in aQRFormSelects so we can rebuild it using JS
                                    $sJSOptions               = '';
                                    $sOriginalFormElementName = $sFormElementName;
                                    foreach($formElementData['form_elements'] as $sOptionValue => $sOptionLabel) {
                                        $sOptionValue = is_numeric($sOptionValue) ? str_replace('-', '', $sOptionLabel) : $sOptionValue;
                                        $sSelected    = $sOptionValue == $formElementData['value'] ? 'selected="selected"' : '';
                                        ?>
                                        <option <?php echo $sSelected; ?> value="<?php echo $sOptionValue; ?>"><?php echo $this->formatLabel($sOptionLabel); ?></option>
                                        <?php
                                        $sJSOptions       .= "{display:'" . $this->formatLabel(addcslashes($sOptionLabel, "'")) . "',value:'{$sOptionValue}'},";
                                        $sFormElementName = $sOriginalFormElementName;
                                    }
                                ?>
                            </select>
                            <small class="error">Required</small>
                            <script type="text/javascript">
                                aQRFormSelects.push('<?php echo $sFormElementID;?>');
                                aQRFormSelects['<?php echo $sFormElementID;?>'] = [<?php echo rtrim($sJSOptions, ',');?>];
                            </script>
                        </div>
                    </div>
                    <?php
                    break;
                case 'select-hierarchical':
                    // The options in this select are modified when a different select changes. It's a parent/child relationship
                    // The $formElementData['parent']/$sParentSelector defines the parent select that triggers this child select to update it's options
                    // dashes throw a fatal JS error when defining a variable name for the parent value
                    $formElementData['value'] = str_replace('-', '', $formElementData['value']);
                    ?>
                    <div class="row">
                        <div class="small-12 medium-3 columns">
                            <label class="right"><?php echo $sRequiredAsterisk;
                                    echo $this->formatLabel($sFormElementName); ?>:</label>
                        </div>
                        <div class="small-12 medium-5 end columns">
                            <?php
                                $this->formatFormElementName('select', $sSectionLabel, null, $sFormElementLabel, $sFormElementName, $sFormElementID);
                                //echo print_r($formElementData, 1);
                                // the select that triggers this select to change it's options
                                $sParentSelector = $formElementData['parent'];
                                $sEval           = "\$aParentSelector = \$this->aaQuoteRequest{$sParentSelector};";
                                @eval($sEval);
                                $sParentSelectorID = str_replace("'", '', $this->formatElementID($sParentSelector));
                            ?>
                            <select data-select-hierarchical-parent="<?php echo $sParentSelectorID; ?>" name="<?php echo $sFormElementName; ?>"
                                    id="<?php echo $sFormElementID; ?>" <?php echo $sAbide; ?>>
                                <?php
                                    $sOriginalFormElementName = $sFormElementName;
                                    if(!empty($formElementData['form_elements'][$aParentSelector['value']])) {
                                        foreach($formElementData['form_elements'][$aParentSelector['value']] as $sOptionLabel) {
                                            $sOptionValue = str_replace('-', '', $sOptionLabel);
                                            $sSelected    = $sOptionValue == $formElementData['value'] ? 'selected="selected"' : '';
                                            ?>
                                            <option <?php echo $sSelected; ?> value="<?php echo $sOptionValue; ?>"><?php echo $this->formatLabel($sOptionLabel); ?></option>
                                            <?php
                                            $sFormElementName = $sOriginalFormElementName;
                                        }
                                    } else {
                                        ?>
                                        <option selected="selected" value="None">None</option>
                                        <?php
                                    }
                                ?>
                            </select>
                            <small class="error">Required</small>
                        </div>
                        <script type="text/javascript">
                            $(function () {
                                <?php
                                $aSwitchCases = array();
                                $sSwitchCases = '';
                                // We create a function name specifically for this hierarchical select in case there are other hierarchical selects in the form
                                $sBuildFunctionName = "build{$sFormElementID}";
                                foreach($formElementData['form_elements'] as $sParentSelectorValue => $aOptionLabels) {
                                $sParentSelectorValue = $sParentSelectorID . '_' . str_replace('-', '', $sParentSelectorValue);

                                $aSwitchCases[] = "case '{$sParentSelectorValue}':
                                            {$sBuildFunctionName}({$sParentSelectorValue});
                                            break;";
                                $aLabelData = array();
                                foreach($aOptionLabels as $sLabel) {
                                    $aLabelData[] = "{display: \"{$sLabel}\",value: \"{$sLabel}\"}";
                                }
                                $sSelectorOptions = join(',', $aLabelData);
                                $sSwitchCases = join("\n", $aSwitchCases);
                                ?>
                                var <?php echo $sParentSelectorValue;?> =
                                [<?php echo $sSelectorOptions;?>];
                                <?php } ?>
                                $('select#<?php echo $sParentSelectorID;?>').change(function () {
                                    var <?php echo $sFormElementID;?> =
                                    this.id + '_' + $(this).val();
                                    switch (<?php echo $sFormElementID;?>) {
                                    <?php echo $sSwitchCases;?>

                                        default:
                                            $('select#<?php echo $sFormElementID;?>').find('option').remove().end().append("<option selected=\"selected\" value=\"None\">None</option>");
                                            break;
                                    }
                                });
                            });

                            function <?php echo $sBuildFunctionName;?>(array_list) {
                                var $oSelect = $('select#<?php echo $sFormElementID;?>');
                                $oSelect.find('option').remove();
                                if (array_list.length == 0) {
                                    $oSelect.append("<option selected=\"selected\" value=\"None\">None</option>");
                                } else {
                                    $(array_list).each(function (i) {
                                        $oSelect.append("<option value=\"" + array_list[i].value + "\">" + array_list[i].display + "</option>");
                                    });
                                }
                            }
                        </script>
                    </div>
                    <?php
                    break;
                case 'radio':
                    ?>
                    <div class="row">
                        <div class="small-12 medium-3 columns">
                            <label class="right"><?php echo $sRequiredAsterisk;
                                    echo $this->formatLabel($sFormElementName); ?>:</label>
                        </div>
                        <div class="small-12 medium-5 end columns">
                            <?php
                                //echo print_r($formElementData, 1);
                                $sOriginalFormElementName = $sFormElementName;
                                foreach($formElementData['form_elements'] as $sRadioLabel) {
                                    $this->formatFormElementName('radio', $sSectionLabel, null, $sFormElementLabel, $sFormElementName, $sFormElementID);
                                    $sFormElementID .= $sRadioLabel;
                                    $sChecked       = in_array($sRadioLabel, $formElementData['value']) ? 'checked="checked"' : '';
                                    ?>
                                    <input type="radio" <?php echo $sChecked; ?> value="<?php echo $sRadioLabel; ?>" name="<?php echo $sFormElementName; ?>[]"
                                           id="<?php echo $sFormElementID; ?>" <?php echo $sAbide; ?> />
                                    <label for="<?php echo $sFormElementID; ?>" class=""><?php echo $this->formatLabel($sRadioLabel); ?></label>
                                    <?php
                                    $sFormElementName = $sOriginalFormElementName;
                                }
                            ?>
                            <small class="error">Required</small>
                        </div>
                    </div>
                    <?php
                    break;
                case 'checkbox':
                    ?>
                    <div class="row">
                        <div class="small-12 medium-3 columns">
                            <label class="right"><?php echo $sRequiredAsterisk;
                                    echo $this->formatLabel($sFormElementName); ?>:</label>
                        </div>
                        <div class="small-12 medium-9 columns">
                            <?php
                                //echo print_r($formElementData, 1);
                                $sOriginalFormElementName = $sFormElementName;
                                foreach($formElementData['form_elements'] as $sCheckBoxLabel) {
                                    $this->formatFormElementName('checkbox', $sSectionLabel, null, $sFormElementLabel, $sFormElementName, $sFormElementID);
                                    $sFormElementID .= $sCheckBoxLabel;
                                    $sChecked       = !empty($sCheckBoxLabel) && in_array($sCheckBoxLabel, $formElementData['value']) ? 'checked="checked"' : '';
                                    ?>
                                    <label style="margin-right:0.5rem;padding-top:0px" for="<?php echo $sFormElementID; ?>" class="left inline">
                                        <input style="margin-bottom:0" <?php echo $sChecked; ?> type="checkbox" value="<?php echo $sCheckBoxLabel; ?>" name="<?php echo $sFormElementName; ?>[]"
                                               id="<?php echo $sFormElementID; ?>" <?php echo $sAbide; ?> /> <?php echo $this->formatLabel($sCheckBoxLabel); ?>
                                    </label>
                                    <?php
                                    $sFormElementName = $sOriginalFormElementName;
                                }
                            ?>
                            <small style="float:left;clear:both" class="error">At least one checkbox is required</small>
                        </div>
                    </div>
                    <?php
                    break;
                case 'file':
                    ?>
                    <div class="row">
                        <?php
                            $sValue = $formElementData['value'];
                            $this->formatFormElementName('input', $sSectionLabel, null, $sFormElementLabel, $sFormElementName, $sFormElementID);
                        ?>
                        <div class="small-12 medium-3 columns">
                            <label for="<?php echo $sFormElementID; ?>" class="right inline"><?php echo $sRequiredAsterisk;
                                    echo $sFormElementLabel; ?>:</label>
                        </div>
                        <div class="small-12 medium-8 end columns">
                            <div class="left button small file-upload">
                                <input class="file-input" type="file" value="" name="files~<?php echo preg_replace("/~{2,}/", "~", preg_replace("/(\[|\])/", '~', $sFormElementName)); ?>"
                                       id="<?php echo $sFormElementID; ?>" multiple/>
                                <i class="fi-plus"></i> Choose File
                            </div>

                            <input type="hidden" value="<?php echo $sValue; ?>" name="<?php echo $sFormElementName; ?>" id="file_<?php echo $sFormElementID; ?>" <?php echo $sAbide; ?> />
                            <span id="file_chosen_<?php echo $sFormElementID; ?>" class="left file_chosen"><?php echo $sValue; ?></span>
                            <div id="file_progress_<?php echo $sFormElementID; ?>" class="file_progress progress">
                                <span class="meter" style="width:0%;">
                                    <p class="percent">&nbsp;</p>
                                </span>
                            </div>
                            <small class="error">Required</small>
                        </div>
                    </div>
                    <?php
                    break;
                case 'list_of_inputs':
                    ?>
                    <div class="row">
                        <div class="small-12 medium-3 columns">
                            <label class="right inline"><strong><?php echo $this->formatLabel($sFormElementName); ?></strong></label>
                        </div>
                        <div class="small-12 medium-5 end columns"></div>
                    </div>
                    <?php

                    foreach($formElementData as $sFormElementName => $sValue) {
                        ?>
                        <?php
                        $this->formatFormElementName('input', $sSectionLabel, null, $sFormElementLabel, $sFormElementName, $sFormElementID);
                        ?>
                        <div class="row">
                            <div class="small-12 medium-3 columns">
                                <label for="<?php echo $sFormElementID; ?>" class="right inline"><?php echo $sRequiredAsterisk;
                                        echo $sFormElementLabel; ?>:</label>
                            </div>
                            <div class="small-12 medium-5 end columns">
                                <input type="text" maxlength="50" size="30" value="<?php echo htmlspecialchars(stripslashes($sValue)); ?>" name="<?php echo $sFormElementName; ?>"
                                       id="<?php echo $sFormElementID; ?>" <?php echo $sAbide; ?> />
                                <small class="error">Required</small>
                            </div>
                        </div>
                        <?php
                        $sFormElementName = $sOriginalFormElementName;
                    }
                    break;
                case 'Services':
                    //text-orientation:upright
                    $aServiceGroups = array_keys($this->aaQuoteRequest[$sSectionLabel]);

                    foreach($aServiceGroups as $sServiceGroupLabel) {
                        ?>
                        <div style="margin-bottom:1rem;" class="row QuoteRequestServices">
                            <div class="small-12 columns">
                                <h3 style="border-bottom:1px solid black;"><?php echo $this->formatLabel($sServiceGroupLabel); ?></h3>
                            </div>

                            <div class="small-12 columns">
                                <div style="margin-top:1rem;margin-bottom:1rem" class="row ServiceColumnHeadings">
                                    <div class="small-3 columns"><strong>Utility</strong></div>
                                    <div class="small-1 columns"><strong>Value</strong></div>
                                    <div class="small-8 columns"><strong style="padding-left:1rem">Units</strong></div>
                                </div>
                                <?php
                                    $aServiceGroupElements = array_keys($this->aaQuoteRequest[$sSectionLabel][$sServiceGroupLabel]);
                                    //echo print_r($aServiceGroupElements,1);
                                    $nCnt                = 0;
                                    $iTotalGroupElements = count($aServiceGroupElements);
                                    foreach($aServiceGroupElements as $sServiceGroupElementLabel) {
                                        $sAlt = $nCnt % 2 == 0 && $iTotalGroupElements > 1 ? 'background-color:rgba(237, 239, 245, 0.47)' : '';
                                        $nCnt++;
                                        ?>
                                        <div style="padding-top:1rem; <?php echo $sAlt; ?>" class="row">
                                            <div class="small-12 medium-3 columns">
                                                <label for="<?php echo $sServiceGroupElementLabel; ?>" class="left inline"><?php echo $this->formatLabel($sServiceGroupElementLabel); ?>:</label>
                                            </div>
                                            <div class="small-12 medium-5 end columns">
                                                <?php
                                                    //echo print_r($this->aaQuoteRequest[$sSectionLabel][$sServiceGroupLabel][$sServiceGroupElementLabel], 1);
                                                    foreach($this->aaQuoteRequest[$sSectionLabel][$sServiceGroupLabel][$sServiceGroupElementLabel]['Units'] as $sUnitName => $sUnitValue) {
                                                        //echo "[$sSectionLabel][$sServiceGroupLabel][$sServiceGroupElementLabel]['Units'][$sUnitLabel]";
                                                        $sRequiredAsterisk = isset($this->aRequiredIfServiceLimitation[$sSectionLabel][$sServiceGroupLabel][$sServiceGroupElementLabel]['Units'][$sUnitLabel]) ? '<span style="color: orange; position:absolute; display:inline-block;left:-1rem;">*</span>' : '';
                                                        //$sUnitName         = "{$sSectionLabel}[{$sServiceGroupLabel}][{$sServiceGroupElementLabel}][{$sUnitLabel}]";
                                                        //$sUnitID           = $this->formatElementID($sUnitName);
                                                        $this->formatFormElementName('input', $sSectionLabel, array($sServiceGroupLabel, $sServiceGroupElementLabel, 'Units', $sUnitName), $sUnitLabel, $sUnitName, $sUnitID);
                                                        ?>
                                                        <div class="row">
                                                            <div class="small-12 medium-3 columns"><?php echo $sRequiredAsterisk; ?>
                                                                <input type="text" maxlength="50" size="30" value="<?php echo htmlspecialchars(stripslashes($sUnitValue)); ?>"
                                                                       name="<?php echo $sUnitName; ?>"
                                                                       id="<?php echo $sUnitID; ?>"/>
                                                            </div>
                                                            <div class="small-12 medium-6 end columns">
                                                                <label for="<?php echo $sUnitID; ?>" class="left inline"><?php echo $this->formatLabel($sUnitLabel); ?></label>
                                                            </div>
                                                        </div>
                                                    <?php } ?>
                                            </div>
                                        </div>
                                        <?php
                                    }
                                ?>
                            </div>
                        </div>
                        <?php
                    }
                    break;
                case 'textarea':

                    ?>
                    <div class="row">
                        <?php
                            $this->formatFormElementName('input', $sSectionLabel, null, $sFormElementLabel, $sFormElementName, $sFormElementID);
                        ?>
                        <div class="small-12 medium-3 columns">
                            <label for="<?php echo $sFormElementID; ?>" class="right inline"><?php echo $sRequiredAsterisk;
                                    echo $sFormElementLabel; ?>:</label>
                        </div>
                        <div class="small-12 medium-5 end columns">
                            <textarea rows="5" name="<?php echo $sFormElementName; ?>"
                                      id="<?php echo $sFormElementID; ?>" <?php echo $sAbide; ?> ><?php echo htmlspecialchars(stripslashes($formElementData['value'])); ?></textarea>
                            <small class="error">Required</small>
                        </div>
                    </div>
                    <?php
                    break;
                case 'hidden':
                    $this->formatFormElementName('input', $sSectionLabel, null, $sFormElementLabel, $sFormElementName, $sFormElementID);
                    ?>
                    <input type="hidden" value="<?php echo htmlspecialchars(stripslashes($formElementData['value'])); ?>" name="<?php echo $sFormElementName; ?>"
                           id="<?php echo $sFormElementID; ?>"/>
                    <?php
                    break;
                case 'part-number-builder':
                    ?>
                    <div class="row">
                        <?php
                            $this->formatFormElementName('input', $sSectionLabel, null, $sFormElementLabel, $sFormElementName, $sFormElementID);
                        ?>
                        <div class="small-12 medium-3 columns">
                            <label for="<?php echo $sFormElementID; ?>" class="right inline"><?php echo $sRequiredAsterisk;
                                    echo $sFormElementLabel; ?>:</label>
                        </div>
                        <div class="partNumberBuilder <?php echo $formElementData['part']; ?> small-12 medium-5 end columns">
                            <?php echo $formElementData['parts']; ?>
                        </div>
                        <input type="hidden" id="<?php echo $sFormElementID; ?>" name="<?php echo $sFormElementName; ?>" value=""/>
                        <script type="text/javascript">$(function () {
                                initPartNumberBuilder('<?php echo $formElementData['part']; ?>');
                            });</script>
                    </div>
                    <?php
                    break;
                case 'div':
                    $this->formatFormElementName('input', $sSectionLabel, null, $sFormElementLabel, $sFormElementName, $sFormElementID);
                    ?>
                    <div class="row <?php echo $sSectionLabelCSSClass; ?>">
                        <div class="quoteRequestNote <?php echo $sFormElementID; ?> small-12 medium-offset-3 medium-8 columns">
                            <?php echo $formElementData['value']; ?>
                        </div>
                    </div>
                    <?php
                    break;
                case 'input':
                default:
                    $sSectionLabelCSSClass = '';
                    if($sSectionLabel == 'Project_Location' && !in_array($sFormElementName, array('Project_Name', 'Location', 'Project_Contact_Info'))) {
                        $sSectionLabelCSSClass = 'project_contact_info';
                    }
                    ?>
                    <div class="row <?php echo $sSectionLabelCSSClass; ?>">
                        <?php
                            $this->formatFormElementName('input', $sSectionLabel, null, $sFormElementLabel, $sFormElementName, $sFormElementID);
                        ?>
                        <div class="small-12 medium-3 columns">
                            <label for="<?php echo $sFormElementID; ?>" class="right inline"><?php echo $sRequiredAsterisk;
                                    echo $sFormElementLabel; ?>:</label>
                        </div>
                        <div class="small-12 medium-5 end columns">
                            <input type="text" maxlength="50" size="30" value="<?php echo htmlspecialchars(stripslashes($sValue)); ?>" name="<?php echo $sFormElementName; ?>"
                                   id="<?php echo $sFormElementID; ?>" <?php echo $sAbide; ?> />
                            <small class="error">Required</small>
                        </div>
                    </div>
                    <?php
                    break;

            }

            return ob_get_clean();
        }

        public function getMultipleSessionsJavaScript() {
            if(!empty($this->aMultipleSessionsFound)) {
                return "var aMultipleSessionsFound = " . json_encode($this->aMultipleSessionsFound) . ";\n";
            }
        }

        /**
         * @param $sLabel
         * @param bool $bFindValue - set to true to try and find a "friendly version" for checkbox/radio/select values.
         *
         * @return mixed
         */
        public function formatLabel($sLabel, $bFindValue = false) {
            global $oNJUtil;
            if(isset($this->aaFormLabels[$sLabel])) {
                $sLabel = $this->aaFormLabels[$sLabel];
            } else {
                $aHumanReadableValue = '';
                if($bFindValue) {
                    $aHumanReadableValue = $oNJUtil->arrayValueRecursive($sLabel, $this->aaQuoteRequest);
                }
                if(!empty($aHumanReadableValue)) {
                    $sLabel = $aHumanReadableValue[0];
                } else {
                    $sLabel = str_replace('_', ' ', $sLabel);
                }
            }

            return $sLabel;
        }

        public function formatElementID($sID) {
            return preg_replace("/(\[|\])/", '', $sID);
        }

        public function getRequestTypeLabel() {
            return 'Quote Request';
        }

        // Returns an array of the top level keys of the aaQuoteRequest array
        public function getFormSections() {
            $aFormSections = array_keys($this->aaQuoteRequest);

            return $aFormSections;
        }
    }
