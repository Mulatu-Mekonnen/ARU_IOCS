<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('viewer_communications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('parent_id')->nullable();
            $table->foreign('parent_id')->references('id')->on('viewer_communications')->nullOnDelete();
            $table->uuid('thread_root_id')->nullable()->index();
            $table->uuid('sender_id');
            $table->foreign('sender_id')->references('id')->on('users')->cascadeOnDelete();
            $table->uuid('recipient_user_id');
            $table->foreign('recipient_user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('communication_type', 32)->nullable();
            $table->string('subject')->nullable();
            $table->text('body');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('viewer_communications');
    }
};
