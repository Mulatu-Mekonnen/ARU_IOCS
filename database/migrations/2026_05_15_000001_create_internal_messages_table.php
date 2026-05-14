<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internal_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('sender_id');
            $table->foreign('sender_id')->references('id')->on('users')->cascadeOnDelete();
            $table->uuid('parent_id')->nullable();
            $table->foreign('parent_id')->references('id')->on('internal_messages')->nullOnDelete();
            $table->string('subject')->nullable();
            $table->text('body');
            $table->string('delivery_type', 40);
            $table->uuid('recipient_user_id')->nullable();
            $table->foreign('recipient_user_id')->references('id')->on('users')->nullOnDelete();
            $table->uuid('recipient_office_id')->nullable();
            $table->foreign('recipient_office_id')->references('id')->on('offices')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internal_messages');
    }
};
