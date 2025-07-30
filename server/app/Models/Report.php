<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Report extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = "reports";

    protected $fillable = [
        'reportid',
        'bookid',
        'report_from',
        'description',
        'status',
        'created_by', 
        'updated_by'
    ];
}
