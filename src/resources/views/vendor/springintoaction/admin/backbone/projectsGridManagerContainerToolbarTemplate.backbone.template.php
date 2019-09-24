<div class="pull-right projects-pagination-controls pagination-controls"></div>
<button id="btnAddProject" type="button" class="btn-add-model btn btn-xs btn-primary">Add Project</button>
<button id="btnEditProject" type="button" class="btn-edit-model btn btn-xs btn-primary">Edit Project</button>
<button id="btnDeleteCheckedProjects" type="button" class="btn-delete-checked-models disabled btn btn-xs btn-danger">Delete Chosen Projects</button>
<button id="btnClearStored" type="button" class="btn-reset-columns btn btn-xs btn-default">Reset Columns</button>
<div class="file-upload-container">
    <span class="pull-right file_chosen"></span>
    <div class="btn btn-xs btn-default file-upload">
        <input class="file-input" type="file" value="" name="import"/>
        <i class="fa fa-plus"></i> Choose Project CSV File For Import
    </div>
    <div class="pull-left file_progress progress">
            <span class="meter" style="width:0%;">
                <p class="percent">&nbsp;</p>
            </span>
    </div>
    <input type="hidden" value="" name="import" class="file_import"/>
</div>
<div class="columnmanager-visibilitycontrol-container"></div>
