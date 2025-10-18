<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Group;
use App\Models\Instance;
use Inertia\Inertia;

class GroupContactController extends Controller
{
    public function showPanel($instanceId)
{
    $instance = Instance::with('groups.contacts')->findOrFail($instanceId);

    return Inertia::render('Evolution/Groups', [
        'instance' => $instance,
        'groups' => $instance->groups,
        'auth' => auth(),
    ]);
}
 //O
public function getGroups($instanceId)
{
    $instance = Instance::with('groups')->findOrFail($instanceId);
    return response()->json(['groups' => $instance->groups]);
}

    // Guardar grupo en la base de datos
 public function store(Request $request, $instance)
{
    $request->validate([
        'group_name' => 'required|string|max:255',
    ]);

    $instance = Instance::findOrFail($instance);

    Group::create([
        'instance_id' => $instance->id,
        'group_name' => $request->group_name,
    ]);

    return response()->json(['message' => 'Grupo creado correctamente']);
}
    // Eliminar grupo
    public function destroy($groupId)
{
    $group = Group::findOrFail($groupId);
    $group->delete();

    return response()->json(['message' => 'Grupo eliminado correctamente']);
}
}
