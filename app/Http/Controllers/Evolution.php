<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Models\Instance;

class Evolution extends Controller
{
public function listInstances()
{
    $userId = Auth::id();
    $server = env('EVOLUTION_SERVER');
    $apiKey = env('EVOLUTION_APIKEY');

    Log::info("=== [EVOLUTION] Inicio de sincronización de instancias para usuario #{$userId} ===");

    // Validar configuración
    if (empty($server) || empty($apiKey)) {
        Log::error("[EVOLUTION] Variables de entorno faltantes: SERVER o APIKEY");
        return response()->json([
            'error' => true,
            'message' => 'Configuración de servidor Evolution incompleta.',
        ], 500);
    }

    // Obtener instancias locales del usuario
    $instances = Instance::where('user_id', $userId)
        ->orderBy('created_at', 'desc')
        ->get();

    Log::info('[EVOLUTION] Instancias locales encontradas: ' . $instances->pluck('instance_name')->toJson());

    // Consultar las instancias activas en Evolution
    try {
        $response = Http::withHeaders([
            'apikey' => $apiKey,
        ])->get("$server/instance/fetchInstances");

        if (!$response->successful()) {
            throw new \Exception("Respuesta HTTP inválida: " . $response->status());
        }

        $serverData = $response->json();

        Log::info('[EVOLUTION] Respuesta completa fetchInstances: ' . json_encode($serverData));

        // Extraer nombres reales del servidor
        $serverInstances = collect($serverData)->pluck('name')->toArray();
        Log::info('[EVOLUTION] Instancias detectadas en servidor: ' . json_encode($serverInstances));

    } catch (\Throwable $th) {
        Log::error("[EVOLUTION] Error al consultar Evolution API: " . $th->getMessage());
        $serverInstances = [];
    }

    // Verificar estado de cada instancia local
    foreach ($instances as $instance) {
        Log::info("[EVOLUTION] Verificando estado de instancia: {$instance->instance_name}");

        try {
            if (!in_array($instance->instance_name, $serverInstances)) {
                Log::warning("[EVOLUTION] {$instance->instance_name} no encontrada en Evolution → desconectada");
                $instance->update(['status' => 'disconnected']);
                continue;
            }

            $statusResponse = Http::withHeaders([
                'apikey' => $apiKey,
            ])->get("$server/instance/connectionState/{$instance->instance_name}");

            if (!$statusResponse->successful()) {
                throw new \Exception("Error al consultar estado, código HTTP: " . $statusResponse->status());
            }

            $data = $statusResponse->json();

            $state = $data['state']
                ?? ($data['instance']['connectionStatus']
                ?? ($data['instance']['state'] ?? 'disconnected'));

            if ($instance->status !== $state) {
                Log::info("[EVOLUTION] Estado actualizado para {$instance->instance_name}: {$instance->status} → {$state}");
                $instance->update(['status' => $state]);
            }

        } catch (\Throwable $th) {
            Log::warning("[EVOLUTION] Error al verificar estado de instancia {$instance->instance_name}: " . $th->getMessage());
            $instance->update(['status' => 'error']);
        }
    }

    Log::info("=== [EVOLUTION] Sincronización finalizada para usuario #{$userId} ===");

    return response()->json([
        'error' => false,
        'message' => 'Listado de instancias del usuario actualizado con Evolution API',
        'instances' => $instances->fresh(),
    ]);
}
 public function create(Request $request){

    $userId = Auth::id();

    //  Verificar si el usuario ya tiene una instancia
    $existing = Instance::where('user_id', $userId)->first();
    if ($existing) {
        return response()->json([
            'error' => true,
            'message' => 'Ya tienes una instancia creada. Solo se permite una por usuario.',
        ], 422);
    }
    // Validación básica en BD
    $validated = $request->validate([
        'instanceName' => 'required|string|unique:instances,instance_name',
        'number' => 'required|string',
    ]);

    $server = env('EVOLUTION_SERVER');
    $apiKey = env('EVOLUTION_APIKEY');

    try {
        // 1️ Consultar todas las instancias del servidor
        $response = Http::withHeaders([
            'apikey' => $apiKey,
        ])->get("$server/instance/fetchInstances");

        $serverInstances = $response->json();

        //  Revisar si ya existe el nombre en Evolution API
        $existsOnServer = false;
        foreach ($serverInstances as $item) {
            $inst = $item['instance'] ?? $item;
            $name = $inst['instanceName'] ?? $inst['name'] ?? null;

            if ($name === $validated['instanceName']) {
                $existsOnServer = true;
                break;
            }
        }

        if ($existsOnServer) {
            return response()->json([
                'error' => true,
                'message' => 'Ya existe una instancia con ese nombre en el servidor.',
            ], 422);
        }

        // 3️ Crear la instancia en Evolution API
        $createResponse = Http::withHeaders([
            'apikey' => $apiKey,
            'Content-Type' => 'application/json',
        ])->post("$server/instance/create", [
            'instanceName' => $validated['instanceName'],
            'integration' => 'WHATSAPP-BAILEYS',
            'token' => '',
            'number' => $validated['number'],
            'qrcode' => true,
        ]);

        $respData = $createResponse->json();

        if ($createResponse->failed()) {
            return response()->json([
                'error' => true,
                'message' => 'Error al crear la instancia en Evolution API',
                'api_response' => $respData,
            ], 500);
        }

        // Guardar en BD
        $instance = Instance::create([
            'user_id' => Auth::id(),
            'instance_name' => $validated['instanceName'],
            'phone_number' => $validated['number'],
            'status' => 'inactive',
        ]);

        return response()->json([
            'error' => false,
            'message' => 'Instancia creada correctamente.',
            'response' => $respData,
            'instance' => $instance,
        ]);
        
    } catch (\Throwable $th) {
        return response()->json([
            'error' => true,
            'message' => 'Error interno al conectar con Evolution API.',
            'debug' => $th->getMessage(),
        ], 500);
    }
}

