@extends('boilerplate::layout.index', [
'title' => 'Spring Into Action',
'subtitle' => ''
])
@push('js')
@include('boilerplate::load.icheck')
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
<link rel="stylesheet" href="{{ mix('/css/springintoaction.packages.css') }}"/>
<link rel="stylesheet" href="{{ mix('/css/springintoaction.app.css') }}"/>
@endpush

@section('content')
<div class="row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 sia-main-app" data-rooturl="{{ Request::url() }}">
        <div class="box box-primary site-management-view">
            <div class="box-header with-border">
                <h3 class="box-title site-management">Site Management:</h3>
                <select id="sites" class="site-management-selects form-control input-sm inline"></select>
                <select id="site_years" class="site-management-selects form-control input-sm inline"></select>
                <button id="btnAddSite" type="button" class="btn btn-sm btn-primary">Add Site</button>
                <button id="btnDeleteSite" type="button" class="btn btn-sm btn-danger">Delete Site</button>
                <button type="button" class="btn btn-box-tool" data-toggle="collapse" data-target="#site-well">Toggle Site Info Display</button>
                <div class="pull-right">
                    <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                </div>
            </div>
            <div class="box-body">
                <div id="site-well" class="well well-sm collapse in">
                    <div class="row">
                        <div class="site-view col-xs-6"></div>
                        <div class="site-status-view col-xs-6"></div>
                    </div>
                    <div class="site-create-toolbar" style="display:none">
                        <button id="btnSaveNewSite" type="button" class="btn btn-success">Save New Site</button>
                        <button id="btnCancelNewSite" type="button" class="btn btn-default">Cancel</button>
                    </div>
                </div>
                <div class="well well-sm collapse in">
                    <h4 class="well-title">Projects
                    </h4>
                    <div class="row">
                        <div class="projects-view col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <div class="projects-backgrid-wrapper backgrid-wrapper"></div>
                        </div>
                        <div class="projects-grid-manager-container grid-manager-container col-xs-12 col-sm-12 col-md-12 col-lg-12"></div>
                    </div>
                    <div class="row">
                    <div class="nested-box site-projects-tabs collapsed-box">
                        <div class="box-header with-border">
                            <h3 class="box-title">Project Details:
                                <small></small>
                            </h3>
                        </div>
                        <div class="box-body">
                            <!-- Nav tabs -->
                            <ul class="nav nav-tabs" role="tablist">
                                <li role="presentation" class="active"><a href="#project_lead" aria-controls="project_lead" role="tab" data-toggle="tab">Project Lead Volunteers</a></li>
                                <li role="presentation"><a href="#project_budget" aria-controls="project_budget" role="tab" data-toggle="tab">Budget Allocation</a></li>
                                <li role="presentation"><a href="#project_contact" aria-controls="project_contact" role="tab" data-toggle="tab">Project Site Contacts</a></li>
                                <li role="presentation"><a href="#project_volunteer" aria-controls="project_volunteer" role="tab" data-toggle="tab">Volunteers</a></li>
                                <li role="presentation"><a href="#project_attachment" aria-controls="project_attachment" role="tab" data-toggle="tab">Attachments</a></li>
                            </ul>

                            <!-- Tab panes -->
                            <div class="tab-content backgrid-wrapper">
                                <div role="tabpanel" class="tab-pane active" id="project_lead">
                                    <div class="project-leads-backgrid-wrapper"></div>
                                </div>
                                <div role="tabpanel" class="tab-pane" id="project_budget">
                                    <div class="project-budget-backgrid-wrapper"></div>
                                </div>
                                <div role="tabpanel" class="tab-pane" id="project_contact">
                                    <div class="project-contacts-backgrid-wrapper"></div>
                                </div>
                                <div role="tabpanel" class="tab-pane" id="project_volunteer">
                                    <div class="project-volunteers-backgrid-wrapper"></div>
                                </div>
                                <div role="tabpanel" class="tab-pane" id="project_attachment">
                                    <div class="project_attachments-backgrid-wrapper"></div>
                                </div>
                            </div>
                        </div>
                        <div class="box-footer">
                            <div class="project-tabs-grid-manager-container grid-manager-container"></div>
                        </div>
                    </div>
                </div>
                </div>
                <div id="site-well" class="well well-sm collapse in">
                    <h4 class="well-title">Site Volunteers</h4>
                    <div class="row">
                        <div class="site-volunteers-view col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <div class="site-volunteers-backgrid-wrapper backgrid-wrapper"></div>
                        </div>
                        <div class="site-volunteers-grid-manager-container grid-manager-container col-xs-12 col-sm-12 col-md-12 col-lg-12">

                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>
@endsection
