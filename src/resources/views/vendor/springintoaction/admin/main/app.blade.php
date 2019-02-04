@extends('boilerplate::layout.index', [
'title' => 'Spring Into Action',
'subtitle' => ''
])
@include('boilerplate::load.datepicker')
@include('boilerplate::load.icheck')
@push('js')
<div id="sia-modal" class="sia-modal modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">Modal title</h4>
            </div>
            <div class="modal-body">
                <p>One fine body&hellip;</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                <button type="button" class="save btn btn-primary">Save</button>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->
<script src="{{ mix('/js/springintoaction.packages.js') }}"></script>
<script src="{{ mix('/js/springintoaction.templates.js') }}"></script>
<script src="{{ mix('/js/springintoaction.init.js') }}"></script>
<script src="{{ mix('/js/springintoaction.models.js') }}"></script>
<script src="/js/app-initial-models-vars-data.js?id={{ $appInitialData['random'] }}"></script>
<script src="{{ mix('/js/springintoaction.collections.js') }}"></script>
<script src="/js/app-initial-collections-view-data.js?id={{ $appInitialData['random'] }}"></script>
<script src="{{ mix('/js/springintoaction.views.js') }}"></script>
<script src="{{ mix('/js/springintoaction.main.js') }}"></script>

@endpush

@push('css')
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous"/>
<link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:200,400" rel="stylesheet" />
<link rel="stylesheet" href="{{ mix('/css/springintoaction.packages.css') }}"/>
<link rel="stylesheet" href="{{ mix('/css/springintoaction.app.css') }}"/>
@endpush

@section('content')
<div class="row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 sia-main-app" data-rooturl="{{ Request::url() }}">

    </div>
</div>
@endsection
