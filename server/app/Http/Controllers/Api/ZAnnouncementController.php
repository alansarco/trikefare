<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\App_Info;
use App\Http\Controllers\AESCipher;
use App\Models\Booking;
use App\Models\Calendar;
use App\Models\Newsfare;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ZAnnouncementController extends Controller
{

    public function getAnnouncement()
    {
        try {
            $announcementData = Calendar::select('event_name', 'description', 'details', 'event_date', 'event_date_end')->get();

            if ($announcementData) {
                return response()->json([
                    'status' => 200,
                    'announcementData' => $announcementData,
                    'message' => "Announcement retrieved!"
                ]);
            } else {
                return response()->json([
                    'status' => 500,
                    'announcementData' => [],
                    'message' => "Announcement not retrieved!"
                ]);
            }
        } catch (Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
