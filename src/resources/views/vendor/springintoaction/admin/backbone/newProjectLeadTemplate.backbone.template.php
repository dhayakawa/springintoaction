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
