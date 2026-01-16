<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use App\Http\Controllers\Evolution;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GroupContactController;
use App\Http\Controllers\Auth\SocialController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


Route::middleware('auth')->group(function () {

    //instance routes
Route::get('/evolution/user-instances', [Evolution::class, 'listInstances'])->name('evolution.list');
Route::get('/evolution', fn() => Inertia::render('Evolution/Test'))->name('evolution.form');
Route::post('/evolution/create', [Evolution::class, 'create'])->name('evolution.create');
Route::get('/evolution/status/{instanceName}', [Evolution::class, 'status'])->name('evolution.status');
Route::delete('/evolution/destroy/{instanceName}', [Evolution::class, 'destroy'])->name('evolution.destroy');
//message routes
Route::post('/enviar-mensaje', [GroupContactController::class, 'enviarMensaje']);
Route::get('/extraer-contactos/{instance}', [GroupContactController::class, 'extraerContactos'])->name('contactos.extraer');

});


//  RUTAS PÚBLICAS (sin BD, sin login)
Route::prefix('evolution/public')->group(function () {
    Route::get('/', fn() => Inertia::render('Evolution/PublicTest'))->name('evolution.public');
    Route::post('/create', [Evolution::class, 'createDirect'])->name('evolution.direct.create');
    Route::get('/status/{instanceName}', [Evolution::class, 'statusPublic'])->name('evolution.direct.status');
    Route::delete('/destroy/{instanceName}', [Evolution::class, 'destroyPublic'])->name('evolution.direct.destroy');
});


Route::get('/auth/google/redirect', [SocialController::class, 'redirectToGoogle'])->name('google.redirect');
Route::get('/auth/google/callback', [SocialController::class, 'handleGoogleCallback'])->name('google.callback');


require __DIR__.'/auth.php';
