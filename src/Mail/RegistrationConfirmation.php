<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 2/19/2020
 * Time: 10:31 PM
 */
declare(strict_types=1);

namespace Dhayakawa\SpringIntoAction\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Storage;

class RegistrationConfirmation extends Mailable
{
    use Queueable, SerializesModels;
    public $aData;

    /**
     * RegistrationConfirmation constructor.
     *
     * @param $aData
     */
    public function __construct($aData)
    {
        $this->aData = $aData;
    }

    /**
     * @return RegistrationConfirmation
     */
    public function build()
    {
        $leaderIntro = '';
        $aTeamLeaders = [];
        if (!empty($this->aData['project']['team'])) {

            foreach ($this->aData['project']['team'] as $teamMember) {
                if ($teamMember['Role'] === 'Team Leader') {
                    $aTeamLeaders[] = [
                        'name' => "{$teamMember['FirstName']} {$teamMember['LastName']}",
                        'email' => (!empty($teamMember['Email']) ? $teamMember['Email'] : 'Not Available'),

                        'mobile' => ($teamMember['MobilePhoneNumber'] ? 'mobile:'.$teamMember['MobilePhoneNumber'] :''),
                        'home' => ($teamMember['HomePhoneNumber'] ? 'home:'.$teamMember['HomePhoneNumber'] : '')
                    ];

                }
            }
            if (!empty($aTeamLeaders)) {
                if (count($aTeamLeaders) > 1) {
                    $leaderIntro = "The team leaders for this project are";
                } else {
                    $leaderIntro = "The team leader for this project is";
                }
            }
        }

        return $this->view('springintoaction::admin.emails.registration_confirmation')->with(
            [
                'fullName' => $this->aData['FullName'],
                'ProjectDescription' => $this->aData['project']['ProjectDescription'],
                'SiteName' => $this->aData['project']['SiteName'],
                'leaderIntro' => $leaderIntro,
                'aTeamLeaders' => $aTeamLeaders
            ]
        );
    }
}
