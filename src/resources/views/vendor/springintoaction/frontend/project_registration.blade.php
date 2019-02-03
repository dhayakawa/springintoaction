@extends('springintoaction::frontend.layout', [
'title' => 'Project Registration',
'bodyClass' => 'project-registration-page'
])
@push('js')
<div style="display:none" id="sia-confirm-template">
    <div class="confirm-dialog" role="document">
        <div class="confirm-content">
            <div class="confirm-body">
                <div class="confirm-question"></div>
                <div class="confirm-buttons text-center">
                    <button class="btn btn-success btn-yes">Yes</button>
                    <button class="btn btn-alert btn-no">No</button>
                </div>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->
<div style="display:none" id="sia-modal-template">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title"></h4>
            </div>
            <div class="modal-body">
                <p></p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->
<script src="{{ asset('/js/boilerplate.min.js') }}"></script>
<script src="{{ mix('/js/springintoaction.packages.js') }}"></script>
<script src="{{ mix('/js/frontend/registration/springintoaction.templates.js') }}"></script>
<script src="{{ mix('/js/frontend/registration/springintoaction.init.js') }}"></script>
<script src="{{ mix('/js/frontend/registration/springintoaction.models.js') }}"></script>
<script src="/js/frontend/registration/app-initial-models-vars-data.js?id={{ $appInitialData['random'] }}"></script>
<script src="{{ mix('/js/frontend/registration/springintoaction.collections.js') }}"></script>
<script src="/js/frontend/registration/app-initial-collections-view-data.js?id={{ $appInitialData['random'] }}"></script>
<script src="{{ mix('/js/frontend/registration/springintoaction.views.js') }}"></script>
<script src="{{ mix('/js/frontend/registration/springintoaction.main.js') }}"></script>

@endpush
@push('css')
<link rel="stylesheet"
      href="https://use.fontawesome.com/releases/v5.6.1/css/all.css"
      integrity="sha384-gfdkjb5BdAXd+lj+gudLWI+BXq4IuLW5IT+brZEZsLFm++aCMlF1V92rMkPaX4PP"
      crossorigin="anonymous">
<link rel="stylesheet" href="{{ asset('css/boilerplate.min.css') }}"/>
<link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:200,400" rel="stylesheet"/>
<link rel="stylesheet" href="{{ mix('/css/springintoaction.packages.css') }}"/>
<link rel="stylesheet" href="{{ mix('/css/frontend/registration/springintoaction.app.css') }}"/>
@endpush
@section('content')
@component('springintoaction::frontend.page')

<div class="row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 sia-registration-app" data-rooturl="{{ Request::url() }}">

    </div>
</div>
@endcomponent
@endsection
@section('footer')
<div class="flatiron-icon-attribution">Icons made by <a target="_blank" href="https://www.flaticon.com/authors/srip" title="srip">srip</a>,<a
        target="_blank" href="https://www.flaticon.com/authors/freepik"
        title="Freepik">Freepik</a>,<a
        target="_blank" href="https://www.flaticon.com/authors/pixel-perfect"
        title="Pixel perfect">Pixel perfect</a> from
    <a target="_blank" href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by
    <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>
</div>
@endsection
