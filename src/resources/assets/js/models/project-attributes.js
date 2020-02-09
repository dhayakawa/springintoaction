(function (App) {
    App.Models.ProjectAttributes = Backbone.Model.extend({
        idAttribute: "id",
        url: '/admin/project_attributes',
        defaults: {
            'attribute_id':'',
            'workflow_id':'',
            'project_skill_needed_option_id':''
        },
        aProjectAttributesData:null,
        aProjectAttributes:null,
        projectAttributeCodesBySkillNeededOptionId:{},
        getAttributeCodesByProjectSkillNeededOptionIds: function(aProjectSkillNeededOptionIds){
            let self = this;
            let aAttributeCodes = [];
            if (_.isNull(self.aProjectAttributesData)) {
                self.aProjectAttributesData = App.Models.attributesModel.getAttributesDataByTable('projects');
            }
            if (_.isNull(self.aProjectAttributes)) {
                self.aProjectAttributes = JSON.parse(JSON.stringify(App.Collections.projectAttributesManagementCollection));
            }

            _.each(aProjectSkillNeededOptionIds, function(skillNeededOptionId,key){
                if(_.isUndefined(self.projectAttributeCodesBySkillNeededOptionId[skillNeededOptionId])){
                    self.projectAttributeCodesBySkillNeededOptionId[skillNeededOptionId] = [];
                    let aTmpAttributes = _.where(self.aProjectAttributes, {project_skill_needed_option_id: parseInt(skillNeededOptionId)});
                    _.each(aTmpAttributes, function(tmpAttr,key){
                        let aTmpAttributeData = _.findWhere(self.aProjectAttributesData, {id: tmpAttr.attribute_id});
                        self.projectAttributeCodesBySkillNeededOptionId[skillNeededOptionId].push(aTmpAttributeData.attribute_code)
                    });
                }

                aAttributeCodes  = aAttributeCodes.concat(self.projectAttributeCodesBySkillNeededOptionId[skillNeededOptionId]);
            });
            return aAttributeCodes.sort();
        }
    });
})(window.App);
