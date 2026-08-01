<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CheckUserData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:check-data {id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check user data by ID';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $id = $this->argument('id');
        $user = User::find($id);
        
        if ($user) {
            $this->info("User found:");
            $this->line("ID: " . $user->id);
            $this->line("Name: " . $user->name);
            $this->line("Email: " . $user->email);
            $this->line("Phone: " . ($user->phone ?? 'NULL'));
            $this->line("Company Name: " . ($user->companyName ?? 'NULL'));
        } else {
            $this->error("User with ID $id not found.");
        }
        
        return 0;
    }
}