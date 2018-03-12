<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProjectContactsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('project_contacts', function (Blueprint $table) {
            $table->engine    = 'InnoDB';
            $table->charset   = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->increments('ProjectContactsID')->autoIncrement();
            $table->integer('ProjectID')->nullable(false)->default(0);
            $table->integer('ContactID')->nullable(false)->default(0);
            $table->softDeletes();
            $table->timestamps();
            $table->foreign('ProjectID')->references('ProjectID')->on('projects')->onDelete('cascade')->onUpdate('restrict');
            $table->foreign('ContactID')->references('ContactID')->on('contacts')->onDelete('cascade')->onUpdate('restrict');

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('project_contacts');
    }
}
