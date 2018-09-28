<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 9/26/2018
 * Time: 4:03 PM
 */

namespace Dhayakawa\SpringIntoAction\OneDrive;

use Illuminate\Support\Facades\Storage;

class SkyDriveAuth {

    public static function authorize () {
        return self::curlAuthorize();
    }
	// buildOauthUrl()

	// Builds a URL for the user to log in to SkyDrive and get the authorization code, which can then be
	// passed onto getOauthToken to get a valid oAuth token.

	public static function buildOauthUrl() {
		$response = "https://login.live.com/oauth20_authorize.srf?client_id=" . OVERDRIVE_CLIENT_ID . "&scope=wl.signin%20wl.offline_access%20wl.skydrive_update%20wl.basic&response_type=code&redirect_uri=" . urlencode( OVERDRIVE_CALLBACK_URI );

		return $response;
	}


	// getOauthToken()

	// Obtains an oAuth token
	// Pass in the authorization code parameter obtained from the inital callback.
	// Returns the oAuth token and an expiry time in seconds from now (usually 3600 but may vary in future).

	public static function getOauthToken($auth ) {
		$arraytoreturn = array();
		$output        = "";
		try {
			$ch = curl_init();
			curl_setopt( $ch, CURLOPT_URL, "https://login.live.com/oauth20_token.srf" );
			curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
			curl_setopt( $ch, CURLOPT_HTTPHEADER, array(
				'Content-Type: application/x-www-form-urlencoded',
			) );
			curl_setopt( $ch, CURLOPT_POST, true );
			curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, false );

			$data = "client_id=" . OVERDRIVE_CLIENT_ID . "&redirect_uri=" . urlencode( OVERDRIVE_CALLBACK_URI ) . "&client_secret=" . urlencode( OVERDRIVE_CLIENT_SECRET ) . "&code=" . $auth . "&grant_type=authorization_code";
			curl_setopt( $ch, CURLOPT_POSTFIELDS, $data );
			$output = curl_exec( $ch );
		} catch ( \Exception $e ) {
		}

		$out2          = json_decode( $output, true );
		$arraytoreturn = Array( 'accessToken'  => $out2['accessToken'],
		                        'refresh_token' => $out2['refresh_token'],
		                        'expires_in'    => $out2['expires_in']
		);

