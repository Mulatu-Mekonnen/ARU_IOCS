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
        Schema::create('approval_histories', function (Blueprint $table) {
            $table->string('id', 25)->primary();
            $table->string('agenda_id', 25);
            $table->foreign('agenda_id')->references('id')->on('agendas');
            $table->string('action');
            $table->text('comment')->nullable();
            $table->uuid('action_by_id');
            $table->foreign('action_by_id')->references('id')->on('users');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_histories');
    }
};
