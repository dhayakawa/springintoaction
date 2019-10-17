<% /*console.log(idAttribute,labelAttribute,options)/**/ %>
<div class="col-sm-12 option">
    <form name="option">
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
            <% let optionId = 'option_' + options[i].attributes[idAttribute]; %>
            <tr id="<%= optionId %>">
                <td class="display-sequence">
                    <span class="ui-icon ui-icon-arrowthick-2-n-s"></span>
                    <input name="option[<%= options[i].attributes[idAttribute] %>][DisplaySequence]" data-id="<%= options[i].attributes[idAttribute] %>" value="<%= options[i].attributes.DisplaySequence %>" readonly>
                </td>
                <td class="option-label">
                    <input name="option[<%= options[i].attributes[idAttribute] %>][<%= labelAttribute %>]" data-id="<%= options[i].attributes[idAttribute] %>" value="<%= options[i].attributes[labelAttribute] %>">
                    <span data-option-id="<%= optionId %>" class="ui-icon ui-icon-trash"></span>
                </td>
            </tr>
            <% } %>
            </tbody>
        </table>
    </form>
</div>
