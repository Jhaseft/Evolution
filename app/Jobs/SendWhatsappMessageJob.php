<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWhatsappMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $instance;
    public $number;
    public $tipo;
    public $contenido;
    public $mediaInfo;

    public $tries = 3;        // Reintentos
    public $backoff = 5;      // Segundos entre intentos

    public function __construct($instance, $number, $tipo, $contenido, $mediaInfo = null)
    {
        $this->instance = $instance;
        $this->number = $number;
        $this->tipo = $tipo;
        $this->contenido = $contenido;
        $this->mediaInfo = $mediaInfo;
    }

    public function handle()
    {
        $serverUrl = env('EVOLUTION_SERVER');
        $apiKey    = env('EVOLUTION_APIKEY');

        try {
            if ($this->tipo === 'mensaje') {
                $payload = [
                    'number'      => $this->number,
                    'text'        => $this->contenido,
                    'delay'       => 100,
                    'linkPreview' => true,
                ];

                $endpoint = "$serverUrl/message/sendText/{$this->instance}";
            } else {
                $payload = [
                    'number'    => $this->number,
                    'mediatype' => $this->mediaInfo['mediatype'],
                    'mimetype'  => $this->mediaInfo['mimetype'],
                    'caption'   => $this->contenido,
                    'media'     => $this->mediaInfo['media'],
                    'fileName'  => $this->mediaInfo['fileName'],
                    'delay'     => 100,
                ];

                $endpoint = "$serverUrl/message/sendMedia/{$this->instance}";
            }

            $response = Http::withHeaders([
                'apikey' => $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($endpoint, $payload);

            Log::info("✅ [Evolution] Enviado a {$this->number} ({$response->status()})");
            sleep(1); // evita flood

        } catch (\Throwable $th) {
            Log::error("❌ Error Evolution ({$this->number}): " . $th->getMessage());
            throw $th; // para que Laravel lo reintente si falla
        }
    }
}
