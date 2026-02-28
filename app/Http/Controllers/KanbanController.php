<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KanbanController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if ($user->hasRole('administrador')) {
            $activities = Activity::with(['category', 'user'])->latest()->get();
        } else {

            $activities = Activity::with(['category', 'user'])
                ->where('user_id', $user->id)
                ->latest()
                ->get();
        }

        $categories = Category::all();

        return Inertia::render('Kanban/Board', [
            'activities' => $activities,
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'priority' => 'required|in:low,medium,high',
            'category_id' => 'required|exists:categories,id',
        ]);
        $validated['user_id'] = auth()->id() ?? 1;

        $validated['status'] = 'todo';

        Activity::create($validated);

        return redirect()->back();
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:todo,in_progress,done',
        ]);

        $activity = Activity::findOrFail($id);
        $activity->status = $request->input('status');
        $activity->save();

        return redirect()->back(); // Inertia recargará los datos automáticamente
    }

    public function updatePriority(Request $request, $id)
    {
        $request->validate([
            'priority' => 'required|in:low,medium,high'
        ]);

        $activity = Activity::findOrFail($id);
        $activity->priority = $request->input('priority');
        $activity->save();

        return redirect()->back(); // Inertia refrescará los datos sin recargar la página
    }
    public function updateTitle(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255'
        ]);

        $activity = Activity::findOrFail($id);
        $activity->title = $request->input('title');
        $activity->save();

        return redirect()->back();
    }

}
