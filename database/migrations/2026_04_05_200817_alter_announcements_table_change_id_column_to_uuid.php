<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Change the id column from VARCHAR(25) to VARCHAR(36) to accommodate UUIDs
        DB::statement('ALTER TABLE announcements MODIFY COLUMN id VARCHAR(36) NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Change the id column back to VARCHAR(25)
        DB::statement('ALTER TABLE announcements MODIFY COLUMN id VARCHAR(25) NOT NULL');
    }
};
