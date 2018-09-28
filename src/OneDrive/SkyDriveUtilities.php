<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 9/26/2018
 * Time: 4:26 PM
 */

namespace Dhayakawa\SpringIntoAction\OneDrive;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SkyDriveUtilities
{

    public static function callback (Request $request) {
        $response = SkyDriveAuth::getOauthToken($request->input('code'));
        if (SkyDriveTokenStore::saveTokensToStore($response)) {
            $result = "success";
        } else {
            $result = "error";
        }

        return $result;
    }

    public static function authorize () {
        $bIsAuthorized = SkyDriveAuth::authorize();
        if ($bIsAuthorized) {
            $token = SkyDriveTokenStore::acquireToken();
            if ($token) {
                return $token;
            }
        }

        return false;
    }

    public static function deleteFile ($fileId = null) {
        $token = SkyDriveTokenStore::acquireToken(); // Call this function to grab a current accessToken, or false if none is available.
        if (!$token) {
            return "Error: token auth failed.";
        } else {
            $fileId = $fileId !== null ? $fileId : !empty($_POST['fileid']) ? $_POST['fileid'] : null;
            $sd = new SkyDrive($token);
            try {
                $response = $sd->deleteObject($fileId);

                return $response;
            } catch (\Exception $e) {
                return "Error: " . $e->getMessage();
            }
        }
    }

    public static function deleteFolder ($folderId = null) {
        $token = SkyDriveTokenStore::acquireToken(); // Call this function to grab a current accessToken, or false if none is available.
        if (!$token) {
            return "Error: token auth failed.";
        } else {
            $folderId = $folderId !== null ? $folderId : !empty($_POST['folderid']) ? $_POST['folderid'] : null;
            $sd = new SkyDrive($token);
            try {
                $response = $sd->deleteObject($folderId);

                return $response;
            } catch (\Exception $e) {
                return "Error: " . $e->getMessage();
            }
        }
    }

    public static function createFolder ($folderName = null, $currentFolderId = null) {
        $token = SkyDriveTokenStore::acquireToken(); // Call this function to grab a current accessToken, or false if none is available.

        if ($token) {
            $folderName = $folderName !== null ? $folderName : !empty($_POST['foldername']) ? $_POST['foldername'] : '';
            $currentFolderId = $currentFolderId !== null ? $currentFolderId : !empty($_POST['currentfolderid']) ? $_POST['currentfolderid'] : null;
            if (empty($folderName)) {
                echo 'Error - no new folder name specified';
            } else {
                $sd = new SkyDrive($token);
                try {
                    $response = $sd->createFolder($currentFolderId, $folderName, 'Description');

                    // Folder was created, return metadata.
                    return $response;
                } catch (\Exception $e) {
                    // An error occured, print HTTP status code and description.
                    return "Error: " . $e->getMessage();

                }
            }
        } else {
            return "Error: token auth failed.";
        }
    }

    public static function download ($fileId = null) {
        $token = SkyDriveTokenStore::acquireToken();

        if (!$token) {
            return "Error: token auth failed.";
        } else {
            $sd = new SkyDrive($token);
            $fileId = $fileId !== null ? $fileId : !empty($_POST['fileid']) ? $_POST['fileid'] : null;
            try {
                $response = $sd->download($fileId);
                ob_end_clean();
                header('Content-Type: application/octet-stream');
                header('Content-Length: ' . $response[0]['properties']['size']);
                header('Content-Description: File Transfer');
                header('Content-Disposition: attachment; filename=' . $response[0]['properties']['name']);
                $stdout = fopen('php://output', 'r+');
                fwrite($stdout, $response[0]['data']);
            } catch (\Exception $e) {
                // An error occured, print HTTP status code and description.
                return "Error: " . $e->getMessage();

            }
        }
    }

    public static function getLocalOneDriveUploadDirectory ($folderId = '') {
        $storagePath = Storage::disk('local')->getDriver()->getAdapter()->getPathPrefix();
        $folderId = !empty($folderId) ? "{$folderId}/" : "";

        return $storagePath . "onedrive/$folderId";
    }

