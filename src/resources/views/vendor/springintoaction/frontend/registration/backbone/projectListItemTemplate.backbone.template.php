
<td>
    <div class="row">
        <div class="col-xs-7 col-lg-8 site-xs-col site-col"><%= SiteName %></div>
        <div class="col-xs-1 col-lg-1 skills-xs-col skills-col"><%= SkillsNeeded %></div>
        <div class="col-xs-1 col-lg-1 child-xs-col child-friendly-col"><%= ChildFriendly %></div>
        <div class="col-xs-1 col-lg-1 volunteers-xs-col volunteers-col"><span class="label label-default" title="# of People Needed" data-toggle="tooltip" data-placement="top" ><%= VolunteersNeeded %></span></div>
        <div class="col-xs-2 col-lg-1">
            <button data-project-id="<%= ProjectID %>" type="button" class="btnRegister btn btn-xs btn-primary pull-right">
                Register
            </button>
        </div>
    </div>
    <div class="row">
        <div class="col-xs-12 col-lg-11 description-col"><span class="project-description-label">Description:</span> <%= ProjectDescription %></div>
        <div class="hidden-xs hidden-sm hidden-md col-lg-1">&nbsp;</div>
    </div>
</td>

