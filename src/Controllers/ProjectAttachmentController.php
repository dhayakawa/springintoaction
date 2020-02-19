<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 4/9/2018
 * Time: 7:05 PM
 */

namespace Dhayakawa\SpringIntoAction\Controllers;

use Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Dhayakawa\SpringIntoAction\Models\ProjectAttachment;
use Dhayakawa\SpringIntoAction\Models\Project;
use Illuminate\Http\Request;
use \Dhayakawa\SpringIntoAction\Controllers\ajaxUploader;

class ProjectAttachmentController extends BaseController
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $model = new ProjectAttachment;
        $data = $request->only($model->getFillable());

        $aAttachmentPaths = array_filter(preg_split("/(\r\n|\n)/", $data['AttachmentPath']));
        $bSuccess = true;
        $aFailedPaths = [];
        if (!empty($aAttachmentPaths)) {
            foreach ($aAttachmentPaths as $attachment) {
                $attachment = \urldecode($attachment);
                $model = new ProjectAttachment;
                $aData = ['ProjectID' => $data['ProjectID'], 'AttachmentPath' => $attachment];
                $model->fill($aData);

                $success = $model->save();
                if (!$success) {
                    $bSuccess = false;
                    $aFailedPaths[] = $attachment;
                }
            }
        }

        if ($bSuccess) {
            $response = ['success' => true, 'msg' => 'Project Attachment Creation Succeeded.'];
        } else {
            $response =
                ['success' => false, 'msg' => 'Project Attachment Creation Failed on:' . join('</br>', $aFailedPaths)];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function getSafeFileName($fileName)
    {
        $fileName = str_replace('#','', $fileName);
        $fileName = str_replace('/','', $fileName);
        $fileName = str_replace(';','', $fileName);
        $fileName = str_replace(':','', $fileName);
        $fileName = str_replace('%','', $fileName);
        $fileName = str_replace(' ','-', $fileName);
        $fileName = str_replace('&','-', $fileName);
        $fileName = str_replace('*','-', $fileName);
        $fileName = preg_replace('/-{2,}/','-', $fileName);


        return strtolower($fileName);
    }
    public function upload(Request $request)
    {
        $Year = date('Y');
        $ProjectID = $request->input('ProjectID');
        $timeStamp = date("Ymd") . round(microtime(true));
        $response['files'] = [];
        $aProjectAttachments = $request->file('files');
        if (is_array($aProjectAttachments)) {
            foreach ($aProjectAttachments as $ProjectAttachment) {
                $newFileName = $timeStamp . '-' . $this->getSafeFileName($ProjectAttachment->getClientOriginalName());
                $siaPath = "{$Year}/{$ProjectID}";
                $newFilePath = $siaPath . '/' . $newFileName;
                Storage::disk('local')->put($newFilePath, File::get($ProjectAttachment));
                $ProjectAttachmentModel = new ProjectAttachment;
                $attachmentLocalPath =
                    Storage::disk('local')->getDriver()->getAdapter()->getPathPrefix() . $newFilePath;
                $aData = ['ProjectID' => $ProjectID, 'AttachmentPath' => $attachmentLocalPath];
                $ProjectAttachmentModel->fill($aData);

                $success = $ProjectAttachmentModel->save();
                if ($success) {
                    $response['files'][] =
                        [
                            "name" => $newFileName,
                            "size" => File::size($ProjectAttachment),
                            "url" => $attachmentLocalPath,
                            "thumbnailUrl" => $ProjectAttachmentModel->getAttribute('ProjectAttachmentID'),
                            "deleteUrl" => "",
                            "deleteType" => "DELETE"
                        ];
                }
            }
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     *
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $model = new ProjectAttachment;
        $result = $model->getDefaultRecordData();
        try {
            if ($model = ProjectAttachment::findOrFail($id)) {
                $result = $model->toArray();
            }
        } catch (\Exception $e) {
            report($e);
        }

        return $result;
    }

    /**
     * @param $AttachmentPath
     *
     * @return mixed
     */
    public function streamAttachment($AttachmentPath)
    {
        try {

            if ($model = ProjectAttachment::where("AttachmentPath", "REGEXP", $AttachmentPath . "$")) {
                $attachment = $model->first()->toArray();
                if (!empty($attachment)) {
                    $pathPrefix = Storage::disk('local')->getDriver()
                                                                                             ->getAdapter()->getPathPrefix();
                    $relativePath = str_replace($pathPrefix, '', $attachment['AttachmentPath']);
                    $exists = Storage::disk('local')->exists($relativePath);
                    // echo $AttachmentPath.'<br>';
                    // echo $pathPrefix.'<br>';
                    // echo $relativePath.'<br>';
                    if ($exists) {
                        return Storage::response($relativePath);
                    }
                }
            }
        } catch (\Exception $e) {
            report($e);
        }

        return 'Sorry, file not found';
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int $id
     *
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * @param Request $request
     * @param         $id
     *
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function update(Request $request, $id)
    {
        $model = ProjectAttachment::findOrFail($id);
        $data = $request->only($model->getFillable());
        array_walk(
            $data,
            function (&$value, $key) {
                if (is_string($value)) {
                    $value = \urldecode($value);
                }
            }
        );
        $model->fill($data);
        $success = $model->save();

        if ($success) {
            $response = ['success' => true, 'msg' => 'Project Attachment Update Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Project Attachment Update Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    /**
     * Remove the specified resource from storage.
     *
     *
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {

        $success = ProjectAttachment::findOrFail($id)->delete();
        if (!isset($success)) {
            $response = ['success' => false, 'msg' => 'Project Attachment Removal Not Implemented Yet.'];
        } elseif ($success) {
            $response = ['success' => true, 'msg' => 'Project Attachment Removal Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Project Attachment Removal Failed.'];
        }

        return view('springintoaction::admin.main.response', compact('response'));
    }

    public function batchDestroy(Request $request)
    {
        $params = $request->all();
        $batchSuccess = true;
        if (is_array($params['deleteModelIDs'])) {
            foreach ($params['deleteModelIDs'] as $modelID) {
                $success = ProjectAttachment::findOrFail($modelID)->delete();
                if (!$success) {
                    $batchSuccess = false;
                }
            }
        } else {
            $success = false;
        }
        $success = $batchSuccess;

        if (!isset($success)) {
            $response = ['success' => false, 'msg' => 'Project Attachment Batch Removal Not Implemented Yet.'];
        } elseif ($success) {
            $response = ['success' => true, 'msg' => 'Project Attachment Batch Removal Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Project Attachment Batch Removal Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function getProjectAttachments($ProjectID)
    {
        // Need to return an array for the grid
        $results = [];
        try {
            if ($model = ProjectAttachment::where('ProjectID', $ProjectID)->get()) {
                $results = $model->toArray();
                foreach ($results as $key => $attachment) {
                    $attachmentPath = $attachment['AttachmentPath'];
                    if (\preg_match("/^.*\/storage\/app/", $attachmentPath)) {
                        $attachment['AttachmentPath'] =
                            preg_replace(
                                "/^.*\/storage\/app/",
                                "/admin/project_attachment/stream/storage/app",
                                $attachment['AttachmentPath']
                            );
                        $results[$key] = $attachment;
                    }
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::debug(
                '',
                [
                    'File:' . __FILE__,
                    'Method:' . __METHOD__,
                    'Line:' . __LINE__,
                    $e->getMessage()
                ]
            );
        }

        return $results;
    }
}
