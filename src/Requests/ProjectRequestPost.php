<?php

namespace Dhayakawa\SpringIntoAction\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjectRequestPost extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
        	//'g-recaptcha-response'     => 'required|captcha',
	        'project_request_password' => 'required|regex:/^woodlands$/'
        ];
    }

	/**
	 * Get custom messages for validator errors.
	 *
	 * @return array
	 */
	public function messages() {
		return [
			//'g-recaptcha-response.required' => '',
			//'g-recaptcha-response.captcha' => 'Please check the "I\'m not a robot" checkbox.',
			'project_request_password.regex' => 'Incorrect Project Request Password'
			];
	}

	/**
	 * Configure the validator instance.
	 *
	 * @param  \Illuminate\Validation\Validator $validator
	 *
	 * @return void
	 */
	public function withValidator( $validator ) {

		$validator->sometimes( 'FirstName', 'required', function ( $input ) {
			if( $input['ContactID'] == 'add_me' && empty( $input['FirstName'])){
				return true;
			}
			return false;
		});

		$validator->sometimes( 'LastName', 'required', function ( $input ) {
			if ( $input['ContactID'] == 'add_me' && empty( $input['LastName'] ) ) {
				return true;
			}

			return false;
		} );

		$validator->sometimes( 'Email', 'required', function ( $input ) {
			if ( $input['ContactID'] == 'add_me' && empty( $input['Email'] ) ) {
				return true;
			}

			return false;
		} );

		$validator->sometimes( 'Phone', 'required', function ( $input ) {
			if ( $input['ContactID'] == 'add_me' && empty( $input['Phone'] ) ) {
				return true;
			}

			return false;
		} );

		$validator->sometimes( 'Title', 'required', function ( $input ) {
			if ( $input['ContactID'] == 'add_me' && empty( $input['Title'] ) ) {
				return true;
			}

			return false;
		} );
	}
}
