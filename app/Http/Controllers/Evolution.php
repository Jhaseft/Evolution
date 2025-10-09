<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;


class Evolution extends Controller
{
    public function create(Request $request)
    {
        $validated = $request->validate([
            'instanceName' => 'required|string',
            'number' => 'required|string',
        ]);

        $server = env('EVOLUTION_SERVER');
        $apiKey = env('EVOLUTION_APIKEY');

        try {
            $response = Http::withHeaders([
                'apikey' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post("$server/instance/create", [
                'instanceName' => $validated['instanceName'],
                'integration' => 'WHATSAPP-BAILEYS',
                'number' => $validated['number'],
                'qrcode' => true,
            ]);

            return response()->json([
                'error' => false,
                'message' => 'Instancia creada correctamente.',
                'response' => $response->json(),
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'Error interno al conectar con Evolution API.',
            ], 500);
        }
    }

    public function status($instanceName)
    {
        $server = env('EVOLUTION_SERVER');
        $apiKey = env('EVOLUTION_APIKEY');

        try {
            $response = Http::withHeaders([
                'apikey' => $apiKey,
            ])->get("$server/instance/connectionState/$instanceName");

            $data = $response->json();
            $state = $data['instance']['state'] ?? 'close';

            return response()->json([
                'connected' => $state === 'open',
                'state' => $state,
            ]);
        } catch (\Throwable $th) {
            return response()->json(['connected' => false, 'state' => 'error']);
        }
    }

    public function destroy($instanceName)
    {
        $server = env('EVOLUTION_SERVER');
        $apiKey = env('EVOLUTION_APIKEY');

        try {
            $response = Http::withHeaders([
                'apikey' => $apiKey,
            ])->delete("$server/instance/delete/$instanceName");

            return response()->json([
                'error' => false,
                'message' => 'Instancia eliminada correctamente.',
                'response' => $response->json(),
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'Error al eliminar la instancia.',
            ], 500);
        }
    }
}
