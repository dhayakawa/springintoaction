@extends('springintoaction::frontend.layout', [
'title' => 'Woodlands Church :: Spring Into Action',
'bodyClass' => 'welcome-page'
])
@push('js')
@endpush
@section('content')
<div class="row">
    <div class="col-xs-12 text-center">
        @auth
        <div style="width:50%;margin:20px auto;padding:20px;background:rgba(255,255,255,0.52);">If you have registered without letting David Hayakawa know about it, you'll need
            to contact him to have
            your account permissions updated so you can work on the database.<br>
            Contact him at
            <a href="mailto:david.hayakawa@gmail.com">david.hayakawa@gmail.com</a>
        </div>
        @endauth
        <div class="title m-b-md">
            <span style="z-index:2">Spring Into Action</span>
        </div>
        <img style="height:100px;" src="/images/sia-spring-logo-transparent-big.png">
        <div class="welcome-links">
            <a href="https://woodlandschurch.org">Woodlands Church</a>
        </div>
    </div>
</div>
@endsection
