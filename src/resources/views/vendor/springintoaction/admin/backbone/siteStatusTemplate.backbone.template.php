<form id="siteStatus" action="">
    <input type="hidden" name="SiteStatusID" id="inputSiteStatusID" value="<%= SiteStatusID %>"/>
    <input type="hidden" name="Year" id="inputSiteStatusYear" value="<%= Year %>"/>
    <% if(typeof statusAlertClass === 'undefined') { statusAlertClass = '';} %>
    <div class="row">
        <div class="col-xs-12 col-lg-5">
            <div class="form-group">
                <div class="checkbox">
                    <label class="<%= statusAlertClass %>">
                        <input type="checkbox" <%= ProjectDescriptionCompleteIsChecked %>
                        name="ProjectDescriptionComplete"
                        id="ProjectDescriptionComplete" <%= disabled %> value="1"/> Project Descriptions Completed
                    </label>
                </div>
            </div>
            <div class="form-group">
                <div class="checkbox">
                    <label class="<%= statusAlertClass %>">
                        <input type="checkbox" <%= BudgetEstimationCompleteIsChecked %> name="BudgetEstimationComplete"
                        id="BudgetEstimationComplete" <%= disabled %> value="1"/> Budget Estimations Completed
                    </label>
                </div>
            </div>
            <div class="form-group">
                <div class="checkbox">
                    <label class="<%= statusAlertClass %>">
                        <input type="checkbox" <%= VolunteerEstimationCompleteIsChecked %>
                        name="VolunteerEstimationComplete"
                        id="VolunteerEstimationComplete" <%= disabled %> value="1"/> Volunteer Estimations Completed
                    </label>
                </div>
            </div>
            <div class="form-group">
                <div class="checkbox">
                    <label class="<%= statusAlertClass %>">
                        <input type="checkbox" <%= VolunteerAssignmentCompleteIsChecked %>
                        name="VolunteerAssignmentComplete"
                        id="VolunteerAssignmentComplete" <%= disabled %> value="1"/> Volunteer Assignments Completed
                    </label>
                </div>
            </div>
            <div class="form-group">
                <div class="checkbox">
                    <label class="<%= statusAlertClass %>">
                        <input type="checkbox" <%= BudgetActualCompleteIsChecked %> name="BudgetActualComplete"
                        id="BudgetActualComplete" <%= disabled %> value="1"/> Budget Actuals Completed
                    </label>
                </div>
            </div>
        </div>
        <div class="col-xs-12 col-lg-7">
            <div class="form-group">
                <label for="EstimationComments">Estimation Comments</label>
                <textarea
                <%= disabled %>
                name="EstimationComments"
                id="EstimationComments"
                class="form-control"
                placeholder="Estimation Comments"><%= EstimationComments %></textarea>
            </div>
        </div>
    </div>
</form>

