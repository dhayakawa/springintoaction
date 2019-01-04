<div class="pull-right projects-pagination-controls"></div>
<button id="btnAddProject" type="button" class="btn btn-xs btn-primary">Add Project</button>
<button id="btnEditProject" type="button" class="btn btn-xs btn-primary">Edit Project</button>
<button id="btnDeleteCheckedProjects" type="button" class="disabled btn btn-xs btn-danger">Delete Chosen Projects</button>
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
    <input type="hidden" value="" name="projects_import" id="file_projects_import"/>

</div>
