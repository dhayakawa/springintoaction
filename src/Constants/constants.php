<?php

$currentDirectory = realpath(dirname(__FILE__));

// can't use the Config Facade in a config
$oneDriveConfig = require_once(realpath($currentDirectory . '/../../config/springintoaction/onedrive.php'));
define("OVERDRIVE_CLIENT_ID", $oneDriveConfig[str_replace('/home/', '', $_SERVER['HOME'])]['client_id']);
define("OVERDRIVE_CLIENT_SECRET", $oneDriveConfig[str_replace('/home/', '', $_SERVER['HOME'])]['client_secret']);
define("OVERDRIVE_CALLBACK_URI", $oneDriveConfig[str_replace('/home/', '', $_SERVER['HOME'])]['callback_uri']);
define("OVERDRIVE_BASE_URL", "https://apis.live.net/v5.0/");
$storagePath = realpath($currentDirectory . '/../../storage/app/');
define("OVERDRIVE_TOKEN_STORE", $storagePath . "/" . $oneDriveConfig[str_replace('/home/', '', $_SERVER['HOME'])]['token_store']);

