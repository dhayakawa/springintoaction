@extends('boilerplate::layout.index', [
'title' => 'Spring Into Action',
'subtitle' => ''
])
@push('js')
@include('boilerplate::load.icheck')
<script src="{{ asset('/js/springintoaction.packages.js') }}"></script>
<script src="{{ asset('/js/springintoaction.init.js') }}"></script>
<script src="{{ asset('/js/springintoaction.models.js') }}"></script>

<script>

    /**
     * Bootstap Backbone models & collections for initial page load
     */
    var appInitialData = @json($appInitialData);

    App.Models.siteModel = new App.Models.Site(@json($appInitialData['site']));
    App.Models.siteStatusModel = new App.Models.SiteStatus(@json($appInitialData['siteStatus']));
    App.Models.projectModel = new App.Models.Project(@json($appInitialData['project']));
    App.Models.contactModel = new App.Models.Contact(@json(current($appInitialData['contacts'])));
    App.Models.projectContactModel = new App.Models.Contact(@json(current($appInitialData['project_contacts'])));
    App.Models.volunteerModel = new App.Models.Volunteer(@json(current($appInitialData['project_volunteers'])));
    App.Models.projectLeadModel = new App.Models.Volunteer(@json(current($appInitialData['project_leads'])));
    App.Models.budgetModel = new App.Models.Budget(@json(current($appInitialData['project_budgets'])));
    App.Models.projectVolunteerModel = new App.Models.ProjectVolunteer();
    App.Models.projectVolunteerRoleModel = new App.Models.ProjectVolunteerRole();

    App.Vars.currentTabModels =
        {
            project_lead: App.Models.projectLeadModel,
            budget: App.Models.budgetModel,
            contact: App.Models.contactModel,
            volunteer: App.Models.volunteerModel
        }
    ;
    App.Vars.yesNoCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [
            {
                values: App.Models.projectModel.getYesNoOptions(false)
            }],
        // since the value obtained from the underlying `select` element will always be a string,
        // you'll need to provide a `toRaw` formatting method to convert the string back to a
        // type suitable for your model, which is an integer in this case.
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {
            toRaw: function (formattedValue, model) {
                return formattedValue === null ? [] : _.map(formattedValue, function (v) {
                    return parseInt(v);
                })
            }
        })
    });

    App.Vars.budgetSourceCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false,
            multiple: true
        },
        optionValues: [{
            values: App.Models.budgetModel.getSourceOptions(false)
        }],
        formatter: _.extend({}, Backgrid.SelectFormatter.prototype, {

            /**
             Normalizes raw scalar or array values to an array.

             @member Backgrid.SelectFormatter
             @param {*} rawValue
             @param {Backbone.Model} model Used for more complicated formatting
             @return {Array.<*>}
             */
            fromRaw: function (rawValue, model) {
                if (_.isString(rawValue) && rawValue.match(/,/)) {
                    rawValue = rawValue.split(',');
                }
                return _.isArray(rawValue) ? rawValue : rawValue != null ? [rawValue] : [];
            }
        })

    });

    App.Vars.sendCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getSendOptions(false)
        }]
    });

    App.Vars.VolunteerStatusCell = Backgrid.Extension.Select2Cell.extend({
        editor: App.CellEditors.Select2CellEditor,
        // any options specific to `select2` goes here
        select2Options: {
            // default is false because Backgrid will save the cell's value
            // and exit edit mode on enter
            openOnEnter: false
        },
        optionValues: [{
            values: App.Models.volunteerModel.getStatusOptions(false)
        }]

    });
