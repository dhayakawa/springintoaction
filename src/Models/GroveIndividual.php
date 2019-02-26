<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 1/23/2019
 * Time: 1:20 PM
 */

namespace Dhayakawa\SpringIntoAction\Models;

use Illuminate\Database\Eloquent\Model;

class GroveIndividual extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'grove_individuals';
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id';
    protected $fillable = [
        'id',
        'family_id',
        'campus',
        'first_name',
        'last_name',
        'login',
        'email',
        'mobile_phone',
        'home_phone',
        'contact_phone',
        'birthday',
        'family_member_type',
        'modified',
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

    public function getFamilyMembers($family_id)
    {
        $groveIndividuals = $this->where('family_id','=', $family_id);
        $aFamilyMembers = $groveIndividuals->get();
        return $aFamilyMembers ? $aFamilyMembers : [];
    }
}
