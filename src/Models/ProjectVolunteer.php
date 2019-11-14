<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/24/2018
 * Time: 1:13 PM
 */

namespace Dhayakawa\SpringIntoAction\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectVolunteer extends BaseModel
{
    use \Illuminate\Database\Eloquent\SoftDeletes;
    protected $dates = ['deleted_at'];
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'project_volunteers';
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'ProjectVolunteerID';
    protected $fillable = [
        'ProjectID',
        'VolunteerID',
    ];

    public function volunteer()
    {
        return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Volunteer');
    }

    public function project()
    {
        return $this->belongsTo('Dhayakawa\SpringIntoAction\Models\Project');
    }

    public function getProjectVolunteer($ProjectVolunteerRoleID)
    {
        $model = new ProjectVolunteerRole;

        return $model->getProjectVolunteerByRoleId($ProjectVolunteerRoleID);
    }

    public function getProjectVolunteers($ProjectID)
    {
        $model = new ProjectVolunteerRole;

        return $model->getProjectVolunteers($ProjectID);
    }

    public function getUnassigned($SiteID, $Year)
    {
        $sql = "SELECT volunteers.* FROM volunteers
                      LEFT JOIN
                    (SELECT pv.*
                    FROM project_volunteers pv
                    WHERE pv.deleted_at IS NULL AND pv.ProjectID NOT IN (
                    SELECT pv.ProjectID
                    FROM project_volunteers pv
                    WHERE pv.deleted_at IS NULL AND pv.ProjectID NOT IN (SELECT `projects`.ProjectID
                                               FROM `projects`
                                                 JOIN `site_status`
                                                   ON `site_status`.`SiteStatusID` = `projects`.`SiteStatusID`
                                                 INNER JOIN `sites` ON `sites`.`SiteID` = `site_status`.`SiteID`
                                               WHERE `site_status`.deleted_at IS NULL AND `site_status`.`Year` = ? AND `sites`.deleted_at IS NULL AND `sites`.`SiteID` = ?))) fakeTable ON fakeTable.VolunteerID = volunteers.VolunteerID
                    WHERE fakeTable.VolunteerID IS NULL;";
        $result = DB::select($sql, [$Year, $SiteID]);

        return $result;
    }
}
