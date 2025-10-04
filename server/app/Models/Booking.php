<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = "bookings";

    protected $fillable = [
        'bookid',
        'driverid',
        'passengerid',
        'fare',
        'location_from',
        'location_to',
        'distance',
        'rate',
        'category',
        'accept_flag',
        'start_flag',
        'finish_flag',
        'accept_date',
        'cancel_flag',
        'cancel_by',
        'created_by',
        'updated_by',
        'coordinates_to_lat',
        'coordinates_to_long',
        'coordinates_from_lat',
        'coordinates_from_long'
    ];
}
