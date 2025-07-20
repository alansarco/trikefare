<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use App\Models\Calendar;
use App\Models\Report;
use App\Models\RequestDoc;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    //returns data of Ither Statistics
    public function OtherStatistics() 
    {
        $populationCount = [];

        $startOfMonth = Carbon::now()->startOfMonth();
        $today = Carbon::today();

        while ($startOfMonth <= $today) {
            $label = (int) $startOfMonth->format('d'); // Convert to int: 1, 2, 3, ...
            $date = $startOfMonth->toDateString();

            $count = Booking::whereDate('created_at', $date)->count();
            $populationCount[$label] = $count;

            $startOfMonth->addDay();
        }
        $populationCount = array_reverse($populationCount, true);

        
        $events = Calendar::select('id', 'event_name', 'event_date','description', 'event_date_end', 'color')
        ->get()
        ->map(function($event) {
            // Combine date and time to create a proper start and end timestamp
            $startDateTime = Carbon::parse($event->event_date . ' ' . $event->time);
            $endDateTime = Carbon::parse($event->event_date_end . ' ' . $event->time_end);
            $title = $event->event_name . ': ' . $event->description;
            
            return [
                'title' => $title,
                'start' => $startDateTime->toIso8601String(), // Format as ISO 8601 string
                'end' => $endDateTime->toIso8601String(),     // Format as ISO 8601 string
                'color' => $event->color,
            ];
        });

        $data1 = User::where('access_level', 999)->where('account_status', 1)->count();
        $data2 = User::where('access_level', 10)->where('account_status', 1)->count();
        $data3 = User::where('access_level', 5) ->where('account_status', 1) ->count();
        $male = User::where('gender', 'M')->where('account_status', 1)->count();
        $female = User::where('gender', 'F')->where('account_status', 1)->count();

        $otherStats = [
            'data1' => $data1,
            'data2' => $data2,
            'data3' => $data3,
            'male' => $male,
            'female' => $female,
            'populationCount' => $populationCount,
            'events' => $events,
        ];

        return response()->json([
            'otherStats' => $otherStats,
        ]);
    }

    //returns counts of polls
    public function PollsDistribution() 
    {
        $polls = Report::leftJoin('bookings', 'reports.bookid', '=', 'bookings.bookid')
            ->leftJoin('users as driver', 'bookings.driverid', '=', 'driver.username')
            ->leftJoin('users as passenger', 'bookings.passengerid', '=', 'passenger.username')
            ->select(
                'bookings.*',
                'reports.reportid',
                'reports.description',
                DB::raw("DATE_FORMAT(reports.created_at, '%M %d, %Y %h:%i %p') AS report_datetime"),
                DB::raw("CONCAT_WS(' ', driver.first_name, driver.middle_name, driver.last_name) as driver_name"),
                'driver.plate_number',
                'passenger.contact as passenger_contact',
            )
            ->where('reports.status', 0)
            ->orderBy('reports.created_at', 'DESC')
            ->get();

       
        if($polls) {
            return response()->json([
                'message' => 'Request retrieved!',
                'polls' => $polls,
            ]);
        }
        return response()->json([
            'message' => "No Active Request!"
        ]);
    }
}
