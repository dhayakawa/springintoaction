@extends('springintoaction::frontend.layout', [
'title' => 'Project Request Received',
'bodyClass' => 'hold-transition project-request-page'
])
@push('js')

@endpush
@section('content')
@component('springintoaction::frontend.page')
Thank you for your submission. We will review your request and get back to you!
<p>Click <a href="/project_request">here</a> to add another project request.</p>
@endcomponent
@endsection
