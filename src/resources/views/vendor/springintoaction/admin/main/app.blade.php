@extends('boilerplate::layout.index', [
'title' => 'Spring Into Action',
'subtitle' => ''
])
@push('js')
@include('boilerplate::load.icheck')
<script src="{{ asset('/js/springintoaction.packages.js') }}"></script>
<script src="{{ asset('/js/springintoaction.init.js') }}"></script>
<script src="{{ asset('/js/springintoaction.models.js') }}"></script>
<script src="{{ asset('/js/springintoaction.collections.js') }}"></script>
<script>
    /**
     * Bootstap Backbone models & collections for initial page load
     */
    var appInitialData = @json($appInitialData);
    App.Collections.sitesDropDownCollection = new App.Collections.Site(@json($appInitialData['sites']));
    App.Collections.siteYearsDropDownCollection = new App.Collections.SiteYear(@json($appInitialData['site_years']));
    App.Models.siteModel = new App.Models.Site(@json($appInitialData['site']));
    App.Models.siteStatusModel = new App.Models.SiteStatus(@json($appInitialData['siteStatus']));
    App.Collections.projectCollection = new App.Collections.Project(@json($appInitialData['projects']));
    App.Models.projectModel = new App.Models.Project(@json($appInitialData['project']));
    App.Collections.contactsCollection = new App.Collections.Contact(@json($appInitialData['contacts']));
    App.Models.contactModel = new App.Models.Contact(@json(current($appInitialData['contacts'])));
    App.Collections.volunteersCollection = new App.Collections.Volunteer(@json($appInitialData['project_volunteers']));
    App.Models.volunteerModel = new App.Models.Volunteer(@json(current($appInitialData['project_volunteers'])));
    App.Collections.projectLeadCollection = new App.Collections.Volunteer(@json($appInitialData['project_leads']));
    App.Models.projectLeadModel = new App.Models.Volunteer(@json(current($appInitialData['project_leads'])));
    App.Collections.budgetCollection = new App.Collections.Budget([@json($appInitialData['project_budget'])]);
    App.Models.budgetModel = new App.Models.Budget(@json($appInitialData['project_budget']));
    App.Views.siteProjectTabsView = {};
    App.Views.projectsView = {};
</script>
<script src="{{ asset('/js/springintoaction.views.js') }}"></script>
<script src="{{ asset('/js/springintoaction.main.js') }}"></script>
@endpush

@push('css')
<link rel="stylesheet" href="{{ asset('/css/packages.css') }}"/>
<link rel="stylesheet" href="{{ asset('/css/springintoaction.css') }}"/>
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
                <div class="row">
                    <div class="projects-view col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <div class="projects-backgrid-wrapper"></div>
                    </div>
                </div>
            </div>
            <div class="box-footer">
                <div class="projects-grid-manager-container"></div>
            </div>
        </div>
        <div class="box box-secondary site-projects-tabs">
            <div class="box-header with-border">
                <h3 class="box-title">Project:<small></small>
                </h3>
                <div class="box-tools pull-right">
                    <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                </div>
            </div>
            <div class="box-body">
                <!-- Nav tabs -->
                <ul class="nav nav-tabs" role="tablist">
                    <li role="presentation" class="active"><a href="#project_leads" aria-controls="project_leads" role="tab" data-toggle="tab">Project Lead Volunteers</a></li>
                    <li role="presentation"><a href="#budget" aria-controls="budget" role="tab" data-toggle="tab">Budget Allocation</a></li>
                    <li role="presentation"><a href="#contacts" aria-controls="contacts" role="tab" data-toggle="tab">Project Site Contacts</a></li>
                    <li role="presentation"><a href="#volunteers" aria-controls="volunteers" role="tab" data-toggle="tab">Volunteers</a></li>
                </ul>

                <!-- Tab panes -->
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane active" id="project_leads">
                        <div class="project-leads-backgrid-wrapper"></div>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="budget">
                        <div class="project-budget-backgrid-wrapper"></div>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="contacts">
                        <div class="project-contacts-backgrid-wrapper"></div>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="volunteers">
                        <div class="project-volunteers-backgrid-wrapper"></div>
                    </div>
                </div>
            </div>
            <div class="box-footer">
                <div class="project-tabs-grid-manager-container"></div>
            </div>
        </div>
    </div>
