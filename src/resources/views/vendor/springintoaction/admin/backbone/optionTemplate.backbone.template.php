<% /*console.log(options)*/ %>
<div class="col-sm-12 option">
    <table class="table options">
        <thead>
            <tr>
                <th class="display-sequence-thead">Sequence</th>
                <th class="option-label-thead">Option</th>
            </tr>
        </thead>
        <% let optionsCnt = options.length; %>
        <tbody>
        <% for (let i=0; i < optionsCnt; i++) { %>
        <% let optionId = 'option_' + options[i].attributes.id; %>
        <tr id="<%= optionId %>">
            <td class="display-sequence">
                <span class="ui-icon ui-icon-arrowthick-2-n-s"></span>
                <input name="DisplaySequence"  data-id="<%= options[i].attributes.id %>" value="<%= options[i].attributes.DisplaySequence %>" readonly>
            </td>
            <td class="option-label">
                <input name="option_label" data-id="<%= options[i].attributes.id %>" value="<%= options[i].attributes.option_label %>">
                <span data-option-id="<%= optionId %>" class="ui-icon ui-icon-trash"></span>
            </td>
        </tr>
        <% } %>
        </tbody>
    </table>
</div>
