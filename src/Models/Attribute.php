<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/12/2018
 * Time: 10:26 PM
 */

namespace Dhayakawa\SpringIntoAction\Models;

use Illuminate\Database\Eloquent\Model;

class Attribute extends BaseModel
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'attributes';
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id';
    protected $fillable = [
        'attribute_code',
        'label',
        'table',
        'input',
        'options_source',
        'default_value',
        'DisplaySequence',
        'is_core'
    ];
}
