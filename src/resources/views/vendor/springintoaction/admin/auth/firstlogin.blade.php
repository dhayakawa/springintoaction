@extends('springintoaction::admin.auth.layout', [
    'title' => __('springintoaction::auth.firstlogin.title'),
    'bodyClass' => 'hold-transition login-page'
])

@section('content')
    @component('springintoaction::admin.auth.loginbox')
        {{ Form::open(['route' => 'admin.users.firstlogin', 'autocomplete' => 'off']) }}
        <input type="hidden" name="token" value="{{ $token }}">
        <div class="alert alert-info">
            <p>{{ __('springintoaction::auth.firstlogin.intro') }}</p>
        </div>
        <div class="form-group {{ $errors->has('password') ? 'has-error' : '' }}">
            {{ Form::label('password', __('springintoaction::auth.fields.password')) }}
            {{ Form::input('password', 'password', Request::old('password'), ['class' => 'form-control', 'autofocus']) }}
            {!! $errors->first('password','<p class="text-danger">:message</p>') !!}
        </div>
        <div class="form-group {{ $errors->has('password_confirmation') ? 'has-error' : '' }}">
            {{ Form::label('password_confirmation', __('springintoaction::auth.fields.password_confirm')) }}
            {{ Form::input('password', 'password_confirmation', Request::old('password_confirmation'), ['class' => 'form-control']) }}
            {!! $errors->first('password_confirmation','<p class="text-danger">:message</p>') !!}
        </div>
        <div class="form-group text-center">
            <button type="submit" class="btn btn-primary">
                {{ __('springintoaction::auth.firstlogin.button') }}
            </button>
        </div>
        </form>
    @endcomponent
@endsection
