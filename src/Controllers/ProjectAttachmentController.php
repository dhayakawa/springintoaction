<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 4/9/2018
 * Time: 7:05 PM
 */
namespace Dhayakawa\SpringIntoAction\Controllers;

use Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
use Dhayakawa\SpringIntoAction\Models\ProjectAttachment;
use Dhayakawa\SpringIntoAction\Models\Project;
use Illuminate\Http\Request;

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
        $aAttachmentPaths = preg_split("/,/", $data['AttachmentPath']);
        $bSuccess = true;
        foreach($aAttachmentPaths as $path){
            $model = new ProjectAttachment;
            $aData = ['ProjectID' => $data['ProjectID'], 'AttachmentPath' => $path];
            $model->fill($aData);

            $success = $model->save();
            if(!$success){
                $bSuccess = false;
            }
        }

        if ($bSuccess) {
            $response = ['success' => true, 'msg' => 'Project Attachment Creation Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Project Attachment Creation Failed.'];
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
     * @param  int $id
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
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
            if ($b = ProjectAttachment::where('ProjectID', $ProjectID)) {
                $results = $b->toArray();
            }
        } catch (\Exception $e) {
        }
        $attachments = [];

        return $attachments;
    }

    public function upload(Request $request)
    {
        $Attachments = [];
        if ($request->hasFile('project_attachment') && $request->file('project_attachment')->isValid()) {
            $file = $request->file('project_attachment');
            $fileName = $file->getClientOriginalName();

            $Attachments[] = $request->project_attachment->storePubliclyAs('uploads/project_attachments', $fileName);
        }
        // $aaOptions['upload_dir'] = 'uploads/';
        // $aaOptions['upload_url'] = 'admin/project_attachment/upload/';
        // $oAjaxUploadHandler = new ajaxUploader($aaOptions);
        $response = ['success' => true, 'msg' => 'Project Attachment Upload Succeeded.', 'files' =>
            $Attachments];
        return view('springintoaction::admin.main.response', $request, compact('response'));
    }
}
