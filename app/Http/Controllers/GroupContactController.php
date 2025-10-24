<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Support\Facades\Response;

class GroupContactController extends Controller
{
   public function enviarMensaje(Request $request)
{
    // ✅ Validar datos básicos
    $validated = $request->validate([
        'instance'  => 'required|string',
        'numbers'   => 'required|array|min:1',
        'tipo'      => 'required|string',
        'contenido' => 'nullable|string',
        'archivo'   => 'nullable|file'
    ]);

    $serverUrl = env('EVOLUTION_SERVER');
    $apiKey    = env('EVOLUTION_APIKEY');
    $tipo      = $validated['tipo'];

    // 🚀 Desactivar límites del servidor PHP
    set_time_limit(0);
    ignore_user_abort(true);

    // ⚠️ Limitar total de números a 140
    $numbers = array_slice($validated['numbers'], 0, 140);

    Log::info('📩 [Inicio de envío masivo Evolution]', [
        'instance'      => $validated['instance'],
        'tipo'          => $tipo,
        'total_numeros' => count($numbers),
    ]);

    try {
        // ⚙️ Parámetros configurables
        $batchSize = 70;                 // Lotes de 70 personas
        $pauseBetweenBatches = 600;      // 10 minutos entre lotes
        $pauseBetweenMessages = rand(1, 2); // Pausa aleatoria entre mensajes
        $maxRetries = 3;                 // Reintentos si falla

        // 🧩 Dividir los números en lotes
        $numbersChunks = array_chunk($numbers, $batchSize);
        $totalLotes = count($numbersChunks);
        $loteActual = 1;

        // 📎 Preparar archivo si aplica
        $mediaInfo = null;
        if ($tipo !== 'mensaje') {
            if (!$request->hasFile('archivo')) {
                return response()->json(['error' => 'No se envió ningún archivo.'], 400);
            }

            $file = $request->file('archivo');
            $mime = $file->getMimeType();

            if (str_starts_with($mime, 'image/')) {
                $mediatype = 'image';
            } elseif (str_starts_with($mime, 'video/')) {
                $mediatype = 'video';
            } elseif (str_starts_with($mime, 'audio/')) {
                $mediatype = 'audio';
            } else {
                $mediatype = 'document';
            }

            $mediaInfo = [
                'mediatype' => $mediatype,
                'mimetype'  => $mime,
                'media'     => base64_encode(file_get_contents($file->getRealPath())),
                'fileName'  => $file->getClientOriginalName(),
            ];

            Log::info("📦 Archivo preparado: {$mediaInfo['fileName']} ({$mediaInfo['mimetype']}) [{$mediaInfo['mediatype']}]");
        }

        // 🔁 Enviar por lotes
        foreach ($numbersChunks as $chunk) {
            Log::info("🚀 Lote $loteActual/$totalLotes (".count($chunk)." números)");

            foreach ($chunk as $number) {
                $success = false;
                $attempt = 0;

                while (!$success && $attempt < $maxRetries) {
                    try {
                        $attempt++;

                        $payload = ($tipo === 'mensaje')
                            ? [
                                'number'      => $number,
                                'text'        => $validated['contenido'] ?? '',
                                'delay'       => 100,
                                'linkPreview' => true,
                              ]
                            : [
                                'number'    => $number,
                                'mediatype' => $mediaInfo['mediatype'],
                                'mimetype'  => $mediaInfo['mimetype'],
                                'caption'   => $validated['contenido'] ?? '',
                                'media'     => $mediaInfo['media'],
                                'fileName'  => $mediaInfo['fileName'],
                                'delay'     => 100,
                              ];

                        $endpoint = ($tipo === 'mensaje')
                            ? "$serverUrl/message/sendText/{$validated['instance']}"
                            : "$serverUrl/message/sendMedia/{$validated['instance']}";

                        $response = Http::withHeaders([
                            'apikey' => $apiKey,
                            'Content-Type' => 'application/json',
                        ])->timeout(30)->post($endpoint, $payload);

                        $status = $response->status();
                        if ($status >= 200 && $status < 300) {
                            Log::info("✅ [$number] Enviado correctamente (intento $attempt)");
                            $success = true;
                        } else {
                            Log::warning("⚠️ [$number] Error HTTP $status (intento $attempt)");
                            sleep(2);
                        }
                    } catch (\Throwable $th) {
                        Log::error("❌ [$number] Falla en intento $attempt: " . $th->getMessage());
                        sleep(3);
                    }
                }

                sleep($pauseBetweenMessages);
            }

            // Pausa larga entre lotes grandes
            if ($loteActual < $totalLotes) {
                Log::info("⏸️ Lote $loteActual completado. Pausa de {$pauseBetweenBatches}s antes del siguiente lote...");
                sleep($pauseBetweenBatches);
            }

            $loteActual++;
        }

        Log::info('✅ [Envío masivo completado]');
        return response()->json(['success' => true, 'message' => 'Mensajes enviados correctamente.']);

    } catch (\Throwable $th) {
        Log::error('❌ [Error global en envío Evolution]', [
            'mensaje' => $th->getMessage(),
            'linea'   => $th->getLine(),
            'archivo' => $th->getFile(),
        ]);

        return response()->json([
            'success' => false,
            'error'   => $th->getMessage(),
        ], 500);
    }
}



    public function extraerContactos($instance)
{
    $serverUrl = env('EVOLUTION_SERVER');
    $apiKey    = env('EVOLUTION_APIKEY');

    try {
        Log::info("📞 Extrayendo contactos de la instancia $instance...");

        $url = "$serverUrl/chat/findContacts/$instance";
        $response = Http::withHeaders([
            'apikey' => $apiKey,
        ])->post($url);

        if (!$response->ok()) {
            return response()->json(['error' => 'No se pudo obtener contactos.'], 400);
        }

        $contacts = $response->json();

        // Filtrar contactos válidos
        $filtered = collect($contacts)->filter(function ($c) {
            return isset($c['remoteJid'], $c['pushName'])
                && str_ends_with($c['remoteJid'], '@s.whatsapp.net')
                && trim($c['pushName']) !== '';
        })->map(function ($c) {
            return [
                'Número' => str_replace('@s.whatsapp.net', '', $c['remoteJid']),
                'Nombre' => $c['pushName'],
            ];
        })->values();

        // Crear Excel
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Contactos');

        // Cabeceras
        $sheet->setCellValue('A1', 'Número');
        $sheet->setCellValue('B1', 'Nombre');

        // Datos
        $row = 2;
        foreach ($filtered as $contact) {
            $sheet->setCellValue("A$row", $contact['Número']);
            $sheet->setCellValue("B$row", $contact['Nombre']);
            $row++;
        }

        // Descargar Excel
        $fileName = "Contactos_{$instance}_" . date('Ymd_His') . ".xlsx";
        $writer = new Xlsx($spreadsheet);
        $tempFile = tempnam(sys_get_temp_dir(), $fileName);
        $writer->save($tempFile);

        return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);

    } catch (\Throwable $th) {
        Log::error("❌ Error al extraer contactos: " . $th->getMessage());
        return response()->json([
            'error' => 'Error al procesar la solicitud: ' . $th->getMessage(),
        ], 500);
    }
}

}
