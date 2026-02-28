<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    // Campos que permitimos llenar de forma masiva
    protected $fillable = ['name'];

    /**
     * Relación: Una categoría tiene MUCHAS actividades.
     */
    public function activities()
    {
        return $this->hasMany(Activity::class);
    }
}
