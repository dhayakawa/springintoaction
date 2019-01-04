<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProjectReservationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('project_reservations', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->increments('id')->autoIncrement();
            $table->integer('ProjectID')->nullable(false)->default(0);
            $table->integer('reserve')->nullable(false)->default(0);
            $table->string('session_id', 255)->charset('utf8mb4')->nullable(false)->default('');
            $table->timestamps();
            $table->foreign('ProjectID')->references('ProjectID')->on('projects')->onDelete('cascade')->onUpdate(
                'restrict'
            );
            $table->index('ProjectID');
            $table->index('ProjectID','session_id');
            $table->index('created_at');
            $table->index('updated_at');

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('project_reservations');
    }
}
