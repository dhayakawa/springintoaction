<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSiteVolunteersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        try {
            Schema::create(
                'site_volunteers',
                function (Blueprint $table) {
                    $table->engine = 'InnoDB';
                    $table->charset = 'utf8mb4';
                    $table->collation = 'utf8mb4_unicode_ci';
                    $table->increments('SiteVolunteerID')->autoIncrement();
                    $table->bigInteger('VolunteerID')->nullable(false)->default(0);
                    $table->bigInteger('SiteStatusID')->nullable(false)->default(0);
                    $table->timestamps();
                    $table->foreign('VolunteerID')->references('VolunteerID')->on('volunteers')->onDelete('cascade');
                    $table->foreign('SiteStatusID')->references('SiteStatusID')->on('site_status')->onDelete('cascade');
                }
            );
        } catch (Exception $e) {
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('site_volunteers');
    }
}
