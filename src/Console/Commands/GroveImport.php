<?php

namespace Dhayakawa\SpringIntoAction\Console\Commands;

use Illuminate\Console\Command;
use Dhayakawa\SpringIntoAction\Controllers\GroveController;

class GroveImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'grove:import {importType}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import Grove data';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        GroveController::runImport($this->argument('importType'));
    }
}
