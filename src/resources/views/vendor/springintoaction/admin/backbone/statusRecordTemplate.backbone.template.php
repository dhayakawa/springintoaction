<% /*console.log('statusRecordTemplate',{model:model})*/ %>
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
                <i data-model-type="sitestatus" data-id="<%= model.SiteStatusID %>"
                   data-field="ProjectDescriptionComplete" data-popover="true" data-toggle="tooltip"
                   title="<%= model.ProjectDescriptionCompleteToolTipContent %>"
                   class="<%= model.projectDescriptionCompleteState %>"></i>
            </td>
            <td>
                <i data-model-type="sitestatus" data-id="<%= model.SiteStatusID %>"
                   data-field="BudgetEstimationComplete" data-popover="true" data-toggle="tooltip"
                   title="<%= model.BudgetEstimationCompleteToolTipContent %>"
                   class="<%= model.budgetEstimationCompleteState %>"></i>
            </td>
            <td>
                <i data-model-type="sitestatus" data-id="<%= model.SiteStatusID %>"
                   data-field="BudgetActualComplete" data-popover="true" data-toggle="tooltip"
                   title="<%= model.BudgetActualCompleteToolTipContent %>"
                   class="<%= model.budgetActualCompleteState %>"></i>
            </td>
            <td>
                <i data-model-type="sitestatus" data-id="<%= model.SiteStatusID %>"
                   data-field="VolunteerEstimationComplete" data-popover="true" data-toggle="tooltip"
                   title="<%= model.VolunteerEstimationCompleteToolTipContent %>"
                   class="<%= model.volunteerEstimationCompleteState %>"></i>
            </td>
            <td>
                <i data-model-type="sitestatus" data-id="<%= model.SiteStatusID %>"
                   data-field="VolunteerAssignmentComplete" data-popover="true" data-toggle="tooltip"
                   title="<%= model.VolunteerAssignmentCompleteToolTipContent %>"
                   class="<%= model.volunteerAssignmentCompleteState %>"></i>
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
                            <i data-model-type="project" data-site-id="<%= model.SiteID %>"
                               data-id="<%= projects[i].ProjectID %>"
                               class="edit-project fas fa-edit pull-left"
                               title="go to project edit form"></i>
                            <i data-toggle="tooltip" title="<%= projects[i].ProjectDescriptionToolTipContent %>"
                               class="<%= projects[i].projectDescriptionState %> pull-left"></i>
                            <span title="projects.ProjectID database record id:<%= projects[i].ProjectID %>"><%=
                                projects[i].SequenceNumber %></span>
                        </td>
                        <td><%= projects[i].PM %></td>
                        <td>
                            <i data-model-type="project" data-id="<%= projects[i].ProjectID %>"
                               data-field="status" data-popover="true" data-toggle="tooltip"
                               title="<%= projects[i].statusToolTipContent %>"
                               class="<%= projects[i].statusState %>"></i>
                        </td>
                        <td>
                            <i data-model-type="project" data-id="<%= projects[i].ProjectID %>"
                               data-field="cost_estimate_done" data-popover="true" data-toggle="tooltip"
                               title="<%= projects[i].cost_estimate_doneToolTipContent %>"
                               class="<%= projects[i].cost_estimate_doneState %>"></i>
                        </td>
                        <td>
                            <i data-model-type="project" data-id="<%= projects[i].ProjectID %>"
                               data-field="budget_allocation_done" data-popover="true" data-toggle="tooltip"
                               title="<%= projects[i].budget_allocation_doneToolTipContent %>"
                               class="<%= projects[i].budget_allocation_doneState %>"></i>
                        </td>
                        <td>
                            <i data-model-type="project" data-id="<%= projects[i].ProjectID %>"
                               data-field="material_list_done" data-popover="true" data-toggle="tooltip"
                               title="<%= projects[i].material_list_doneToolTipContent %>"
                               class="<%= projects[i].material_list_doneState %>"></i>
                        </td>
                        <td>
                            <i data-model-type="project" data-id="<%= projects[i].ProjectID %>"
                               data-field="volunteer_allocation_done" data-popover="true" data-toggle="tooltip"
                               title="<%= projects[i].volunteer_allocation_doneToolTipContent %>"
                               class="<%= projects[i].volunteer_allocation_doneState %>"></i>
                        </td>
                        <td>
                            <i data-model-type="project" data-id="<%= projects[i].ProjectID %>"
                               data-field="project_send" data-popover="true" data-toggle="tooltip"
                               title="<%= projects[i].project_sendToolTipContent %>"
                               class="<%= projects[i].project_sendState %>"></i>
                        </td>
                        <td>
                            <i data-model-type="project" data-id="<%= projects[i].ProjectID %>"
                               data-field="final_completion_status" data-popover="true" data-toggle="tooltip"
                               title="<%= projects[i].final_completion_statusToolTipContent %>"
                               class="<%= projects[i].final_completion_statusState %>"></i>
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
