<div class="box-header with-border">
    <h3 class="box-title project-management">Project Management:&nbsp;</h3>
    <select id="sites" class="site-management-selects form-control input-sm inline"></select>
    <select id="site_years" class="site-management-selects form-control input-sm inline"></select>

    <div class="pull-right">
        <a href="#" class="btn btn-box-tool close-view"><i class="fa fa-times"></i></a>
    </div>
</div>
<div class="box-body">
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
            <div class="nested-box site-projects-tabs-view collapsed-box">
                <div class="box-header with-border">
                    <h3 class="box-title">Project Details:
                        <small></small>
                    </h3>
                </div>
                <div class="box-body">
                    <!-- Nav tabs -->
                    <ul class="nav nav-tabs" role="tablist">
                        <li role="presentation" class="active"><a href="#project_lead" aria-controls="project_lead" role="tab" data-toggle="tab">Project Team Leaders</a></li>
                        <li role="presentation"><a href="#project_budget" aria-controls="project_budget" role="tab" data-toggle="tab">Budget Allocation</a></li>
                        <li role="presentation"><a href="#project_contact" aria-controls="project_contact" role="tab" data-toggle="tab">Project Site Contacts</a></li>
                        <li role="presentation"><a href="#project_volunteer" aria-controls="project_volunteer" role="tab" data-toggle="tab">Volunteers</a></li>
                        <li role="presentation"><a href="#project_attachment" aria-controls="project_attachment" role="tab" data-toggle="tab">Attachments</a></li>
                    </ul>

                    <!-- Tab panes -->
                    <div class="tabs-content-container">
                        <div class="tab-content backgrid-wrapper">
                            <div role="tabpanel" class="tab-pane active" id="project_lead">
                                <div class="project-leads-backgrid-wrapper"></div>
                            </div>
                            <div role="tabpanel" class="tab-pane" id="project_budget">
                                <div class="project-budgets-backgrid-wrapper"></div>
                            </div>
                            <div role="tabpanel" class="tab-pane" id="project_contact">
                                <div class="project-contacts-backgrid-wrapper"></div>
                            </div>
                            <div role="tabpanel" class="tab-pane" id="project_volunteer">
                                <div class="project-volunteers-backgrid-wrapper"></div>
                            </div>
                            <div role="tabpanel" class="tab-pane" id="project_attachment">
                                <div class="project-attachments-backgrid-wrapper"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="box-footer">
                    <div class="project-tabs-grid-manager-container grid-manager-container"></div>
                </div>
            </div>
        </div>
    </div>
</div>
