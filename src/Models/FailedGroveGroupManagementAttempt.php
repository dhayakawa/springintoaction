<?php

namespace Dhayakawa\SpringIntoAction\Models;

use Illuminate\Database\Eloquent\Model;

class FailedGroveGroupManagementAttempt extends BaseModel
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'failed_grove_group_management_attempts';
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id';
    protected $fillable = [
        'id',
        'call',
        'call_params',
        'reason',
    ];
    private $defaultRecordData = [

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
