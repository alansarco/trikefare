<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Booking;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;
use App\Models\UserUpload;
use Illuminate\Pagination\LengthAwarePaginator;
use Box\Spout\Reader\Common\Creator\ReaderEntityFactory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

class XHistoryController extends Controller
{
    // displays all list of users
    public function getHistory(Request $request) {
        // $filter = $request->filter ?? '';
        // $genderFilter = $request->gender ?? '';
        // $accountStatus = $request->account_status ?? '';
        // $accessLevel = $request->access_level ?? '';

        // Call the stored procedure
        $bookings = Booking::where('passengerid', Auth::user()->username)->get();
        // Return the response
        if ($bookings) {
            return response()->json([
                'status' => 200,
                'message' => 'Booking History retrieved!',
                'users' => $bookings
            ], 200);
        } else {
            return response()->json([
                'status' => 404,
                'message' => 'No Bookings found!'
            ]);
        }
    }

}
