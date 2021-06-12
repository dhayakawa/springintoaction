<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFailedGroveGroupManagementAttemptsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('failed_grove_group_management_attempts')) {
            Schema::create('failed_grove_group_management_attempts', function (Blueprint $table) {
                $table->engine    = 'InnoDB';
                $table->charset   = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
                $table->increments('id');
                $table->string('call', 255)->charset('utf8mb4')->nullable(false)->default('');
                $table->text('call_params')->charset('utf8mb4')->nullable(false);
                $table->string('reason', 255)->charset('utf8mb4')->nullable(false)->default('');
                $table->timestamps();
                $table->index('created_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('failed_grove_group_management_attempts');
    }
}
