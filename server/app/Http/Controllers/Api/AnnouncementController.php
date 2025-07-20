<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Admin;
use App\Models\App_Info;
use App\Models\Calendar;
use Carbon\Carbon;
use Exception;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Http;

class AnnouncementController extends Controller
{
    public function index(Request $request) {
        $events = Calendar::select('id', 'event_name', 'event_date','description', 'event_date_end', 'color', )
        ->get()
        ->map(function($event) {
            // Combine date and time to create a proper start and end timestamp
            $startDateTime = Carbon::parse($event->event_date);
            $endDateTime = Carbon::parse($event->event_date_end);
            $title = $event->event_name . ': ' . $event->description;
            
            return [
                'title' => $title,
                'start' => $startDateTime->toIso8601String(), // Format as ISO 8601 string
                'end' => $endDateTime->toIso8601String(),     // Format as ISO 8601 string
                'color' => $event->color,
            ];
        });

        $filter = $request->filter ?? '';
        $announcementlist = DB::select('CALL GET_ANNOUNCEMENTS(?)', [$filter]);

        // Convert the results into a collection
        $usersCollection = collect($announcementlist);

        // Set pagination variables
        $perPage = 20; // Number of items per page
        $currentPage = LengthAwarePaginator::resolveCurrentPage(); // Get the current page

        // Slice the collection to get the items for the current page
        $currentPageItems = $usersCollection->slice(($currentPage - 1) * $perPage, $perPage)->values();

        // Create a LengthAwarePaginator instance
        $paginatedAnnouncements = new LengthAwarePaginator($currentPageItems, $usersCollection->count(), $perPage, $currentPage, [
            'path' => $request->url(), // Set the base URL for pagination links
            'query' => $request->query(), // Preserve query parameters in pagination links
        ]);

        $calendars = [
            'announcementlist' => $paginatedAnnouncements,
            'events' => $events,
        ];

        // Return the response
        if ($paginatedAnnouncements->count() > 0) {
            return response()->json([
                'status' => 200,
                'message' => 'Announcements retrieved!',
                'calendars' => $calendars
            ], 200);
        } else {
            return response()->json([
                'message' => 'No announcements found!',
                'calendars' => $calendars
            ]);
        }
    }

    // retrieve specific event's information
    public function retrieve(Request $request) {
        $event = Calendar::where('id', $request->id)->first();
        
        if($event) {
            return response()->json([
                'status' => 200,
                'calendar' => $event,
                'message' => "Announcement data retrieved!"
            ], 200);
        }
        else {
            return response()->json([
                'calendar' => $event,
                'message' => "Announcement not found!"
            ]);
        }
    }

    // update specific admin's information
    public function updateannouncement(Request $request) {

        $validator = Validator::make($request->all(), [
            'event_name' => 'required',
            'description' => 'required',
            'color' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }
        else {
            try {
                $update = Calendar::where('id', $request->id)
                ->update([
                    'event_name' => strtoupper($request->event_name),
                    'description' => $request->description,
                    'details' => $request->details,
                    'event_date' => $request->event_date,
                    'event_date_end' => $request->event_date_end,
                    'color' => $request->color,
                    'updated_by' => Auth::user()->username,
                ]);

            if($update) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Announcement updated successfully!'
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
    }

    public function addannouncement(Request $request) {
        $authUser = User::select('first_name')->where('username', Auth::user()->username)->first();

        $validator = Validator::make($request->all(), [ 
            'event_name' => 'required',
            'description' => 'required',
            'color' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }

        $add = Calendar::create([
            'event_name' => strtoupper($request->event_name),
            'description' => $request->description,
            'details' => $request->details,
            'event_date' => $request->event_date,
            'event_date_end' => $request->event_date_end,
            'color' => $request->color,
            'created_by' => $authUser->first_name,
        ]);

        if($add) {
            return response()->json([
                'status' => 200,
                'message' => 'Announcement added successfully!'
            ], 200);
        }
        return response()->json([
            'message' => 'Something went wrong!'
        ]);
    }

    public function deleteannouncement(Request $request) {
        $authUser = Auth::user();

        if($authUser->role !== "ADMIN" || $authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }

        $delete = Calendar::where('id', $request->id)->delete();

        if($delete) {
            return response()->json([
                'status' => 200,
                'message' => 'Announcement removed successfully!'
            ], 200);
        }
        return response()->json([
            'message' => 'Something went wrong!'
        ]);
    }
    
}
