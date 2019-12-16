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
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Dhayakawa\SpringIntoAction\Models\Project;
use Dhayakawa\SpringIntoAction\Models\Site;
use Dhayakawa\SpringIntoAction\Models\SiteStatus;
use Dhayakawa\SpringIntoAction\Models\Volunteer;
use Dhayakawa\SpringIntoAction\Models\ProjectVolunteer;
use \Dhayakawa\SpringIntoAction\Models\ProjectVolunteerRole;
use Dhayakawa\SpringIntoAction\Models\Budget;
use Dhayakawa\SpringIntoAction\Controllers\ajaxUploader;
use Dhayakawa\SpringIntoAction\Models\ProjectAttachment;
use Dhayakawa\SpringIntoAction\Models\ProjectScope;
use Dhayakawa\SpringIntoAction\Models\ProjectAttribute;
use Dhayakawa\SpringIntoAction\Models\Workflow;

class ProjectsController extends BaseController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        //$this->middleware('ability:admin,projects_crud', [
        //]);
    }

    public function index(Request $request)
    {
        $projects = Project::all();

        return view('admin.projects.list', $request, compact('projects'));
    }

    public function create(Request $request)
    {
        $project = new Project;

        return view('admin.projects.edit', $request, compact('project'));
    }

    public function storeProjectScope(Request $request)
    {
        return $this->store($request);
    }

    public function store(Request $request)
    {
        $project = new ProjectScope;
        $requestData = array_map(
            function ($value) {
                if (is_string($value)) {
                    $value = \urldecode($value);
                }

                return $value;
            },
            $request->all()
        );

        $projectModelData = array_map(
            function ($value) {
                if (is_string($value)) {
                    $value = \urldecode($value);
                } elseif (is_array($value)) {
                    $value = join(',', $value);
                }

                return $value;
            },
            $request->only($project->getFillable())
        );
        $success = $project->createProjectScope($requestData, $project, $projectModelData);

        if (!isset($success)) {
            $response = ['success' => false, 'msg' => 'Project Creation Not Implemented Yet.'];
        } elseif ($success) {
            $response = ['success' => true, 'msg' => 'Project Creation Succeeded.', 'ProjectID' => $project->ProjectID];
        } else {
            $response = ['success' => false, 'msg' => 'Project Creation Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function getProjectScopeProject(Request $request, $ProjectID)
    {
        $projectScope = new ProjectScope();
        $data = $projectScope->getProject($ProjectID, true);

        return $data;
    }

    public function getProjectScopeProjectDropdownOptions(Request $request, $SiteStatusID)
    {
        $aSiteProjects = Project::getSiteProjects($SiteStatusID, true);
        $aProjectsDropdown = [];
        foreach ($aSiteProjects as $project) {
            $aProjectsDropdown[] = [
                'ProjectID' => $project['ProjectID'],
                'SequenceNumber' => $project['SequenceNumber'],
            ];
        }

        return $aProjectsDropdown;
    }

    public function scopeUpdate(Request $request, $ProjectID)
    {
        $params = array_map(
            function ($value) {
                if (is_string($value)) {
                    $value = \urldecode($value);
                }

                return $value;
            },
            $request->all()
        );
        $project = ProjectScope::findOrFail($ProjectID);
        $projectModelData = array_map(
            function ($value) {
                if (is_string($value)) {
                    $value = \urldecode($value);
                } elseif (is_array($value)) {
                    $value = join(',', $value);
                }

                return $value;
            },
            $request->only($project->getFillable())
        );

        $success = $project->updateProjectScope($ProjectID, $params, $project, $projectModelData);

        if (!isset($success)) {
            $response = ['success' => false, 'msg' => 'Project Scope Update Not Implemented Yet.'];
        } elseif ($success) {
            $response = ['success' => true, 'msg' => 'Project Scope Update Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Project Scope Update Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    /**
     * @param Request $request
     * @param         $ProjectID
     *
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     * @deprecated use scopeUpdate
     */
    public function update(Request $request, $ProjectID)
    {
        return $this->scopeUpdate($request, $ProjectID);
    }

    public function reSequenceList($SiteStatusID)
    {
        // $projects =
        //     Project::where('SiteStatusID', $SiteStatusID)->orderBy('SequenceNumber', 'asc')->orderBy(
        //         'updated_at',
        //         'desc'
        //     )->get()->toArray();
        // $iCounter = 0;
        // foreach ($projects as $data) {
        //     $project = Project::findOrFail($data['ProjectID']);
        //     $data['SequenceNumber'] = ++$iCounter;
        //     $project->fill($data);
        //     $project->save();
        // }
    }

    public function destroy(Request $request, $id)
    {
        $success = Project::findOrFail($id)->delete();

        if ($success) {
            $response = ['success' => true, 'msg' => 'Project Delete Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Project Delete Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function batchDestroy(Request $request)
    {
        $params = $request->all();
        $batchSuccess = true;
        if (is_array($params['deleteModelIDs'])) {
            foreach ($params['deleteModelIDs'] as $modelID) {
                $success = Project::findOrFail($modelID)->delete();
                if (!$success) {
                    $batchSuccess = false;
                }
                // TODO: figure out relational soft deletes
                $model = ProjectVolunteer::where('project_volunteers.ProjectID', '=', $modelID);
                $success = $model->count() ? $model->delete() : true;
                if (!$success) {
                    $batchSuccess = false;
                }
                $model = ProjectVolunteerRole::where('project_volunteer_role.ProjectID', '=', $modelID);
                $success = $model->count() ? $model->delete() : true;
                if (!$success) {
                    $batchSuccess = false;
                }
                $model = Budget::where('budgets.ProjectID', '=', $modelID);
                $success = $model->count() ? $model->delete() : true;
                if (!$success) {
                    $batchSuccess = false;
                }
            }
        } else {
            $success = false;
        }
        $success = $batchSuccess;

        if (!isset($success)) {
            $response = ['success' => false, 'msg' => 'Project Batch Removal Not Implemented Yet.'];
        } elseif ($success) {
            $response = ['success' => true, 'msg' => 'Project Batch Removal Succeeded.'];
        } else {
            $response = ['success' => false, 'msg' => 'Project Batch Removal Failed.'];
        }

        return view('springintoaction::admin.main.response', $request, compact('response'));
    }

    public function getSiteProjects($SiteStatusID)
    {
        return ProjectScope::getSiteProjects($SiteStatusID, true);
    }

    public function getLeadVolunteers($ProjectID)
    {
        $model = new ProjectVolunteerRole();

        return $model->getProjectLeads($ProjectID);
    }

    public function getBudgets($ProjectID)
    {
        // Need to return an array for the grid
        $result = [];
        try {
            if ($b = Project::find($ProjectID)->budgets) {
                $result = $b->toArray();
            }
        } catch (\Exception $e) {
        }

        return $result;
    }

    public function getContacts($ProjectID)
    {
        // Need to return an array for the grid
        try {
            if ($c = Project::find($ProjectID)->contacts) {
                return $c->toArray();
            }
        } catch (\Exception $e) {
            return [];
        }

        return [];
    }

    public function getVolunteers($ProjectID)
    {
        try {
            $model = new ProjectVolunteer();
            $project_volunteers = $model->getProjectVolunteers($ProjectID);

            return $project_volunteers;
        } catch (\Exception $e) {
            return [];
        }

        return [];
    }

    public function getProject($ProjectID)
    {
        try {
            if ($project = Project::where('ProjectID', $ProjectID)->get()) {
                return current($project->toArray());
            }
        } catch (\Exception $e) {
            return [];
        }

        return [];
    }

    public function uploadList(Request $request)
    {
        if ($request->hasFile('projects_import') && $request->file('projects_import')->isValid()) {
            $file = $request->file('projects_import');
            //$path = $request->projects_import->path();
            //$extension = $request->projects_import->extension();
            $path = $request->projects_import->storePubliclyAs('uploads/import', 'projects_import.csv');
            //$path = $request->projects_import->storeAs('images', 'filename.jpg');
            //$path = $request->projects_import->storeAs('images', 'filename.jpg', 's3');
        }
        $aaOptions['upload_dir'] = 'uploads/';
        $aaOptions['upload_url'] = 'project/list/upload/';
        $oAjaxUploadHandler = new ajaxUploader($aaOptions);
    }

    public function getAllProjects()
    {
        $projectModel = new Project();
        $sSqlVolunteersAssigned = $projectModel->getVolunteersAssignedSql();
        $all_projects = Project::select(
            'projects.*',
            DB::raw(
                '(SELECT GROUP_CONCAT(distinct BudgetID SEPARATOR \',\') FROM budgets where budgets.ProjectID = projects.ProjectID and budgets.deleted_at is null) as BudgetSources'
            ),
            DB::raw(
                "{$sSqlVolunteersAssigned} as VolunteersAssigned"
            ),
            DB::raw(
                '(select COUNT(*) from project_attachments where project_attachments.ProjectID = projects.ProjectID) AS `HasAttachments`'
            )
        )->join('site_status', 'projects.SiteStatusID', '=', 'site_status.SiteStatusID')->where(
            'site_status.Year',
            date('Y')
        )->whereNull('projects.deleted_at')->whereNull('site_status.deleted_at')->where('projects.Active', 1)->orderBy(
            'projects.SequenceNumber',
            'asc'
        )->get()->toArray();

        return $all_projects;
    }

    public function getProjectAttachments($ProjectID)
    {
        // Need to return an array for the grid
        $results = [];
        try {
            if ($model = ProjectAttachment::where('ProjectID', $ProjectID)->get()) {
                $results = $model->toArray();
                foreach ($results as $key => $attachment) {
                    $attachmentPath = $attachment['AttachmentPath'];
                    if (\preg_match("/^.*\/storage\/app/", $attachmentPath)) {
                        $attachment['AttachmentPath'] = preg_replace(
                            "/^.*\/storage\/app/",
                            "/admin/project_attachment/stream/storage/app",
                            $attachment['AttachmentPath']
                        );
                        $results[$key] = $attachment;
                    }
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::debug(
                '',
                [
                    'File:' . __FILE__,
                    'Method:' . __METHOD__,
                    'Line:' . __LINE__,
                    $e->getMessage(),
                ]
            );
        }

        return $results;
    }
}
