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
        Schema::create('agendas', function (Blueprint $table) {
            $table->string('id', 25)->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('attachment_url')->nullable();
            $table->string('attachment_name')->nullable();
            $table->integer('attachment_size')->nullable();
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED', 'FORWARDED', 'ARCHIVED'])->default('PENDING');
            $table->uuid('created_by_id');
            $table->foreign('created_by_id')->references('id')->on('users');
            $table->uuid('sender_office_id')->nullable();
            $table->foreign('sender_office_id')->references('id')->on('offices');
            $table->uuid('receiver_office_id')->nullable();
            $table->foreign('receiver_office_id')->references('id')->on('offices');
            $table->uuid('current_office_id')->nullable();
            $table->foreign('current_office_id')->references('id')->on('offices');
            $table->uuid('approved_by_id')->nullable();
            $table->foreign('approved_by_id')->references('id')->on('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agendas');
    }
};
