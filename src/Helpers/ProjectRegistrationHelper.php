<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 12/15/2018
 * Time: 10:42 AM
 */

namespace Dhayakawa\SpringIntoAction\Helpers;

use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Database\Eloquent\Builder;
use Dhayakawa\SpringIntoAction\Models\AnnualBudget;
use Dompdf\Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Dhayakawa\SpringIntoAction\Models\Project;
use Dhayakawa\SpringIntoAction\Models\Site;
use Dhayakawa\SpringIntoAction\Models\SiteStatus;
use Dhayakawa\SpringIntoAction\Models\ProjectContact;
use Dhayakawa\SpringIntoAction\Models\Contact;
use Dhayakawa\SpringIntoAction\Models\Budget;
use Dhayakawa\SpringIntoAction\Models\ProjectRole;
use Dhayakawa\SpringIntoAction\Models\SiteRole;
use Dhayakawa\SpringIntoAction\Models\SiteVolunteerRole;
use Dhayakawa\SpringIntoAction\Models\Volunteer;
use Dhayakawa\SpringIntoAction\Models\ProjectVolunteerRole;
use \Dhayakawa\SpringIntoAction\Models\BudgetSourceOptions;
use \Dhayakawa\SpringIntoAction\Models\BudgetStatusOptions;
use \Dhayakawa\SpringIntoAction\Models\ProjectSkillNeededOptions;
use \Dhayakawa\SpringIntoAction\Models\ProjectStatusOptions;
use \Dhayakawa\SpringIntoAction\Models\SendStatusOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerAgeRangeOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerPrimarySkillOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerSkillLevelOptions;
use \Dhayakawa\SpringIntoAction\Models\VolunteerStatusOptions;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Input;
use Dhayakawa\SpringIntoAction\Models\ProjectAttachment;
use Dhayakawa\SpringIntoAction\Requests\ProjectRequestPost;
use Illuminate\Support\Facades\App;

trait ProjectRegistrationHelper
{
    public function getCurrentYear()
    {
        $yearNow = date('Y');
        $month = date('n');

        // need to make sure the year is for the upcoming/next spring
        // or this spring if the month is less than may
        return $month > 5 ? $yearNow + 1 : $yearNow;
    }

    /**
     * @param $option_label
     *
     * @return mixed
     */
    public function getProjectStatusOptionIDByLabel($option_label)
    {
        $projectStatusOptions = new ProjectStatusOptions();
        $ProjectStatusOptionID = $projectStatusOptions->getOptionIDByLabel('Approved');

        return $ProjectStatusOptionID;
    }

    /**
     * @return array
     */
    public function getProjectSkillNeededOptions()
    {
        try {
            $aProjectSkillNeededOptions = [];
            $ProjectSkillNeededOptions =
                ProjectSkillNeededOptions::select('id AS option_value', 'option_label')->orderBy(
                    'DisplaySequence',
                    'asc'
                )->get();
            $ProjectSkillNeededOptions = $ProjectSkillNeededOptions ? $ProjectSkillNeededOptions->toArray() : [];
            foreach ($ProjectSkillNeededOptions as $option) {
                if (!empty($option['option_label'])) {
                    $aProjectSkillNeededOptions[$option['option_label']] = $option['option_value'];
                }
            }
        } catch (\Exception $e) {
            $aProjectSkillNeededOptions = [];
            report($e);
        }

        return $aProjectSkillNeededOptions;
    }

    /**
     * @param array $filters
     * @param null  $orderBy
     *
     * @return array|mixed
     */
    public function getProjectList($filters = [], $orderBy = null)
    {
        try {
            $projectModel = new Project();
            $all_projects = $projectModel->getRegistrationProjects($this->getCurrentYear(), $filters, $orderBy);
        } catch (\Exception $e) {
            $all_projects = [];

            report($e);
        }

        return $all_projects;
    }

    /**
     * @return array
     */
    public function getProjectFilterGroups()
    {
        return ['skill' => [], 'site' => [], 'peopleNeeded' => [], 'childFriendly' => []];
    }

