<!DOCTYPE html>
<html lang="{{ App::getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title }} | {{ config('app.name') }}</title>
    <link rel="stylesheet" href="{{ mix('/css/springintoaction.fonts.css') }}" type="text/css"/>
    <link rel="stylesheet" href="{{ asset('css/boilerplate.min.css') }}">
    <link rel="stylesheet" href="{{ mix('/css/springintoaction.frontend.css') }}" type="text/css"/>
    @stack('css')
</head>
<body class="{{ $bodyClass or 'login-page'}}">
    <div class="bg full-height"></div>
    <div class="container">
        <div class="row">
            <div class="col-xs-12 clearfix">
                <ul class="nav-links">
                    <li><a href="{{ url('/') }}">Home</a></li>
                </ul>
                @yield('content')
            </div>
        </div>
    </div>
    <script src="{{ asset('js/boilerplate.min.js') }}"></script>
    @stack('js')
</body>
</html>
