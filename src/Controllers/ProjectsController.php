<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/12/2018
     * Time: 8:26 AM
     */

    namespace Dhayakawa\SpringIntoAction\Controllers;

    use \Dhayakawa\SpringIntoAction\Controllers\BackboneAppController as BaseController;

    use Illuminate\Http\Request;

    use Dhayakawa\SpringIntoAction\Models\Project;
    use Dhayakawa\SpringIntoAction\Models\Site;
    use Dhayakawa\SpringIntoAction\Models\Volunteer;
    use Dhayakawa\SpringIntoAction\Models\Budget;

    class ProjectsController extends BaseController {

        /**
         * Create a new controller instance.
         *
         * @return void
         */
        public function __construct() {
            $this->middleware('ability:admin,projects_crud', [
            ]);
        }

        public function index(Request $request) {
            $projects = Project::all();

            return view('admin.projects.list', $request, compact('projects'));
        }

        public function create(Request $request) {
            $project = new Project;

            return view('admin.projects.edit', $request, compact('project'));
        }

        public function store(EditProjectRequest $request) {

            $project = new Project;
            $project->fill($request->only($project->getFillable()));
            $project->save();

            return redirect()->route('projects.index')->with('success_message', 'The project has been successfully saved.');
        }

        public function update(Request $request, $ProjectID) {
            $project = Project::findOrFail($ProjectID);

            $project->fill($request->only($project->getFillable()));
            $success = $project->save();

            if($success) {
                $response = ['success' => true, 'msg' => 'Project Update Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Project Update Failed.'];
            }


            return view('springintoaction::admin.main.response', $request, compact('response'));

        }

        public function destroy(Request $request, $id) {
            $success = Project::findOrFail($id)->delete();

            if($success) {
                $response = ['success' => true, 'msg' => 'Project Delete Succeeded.'];
            } else {
                $response = ['success' => false, 'msg' => 'Project Delete Failed.'];
            }


            return view('springintoaction::admin.main.response', $request, compact('response'));
        }

        public function getSiteProjects($SiteID, $Year) {
            return $projects = Site::find($SiteID)->projects()->where('Year', $Year)->orderBy('SequenceNumber', 'asc')->get()->toArray();
        }

        public function getLeadVolunteers($ProjectID) {
            // Gave up on the Eloquent relational model
            return $project_leads = Volunteer::join('project_volunteer_role', 'volunteers.VolunteerID', '=', 'project_volunteer_role.VolunteerID')
                ->join('project_roles', 'project_volunteer_role.ProjectRoleID', '=', 'project_roles.ProjectRoleID')
                ->where('project_volunteer_role.ProjectID', $ProjectID)->get()->toArray();
        }

        public function getBudget($ProjectID) {
            // Need to return an array for the grid
            $result = [];
            try {
                if($b = Project::find($ProjectID)->budget) {
                    $result = [$b->toArray()];
                }
            } catch(\Exception $e) {

            }

            return $result;
        }

        public function getContact($ProjectID) {
            // Need to return an array for the grid
            try {
                if($c = Project::find($ProjectID)->contact) {
                    return [$c->toArray()];
                }
            } catch(\Exception $e) {
                return [];
            }

            return [];
        }

        public function getVolunteers($ProjectID) {
            try {
                if($v = Project::find($ProjectID)->volunteers) {
                    return $v->toArray();
                }
            } catch(\Exception $e) {
                return [];
            }

            return [];
        }

        public function getProject($ProjectID) {
            try {
                if($project = Project::where('ProjectID', $ProjectID)->get()) {
                    return current($project->toArray());
                }
            } catch(\Exception $e) {
                return [];
            }

            return [];
        }
    }