</script>
<script src="{{ asset('/js/springintoaction.collections.js') }}"></script>
<script>
    App.Vars.sAjaxFileUploadURL = 'project/list/upload';
    App.Collections.sitesDropDownCollection = new App.Collections.Site(@json($appInitialData['sites']));
    App.Collections.siteYearsDropDownCollection = new App.Collections.SiteYear(@json($appInitialData['site_years']));
    App.PageableCollections.projectCollection = new App.PageableCollections.Project(@json($appInitialData['projects']));
    App.PageableCollections.contactsCollection = new App.PageableCollections.Contact(@json($appInitialData['contacts']));
    App.PageableCollections.volunteersCollection = new App.PageableCollections.Volunteer(@json($appInitialData['project_volunteers']));
    App.PageableCollections.projectLeadCollection = new App.PageableCollections.Volunteer(@json($appInitialData['project_leads']));
    App.PageableCollections.budgetCollection = new App.PageableCollections.Budget(@json($appInitialData['project_budgets']));
    App.PageableCollections.projectContactCollection = new App.PageableCollections.Contact(@json($appInitialData['project_contacts']));
    // This is for the drop down
    App.Collections.volunteersCollection = new App.Collections.Volunteer(@json($appInitialData['volunteers']));
    App.Collections.contactsManagementCollection = new App.Collections.Contact(@json($appInitialData['all_contacts']));

    // This is for the volunteer management view
    App.PageableCollections.volunteersManagementCollection = new App.PageableCollections.Volunteer(@json($appInitialData['volunteers']));
    App.PageableCollections.contactsManagementCollection = new App.PageableCollections.Contact(@json($appInitialData['all_contacts']));
    App.PageableCollections.backGridFiltersPanelCollection = App.PageableCollections.volunteersManagementCollection;
    App.PageableCollections.unassignedProjectVolunteersCollection = new App.PageableCollections.Volunteer();
    App.PageableCollections.unassignedProjectVolunteersCollection.url = 'project_volunteer/unassigned/' + App.Models.siteStatusModel.get('SiteID') + '/' + App.Models.siteStatusModel.get('Year');
    App.PageableCollections.unassignedProjectVolunteersCollection.fetch({reset: true});
    App.Views.siteProjectTabsView = {};
    App.Views.projectsView = {};
</script>
<script src="{{ asset('/js/springintoaction.views.js') }}"></script>
<script src="{{ asset('/js/springintoaction.main.js') }}"></script>
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
<script>
    $('#sia-modal').modal({
        backdrop: true,
        show: false,
        keyboard: false
    });
</script>
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
                        <div class="projects-backgrid-wrapper backgrid-wrapper"></div>
                    </div>
                </div>
            </div>
            <div class="box-footer">
                <div class="projects-grid-manager-container"></div>
            </div>
        </div>
        <div class="box box-secondary site-projects-tabs">
            <div class="box-header with-border">
                <h3 class="box-title">Project:
                    <small></small>
                </h3>
                <div class="box-tools pull-right">
                    <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                </div>
            </div>
            <div class="box-body">
                <!-- Nav tabs -->
                <ul class="nav nav-tabs" role="tablist">
                    <li role="presentation" class="active"><a href="#project_lead" aria-controls="project_lead" role="tab" data-toggle="tab">Project Lead Volunteers</a></li>
                    <li role="presentation"><a href="#budget" aria-controls="budget" role="tab" data-toggle="tab">Budget Allocation</a></li>
                    <li role="presentation"><a href="#contact" aria-controls="contact" role="tab" data-toggle="tab">Project Site Contacts</a></li>
                    <li role="presentation"><a href="#volunteer" aria-controls="volunteer" role="tab" data-toggle="tab">Volunteers</a></li>
                </ul>

                <!-- Tab panes -->
                <div class="tab-content backgrid-wrapper">
                    <div role="tabpanel" class="tab-pane active" id="project_lead">
                        <div class="project-leads-backgrid-wrapper"></div>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="budget">
                        <div class="project-budget-backgrid-wrapper"></div>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="contact">
                        <div class="project-contacts-backgrid-wrapper"></div>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="volunteer">
                        <div class="project-volunteers-backgrid-wrapper"></div>
                    </div>
                </div>
            </div>
            <div class="box-footer">
                <div class="project-tabs-grid-manager-container"></div>
            </div>
        </div>
        <div class="box box-primary collapsed-box volunteers-management-view">
            <div class="box-header with-border">
                <h3 class="box-title volunteers-management">Volunteer Management:</h3>
                <div class="pull-right">
                    <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                </div>
            </div>
            <div class="box-body">
                <div class="row">
                    <div class="volunteers-view col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <div class="volunteers-backgrid-wrapper backgrid-wrapper"></div>
                    </div>
                </div>
            </div>
            <div class="box-footer">
                <div class="volunteers-grid-manager-container">
                    <div class="pull-right pagination-controls"></div>
                </div>
            </div>
        </div>

        <div class="box box-primary collapsed-box contacts-management-view">
            <div class="box-header with-border">
                <h3 class="box-title contacts-management">Contacts Management:</h3>
                <div class="pull-right">
                    <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                </div>
            </div>
            <div class="box-body">
                <div class="row">
                    <div class="contacts-view col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <div class="contacts-backgrid-wrapper backgrid-wrapper"></div>
                    </div>
                </div>
            </div>
            <div class="box-footer">
                <div class="contacts-grid-manager-container"></div>
            </div>
        </div>
    </div>
