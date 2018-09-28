<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 9/26/2018
 * Time: 4:03 PM
 */

namespace Dhayakawa\SpringIntoAction\OneDrive;


class SkyDrive
{

    public $accessToken = '';

    public function __construct ($accessToken) {
        $this->accessToken = $accessToken;
    }

    // Gets the contents of a SkyDrive folder.
    // Pass in the ID of the folder you want to get.
    // Or leave the second parameter blank for the root directory (/me/skydrive/files)
    // Returns an array of the contents of the folder.

    public function getFolder ($folderId, $sortBy = 'name', $sortOrder = 'ascending', $limit = '255', $offset = '0') {
        if ($folderId === null) {
            $response = $this->curlGet(OVERDRIVE_BASE_URL . "me/skydrive/files?sort_by=" . $sortBy . "&sort_order=" . $sortOrder . "&offset=" . $offset . "&limit=" . $limit . "&accessToken=" . $this->accessToken);
        } else {
            $response = $this->curlGet(OVERDRIVE_BASE_URL . $folderId . "/files?sort_by=" . $sortBy . "&sort_order=" . $sortOrder . "&offset=" . $offset . "&limit=" . $limit . "&accessToken=" . $this->accessToken);
        }
        if (@array_key_exists('error', $response)) {
            throw new \Exception($response['error'] . " - " . $response['description']);

        } else {
            $numerical = null;
            $numerical1 = null;
            $arrayToReturn = [];
            $tempArray = [];
            if (@$response['paging']['next']) {
                parse_str($response['paging']['next'], $parseOut);
                $numerical = array_values($parseOut);
            }
            if (@$response['paging']['previous']) {
                parse_str($response['paging']['previous'], $parseOut1);
                $numerical1 = array_values($parseOut1);
            }
            foreach ($response as $subArray) {
                foreach ($subArray as $item) {
                    if (@array_key_exists('id', $item)) {
                        array_push($tempArray, ['name' => $item['name'], 'id' => $item['id'], 'type' => $item['type'], 'size' => $item['size'], 'source' => @$item['source']]);
                    }
                }
            }
            $arrayToReturn['data'] = $tempArray;
            if ($numerical && @$numerical[0]) {
                if ($numerical1 && @$numerical1[0]) {
                    $arrayToReturn['paging'] = ['previousoffset' => $numerical1[0], 'nextoffset' => $numerical[0]];
                } else {
                    $arrayToReturn['paging'] = ['previousoffset' => 0, 'nextoffset' => $numerical[0]];
                }
            } else {
                $arrayToReturn['paging'] = ['previousoffset' => 0, 'nextoffset' => 0];
            }

            return $arrayToReturn;
        }
    }

    // Gets the remaining quota of your SkyDrive account.
    // Returns an array containing your total quota and quota available in bytes.

    public function getQuota () {
        $response = $this->curlGet(OVERDRIVE_BASE_URL . "me/skydrive/quota?accessToken=" . $this->accessToken);
        if (@array_key_exists('error', $response)) {
            throw new \Exception($response['error'] . " - " . $response['description']);

        } else {
            return $response;
        }
    }

    // Gets the properties of the folder.
    // Returns an array of folder properties.
    // You can pass null as $folderId to get the properties of your root SkyDrive folder.

    public function getFolderProperties ($folderId) {
        $arrayToReturn = [];
        if ($folderId === null) {
            $response = $this->curlGet(OVERDRIVE_BASE_URL . "me/skydrive?accessToken=" . $this->accessToken);
        } else {
            $response = $this->curlGet(OVERDRIVE_BASE_URL . $folderId . "?accessToken=" . $this->accessToken);
        }

        if (@array_key_exists('error', $response)) {
            throw new \Exception($response['error'] . " - " . $response['description']);

        } else {
            @$arrayToReturn = ['id' => $response['id'], 'name' => $response['name'], 'parent_id' => $response['parent_id'], 'size' => $response['size'], 'source' => $response['source'], 'created_time' => $response['created_time'], 'updated_time' => $response['updated_time'], 'link' => $response['link'], 'upload_location' => $response['upload_location'], 'is_embeddable' => $response['is_embeddable'], 'count' => $response['count']];

            return $arrayToReturn;
        }
    }

    // Gets the properties of the file.
    // Returns an array of file properties.

