<?php

namespace Dhayakawa\SpringIntoAction\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure                 $next
     * @param  string|null              $guard
     *
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = null)
    {
        if (Auth::guard($guard)->check()) {
            if (!Auth::guard($guard)->user()->ability(
                ['admin', 'backend_user', 'project_manager', 'school_district_manager'],
                ['backend_access'])) {
                return redirect(route(config('springintoaction.app.redirectTo', '')));
            } else {
                return redirect(route(config('springintoaction.admin.app.redirectTo', 'boilerplate.home')));
            }
        }

        return $next($request);
    }
}
