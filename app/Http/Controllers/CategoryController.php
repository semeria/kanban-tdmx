<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    // Mostrar la lista de categorías
    public function index()
    {
        $categories = Category::latest()->get();
        return Inertia::render('Categories/Index', [
            'categories' => $categories
        ]);
    }

    // Guardar una nueva categoría
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name'
        ]);

        Category::create([
            'name' => $request->input('name')
        ]);

        return redirect()->back();
    }

    // Actualizar el nombre de una categoría
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $category = Category::findOrFail($id);
        $category->name = $request->input('name');
        $category->save();

        return redirect()->back();
    }

    public function destroy($id)
    {
        // Seguridad: Solo los administradores pueden borrar categorías
        if (!auth()->user()->hasRole(['administrador', 'gerencia'])) {
            abort(403, 'No tienes permiso para eliminar categorías.');
        }

        $category = Category::findOrFail($id);
        
        // (Opcional pero recomendado) Si no tienes nullOnDelete en tu migración, 
        // puedes desvincular las actividades manualmente antes de borrar:
        // \App\Models\Activity::where('category_id', $id)->update(['category_id' => null]);

        $category->delete();

        return redirect()->back();
    }
}
