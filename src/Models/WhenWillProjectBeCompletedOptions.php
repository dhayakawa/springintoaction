<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 10/29/2019
 * Time: 8:37 AM
 */
declare(strict_types=1);

namespace Dhayakawa\SpringIntoAction\Models;

class WhenWillProjectBeCompletedOptions extends BaseModel
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'when_will_project_be_completed_options';
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
    private $defaultRecordData = [
        'option_label' => '',
        'DisplaySequence' => 0,
    ];
}
