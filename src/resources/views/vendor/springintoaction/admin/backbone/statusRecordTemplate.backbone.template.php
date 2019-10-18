<% /*console.log(model)*/ %>
<div class="col-sm-12 status-record">
    <div class="row">
        <div class="col-sm-4 col-md-5">
            <h3 class="site-name"><%= model.SiteName %></h3>
        </div>
        <div class="col-sm-8 col-md-7">
            <div class="pull-right status-legend-wrapper">
                <div class="pull-right status-legend">
                    <i class="fa fa-circle text-danger"></i> Needs work
                </div>
                <div class="pull-right status-legend">
                    <i class="fas fa-dot-circle text-warning"></i> Validate current work.
                </div>
                <div class="pull-right status-legend">
                    <i class="fa fa-circle text-warning"></i> Pending
                </div>
                <div class="pull-right status-legend">
                    <i class="fa fa-circle text-success"></i> Ready/Done/Complete
                </div>
            </div>
        </div>
    </div>
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
            <td>
                <i data-model-type="sitestatus" data-id="<%= model.SiteStatusID %>" data-field="ProjectDescriptionComplete" data-popover="true" data-toggle="tooltip" title="<%= model.ProjectDescriptionCompleteToolTipContent %>" class="<%= model.projectDescriptionCompleteState %>"></i>
            </td>
            <td>
                <i data-model-type="sitestatus" data-id="<%= model.SiteStatusID %>" data-field="BudgetEstimationComplete" data-popover="true" data-toggle="tooltip" title="<%= model.BudgetEstimationCompleteToolTipContent %>" class="<%= model.budgetEstimationCompleteState %>"></i>
            </td>
            <td>
                <i data-model-type="sitestatus" data-id="<%= model.SiteStatusID %>" data-field="BudgetActualComplete" data-popover="true" data-toggle="tooltip" title="<%= model.BudgetActualCompleteToolTipContent %>" class="<%= model.budgetActualCompleteState %>"></i>
            </td>
            <td>
                <i data-model-type="sitestatus" data-id="<%= model.SiteStatusID %>" data-field="VolunteerEstimationComplete" data-popover="true" data-toggle="tooltip" title="<%= model.VolunteerEstimationCompleteToolTipContent %>" class="<%= model.volunteerEstimationCompleteState %>"></i>
            </td>
            <td>
                <i data-model-type="sitestatus" data-id="<%= model.SiteStatusID %>" data-field="VolunteerAssignmentComplete" data-popover="true" data-toggle="tooltip" title="<%= model.VolunteerAssignmentCompleteToolTipContent %>" class="<%= model.volunteerAssignmentCompleteState %>"></i>
            </td>
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
                    <tr>
                        <td>
                            <i data-toggle="tooltip" title="<%= projects[i].ProjectDescriptionToolTipContent %>" class="<%= projects[i].projectDescriptionState %> pull-left"></i><%= projects[i].SequenceNumber %>
                        </td>
                        <td><%= projects[i].PM %></td>
                        <td>
                            <i data-model-type="project" data-id="<%= projects[i].ProjectID %>" data-field="Status" data-popover="true" data-toggle="tooltip" title="<%= projects[i].StatusToolTipContent %>" class="<%= projects[i].statusState %>"></i>
                        </td>
                        <td>
                            <i data-model-type="project" data-id="<%= projects[i].ProjectID %>" data-field="CostEstimateDone" data-popover="true" data-toggle="tooltip" title="<%= projects[i].CostEstimateDoneToolTipContent %>" class="<%= projects[i].costEstimateDoneState %>"></i>
                        </td>
                        <td>
                            <i data-model-type="project" data-id="<%= projects[i].ProjectID %>" data-field="BudgetAllocationDone" data-popover="true" data-toggle="tooltip" title="<%= projects[i].BudgetAllocationDoneToolTipContent %>" class="<%= projects[i].budgetAllocationDoneState %>"></i>
                        </td>
                        <td>
                            <i data-model-type="project" data-id="<%= projects[i].ProjectID %>" data-field="MaterialListDone" data-popover="true" data-toggle="tooltip" title="<%= projects[i].MaterialListDoneToolTipContent %>" class="<%= projects[i].materialListDoneState %>"></i>
                        </td>
                        <td>
                            <i data-model-type="project" data-id="<%= projects[i].ProjectID %>" data-field="VolunteerAllocationDone" data-popover="true" data-toggle="tooltip" title="<%= projects[i].VolunteerAllocationDoneToolTipContent %>" class="<%= projects[i].volunteerAllocationDoneState %>"></i>
                        </td>
                        <td>
                            <i data-model-type="project" data-id="<%= projects[i].ProjectID %>" data-field="ProjectSend" data-popover="true" data-toggle="tooltip" title="<%= projects[i].ProjectSendToolTipContent %>" class="<%= projects[i].projectSendState %>"></i>
                        </td>
                        <td>
                            <i data-model-type="project" data-id="<%= projects[i].ProjectID %>" data-field="FinalCompletionStatus" data-popover="true" data-toggle="tooltip" title="<%= projects[i].FinalCompletionStatusToolTipContent %>" class="<%= projects[i].finalCompletionStatusState %>"></i>
                        </td>
                    </tr>
                    <% } %>
                    </tbody>
                </table>
            </td>
        </tr>
        </tbody>
    </table>
</div>
