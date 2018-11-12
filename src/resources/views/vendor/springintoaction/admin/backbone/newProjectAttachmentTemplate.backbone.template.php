<form name="newProjectAttachment">
    <input type="hidden" name="ProjectID" value="<%= ProjectID %>"/>
    <div class="form-group">
        <label for="ProjectAttachments">Upload Photos of Project Examples</label>
        <!-- The fileinput-button span is used to style the file input field as button -->
        <span class="btn btn-success fileinput-button">
        <i class="glyphicon glyphicon-plus"></i>
        <span>Select files...</span>
            <!-- The file input field used as target for the file upload widget -->
        <input id="fileupload" type="file" name="files[]" aria-label="Upload file" multiple>
    </span>
        <br>
        <br>
        <!-- The global progress bar -->
        <div id="progress" class="progress">
            <div class="progress-bar progress-bar-success"></div>
        </div>
        <!-- The container for the uploaded files -->
        <div id="files" class="files"></div>
        <small class="form-text text-muted">If you have multiple attachments, please choose them all at once.</small>
    </div>
    or
    <div class="form-group">
        <label for="AttachmentPath">Attachment Urls</label>
        <textarea name="AttachmentPath" class="form-control" id="AttachmentPath"></textarea>
        <small>** Only 1 url per line.</small>
        <small>Example url: https://simple.wikipedia.org/wiki/Mushroom#/media/File:Mushroom_02.jpg</small>
    </div>

</form>