    public function getFileProperties ($fileId) {
        $response = $this->curlGet(OVERDRIVE_BASE_URL . $fileId . "?accessToken=" . $this->accessToken);
        if (@array_key_exists('error', $response)) {
            throw new \Exception($response['error'] . " - " . $response['description']);

        } else {
            $arrayToReturn = ['id' => $response['id'], 'type' => $response['type'], 'name' => $response['name'], 'parent_id' => $response['parent_id'], 'size' => $response['size'], 'source' => $response['source'], 'created_time' => $response['created_time'], 'updated_time' => $response['updated_time'], 'link' => $response['link'], 'upload_location' => $response['upload_location'], 'is_embeddable' => $response['is_embeddable']];

            return $arrayToReturn;
        }
    }

    // Gets a pre-signed (public) direct URL to the item
    // Pass in a file ID
    // Returns a string containing the pre-signed URL.

    public function getSourceLink ($fileId) {
        $response = $this->getFileProperties($fileId);
        if (@array_key_exists('error', $response)) {
            throw new \Exception($response['error'] . " - " . $response['description']);

        } else {
            return $response['source'];
        }
    }


    // Gets a shared read link to the item.
    // This is different to the 'link' returned from getFileProperties in that it's pre-signed.
    // It's also a link to the file inside SkyDrive's interface rather than directly to the file data.

    public function getSharedReadLink ($fileId) {
        $response = curl_get(OVERDRIVE_BASE_URL . $fileId . "/shared_read_link?accessToken=" . $this->accessToken);
        if (@array_key_exists('error', $response)) {
            throw new \Exception($response['error'] . " - " . $response['description']);

        } else {
            return $response['link'];
        }
    }

    // Gets a shared edit (read-write) link to the item.

    public function getSharedEditLink ($fileId) {
        $response = curl_get(OVERDRIVE_BASE_URL . $fileId . "/shared_edit_link?accessToken=" . $this->accessToken);
        if (@array_key_exists('error', $response)) {
            throw new \Exception($response['error'] . " - " . $response['description']);

        } else {
            return $response['link'];
        }
    }

    // Deletes an object.

    public function deleteObject ($fileId) {
        $response = curl_delete(OVERDRIVE_BASE_URL . $fileId . "?accessToken=" . $this->accessToken);
        if (@array_key_exists('error', $response)) {
            throw new \Exception($response['error'] . " - " . $response['description']);

        } else {
            return true;
        }
    }

    // Downloads a file from SkyDrive to the server.
    // Pass in a file ID.
    // Returns a multidimensional array:
    // ['properties'] contains the file metadata and ['data'] contains the raw file data.

    public function download ($fileId) {
        $props = $this->getFileProperties($fileId);
        $response = $this->curlGet(OVERDRIVE_BASE_URL . $fileId . "/content?accessToken=" . $this->accessToken, "false", "HTTP/1.1 302 Found");
        $arrayToReturn = [];
        if (@array_key_exists('error', $response)) {
            throw new \Exception($response['error'] . " - " . $response['description']);

        } else {
            array_push($arrayToReturn, ['properties' => $props, 'data' => $response]);

            return $arrayToReturn;
        }
    }


    // Uploads a file from disk.
    // Pass the $folderId of the folder you want to send the file to, and the $fileName path to the file.
    // Also use this function for modifying files, it will overwrite a currently existing file.

    public function putFile ($folderId, $fileName) {
        $r2s = OVERDRIVE_BASE_URL . $folderId . "/files/" . basename($fileName) . "?accessToken=" . $this->accessToken;
        $response = $this->curlPut($r2s, $fileName);
        if (@array_key_exists('error', $response)) {
            throw new \Exception($response['error'] . " - " . $response['description']);

        } else {
            return $response;
        }

    }

