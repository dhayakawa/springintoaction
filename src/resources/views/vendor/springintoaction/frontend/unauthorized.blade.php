@extends('springintoaction::frontend.layout', [
'title' => 'Unauthorized Request',
'bodyClass' => 'unauthorized-request-page'
])
@section('content')
@component('springintoaction::frontend.page')
<div class="row">
    <div class="form-group col-xs-12 text-center">
        <h1>Sorry, you were not authorized to view that page</h1>
        @guest
        <h3>Perhaps you need to login?</h3>
        @endguest
    </div>
</div>
@endcomponent
@endsection
