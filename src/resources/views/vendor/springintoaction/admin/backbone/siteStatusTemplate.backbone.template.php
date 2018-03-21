<form id="siteStatus" action="">
    <input type="hidden" name="SiteStatusID" id="inputSiteStatusID" value="<%= SiteStatusID %>"/>
    <input type="hidden" name="Year" id="inputSiteStatusYear" value="<%= Year %>"/>
    <div class="form-group">
        <label class="checkbox-inline">
            <input type="checkbox" <%= ProjectDescriptionCompleteIsChecked %> name="ProjectDescriptionComplete" id="ProjectDescriptionComplete" value="1"> Project Description Complete
        </label>
        <label class="checkbox-inline">
            <input type="checkbox" <%= BudgetEstimationCompleteIsChecked %> name="BudgetEstimationComplete" id="BudgetEstimationComplete" value="1"> Budget Estimation Complete
        </label>
        <br/>
        <label class="checkbox-inline">
            <input type="checkbox" <%= VolunteerEstimationCompleteIsChecked %> name="VolunteerEstimationComplete" id="VolunteerEstimationComplete" value="1"> Volunteer Estimation Complete
        </label>
        <label class="checkbox-inline">
            <input type="checkbox" <%= VolunteerAssignmentCompleteIsChecked %> name="VolunteerAssignmentComplete" id="VolunteerAssignmentComplete" value="1"> Volunteer Assignment Complete
        </label>
        <br/>
        <label class="checkbox-inline">
            <input type="checkbox" <%= BudgetActualCompleteIsChecked %> name="BudgetActualComplete" id="BudgetActualComplete" value="1"> Budget Actual Complete
        </label>
    </div>
    <div class="form-group">
        <label for="inputBudgetActualComplete">Estimation Comments</label>
        <input type="text" name="EstimationComments" id="inputBudgetActualComplete" class="form-control" placeholder="Estimation Comments" value="<%= EstimationComments %>"/>
    </div>
</form>