    /**
     * Upload file directly from remote URL
     *
     * @param string $sourceUrl - URL of the file
     * @param string $folderId - folder you want to send the file to
     * @param string $fileName - target filename after upload
     *
     * @return array|mixed
     * @throws \Exception
     */
    public function putFileFromUrl ($sourceUrl, $folderId, $fileName) {
        $r2s = OVERDRIVE_BASE_URL . $folderId . "/files/" . $fileName . "?accessToken=" . $this->accessToken;

        $chunkSizeBytes = 1 * 1024 * 1024; //1MB

        //download file first to tempfile
        $tempFilename = tempnam("/tmp", "UPLOAD");
        $temp = fopen($tempFilename, "w");

        $handle = @fopen($sourceUrl, "rb");
        if ($handle === false) {
            throw new \Exception("Unable to download file from " . $sourceUrl);
        }

        while (!feof($handle)) {
            $chunk = fread($handle, $chunkSizeBytes);
            fwrite($temp, $chunk);
        }

        fclose($handle);
        fclose($temp);

        //upload to OneDrive
        $response = $this->curlPut($r2s, $tempFilename);
        if (@array_key_exists('error', $response)) {
            throw new \Exception($response['error'] . " - " . $response['description']);

        } else {
            unlink($tempFilename);

            return $response;
        }
    }


    // Creates a folder.
    // Pass $folderId as the containing folder (or 'null' to create the folder under the root).
    // Also pass $folderName as the name for the new folder and $description as the description.
    // Returns the new folder metadata or throws an \Exception.

    public function createFolder ($folderId, $folderName, $description = "") {
        if ($folderId === null) {
            $r2s = OVERDRIVE_BASE_URL . "me/skydrive";
        } else {
            $r2s = OVERDRIVE_BASE_URL . $folderId;
        }
        $arrayToSend = ['name' => $folderName, 'description' => $description];
        $response = $this->curlPost($r2s, $arrayToSend, $this->accessToken);
        if (@array_key_exists('error', $response)) {
            throw new \Exception($response['error'] . " - " . $response['description']);

        } else {
            $arrayToReturn = [];
            array_push($arrayToReturn, ['name' => $response['name'], 'id' => $response['id']]);

            return $arrayToReturn;
        }
    }

    // *** PROTECTED FUNCTIONS ***

    // Internally used function to make a GET request to SkyDrive.
    // Functions can override the default JSON-decoding and return just the plain result.
    // They can also override the expected HTTP status code too.

    protected function curlGet ($uri, $jsonDecodeOutput = "true", $expectedStatusCode = "HTTP/1.1 200 OK") {
        $output = "";
        $output = @file_get_contents($uri);
        if ($http_response_header[0] == $expectedStatusCode) {
            if ($jsonDecodeOutput == "true") {
                return json_decode($output, true);
            } else {
                return $output;
            }
        } else {
            return ['error' => 'HTTP status code not expected - got ', 'description' => substr($http_response_header[0], 9, 3)];
        }
    }

    // Internally used function to make a POST request to SkyDrive.

    protected function curlPost ($uri, $inputArray, $accessToken) {
        $trimmed = json_encode($inputArray);
        $httpCode = '';
        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $uri);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Authorization: Bearer ' . $accessToken,]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $trimmed);
            $output = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        } catch (\Exception $e) {
        }
        if ($httpCode == "201") {
            return json_decode($output, true);
        } else {
            return ['error' => 'HTTP status code not expected - got ', 'description' => $httpCode];
        }
    }

    // Internally used function to make a PUT request to SkyDrive.

    protected function curlPut ($uri, $fp) {
        $output = "";
        $httpCode = '';
        try {
            $pointer = fopen($fp, 'r+');
            $stat = fstat($pointer);
            $pointerSize = $stat['size'];
            $ch = curl_init($uri);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            curl_setopt($ch, CURLOPT_PUT, true);
            curl_setopt($ch, CURLOPT_INFILE, $pointer);
            curl_setopt($ch, CURLOPT_INFILESIZE, (int)$pointerSize);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_TIMEOUT, 60);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);

            //HTTP response code 100 workaround
            //see http://www.php.net/manual/en/function.curl-setopt.php#82418
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Expect:']);

            $output = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        } catch (\Exception $e) {
        }
        if ($httpCode == "200" || $httpCode == "201") {
            return json_decode($output, true);
        } else {
            return ['error' => 'HTTP status code not expected - got ', 'description' => $httpCode];
        }

    }

    // Internally used function to make a DELETE request to SkyDrive.

    protected function curlDelete ($uri) {
        $output = "";
        $httpCode = '';
        try {
            $ch = curl_init($uri);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_TIMEOUT, 4);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
            $output = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        } catch (\Exception $e) {
        }
        if ($httpCode == "200") {
            return json_decode($output, true);
        } else {
            return ['error' => 'HTTP status code not expected - got ', 'description' => $httpCode];
        }
    }
}
