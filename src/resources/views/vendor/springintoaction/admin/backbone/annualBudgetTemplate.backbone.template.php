<form name="annualbudget">
    <strong>Woodlands Annual Budget</strong>&nbsp;
    <input type="hidden" name="AnnualBudgetID" value="<%= annualBudgetID %>"/>
    <input name="BudgetAmount" value="<%= budgetAmount %>"/>
    <input type="hidden" name="Year" value="<%= year %>"/>
    <button type="button" class="btnUpdate btn btn-xs btn-primary">Update</button>
    <button type="button" class="btnRefreshTotals btn btn-xs btn-secondary">Refresh Totals</button>
</form>
