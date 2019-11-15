<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/12/2018
 * Time: 10:26 PM
 */

namespace Dhayakawa\SpringIntoAction\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectAttributesInt extends BaseModel
{

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'project_attributes_int';
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'value_id';
    protected $fillable = [
        'attribute_id',
        'project_id',
        'value',
    ];
}
