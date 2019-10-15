<form name="newContact">
    <input name="Active" type="hidden" value="1"/>
    <div class="form-group">
        <label for="selectSite">Site</label>
        <%= siteSelect %>
    </div>
    <div class="form-group">
        <label for="inputFirstName">First Name</label>
        <input type="text" name="FirstName" class="form-control" id="inputFirstName" placeholder="First Name"/>
    </div>
    <div class="form-group">
        <label for="inputLastName">Last Name</label>
        <input type="text" name="LastName" class="form-control" id="inputLastName" placeholder="Last Name"/>
    </div>
    <div class="form-group">
        <label for="inputTitle">Title</label>
        <input type="text" name="Title" class="form-control" id="inputTitle" placeholder="Title"/>
    </div>
    <div class="form-group">
        <label for="ContactType">Contact Type</label>
        <input type="text" name="ContactType" class="form-control" id="ContactType" placeholder="ContactType"/>
    </div>
    <div class="form-group">
        <label for="inputEmail">Email</label>
        <input type="text" name="Email" class="form-control" id="inputEmail" placeholder="Email"/>
    </div>
    <div class="form-group">
        <label for="inputPhone">Phone</label>
        <input type="text" name="Phone" class="form-control" id="inputPhone" placeholder="Phone"/>
    </div>
</form>
