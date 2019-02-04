<% /*console.log(model)*/ %>
<div class="col-sm-12">
    <div class="pull-right status-legend-wrapper">
        <div class="pull-right status-legend">
            <i class="fa fa-circle text-danger"></i> Not Ready/Done/Complete
        </div>
        <div class="pull-right status-legend">
            <i class="fas fa-dot-circle text-warning"></i> Current entry needs validation and then Ready/Done/Complete to be checked.
        </div>
        <div class="pull-right status-legend">
            <i class="fa fa-circle text-warning"></i> Pending
        </div>
        <div class="pull-right status-legend">
            <i class="fa fa-circle text-success"></i> Ready/Done/Complete
        </div>
    </div>
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
            <td><i class="<%= model.projectDescriptionState %>"></i></td>
            <td><i class="<%= model.budgetEstimationState %>"></i></td>
            <td><i class="<%= model.budgetActualState %>"></i></td>
            <td><i class="<%= model.volunteerEstimationState %>"></i></td>
            <td><i class="<%= model.volunteerAssignmentState %>"></i></td>
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
                        <td><i data-toggle="tooltip" title="<%= projects[i].ProjectDescription.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {return '&#'+i.charCodeAt(0)+';';}).replace('"','&quot;') %>" class="fa fa-info-circle <%= projects[i].descriptionState %> pull-left"></i><%= projects[i].SequenceNumber %></td>
                        <td><%= projects[i].PM %></td>
                        <td><i class="<%= projects[i].statusState %>"></i></td>
                        <td><i class="<%= projects[i].costEstimateState %>"></i></td>
                        <td><i class="<%= projects[i].budgetAllocationState %>"></i></td>
                        <td><i class="<%= projects[i].materialListState %>"></i></td>
                        <td><i class="<%= projects[i].volunteerAllocationState %>"></i></td>
                        <td><i class="<%= projects[i].projectSendState %>"></i></td>
                        <td><i class="<%= projects[i].finalCompletionStatusStatus %>"></i></td>
                    </tr>
                    <% } %>
                    </tbody>
                </table>
            </td>
        </tr>
        </tbody>
    </table>
</div>
