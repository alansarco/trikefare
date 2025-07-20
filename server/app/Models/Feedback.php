<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Feedback extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = "feedbacks";

    protected $fillable = [
        'bookid',
        'experience',
        'happy',
        'created_by',
        'updated_by'
    ];
}
