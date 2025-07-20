<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FeedbackController extends Controller
{
    public function index(Request $request) {
        $query = Feedback::leftJoin('bookings', 'feedbacks.bookid', '=', 'bookings.bookid')
            ->leftJoin('users as driver', 'bookings.driverid', '=', 'driver.username')
            ->leftJoin('users as passenger', 'bookings.passengerid', '=', 'passenger.username')
            ->select(
                'feedbacks.feedbackid',
                'feedbacks.bookid',
                'feedbacks.experience',
                'feedbacks.happy',
                DB::raw("CONCAT_WS(' ', passenger.first_name, passenger.middle_name, passenger.last_name) as passenger_name"),
            )
            ->orderBy('feedbacks.created_at', 'DESC');

        if ($request->filter != "") {
            $filter = $request->filter;
            $query->where(function ($q) use ($filter) {
            $q->orWhere(DB::raw("CONCAT_WS(' ', passenger.first_name, passenger.middle_name, passenger.last_name)"), 'LIKE', "%$filter%")
                ->orWhere('bookings.bookid', 'LIKE', "%$filter%")
                ->orWhere('feedbacks.experience', 'LIKE', "%$filter%")
                ->orWhere('feedbacks.happy', 'LIKE', "%$filter%");
            });
        }

        if ($request->asof != "") {

            if ($request->asof == "today") {
                $query->whereDate('feedbacks.created_at', today());
            }

            if ($request->asof == "week") {
                $query->whereBetween('feedbacks.created_at', [
                    now()->startOfWeek(),
                    now()->endOfWeek(),
                ]);
            }

            if ($request->asof == "month") {
                $query->whereMonth('feedbacks.created_at', now()->month)
                    ->whereYear('feedbacks.created_at', now()->year);
            }
        }
            
        $feedbacks = $query->paginate(20);

        if ($feedbacks->count() > 0) {
            return response()->json([
                'status' => 200,
                'message' => 'Feedbacks retrieved!',
                'feedbacks' => $feedbacks
            ], 200);
        } else {
            return response()->json([
                'message' => 'No feedbacks found!',
                'feedbacks' => $feedbacks
            ]);
        }

    }

    // retrieve specific event's information
    public function retrieve(Request $request) {
        $feedback = Feedback::leftJoin('bookings', 'feedbacks.bookid', '=', 'bookings.bookid')
            ->leftJoin('users as driver', 'bookings.driverid', '=', 'driver.username')
            ->leftJoin('users as passenger', 'bookings.passengerid', '=', 'passenger.username')
            ->select(
                'bookings.*',
                'feedbacks.feedbackid',
                'feedbacks.experience',
                DB::raw("DATE_FORMAT(bookings.created_at, '%M %d, %Y %h:%i %p') AS booking_datetime"),

                DB::raw("CONCAT_WS(' ', driver.first_name, driver.middle_name, driver.last_name) as driver_name"),
                'driver.plate_number',
                'driver.contact as driver_contact',
                'driver.id_number as driver_license',
                'driver.address as driver_address',
                'driver.id_number as license_number',
                DB::raw("TO_BASE64(driver.id_picture) as driverpic"),

                DB::raw("CONCAT_WS(' ', passenger.first_name, passenger.middle_name, passenger.last_name) as passenger_name"),
                'passenger.contact as passenger_contact',
                'passenger.address as passenger_address',
            )
            ->where('feedbacks.feedbackid', $request->id)
            ->first();
            
        if($feedback) {
            return response()->json([
                'status' => 200,
                'feedback' => $feedback,
                'message' => "Feedback data retrieved!"
            ], 200);
        }
        else {
            return response()->json([
                'feedback' => $feedback,
                'message' => "Feedback not found!"
            ]);
        }
    }

    public function deletefeedback(Request $request) {
        $delete = Feedback::where('feedbackid', $request->id)->delete();

        if($delete) {
            return response()->json([
                'status' => 200,
                'message' => 'Feedback removed successfully!'
            ], 200);
        }
        return response()->json([
            'message' => 'Something went wrong!'
        ]);
    }

}