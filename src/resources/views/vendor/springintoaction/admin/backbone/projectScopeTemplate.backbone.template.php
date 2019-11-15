<% /*console.log(project)/**/ %>
<div class="col-md-6">
    <form name="projectScope">
        <input type="hidden" name="ProjectID" value="<%= project.get('ProjectID') %>"/>
        <input type="hidden" name="SiteID" value="<%= SiteID %>"/>
        <input type="hidden" name="SiteStatusID" value="<%= project.get('SiteStatusID') %>"/>
        <div class="form-group">
            <label for="inputSequenceNumber">Project ID</label>
            <input type="text" readonly name="SequenceNumber" class="form-control" id="inputSequenceNumber"
                value="<%= project.get('SequenceNumber') %>"/>
        </div>
        <div class="form-group">
            <label for="inputActive">Active</label>
            <div class="admin__actions-switch" data-role="switcher">
                <input name="Active" id="inputActive" class="admin__actions-switch-checkbox" type="checkbox">
                <label class="admin__actions-switch-label">
                    <span class="admin__actions-switch-text">No</span>
                </label>
            </div>
        </div>
        <div data-project-type class="form-group">
            <label for="project_type">Project Type / Primary Skills Needed</label>
            <div class="project-type-checkbox-list-wrapper">
                <%= projectTypeCheckboxList %>
            </div>
        </div>
        <div class="form-group">
            <label for="selectContactID">Contact</label>
            <%= contactSelect %>
        </div>

        <div class="form-group">
            <label for="inputOriginalRequest">Original Request</label>
            <textarea rows="5" name="OriginalRequest" class="form-control" id="inputOriginalRequest"><%= project.get('OriginalRequest') %></textarea>
        </div>
        <div class="form-group">
            <label for="inputProjectDescription">Project Description</label>
            <input maxlength="150" type="text" name="ProjectDescription" class="form-control" id="inputProjectDescription" value="<%= project.get('ProjectDescription') %>"/>
            <p class="help-block">This description will be the one on the registration page. There is a 150 character max. Try to keep it short and simple. Do not add comments that are not applicable to registration.</p>
        </div>
        <div class="form-group">
            <label for="inputComments">Additional Notes</label>
            <textarea rows="5" name="Comments" class="form-control" id="inputComments"><%= project.get('Comments') %></textarea></div>
    </form>
</div>
