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
        $validated = $request->validate([
            'instance'  => 'required|string',
            'numbers'   => 'required|array|min:1',
            'tipo'      => 'required|string',
            'contenido' => 'nullable|string',
            'archivo'   => 'nullable|file'
        ]);

        $serverUrl = env('EVOLUTION_SERVER');
        $apiKey    = env('EVOLUTION_APIKEY');

        Log::info('📩 [Inicio de envío de mensaje Evolution]', [
            'instance'  => $validated['instance'],
            'tipo'      => $validated['tipo'],
            'numbers'   => $validated['numbers'],
            'contenido' => $validated['contenido'],
        ]);

        try {
            $tipo = $validated['tipo'];

            if ($tipo === 'mensaje') {
                // Enviar mensajes de texto
                foreach ($validated['numbers'] as $number) {
                    $payload = [
                        'number'      => $number,
                        'text'        => $validated['contenido'],
                        'delay'       => 100,
                        'linkPreview' => true,
                    ];

                    Log::info("📤 Enviando mensaje de texto a $number", $payload);

                    $response = Http::withHeaders([
                        'Content-Type' => 'application/json',
                        'apikey'       => $apiKey,
                    ])->post("$serverUrl/message/sendText/{$validated['instance']}", $payload);

                    Log::info("📥 Respuesta Evolution ($number):", [
                        'status' => $response->status(),
                        'body'   => $response->json(),
                    ]);
                }
            } else {
                // Validar archivo
                if (!$request->hasFile('archivo')) {
                    return response()->json(['error' => 'No se envió ningún archivo.'], 400);
                }

                $file = $request->file('archivo');
                $mime = $file->getMimeType();

                // Determinar mediatype
                if (str_starts_with($mime, 'image/')) {
                    $mediatype = 'image';
                } elseif (str_starts_with($mime, 'video/')) {
                    $mediatype = 'video';
                } elseif (str_starts_with($mime, 'audio/')) {
                    $mediatype = 'audio';
                } else {
                    $mediatype = 'document';
                }

                // Convertir a base64
                $mediaContent = base64_encode(file_get_contents($file->getRealPath()));

                Log::info('📦 Archivo detectado', [
                    'nombre'    => $file->getClientOriginalName(),
                    'tipo'      => $mime,
                    'mediatype' => $mediatype,
                    'tamaño_kb' => round($file->getSize() / 1024, 2),
                ]);

                // Enviar media a todos los números
                foreach ($validated['numbers'] as $number) {
                    $payload = [
                        'number'    => $number,
                        'mediatype' => $mediatype,
                        'mimetype'  => $mime,
                        'caption'   => $validated['contenido'] ?? '',
                        'media'     => $mediaContent,
                        'fileName'  => $file->getClientOriginalName(),
                        'delay'     => 100,
                    ];

                    Log::info("📤 Enviando media a $number", $payload);

                    $response = Http::withHeaders([
                        'apikey' => $apiKey,
                    ])->post("$serverUrl/message/sendMedia/{$validated['instance']}", $payload);

                    Log::info("📥 Respuesta Evolution (media a $number):", [
                        'status' => $response->status(),
                        'body'   => $response->json(),
                    ]);
                }
            }

            Log::info(' [Envío completado correctamente]');
            return response()->json(['success' => true, 'message' => 'Mensajes enviados correctamente.']);

        } catch (\Throwable $th) {
            Log::error(' [Error al enviar mensaje Evolution]', [
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
