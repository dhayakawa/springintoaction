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
        'project_skill_needed_option_id',
    ];

    public function manage()
    {
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

        $sql =
            "update project_attributes set workflow_id = $scope where attribute_id in ($status, $status_reason,$location,$dimensions,$material_needed_and_cost,$estimated_total_cost,$volunteers_needed_estimate,$prep_work_required ,$permit_required,$permit_required_for,$would_like_team_lead_to_contact,$special_equipment_needed,$estimated_time_to_complete,$when_will_project_be_completed,$special_instructions,$team_leaders_needed_estimate);";
        DB::update($sql);
        $sql =
            "update project_attributes set workflow_id = $implement where attribute_id in ($needs_to_be_started_early, $actual_cost,$child_friendly,$pc_see_before_sia,$setup_day_instructions,$sia_day_instructions,$need_sia_tshirts_for_pc);";

        DB::update($sql);
    }
}
