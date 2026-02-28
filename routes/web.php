<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\KanbanController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::get('/kanban', [KanbanController::class, 'index'])->name('kanban.index');
Route::put('/kanban/{id}/status', [KanbanController::class, 'updateStatus'])->name('kanban.updateStatus');
Route::post('/kanban', [KanbanController::class, 'store'])->name('kanban.store');
Route::put('/kanban/{id}/priority', [KanbanController::class, 'updatePriority'])->name('kanban.updatePriority');
Route::put('/kanban/{id}/title', [KanbanController::class, 'updateTitle'])->name('kanban.updateTitle');

Route::get('/categorias', [CategoryController::class, 'index'])->name('categories.index');
Route::post('/categorias', [CategoryController::class, 'store'])->name('categories.store');
Route::put('/categorias/{id}', [CategoryController::class, 'update'])->name('categories.update');

require __DIR__.'/settings.php';
