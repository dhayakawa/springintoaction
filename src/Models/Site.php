<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/12/2018
 * Time: 10:26 PM
 */

namespace Dhayakawa\SpringIntoAction\Models;

use Illuminate\Database\Eloquent\Model;

class Site extends BaseModel
{
    use \Illuminate\Database\Eloquent\SoftDeletes;
    protected $dates = ['deleted_at'];
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'sites';
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'SiteID';
    protected $fillable = [
        'SiteName',
        'EquipmentLocation',
        'DebrisLocation',
        'Active',
    ];
    private $defaultRecordData = [
        'SiteName' => '',
        'EquipmentLocation' => '',
        'DebrisLocation' => '',
        'Active' => 0,
    ];

    public function status()
    {
        return $this->hasMany('Dhayakawa\SpringIntoAction\Models\SiteStatus', 'SiteID', 'SiteID');
    }

    public function projects()
    {
        return $this->hasMany('Dhayakawa\SpringIntoAction\Models\Project', 'SiteID', 'SiteID');
    }

    public function contacts()
    {
        return $this->hasMany('Dhayakawa\SpringIntoAction\Models\Contact', 'SiteID', 'SiteID');
    }

    public function getCurrentSiteStatus()
    {
        return self::with('siteStatus')->where('Year', date('Y'))->get();
    }

    public function getVolunteerSites($VolunteerID, $SiteVolunteerRoleID)
    {
        $model = Site::join(
            'site_status',
            'site_status.SiteID',
            '=',
            'sites.SiteID'
        )->join(
            'site_volunteers',
            'site_status.SiteStatusID',
            '=',
            'site_volunteers.SiteStatusID'
        )->join(
            'site_volunteer_role',
            'site_status.SiteStatusID',
            '=',
            'site_volunteer_role.SiteStatusID'
        )->join(
            'volunteers',
            'site_volunteers.VolunteerID',
            '=',
            'volunteers.VolunteerID'
        )->where(
            'site_volunteer_role.SiteRoleID',
            '=',
            $SiteVolunteerRoleID
        )->where(
            'volunteers.VolunteerID',
            '=',
            $VolunteerID
        )->where(
            'site_status.Year',
            '=',
            self::getCurrentYear()
        )->where(
            'sites.Active',
            '=',
            1
        )->where(
            'site_volunteer_role.Status',
            '=',
            5
        )->whereNull('sites.deleted_at')->whereNull('volunteers.deleted_at')->whereNull('site_status.deleted_at')->select(
            [
                'sites.SiteID',
                'sites.SiteName',
                'site_status.SiteStatusID'
            ]
        );

        return $model->get()->toArray();
    }

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
        if (isset($this->defaultRecordData['Year']) &&
            (!is_numeric($this->defaultRecordData['Year']) ||
             !preg_match("/^\d{4,4}$/", $this->defaultRecordData['Year']))
        ) {
            $this->defaultRecordData['Year'] = date('Y');
        }

        return $this->defaultRecordData;
    }
}
