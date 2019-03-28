<?php

namespace Dhayakawa\SpringIntoAction\Exceptions;

use Exception;
use Illuminate\Auth\AuthenticationException;

class Handler extends \App\Exceptions\Handler
{
    /**
     * Convert an authentication exception into a response.
     *
     * @param  \Illuminate\Http\Request                 $request
     * @param  \Illuminate\Auth\AuthenticationException $exception
     *
     * @return \Illuminate\Http\Response
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {

        return $request->expectsJson() ? response()->json(['message' => $exception->getMessage()], 401) :
            redirect()->guest(route('unauthorized'));
    }

    public function report(Exception $exception)
    {
        if (app()->bound('sentry') && $this->shouldReport($exception)) {
            app('sentry')->captureException($exception);
        }

        parent::report($exception);
    }
}
