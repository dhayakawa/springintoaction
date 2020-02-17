<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/12/2018
 * Time: 10:26 PM
 */

namespace Dhayakawa\SpringIntoAction\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Dhayakawa\SpringIntoAction\Models\Attribute;

class ProjectAttribute extends BaseModel
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'project_attributes';
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id';
    protected $fillable = [
        'attribute_id',
        'workflow_id',
        'workflow_requirement',
        'workflow_requirement_depends_on',
        'workflow_requirement_depends_on_condition',
        'project_skill_needed_option_id',
    ];

    public function reset()
    {
        die('comment out this die to run this');
        $location = 1;
        $dimensions = 2;
        $material_needed_and_cost = 4;
        $estimated_total_cost = 5;
        $volunteers_needed_estimate = 6;
        $estimated_time_to_complete = 7;
        $when_will_project_be_completed = 8;
        $prep_work_required = 9;
        $permit_required = 10;
        $permit_required_for = 11;
        $would_like_team_lead_to_contact = 12;
        $special_equipment_needed = 13;
        $painting_dimensions = 14;
        $estimated_paint_cans_needed = 16;
        $estimated_paint_tape_rolls_needed = 17;
        $paint_already_on_hand = 20;
        $paint_ordered = 21;
        $needs_to_be_started_early = 22;
        $actual_cost = 23;
        $child_friendly = 24;
        $status_reason = 25;
        $pc_see_before_sia = 26;
        $setup_day_instructions = 27;
        $sia_day_instructions = 28;
        $need_sia_tshirts_for_pc = 29;
        $project_send = 30;
        $cost_estimate_done = 31;
        $material_list_done = 32;
        $volunteer_allocation_done = 33;
        $permits_or_approvals_done = 34;
        $permits_or_approvals_status = 35;
        $special_instructions = 37;
        $budget_allocation_done = 38;
        $budget_sources = 39;
        $final_completion_assessment = 40;
        $final_completion_status = 41;
        $primary_skill_needed = 42;
        $status = 43;
        $team_leaders_needed_estimate = 44;
        $scope = 1;
        $implement = 2;
        $ready = 3;
        $done = 4;

        $aProjectSkillNeededOptionsCollection = ProjectSkillNeededOptions::orderBy(
            'DisplaySequence',
            'asc'
        )->get()->toArray();
        $aSkillIds = [];
        foreach ($aProjectSkillNeededOptionsCollection as $skill) {
            $aSkillIds[] = $skill['id'];
        }
        $aAttributeCollection = Attribute::where('table', '=', 'projects')->get()->toArray();
        $aAttributeByCode = [];
        foreach ($aAttributeCollection as $attribute) {
            $aAttributeByCode[$attribute['attribute_code']] = $attribute['id'];
        }
        $aWorkflowConfig = [
            // Scope
            '1' => [
                '*' => [
                    'status' => [],
                    'status_reason' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'status',
                        'workflow_requirement_depends_on_condition' => 'not 6,not 7'
                    ],
                    'primary_skill_needed' => [],
                    'location' => [],
                    'dimensions' => ['workflow_requirement' => 0],
                    'material_needed_and_cost' => [],
                    'estimated_total_cost' => [],
                    'team_leaders_needed_estimate' => [],
                    'volunteers_needed_estimate' => [],
                    'estimated_time_to_complete' => [],
                    'when_will_project_be_completed' => [],
                    'prep_work_required' => ['workflow_requirement' => 0],
                    'special_instructions' => ['workflow_requirement' => 0],
                    'project_attachments' => ['workflow_requirement' => 0]
                ],
                // Construction
                '2' => [
                    'permit_required' => [],
                    'permit_required_for' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '1'
                    ],
                    'would_like_team_lead_to_contact' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '3'
                    ],
                    'special_equipment_needed' => ['workflow_requirement' => 0],

                ],
                // Painting
                '3' => [
                    'painting_dimensions' => [],
                    'estimated_paint_cans_needed' => [],
                    'estimated_paint_tape_rolls_needed' => [],
                    'paint_already_on_hand' => ['workflow_requirement' => 0],
                ],
                // Landscaping
                '4' => [

                ],
                // Furniture Making / Woodworking
                '5' => [
                    'permit_required' => [],
                    'permit_required_for' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '1'
                    ],
                    'would_like_team_lead_to_contact' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '3'
                    ],
                    'special_equipment_needed' => ['workflow_requirement' => 0],
                ],
                // General Carpentry
                '6' => [
                    'permit_required' => [],
                    'permit_required_for' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '1'
                    ],
                    'would_like_team_lead_to_contact' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '3'
                    ],
                    'special_equipment_needed' => ['workflow_requirement' => 0],
                ],
                // Cabinetry
                '7' => [
                    'permit_required' => [],
                    'permit_required_for' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '1'
                    ],
                    'would_like_team_lead_to_contact' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '3'
                    ],
                    'special_equipment_needed' => ['workflow_requirement' => 0],
                ],
                // General
                '8' => [
                    'special_equipment_needed' => ['workflow_requirement' => 0],
                ],
                // Cleaning
                '9' => [
                    'special_equipment_needed' => ['workflow_requirement' => 0],
                ]
            ],
            // Implementing
            '2' => [
                '*' => [
                    'budget_sources' => [],
                    'needs_to_be_started_early' => [],
                    'actual_cost' => [],
                    'child_friendly' => [],
                    'pc_see_before_sia' => ['workflow_requirement' => 0],
                    'setup_day_instructions' => ['workflow_requirement' => 0],
                    'sia_day_instructions' => ['workflow_requirement' => 0],
                    'need_sia_tshirts_for_pc' => ['workflow_requirement' => 0],
                ],
                // Construction
                '2' => [
                    'permits_or_approvals_status' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '1'
                    ],

                ],
                // Painting
                '3' => [
                    'paint_ordered' => ['workflow_requirements' => 0]
                ],
                // Landscaping
                '4' => [

                ],
                // Furniture Making / Woodworking
                '5' => [
                    'permits_or_approvals_status' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '1'
                    ],
                ],
                // General Carpentry
                '6' => [
                    'permits_or_approvals_status' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '1'
                    ],
                ],
                // Cabinetry
                '7' => [
                    'permits_or_approvals_status' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '1'
                    ],
                ],
                // General
                '8' => [

                ],
                // Cleaning
                '9' => [

                ]
            ],
            // Ready
            '3' => [
                '*' => [
                    'project_send' => [],
                    'cost_estimate_done' => [],
                    'material_list_done' => [],
                    'volunteer_allocation_done' => [],
                    'budget_allocation_done' => [],
                    'final_completion_assessment' => [],
                ],
                // Construction
                '2' => [
                    'permits_or_approvals_done' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '1'
                    ],

                ],
                // Painting
                '3' => [

                ],
                // Landscaping
                '4' => [

                ],
                // Furniture Making / Woodworking
                '5' => [
                    'permits_or_approvals_done' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '1'
                    ],
                ],
                // General Carpentry
                '6' => [
                    'permits_or_approvals_done' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '1'
                    ],
                ],
                // Cabinetry
                '7' => [
                    'permits_or_approvals_done' => [
                        'workflow_requirement' => 3,
                        'workflow_requirement_depends_on' => 'permit_required',
                        'workflow_requirement_depends_on_condition' => '1'
                    ],
                ],
                // General
                '8' => [

                ],
                // Cleaning
                '9' => [

                ]
            ],
            // Done
            '4' => [
                '*' => [
                    'final_completion_status' => []
                ],
                // Construction
                '2' => [],
                // Painting
                '3' => [

                ],
                // Landscaping
                '4' => [

                ],
                // Furniture Making / Woodworking
                '5' => [

                ],
                // General Carpentry
                '6' => [

                ],
                // Cabinetry
                '7' => [

                ],
                // General
                '8' => [

                ],
                // Cleaning
                '9' => [

                ]
            ]
        ];

        foreach ($aWorkflowConfig as $workflowId => $aConfig) {
            $aAttributeConfigs = [];
            foreach ($aSkillIds as $skillId) {
                if (isset($aConfig[$skillId])) {
                    $aAttributeConfigs[$skillId] = array_merge($aConfig['*'], $aConfig[$skillId]);
                }
            }
            foreach ($aAttributeConfigs as $skillId => $aAttributeConfig) {
                //echo "<pre>$skillId" . print_r($aAttributeConfig, true);
                foreach ($aAttributeConfig as $attribute_code => $aData) {
                    $workflow_requirement = isset($aData['workflow_requirement'])?$aData['workflow_requirement']:1;
                    $workflow_requirement_depends_on = isset($aData['workflow_requirement_depends_on'])?$aAttributeByCode[$aData['workflow_requirement_depends_on']]:'null';
                    $workflow_requirement_depends_on_condition = isset($aData['workflow_requirement_depends_on_condition'])?"'".$aData['workflow_requirement_depends_on_condition']."'":'null';
                    $sql= "insert into project_attributes (attribute_id,workflow_id,workflow_requirement,workflow_requirement_depends_on,workflow_requirement_depends_on_condition,project_skill_needed_option_id) values ({$aAttributeByCode[$attribute_code]},{$workflowId},{$workflow_requirement},{$workflow_requirement_depends_on},{$workflow_requirement_depends_on_condition},{$skillId});\n";
                    DB::insert($sql);
                }
                //echo   "</pre>";
            }
        }
        $sql =
            "update project_attributes set workflow_id = $scope where attribute_id in ($status, $status_reason,$location,$dimensions,$material_needed_and_cost,$estimated_total_cost,$volunteers_needed_estimate,$prep_work_required ,$permit_required,$permit_required_for,$would_like_team_lead_to_contact,$special_equipment_needed,$estimated_time_to_complete,$when_will_project_be_completed,$special_instructions,$team_leaders_needed_estimate);";
        //DB::update($sql);
        $sql =
            "update project_attributes set workflow_id = $implement where attribute_id in ($needs_to_be_started_early, $actual_cost,$child_friendly,$pc_see_before_sia,$setup_day_instructions,$sia_day_instructions,$need_sia_tshirts_for_pc);";
        //DB::update($sql);
    }
}
