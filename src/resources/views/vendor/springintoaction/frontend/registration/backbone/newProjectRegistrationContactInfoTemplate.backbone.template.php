<div class="row">
    <input type="hidden" name="contact_info[<%= idx %>][groveId]" value="<%= groveId %>" />
    <div class="col-xs-6">
        <div class="form-group">
            <label for="inputChurch<%= idx %>">Church</label>
            <select
                name="contact_info[<%= idx %>][Church]"
                class="form-control"
                id="Church<%= idx %>"
                required >
                <option>Choose Church</option>
                <option <% if(Church==='woodlands'){ print('selected'); } %> value="woodlands">Woodlands Church</option>
                <option <% if(Church==='highland'){ print('selected'); } %> value="highland">Highland Church</option>
                <option <% if(Church==='city_point'){ print('selected'); } %> value="city_point">City Point Church</option>
                <option <% if(Church==='hmong_alliance'){ print('selected'); } %> value="hmong_alliance">Hmong Alliance Church</option>
                <option <% if(Church==='other'){ print('selected'); } %> value="other">Other</option>
            </select>
        </div>
    </div>
    <div class="col-xs-6">
        <div style="display:none" class="form-group other-church-wrapper">
            <label for="inputChurchOther<%= idx %>">Other Church</label>
            <input type="text"
                   name="contact_info[<%= idx %>][ChurchOther]"
                   class="form-control"
                   id="ChurchOther<%= idx %>"
                   placeholder="Church"
                   value="<%= ChurchOther %>"/>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-xs-6">
        <div class="form-group">
            <label for="inputEmail<%= idx %>">Email</label>
            <input type="email"
                   name="contact_info[<%= idx %>][Email]"
                   class="form-control"
                   id="inputEmail<%= idx %>"
                   placeholder="Email"
                   required
                   value="<%= Email %>"/>
        </div>
    </div>
    <div class="col-xs-6">
        <div class="form-group">
            <label for="inputMobilePhoneNumber<%= idx %>">Mobile Phone Number</label>
            <input type="tel"
                   name="contact_info[<%= idx %>][MobilePhoneNumber]"
                   class="form-control"
                   id="inputMobilePhoneNumber<%= idx %>"
                   placeholder="Mobile Phone Number"
                   required
                   value="<%= MobilePhoneNumber %>"/>
        </div>
    </div>
</div>
<div class="row">
    <div class="col-xs-6">
        <div class="form-group">
            <label for="inputFirstName<%= idx %>">First Name</label>
            <input type="name"
                   name="contact_info[<%= idx %>][FirstName]"
                   class="form-control"
                   id="inputFirstName<%= idx %>"
                   placeholder="First Name"
                   required
                   value="<%= FirstName %>"/>
        </div>
    </div>
    <div class="col-xs-6">
        <div class="form-group">
            <label for="inputLastName<%= idx %>">Last Name</label>
            <input type="name"
                   name="contact_info[<%= idx %>][LastName]"
                   class="form-control"
                   id="inputLastName<%= idx %>"
                   placeholder="Last Name"
                   required
                   value="<%= LastName %>"/>
        </div>
    </div>
</div>
<div class="row team-leader-willing hidden">
    <div class="col-xs-12">
        <div class="checkbox">
            <label for="inputTeamLeaderWilling<%= idx %>"><input type="checkbox"
                    name="contact_info[<%= idx %>][TeamLeaderWilling]"
                    id="inputTeamLeaderWilling<%= idx %>"
                    value="1"/> I would be willing to be a team leader if needed.</label>
        </div>
    </div>
</div>