</div>
<script id="addProjectVolunteerTemplate" type="text/template">
    <form name="addProjectVolunteer">
        <input type="hidden" name="ProjectID" value="<%= ProjectID %>"/>
        <input type="hidden" name="ProjectRoleID" value="4"/>
        <div class="form-group">
            <small class="pull-right"><strong class="result_count"></strong> Results</small>
            <small>Click the checkbox next to the volunteer you want to add. Multiple volunteers can be checked. Click save when done.</small>
        </div>
    </form>
</script>
<script id="backgridFiltersPanelTemplate" type="text/template">
    <div class="box box-primary">
        <div class="box-header with-border">
            <h3 class="box-title">Volunteer Filters:
                <small>find volunteers that match a projects needs/requirements</small>
            </h3>
            <div class="pull-right">
                <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
            </div>
        </div>
        <div class="box-body">
            <div class="backgrid-filter-panel row">
                <div class="col-xs-2">
                    <div class="form-group FirstName">
                        <label>First Name</label>
                    </div>
                    <div class="form-group LastName">
                        <label>Last Name</label>
                    </div>
                    <div class="form-group LG">
                        <label>Life Group</label>
                    </div>
                </div>
                <div class="col-xs-2">
                    <div class="form-group PrimarySkill">
                        <label>Primary Skill</label>
                    </div>
                    <div class="form-group AgeRange">
                        <label>Age Range</label>
                    </div>
                    <div class="form-group Status">
                        <label>Status</label>
                    </div>
                </div>
                <div class="col-xs-2">
                    <div class="form-group Landscaping">
                        <label>Landscaping</label>
                    </div>
                    <div class="form-group Painting">
                        <label>Painting</label>
                    </div>
                    <div class="form-group Construction">
                        <label>Construction</label>
                    </div>
                </div>
                <div class="col-xs-2">
                    <div class="form-group Plumbing">
                        <label>Plumbing</label>
                    </div>
                    <div class="form-group Electrical">
                        <label>Electrical</label>
                    </div>
                    <div class="form-group CabinetryFinishWork">
                        <label>Cabinetry Finish Work</label>
                    </div>
                </div>
                <div class="col-xs-3">
                    <div class="form-group Church">
                        <label>Church</label>
                    </div>
                    <div class="form-group SchoolPreference">
                        <label>School Preference</label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</script>
<script id="ajaxSpinnerTemplate" type="text/template">
    <div class="ajax-spinner-overlay">
        <div id="floatingCirclesG">
            <div class="f_circleG" id="frotateG_01"></div>
            <div class="f_circleG" id="frotateG_02"></div>
            <div class="f_circleG" id="frotateG_03"></div>
            <div class="f_circleG" id="frotateG_04"></div>
            <div class="f_circleG" id="frotateG_05"></div>
            <div class="f_circleG" id="frotateG_06"></div>
            <div class="f_circleG" id="frotateG_07"></div>
            <div class="f_circleG" id="frotateG_08"></div>
        </div>
    </div>
</script>
<script id="projectGridManagerContainerToolbarTemplate" type="text/template">
    <div class="pull-right project-pagination-controls"></div>
    <button id="btnAddProject" type="button" class="btn btn-xs btn-primary">Add Project</button>
    <button id="btnDeleteCheckedProjects" type="button" class="btn btn-xs btn-danger">Delete Chosen Projects</button>
    <button id="btnClearStored" type="button" class="btn btn-xs btn-default">Reset Columns</button>
    <div class="file-upload-container">
        <span id="file_chosen_projects_import" class="pull-right file_chosen"></span>
        <div class="btn btn-xs btn-default file-upload">
            <input class="file-input" type="file" value="" name="projects_import"
                   id="projects_import"/>
            <i class="fa fa-plus"></i> Choose Projects CSV File For Import
        </div>
        <div id="file_progress_projects_import" class="pull-left file_progress progress">
                                <span class="meter" style="width:0%;">
                                    <p class="percent">&nbsp;</p>
                                </span>
        </div>
        <input type="hidden" value="" name="projects_import" id="file_projects_import"  />

    </div>
