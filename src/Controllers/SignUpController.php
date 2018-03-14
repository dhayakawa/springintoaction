<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;


    use Carbon\Carbon;
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Foundation\Auth\RegistersUsers;

    class SignUpController extends BaseController {

        /**
         * Where to redirect users after registration.
         *
         * @var string
         */
        protected $redirectTo;

        /**
         * SignUpController constructor.
         */
        public function __construct() {
            $this->redirectTo = route(config('springintoaction.app.redirectTo', 'springintoaction.index'));
            $this->middleware('guest');
        }

        /**
         * Show the application dashboard.
         *
         * @return \Illuminate\Http\Response
         */
        public function index() {
            return view('springintoaction::frontend.signup');
        }

        /**
         * Get a validator for an incoming registration request.
         *
         * @param  array $data
         *
         * @return \Illuminate\Contracts\Validation\Validator
         */
        protected function validator(array $data) {
            return Validator::make($data, [
                'last_name' => 'required|max:255',
                'first_name' => 'required|max:255',
                'email' => 'required|email|max:255|unique:users,email,NULL,id,deleted_at,NULL',
                'password' => 'required|min:6|confirmed',
            ]);
        }

        /**
         * Show the sia application sign up form.
         *
         * @return \Illuminate\Http\Response
         */
        public function showSignUpForm() {
            if(!config('springintoaction.signup.allow')) {
                return view('springintoaction::frontend.signup_closed');
            }

            return view('springintoaction::frontend.signup');
        }

        /**
         * Create a new volunteer instance after a valid sign up.
         *
         * @param  array $data
         *
         * @return Volunteer
         */
        protected function create(array $data) {
            if(!config('springintoaction.signup.allow')) {
                return view('springintoaction::frontend.signup_closed');
            }

            $volunteerModel = config('signup.providers.volunteers.model');
            $signUpData     = [
                'active' => true,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'password' => bcrypt($data['password']),
                'last_login' => Carbon::now()->toDateTimeString()
            ];
            $volunteer      = $volunteerModel::withTrashed()->updateOrCreate(['email' => $data['email']], $signUpData);


            return $volunteer;
        }
    }
