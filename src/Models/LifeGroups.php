<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 1/22/2019
 * Time: 9:45 PM
 */

namespace Dhayakawa\SpringIntoAction\Models;

use Illuminate\Database\Eloquent\Model;

class LifeGroups extends BaseModel
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'life_groups';
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id';
    protected $fillable = [
        'group_id',
        'group_name',
        'individual_id',
        'first_name',
        'last_name',
        'email'
    ];
    private $defaultRecordData = [
        'email' => '',
    ];

    /**
     * @param null|array $defaults
     *
     * @return array
     */
    public function getDefaultRecordData($defaults = null)
    {
        if (is_array($defaults) && !empty($defaults)) {
            foreach ($defaults as $key => $value) {
                if (isset($this->defaultRecordData[$key])) {
                    $this->defaultRecordData[$key] = trim($value);
                }
            }
        }


        return $this->defaultRecordData;
    }


}