		return $arraytoreturn;
	}


	// refreshOauthToken()

	// Attempts to refresh an oAuth token
	// Pass in the refresh token obtained from a previous oAuth request.
	// Returns the new oAuth token and an expiry time in seconds from now (usually 3600 but may vary in future).

	public static function refreshOauthToken($refresh ) {
		$arraytoreturn = array();
		$output        = "";
		try {
			$ch = curl_init();
			curl_setopt( $ch, CURLOPT_URL, "https://login.live.com/oauth20_token.srf" );
			curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
			curl_setopt( $ch, CURLOPT_HTTPHEADER, array(
				'Content-Type: application/x-www-form-urlencoded',
			) );
			curl_setopt( $ch, CURLOPT_POST, true );
			curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, false );

			$data = "client_id=" . OVERDRIVE_CLIENT_ID . "&redirect_uri=" . urlencode( OVERDRIVE_CALLBACK_URI ) . "&client_secret=" . urlencode( OVERDRIVE_CLIENT_SECRET ) . "&refresh_token=" . $refresh . "&grant_type=refresh_token";
			curl_setopt( $ch, CURLOPT_POSTFIELDS, $data );
			$output = curl_exec( $ch );
		} catch ( \Exception $e ) {
		}

		$out2          = json_decode( $output, true );
		$arraytoreturn = Array( 'accessToken'  => $out2['accessToken'],
		                        'refresh_token' => $out2['refresh_token'],
		                        'expires_in'    => $out2['expires_in']
		);

		return $arraytoreturn;
	}

	public static function getCurlAuthorizeCookieJar(){
        $storagePath = Storage::disk('local')->getDriver()->getAdapter()->getPathPrefix();
        return $storagePath . 'onedrive_auth_cookiejar';
    }
    /**
     * Gets code if logged in, otherwise logs in and then gets token
     * @return bool
     */
    public static function curlAuthorize () {
        // // example $oAuthUrl: https://login.live.com/oauth20_authorize.srf?client_id=ec280603-df38-4535-9aa6-56633b64eeca&scope=wl.signin%20wl.offline_access%20wl.skydrive_update%20wl.basic&response_type=code&redirect_uri=https%3A%2F%2Fspringintoaction.woodlandschurch.org%2Fonedrive%2Fexample%2Fcallback.php
        $oAuthUrl = SkyDriveAuth::buildOauthUrl();
        \Illuminate\Support\Facades\Log::debug('$oAuthUrl', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__, $oAuthUrl]);
        try {
            $cookiefile = self::getCurlAuthorizeCookieJar();
            $cookiejar = self::getCurlAuthorizeCookieJar();
            $userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36 OPR/55.0.2994.61";

            $ch = curl_init();

            curl_setopt($ch, CURLOPT_COOKIEFILE, $cookiefile);
            curl_setopt($ch, CURLOPT_COOKIEJAR, $cookiejar);
            curl_setopt($ch, CURLOPT_URL, $oAuthUrl);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HEADER, true);
            $output = curl_exec($ch);

            $aCurlInfo = curl_getinfo($ch);
            curl_close($ch);
            $httpcode = $aCurlInfo['http_code'];
            \Illuminate\Support\Facades\Log::debug('response from 1st authorize request', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__, $httpcode, "<textarea>" . $output . "</textarea>"]);
            $urlPostRegex = "/urlPost:\s?'(.*?)',/";
            preg_match($urlPostRegex, $output, $matches);
            if (!empty($matches[1])) {
                $postUrl = $matches[1];
                \Illuminate\Support\Facades\Log::debug('need to login to onedrive', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__, $postUrl]);
                preg_match('/sFTTag:\s?\'<input type="hidden" name="PPFT" id="i0327" value="(.*?)"/', $output, $matchesPPFT);
                $aFormData = ['i13' => '0', 'login' => 'david.hayakawa@gmail.com', 'loginfmt' => 'david.hayakawa@gmail.com', 'type' => '11', 'LoginOptions' => '3', 'lrt' => '', 'lrtPartition' => '', 'hisRegion' => '', 'hisScaleUnit' => '', 'passwd' => 'br0wn5&br00ks', 'ps' => '2', 'psRNGCDefaultType' => '', 'psRNGCEntropy' => '', 'psRNGCSLK' => '', 'canary' => '', 'ctx' => '', 'hpgrequestid' => '', 'PPFT' => $matchesPPFT[1], 'PPSX' => 'P', 'NewUser' => '1', 'FoundMSAs' => '', 'fspost' => '0', 'i21' => '0', 'CookieDisclosure' => '0', 'IsFidoSupported' => '1', 'i2' => '1', 'i17' => '0', 'i18' => '__ConvergedLoginPaginatedString|1,__OldConvergedLogin_PCore|1,', 'i19' => '6241'];
                $ch = curl_init();
                $cookies_str = self::getCookiesStr();
                curl_setopt($ch, CURLOPT_COOKIE, $cookies_str);
                curl_setopt($ch, CURLOPT_COOKIEFILE, $cookiefile);
                curl_setopt($ch, CURLOPT_COOKIEJAR, $cookiejar);
                curl_setopt($ch, CURLOPT_URL, $postUrl);
                curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                $sPostFields = http_build_query($aFormData);

                curl_setopt($ch, CURLOPT_POSTFIELDS, $sPostFields);
                curl_setopt($ch, CURLOPT_HEADER, true);

                $output = curl_exec($ch);
                $aCurlInfo = curl_getinfo($ch);
                $httpcode = $aCurlInfo['http_code'];
                if ($errno = curl_errno($ch)) {
                    $error_message = curl_error($ch);
                    ob_start();
                    echo "httpcode:$httpcode<br>";
                    echo $err = " ({$errno}):\n {$error_message}";
                    echo "<textarea>" . $matchesPPFT[1] . "</textarea><br>";
                    echo "<textarea>" . $sPostFields . "</textarea><br>";
                    echo "<textarea>" . $output . "</textarea><br>";
                    \Illuminate\Support\Facades\Log::debug('there was a curl error', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__, \ob_get_clean()]);

                }
                curl_close($ch);

                $urlPostErrorRegex = "/sErrTxt:\s?'(.*?)',/";
                if (preg_match($urlPostErrorRegex, $output, $matchesError)) {
                    \Illuminate\Support\Facades\Log::debug('there was a curl error', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__, "<pre>" . htmlentities(print_r($matchesError, true)) . "</pre>"]);
                } else {
                    \Illuminate\Support\Facades\Log::debug('onedrive is authorized', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__]);
                    return true;
                }

            } else {
                \Illuminate\Support\Facades\Log::debug('onedrive is authorized', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__]);
                return true;
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__, $e->getMessage()]);
        }
        \Illuminate\Support\Facades\Log::debug('onedrive authorization failed', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__]);
        return false;
    }


    private static function getCookiesStr () {
        $str = "";
        $cookiejar = self::getCurlAuthorizeCookieJar();
        if (file_exists($cookiejar)) {
            $arr_cookie_data = file($cookiejar);
            foreach ($arr_cookie_data as $str_cookie_data) {
                $str_cookie_data = str_replace('#HttpOnly_', 'HttpOnly_', $str_cookie_data);
                if (!preg_match("/^(#|\s)/", $str_cookie_data)) {
                    $arr_data = preg_split("/\t/", $str_cookie_data);
                    $cookies[trim($arr_data[5])] = trim($arr_data[6]);
                    $domain = trim(str_replace('HttpOnly_', '', $arr_data[0]));
                    $path = $arr_data[2];
                    $httpOnly = preg_match('/^HttpOnly/', $arr_data[0]) ? 'HttpOnly' : '';
                    $str .= trim($arr_data[5]) . "=" . trim($arr_data[6]) . "; Domain={$domain}; Path={$path}; {$httpOnly}";
                }
            }

        }

        return $str;
    }
}
