<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Newsfare extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = "news";

    protected $fillable = [
        'newsid',
        'details',
        'created_by',
        'updated_by'
    ];
}
