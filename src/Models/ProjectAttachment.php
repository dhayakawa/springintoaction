<?php
/**
 * Created by PhpStorm.
 * User: dhayakawa
 * Date: 4/9/2018
 * Time: 7:08 PM
 */
namespace Dhayakawa\SpringIntoAction\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectAttachment extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'project_attachments';
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'ProjectAttachmentID';
    protected $fillable = [
        'ProjectID',
        'AttachmentPath'
    ];
}