</script>
<script id="projectTabsGridManagerContainerToolbarsTemplate" type="text/template">
    <div data-tab-name="<%= TabName %>" class="<%= TabName %> tabButtonPane" style="display:none">
        <div class="pull-right tab-pagination-controls"></div>
        <button type="button" class="btnTabAdd btn btn-xs btn-primary">Add New <%= btnLabel %></button>
        <button type="button" class="btnTabDeleteChecked btn btn-xs btn-danger">Delete <%= btnLabel %> Chosen</button>
        <button type="button" class="btnTabClearStored btn btn-xs btn-default">Reset <%= btnLabel %> Columns</button>
        <div class="columnmanager-visibilitycontrol-container"></div>
    </div>
</script>
<script id="siteTemplate" type="text/template">
    <form id="site">
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
<script id="newProjectLeadTemplate" type="text/template">
    <form name="newProjectLead">
        <input type="hidden" name="ProjectID" value="<%= ProjectID %>"/>
        <div class="form-group">
            <label for="selectVolunteerID">Volunteer</label>
            <%= volunteerSelect %>
        </div>
        <div class="form-group">
            <label for="selectProjectRoleID">Role</label>
            <select name="ProjectRoleID" class="form-control" id="selectProjectRoleID"><%= projectRoleOptions %></select>
        </div>
        <div class="form-group">
            <label for="selectStatus">Status</label>
            <select name="Status" class="form-control" id="selectStatus"><%= statusOptions %></select>
        </div>
        <div class="form-group">
            <label for="txtAreaComments">Comments</label>
            <textarea name="Comments" class="form-control" id="txtAreaComments"></textarea>
        </div>
    </form>
</script>
<script id="newBudgetTemplate" type="text/template">
    <form name="newBudget">
        <input type="hidden" name="ProjectID" value="<%= ProjectID %>"/>
        <div class="form-group">
            <label for="selectBudgetSource">Budget Source</label>
            <select name="BudgetSource" class="form-control" id="selectBudgetSource"><%= budgetSourceOptions %></select>
        </div>
        <div class="form-group">
            <label for="inputBudgetAmount">Budget Amount</label>
            <input type="text" name="BudgetAmount" class="form-control" id="inputBudgetAmount" placeholder="Budget Amount"/>
        </div>
        <div class="form-group">
            <label for="selectStatus">Status</label>
            <select name="Status" class="form-control" id="selectStatus"><%= statusOptions %></select>
        </div>
        <div class="form-group">
            <label for="txtAreaComments">Comments</label>
            <textarea name="Comments" class="form-control" id="txtAreaComments"></textarea>
        </div>
    </form>
</script>
<script id="newContactTemplate" type="text/template">
    <form name="newContact">
        <input type="hidden" name="ProjectID" value="<%= ProjectID %>"/>
        <input type="hidden" name="SiteID" value="<%= SiteID %>"/>
        <div class="form-group">
            <label for="inputFirstName">First Name</label>
            <input type="text" name="FirstName" class="form-control" id="inputFirstName" placeholder="First Name"/>
        </div>
        <div class="form-group">
            <label for="inputLastName">Last Name</label>
            <input type="text" name="LastName" class="form-control" id="inputLastName" placeholder="Last Name"/>
        </div>
        <div class="form-group">
            <label for="inputTitle">Title</label>
            <input type="text" name="Title" class="form-control" id="inputTitle" placeholder="Title"/>
        </div>
        <div class="form-group">
            <label for="inputEmail">Email</label>
            <input type="text" name="Email" class="form-control" id="inputEmail" placeholder="Email"/>
        </div>
        <div class="form-group">
            <label for="inputPhone">Phone</label>
            <input type="text" name="Phone" class="form-control" id="inputPhone" placeholder="Phone"/>
        </div>
    </form>
