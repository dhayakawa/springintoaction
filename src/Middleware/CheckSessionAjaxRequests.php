<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 11/13/2018
 * Time: 2:00 PM
 */

namespace Dhayakawa\SpringIntoAction\Middleware;

class CheckSessionAjaxRequests
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure                 $next
     *
     * @return mixed
     */
    public function handle($request, \Closure $next)
    {

        if ($request->ajax() && preg_match("/^admin/", $request->path())) {
            if (empty(\Auth::user())) {
                return response()->json(
                    [
                        'SESSION_STATUS' => 'NOT_LOGGED_IN'
                    ]
                );
            } else {
                return $next($request);
            }
        } else {
            return $next($request);
        }
    }
}
