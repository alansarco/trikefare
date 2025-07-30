<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\App_Info;
use App\Http\Controllers\AESCipher;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ZProfileController extends Controller {

    protected $aes;
    public function __construct() {
        $this->aes = new AESCipher;
    }

    public function getProfile() {
        try {
            $profile = User::select('username', 'first_name', 'last_name', 'contact', 
                'id_number', 'email', 'gender', 'address',
                DB::raw("CONCAT_WS(' ', first_name, middle_name, last_name) as fullname"),
                // DB::raw("TO_BASE64(id_picture) as id_picture"),
                // DB::raw("CONCAT('data:image/png;base64,', TO_BASE64(id_picture)) as id_picture")
                // DB::raw("CONCAT('data:image/png;base64,', REPLACE(REPLACE(TO_BASE64(id_picture), '\n', ''), '\r', '')) as id_picture")
                )

                ->where('username', Auth::user()->username)->first();


            if($profile) {
                return response()->json([
                    'status' => 200,
                    'profile' => $profile,
                    'message' => "User profile retrieved!"
                ]);
            }
            else {
                return response()->json([
                    'status' => 500,
                    'profile' => $profile,
                    'message' => "User profile not found!"
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

    public function updateProfile(Request $request) {
        try {
            $validator = Validator::make($request->all(), [
                'first_name' => 'required',
                'last_name' => 'required',
                'contact' => 'required',
                'id_number' => 'required',
                'gender' => 'required',
                'email' => 'required',
                'address' => 'required',
            ]);

            if($validator->fails()) {
                return response()->json([
                    'status' => 500,
                    'message' => $validator->messages()->all()
                ]);
            }
            $emailExist = User::where('username', '!=', Auth::user()->username)
                  ->where('email', $request->email)
                  ->first();
            
            if($emailExist) {
                return response()->json([
                    'status' => 500,
                    'message' => 'Email already taken!'
                ], 500);
            }
            
            $update = User::where('username', Auth::user()->username)
                ->update([
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'gender' => $request->gender,   
                    'email' => $request->email,   
                    'address' => $request->address,   
                    'contact' => $request->contact,   
                    'id_number' => $request->id_number,   
                ]);

            if($update) {
                $profile = User::select('username', 'first_name', 'last_name', 'contact', 
                    'id_number', 'email', 'gender', 'address',
                    DB::raw("CONCAT_WS(' ', first_name, middle_name, last_name) as fullname")
                )
                ->where('username', Auth::user()->username)->first();

                if($profile) {
                    return response()->json([
                        'status' => 200,
                        'profile' => $profile,
                        'message' => 'Profile updated successfully!'
                    ], 200);
                }
                return response()->json([
                    'status' => 500,
                        'profile' => $profile,
                    'message' => 'Something went Wrong!'
                ], 500);

            }
            else {
                return response()->json([
                    'status' => 500,
                    'message' => 'Something went Wrong!'
                ], 500);
            }

        }
        catch (Exception $e) {
            return response()->json([
                'status' => 404,
                'message' => $e->getMessage()
            ], 404);
        }
    }
}