</script>
<script id="newVolunteerTemplate" type="text/template">
    <form name="newVolunteer">
        <input type="hidden" name="ProjectID" value="<%= ProjectID %>"/>
        <div class="form-group">
            <label for="inputFirstName">First Name</label>
            <input type="text" name="FirstName" class="form-control" id="inputFirstName" placeholder="First Name"/>
        </div>
        <div class="form-group">
            <label for="inputLastName">Last Name</label>
            <input type="text" name="LastName" class="form-control" id="inputLastName" placeholder="Last Name"/>
        </div>
        <div class="form-group">
            <label for="inputMobilePhoneNumber">Mobile Phone Number</label>
            <input type="text" name="MobilePhoneNumber" class="form-control" id="inputMobilePhoneNumber" placeholder="Mobile Phone Number"/>
        </div>
        <div class="form-group">
            <label for="inputHomePhoneNumber">Home Phone Number</label>
            <input type="text" name="HomePhoneNumber" class="form-control" id="inputHomePhoneNumber" placeholder="Home Phone Number"/>
        </div>
        <div class="form-group">
            <label for="inputEmail">Email</label>
            <input type="text" name="Email" class="form-control" id="inputEmail" placeholder="Email"/>
        </div>
        <div class="form-group">
            <label for="inputPrimarySkill">PrimarySkill</label>
            <input type="text" name="PrimarySkill" class="form-control" id="inputPrimarySkill" placeholder="PrimarySkill"/>
        </div>
        <div class="form-group">
            <label for="inputStatus">Status</label>
            <input type="text" name="Status" class="form-control" id="inputStatus" placeholder="Status"/>
        </div>
        <div class="form-group">
            <label for="txtAreaComments">Comments</label>
            <textarea name="Comments" class="form-control" id="txtAreaComments"></textarea>
        </div>
        <div class="form-group">
            <label for="inputPreferredSiteID">PreferredSiteID</label>
            <input type="text" name="PreferredSiteID" class="form-control" id="inputPreferredSiteID" placeholder="PreferredSiteID"/>
        </div>
        <div class="form-group">
            <label for="inputDateSubmitted">Grove Date Submitted</label>
            <input type="text" name="DateSubmitted" class="form-control" id="inputDateSubmitted" placeholder="Grove Date Submitted"/>
        </div>
        <div class="form-group">
            <label for="inputDateModified">Grove Date Modified</label>
            <input type="text" name="DateModified" class="form-control" id="inputDateModified" placeholder="Grove Date Modified"/>
        </div>
        <div class="form-group">
            <label for="inputResponseID">Grove ResponseID</label>
            <input type="text" name="ResponseID" class="form-control" id="inputResponseID" placeholder="Grove ResponseID"/>
        </div>
        <div class="form-group">
            <label for="inputConfirmationCode">Grove Confirmation Code</label>
            <input type="text" name="ConfirmationCode" class="form-control" id="inputConfirmationCode" placeholder="Grove Confirmation Code"/>
        </div>
        <div class="form-group">
            <label for="inputIndividualID">Grove IndividualID</label>
            <input type="text" name="IndividualID" class="form-control" id="inputIndividualID" placeholder="Grove IndividualID"/>
        </div>
        <div class="form-group">
            <label for="inputEnteredFirstName">Grove EnteredFirstName</label>
            <input type="text" name="EnteredFirstName" class="form-control" id="inputEnteredFirstName" placeholder="Grove EnteredFirstName"/>
        </div>
        <div class="form-group">
            <label for="inputEnteredLastName">Grove EnteredLastName</label>
            <input type="text" name="EnteredLastName" class="form-control" id="inputEnteredLastName" placeholder="Grove EnteredLastName"/>
        </div>
        <div class="form-group">
            <label for="inputContactPhone">Contact Phone</label>
            <input type="text" name="ContactPhone" class="form-control" id="inputContactPhone" placeholder="Contact Phone"/>
        </div>
        <div class="form-group">
            <label for="inputAgeRange">Age Range</label>
            <input type="text" name="AgeRange" class="form-control" id="inputAgeRange" placeholder="AgeRange"/>
        </div>
        <div class="form-group">
            <label for="inputLG">Life Group</label>
            <input type="text" name="LG" class="form-control" id="inputLG" placeholder="Life Group"/>
        </div>
        <div class="form-group">
            <label for="inputFamily">Family</label>
            <input type="text" name="Family" class="form-control" id="inputFamily" placeholder="Family"/>
        </div>
        <div class="form-group">
            <label for="inputCFE">CFE</label>
            <input type="text" name="CFE" class="form-control" id="inputCFE" placeholder="CFE"/>
        </div>
        <div class="form-group">
            <label for="inputCFP">CFP</label>
            <input type="text" name="CFP" class="form-control" id="inputCFP" placeholder="CFP"/>
        </div>
        <div class="form-group">
            <label for="inputPainting">Painting</label>
            <input type="text" name="Painting" class="form-control" id="inputPainting" placeholder="Painting"/>
        </div>
        <div class="form-group">
            <label for="inputLandscaping">Landscaping</label>
            <input type="text" name="Landscaping" class="form-control" id="inputLandscaping" placeholder="Landscaping"/>
        </div>
        <div class="form-group">
            <label for="inputConstruction">Construction</label>
            <input type="text" name="Construction" class="form-control" id="inputConstruction" placeholder="Construction"/>
        </div>
        <div class="form-group">
            <label for="inputElectrical">Electrical</label>
            <input type="text" name="Electrical" class="form-control" id="inputElectrical" placeholder="Electrical"/>
        </div>
        <div class="form-group">
            <label for="inputCabinetryFinishWork">Cabinetry Finish Work</label>
            <input type="text" name="CabinetryFinishWork" class="form-control" id="inputCabinetryFinishWork" placeholder="CabinetryFinishWork"/>
        </div>
        <div class="form-group">
            <label for="inputPlumbing">Plumbing</label>
            <input type="text" name="Plumbing" class="form-control" id="inputPlumbing" placeholder="Plumbing"/>
        </div>
        <div class="form-group">
            <label for="inputNotesOnYourSkillAssessment">Notes On Your Skill Assessment</label>
            <input type="text" name="NotesOnYourSkillAssessment" class="form-control" id="inputNotesOnYourSkillAssessment" placeholder="Notes On Your Skill Assessment"/>
        </div>
        <div class="form-group">
            <label for="inputPhysicalRestrictions">Physical Restrictions</label>
            <input type="text" name="PhysicalRestrictions" class="form-control" id="inputPhysicalRestrictions" placeholder="Physical Restrictions"/>
        </div>
        <div class="form-group">
            <label for="inputSchoolPreference">School Preference</label>
            <input type="text" name="SchoolPreference" class="form-control" id="inputSchoolPreference" placeholder="School Preference"/>
        </div>
        <div class="form-group">
            <label for="inputEquipment">Equipment</label>
            <input type="text" name="Equipment" class="form-control" id="inputEquipment" placeholder="Equipment"/>
        </div>
        <div class="form-group">
            <label for="inputTeamLeaderWilling">Team Leader Willing</label>
            <input type="text" name="TeamLeaderWilling" class="form-control" id="inputTeamLeaderWilling" placeholder="Team Leader Willing"/>
        </div>
        <div class="form-group">
            <label for="inputChurch">Church</label>
            <input type="text" name="Church" class="form-control" id="inputChurch" placeholder="Church"/>
        </div>
        <div class="form-group">
            <label for="inputAssignmentInformationSendStatus">AssignmentInformationSendStatus</label>
            <input type="text" name="AssignmentInformationSendStatus" class="form-control" id="inputAssignmentInformationSendStatus" placeholder="AssignmentInformationSendStatus"/>
        </div>
    </form>
