<form name="newBudget">
    <input type="hidden" name="ProjectID" value="<%= ProjectID %>"/>
    <div class="form-group">
        <label for="selectBudgetSource">Budget Source</label>
        <select name="BudgetSource" class="form-control" id="selectBudgetSource"><%= budgetSourceOptions %></select>
    </div>
    <div class="form-group">
        <label for="inputBudgetAmount">Budget Amount</label>
        <input type="text" name="BudgetAmount" class="form-control" id="inputBudgetAmount" placeholder="Budget Amount"/>
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
