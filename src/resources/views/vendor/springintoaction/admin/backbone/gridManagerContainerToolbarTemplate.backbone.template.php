<div class="pull-right pagination-controls"></div>
<button type="button" class="btnAdd btn btn-xs btn-primary">Add <%= modelName %></button>
<button type="button" class="disabled btnDeleteChecked btn btn-xs btn-danger">Delete Chosen <%= modelName %>s</button>
<button type="button" class="btnClearStored btn btn-xs btn-default">Reset Columns</button>
<div class="file-upload-container">
    <span class="pull-right file_chosen"></span>
    <div class="btn btn-xs btn-default file-upload">
        <input class="file-input" type="file" value="" name="import"/>
        <i class="fa fa-plus"></i> Choose <%= modelName %>s CSV File For Import
    </div>
    <div class="pull-left file_progress progress">
            <span class="meter" style="width:0%;">
                <p class="percent">&nbsp;</p>
            </span>
    </div>
    <input type="hidden" value="" name="import" class="file_import"/>

</div>
