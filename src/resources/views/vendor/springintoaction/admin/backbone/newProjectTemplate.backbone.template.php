<form name="newProject">
    <input type="hidden" name="SiteID" value="<%= SiteID %>"/>
    <input type="hidden" name="SiteStatusID" value="<%= SiteStatusID %>"/>
    <div class="form-group">
        <label for="inputActive">Active</label>
        <select name="Active" class="form-control" id="inputActive"><%= yesNoIsActiveOptions %></select>
    </div>
    <div class="form-group">
        <label for="selectContactID">Contact</label>
        <%= contactSelect %>
    </div>
    <div class="form-group">
        <label for="inputSequenceNumber">Project ID</label>
        <input type="text" readonly name="SequenceNumber" class="form-control" id="inputSequenceNumber"
               value="<%= SequenceNumber %>"/>
    </div>
    <div class="form-group">
        <label for="inputOriginalRequest">Original Request</label>
        <textarea name="OriginalRequest" class="form-control" id="inputOriginalRequest"><%= testString %></textarea>
    </div>
    <div class="form-group">
        <label for="inputProjectDescription">Project Description</label>
        <textarea name="ProjectDescription" class="form-control" id="inputProjectDescription"><%= testString %></textarea>
    </div>
    <div class="form-group">
        <label for="inputComments">Comments</label>
        <textarea name="Comments" class="form-control" id="inputComments"><%= testString %></textarea>
    </div>
    <div class="form-group">
        <label for="inputChildFriendly">Child Friendly</label>
        <select name="ChildFriendly" class="form-control" id="inputChildFriendly"><%= yesNoOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputPrimarySkillNeeded">Primary Skill Needed</label>
        <select name="PrimarySkillNeeded" class="form-control" id="inputPrimarySkillNeeded"><%= primarySkillNeededOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputVolunteersNeededEst">Volunteers Needed Est</label>
        <input type="text" name="VolunteersNeededEst" class="form-control" id="inputVolunteersNeededEst" placeholder="numbers only" value="<%= testNumber %>"/>
    </div>
    <div class="form-group">
        <label for="inputVolunteersAssigned">Volunteers Assigned</label>
        <input type="text" name="VolunteersAssigned" class="form-control" id="inputVolunteersAssigned" placeholder="numbers only" value="<%= testNumber %>"/>
    </div>
    <div class="form-group">
        <label for="inputStatus">Status</label>
        <select name="Status" class="form-control" id="inputStatus"><%= statusOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputStatusReason">Status Reason</label>
        <textarea name="StatusReason" class="form-control" id="inputStatusReason"><%= testString %></textarea>
    </div>
    <div class="form-group">
        <label for="inputMaterialsNeeded">Materials Needed</label>
        <input type="text" name="MaterialsNeeded" class="form-control" id="inputMaterialsNeeded" placeholder="Describe If Applicable" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputEstimatedCost">Estimated Cost</label>
        <input type="text" name="EstimatedCost" class="form-control" id="inputEstimatedCost" placeholder="no $, numbers and decimal only. example: 10.00" value="<%= testFloat %>"/>
    </div>
    <div class="form-group">
        <label for="inputActualCost">Actual Cost</label>
        <input type="text" name="ActualCost" class="form-control" id="inputActualCost" placeholder="no $, numbers and decimal only. example: 10.00" value="<%= testFloat %>"/>
    </div>
    <div class="form-group">
        <label for="inputBudgetAvailableForPC">Budget Available For PC</label>
        <input type="text" name="BudgetAvailableForPC" class="form-control" id="inputBudgetAvailableForPC" placeholder="no $, numbers and decimal only. example: 10.00" value="<%= testFloat %>"/>
    </div>
    <div class="form-group">
        <label for="inputVolunteersLastYear">Volunteers Last Year</label>
        <input type="text" name="VolunteersLastYear" class="form-control" id="inputVolunteersLastYear" placeholder="numbers only" value="<%= testNumber %>"/>
    </div>
    <div class="form-group">
        <label for="inputNeedsToBeStartedEarly">Needs To Be Started Early</label>
        <select name="NeedsToBeStartedEarly" class="form-control" id="inputNeedsToBeStartedEarly"><%= yesNoOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputPCSeeBeforeSIA">PC See Before SIA</label>
        <select name="PCSeeBeforeSIA" class="form-control" id="inputPCSeeBeforeSIA"><%= yesNoOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputSpecialEquipmentNeeded">Special Equipment Needed</label>
        <input type="text" name="SpecialEquipmentNeeded" class="form-control" id="inputSpecialEquipmentNeeded" placeholder="Describe If Applicable" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputPermitsOrApprovalsNeeded">Permits Or Approvals Needed</label>
        <input type="text" name="PermitsOrApprovalsNeeded" class="form-control" id="inputPermitsOrApprovalsNeeded" placeholder="Describe If Applicable" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputPrepWorkRequiredBeforeSIA">Prep Work Required Before SIA</label>
        <input type="text" name="PrepWorkRequiredBeforeSIA" class="form-control" id="inputPrepWorkRequiredBeforeSIA" placeholder="Describe If Applicable" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputSetupDayInstructions">Setup Day Instructions</label>
        <input type="text" name="SetupDayInstructions" class="form-control" id="inputSetupDayInstructions" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputSIADayInstructions">SIA Day Instructions</label>
        <input type="text" name="SIADayInstructions" class="form-control" id="inputSIADayInstructions" placeholder="Describe If Applicable" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputArea">Area</label>
        <input type="text" name="Area" class="form-control" id="inputArea" placeholder="Describe If Applicable" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputPaintOrBarkEstimate">Paint Or Bark Estimate</label>
        <input type="text" name="PaintOrBarkEstimate" class="form-control" id="inputPaintOrBarkEstimate" placeholder="Describe If Applicable" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputPaintAlreadyOnHand">Paint Already On Hand</label>
        <input type="text" name="PaintAlreadyOnHand" class="form-control" id="inputPaintAlreadyOnHand" placeholder="Describe If Applicable" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputPaintOrdered">Paint Ordered</label>
        <input type="text" name="PaintOrdered" class="form-control" id="inputPaintOrdered" placeholder="Describe If Applicable" value="<%= testString %>"/>
    </div>
    <div class="form-group">
        <label for="inputCostEstimateDone">Cost Estimate Done</label>
        <select name="CostEstimateDone" class="form-control" id="inputCostEstimateDone"><%= yesNoOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputMaterialListDone">Material List Done</label>
        <select name="MaterialListDone" class="form-control" id="inputMaterialListDone"><%= yesNoOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputBudgetAllocationDone">Budget Allocation Done</label>
        <select name="BudgetAllocationDone" class="form-control" id="inputBudgetAllocationDone"><%= yesNoOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputVolunteerAllocationDone">Volunteer Allocation Done</label>
        <select name="VolunteerAllocationDone" class="form-control" id="inputVolunteerAllocationDone"><%= yesNoOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputNeedSIATShirtsForPC">Need SIA TShirts For PC</label>
        <select name="NeedSIATShirtsForPC" class="form-control" id="inputNeedSIATShirtsForPC"><%= yesNoOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputProjectSend">Project Send Status</label>
        <select name="ProjectSend" class="form-control" id="inputProjectSend"><%= projectSendOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputFinalCompletionStatus">Project Completed?</label>
        <select name="FinalCompletionStatus" class="form-control" id="inputFinalCompletionStatus"><%= yesNoOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputFinalCompletionAssessment">Final Completion Assessment</label>
        <textarea name="FinalCompletionAssessment" class="form-control" id="inputFinalCompletionAssessment"><%= testString %></textarea>
    </div>
</form>
