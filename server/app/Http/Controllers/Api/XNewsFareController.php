<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\App_Info;
use App\Http\Controllers\AESCipher;
use App\Models\Newsfare;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class XNewsFareController extends Controller {

    public function getNewsFare(Request $request) {
        try {
            $query = Newsfare::select(
                '*',
                DB::raw("DATE_FORMAT(created_at, '%M %d, %Y %h:%i %p') AS date_posted"),
                DB::raw("DATE_FORMAT(updated_at, '%M %d, %Y %h:%i %p') AS date_updated"),
            );

            if ($request->date != "") {
                if ($request->date == "Last 24h") {
                    $query->where('created_at', '>=', now()->subDay());
                }
                if ($request->date == "This Month") {
                    $query->whereMonth('created_at', now()->month)
                        ->whereYear('created_at', now()->year);
                }
                if ($request->date == "This Year") {
                    $query->whereYear('created_at', now()->year);
                }
            }

            if ($request->sort == "Oldest") {
                $query->orderBy('created_at', 'ASC');
            }
            else {
                $query->orderBy('created_at', 'DESC');
            }
        
            $newsData = $query->get();
            if($newsData) {
                return response()->json([
                    'status' => 200,
                    'newsData' => $newsData,
                    'message' => "News retrieved!"
                ]);
            }
            else {
                return response()->json([
                    'status' => 500,
                    'newsData' => $newsData,
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