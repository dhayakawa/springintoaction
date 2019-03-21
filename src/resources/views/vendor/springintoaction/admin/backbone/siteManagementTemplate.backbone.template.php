<div class="box-header with-border">
    <h3 class="box-title site-management">Site Management:&nbsp;</h3>
    <select id="sites" class="site-management-selects form-control input-sm inline"></select>
    <select id="site_years" class="site-management-selects form-control input-sm inline"></select>
    &nbsp;
    <button id="btnAddSite" type="button" class="btn btn-sm btn-primary">Add Site</button>
    &nbsp;
    <button id="btnDeleteSite" type="button" class="btn btn-sm btn-danger">Delete Site</button>
    <div class="pull-right">
        <a href="#" class="btn btn-box-tool"><i class="fa fa-times"></i></a>
    </div>
</div>
<div class="box-body">
    <div class="row">
        <div class="col-xs-6 col-lg-4">
            <div id="site-well" class="well well-sm collapse in">
                <div class="row">
                    <div class="site-view col-xs-12"></div>
                </div>
                <div class="site-create-toolbar" style="display:none">
                    <button id="btnSaveNewSite" type="button" class="btn btn-success">Save New Site</button>
                    <button id="btnCancelNewSite" type="button" class="btn btn-default">Cancel</button>
                </div>
            </div>
        </div>
        <div class="col-xs-6 col-lg-8">
            <div id="site-status-well" class="well well-sm collapse in">
                <h4 class="well-title">Site Statuses</h4>
                <div class="row">
                    <div class="site-status-view col-xs-12"></div>
                </div>
            </div>
        </div>
    </div>
    <div id="site-volunteers-well" class="well well-sm collapse in">
        <h4 class="well-title">Site Team Leaders</h4>
        <div class="row">
            <div class="site-volunteers-view col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <div class="site-volunteers-backgrid-wrapper backgrid-wrapper"></div>
            </div>
            <div class="site-volunteers-grid-manager-container grid-manager-container col-xs-12 col-sm-12 col-md-12 col-lg-12">

            </div>
        </div>
    </div>
</div>
