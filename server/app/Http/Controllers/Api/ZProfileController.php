<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\App_Info;
use App\Http\Controllers\AESCipher;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ZProfileController extends Controller {

    protected $aes;
    public function __construct() {
        $this->aes = new AESCipher;
    }

    public function getProfile() {
        try {
            $profile = User::select('username', 'first_name', 'last_name', 'contact', 
                'id_number', 'email', 'gender', 'address',
                // DB::raw("TO_BASE64(id_picture) as id_picture"),
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
                    'status' => 404,
                    'profile' => $profile,
                    'message' => "User profile not found!"
                ]);
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
