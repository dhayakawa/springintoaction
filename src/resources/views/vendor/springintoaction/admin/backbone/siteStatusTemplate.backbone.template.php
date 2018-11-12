<form id="siteStatus" action="">
    <input type="hidden" name="SiteStatusID" id="inputSiteStatusID" value="<%= SiteStatusID %>"/>
    <input type="hidden" name="Year" id="inputSiteStatusYear" value="<%= Year %>"/>
    <div class="form-group">
        <label class="checkbox-inline">
            <input type="checkbox" <%= ProjectDescriptionCompleteIsChecked %> name="ProjectDescriptionComplete" id="ProjectDescriptionComplete" <%= disabled %> value="1"> Project Description Complete
        </label>
        <label class="checkbox-inline">
            <input type="checkbox" <%= BudgetEstimationCompleteIsChecked %> name="BudgetEstimationComplete" id="BudgetEstimationComplete" <%= disabled %> value="1"> Budget Estimation Complete
        </label>
        <br/>
        <label class="checkbox-inline">
            <input type="checkbox" <%= VolunteerEstimationCompleteIsChecked %> name="VolunteerEstimationComplete" id="VolunteerEstimationComplete" <%= disabled %> value="1"> Volunteer Estimation Complete
        </label>
        <label class="checkbox-inline">
            <input type="checkbox" <%= VolunteerAssignmentCompleteIsChecked %> name="VolunteerAssignmentComplete" id="VolunteerAssignmentComplete" <%= disabled %> value="1"> Volunteer Assignment Complete
        </label>
        <br/>
        <label class="checkbox-inline">
            <input type="checkbox" <%= BudgetActualCompleteIsChecked %> name="BudgetActualComplete" id="BudgetActualComplete" <%= disabled %> value="1"> Budget Actual Complete
        </label>
    </div>
    <div class="form-group">
        <label for="inputBudgetActualComplete">Estimation Comments</label>
        <input type="text" name="EstimationComments" id="inputBudgetActualComplete" class="form-control" placeholder="Estimation Comments" <%= disabled %> value="<%= EstimationComments %>"/>
    </div>
</form>
