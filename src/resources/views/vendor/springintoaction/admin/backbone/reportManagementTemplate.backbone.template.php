<div class="box-header with-border">
    <h3 class="box-title <%= modelNameLabelLowerCase %>s-management"><%= modelNameLabel %>:&nbsp;</h3>
    <select id="sites" class="site-management-selects form-control input-sm inline"></select>
    <select id="site_years" class="site-management-selects form-control input-sm inline"></select>
    <span class="project-dropdown">&nbsp;Project ID:&nbsp;
        <select id="projects" class="site-management-selects form-control input-sm inline"></select>
    </span>
    <a class="report-download download-pdf" target="_blank" href="">download pdf</a>
    <a class="report-download download-csv" target="_blank" href="">download csv</a>
    <a class="report-download download-spreadsheet" target="_blank" href="">download spreadsheet</a>
    <div class="pull-right">
        <a href="#" class="btn btn-box-tool close-view"><i class="fa fa-times"></i></a>
    </div>
</div>
<div class="box-body">
    <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <div class="report-wrapper"></div>
        </div>
    </div>
</div>
<div class="box-footer"></div>
