<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/12/2018
 * Time: 10:26 PM
 */

namespace Dhayakawa\SpringIntoAction\Models;

use Illuminate\Database\Eloquent\Model;

class BudgetSourceOptions extends Model
{
    use \Dhayakawa\SpringIntoAction\Helpers\OptionsTrait;
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'budget_source_options';
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id';
    protected $fillable = [
        'option_label',
        'DisplaySequence'
    ];
}
