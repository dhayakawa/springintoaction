<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Projucts Management - Demo</title>
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet">
    <link href="{{ asset('/js/node_modules/toastr/build/toastr.css') }}" rel="stylesheet">
    <script data-main="{{ asset('/js/main') }}" src="{{ asset('/js/node_modules/requirejs/require.js') }}"></script>
</head>
<body data-rooturl="{{ Request::root() }}">
<div class="container">
    <div class="page-header">
        <h1>Products Management
            <small>Demo</small>
        </h1>
    </div>
    <div id="page-content">
        @yield('content')
    </div>
    <blockquote style="margin-top:100px">
        <p><a href="http://rundef.com/building-ajax-web-applications-laravel-backbone-requirejs" target="_blank" data-bypass>Building AJAX web applications with Laravel 5, Backbone and RequireJS</a>
        </p>
    </blockquote>
</div>
</body>
</html>
