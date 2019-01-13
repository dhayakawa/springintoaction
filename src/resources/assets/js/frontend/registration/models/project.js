(function (App) {
    App.Models.ProjectFilter = Backbone.Model.extend({
        idAttribute: "ProjectFilterID",
        url: '/registration/project',
        defaults: {
            'filterIcon':'',
            'filterName':'',
            'filterId':'',
            'filterLabel':'',
            'FilterIsChecked':'',
            'Field':'',
            'FieldID':''
        }
    });
    App.Models.Project = Backbone.Model.extend({
        idAttribute: "ProjectID",
        url: '/registration/project/filter',
        defaults: {
            'SiteStatusID': '',
            'SiteName': '',
            'ProjectDescription': '',
            'ChildFriendly': '',
            'PrimarySkillNeeded': '',
            'VolunteersNeededEst':'',
            'VolunteersAssigned': '',
            'PeopleNeeded': '',
        },
        getVolunteersNeeded: function() {
            let needed = this.get('PeopleNeeded');
            // Just in case it is a negative number
            return needed > 0 ? needed : 0;
        },
        getSkillsNeededList: function(){
            let self = this;
            let skillsNeededList = '';
            let options = _.pairs(App.Vars.selectOptions['ProjectSkillNeededOptions']);
            let generalOptionID = App.Vars.selectOptions['ProjectSkillNeededOptions']['General'];

            let filtered = [];
            _.each(options, function (value,key) {
                let regex = new RegExp(value[1]);
                let primarySkillNeeded = self.get('PrimarySkillNeeded');
                if (primarySkillNeeded === ''){
                    primarySkillNeeded = generalOptionID.toString();
                }
                if (primarySkillNeeded.match(regex)) {
                    filtered.push(value[0]);
                }
            });
            let icons = {
                'General':'<i title="General" data-toggle="tooltip" data-placement="top" class="skills-icon general-skill-icon"></i>',
                'Painting':'<i title="Painting" data-toggle="tooltip" data-placement="top" class="skills-icon painting-icon"></i>',
                'General Carpentry':'<i title="General Carpentry" data-toggle="tooltip" data-placement="top" class="skills-icon general-carpentry-icon"></i>',
                'Finish Carpentry':'<i title="Finish Carpentry" data-toggle="tooltip" data-placement="top" class="skills-icon finish-carpentry-icon"></i>',
                'Landscaping':'<i title="Landscaping" data-toggle="tooltip" data-placement="top" class="skills-icon landscaping-icon"></i>',
                'Construction':'<i title="Construction" data-toggle="tooltip" data-placement="top" class="skills-icon construction-icon"></i>',
                'Cabinetry':'<i title="Cabinetry" data-toggle="tooltip" data-placement="top" class="skills-icon cabinetry-icon"></i>',
                'Cleaning': '<i title="Cleaning" data-toggle="tooltip" data-placement="top" class="skills-icon cleaning-icon"></i>'
            };
            let filteredCnt = filtered.length;
            _.each(filtered,  function (value, key) {
                //let lineBreak = key < (filteredCnt-1) ? '<br>' : '';
                skillsNeededList +=  icons[value] ;
            });
            return skillsNeededList;
        },
        getSkillsNeededOptions: function (bReturnHtml, defaultOption) {

            let options = _.pairs(App.Vars.selectOptions['ProjectSkillNeededOptions']);

            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    let selected = !_.isUndefined(defaultOption) && defaultOption === value[0] ? 'selected' : '';
                    return "<option " + selected +" value='" + value[1] + "'>" + value[0] + "</option>";
                })
            } else {
                return options;
            }
        },
        getYesNoOptions: function (bReturnHtml, defaultOption) {
            bReturnHtml = !_.isBoolean(bReturnHtml) ? false : bReturnHtml;
            let options = [
                ['No', 0],
                ['Yes', 1]
            ];
            if (bReturnHtml) {
                return _.map(options, function (value, key) {
                    let selected = !_.isUndefined(defaultOption) && defaultOption === value[0] ? 'selected' : '';
                    return "<option " + selected +" value='" + value[1] + "'>" + value[0] + "</option>";
                })
            } else {
                return options;
            }
        }
    });
})(window.App);

