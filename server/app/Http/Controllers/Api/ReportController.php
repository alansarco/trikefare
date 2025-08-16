<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Report;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request) {
        $query = Report::leftJoin('bookings', 'reports.bookid', '=', 'bookings.bookid')
            ->leftJoin('users as driver', 'bookings.driverid', '=', 'driver.username')
            ->leftJoin('users as passenger', 'bookings.passengerid', '=', 'passenger.username')
            ->select(
                'bookings.*',
                'reports.reportid',
                'reports.report_from',
                'reports.status as report_status',
                'reports.description',
                DB::raw("DATE_FORMAT(reports.created_at, '%M %d, %Y %h:%i %p') AS report_datetime"),
                DB::raw("CONCAT_WS(' ', driver.first_name, driver.middle_name, driver.last_name) as driver_name"),
                'driver.plate_number',
                'passenger.contact as passenger_contact',
            )
            ->orderBy('reports.status')
            ->orderBy('reports.created_at', 'DESC');

        if ($request->filter != "") {
            $filter = $request->filter;
            $query->where(function ($q) use ($filter) {
            $q->orWhere(DB::raw("CONCAT_WS(' ', driver.first_name, driver.middle_name, driver.last_name)"), 'LIKE', "%$filter%")
                ->orWhere(DB::raw("CONCAT_WS(' ', passenger.first_name, passenger.middle_name, passenger.last_name)"), 'LIKE', "%$filter%")
                ->orWhere('bookings.bookid', 'LIKE', "%$filter%")
                ->orWhere('bookings.location_from', 'LIKE', "%$filter%")
                ->orWhere('bookings.location_from', 'LIKE', "%$filter%")
                ->orWhere('reports.description', 'LIKE', "%$filter%")
                ->orWhere('reports.reportid', 'LIKE', "%$filter%")
                ->orWhere('reports.description', 'LIKE', "%$filter%")
                ->orWhere('driver.plate_number', 'LIKE', "%$filter%")
                ->orWhere('passenger.contact', 'LIKE', "%$filter%");
            });
        }

        if ($request->report_status != "") {
            $query->where('reports.status', $request->report_status);
        }

        if ($request->report_from != "") {
            $query->where('reports.status', $request->report_status);
        }
            
        $reports = $query->paginate(20);

        if ($reports->count() > 0) {
            return response()->json([
                'status' => 200,
                'message' => 'Reports retrieved!',
                'reports' => $reports
            ], 200);
        } else {
            return response()->json([
                'message' => 'No reports found!',
                'reports' => $reports
            ]);
        }

    }

    // retrieve specific report's information
    public function retrieve(Request $request) {
        $report = Report::leftJoin('bookings', 'reports.bookid', '=', 'bookings.bookid')
            ->leftJoin('users as driver', 'bookings.driverid', '=', 'driver.username')
            ->leftJoin('users as passenger', 'bookings.passengerid', '=', 'passenger.username')
            ->select(
                'bookings.*',
                'reports.reportid',
                'reports.report_from',
                'reports.description',
                'reports.status',
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
            ->where('reports.reportid', $request->id)
            ->first();
            
        if($report) {
            return response()->json([
                'status' => 200,
                'report' => $report,
                'message' => "Report data retrieved!"
            ], 200);
        }
        else {
            return response()->json([
                'report' => $report,
                'message' => "Report not found!"
            ]);
        }
    }


    // update specific admin's information
    public function updatereport(Request $request) {
        $authUser = User::select('first_name')->where('username', Auth::user()->username)->first();

        try {
            $update = Report::where('reportid', $request->id) ->update([ 'status' => 1, 'updated_by' => $authUser->first_name]);

            if($update) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Report tagged as resolved!'
                ], 200);
            }
            else {
                return response()->json([
                    'message' => 'Something went wrong!'
                ]);
            }
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ]);
        }
    }


    public function deletereport(Request $request) {
        $delete = Report::where('reportid', $request->id)->delete();

        if($delete) {
            return response()->json([
                'status' => 200,
                'message' => 'Report removed successfully!'
            ], 200);
        }
        return response()->json([
            'message' => 'Something went wrong!'
        ]);
    }

    public function reopenreport(Request $request) {
        $authUser = Auth::user();

        if($authUser->role !== "ADMIN" || $authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }

        $update = Report::where('reportid', $request->id)->update([ 'status' => 0]);
        if($update) {
            return response()->json([
                'status' => 200,
                'message' => 'Report is now Re-opened!'
            ], 200);
        }
        return response()->json([
            'message' => 'Something went wrong!'
        ]);
    }
    
}
