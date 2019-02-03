<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 1/26/2019
 * Time: 1:34 PM
 */

namespace Dhayakawa\SpringIntoAction\Controllers;

use Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
use Dhayakawa\SpringIntoAction\Models\SiteSetting;
use Illuminate\Http\Request;

class SiteSettingsManagement extends BaseController
{
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param $id
     *
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $model = SiteSetting::findOrFail($id);
        
        $data = $request->only($model->getFillable());
        array_walk(
            $data,
            function (&$value, $key) use($data) {
                if (is_string($value)) {
                    $value = \urldecode($value);
                }
            }
        );
        if (empty($data['sunrise'])) {
            $data['sunrise'] = null;
        }
        if (empty($data['sunset'])) {
            $data['sunset'] = null;
        }
        $model->fill($data);
        $success = $model->save();
        
        if ($success) {
            $response = ['success' => true, 'msg' => 'Site Setting Update Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Site Setting Update Failed.'];
        }
        
        return view('springintoaction::admin.main.response', $request, compact('response'));
    }
    
    public function getSettings()
    {
        return SiteSetting::orderBy('setting', 'asc')->get()->toArray();
    }
}
