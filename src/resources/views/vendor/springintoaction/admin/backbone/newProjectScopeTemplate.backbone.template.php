<form name="newProject">
    <input type="hidden" name="SiteID" value="<%= SiteID %>"/>
    <input type="hidden" name="SiteStatusID" value="<%= SiteStatusID %>"/>
    <div class="form-group">
        <label for="inputActive">Active</label>
        <select name="Active" class="form-control" id="inputActive"><%= options.yesNoIsActiveOptions %></select>
    </div>
    <div class="form-group">
        <label for="project_type">Project Type</label>
        <select name="project_type" class="form-control" id="project_type"><%= projectTypeOptions %></select>
    </div>
    <div class="form-group">
        <label for="selectContactID">Contact</label>
        <%= contactSelect %>
    </div>
    <div class="form-group">
        <label for="inputSequenceNumber">Project ID</label>
        <input type="text" readonly name="SequenceNumber" class="form-control" id="inputSequenceNumber"
            value="<%= SequenceNumber %>"/>
    </div>
    <div class="form-group">
        <label for="inputOriginalRequest">Original Request</label>
        <textarea name="OriginalRequest" class="form-control" id="inputOriginalRequest"><%= OriginalRequest %></textarea>
    </div>
    <div class="form-group">
        <label for="inputProjectDescription">Project Description</label>
        <textarea name="ProjectDescription" class="form-control" id="inputProjectDescription"><%= ProjectDescription %></textarea>
        <p class="help-block">This description will be the one on the registration page. Try to keep it short and simple. Do not add comments that are not applicable to registration.</p>
    </div>
    <div class="form-group">
        <label for="inputComments">Comments</label>
        <textarea name="Comments" class="form-control" id="inputComments"><%= Comments %></textarea>
    </div>

</form>
<% let escapedJSON = JSON.stringify(options).replace(/'/g, "\\\\'") %>
<script type="text/javascript">

    window.jsonOptions = '<%= escapedJSON %>';
    window.selectOptions = JSON.parse(jsonOptions);
    window.jsonProjectAttributes = '<%= JSON.stringify(projectAttributes) %>';
    window.projectAttributes = JSON.parse(jsonProjectAttributes);
    window.jsonAttributesOptions = '<%= JSON.stringify(attributesOptions) %>';
    window.attributesOptions = JSON.parse(jsonAttributesOptions);
    window.attributesOptionsCnt = attributesOptions.length;

    function getProjectTypeAttributes(id) {
        return _.where(window.projectAttributes, {project_skill_needed_option_id: parseInt(id)});
    }

    function getInputHtml(inputType, attribute_code, id, value, optionHtml) {
        let html = '';
        switch (inputType) {
            case 'input':
                html = '<input type="text" data-attribute-id="'+id+'" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="" value="' + value + '"/>';
                break;
            case 'textarea':
                html = '<textarea data-attribute-id="' + id + '" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="">' + value + '</textarea>';
                break;
            case 'select':
                html = '<select data-attribute-id="' + id + '" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '">' + optionHtml + '</select>';
                break;
            case 'bool':
                html = '<div class="admin__actions-switch enable_product_restrictions-switch" data-role="switcher">' +
                       '    <input name="product_restrictions_config[enable_product_restrictions]" class="admin__actions-switch-checkbox" type="checkbox">' +
                       '    <label class="admin__actions-switch-label">' +
                       '        <span class="admin__actions-switch-text">Disabled</span>' +
                       '    </label>' +
                       '</div>';
                break;
            default:
                html = '<input data-attribute-id="' + id + '" type="text" name="' + attribute_code + '" class="form-control" id="' + attribute_code + '" placeholder="" value="' + value + '"/>';
        }
        return html;
    }

    function buildFormElements(projectTypeId) {
        $('[name="newProject"]').find('.dynamic').remove();
        let projectTypeAttributes = getProjectTypeAttributes(projectTypeId);

        for (let i = 0; i < attributesOptionsCnt; i++) {
            let attribute = attributesOptions[i];
            if (_.where(projectTypeAttributes, {attribute_id: attribute.id}).length) {
                let value = '';
                let optionHtml = attribute.options_source !== '' && !_.isUndefined(window.selectOptions[attribute.options_source]) ? window.selectOptions[attribute.options_source] : '';
                let hideClass = '';
                if ('permit_required_for' === attribute.attribute_code || 'would_like_team_lead_to_contact' === attribute.attribute_code) {
                    hideClass = 'hide';
                }
                let row = '<div class="dynamic form-group ' + hideClass + '">' +
                          '    <label for="' + attribute.attribute_code + '">' + attribute.label + '</label>' +
                          getInputHtml(attribute.input, attribute.attribute_code, attribute.id, value, optionHtml) +
                          '</div>';
                $('[name="newProject"]').append(row);
            }
        }
    }

    buildFormElements(8);
    $('[name="project_type"]').on('change', function (e) {
        buildFormElements($(this).val());
    });
    $('[name="newProject"]').on('change','[name="permit_required"]', function (e) {

        if ($(this).val() === "2") {
            $('[name="permit_required_for"]').parent().removeClass('hide');
        } else if ($(this).val() === "3") {
            $('[name="permit_required_for"]').parent().addClass('hide');
            $('[name="would_like_team_lead_to_contact"]').parent().removeClass('hide');
        } else {
            $('[name="permit_required_for"]').parent().addClass('hide');
            $('[name="would_like_team_lead_to_contact"]').parent().addClass('hide');
        }
    });
</script>
