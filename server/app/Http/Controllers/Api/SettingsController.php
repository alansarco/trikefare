<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\App_Info;
use Exception;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    // Get all the list of system info
    public function index() {
        $settings = App_Info::select('*',
            DB::raw("TO_BASE64(taripa) as logo"),
            )
            ->get();

        return response()->json([
            'settings' => $settings,
        ]);
    }

    // update settings's information
    public function updatesettings(Request $request) {
        $authUser = Auth::user();
        
        if($authUser->role !== "ADMIN" || $authUser->access_level != 999) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }

        $validator = Validator::make($request->all(), [
            'app_id' => 'required',
            'base_fare' => 'required',
            'event_notif' => 'required',
            'email' => 'required',
            'contact' => 'required',
            'system_info' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }
        else {
            try {
                $updateData = [
                    'base_fare' => $request->base_fare,
                    'system_info' => $request->system_info,
                    'email' => $request->email,
                    'contact' => $request->contact,
                    'event_notif' => $request->event_notif,
                    'updated_by' => Auth::user()->username,
                ];
                
                // Perform the update with the conditional data array
                $update = App_Info::where('app_id', $request->app_id)->update($updateData);

                if($update) {
                    return response()->json([
                        'status' => 200,
                        'message' => 'System updated successfully!'
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

}
