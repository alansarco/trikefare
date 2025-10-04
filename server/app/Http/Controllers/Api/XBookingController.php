<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\App_Info;
use App\Http\Controllers\AESCipher;
use App\Models\User;
use App\Models\Booking;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;

class XBookingController extends Controller {

    protected $aes;
    public function __construct() {
        $this->aes = new AESCipher;
    }

    public function createBooking(Request $request) {
        try {

            $add = Booking::create([
                'passengerid' => Auth::user()->username,
                'fare' => $request->fare,
                'location_from' => $request->location_from,
                'location_to' => $request->location_to,
                'distance' => $request->distance,
                'rate' => $request->rate,
                'category' => $request->category,
                'coordinates_to_lat' => $request->coordinates_to_lat,
                'coordinates_to_long' => $request->coordinates_to_long,
                'coordinates_from_lat' => $request->coordinates_from_lat,
                'coordinates_from_long' => $request->coordinates_from_long,
                'created_by' => Auth::user()->username,
                'updated_by' => Auth::user()->username
            ]);

            Http::post('https://trikefarewebsocket.onrender.com/notify', [
                'event' => 'booking_waiting',
                'data' => [
                    'user_id' => Auth::user()->username,
                    'data' => $add
                ]
            ]);

            if($add){
                return response()->json([
                    'status' => 200,
                    'message' => 'Booking Created',
                    'users' => $add
                ], 200);
            }else {
                return response()->json([
                    'users' => $add,
                    'status' => 500,
                    'message' => 'Booking Creation Error'
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

    public function cancelBooking(Request $request) {
        try {

            $book = Booking::where('bookid', $request->bookId)->where('start_flag', 0)->update([
                'cancel_flag' => 1,
                'cancel_date' => now()->format('Y-m-d H:i:s'),
                'cancel_by'   => Booking::where('bookid', $request->bookId)->value('passengerid'),
            ]);

            Http::post('https://trikefarewebsocket.onrender.com/notify', [
                'event' => 'booking_canceled',
                'data' => [
                    'book_id' => Booking::where('bookid', $request->bookId)->first(),
                ]
            ]);

            if($book){
                return response()->json([
                    'status' => 200,
                    'message' => 'Booking Cancelled',
                    'users' => $book
                ], 200);
            }else {
                return response()->json([
                    'users' => $book,
                    'status' => 500,
                    'message' => 'Booking Cancelled Error'
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

    public function acceptBooking(Request $request) {
        try {

            $book = Booking::where('bookid', $request->bookId)->update([
                'driverid' => $request->driverId,
                'accept_date' => now()->format('Y-m-d H:i:s'),
                'accept_flag' => 1
            ]);
            $bookedData = Booking::where('bookid', $request->bookId)->where('start_flag', 0)->first();

            if($bookedData){
                Http::post('https://trikefarewebsocket.onrender.com/notify', [
                    'event' => 'booking_accepted',
                    'data' => [
                        'book_id' => $bookedData,
                        'user_id' => $bookedData->passengerid
                    ]
                ]);
            }

            if($book){
                return response()->json([
                    'status' => 200,
                    'message' => 'Booking Accepted',
                    'users' => $book
                ], 200);
            }else {
                return response()->json([
                    'users' => $book,
                    'status' => 500,
                    'message' => 'Booking Accepting Error'
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

    public function getBaseFare() {
        try {

            $getBaseFare = App_Info::get()->first();

            if($getBaseFare){
                return response()->json([
                    'status' => 200,
                    'message' => 'Base Fare fetched',
                    'users' => $getBaseFare
                ], 200);
            }else {
                return response()->json([
                    'users' => $getBaseFare,
                    'status' => 500,
                    'message' => 'Error getting base fare'
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