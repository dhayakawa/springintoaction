<?php

namespace Dhayakawa\SpringIntoAction\Controllers\Auth;

use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends BaseController
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;
    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->redirectTo = route(config('springintoaction.app.redirectTo', ''));
        $this->middleware('guest', ['except' => 'logout']);
    }

    /**
     * Show the application's login form.
     *
     * @return \Illuminate\Http\Response
     */
    public function showLoginForm()
    {
        return view('springintoaction::frontend.auth.login');
    }

    /**
     * Validate the user login request.
     *
     * @param \Illuminate\Http\Request $request
     *
     * @return void
     */
    protected function validateLogin(Request $request)
    {
        $this->validate(
            $request,
            [
                $this->username() => 'required|exists:users,' . $this->username() . ',active,1',
                'password' => 'required',
            ],
            [
                $this->username() . '.exists' => __('auth.failed'),
            ]
        );
    }

    /**
     * Send the response after the user was authenticated.
     *
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\Response
     */
    protected function sendLoginResponse(Request $request)
    {
        $request->session()->regenerate();

        $this->clearLoginAttempts($request);

        $this->guard()->user()->update(['last_login' => Carbon::now()->toDateTimeString()]);

        return $this->authenticated($request, $this->guard()->user()) ?: redirect()->intended($this->redirectPath());
    }

    /**
     * The user has been authenticated.
     *
     * @param \Illuminate\Http\Request                        $request
     * @param \Illuminate\Contracts\Auth\Authenticatable|null $user
     *
     * @return mixed
     */
    protected function authenticated(Request $request, $user)
    {
        \Log::info('User logged in from frontend: ' . $user->name);

        $redirectTo = $request->post('redirect_to');
        $redirectToBackboneHash = !empty($redirectTo) && strpos($redirectTo, '#') === 0 ? $redirectTo : '';
        $bHasBackendAccess = $user->ability(['admin','backend_user','project_manager','school_district_manager'],['backend_access']);

        // Redirect to backbone route if it's set
        if ($bHasBackendAccess && !empty($redirectToBackboneHash)) {
            $redirectUrl =
                route(config('springintoaction.admin.app.redirectTo', 'boilerplate.home')) . $redirectToBackboneHash;

            \Log::info('User '. $user->name. ' logged in from frontend and was redirected to: ' . $redirectUrl);
            return redirect($redirectUrl);
        }

        // return false so sendLoginResponse redirects to intended redirectPath
        return false;
    }

    /**
     * Log the user out of the application.
     *
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\Response
     */
    public function logout(Request $request)
    {
        $this->guard()->logout();

        $request->session()->invalidate();

        return redirect('/' . config('springintoaction.app.prefix', ''));
    }
}
