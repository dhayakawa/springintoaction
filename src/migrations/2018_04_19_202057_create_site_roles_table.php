<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSiteRolesTable extends Migration
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
                'site_roles',
                function (Blueprint $table) {
                    $table->engine = 'InnoDB';
                    $table->charset = 'utf8mb4';
                    $table->collation = 'utf8mb4_unicode_ci';
                    $table->increments('SiteRoleID')->autoIncrement();
                    $table->string('Role', 255)->charset('utf8mb4')->nullable(false)->default('');
                    $table->integer('DisplaySequence')->nullable(false)->default(0);
                    $table->timestamps();
                    $table->index('DisplaySequence');
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
        Schema::dropIfExists('site_roles');
    }
}
