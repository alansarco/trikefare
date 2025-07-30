<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\App_Info;
use App\Http\Controllers\AESCipher;
use App\Models\Booking;
use App\Models\Newsfare;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ZHistoryController extends Controller {

    public function getHistory() {
        try {
            $historyData = Booking::leftJoin('users as driver', 'bookings.driverid', '=', 'driver.username')
            ->leftJoin('users as passenger', 'bookings.passengerid', '=', 'passenger.username')
            ->select(
                'bookings.*',
                DB::raw("DATE_FORMAT(bookings.created_at, '%M %d, %Y') AS date_booked"),
                DB::raw("DATE_FORMAT(bookings.created_at, '%h:%i %p') AS time_booked"),
                DB::raw("CONCAT_WS(' ', passenger.first_name, passenger.middle_name, passenger.last_name) as passenger_name"),
                'passenger.contact as passenger_contact',
            )
            ->where('bookings.driverid', Auth::user()->username)
            ->where('bookings.accept_flag', 1)
            ->orderBy('bookings.created_at', 'DESC')
            ->get();
        
            if($historyData) {
                return response()->json([
                    'status' => 200,
                    'historyData' => $historyData,
                    'message' => "News retrieved!"
                ]);
            }
            else {
                return response()->json([
                    'status' => 500,
                    'historyData' => $historyData,
                    'message' => "News not retrieved!"
                ]);
            }
        }
        catch (Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

}
