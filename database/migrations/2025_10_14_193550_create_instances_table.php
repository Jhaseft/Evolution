<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instances', function (Blueprint $table) {
            $table->id(); // ID principal
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Relación con usuario
            $table->string('instance_name')->unique(); // Nombre único de la instancia
            $table->string('phone_number')->nullable(); // Número asociado (WhatsApp)
            $table->enum('status', ['active', 'inactive', 'disconnected'])->default('inactive'); // Estado
            $table->timestamps(); // created_at y updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instances');
    }
};
