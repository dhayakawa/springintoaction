<form id="site">
    <input type="hidden" name="SiteID" id="inputSiteID" value="<%= SiteID %>"/>
    <div class="form-group">
        <label for="inputSiteName">Site Name</label>
        <input type="text" name="SiteName" class="form-control" id="inputSiteName" placeholder="Site Name" value="<%= SiteName %>"/>
    </div>
    <div class="form-group">
        <label for="inputEquipmentLocation">Equipment Location</label>
        <input type="text" name="EquipmentLocation" class="form-control" id="inputEquipmentLocation" placeholder="Equipment Location" value="<%= EquipmentLocation %>"/>
    </div>
    <div class="form-group">
        <label for="inputDebrisLocation">Debris Location</label>
        <input type="text" name="DebrisLocation" class="form-control" id="inputDebrisLocation" placeholder="Debris Location" value="<%= DebrisLocation %>"/>
    </div>
</form>
