<?php

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;

    use Illuminate\Http\Request;
    use Dhayakawa\SpringIntoAction\Models\Project;
    use Dhayakawa\SpringIntoAction\Models\Site;
    use Dhayakawa\SpringIntoAction\Models\SiteStatus;
    use Dhayakawa\SpringIntoAction\Models\Contact;
    use Dhayakawa\SpringIntoAction\Models\Budget;
    use Dhayakawa\SpringIntoAction\Models\ProjectRole;
    use Dhayakawa\SpringIntoAction\Models\Volunteer;
    use Dhayakawa\SpringIntoAction\Models\ProjectVolunteerRole;

    class SpringIntoActionMainAppController extends BaseController {

        public function index(Request $request) {

            $year = $request->input('year');
            $Year = $year ?: date('Y');

            try {
                $sites = Site::orderBy('SiteName', 'asc')
                    ->get()->toArray();
                $site = current($sites);
            } catch(\Exception $e) {
                $sites = [];
                $site = [];
                die($e->getMessage());
            }
            try {
                $siteStatus = current(Site::find($site['SiteID'])->status->where('Year', $Year)->toArray());
            } catch(\Exception $e) {
                $siteStatus = [];
                die($e->getMessage());
            }

            try {
                $site_years = SiteStatus::select('SiteStatusID','SiteID','Year')->where('SiteID', $site['SiteID'])->orderBy('Year', 'asc')->get()->toArray();
            } catch(\Exception $e) {
                $site_years = [];
                die($e->getMessage());
            }
            try {
                $projects = Site::find($site['SiteID'])->projects()->where('Year', $Year)->orderBy('SequenceNumber', 'asc')->get()->toArray();
                $project = current($projects);
            } catch(\Exception $e) {
                $projects = [];
                $project = [];
                die($e->getMessage());
            }

            try {
                $contacts = Site::find($site['SiteID'])->contacts->toArray();
            } catch(\Exception $e) {
                $contacts = [];
                die($e->getMessage());
            }

            //die("<pre>" . print_r($projects, 1));
            try {
                // Gave up on the Eloquent relational model
                $project_leads = Volunteer::join('project_volunteer_role', 'volunteers.VolunteerID', '=', 'project_volunteer_role.VolunteerID')
                    ->join('project_roles', 'project_volunteer_role.ProjectRoleID', '=', 'project_roles.ProjectRoleID')
                    ->where('project_volunteer_role.ProjectID', $project['ProjectID'])->get()->toArray();

            } catch(\Exception $e) {
                $project_leads = [];
            }

            try {
                $project_volunteers = Project::find($project['ProjectID'])->volunteers->toArray();
            } catch(\Exception $e) {
                $project_volunteers = [];
                die($e->getMessage());
            }
            try {
                $project_budget = Project::find($project['ProjectID'])->budget->toArray();
                //$project_budget = Project::find($project['ProjectID'])->budget()->toSql();
                //echo $project['ProjectID'];
                //die($project_budget);
            } catch(\Exception $e) {
                $project_budget = [];
                die($e->getMessage());
            }
            $appInitialData = compact(['Year', 'site', 'site_years', 'siteStatus', 'contacts', 'project','projects', 'sites','project_leads','project_volunteers','project_budget']);

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
