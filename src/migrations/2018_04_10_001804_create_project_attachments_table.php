<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProjectAttachmentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('project_attachments', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->increments('ProjectAttachmentID')->autoIncrement();
            $table->integer('ProjectID')->nullable(false)->default(0);
            $table->string('AttachmentPath', 255)->charset('utf8mb4')->nullable(false)->default('');
            $table->timestamps();
            $table->foreign('ProjectID')->references('ProjectID')->on('projects')->onDelete('cascade')->onUpdate(
                'restrict'
            );
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('project_attachments');
    }
}