</script>
<script id="newProjectTemplate" type="text/template">
    <form name="newProject">
        <input type="hidden" name="SiteID" value="<%= SiteID %>"/>
        <input type="hidden" name="SiteStatusID" value="<%= SiteStatusID %>"/>
        <div class="form-group">
            <label for="inputActive">Active</label>
            <select name="Active" class="form-control" id="inputActive"><%= yesNoOptions %></select>
        </div>
        <div class="form-group">
            <label for="selectContactID">Contact</label>
            <%= contactSelect %>
        </div>
        <div class="form-group">
            <label for="inputSequenceNumber">Sequence Number</label>
            <input type="text" name="SequenceNumber" class="form-control" id="inputSequenceNumber" placeholder="If left blank, the sequence number will automatically be created. "
                   value="<%= testNumber %>"/>
        </div>
        <div class="form-group">
            <label for="inputOriginalRequest">Original Request</label>
            <textarea name="OriginalRequest" class="form-control" id="inputOriginalRequest" ><%= testString %></textarea>
        </div>
        <div class="form-group">
            <label for="inputProjectDescription">Project Description</label>
            <textarea name="ProjectDescription" class="form-control" id="inputProjectDescription" ><%= testString %></textarea>
        </div>
        <div class="form-group">
            <label for="inputComments">Comments</label>
            <textarea name="Comments" class="form-control" id="inputComments" ><%= testString %></textarea>
        </div>
        <div class="form-group">
            <label for="inputChildFriendly">Child Friendly</label>
            <select name="ChildFriendly" class="form-control" id="inputChildFriendly"><%= yesNoOptions %></select>
        </div>
        <div class="form-group">
            <label for="inputPrimarySkillNeeded">Primary Skill Needed</label>
            <select name="PrimarySkillNeeded" class="form-control" id="inputPrimarySkillNeeded"><%= primarySkillNeededOptions %></select>
        </div>
        <div class="form-group">
            <label for="inputVolunteersNeededEst">Volunteers Needed Est</label>
            <input type="text" name="VolunteersNeededEst" class="form-control" id="inputVolunteersNeededEst" placeholder="numbers only" value="<%= testNumber %>"/>
        </div>
        <div class="form-group">
            <label for="inputVolunteersAssigned">Volunteers Assigned</label>
            <input type="text" name="VolunteersAssigned" class="form-control" id="inputVolunteersAssigned" placeholder="numbers only" value="<%= testNumber %>"/>
        </div>
        <div class="form-group">
            <label for="inputStatus">Status</label>
            <select name="Status" class="form-control" id="inputStatus"><%= statusOptions %></select>
        </div>
        <div class="form-group">
            <label for="inputStatusReason">Status Reason</label>
            <textarea name="StatusReason" class="form-control" id="inputStatusReason" ><%= testString %></textarea>
        </div>
        <div class="form-group">
            <label for="inputMaterialsNeeded">Materials Needed</label>
            <input type="text" name="MaterialsNeeded" class="form-control" id="inputMaterialsNeeded" placeholder="Describe If Applicable" value="<%= testString %>"/>
        </div>
        <div class="form-group">
            <label for="inputEstimatedCost">Estimated Cost</label>
            <input type="text" name="EstimatedCost" class="form-control" id="inputEstimatedCost" placeholder="no $, numbers and decimal only. example: 10.00" value="<%= testFloat %>"/>
        </div>
        <div class="form-group">
            <label for="inputActualCost">Actual Cost</label>
            <input type="text" name="ActualCost" class="form-control" id="inputActualCost" placeholder="no $, numbers and decimal only. example: 10.00" value="<%= testFloat %>"/>
        </div>
        <div class="form-group">
            <label for="inputBudgetAvailableForPC">Budget Available For PC</label>
            <input type="text" name="BudgetAvailableForPC" class="form-control" id="inputBudgetAvailableForPC" placeholder="no $, numbers and decimal only. example: 10.00" value="<%= testFloat %>"/>
        </div>
        <div class="form-group">
            <label for="inputVolunteersLastYear">Volunteers Last Year</label>
            <input type="text" name="VolunteersLastYear" class="form-control" id="inputVolunteersLastYear" placeholder="numbers only" value="<%= testNumber %>"/>
        </div>
        <div class="form-group">
            <label for="inputNeedsToBeStartedEarly">Needs To Be Started Early</label>
            <select name="NeedsToBeStartedEarly" class="form-control" id="inputNeedsToBeStartedEarly"><%= yesNoOptions %></select>
        </div>
        <div class="form-group">
            <label for="inputPCSeeBeforeSIA">PC See Before SIA</label>
            <select name="PCSeeBeforeSIA" class="form-control" id="inputPCSeeBeforeSIA"><%= yesNoOptions %></select>
        </div>
        <div class="form-group">
            <label for="inputSpecialEquipmentNeeded">Special Equipment Needed</label>
            <input type="text" name="SpecialEquipmentNeeded" class="form-control" id="inputSpecialEquipmentNeeded" placeholder="Describe If Applicable" value="<%= testString %>"/>
        </div>
        <div class="form-group">
            <label for="inputPermitsOrApprovalsNeeded">Permits Or Approvals Needed</label>
            <input type="text" name="PermitsOrApprovalsNeeded" class="form-control" id="inputPermitsOrApprovalsNeeded" placeholder="Describe If Applicable" value="<%= testString %>"/>
        </div>
        <div class="form-group">
            <label for="inputPrepWorkRequiredBeforeSIA">Prep Work Required Before SIA</label>
            <input type="text" name="PrepWorkRequiredBeforeSIA" class="form-control" id="inputPrepWorkRequiredBeforeSIA" placeholder="Describe If Applicable" value="<%= testString %>"/>
        </div>
        <div class="form-group">
            <label for="inputSetupDayInstructions">Setup Day Instructions</label>
            <input type="text" name="SetupDayInstructions" class="form-control" id="inputSetupDayInstructions" value="<%= testString %>"/>
        </div>
        <div class="form-group">
            <label for="inputSIADayInstructions">SIA Day Instructions</label>
            <input type="text" name="SIADayInstructions" class="form-control" id="inputSIADayInstructions" placeholder="Describe If Applicable" value="<%= testString %>"/>
        </div>
        <div class="form-group">
            <label for="inputArea">Area</label>
            <input type="text" name="Area" class="form-control" id="inputArea" placeholder="Describe If Applicable" value="<%= testString %>"/>
        </div>
        <div class="form-group">
            <label for="inputPaintOrBarkEstimate">Paint Or Bark Estimate</label>
            <input type="text" name="PaintOrBarkEstimate" class="form-control" id="inputPaintOrBarkEstimate" placeholder="Describe If Applicable" value="<%= testString %>"/>
        </div>
        <div class="form-group">
            <label for="inputPaintAlreadyOnHand">Paint Already On Hand</label>
            <input type="text" name="PaintAlreadyOnHand" class="form-control" id="inputPaintAlreadyOnHand" placeholder="Describe If Applicable" value="<%= testString %>"/>
        </div>
        <div class="form-group">
            <label for="inputPaintOrdered">Paint Ordered</label>
            <input type="text" name="PaintOrdered" class="form-control" id="inputPaintOrdered" placeholder="Describe If Applicable" value="<%= testString %>"/>
        </div>
        <div class="form-group">
            <label for="inputCostEstimateDone">Cost Estimate Done</label>
            <select name="CostEstimateDone" class="form-control" id="inputCostEstimateDone"><%= yesNoOptions %></select>
        </div>
        <div class="form-group">
            <label for="inputMaterialListDone">Material List Done</label>
            <select name="MaterialListDone" class="form-control" id="inputMaterialListDone"><%= yesNoOptions %></select>
        </div>
        <div class="form-group">
            <label for="inputBudgetAllocationDone">Budget Allocation Done</label>
            <select name="BudgetAllocationDone" class="form-control" id="inputBudgetAllocationDone"><%= yesNoOptions %></select>
        </div>
        <div class="form-group">
            <label for="inputVolunteerAllocationDone">Volunteer Allocation Done</label>
            <select name="VolunteerAllocationDone" class="form-control" id="inputVolunteerAllocationDone"><%= yesNoOptions %></select>
        </div>
        <div class="form-group">
            <label for="inputNeedSIATShirtsForPC">Need SIA TShirts For PC</label>
            <select name="NeedSIATShirtsForPC" class="form-control" id="inputNeedSIATShirtsForPC"><%= yesNoOptions %></select>
        </div>
        <div class="form-group">
            <label for="inputProjectSend">Project Send Status</label>
            <select name="ProjectSend" class="form-control" id="inputProjectSend"><%= projectSendOptions %></select>
        </div>
        <div class="form-group">
            <label for="inputFinalCompletionStatus">Project Completed?</label>
            <select name="FinalCompletionStatus" class="form-control" id="inputFinalCompletionStatus"><%= yesNoOptions %></select>
        </div>
        <div class="form-group">
            <label for="inputFinalCompletionAssessment">Final Completion Assessment</label>
            <textarea name="FinalCompletionAssessment" class="form-control" id="inputFinalCompletionAssessment" ><%= testString %></textarea>
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
@endsection