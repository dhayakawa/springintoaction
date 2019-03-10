<form name="SiteSetting<%= SiteSettingID %>">
    <input type="hidden" name="SiteSettingID" value="<%= SiteSettingID %>"/>
    <input type="hidden" name="setting"  id="inputSetting" value="<%= setting %>"/>
    <div class="row">
        <div class="col-xs-2">
            <div class="form-group site-setting-value-label">
                <label><%= settingLabel %></label>
            </div>
            <div class="form-group">
                <% if(input_type === 'radio_yes_no') { %>
                <label class="radio-inline">
                    <input type="radio" name="value" id="inlineValue1" value="1"> Yes
                </label>
                <label class="radio-inline">
                    <input type="radio" name="value" id="inlineValue2" value="0"> No
                </label>
                <% } %>
                <% if(input_type === 'text') { %>
                <input class="form-control" type="text" name="value" id="textValue" value="<%= value %>">
                <% } %>
            </div>
            <button class="btn btn-primary btn-sm disabled" type="submit">Save</button>
        </div>
        <div class="col-xs-2">
            <div class="form-group">
                <label>Start Date / End Date</label>
                <div class="input-group">
                    <div class="input-group-addon">
                        <i class="fa fa-clock-o"></i>
                    </div>
                    <input type="text" name="sunrise_sunset" class="form-control" id="inputSunriseSunset" placeholder="optional dates to turn on and off" value=""/>
                    <input type="hidden" name="sunrise" class="form-control" id="inputSunrise" placeholder="Sunrise" value="<%= sunrise %>"/>
                    <input type="hidden" name="sunset" class="form-control" id="inputSunset" placeholder="Sunset" value="<%= sunset %>"/>
                </div>
                <p class="help-block">Leave blank if not applicable.</p>
            </div>
        </div>
        <div class="col-xs-4">
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" class="form-control" rows="4" id="inputDescription"><%= description %></textarea>
            </div>
        </div>
        <div class="col-xs-4">
            <div class="form-group">
                <label>Message</label>
                <textarea name="message" class="form-control" rows="4" id="inputMessage"><%= message %></textarea>
            </div>
        </div>
    </div>
</form>
<% if(input_type === 'radio_yes_no') { %>
<script type="text/javascript">
    $('form[name="SiteSetting<%= SiteSettingID %>"] [name="value"][value="<%= value %>"]').prop('checked', true);
</script>
<% } %>
