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
        //echo bcrypt('jack1455');
        $appInitialData = [];
        $SiteSetting = new SiteSetting();
        $aSiteSettingResult = $SiteSetting->getIsSettingOn('open_registration');

        $user = Auth::user();

        $bShowProjectRegistration = $aSiteSettingResult['on'];
        $preRegistrationMsg = '';
        if($user !== null && !$bShowProjectRegistration){
            $aSiteSettingPrivateResult = $SiteSetting->getIsSettingOn('allow_private_registration');
            $bShowProjectRegistration = $aSiteSettingPrivateResult['on'];
            $preRegistrationMsg = "<div class=\"pre-registration-msg\" style='position:absolute;width:400px;text-align:right;bottom:0;right:0;font-weight:bold;'>*This pre-registration is not open to the public yet.</div>";
        }
        if ($bShowProjectRegistration) {

            $Year = $this->getCurrentYear();
            $bIsLocalEnv = App::environment('local');
            $remoteIPAddress = $_SERVER['REMOTE_ADDR'];
            $churchIPAddress = $SiteSetting->getSettingValue('church_ip_address');
            if($SiteSetting->getIsSettingOn('force_kiosk_environment')['on']){
                $churchIPAddress = $remoteIPAddress;
            }
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
                    'churchIPAddress',
                    'remoteIPAddress',
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

        return view('welcome', $request, compact('bShowProjectRegistration','preRegistrationMsg', 'appInitialData'));
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
