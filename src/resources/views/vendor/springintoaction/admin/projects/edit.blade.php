@extends('boilerplate::layout.index', [
'title' => 'Projects',
'subtitle' => 'Project Subtitle',
'breadcrumb' => [
__('boilerplate::logs.menu.reports')
]
])

@section('content')
<h2>{{ $project->ProjectID ? 'Edit a project' : 'Add a project' }}</h2>
<div style="clear:both;height:20px;"></div>
<form method="POST" action="{{ $project->ProjectID ? route('projects.update', ['ProjectID' => $project->ProjectID]) : route('projects.store') }}">
    @if($project->ProjectID)
    <input type="hidden" name="_method" value="PUT"/>
    @endif
    {{ csrf_field() }}
    <div class="form-group {{ $errors->has('Year') ? 'has-error' : '' }}">
        <label for="Year" class="control-label">Project Year *</label>
        <input type="text" name="Year" id="Year" class="form-control" value="{{ old('Year', $project->Year) }}"/>
    </div>

    <div class="form-group">
        <label for="ProjectDescription" class="control-label">Project Description</label>
        <textarea name="ProjectDescription" id="ProjectDescription" class="form-control">{{ old('ProjectDescription', $project->ProjectDescription) }}</textarea>
    </div>
    <div class="form-group">
        <input type="submit" name="submit" value="Save" class="btn btn-primary"/>
    </div>
</form>
@endsection
