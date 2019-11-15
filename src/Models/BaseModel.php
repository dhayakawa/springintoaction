<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 10/24/2019
 * Time: 10:11 AM
 */
declare(strict_types=1);

namespace Dhayakawa\SpringIntoAction\Models;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\Model;
use Dhayakawa\SpringIntoAction\Helpers\ArraySearchTrait;
use Dhayakawa\SpringIntoAction\Helpers\OptionsTrait;
use Dhayakawa\SpringIntoAction\Helpers\CurrentYearTrait;

class BaseModel extends Model
{
    use OptionsTrait, CurrentYearTrait, ArraySearchTrait;

    public function hasColumn($col)
    {
        $columns = Schema::getColumnListing($this->table);
        if(in_array($col,$columns)){
            return true;
        }
        return false;
    }
}
