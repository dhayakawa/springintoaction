<% /*console.log(model)*/ %>
<div class="col-sm-12">
    <h3 class="site-name"><%= model.SiteName %></h3>
    <table class="table site-status">
        <thead>
        <tr>
            <th>Project Description Complete</th>
            <th>Budget Estimation Complete</th>
            <th>Budget Actual Complete</th>
            <th>Volunteer Estimation Complete</th>
            <th>Volunteer Assignment Complete</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td><i class="fa fa-circle <%= model.ProjectDescriptionComplete === '1' ? 'text-success' : 'text-danger' %>"></i></td>
            <td><i class="fa fa-circle <%= model.BudgetEstimationComplete === '1' ? 'text-success' : 'text-danger' %>"></i></td>
            <td><i class="fa fa-circle <%= model.BudgetActualComplete === '1' ? 'text-success' : 'text-danger' %>"></i></td>
            <td><i class="fa fa-circle <%= model.VolunteerEstimationComplete === '1' ? 'text-success' : 'text-danger' %>"></i></td>
            <td><i class="fa fa-circle <%= model.VolunteerAssignmentComplete === '1' ? 'text-success' : 'text-danger' %>"></i></td>
        </tr>
        <tr>
            <td colspan="5">
                <table class="table table-striped project-status">
                    <thead>
                    <th>Project #</th>
                    <th>PM</th>
                    <th>Status</th>
                    <th>Cost Estimate</th>
                    <th>Budget Allocation</th>
                    <th>Material List</th>
                    <th>Volunteer Allocation</th>
                    <th>Project Send</th>
                    <th>Final Completion Status</th>
                    </thead>
                    <% let projects = model.projects; %>
                    <% let projectCnt = projects.length; %>
                    <tbody>
                    <% for (let i=0; i < projectCnt; i++) { %>
                    <% let statusState = 'text-danger not-approved'; %>
                    <% if (projects[i].Status === '7'){ %>
                    <% statusState = 'text-success approved-state'; %>
                    <% } else if(projects[i].Status === '6'){ %>
                    <% statusState = 'text-warning pending-state'; %>
                    <% } %>
                    <% let costEstimateState; if (projects[i].EstimatedCost !== '0.0000' && projects[i].CostEstimateDone === 0) { costEstimateState = 'fas fa-dot-circle text-warning';} else { costEstimateState = 'fa fa-circle ' + (projects[i].CostEstimateDone === '1' ? 'text-success' : 'text-danger');} %>
                    <% let budgetAllocationState; if (projects[i].BudgetSources !== '' && projects[i].BudgetAllocationDone === 0) { budgetAllocationState = 'fas fa-dot-circle text-warning';} else { budgetAllocationState = 'fa fa-circle ' + (projects[i].BudgetAllocationDone === '1' ? 'text-success' : 'text-danger');} %>
                    <% let materialListState; if (projects[i].MaterialsNeeded !== '' && projects[i].MaterialListDone === 0) { materialListState = 'fas fa-dot-circle text-warning';} else { materialListState = 'fa fa-circle ' + (projects[i].MaterialListDone === '1' ? 'text-success' : 'text-danger');} %>
                    <% let volunteerAllocationState; if (projects[i].VolunteersNeededEst !== 0 && projects[i].VolunteerAllocationDone === 0) { volunteerAllocationState = 'fas fa-dot-circle text-warning';} else { volunteerAllocationState = 'fa fa-circle ' + (projects[i].VolunteerAllocationDone === '1' ? 'text-success' : 'text-danger');} %>
                    <% let projectSendState = 'fa fa-circle text-danger not-ready-state'; %>
                    <% if (projects[i].Status === '4'){ %>
                    <% projectSendState = 'fa fa-circle text-success sent-state'; %>
                    <% } else if(projects[i].Status === '2'){ %>
                    <% projectSendState = 'far fa-circle text-success ready-state'; %>
                    <% } %>
                    <% let descriptionState = 'text-success'; if(projects[i].ProjectDescription === '') { descriptionState = 'text-danger'; projects[i].ProjectDescription = 'Project Description is not set yet.'; } %>
                    <tr>
                        <td><i data-toggle="tooltip" title="<%= projects[i].ProjectDescription.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {return '&#'+i.charCodeAt(0)+';';}).replace('"','&quot;') %>" class="fa fa-info-circle <%= descriptionState %> pull-left"></i><%= projects[i].SequenceNumber %></td>
                        <td><%= projects[i].PM %></td>
                        <td><i class="fa fa-circle <%= statusState %>"></i></td>
                        <td><i class="<%= costEstimateState %>"></i></td>
                        <td><i class="<%= budgetAllocationState %>"></i></td>
                        <td><i class="<%= materialListState %>"></i></td>
                        <td><i class="<%= volunteerAllocationState %>"></i></td>
                        <td><i class="<%= projectSendState %>"></i></td>
                        <td><i class="fa fa-circle <%= projects[i].FinalCompletionStatus === '1' ? 'text-success' : 'text-danger' %>"></i></td>
                    </tr>
                    <% } %>
                    </tbody>
                </table>
            </td>
        </tr>
        </tbody>
    </table>
</div>
