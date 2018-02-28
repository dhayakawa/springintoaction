@extends('boilerplate::layout.index', [
'title' => 'Projects',
'subtitle' => 'Project Subtitle',
'breadcrumb' => [
__('boilerplate::logs.menu.reports')
]
])

@section('content')
<h2>Products</h2>
<a href="{{ route('projects.create') }}" class="btn btn-primary pull-right">Add a project</a>
<div style="clear:both;height:20px;"></div>
@if(Session::has('success_message'))
<div class="alert alert-success" role="alert">{{ Session::get('success_message') }}</div>
@endif
<table cellspacing="0" class="table table-striped table-hover">
    <thead>
    <tr>
        <th>Year</th>
        <th>Project Description</th>
        <th></th>
    </tr>
    </thead>
    <tbody>
    @foreach ($projects as $project)
    <tr>
        <td>{{ $project->Year }}</td>
        <td>{{ $project->ProjectDescription }}</td>
        <td>
            <a title="Edit the project" class="action-edit" href="{{ route('projects.edit', ['ProjectID' => $project->ProjectID]) }}"><span class="glyphicon glyphicon-pencil"></span></a>

            <form method="POST" class="action-delete" action="{{ route('projects.destroy', ['ProjectID' => $project->ProjectID]) }}" style="display:inline;">
                <input type="hidden" name="_method" value="DELETE"/>
                {{ csrf_field() }}
                <button type="submit" title="Delete the project" class="glyphicon glyphicon-trash" style="color:red;border:0;background-color:transparent"></button>
            </form>
        </td>
    </tr>
    @endforeach
    @if(count($projects) == 0)
    <tr>
        <td colspan="3">Empty dataset.</td>
    </tr>
    @endif
    </tbody>
</table>
@endsection
