<!DOCTYPE html>
<html lang="{{ App::getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title }} | {{ config('app.name') }}</title>
    <link rel="stylesheet" href="{{ mix('/css/springintoaction.fonts.css') }}"  type="text/css"/>
    <link rel="stylesheet" href="{{ asset('css/boilerplate.min.css') }}" type="text/css">
<!--    <link href="https://fonts.googleapis.com/css?family=Raleway:100,400,600" rel="stylesheet" type="text/css">-->
    <link rel="stylesheet" href="{{ mix('/css/springintoaction.frontend.css') }}" type="text/css"/>
    @stack('css')
</head>
<body class="{{ $bodyClass }}">
<div class="bg full-height"></div>
<div class="container">
    @if (Route::has('login'))
    <div class="row">
        <div class="col-xs-12 clearfix">
            @if (!empty(trim(Route::currentRouteName())))
            <a class="home-logo" href="{{ url('/') }}"><img src="/images/sia-spring-logo-transparent-big.png" /></a>
            @endif
            <ul class="nav-links">
            @auth
            <li><a href="{{ route('logout') }}" class="logout">
                            <span class="hidden-xs">
                                <span class="fa fa-power-off"></span> {{ __('boilerplate::layout.logout') }}
                            </span>
                </a>
            </li>
                <li>

            {!! Form::open(['route' => 'logout', 'method' => 'post', 'id' => 'logout-form', 'style'=> 'display:none']) !!}
            {!! Form::close() !!}
                </li>
            @else
                @env('local')
                <li><a href="{{ route('login') }}">Login</a></li>
                <li><a href="{{ route('register') }}">Register</a></li>
                @elseenv('testing')

                @else
                
<!--                <li><a href="{{ route('login') }}">Login</a></li>-->
<!--                <li><a href="{{ route('register') }}">Register</a></li>-->
                @endenv

            @endauth
            </ul>
        </div>
    </div>
    @endif
    @yield('content')
</div>
<script type="text/javascript" src="{{ asset('js/plugins/jQuery/jquery-2.2.3.min.js') }}"></script>
<script type="text/javascript">
    $('.logout').on('click', function (e) {
        e.preventDefault();
        $('#logout-form').submit();
    })
</script>
@stack('js')
</body>
</html>
