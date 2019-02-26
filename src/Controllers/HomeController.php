<?php

namespace Dhayakawa\SpringIntoAction\Controllers;

use \Dhayakawa\SpringIntoAction\Controllers\FrontendBackboneAppController as BaseController;
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
use Dhayakawa\SpringIntoAction\Models\SiteSetting;
use Illuminate\Support\Facades\Auth;

class HomeController extends BaseController
{
    use \Dhayakawa\SpringIntoAction\Helpers\ProjectRegistrationHelper;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('web');
    }

    /**
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function index(Request $request)
    {
        $appInitialData = [];
        $SiteSetting = new SiteSetting();
        $aSiteSettingResult = $SiteSetting->getIsSettingOn('open_registration');

        $bShowProjectRegistration = $aSiteSettingResult['on'];
        if ($bShowProjectRegistration) {
            $yearNow = date('Y');
            $month = date('n');

            // need to make sure the year is for the upcoming/next spring
            // or this spring if the month is less than may
            $Year = $month > 5 ? $yearNow + 1 : $yearNow;
            $bIsLocalEnv = App::environment('local');

            $all_projects = $this->getProjectList();
            $projectFilters = $this->getProjectFilters($all_projects);
            $project = $select_options = $auth = $project_volunteers = $volunteers = [];
            $aProjectSkillNeededOptions = $this->getProjectSkillNeededOptions();
            $select_options = [
                'ProjectSkillNeededOptions' => $aProjectSkillNeededOptions,
            ];
            $random = rand(0, time());
            $appInitialData = compact(
                [
                    'random',
                    'all_projects',
                    'project',
                    'select_options',
                    'bIsLocalEnv',
                    'auth',
                    'project_volunteers',
                    'volunteers',
                    'projectFilters',
                ]
            );

            $this->makeJsFiles(compact('appInitialData'));
        }

        $groveApi = new GroveApi();
        //$response = $groveApi->api_status();
        //$groveApi->importIndividuals(true,false);
        //$groveApi->importFamilyMemberType();

        // $response = $groveApi->family_list();
        // echo '<pre>' . print_r($response, true) . '</pre>';

        //$response = $groveApi->group_search(['department_id' => 10]);
        //$response = $groveApi->individual_groups(797);
        //$response = $groveApi->family_list(512);


        return view('welcome', $request, compact('bShowProjectRegistration', 'appInitialData'));
    }

    public function makeJsFiles($appInitialData)
    {
        //packages/dhayakawa/springintoaction/src/resources/assets/js/frontend/registration/springintoaction.templates.js
        //public/js/frontend/registration/springintoaction.templates.js
        $content = "window.JST = {};" . \PHP_EOL;

        try {
            $files = \glob(
                base_path() .
                "/resources/views/vendor/springintoaction/frontend/registration/backbone/*.backbone.template.php"
            );

            foreach ($files as $file) {
                $templateID = str_replace('.backbone.template.php', '', basename($file));
                $fileContents = preg_replace(
                    ["/(\r\n|\n)/", "/\s+/", "/> </"],
                    ["", " ", "><"],
                    addcslashes(\file_get_contents($file), '"')
                );
                $content .= "window.JST['{$templateID}'] = _.template(
                        \"{$fileContents}\"
                    );" . \PHP_EOL;
            }

            if (\file_exists(
                base_path() . "/packages/dhayakawa/springintoaction/src/resources/assets/js/frontend/registration"
            )
            ) {
                \file_put_contents(
                    base_path() .
                    "/packages/dhayakawa/springintoaction/src/resources/assets/js/frontend/registration/springintoaction.templates.js",
                    $content
                );
            }
            \file_put_contents(
                base_path() . "/public/js/frontend/registration/springintoaction.templates.js",
                $content
            );

            $contentView =
                view('springintoaction::frontend.registration.backbone.app-initial-models-vars-data', $appInitialData);
            $content = $contentView->render();
            if (\file_exists(
                base_path() . "/packages/dhayakawa/springintoaction/src/resources/assets/js/frontend/registration"
            )
            ) {
                \file_put_contents(
                    base_path() .
                    "/packages/dhayakawa/springintoaction/src/resources/assets/js/frontend/registration/app-initial-models-vars-data.js",
                    $content
                );
            }
            \file_put_contents(
                base_path() . "/public/js/frontend/registration/app-initial-models-vars-data.js",
                $content
            );

            $contentView = view(
                'springintoaction::frontend.registration.backbone.app-initial-collections-view-data',
                $appInitialData
            );
            $content = $contentView->render();
            if (\file_exists(
                base_path() . "/packages/dhayakawa/springintoaction/src/resources/assets/js/frontend/registration"
            )
            ) {
                \file_put_contents(
                    base_path() .
                    "/packages/dhayakawa/springintoaction/src/resources/assets/js/frontend/registration/app-initial-collections-view-data.js",
                    $content
                );
            }
            \file_put_contents(
                base_path() . "/public/js/frontend/registration/app-initial-collections-view-data.js",
                $content
            );
        } catch (\Exception $e) {
            report($e);
        }
    }
}
