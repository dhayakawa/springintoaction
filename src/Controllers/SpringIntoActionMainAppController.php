<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;
    //use Illuminate\Support\Facades\Config;
    use Illuminate\Support\Facades\Log;
    use Illuminate\Http\Request;
    use Dhayakawa\SpringIntoAction\Models\Project;
    use Dhayakawa\SpringIntoAction\Models\Site;
    use Dhayakawa\SpringIntoAction\Models\SiteStatus;
    use Dhayakawa\SpringIntoAction\Models\ProjectContact;
    use Dhayakawa\SpringIntoAction\Models\Contact;
    use Dhayakawa\SpringIntoAction\Models\Budget;
    use Dhayakawa\SpringIntoAction\Models\ProjectRole;
    use Dhayakawa\SpringIntoAction\Models\Volunteer;
    use Dhayakawa\SpringIntoAction\Models\ProjectVolunteerRole;

    class SpringIntoActionMainAppController extends BaseController {

        public function index(Request $request) {
            //\Illuminate\Support\Facades\Log::debug('', ['File:' . __FILE__, 'Method:' . __METHOD__, 'Line:' . __LINE__, Config::all()]);
            $year = $request->input('year');
            $Year = $year ?: date('Y');

            try {
                $sites = Site::orderBy('SiteName', 'asc')
                    ->get()->toArray();
                $site = current($sites);
            } catch(\Exception $e) {
                $sites = [];
                $site = [];
                report($e);
            }
            try {
                $siteStatus = current(Site::find($site['SiteID'])->status()->where('Year', $Year)->orderBy('Year', 'desc')->get()->toArray());
            } catch(\Exception $e) {
                $siteStatus = [];
                report($e);
            }

            try {
                $site_years = SiteStatus::select('SiteStatusID','SiteID','Year')->where('SiteID', $site['SiteID'])->orderBy('Year', 'desc')->get()->toArray();
            } catch(\Exception $e) {
                $site_years = [];
                report($e);
            }
            try {
                $projects = Project::join('site_status', 'projects.SiteStatusID', '=', 'site_status.SiteStatusID')
                    ->where('site_status.SiteStatusID', $siteStatus['SiteStatusID'])->orderBy('projects.SequenceNumber', 'asc')->get()->toArray();
                $project = current($projects);
            } catch(\Exception $e) {
                $projects = [];
                $project = [];
                report($e);
            }

            try {
                $contacts = Site::find($site['SiteID'])->contacts;
                $contacts = $contacts ? $contacts->toArray() : [];
            } catch(\Exception $e) {
                $contacts = [];
                report($e);
            }
            try {
                $all_contacts = Contact::orderBy('LastName','asc')->get();
                $all_contacts = $all_contacts ? $all_contacts->toArray() : [];
            } catch(\Exception $e) {
                $all_contacts = [];
                report($e);
            }

            try {
                $model = new ProjectVolunteerRole();
                $project_leads = $model->getProjectLeads($project['ProjectID']);

            } catch(\Exception $e) {
                $project_leads = [];
                report($e);
            }
            try {
                $projectContact = new ProjectContact();
                $project_contacts = $projectContact->getProjectContacts($project['ProjectID']);
                $project_contacts = $project_contacts ?: [];
            } catch(\Exception $e) {
                $project_contacts = [];
                report($e);
            }
            try {
                $project_volunteers = Project::find($project['ProjectID'])->volunteers;
                $project_volunteers = $project_volunteers ? $project_volunteers : [];
            } catch(\Exception $e) {
                $project_volunteers = [];
                report($e);
            }
            try {
                $project_budgets = Project::find($project['ProjectID'])->budgets;
                $project_budgets = $project_budgets ? $project_budgets->toArray() : [];
            } catch(\Exception $e) {
                $project_budgets = [];
                report($e);
            }
            try {
                $volunteers = Volunteer::orderBy('LastName', 'asc')
                    ->get()->toArray();
            } catch(\Exception $e) {
                $volunteers = [];
                report($e);
            }
            $appInitialData = compact(['Year', 'site', 'site_years', 'siteStatus', 'contacts', 'project','projects', 'sites','project_leads', 'project_budgets', 'project_contacts','project_volunteers', 'volunteers','all_contacts']);

            return view('springintoaction::admin.main.app', $request, compact('appInitialData'));
        }

        private function dbSqlfix(){
            \file_put_contents('/home/vagrant/code/laravel/public/insert_fixed.txt', '', null);
            $aInsert = file('/home/vagrant/code/laravel/public/insert.txt');

            foreach($aInsert as $insertLine) {
                list($pre, $values) = preg_split("/\) VALUES \(/", trim($insertLine));
                $values       = preg_replace("/\);$/", "", $values);
                $aValues      = str_getcsv($values, ',', "'");
                $aFixedValues = [];
                foreach($aValues as $idx => $fieldValue) {
                    $fieldValue = trim($fieldValue);
                    $i          = $idx + 1;
                    //echo "{$i}:{$fieldValue}<br>";
                    switch($i) {
                        case 7:
                        case 8:
                        case 9:
                        case 12:
                        case 13:
                        case 14:
                        case 17:
                        case 18:
                        case 19:
                        case 26:
                        case 27:
                        case 28:
                        case 29:
                        case 30:
                        case 31:
                        case 32:
                        case 33:
                        case 34:
                        case 35:
                        case 41:
                        case 43:
                            if($fieldValue == 'NULL' || empty($fieldValue) || $fieldValue == "''") {
                                $aFixedValues[$idx] = "''";
                            } else {
                                $quotedFieldValue   = "'" . trim($fieldValue, "'") . "'";
                                $aFixedValues[$idx] = $quotedFieldValue;
                            }
                            break;
                        case 1:
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                        case 10:
                        case 11:
                        case 15:
                        case 16:
                        case 20:
                        case 21:
                        case 22:
                        case 23:
                        case 24:
                        case 25:
                        case 36:
                        case 37:
                        case 38:
                        case 39:
                        case 40:
                        case 42:
                            if($fieldValue == 'NULL' || $fieldValue == "''") {
                                $aFixedValues[$idx] = "0";
                            } else {
                                $aFixedValues[$idx] = str_replace("'", "", $fieldValue);
                            }
                            break;
                        case 44:
                        case 45:
                            $type = gettype($fieldValue);

                            //echo "case {$i}:{$idx}:{$fieldValue}:type={$type}:". (int)($fieldValue == NULL)."<br>";
                            if($fieldValue === 'NULL' || $fieldValue === "''") {
                                //echo "setting({$idx}):{$i}:{$fieldValue}<br>";
                                $aFixedValues[$idx] = "'2018-02-13 04:23:38'";
                                //echo "set({$idx}):{$i}:{$fieldValue}:{$aFixedValues[$idx]}<br>";
                            } else {
                                $quotedFieldValue   = "'" . trim($fieldValue, "'") . "'";
                                $aFixedValues[$idx] = $quotedFieldValue;
                            }
                            break;
                        default:
                            //echo "default:{$i}:{$fieldValue}<br>";
                            $aFixedValues[$idx] = $fieldValue;
                    }
                }
                //echo '<pre>' . print_r($aValues, 1) . print_r($aFixedValues, 1) . '</pre>';
                $fixedSql = join(',', $aFixedValues);
                $newSql   = $pre . ') VALUES (' . $fixedSql . ');';
                echo "<pre>$newSql</pre>";

                file_put_contents('/home/vagrant/code/laravel/public/insert_fixed.txt', $newSql . PHP_EOL, \FILE_APPEND);

            }
            die;
        }
    }
