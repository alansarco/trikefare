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
use Illuminate\Support\Facades\Http;
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
                ->where(function ($q) {
                    $q->where('bookings.finish_flag', '!=', 1)
                        ->orWhereNull('bookings.finish_flag');
                })
                ->where(function ($q) {
                    $q->whereNull('bookings.driverid')
                        ->orWhere('bookings.driverid', '');
                })
                // ->where('bookings.driverid', '!=', Auth::user()->username)

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

    public function getMyBookings()
    {
        try {
            $threeHoursAgo = Carbon::now()->subHours(3);

            $myBookingData = Booking::leftJoin('users', 'bookings.passengerid', '=', 'users.username')
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
                    $q->where('bookings.finish_flag', '!=', 1)
                        ->orWhereNull('bookings.finish_flag');
                })
                ->where('bookings.accept_flag', 1)
                ->where('bookings.driverid', Auth::user()->username)
                ->where('bookings.created_at', '>=', $threeHoursAgo)
                ->orderBy('bookings.created_at', 'desc')
                ->first();

            if ($myBookingData) {
                return response()->json([
                    'status' => 200,
                    'myBookingData' => $myBookingData,
                    'message' => "Current Booking retrieved!"
                ]);
            } else {
                return response()->json([
                    'status' => 500,
                    'myBookingData' => $myBookingData,
                    'message' => "Current Bookings not found!"
                ]);
            }
        } catch (Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => "Something went wrong!"
            ], 500);
        }
    }

    public function acceptBookingStatus(Request $request)
    {
        try {
            $threeHoursAgo = Carbon::now()->subHours(3);

            $myBookingData = Booking::leftJoin('users', 'bookings.passengerid', '=', 'users.username')
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
                    $q->where('bookings.finish_flag', '!=', 1)
                        ->orWhereNull('bookings.finish_flag');
                })
                ->where('bookings.accept_flag', 1)
                ->where('bookings.driverid', Auth::user()->username)
                ->where('bookings.created_at', '>=', $threeHoursAgo)
                ->orderBy('bookings.created_at', 'desc')
                ->first();

            if ($myBookingData) {
                return response()->json([
                    'status' => 500,
                    'message' => "You have existing booking!"
                ]);
            } else {

                $checkIfCancelled = Booking::where('bookid', $request->bookid)->where('cancel_flag', 1)->first();
                if ($checkIfCancelled) {
                    return response()->json([
                        'status' => 500,
                        'message' => "Booking already cancelled. Go Back and select new!"
                    ]);
                }

                $checkIfAssigned = Booking::where('bookid', $request->bookid)
                    ->where(function ($q) {
                        $q->where('driverid', '!=', '')
                            ->whereNotNull('driverid');
                    })->first();

                if ($checkIfAssigned) {
                    return response()->json([
                        'status' => 500,
                        'message' => "Booking already assigned to a different rider. Go Back and select new!"
                    ]);
                }

                $update = Booking::where('bookid', $request->bookid)
                    ->update([
                        'accept_flag' => 1,
                        'driverid' => Auth::user()->username,
                        'accept_date' => today(),
                    ]);
                    
                if ($update) {
                    $booking = Booking::where('bookid', $request->bookid)->first();
                    Http::post('https://trikefarewebsocket.onrender.com/notify', [
                        'event' => 'booking_accepted',
                        'data' => [
                            'book_id' => $booking,
                            'user_id' => $booking->passengerid,
                        ]
                    ]);
                    return response()->json([
                        'status' => 200,
                        'message' => "Booking Accepted! Please wait..."
                    ]);
                }
                return response()->json([
                    'status' => 500,
                    'message' => "Something went wrong!"
                ]);
            }
        } catch (Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => "Something went wrong!"
            ], 500);
        }
    }

    public function cancelBookingStatus(Request $request)
    {
        try {
            $checkIfCancelled = Booking::where('bookid', $request->bookid)->where('cancel_flag', 1)->first();
            if ($checkIfCancelled) {
                return response()->json([
                    'status' => 500,
                    'message' => "Booking already cancelled. Go Back and select new!"
                ]);
            }

            $checkIfAssigned = Booking::where('bookid', $request->bookid)
                ->where('driverid', Auth::user()->username)
                ->where(function ($q) {
                    $q->where('finish_flag', '!=', 1)
                        ->orWhereNull('finish_flag');
                })
                ->where(function ($q) {
                    $q->where('start_flag', '!=', 1)
                        ->orWhereNull('start_flag');
                })
                ->first();

            if ($checkIfAssigned) {
                $update = Booking::where('bookid', $request->bookid)
                    ->update([
                        'accept_flag' => 0,
                        'driverid' => NULL,
                        'accept_date' => NULL,
                    ]);
                if ($update) {
                    return response()->json([
                        'status' => 200,
                        'message' => "Booking Cancelled! Please wait..."
                    ]);
                }
            }
            return response()->json([
                'status' => 500,
                'message' => "Something went wrong!"
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => "Something went wrong!"
            ], 500);
        }
    }

    public function startBookingStatus(Request $request)
    {
        try {
            $checkIfCancelled = Booking::where('bookid', $request->bookid)->where('cancel_flag', 1)->first();
            if ($checkIfCancelled) {
                return response()->json([
                    'status' => 500,
                    'message' => "Booking already cancelled. Go Back and select new!"
                ]);
            }
            $update = Booking::where('bookid', $request->bookid)
                ->where('driverid', Auth::user()->username)
                ->update([
                    'start_flag' => 1,
                    'driverid' => Auth::user()->username,
                ]);
            if ($update) {
                return response()->json([
                    'status' => 200,
                    'message' => "Booking started! Can no longer cancel"
                ]);
            }
            return response()->json([
                'status' => 500,
                'message' => "Something went wrong!"
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => "Something went wrong!"
            ], 500);
        }
    }

    public function finishBookingStatus(Request $request)
    {
        try {
            $checkIfCancelled = Booking::where('bookid', $request->bookid)->where('cancel_flag', 1)->first();
            if ($checkIfCancelled) {
                return response()->json([
                    'status' => 500,
                    'message' => "Booking already cancelled. Go Back and select new!"
                ]);
            }
            $update = Booking::where('bookid', $request->bookid)
                ->where('driverid', Auth::user()->username)
                ->update([
                    'finish_flag' => 1,
                    'driverid' => Auth::user()->username,
                ]);
            if ($update) {
                return response()->json([
                    'status' => 200,
                    'message' => "Booking complete. Accept more booking now!"
                ]);
            }
            return response()->json([
                'status' => 500,
                'message' => "Something went wrong!"
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => "Something went wrong!"
            ], 500);
        }
    }
}
