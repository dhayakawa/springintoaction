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
        define('location', 1);
        define('dimensions', 2);
        define('material_needed_and_cost', 4);
        define('estimated_total_cost', 5);
        define('volunteers_needed_estimate', 6);
        define('estimated_time_to_complete', 7);
        define('when_will_project_be_completed', 8);
        define('prep_work_required', 9);
        define('permit_required', 10);
        define('permit_required_for', 11);
        define('would_like_team_lead_to_contact', 12);
        define('special_equipment_needed', 13);
        define('painting_dimensions', 14);
        define('estimated_paint_cans_needed', 16);
        define('estimated_paint_tape_rolls_needed', 17);
        define('paint_already_on_hand', 20);
        define('paint_ordered', 21);
        define('needs_to_be_started_early', 22);
        define('actual_cost', 23);
        define('child_friendly', 24);
        define('status_reason', 25);
        define('pc_see_before_sia', 26);
        define('setup_day_instructions', 27);
        define('sia_day_instructions', 28);
        define('need_sia_tshirts_for_pc', 29);
        define('project_send', 30);
        define('cost_estimate_done', 31);
        define('material_list_done', 32);
        define('volunteer_allocation_done', 33);
        define('permits_or_approvals_done', 34);
        define('permits_or_approvals_status', 35);
        define('special_instructions', 37);
        define('budget_allocation_done', 38);
        define('budget_sources', 39);
        define('final_completion_assessment', 40);
        define('final_completion_status', 41);
        define('primary_skill_needed', 42);
        define('status', 43);
        define('team_leaders_needed_estimate', 44);

        define('scope', 1);
        define('implement', 2);
        define('ready', 3);
        define('done', 4);

        $sql =
            "update project_attributes set workflow_id = scope where attribute_id in (status, status_reason, location, dimensions, material_needed_and_cost,estimated_total_cost,volunteers_needed_estimate,prep_work_required ,permit_required,permit_required_for,would_like_team_lead_to_contact,special_equipment_needed,estimated_time_to_complete,when_will_project_be_completed,special_instructions,team_leaders_needed_estimate);";
        DB::update($sql);
        $sql =
            "update project_attributes set workflow_id = implement where attribute_id in (needs_to_be_started_early, actual_cost, child_friendly, pc_see_before_sia, setup_day_instructions, sia_day_instructions,need_sia_tshirts_for_pc);";
        DB::update($sql);
    }
}
