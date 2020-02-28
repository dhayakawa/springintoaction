<?php

namespace Dhayakawa\SpringIntoAction\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Storage;

class ProjectReport extends Mailable
{
    use Queueable, SerializesModels;
    public $reportFilePath;
    public $SiteName;
    public $ProjectNum;
    public $projectAttachmentPaths;
    public $aImages = [];
    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($aData)
    {

        $this->projectAttachmentPaths = $aData['projectAttachmentPaths'];
        $this->reportFilePath = $aData['reportFilePath'];
        $this->SiteName = $aData['site_name'];
        $this->ProjectNum = $aData['project_num'];
    }
    private function parseHeaders( $headers )
    {
        $head = array();
        foreach( $headers as $k=>$v )
        {
            $t = explode( ':', $v, 2 );
            if( isset( $t[1] ) )
                $head[ trim($t[0]) ] = trim( $t[1] );
            else
            {
                $head[] = $v;
                if( preg_match( "#HTTP/[0-9\.]+\s+([0-9]+)#",$v, $out ) )
                    $head['reponse_code'] = intval($out[1]);
            }
        }
        return $head;
    }
    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {

        $view = $this->view('springintoaction::admin.emails.project_report')->attach($this->reportFilePath)->with(
            [
                'SiteName' => $this->SiteName,
                'ProjectNum' => $this->ProjectNum,
            ]
        );
        if(!empty($this->projectAttachmentPaths)){
            $pathPrefix = Storage::disk('local')->getDriver()
                                 ->getAdapter()->getPathPrefix();

            $aProjectAttachmentPaths = json_decode($this->projectAttachmentPaths, true);
            foreach($aProjectAttachmentPaths as $AttachmentPathID => $attachmentPath){
                if (!preg_match("~^https?://~",$attachmentPath)) {
                    $attachmentPath = str_replace(
                        '/admin/project_attachment/stream/storage/app/',
                        $pathPrefix,
                        $attachmentPath
                    );
                    if (preg_match("~\.(jpg|jpeg|gif|png|bmp|tiff)$~i", $attachmentPath)) {
                        $this->aImages['path'][] = $attachmentPath;
                    } else {
                        $view->attach($attachmentPath);
                    }
                } else {
                    $contents = \file_get_contents($attachmentPath);
                    $urlParts = preg_split("~/~", $attachmentPath);
                    $file_name = $urlParts[count($urlParts) - 1];
                    if (preg_match("~\.(jpg|jpeg|gif|png|bmp|tiff)$~i", $attachmentPath)) {
                        $this->aImages['raw'][] = ['content'=>$contents,'name'=>$file_name];
                    } else {
                        $view->attachData($contents, $file_name);
                    }

                }
                //echo "\$attachmentPath:$attachmentPath\n";
            }
        }
        return $view;
    }
}
