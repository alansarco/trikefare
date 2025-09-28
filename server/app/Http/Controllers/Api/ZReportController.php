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
use Illuminate\Support\Facades\Validator;

class ZReportController extends Controller
{

    public function getBookings()
    {
        try {
            $bookingData = Booking::leftJoin('reports', function ($join) {
                $join->on('bookings.bookid', '=', 'reports.bookid')
                    ->where('reports.report_from', '=', 1);
            })
                ->leftJoin('users', 'bookings.passengerid', '=', 'users.username')
                ->select(
                    'bookings.bookid',
                    DB::raw("CONCAT_WS(' ', users.first_name, users.middle_name, users.last_name) as passenger_name"),
                )
                ->where('bookings.driverid', Auth::user()->username)
                ->whereNull('reports.bookid') // ensures there's no report with report_from = 1
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
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function sumbitReport(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'concern' => 'required',
                'bookid' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 500,
                    'message' => 'All fields are required!'
                ]);
            }
            $add = Report::create([
                'bookid' => $request->bookid,
                'description' => $request->concern,
                'status' => 0,
                'report_from' => 1,
                'created_by' => Auth::user()->username,
            ]);
            if ($add) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Report submitted successfully!'
                ], 200);
            } else {
                return response()->json([
                    'status' => 500,
                    'message' => 'Something went Wrong!'
                ], 500);
            }
        } catch (Exception $e) {
            return response()->json([
                'status' => 404,
                'message' => $e->getMessage()
            ], 404);
        }
    }
}
