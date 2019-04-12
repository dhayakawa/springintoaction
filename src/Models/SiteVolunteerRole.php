<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/12/2018
 * Time: 10:26 PM
 */

namespace Dhayakawa\SpringIntoAction\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Dhayakawa\SpringIntoAction\Models\Volunteer;

class SiteVolunteerRole extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'site_volunteer_role';
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'SiteVolunteerRoleID';
    protected $fillable = [
        'SiteVolunteerID',
        'SiteRoleID',
        'SiteStatusID',
        'Comments',
        'Status'
    ];
    private $defaultRecordData = [
        'SiteVolunteerID' => 0,
        'SiteRoleID' => 0,
        'SiteStatusID' => 0,
        'Comments' => '',
        'Status' => ''
    ];

    public function getSiteVolunteer($SiteVolunteerRoleID)
    {
        return Volunteer::join(
            'site_volunteers',
            'volunteers.VolunteerID',
            '=',
            'site_volunteers.VolunteerID'
        )->join(
            'site_volunteer_role',
            'site_volunteers.SiteVolunteerID',
            '=',
            'site_volunteer_role.SiteVolunteerID'
        )->join('site_roles', 'site_volunteer_role.SiteRoleID', '=', 'site_roles.SiteRoleID')->where(
            'site_volunteer_role.SiteVolunteerRoleID',
            '=',
            $SiteVolunteerRoleID
        )->select(
            [
                'site_volunteers.SiteVolunteerID',
                'site_volunteers.SiteStatusID',
                'site_volunteer_role.*',
                'volunteers.VolunteerID',
                'volunteers.Active',
                'volunteers.LastName',
                'volunteers.FirstName',
                'volunteers.MobilePhoneNumber',
                'volunteers.HomePhoneNumber',
                'volunteers.Email',
                'site_volunteer_role.Status as SiteVolunteerRoleStatus'
            ]
        )->get()->toArray();
    }

    public function getSiteVolunteers($SiteStatusID)
    {
        $model = Volunteer::join(
            'site_volunteers',
            'volunteers.VolunteerID',
            '=',
            'site_volunteers.VolunteerID'
        )->join(
            'site_volunteer_role',
            'site_volunteer_role.SiteVolunteerID',
            '=',
            'site_volunteers.SiteVolunteerID'
        )->join('site_roles', 'site_volunteer_role.SiteRoleID', '=', 'site_roles.SiteRoleID')->whereRaw(
            'site_volunteers.SiteStatusID = ?',
            [$SiteStatusID]
        )->select(
            [
                'site_volunteers.SiteVolunteerID',
                'site_volunteers.SiteStatusID',
                'site_volunteer_role.*',
                'volunteers.VolunteerID',
                'volunteers.Active',
                'volunteers.LastName',
                'volunteers.FirstName',
                'volunteers.MobilePhoneNumber',
                'volunteers.HomePhoneNumber',
                'volunteers.Email',
                'site_volunteer_role.Status as SiteVolunteerRoleStatus'
            ]
        );

        //echo $model->toSql();
        return $model->get()->toArray();
    }

    public function getAllSiteVolunteers()
    {
        return Volunteer::join(
            'site_volunteers',
            'volunteers.VolunteerID',
            '=',
            'site_volunteers.VolunteerID'
        )->join(
            'site_volunteer_role',
            'site_volunteer_role.SiteVolunteerID',
            '=',
            'site_volunteers.SiteVolunteerID'
        )->join('site_roles', 'site_volunteer_role.SiteRoleID', '=', 'site_roles.SiteRoleID')->select(
            [
                'site_volunteers.SiteVolunteerID',
                'site_volunteers.SiteStatusID',
                'site_volunteer_role.*',
                'volunteers.VolunteerID',
                'volunteers.Active',
                'volunteers.LastName',
                'volunteers.FirstName',
                'volunteers.MobilePhoneNumber',
                'volunteers.HomePhoneNumber',
                'volunteers.Email',
                'site_volunteer_role.Status as SiteVolunteerRoleStatus'
            ]
        )->get()->toArray();
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
