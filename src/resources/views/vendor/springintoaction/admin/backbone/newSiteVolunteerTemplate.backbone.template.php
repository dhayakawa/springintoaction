<form name="newSiteVolunteer">
    <input type="hidden" name="SiteStatusID" value="<%= SiteStatusID %>"/>
    <div class="form-group">
        <label for="selectVolunteerID">Volunteer</label>
        <%= volunteerSelect %>
    </div>
    <div class="form-group">
        <label for="selectSiteRoleID">Role</label>
        <select name="SiteRoleID" class="form-control" id="selectSiteRoleID"><%= siteRoleOptions %></select>
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
