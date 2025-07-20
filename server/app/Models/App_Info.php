<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class App_Info extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = "app_info";

    protected $fillable = [
        'app_id',
        'system_info',
        'event_notif',
        'base_fare',
        'email',
        'contact',
        'taripa',
        'created_by'
    ];
}