    public static function upload ($folderId = null, $fileUrl = '') {
        $token = SkyDriveTokenStore::acquireToken(); // Call this function to grab a current accessToken, or false if none is available.

        if (!$token) {
            return "Error: token auth failed.";
        } else {
            $uploadPath = '';
            $newFileName = '';
            $bUploadFromFILES = true;
            $folderId = $folderId !== null ? $folderId : !empty($_POST['folderid']) ? $_POST['folderid'] : null;
            $target_dir = self::getLocalOneDriveUploadDirectory($folderId);
            $timeStamp = date("Ymd") . round(microtime(true));
            if (empty($fileUrl) && !empty($_FILES)) {
                $newFileName = $timeStamp . $_FILES["uploadfile"]["name"];
                $fileTmp = $_FILES['uploadfile']['tmp_name'];
                $uploadPath = $target_dir . $newFileName;
                move_uploaded_file($fileTmp, $uploadPath);
            } elseif (!empty($fileUrl)) {
                $bits = preg_split("~/~", $fileUrl);
                $newFileName = $timeStamp . end($bits);
                $bUploadFromFILES = false;
            }

            $sd = new skydrive($token);

            try {
                if ($bUploadFromFILES) {
                    $response = $sd->putFile($folderId, $uploadPath);
                } else {
                    $response = $sd->putFileFromUrl($fileUrl, $folderId, $newFileName);
                }

                // File was uploaded, return metadata.
                return $response;
            } catch (\Exception $e) {
                // An error occured, print HTTP status code and description.
                return "Error: " . $e->getMessage();

            }

        }
    }

    public static function showProperties ($fileId = null) {
        $token = SkyDriveTokenStore::acquireToken();
        $sResults = '';
        if (!$token) {
            return "Error: token auth failed.";
        } else {

            $sd = new skydrive($token);
            try {
                $fileId = $fileId !== null ? $fileId : !empty($_GET['fileid']) ? $_GET['fileid'] : null;
                $response = $sd->getFileProperties($fileId);
                $sResults .= "<h3>" . $response['name'] . "</h3>";
                $sResults .= "Size: " . round(($response['size'] / 1024), 2) . "Kb<br>";
                $sResults .= "Created: " . $response['created_time'] . "<br>";
                $sResults .= "Pre-Signed URL: <a href='" . $response['source'] . "'>Copy Link</a><br>";
                $sResults .= "Permalink: <a href='" . $response['link'] . "'>Copy Link</a><br><br>";
                $sResults .= "<div><img src='statics/folder-icon.png' width='32px' style='vertical-align: middle;'>&nbsp;<span style='vertical-align: middle;'><a href='index.php?folderid=" . $response['parent_id'] . "'>Back to containing folder</a></span></div>";
            } catch (\Exception $e) {
                $errc = ($e->getMessage());
                $sResults .= "Error: ";
                switch (substr($errc, -3)) {
                    case "403":
                        $sResults .= "Unauthorized";
                        break;

                    case "404":
                        $sResults .= "Not found";
                        break;

                    default:
                        $sResults .= substr($errc, -3);
                        break;
                }

            }

        }

        return $sResults;
    }

    public static function logout () {
        if (SkyDriveTokenStore::destroyTokensInStore()) {
            return true;
        } else {
            return false;
        }
    }

    public static function robot () {
        if ($_SERVER["REQUEST_METHOD"] === "POST") {
            //form submitted

            //check if other form details are correct
            //	Site key = 6LdssQsUAAAAAESMSzcr353bz6tVQAbJefbjrvF3
            //	Secret key = 6LdssQsUAAAAAGuUgBEt06cA9HwegPp3zzBEtbWx
            //verify captcha
            $recaptcha_secret = "6LdssQsUAAAAAESMSzcr353bz6tVQAbJefbjrvF3";
            $response = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=" . $recaptcha_secret . "&response=" . $_POST['g-recaptcha-response']);
            $response = json_decode($response, true);
            if ($response["success"] === true) {
                return "Logged In Successfully";
            } else {
                return "You are a robot";
            }
        }

        return true;
    }
}
