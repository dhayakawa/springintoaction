<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBudgetsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if(!Schema::hasTable('budgets')) {
            Schema::create('budgets', function (Blueprint $table) {
                $table->engine    = 'InnoDB';
                $table->charset   = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
                $table->bigIncrements('BudgetID')->autoIncrement();
                $table->bigInteger('ProjectID')->nullable(false)->default(0);
                $table->string('BudgetSource', 255)->charset('utf8mb4')->nullable(false)->default('');
                $table->float('BudgetAmount', 6, 2)->nullable(false)->default('');
                $table->string('Status', 255)->charset('utf8mb4')->nullable(false)->default('');
                $table->text('Comments')->charset('utf8mb4')->nullable(false);
                $table->softDeletes();
                $table->timestamps();
                $table->foreign('ProjectID')->references('ProjectID')->on('projects')->onDelete('restrict')->onUpdate('restrict');
                $table->index('Status');
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
        Schema::dropIfExists('budgets');
    }
}
