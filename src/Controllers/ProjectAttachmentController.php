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

        $aAttachmentPaths = array_filter(preg_split("/(\r\n|\n)/", $data['AttachmentPath']));
        $bSuccess = !empty($aAttachmentPaths);
        $aFailedPaths = [];
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

        if ($bSuccess) {
            $response = ['success' => true, 'msg' => 'Project Attachment Creation Succeeded.'];
        } else {
            $response = [
                'success' => false,
                'msg' => 'Project Attachment Creation Failed on:' . join(
                        '</br>',
                        $aFailedPaths
                    )
            ];
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
            if ($model = ProjectAttachment::where('ProjectID', $ProjectID)->get()) {
                $results = $model->toArray();
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' .
                                                                                                    __LINE__,$e->getMessage()]);
        }
\Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__, $ProjectID,$results]);
        return $results;
    }
}
