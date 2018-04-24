<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSiteVolunteerRoleTable extends Migration
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
                'site_volunteer_role',
                function (Blueprint $table) {
                    $table->engine = 'InnoDB';
                    $table->charset = 'utf8mb4';
                    $table->collation = 'utf8mb4_unicode_ci';
                    $table->increments('SiteVolunteerRoleID')->autoIncrement();
                    $table->bigInteger('SiteVolunteerID')->nullable(false)->default(0);
                    $table->bigInteger('SiteRoleID')->nullable(false)->default(0);
                    $table->text('Comments')->charset('utf8mb4')->nullable(false);
                    $table->integer('Status')->nullable(false)->default(1);
                    $table->timestamps();
                    $table->foreign('SiteVolunteerID')->references('SiteVolunteerID')->on('site_volunteers')->onDelete(
                        'cascade'
                    );
                    $table->foreign('SiteRoleID')->references('SiteRoleID')->on('site_roles')->onDelete('restrict');
                    $table->foreign('Status')->references('id')->on('volunteer_status_options')->onDelete('restrict');
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
