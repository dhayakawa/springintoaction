<form name="newProjectContact">
    <input type="hidden" name="ProjectID" value="<%= ProjectID %>"/>
    <input type="hidden" name="SiteID" value="<%= SiteID %>"/>
    <div class="form-group">
        <label for="ContactID">Site Contact</label>
        <%= contactsSelect %>
    </div>
    <small>If the contact is not in this list, you will need to create a new contact in the Contacts Management panel.</small>
</form>
