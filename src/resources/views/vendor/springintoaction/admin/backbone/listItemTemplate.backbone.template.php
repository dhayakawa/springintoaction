<% /*console.log(idAttribute,labelAttribute,listItems,highestSequenceNumber,view)/**/ %>
<div class="col-sm-12 list-items">
    <form name="list-items">
        <table class="table list-items">
            <thead>
                <tr>
                    <th class="display-sequence-thead">Sequence</th>
                    <th class="list-item-label-thead" style="width:275px">Item</th>
                    <th class="list-item-label-thead" style="width:35px">Delete</th>
                    <th></th>
                </tr>
            </thead>
            <% let listItemsCnt = listItems.length; %>
            <% let bAutoSetDisplaySequence = false; %>
            <tbody>
            <% for (let i=0; i < listItemsCnt; i++) { %>
            <% if (listItems[i].attributes.DisplaySequence === 0) {
                highestSequenceNumber++;
                listItems[i].attributes.DisplaySequence = highestSequenceNumber;
            } %>
            <% let listItemId = 'list_item_' + listItems[i].attributes[idAttribute]; %>
            <tr id="<%= listItemId %>">
                <td class="display-sequence">
                    <span class="ui-icon ui-icon-arrowthick-2-n-s"></span>
                    <input class="list-item-input" name="list_item[<%= listItems[i].attributes[idAttribute] %>][DisplaySequence]" data-id="<%= listItems[i].attributes[idAttribute] %>" value="<%= listItems[i].attributes.DisplaySequence %>" readonly>
                </td>
                <td class="list-item-label">
                    <input class="list-item-input" name="list_item[<%= listItems[i].attributes[idAttribute] %>][<%= labelAttribute %>]" data-id="<%= listItems[i].attributes[idAttribute] %>" value="<%= listItems[i].attributes[labelAttribute] %>">
                </td>
                <td class="list-item-label">
                    <span data-list-item-id="<%= listItemId %>" class="ui-icon ui-icon-trash"></span>
                </td>
                <td></td>
            </tr>
            <% } %>
            <% if(bAutoSetDisplaySequence) {
                view.listChanged();
                alert('FYI- One of the sequence numbers was automatically updated and the list needs to be saved.');
            }%>
            </tbody>
        </table>
    </form>
</div>
