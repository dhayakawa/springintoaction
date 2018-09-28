<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 9/26/2018
 * Time: 4:03 PM
 */

namespace Dhayakawa\SpringIntoAction\OneDrive;

use Dhayakawa\SpringIntoAction\OneDrive\SkyDriveAuth;
use Dompdf\Exception;

class SkyDriveTokenStore {

	// acquireToken()

	// Will attempt to grab an accessToken from the current token store.
	// If there isn't one then return false to indicate user needs sending through oAuth procedure.
	// If there is one but it's expired attempt to refresh it, save the new tokens and return an accessToken.
	// If there is one and it's valid then return an accessToken.
	public static function acquireToken() {

		$response = self::getTokensFromStore();

		if ( empty( $response['accessToken'] )) {    // No token at all, needs to go through login flow. Return false if everything fails.
			return false;

		} else {
			if ( time() > (int) $response['access_token_expires'] ) { // Token needs refreshing. Refresh it and then return the new one.
				$refreshed = SkyDriveAuth::refreshOauthToken( $response['refresh_token'] );
				if ( self::saveTokensToStore( $refreshed ) ) {
					$newtokens = self::getTokensFromStore();

					return $newtokens['accessToken'];
				}

			} else {
				return $response['accessToken']; // Token currently valid. Return it.

			}
		}
		return false;
	}

	// getTokensFromStore()
	// saveTokensToStore()
	// destroyTokensInStore()

	// These functions provide a gateway to your token store.
	// In it's basic form, the tokens are written simply to a file called "tokens" in the current working directory, JSON-encoded.
	// You can edit the location of the token store by editing the DEFINE entry on line 28.

	// If you want to implement your own token store, you can edit these functions and implement your own code, e.g. if you want to store them in a database.
	// You MUST save and retrieve tokens in such a way that calls to getTokensFromStore() will return an associative array
	// which contains the access token as 'accessToken', the refresh token as 'refresh_token' and the expiry (as a UNIX timestamp) as 'access_token_expires'

	// For more information, see the Wiki on GitHub.

	public static function getTokensFromStore() {

	    if(\file_exists(OVERDRIVE_TOKEN_STORE)){
	        $storeContents = file_get_contents(OVERDRIVE_TOKEN_STORE);
        } else {
            $storeContents ='[]';
        }
		$response = json_decode($storeContents, true );

		return $response;
	}

	public static function saveTokensToStore($tokens ) {
		$tokentosave = Array();
		$tokentosave = Array( 'accessToken'         => $tokens['accessToken'],
		                      'refresh_token'        => $tokens['refresh_token'],
		                      'access_token_expires' => ( time() + (int) $tokens['expires_in'] )
		);
		if ( file_put_contents( OVERDRIVE_TOKEN_STORE, json_encode( $tokentosave ) ) ) {
			return true;
		} else {
			return false;
		}
	}

	public static function destroyTokensInStore() {
		if ( file_put_contents( OVERDRIVE_TOKEN_STORE, "loggedout" ) ) {
			return true;
		} else {
			return false;
		}

	}
}
