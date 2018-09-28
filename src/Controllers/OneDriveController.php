<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 9/27/2018
 * Time: 9:00 AM
 */

namespace Dhayakawa\SpringIntoAction\Controllers;

use Illuminate\Support\Facades\Storage;
use Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
use Dhayakawa\SpringIntoAction\Models\ProjectAttachment;
use Dhayakawa\SpringIntoAction\Models\Project;
use Illuminate\Http\Request;
use Dhayakawa\SpringIntoAction\OneDrive\SkyDrive;
use Dhayakawa\SpringIntoAction\OneDrive\SkyDriveTokenStore;
use Dhayakawa\SpringIntoAction\OneDrive\SkyDriveAuth;
use Dhayakawa\SpringIntoAction\OneDrive\SkyDriveUtilities;

class OneDriveController extends BaseController
{

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index (Request $request) {
        // for logout
        if ($request->input('logout')) {
            if (SkyDriveTokenStore::destroyTokensInStore()) {
                //header("Location: index.php");
            } else {
                //echo "Error";
            }
            //header("Location: index.php");
            //echo '<script>window.location.href = "index.php";</script>';
            //exit();
        }

        $token = SkyDriveTokenStore::acquireToken(); // Call this function to grab a current access_token, or false if none is available.

        // echo $token;
        if (!$token) { // If no token, prompt to login. Call skydrive_auth::build_oauth_url() to get the redirect URL.
            $error = 'Error: token auth failed.';
            $token = SkyDriveUtilities::authorize();
            \Illuminate\Support\Facades\Log::debug('$token', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__, $token]);
        }
        if ($token) {
            $sd2 = new SkyDrive($token);
            $quotaResp = $sd2->getQuota();
            $quotaRemaining = round((((int)$quotaResp['available'] / 1024) / 1024));


            // First, time to create a new OneDrive object.

            $sd = new SkyDrive($token);

            // Time to prepare and make the request to get the list of files.
            $folderId = $request->input('folderid');
            $offset = $request->input('offset');
            if (empty($folderId)) {

                if (empty($offset)) {
                    $response = $sd->getFolder(null, 'name', 'ascending', 10);    // Gets the first 10 items of the root folder.
                } else {
                    $response = $sd->getFolder(null, 'name', 'ascending', 10, $offset);    // Gets the next 10 items of the root folder from the specified offset.
                }

                $properties = $sd->getFolderProperties(null);

            } else {

                if (empty($offset)) {
                    $response = $sd->getFolder($folderId, 'name', 'ascending', 10); // Gets the first 10 items of the specified folder.
                } else {
                    $response = $sd->getFolder($folderId, 'name', 'ascending', 10, $offset); // Gets the next 10 items of the specified folder from the specified offset.
                }

                $properties = $sd->getFolderProperties($folderId);
            }
            $bladeData = compact(['error', 'quotaRemaining', 'folderId', 'properties', 'response']);


        } else {
            $quotaRemaining = 0;
            $folderId = 0;
            $properties = [];
            $response = [];
            $bladeData = compact(['error', 'quotaRemaining', 'folderId', 'properties', 'response']);
        }

        return view('springintoaction::admin.main.onedrive', $request, compact('bladeData'));
    }

    public function callback (Request $request) {
        \Illuminate\Support\Facades\Log::debug('callback code', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__,$request->input('code')]);
        $response = SkyDriveUtilities::callback($request);
    }
}
