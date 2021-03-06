@extends('springintoaction::frontend.layout', [
'title' => 'Project Request',
'bodyClass' => 'project-request-page'
])
@push('js')
<script type="text/javascript">
    let aaProjects = @json($formData['aaProjects']);
    let aBudgetSources = @json($formData['aBudgetSources']);
    let aBudgetSourceOptions = @json($formData['aBudgetSourceOptions']);
</script>
<script src="{{ mix('/js/frontend/springintoaction.project-request.js') }}"></script>
@endpush
@section('content')
@component('springintoaction::frontend.page')
{!! Form::open(['route' => 'project.request', 'name' => 'project-request', 'method' => 'post', 'autocomplete'=> 'off', 'enctype'=>'multipart/form-data']) !!}
@if (isset($errors) && !empty($errors))
@include('springintoaction::frontend.error_messages')
@endif
<div class="row">
    <div class="form-group col-xs-5">
        <label for="SiteID">Project Site</label>
        {{ Form::select('SiteID', $formData['aSiteOptions'] , old('siteid'),['class'=>'form-control', 'required'=>'required']) }}
    </div>
    <div class="form-group col-xs-7">
        <div class="row">
            <label for="ContactID">Project Request Submitter</label>
        </div>
        <div class="row">
            <div class="input-group col-xs-11">
                {{ Form::select('ContactID', $formData['aContactOptions'] , old('contactid'),['class'=>'form-control','required'=>'required','aria-label'=>"Choose your name if it is in this list, otherwise click the new button to add your contact info"],$formData['aContactOptionAttrs'] ) }}
                <div class="input-group-btn" id="button-new-contact">
                    <button class="btn btn-primary button-new-contact" type="button">add me</button>
                </div>
            </div>
        </div>
        <div class="row">
            <small id="contactHelp" class="form-text text-muted">Choose your name if it is in this list, otherwise click
                the "add me" button to add your contact info.
            </small>
        </div>
    </div>
</div>
<div class="row new-contact-info">
    <div class="form-group col-xs-4">
        <label for="FirstName">First Name</label>
        {{ Form::text('FirstName', old('firstname'), ['id'=>'FirstName', 'class'=>'form-control','aria-describedby'=>"FirstName",'placeholder'=>"Enter First Name"]) }}
    </div>
    <div class="form-group col-xs-4">
        <label for="LastName">Last Name</label>
        {{ Form::text('LastName', old('lastname'), ['id'=>'LastName', 'class'=>'form-control','aria-describedby'=>"LastName",'placeholder'=>"Enter Last Name"]) }}
    </div>
    <div class="form-group col-xs-4">
        <label for="Email">Email address</label>
        {{ Form::text('Email', old('email'), ['id'=>'Email', 'class'=>'form-control','aria-describedby'=>"Email",'placeholder'=>"Enter Email address"]) }}
        <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
    </div>
</div>
<div class="row new-contact-info">
    <div class="form-group col-xs-4">
        <label for="Phone">Phone</label>
        {{ Form::text('Phone', old('phone'), ['id'=>'Phone', 'class'=>'form-control','aria-describedby'=>"Phone",'placeholder'=>"Enter Phone Number"]) }}
    </div>
    <div class="form-group col-xs-4">
        <label for="Title">Your Job Title</label>
        {{ Form::text('Title', old('title'), ['id'=>'Title','enctype'=>'multipart/form-data','class'=>'form-control','aria-describedby'=>"Title",'placeholder'=>"Enter Your Job Title"]) }}
    </div>
</div>
<div class="row">
    <div class="form-group col-xs-12 site-projects">
        <label>Current Site Projects</label>
        <table class="table">
            <thead>
                <th>Project ID</th>
                <th>Description</th>
<!--                <th>Budget Sources</th>-->
            </thead>
            <tbody>

            </tbody>
        </table>
        <div class="no-site-projects">No projects have been submitted for this year yet.</div>
    </div>