 public function status($instanceName)
{
    $server = env('EVOLUTION_SERVER');
    $apiKey = env('EVOLUTION_APIKEY');

    //   buscar por instance_name
    $instance = Instance::where('instance_name', $instanceName)
        ->where('user_id', Auth::id())
        ->firstOrFail();

    try {
        $response = Http::withHeaders([
            'apikey' => $apiKey,
        ])->get("$server/instance/connectionState/$instanceName");

        $data = $response->json();
        $state = $data['instance']['state'] ?? 'disconnected';

        $instance->update(['status' => $state]);

        return response()->json([
            'connected' => $state === 'open',
            'state' => $state,
            'instance' => $instance,
        ]);
    } catch (\Throwable $th) {
        return response()->json([
            'connected' => false,
            'state' => 'error',
            'message' => $th->getMessage(),
        ], 500);
    }
}

public function destroy($instanceName)
{
    $server = env('EVOLUTION_SERVER');
    $apiKey = env('EVOLUTION_APIKEY');

    $instance = Instance::where('instance_name', $instanceName)
        ->where('user_id', Auth::id())
        ->firstOrFail();

    try {
        $response = Http::withHeaders([
            'apikey' => $apiKey,
        ])->delete("$server/instance/delete/$instanceName");

        // Solo eliminar en BD si la API indica éxito
        if ($response->json('error') === false) {
            $instance->delete();
        }

        return response()->json([
            'error' => false,
            'message' => 'Instancia eliminada correctamente.',
            'api_response' => $response->json(),
        ]);
    } catch (\Throwable $th) {
        return response()->json([
            'error' => true,
            'message' => 'Error al eliminar la instancia.',
            'debug' => $th->getMessage(),
        ], 500);
    }
}

public function statusPublic($instanceName)
{
    $server = env('EVOLUTION_SERVER');
    $apiKey = env('EVOLUTION_APIKEY');

    try {
        $response = Http::withHeaders(['apikey' => $apiKey])
            ->get("$server/instance/connectionState/$instanceName");

        $data = $response->json();
        $state = $data['instance']['state'] ?? 'disconnected';

        return response()->json([
            'connected' => $state === 'open',
            'state' => $state,
        ]);
    } catch (\Throwable $th) {
        return response()->json([
            'connected' => false,
            'state' => 'error',
            'message' => $th->getMessage(),
        ], 500);
    }
}

public function destroyPublic($instanceName)
{
    $server = env('EVOLUTION_SERVER');
    $apiKey = env('EVOLUTION_APIKEY');

    try {
        $response = Http::withHeaders(['apikey' => $apiKey])
            ->delete("$server/instance/delete/$instanceName");

        return response()->json([
            'error' => false,
            'message' => 'Instancia eliminada correctamente.',
            'api_response' => $response->json(),
        ]);
    } catch (\Throwable $th) {
        return response()->json([
            'error' => true,
            'message' => 'Error al eliminar la instancia.',
            'debug' => $th->getMessage(),
        ], 500);
    }
}

public function createDirect(Request $request)
{
    $validated = $request->validate([
        'instanceName' => 'required|string',
        'number' => 'required|string',
    ]);

    $server = env('EVOLUTION_SERVER');
    $apiKey = env('EVOLUTION_APIKEY');

    try {
        // 1. Verificar si ya existe en el servidor
        $check = Http::withHeaders(['apikey' => $apiKey])
            ->get("$server/instance/fetchInstances");

        $serverInstances = $check->json() ?? [];

        foreach ($serverInstances as $item) {
            $name = $item['instance']['instanceName'] ?? $item['name'] ?? null;
            if ($name === $validated['instanceName']) {
                return response()->json([
                    'error' => true,
                    'message' => 'Ya existe una instancia con ese nombre en el servidor Evolution.',
                ], 422);
            }
        }

        // 2. Crear directamente en Evolution API
        $create = Http::withHeaders([
            'apikey' => $apiKey,
            'Content-Type' => 'application/json',
        ])->post("$server/instance/create", [
            'instanceName' => $validated['instanceName'],
            'integration' => 'WHATSAPP-BAILEYS',
            'token' => '',
            'number' => $validated['number'],
            'qrcode' => true,
        ]);

        $data = $create->json();

        if ($create->failed()) {
            return response()->json([
                'error' => true,
                'message' => 'Error al crear la instancia en Evolution API',
                'response' => $data,
            ], 500);
        }

        return response()->json([
            'error' => false,
            'message' => 'Instancia creada correctamente en Evolution (sin BD).',
            'response' => $data,
        ]);
    } catch (\Throwable $th) {
        return response()->json([
            'error' => true,
            'message' => 'Error al conectar con Evolution API.',
            'debug' => $th->getMessage(),
        ], 500);
    }
}

}
