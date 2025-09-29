<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\App_Info;
use App\Http\Controllers\AESCipher;
use App\Models\Booking;
use App\Models\Report;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ZBookingController extends Controller
{
    public function getCurrentBookings()
    {
        try {
            $bookingData = Booking::leftJoin('users', 'bookings.passengerid', '=', 'users.username')
                ->select(
                    'bookings.*',
                    DB::raw("DATE_FORMAT(bookings.created_at, '%M %d, %Y') AS bookings_date"),
                    DB::raw("DATE_FORMAT(bookings.created_at, '%h:%i %p') AS bookings_time"),
                    DB::raw("CONCAT_WS(' ', users.first_name, users.middle_name, users.last_name) as passenger_name"),
                    'users.contact as passenger_contact',
                )
                ->where(function ($q) {
                    $q->where('bookings.cancel_flag', '!=', 1)
                        ->orWhereNull('bookings.cancel_flag');
                })
                ->where(function ($q) {
                    $q->where('bookings.accept_flag', '!=', 1)
                        ->orWhereNull('bookings.accept_flag');
                })
                ->get();

            if ($bookingData) {
                return response()->json([
                    'status' => 200,
                    'bookingData' => $bookingData,
                    'message' => "Bookings retrieved!"
                ]);
            } else {
                return response()->json([
                    'status' => 500,
                    'bookingData' => $bookingData,
                    'message' => "Bookings not found!"
                ]);
            }
        } catch (Exception $e) {
            Log::error("Verification email failed to send: " . $e->getMessage());
            return response()->json([
                'status' => 500,
                'message' => "Something went wrong!"
            ], 500);
        }
    }
}
