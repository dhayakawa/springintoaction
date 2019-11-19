<% /*console.log(idAttribute,labelAttribute,listItems,view)/**/ %>
<div class="col-sm-12 list-items">
    <form name="list-items">
        <table class="table table-hover list-items">
            <thead>
            <tr>
                <th class="list-item-label-thead required" style="width:500px">Attribute</th>
                <th class="list-item-label-thead required" style="width:275px">Workflow</th>
                <th class="list-item-label-thead" style="width:275px">Project Type</th>
                <th class="list-item-label-thead" style="width:190px">Delete</th>
                <th></th>
            </tr>
            </thead>
            <% let listItemsCnt = listItems.length; %>
            <tbody>
            <% for (let i=0; i < listItemsCnt; i++) { %>
            <% let listItemId = 'list_item_' + listItems[i].attributes[idAttribute]; %>
            <tr id="<%= listItemId %>">
                <td class="list-item-label required">
                    <select class="list-item-input" name="list_item[<%= listItems[i].attributes[idAttribute] %>][attribute_id]" data-id="<%= listItems[i].attributes[idAttribute] %>"><%= attributesOptions %></select>
                </td>
                <td class="list-item-label required">
                    <select class="list-item-input" name="list_item[<%= listItems[i].attributes[idAttribute] %>][workflow_id]" data-id="<%= listItems[i].attributes[idAttribute] %>"><%= workflowOptions %></select>
                </td>
                <td class="list-item-label">
                    <select class="list-item-input" name="list_item[<%= listItems[i].attributes[idAttribute] %>][project_skill_needed_option_id]" data-id="<%= listItems[i].attributes[idAttribute] %>"><%= projectSkillNeededOptions %></select>
                </td>
                <td class="list-item-label">
                    <span data-list-item-id="<%= listItemId %>" class="ui-icon ui-icon-trash"></span>
                </td>
                <td></td>
            </tr>
            <% } %>
            </tbody>
        </table>
    </form>
</div>