</div>

<script id="projectGridManagerContainerToolbarTemplate" type="text/template">
    <div class="pull-right project-pagination-controls"></div>
    <button id="btnAddProject" type="button" class="btn btn-xs btn-primary">Add Project</button>
    <button id="btnDeleteCheckedProjects" type="button" class="btn btn-xs btn-danger">Delete Chosen Projects</button>
    <button id="btnClearStored" type="button" class="btn btn-xs btn-default">Reset Columns</button>
    <button id="btnLogStored" type="button" class="btn btn-xs btn-info">Log settings</button>
</script>
<script id="projectTabsGridManagerContainerToolbarsTemplate" type="text/template">
    <div class="<%= TabName %> tabButtonPane" style="display:none">
        <div class="pull-right tab-pagination-controls"></div>
        <button type="button" class="btnTabAdd btn btn-xs btn-primary">Add New <%= btnLabel %></button>
        <button type="button" class="btnTabDeleteChecked btn btn-xs btn-danger">Delete <%= btnLabel %> Chosen</button>
        <button type="button" class="btnTabClearStored btn btn-xs btn-default">Reset <%= btnLabel %> Columns</button>
    </div>
</script>
<script id="siteTemplate" type="text/template">
    <form id="site" action="">
        <input type="hidden" name="SiteID" id="inputSiteID" value="<%= SiteID %>"/>
        <div class="form-group">
            <label for="inputSiteName">Site Name</label>
            <input type="text" name="SiteName" class="form-control" id="inputSiteName" placeholder="Site Name" value="<%= SiteName %>"/>
        </div>
        <div class="form-group">
            <label for="inputEquipmentLocation">Equipment Location</label>
            <input type="text" name="EquipmentLocation" class="form-control" id="inputEquipmentLocation" placeholder="Equipment Location" value="<%= EquipmentLocation %>"/>
        </div>
        <div class="form-group">
            <label for="inputDebrisLocation">Debris Location</label>
            <input type="text" name="DebrisLocation" class="form-control" id="inputDebrisLocation" placeholder="Debris Location" value="<%= DebrisLocation %>"/>
        </div>
    </form>
</script>

<script id="siteStatusTemplate" type="text/template">
    <form id="siteStatus" action="">
        <input type="hidden" name="SiteStatusID" id="inputSiteStatusID" value="<%= SiteStatusID %>"/>
        <input type="hidden" name="Year" id="inputSiteStatusYear" value="<%= Year %>"/>
        <div class="form-group">
            <label class="checkbox-inline">
                <input type="checkbox" <%= ProjectDescriptionCompleteIsChecked %> name="ProjectDescriptionComplete" id="ProjectDescriptionComplete" value="1"> Project Description Complete
            </label>
            <label class="checkbox-inline">
                <input type="checkbox" <%= BudgetEstimationCompleteIsChecked %> name="BudgetEstimationComplete" id="BudgetEstimationComplete" value="1"> Budget Estimation Complete
            </label>
            <br/>
            <label class="checkbox-inline">
                <input type="checkbox" <%= VolunteerEstimationCompleteIsChecked %> name="VolunteerEstimationComplete" id="VolunteerEstimationComplete" value="1"> Volunteer Estimation Complete
            </label>
            <label class="checkbox-inline">
                <input type="checkbox" <%= VolunteerAssignmentCompleteIsChecked %> name="VolunteerAssignmentComplete" id="VolunteerAssignmentComplete" value="1"> Volunteer Assignment Complete
            </label>
            <br/>
            <label class="checkbox-inline">
                <input type="checkbox" <%= BudgetActualCompleteIsChecked %> name="BudgetActualComplete" id="BudgetActualComplete" value="1"> Budget Actual Complete
            </label>
        </div>
        <div class="form-group">
            <label for="inputBudgetActualComplete">Estimation Comments</label>
            <input type="text" name="EstimationComments" id="inputBudgetActualComplete" class="form-control" placeholder="Estimation Comments" value="<%= EstimationComments %>"/>
        </div>
    </form>
</script>

<script id="siteFormTemplate" type="text/template">
    <form id="addSite" action="">
        <input type="text" placeholder="Name of the Site">
        <input type="submit" value="Add Site">
    </form>
</script>
@endsection