</div>
<div class="row">
    <div class="form-group col-xs-12">
        <label for="OriginalRequest">Project Request</label>
        {{ Form::textarea('OriginalRequest', old('originalrequest'), ['id'=>'OriginalRequest','class'=>'form-control','rows'=>"3", 'required'=>'required']) }}
    </div>
</div>
<div class="row">
    <div class="form-group col-xs-12">
        <label for="OriginalRequestRoom">Please provide room # or specific area in building where project will be done or installed</label>
        {{ Form::text('OriginalRequestRoom', old('originalrequestroom'), ['id'=>'OriginalRequestRoom','class'=>'form-control','rows'=>"3", 'required'=>'required', 'aria-describedby'=>"Please provide room # or
        specific area in building where project will be done or installed"]) }}
    </div>
</div>
<div class="row">
    <div class="form-group col-xs-12">
        <label for="OriginalRequestRoomPerson">Please provide person (teacher or staff person) responsible for room or area</label>
        {{ Form::text('OriginalRequestRoomPerson', old('originalrequestroomperson'), ['id'=>'OriginalRequestRoomPerson','class'=>'form-control','rows'=>"3", 'required'=>'required', 'aria-describedby'=>"Please
        provide person (teacher or staff person) responsible for room or area"]) }}
    </div>
</div>
<div class="row">
    <div class="form-group col-xs-12">
                <label class="required">Project Budget Sources</label><br/>
                    @php
                    $oldInputs = Form::getSessionStore()->getOldInput();
                    if(!empty($oldInputs)){
                        $old = $oldInputs['BudgetSources'];
                    } else {
                        $old = null;
                    }
                    foreach($formData['aBudgetSourceOptions'] as $option):
                        if(in_array($option['option_label'],['School','PTO','Unknown'])) {
                            if($old !== null):
                                $checked = empty($old) && $option['option_value'] == '' ? "checked" : in_array($option['option_value'], $old) ? "checked" : "";
                            else:
                                $checked = "";

                            endif;
                            echo "<label class=\"checkbox-inline\">";
                            echo "<input name=\"BudgetSources[]\" type=\"checkbox\" value=\"{$option['option_value']}\" {$checked}>{$option['option_label']}";
                            echo "</label>";
                        }
                    endforeach;
                    @endphp

        </div>
</div>

<div class="row">
        <div class="form-group col-xs-12">
            <label for="ProjectAttachments">Upload Photos of Project Examples</label>
            {{ Form::file('ProjectAttachments[]',['class'=>'form-control form-control-file','id'=>'ProjectAttachments','multiple'=>'multiple','aria-label'=>"Upload file"]) }}
            <small class="form-text text-muted">If you have multiple examples of what you'd like us to do, please choose them all at once.</small>
        </div>
</div>
<div class="row">
    <div class="form-group col-xs-12  {{ $errors->has('project_request_password') ? 'has-error' : '' }}">
        <label for="project_request_password">Project Request Password</label>
        <div class="row">
            <div class="col-xs-4">
                {{ Form::text('project_request_password', old('project_request_password'), ['class'=>'form-control','required'=>'required','aria-label'=>"Enter project request password",'placeholder'=>"Enter project request password"]) }}
            </div>
        </div>
        <small id="passwordHelp" class="form-text text-muted">You should have been given the password to this form by your contact at Woodlands Church.</small>
        {!! $errors->first('project_request_password', '<span class="help-block">:message</span>') !!}
    </div>
</div>
<div class="row">
    <div class="form-group col-xs-12 {{ $errors->has('g-recaptcha-response') ? 'has-error' : '' }}">
        {!! app('captcha')->display() !!}
        {!! $errors->first('g-recaptcha-response', '<span class="help-block">:message</span>') !!}
    </div>
</div>
<button type="submit" class="btn btn-primary">Submit</button>
{!! Form::close() !!}
@endcomponent
@endsection
