<form name="newProjectAttachment">
    <input type="hidden" name="ProjectID" value="<%= ProjectID %>"/>
    <div class="file-upload-container">
        <span class="pull-right file_chosen"></span>
        <div class="btn btn-xs btn-default file-upload">
            <input class="file-input" type="file" value="" name="project_attachment"/>
            <i class="fa fa-plus"></i> Choose File
        </div>
        <div class="pull-left file_progress progress">
            <span class="meter" style="width:0%;">
                <p class="percent">&nbsp;</p>
            </span>
        </div>
        <input type="hidden" value="" class="files" name="AttachmentPath"/>

    </div>
    <script type="text/javascript">

    </script>
</form>
