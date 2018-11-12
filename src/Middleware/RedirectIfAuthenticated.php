<?php

namespace Dhayakawa\SpringIntoAction\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $guard
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = null)
    {
        if (Auth::guard($guard)->check()) {
            if(Auth::guard($guard)->user()->hasRole('frontend_user')){
                return redirect('/home');
            } else {
                return redirect('/admin');
            }
        }

        return $next($request);
    }
}