    /**
     * @param array $all_projects
     *
     * @return array
     */
    public function getProjectFilters($all_projects = [])
    {
        $projectFilters = $this->getProjectFilterGroups();
        $sites = Site::join('site_status', 'sites.SiteID', '=', 'site_status.SiteID')->where(
            'site_status.Year',
            $this->getCurrentYear()
        )->orderBy('SiteName', 'asc')->get()->toArray();

        $aSiteNames = array_values(array_unique($this->getArrayFieldValues('SiteName', $all_projects)));
        sort($aSiteNames);
        foreach ($aSiteNames as $siteName) {
            $fieldID = $this->findArrayKeyByFieldValue('SiteID', 'SiteName', $siteName, $sites);
            $projectFilters['site'][] = [
                'filterIcon' => '',
                'filterName' => 'filter[site][]',
                'filterId' => 'filter_site_' . $fieldID,
                'filterLabel' => $siteName,
                'FilterIsChecked' => '',
                'Field' => 'sites.SiteName',
                'FieldID' => $fieldID,
            ];
        }

        $aProjectSkillNeededOptions = $this->getProjectSkillNeededOptions();
        ksort($aProjectSkillNeededOptions);
        $generalSkillID = $aProjectSkillNeededOptions['General'];

        $aPrimarySkillNeeded = [];
        $aPrimarySkillNeededRaw =
            array_values(array_unique($this->getArrayFieldValues('PrimarySkillNeeded', $all_projects)));
        if (!empty($aPrimarySkillNeededRaw)) {
            foreach ($aPrimarySkillNeededRaw as $rawSkillID) {
                $aRawSkills = preg_split("/,/", $rawSkillID);
                foreach ($aRawSkills as $tmpRawSkillID) {
                    if ($tmpRawSkillID === '') {
                        $tmpRawSkillID = $generalSkillID;
                    }
                    if (!in_array($tmpRawSkillID, $aPrimarySkillNeeded)) {
                        $aPrimarySkillNeeded[] = $tmpRawSkillID;
                    }
                }
            }
        }

        $aFilterIcons = [
            'General' => '<i title="General" class="skills-icon filter-list-item-icon general-skill-icon"></i>',
            'Painting' => '<i title="Painting" class="skills-icon filter-list-item-icon painting-icon"></i>',
            'General Carpentry' => '<i title="General Carpentry" class="skills-icon filter-list-item-icon general-carpentry-icon"></i>',
            'Finish Carpentry' => '<i title="Finish Carpentry" class="skills-icon filter-list-item-icon finish-carpentry-icon"></i>',
            'Landscaping' => '<i title="Landscaping" class="skills-icon filter-list-item-icon landscaping-icon"></i>',
            'Construction' => '<i title="Construction" class="skills-icon filter-list-item-icon construction-icon"></i>',
            'Cabinetry' => '<i title="Cabinetry" class="skills-icon filter-list-item-icon cabinetry-icon"></i>',
            'Cleaning' => '<i title="Cleaning" class="skills-icon filter-list-item-icon cleaning-icon"></i>',
        ];
        $aSkillAdded = [];
        foreach ($aProjectSkillNeededOptions as $skill => $skillID) {
            $bExistsInProjectList = preg_grep("/{$skillID}/", $aPrimarySkillNeeded);
            if ($bExistsInProjectList && !in_array($skillID, $aSkillAdded)) {
                $projectFilters['skill'][] = [
                    'filterIcon' => $aFilterIcons[$skill],
                    'filterName' => 'filter[skill][]',
                    'filterLabel' => $skill,
                    'filterId' => 'filter_skill_' . $skillID,
                    'FilterIsChecked' => '',
                    'Field' => 'projects.PrimarySkillNeeded',
                    'FieldID' => $skillID,
                ];
                $aSkillAdded[] = $skillID;
            }
        }

        $aChildFriendlyIcons = [
            'Yes' => '<i title="Child Friendly" class="text-success fas fa-child"></i>',
            'No' => '<i title="Child Friendly" class="text-danger fas fa-child"></i>',
        ];
        $aChildFriendly = array_values(array_unique($this->getArrayFieldValues('ChildFriendly', $all_projects)));
        sort($aChildFriendly);
        foreach ($aChildFriendly as $childFriendly) {
            $childFriendly = $childFriendly === 0 ? 'No' : 'Yes';
            $projectFilters['childFriendly'][] = [
                'filterIcon' => $aChildFriendlyIcons[$childFriendly],
                'filterName' => 'filter[childFriendly][]',
                'filterId' => 'filter_childFriendly_' . $childFriendly,
                'filterLabel' => $childFriendly,
                'FilterIsChecked' => '',
                'Field' => 'projects.ChildFriendly',
                'FieldID' => '',
            ];
        }

        $aPeopleNeeded = array_values(array_unique($this->getArrayFieldValues('PeopleNeeded', $all_projects)));
        sort($aPeopleNeeded);
        $iMaxRange = 20;
        $range = 5;
        $aRanges = [];
        $iPeopleNeededCnt = count($aPeopleNeeded);
        $iCnt = 0;
        foreach ($aPeopleNeeded as $iAmt) {
            if ($iAmt > $range) {
                //echo 'iAmt:' . $iAmt . PHP_EOL;
                $remainder = $iAmt % $range;
                //echo $remainder . PHP_EOL;
                $iRange = $iAmt - $remainder;
                if (!in_array($iRange, $aRanges)) {
                    //echo $iRange . PHP_EOL;
                    $iCurrentMax = empty($aRanges) ? 0 : max($aRanges);
                    if($iCnt === $iPeopleNeededCnt - 1 && $iCurrentMax < $iMaxRange && $iRange > $iMaxRange){
                        $iRange = $iCurrentMax === 0 ? 10 : $iCurrentMax + $range;
                    }
                    $aRanges[] = $iRange;
                }
            }
            $iCnt++;
        }
        foreach ($aRanges as $idx => $peopleNeeded) {
            if ($peopleNeeded > $iMaxRange) {
                continue;
            }
            $projectFilters['peopleNeeded'][] = [
                'filterIcon' => '',
                'filterName' => 'filter[peopleNeeded][]',
                'filterId' => 'filter_peopleNeeded' . $idx,
                'filterLabel' => $peopleNeeded,
                'FilterIsChecked' => '',
                'Field' => 'projects.PeopleNeeded',
                'FieldID' => '',
            ];
        }

        return $projectFilters;
    }

    /**
     * @param $field
     * @param $arr
     *
     * @return array
     */
    public function getArrayFieldValues($field, $arr)
    {
        $aValues = [];
        if (!empty($arr)) {
            foreach ($arr as $data) {
                if (isset($data[$field])) {
                    $aValues[] = $data[$field];
                }
            }
        }

        return $aValues;
    }

    /**
     * @param $field
     * @param $key
     * @param $value
     * @param $arr
     *
     * @return null
     */
    public function findArrayKeyByFieldValue($field, $key, $value, $arr)
    {
        if (!empty($arr)) {
            foreach ($arr as $data) {
                if (isset($data[$key]) && $data[$key] === $value) {
                    return $data[$field];
                }
            }
        }

        return null;
    }
}
