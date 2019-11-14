<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 1/26/2019
 * Time: 1:27 PM
 */

namespace Dhayakawa\SpringIntoAction\Models;

use Exception;
use Illuminate\Database\Eloquent\Model;

class SiteSetting extends BaseModel
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'site_settings';
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'SiteSettingID';
    protected $fillable = [
        'setting',
        'value',
        'description',
        'message',
        'sunrise',
        'sunset',
    ];
    private $defaultRecordData = [];

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

        return $this->defaultRecordData;
    }

    public function getIsSettingOn($setting)
    {
        $aResult = ['on' => false, 'message' => ''];
        try {
            $siteSetting = $this->where('setting', '=', $setting)->get();
            if ($siteSetting->count()) {
                $site_setting = $siteSetting->first()->toArray();
                $aResult['on'] = $site_setting['value'];
                if ($aResult['on'] && !empty($site_setting['sunrise'])) {
                    $now = time();
                    if ($now < strtotime($site_setting['sunrise']) || $now > strtotime($site_setting['sunrise'])) {
                        $aResult['on'] = false;
                    }
                }
                if (!$aResult['on']) {
                    $aResult['message'] = $site_setting['message'];
                }
            }
        } catch (\Exception $e) {
            echo $e->getMessage();
        }

        return $aResult;
    }

    public function getSettingValue($setting)
    {
        $value = null;
        try {
            $siteSetting = $this->where('setting', '=', $setting)->get();
            if ($siteSetting->count()) {
                $site_setting = $siteSetting->first()->toArray();
                $value = $site_setting['value'];
            }

        } catch (\Exception $e) {
            echo $e->getMessage();
        }

        return $value;
    }
}
