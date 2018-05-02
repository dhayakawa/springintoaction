<!doctype html>
<html data-welcome lang="{{ app()->getLocale() }}">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="manifest" href="/site.webmanifest">
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
        <meta name="msapplication-TileColor" content="#da532c">
        <meta name="theme-color" content="#ffffff">
        <title>Woodlands Church :: Spring Into Action</title>

        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css?family=Raleway:100,600" rel="stylesheet" type="text/css">
        <script defer src="https://use.fontawesome.com/releases/v5.0.8/js/all.js"></script>
        <!-- Styles -->
        <style>
            html, body {
                background-color: #fff;
                color: #636b6f;
                font-family: 'Raleway', sans-serif;
                font-weight: 100;
                height: 100vh;
                margin: 0;
            }

            .full-height {
                height: 100vh;
            }

            .flex-center {
                align-items: center;
                display: flex;
                justify-content: center;
            }

            .position-ref {
                position: relative;
            }

            .top-right {
                position: absolute;
                right: 10px;
                top: 18px;
            }

            .content {
                text-align: center;
                position: relative;
            }

            .title {
                font-size: 84px;
                position: relative;
            }

            .links > a {
                color: #636b6f;
                padding: 0 25px;
                font-size: 12px;
                font-weight: 600;
                letter-spacing: .1rem;
                text-decoration: none;
                text-transform: uppercase;
            }

            .bg {
                /* The image used */
                background-image: url("/images/sia-grass.png");

                /* Full height */
                height: 100%;

                /* Center and scale the image nicely */
                background-position: center;
                background-repeat: no-repeat;
                background-size: cover;
            }

            .m-b-md {
                margin-bottom: 30px;
            }
        </style>
    </head>
    <body>
        <div class="bg flex-center position-ref full-height">
            @if (Route::has('login'))
                <div class="top-right links">
                    @auth
                        <a href="{{ url('/') }}">Home</a>
                        <a href="{{ route('logout') }}" class="logout">
                            <span class="hidden-xs">
                                <span class="fa fa-power-off"></span> {{ __('boilerplate::layout.logout') }}
                            </span>
                        </a>
                        {!! Form::open(['route' => 'logout', 'method' => 'post', 'id' => 'logout-form', 'style'=> 'display:none']) !!}
                        {!! Form::close() !!}
                    @else
                        <a href="{{ route('login') }}">Login</a>
                        <a href="{{ route('register') }}">Register</a>
                    @endauth
                </div>
            @endif

            <div class="content">
                @auth
                <div style="width:50%;margin:20px auto;padding:20px;background:rgba(255,255,255,0.52);">If you have registered without letting David Hayakawa know about it, you'll need
                    to contact him to have
                    your account permissions updated so you can work on the database.<br>
                    Contact him at <a href="mailto:david.hayakawa@gmail.com">david.hayakawa@gmail.com</a>
                </div>
                @endauth
                <div class="title m-b-md">
                    <span style="z-index:2">Spring Into Action</span>
                </div>
                <img style="height:100px;" src="/images/sia-spring-logo-transparent-big.png">
                <div class="links">
                    <a href="https://woodlandschurch.org">Woodlands Church</a>
                </div>
            </div>
        </div>
        <script type="text/javascript" src="{{ asset('js/plugins/jQuery/jquery-2.2.3.min.js') }}"></script>
        <script type="text/javascript">

            $('.logout').on('click',function(e){
                e.preventDefault();
                $('#logout-form').submit();
            })

        </script>
    </body>
</html>
