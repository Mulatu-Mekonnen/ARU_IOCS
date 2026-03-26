<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('agenda_routes', function (Blueprint $table) {
            $table->string('id', 25)->primary();
            $table->string('agenda_id', 25);
            $table->foreign('agenda_id')->references('id')->on('agendas');
            $table->uuid('from_office_id');
            $table->foreign('from_office_id')->references('id')->on('offices');
            $table->uuid('to_office_id');
            $table->foreign('to_office_id')->references('id')->on('offices');
            $table->uuid('routed_by_id');
            $table->foreign('routed_by_id')->references('id')->on('users');
            $table->timestamp('routed_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agenda_routes');
    }
};
