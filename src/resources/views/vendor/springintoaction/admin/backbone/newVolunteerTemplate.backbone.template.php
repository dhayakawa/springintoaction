<form name="newVolunteer">
    <input name="Active" type="hidden" value="1" />
    <div class="form-group">
        <label for="inputFirstName">First Name</label>
        <input type="text" name="FirstName" class="form-control" id="inputFirstName" placeholder="First Name" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputLastName">Last Name</label>
        <input type="text" name="LastName" class="form-control" id="inputLastName" placeholder="Last Name" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputMobilePhoneNumber">Mobile Phone Number</label>
        <input type="text" name="MobilePhoneNumber" class="form-control" id="inputMobilePhoneNumber" placeholder="Mobile Phone Number" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputHomePhoneNumber">Home Phone Number</label>
        <input type="text" name="HomePhoneNumber" class="form-control" id="inputHomePhoneNumber" placeholder="Home Phone Number" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputEmail">Email</label>
        <input type="text" name="Email" class="form-control" id="inputEmail" placeholder="Email" value="<%= testEmail %>"/>
    </div>
    <div class="form-group">
        <label for="PrimarySkill">Primary Skill</label>
        <select name="PrimarySkill" class="form-control" id="PrimarySkill"><%= primarySkillOptions %></select>
    </div>
    <div class="form-group">
        <label for="iStatus">Status</label>
        <select name="Status" class="form-control" id="Status"><%= statusOptions %></select>
    </div>
    <div class="form-group">
        <label for="txtAreaComments">Comments</label>
        <textarea name="Comments" class="form-control" id="txtAreaComments"><%= testString %></textarea>
    </div>
    <div class="form-group">
        <label for="PreferredSiteID">Preferred Site</label>
        <%= siteSelect %>
    </div>
    <div class="form-group">
        <label for="inputContactPhone">Contact Phone</label>
        <input type="text" name="ContactPhone" class="form-control" id="inputContactPhone" placeholder="Contact Phone" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="AgeRange">Age Range</label>
        <select name="AgeRange[]" class="form-control" id="AgeRange" multiple><%= ageRangeOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputLG">Life Group</label>
        <input type="text" name="LG" class="form-control" id="inputLG" placeholder="Life Group" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputFamily">Family</label>
        <input type="text" name="Family" class="form-control" id="inputFamily" placeholder="Family" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputCFE">CFE</label>
        <input type="text" name="CFE" class="form-control" id="inputCFE" placeholder="CFE" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputCFP">CFP</label>
        <input type="text" name="CFP" class="form-control" id="inputCFP" placeholder="CFP" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="Painting">Painting</label>
        <select name="Painting" class="form-control" id="Painting"><%= skillLevelOptions %></select>
    </div>
    <div class="form-group">
        <label for="Landscaping">Landscaping</label>
        <select name="Landscaping" class="form-control" id="Landscaping"><%= skillLevelOptions %></select>
    </div>
    <div class="form-group">
        <label for="Construction">Construction</label>
        <select name="Construction" class="form-control" id="Construction"><%= skillLevelOptions %></select>
    </div>
    <div class="form-group">
        <label for="Electrical">Electrical</label>
        <select name="Electrical" class="form-control" id="Electrical"><%= skillLevelOptions %></select>
    </div>
    <div class="form-group">
        <label for="CabinetryFinishWork">Cabinetry Finish Work</label>
        <select name="CabinetryFinishWork" class="form-control" id="CabinetryFinishWork"><%= skillLevelOptions %></select>
    </div>
    <div class="form-group">
        <label for="Plumbing">Plumbing</label>
        <select name="Plumbing" class="form-control" id="Plumbing"><%= skillLevelOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputNotesOnYourSkillAssessment">Notes On Your Skill Assessment</label>
        <input type="text" name="NotesOnYourSkillAssessment" class="form-control" id="inputNotesOnYourSkillAssessment" placeholder="Notes On Your Skill Assessment" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputPhysicalRestrictions">Physical Restrictions</label>
        <input type="text" name="PhysicalRestrictions" class="form-control" id="inputPhysicalRestrictions" placeholder="Physical Restrictions" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="SchoolPreference">School Preference</label>
        <select name="SchoolPreference" class="form-control" id="SchoolPreference"><%= schoolPreferenceOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputEquipment">Equipment</label>
        <input type="text" name="Equipment" class="form-control" id="inputEquipment" placeholder="Equipment" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="TeamLeaderWilling">Team Leader Willing</label>
        <select name="TeamLeaderWilling" class="form-control" id="TeamLeaderWilling"><%= yesNoOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputChurch">Church</label>
        <input type="text" name="Church" class="form-control" id="inputChurch" placeholder="Church" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="AssignmentInformationSendStatus">AssignmentInformationSendStatus</label>
        <select name="AssignmentInformationSendStatus" class="form-control" id="AssignmentInformationSendStatus"><%= sendStatusOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputDateSubmitted">Grove Date Submitted</label>
        <input type="text" name="DateSubmitted" class="form-control" id="inputDateSubmitted" placeholder="Grove Date Submitted" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputDateModified">Grove Date Modified</label>
        <input type="text" name="DateModified" class="form-control" id="inputDateModified" placeholder="Grove Date Modified" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputResponseID">Grove ResponseID</label>
        <input type="text" name="ResponseID" class="form-control" id="inputResponseID" placeholder="Grove ResponseID" value="<%= testDBID %>"/>
    </div>
    <div class="form-group">
        <label for="inputConfirmationCode">Grove Confirmation Code</label>
        <input type="text" name="ConfirmationCode" class="form-control" id="inputConfirmationCode" placeholder="Grove Confirmation Code" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputIndividualID">Grove IndividualID</label>
        <input type="text" name="IndividualID" class="form-control" id="inputIndividualID" placeholder="Grove IndividualID" value="<%= testDBID %>"/>
    </div>
    <div class="form-group">
        <label for="inputEnteredFirstName">Grove EnteredFirstName</label>
        <input type="text" name="EnteredFirstName" class="form-control" id="inputEnteredFirstName" placeholder="Grove EnteredFirstName" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputEnteredLastName">Grove EnteredLastName</label>
        <input type="text" name="EnteredLastName" class="form-control" id="inputEnteredLastName" placeholder="Grove EnteredLastName" value="<%= testString %>"/>
    </div>
</form>
